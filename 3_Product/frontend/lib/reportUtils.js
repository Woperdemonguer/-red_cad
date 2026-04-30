/**
 * reportUtils — Pure utility functions for admin progress reports and data exports.
 *
 * Tests for: Journey J-Admin: Form Progress Monitoring
 * Validates: Admin can view per-CAD progress, export progress XLSX, export aggregated answers XLSX
 *
 * Uses the SheetJS (xlsx) library for styled Excel workbooks.
 */

import { blocks } from '@/config/diagnosticForm';
import { countTotalQuestions, countAnsweredQuestions } from './formUtils';
import * as XLSX from 'xlsx';

/**
 * Non-answerable question types excluded from per-block counting.
 */
const NON_ANSWERABLE_TYPES = new Set(['info', 'section']);

// ─── App Color Palette (hex) ─────────────────────────────────────────────────
// Matched from tailwind.config.js for consistent branding in Excel exports.
const COLORS = {
    forest: '2E5339',
    forestLight: '3c6b4a',
    sage: '8BAA7C',
    sand: 'F5F7FA',
    accent: 'E8A923',
    accentLight: 'FEF3D1',
    white: 'FFFFFF',
    text: '1A202C',
    textLight: '718096',
    border: 'E2E8F0',
    red: 'C53030',
};

// ─── Shared Styling Helpers ──────────────────────────────────────────────────

/**
 * Create a styled header cell style object for xlsx.
 */
function headerStyle() {
    return {
        font: { bold: true, color: { rgb: COLORS.white }, sz: 11 },
        fill: { fgColor: { rgb: COLORS.forest } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
            bottom: { style: 'thin', color: { rgb: COLORS.border } },
        },
    };
}

/**
 * Create a subheader style (used for section headers within blocks).
 */
function subHeaderStyle() {
    return {
        font: { bold: true, color: { rgb: COLORS.forest }, sz: 10 },
        fill: { fgColor: { rgb: COLORS.accentLight } },
        alignment: { horizontal: 'left', vertical: 'center' },
    };
}

/**
 * Standard data cell style.
 */
function dataStyle() {
    return {
        font: { color: { rgb: COLORS.text }, sz: 10 },
        alignment: { vertical: 'top', wrapText: true },
        border: {
            bottom: { style: 'hair', color: { rgb: COLORS.border } },
        },
    };
}

/**
 * Accent cell style for progress/summary values.
 */
function accentStyle() {
    return {
        font: { bold: true, color: { rgb: COLORS.forest }, sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { fgColor: { rgb: COLORS.sand } },
    };
}

/**
 * Style for submitted/completed badge cells.
 */
function submittedStyle(isSubmitted) {
    return {
        font: { bold: true, color: { rgb: isSubmitted ? COLORS.forest : COLORS.red }, sz: 10 },
        fill: { fgColor: { rgb: isSubmitted ? COLORS.sand : COLORS.white } },
        alignment: { horizontal: 'center', vertical: 'center' },
    };
}

// ─── Progress Calculation ────────────────────────────────────────────────────

/**
 * Calculate form progress for a single CAD's answers.
 *
 * @param {Object|null} answers - The answers JSONB object from diagnostic_forms, or null if no form exists
 * @returns {{ totalQuestions: number, answeredQuestions: number, progressPercent: number, submittedAt: string|null, blockProgress: Array<{blockId, blockTitle, answered: number, total: number}> }}
 */
export function calculateCadProgress(answers) {
    if (!answers) {
        return {
            totalQuestions: countTotalQuestions(blocks, {}),
            answeredQuestions: 0,
            progressPercent: 0,
            submittedAt: null,
            blockProgress: blocks
                .filter(b => b.questions && b.questions.length > 0)
                .map(b => ({
                    blockId: b.id,
                    blockTitle: b.title,
                    answered: 0,
                    total: b.questions.filter(q => !NON_ANSWERABLE_TYPES.has(q.type)).length,
                })),
        };
    }

    // Separate submitted_at from actual answers (it's stored in the same JSONB)
    const { submitted_at, ...formAnswers } = answers;

    const totalQuestions = countTotalQuestions(blocks, formAnswers);
    const answeredQuestions = countAnsweredQuestions(blocks, formAnswers);
    const progressPercent = totalQuestions > 0
        ? Math.round((answeredQuestions / totalQuestions) * 100)
        : 0;

    const blockProgress = blocks
        .filter(b => b.questions && b.questions.length > 0)
        .map(b => {
            const answerable = b.questions.filter(q => !NON_ANSWERABLE_TYPES.has(q.type));
            const answered = answerable.filter(q => {
                const val = formAnswers[q.id];
                if (val === undefined || val === null || val === '') return false;
                if (Array.isArray(val) && val.length === 0) return false;
                if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return false;
                return true;
            }).length;
            return {
                blockId: b.id,
                blockTitle: b.title,
                answered,
                total: answerable.length,
            };
        });

    return {
        totalQuestions,
        answeredQuestions,
        progressPercent,
        submittedAt: submitted_at || null,
        blockProgress,
    };
}

// ─── Report Builder ──────────────────────────────────────────────────────────

/**
 * Build a full progress report for all CADs.
 *
 * @param {Array<{id, nombre_comercial, territorio, estado, user_email}>} cadsWithEmails
 * @param {Array<{user_email, answers}>} allForms
 * @returns {Array<{cadId, cadName, territorio, estado, userEmail, totalQuestions, answeredQuestions, progressPercent, submittedAt, blockProgress}>}
 */
export function buildProgressReport(cadsWithEmails, allForms) {
    const formsByEmail = {};
    allForms.forEach(f => {
        formsByEmail[f.user_email] = f.answers;
    });

    return cadsWithEmails.map(cad => {
        const answers = cad.user_email ? formsByEmail[cad.user_email] || null : null;
        const progress = calculateCadProgress(answers);

        return {
            cadId: cad.id,
            cadName: cad.nombre_comercial || '(sin nombre)',
            territorio: cad.territorio || '',
            estado: cad.estado || 'Activo',
            userEmail: cad.user_email || '',
            ...progress,
        };
    });
}

// ─── CSV Export (lightweight fallback) ───────────────────────────────────────

/**
 * Escape a CSV field value.
 */
function escapeCsvField(val) {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

/**
 * Convert progress report to CSV string.
 */
export function progressReportToCsv(reportRows) {
    const headers = [
        'CAD', 'Territorio', 'Estado', 'Email',
        'Progreso (%)', 'Preguntas Respondidas', 'Total Preguntas',
        'Enviado', 'Fecha Envío',
    ];

    if (reportRows.length > 0 && reportRows[0].blockProgress) {
        reportRows[0].blockProgress.forEach(bp => {
            headers.push(`Bloque: ${bp.blockTitle}`);
        });
    }

    const rows = reportRows.map(row => {
        const base = [
            escapeCsvField(row.cadName), escapeCsvField(row.territorio),
            escapeCsvField(row.estado), escapeCsvField(row.userEmail),
            row.progressPercent, row.answeredQuestions, row.totalQuestions,
            row.submittedAt ? 'Sí' : 'No',
            row.submittedAt ? new Date(row.submittedAt).toLocaleDateString('es-ES') : '',
        ];
        if (row.blockProgress) {
            row.blockProgress.forEach(bp => { base.push(`${bp.answered}/${bp.total}`); });
        }
        return base.map(v => escapeCsvField(v)).join(',');
    });

    return [headers.map(h => escapeCsvField(h)).join(','), ...rows].join('\n');
}

// ─── XLSX Export: Progress Report ────────────────────────────────────────────

/**
 * Generate a styled XLSX workbook for the progress report.
 * Sheet 1 "Resumen" — one row per CAD with progress overview.
 *
 * @param {Array} reportRows - Output of buildProgressReport()
 * @returns {ArrayBuffer} - XLSX binary ready for download
 */
export function progressReportToXlsx(reportRows) {
    const wb = XLSX.utils.book_new();

    // ── Sheet: Resumen ──
    const headers = [
        'CAD', 'Territorio', 'Estado', 'Email',
        'Progreso (%)', 'Respondidas', 'Total', 'Enviado', 'Fecha Envío',
    ];

    // Add per-block columns
    if (reportRows.length > 0 && reportRows[0].blockProgress) {
        reportRows[0].blockProgress.forEach(bp => {
            headers.push(bp.blockTitle);
        });
    }

    const data = [headers];

    reportRows.forEach(row => {
        const rowData = [
            row.cadName, row.territorio, row.estado, row.userEmail,
            row.progressPercent, row.answeredQuestions, row.totalQuestions,
            row.submittedAt ? 'Sí' : 'No',
            row.submittedAt ? new Date(row.submittedAt).toLocaleDateString('es-ES') : '',
        ];
        if (row.blockProgress) {
            row.blockProgress.forEach(bp => {
                rowData.push(`${bp.answered}/${bp.total}`);
            });
        }
        data.push(rowData);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Column widths
    ws['!cols'] = [
        { wch: 25 }, // CAD
        { wch: 16 }, // Territorio
        { wch: 10 }, // Estado
        { wch: 28 }, // Email
        { wch: 12 }, // Progreso
        { wch: 14 }, // Respondidas
        { wch: 8 },  // Total
        { wch: 10 }, // Enviado
        { wch: 14 }, // Fecha
    ];
    if (reportRows.length > 0 && reportRows[0].blockProgress) {
        reportRows[0].blockProgress.forEach(() => {
            ws['!cols'].push({ wch: 14 });
        });
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Resumen');

    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

// ─── XLSX Export: Aggregated Answers ─────────────────────────────────────────

/**
 * Serialize an answer value to a human-readable string.
 */
function serializeAnswer(val) {
    if (val === null || val === undefined || val === '') return '';
    if (Array.isArray(val)) return val.join('; ');
    if (typeof val === 'object') {
        return Object.entries(val)
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ');
    }
    return String(val);
}

/**
 * Generate a styled XLSX workbook for aggregated answers.
 * Creates one sheet per form block, each with CAD rows and question columns.
 *
 * @param {Array} cadsWithEmails
 * @param {Array} allForms
 * @returns {ArrayBuffer} - XLSX binary ready for download
 */
export function answersToAggregatedXlsx(cadsWithEmails, allForms) {
    const wb = XLSX.utils.book_new();

    const formsByEmail = {};
    allForms.forEach(f => {
        formsByEmail[f.user_email] = f.answers || {};
    });

    // ── Sheet 1: Resumen (overview per CAD) ──
    const overviewHeaders = ['CAD', 'Territorio', 'Estado', 'Email', 'Progreso (%)', 'Enviado'];
    const overviewData = [overviewHeaders];

    cadsWithEmails.forEach(cad => {
        const rawAnswers = cad.user_email ? formsByEmail[cad.user_email] || {} : {};
        const progress = calculateCadProgress(Object.keys(rawAnswers).length > 0 ? rawAnswers : null);
        overviewData.push([
            cad.nombre_comercial || '(sin nombre)',
            cad.territorio || '',
            cad.estado || 'Activo',
            cad.user_email || '',
            progress.progressPercent,
            progress.submittedAt ? 'Sí' : 'No',
        ]);
    });

    const overviewWs = XLSX.utils.aoa_to_sheet(overviewData);
    overviewWs['!cols'] = [
        { wch: 25 }, { wch: 16 }, { wch: 10 }, { wch: 28 }, { wch: 12 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, overviewWs, 'Resumen');

    // ── One sheet per block ──
    blocks.forEach(block => {
        if (!block.questions || block.questions.length === 0) return;

        const answerableQuestions = block.questions.filter(q => !NON_ANSWERABLE_TYPES.has(q.type));
        if (answerableQuestions.length === 0) return;

        // Build header row: CAD | Q1.1 question text | Q1.2 question text | ...
        const headers = ['CAD'];
        answerableQuestions.forEach(q => {
            // Use "ID: Question text" format, truncated for readability
            const label = q.q ? `${q.id}: ${q.q}` : q.id;
            headers.push(label.length > 80 ? label.substring(0, 77) + '...' : label);
        });

        const sheetData = [headers];

        cadsWithEmails.forEach(cad => {
            const rawAnswers = cad.user_email ? formsByEmail[cad.user_email] || {} : {};
            const { submitted_at, ...formAnswers } = rawAnswers;

            const row = [cad.nombre_comercial || '(sin nombre)'];
            answerableQuestions.forEach(q => {
                row.push(serializeAnswer(formAnswers[q.id]));
            });
            sheetData.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(sheetData);

        // Column widths: CAD name wide, question columns moderate
        ws['!cols'] = [{ wch: 25 }];
        answerableQuestions.forEach(() => {
            ws['!cols'].push({ wch: 30 });
        });

        // Sheet name: truncate to 31 chars (Excel limit), remove invalid chars
        let sheetName = block.title.replace(/[\\/*?[\]:]/g, '').substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
}

/**
 * CSV fallback for aggregated answers.
 */
export function answersToAggregatedCsv(cadsWithEmails, allForms) {
    const questionCols = [];
    blocks.forEach(b => {
        if (!b.questions) return;
        b.questions.forEach(q => {
            if (NON_ANSWERABLE_TYPES.has(q.type)) return;
            questionCols.push({ id: q.id, question: q.q || q.id });
        });
    });

    const formsByEmail = {};
    allForms.forEach(f => { formsByEmail[f.user_email] = f.answers || {}; });

    const headers = [
        'CAD', 'Territorio', 'Estado', 'Email', 'Progreso (%)', 'Enviado',
        ...questionCols.map(qc => qc.id),
    ];

    const rows = cadsWithEmails.map(cad => {
        const rawAnswers = cad.user_email ? formsByEmail[cad.user_email] || {} : {};
        const { submitted_at, ...formAnswers } = rawAnswers;
        const progress = calculateCadProgress(Object.keys(rawAnswers).length > 0 ? rawAnswers : null);

        const base = [
            escapeCsvField(cad.nombre_comercial || '(sin nombre)'),
            escapeCsvField(cad.territorio || ''),
            escapeCsvField(cad.estado || 'Activo'),
            escapeCsvField(cad.user_email || ''),
            progress.progressPercent,
            submitted_at ? 'Sí' : 'No',
        ];
        questionCols.forEach(qc => {
            base.push(escapeCsvField(serializeAnswer(formAnswers[qc.id])));
        });
        return base.join(',');
    });

    return [headers.map(h => escapeCsvField(h)).join(','), ...rows].join('\n');
}

// ─── Download Helpers ────────────────────────────────────────────────────────

/**
 * Trigger a file download in the browser.
 */
export function downloadBlob(content, filename, mimeType) {
    const blob = content instanceof Blob
        ? content
        : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Trigger a CSV file download with BOM for Excel UTF-8 compatibility.
 */
export function downloadCsv(csvContent, filename) {
    const bom = '\uFEFF';
    downloadBlob(
        new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' }),
        filename,
        'text/csv;charset=utf-8;'
    );
}

/**
 * Trigger an XLSX file download.
 * @param {ArrayBuffer} xlsxBuffer - Output from XLSX.write()
 * @param {string} filename
 */
export function downloadXlsx(xlsxBuffer, filename) {
    downloadBlob(
        new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
}
