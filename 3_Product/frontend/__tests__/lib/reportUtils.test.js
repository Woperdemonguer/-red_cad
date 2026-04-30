/**
 * Tests for reportUtils.js — Admin progress reports and data exports.
 *
 * Tests for: Journey J-Admin: Form Progress Monitoring
 * Validates: calculateCadProgress, buildProgressReport, progressReportToCsv,
 *            answersToAggregatedCsv, progressReportToXlsx, answersToAggregatedXlsx
 */
import { describe, it, expect } from 'vitest';
import {
    calculateCadProgress,
    buildProgressReport,
    progressReportToCsv,
    answersToAggregatedCsv,
    progressReportToXlsx,
    answersToAggregatedXlsx,
} from '@/lib/reportUtils';

// ─── Test Data ───────────────────────────────────────────────────────────────

const mockCadsWithEmails = [
    { id: 'cad-1', nombre_comercial: 'Ekoalde', territorio: 'Navarra', estado: 'Activo', user_email: 'ekoalde@test.com' },
    { id: 'cad-2', nombre_comercial: 'La Troca', territorio: 'Barcelona', estado: 'Activo', user_email: 'latroca@test.com' },
    { id: 'cad-3', nombre_comercial: 'Sin Usuario', territorio: 'Madrid', estado: 'Inactivo', user_email: null },
];

const mockAllForms = [
    {
        user_email: 'ekoalde@test.com',
        answers: {
            '1.1': 'Opción A',
            '1.2': 'Equipo técnico',
            '1.3': 'Sí',
            submitted_at: '2026-03-15T10:00:00Z',
        },
    },
    {
        user_email: 'latroca@test.com',
        answers: {
            '1.1': 'Opción B',
        },
    },
];

// ─── calculateCadProgress ────────────────────────────────────────────────────

describe('calculateCadProgress', () => {
    it('returns zero progress for null answers', () => {
        const result = calculateCadProgress(null);

        expect(result.answeredQuestions).toBe(0);
        expect(result.progressPercent).toBe(0);
        expect(result.submittedAt).toBeNull();
        expect(result.totalQuestions).toBeGreaterThan(0);
        expect(result.blockProgress).toBeInstanceOf(Array);
        expect(result.blockProgress.length).toBeGreaterThan(0);
    });

    it('calculates progress for partially answered form', () => {
        const answers = { '1.1': 'Opción A', '2.1': 'Menos de 50.000 €' };
        const result = calculateCadProgress(answers);

        expect(result.answeredQuestions).toBe(2);
        expect(result.progressPercent).toBeGreaterThan(0);
        expect(result.progressPercent).toBeLessThan(100);
        expect(result.submittedAt).toBeNull();
    });

    it('extracts submitted_at from answers', () => {
        const answers = {
            '1.1': 'Opción A',
            submitted_at: '2026-03-15T10:00:00Z',
        };
        const result = calculateCadProgress(answers);

        expect(result.submittedAt).toBe('2026-03-15T10:00:00Z');
    });

    it('returns blockProgress with per-block breakdown', () => {
        const answers = { '1.1': 'Opción A' };
        const result = calculateCadProgress(answers);

        expect(result.blockProgress).toBeInstanceOf(Array);
        result.blockProgress.forEach(bp => {
            expect(bp).toHaveProperty('blockId');
            expect(bp).toHaveProperty('blockTitle');
            expect(bp).toHaveProperty('answered');
            expect(bp).toHaveProperty('total');
            expect(typeof bp.answered).toBe('number');
            expect(typeof bp.total).toBe('number');
        });
    });

    it('block progress zero for empty blocks', () => {
        const result = calculateCadProgress(null);
        
        result.blockProgress.forEach(bp => {
            expect(bp.answered).toBe(0);
        });
    });
});

// ─── buildProgressReport ─────────────────────────────────────────────────────

describe('buildProgressReport', () => {
    it('returns one row per CAD', () => {
        const report = buildProgressReport(mockCadsWithEmails, mockAllForms);
        expect(report).toHaveLength(3);
    });

    it('matches CAD data to form answers by email', () => {
        const report = buildProgressReport(mockCadsWithEmails, mockAllForms);

        const ekoalde = report.find(r => r.cadId === 'cad-1');
        expect(ekoalde.cadName).toBe('Ekoalde');
        expect(ekoalde.answeredQuestions).toBeGreaterThan(0);
        expect(ekoalde.submittedAt).toBe('2026-03-15T10:00:00Z');
    });

    it('shows zero progress for CADs without linked email', () => {
        const report = buildProgressReport(mockCadsWithEmails, mockAllForms);

        const sinUsuario = report.find(r => r.cadId === 'cad-3');
        expect(sinUsuario.userEmail).toBe('');
        expect(sinUsuario.answeredQuestions).toBe(0);
        expect(sinUsuario.progressPercent).toBe(0);
    });

    it('handles CAD with email but no form submission', () => {
        const cadsExtra = [
            ...mockCadsWithEmails,
            { id: 'cad-4', nombre_comercial: 'Nueva', territorio: '', estado: 'Activo', user_email: 'nueva@test.com' },
        ];
        const report = buildProgressReport(cadsExtra, mockAllForms);

        const nueva = report.find(r => r.cadId === 'cad-4');
        expect(nueva.answeredQuestions).toBe(0);
        expect(nueva.progressPercent).toBe(0);
        expect(nueva.submittedAt).toBeNull();
    });

    it('returns empty array for empty input', () => {
        const report = buildProgressReport([], []);
        expect(report).toEqual([]);
    });
});

// ─── progressReportToCsv ─────────────────────────────────────────────────────

describe('progressReportToCsv', () => {
    it('generates valid CSV with headers and data rows', () => {
        const report = buildProgressReport(mockCadsWithEmails, mockAllForms);
        const csv = progressReportToCsv(report);

        const lines = csv.split('\n');
        expect(lines.length).toBe(4); // 1 header + 3 data rows

        const header = lines[0];
        expect(header).toContain('CAD');
        expect(header).toContain('Territorio');
        expect(header).toContain('Progreso (%)');
        expect(header).toContain('Enviado');
    });

    it('escapes fields with commas and quotes', () => {
        const report = [{
            cadName: 'CAD "Especial", S.L.',
            territorio: 'País Vasco',
            estado: 'Activo',
            userEmail: 'test@cad.org',
            progressPercent: 50,
            answeredQuestions: 10,
            totalQuestions: 20,
            submittedAt: null,
            blockProgress: [],
        }];
        const csv = progressReportToCsv(report);
        expect(csv).toContain('"CAD ""Especial"", S.L."');
    });

    it('returns only headers for empty report', () => {
        const csv = progressReportToCsv([]);
        const lines = csv.split('\n');
        expect(lines.length).toBe(1);
    });
});

// ─── answersToAggregatedCsv ──────────────────────────────────────────────────

describe('answersToAggregatedCsv', () => {
    it('generates CSV with question ID columns', () => {
        const csv = answersToAggregatedCsv(mockCadsWithEmails, mockAllForms);
        const lines = csv.split('\n');

        expect(lines.length).toBe(4); // 1 header + 3 data rows

        const header = lines[0];
        expect(header).toContain('CAD');
        expect(header).toContain('1.1');
        expect(header).toContain('2.1');
    });

    it('includes answer values in correct columns', () => {
        const csv = answersToAggregatedCsv(mockCadsWithEmails, mockAllForms);
        const lines = csv.split('\n');

        const ekoaldeLine = lines[1];
        expect(ekoaldeLine).toContain('Ekoalde');
        expect(ekoaldeLine).toContain('Opción A');
    });

    it('handles empty forms gracefully', () => {
        const csv = answersToAggregatedCsv(mockCadsWithEmails, []);
        const lines = csv.split('\n');
        expect(lines.length).toBe(4);
    });
});

// ─── XLSX Exports ────────────────────────────────────────────────────────────

describe('progressReportToXlsx', () => {
    it('returns an ArrayBuffer', () => {
        const report = buildProgressReport(mockCadsWithEmails, mockAllForms);
        const result = progressReportToXlsx(report);

        expect(result).toBeInstanceOf(ArrayBuffer);
        expect(result.byteLength).toBeGreaterThan(0);
    });

    it('generates valid XLSX binary for empty report', () => {
        const result = progressReportToXlsx([]);

        expect(result).toBeInstanceOf(ArrayBuffer);
        expect(result.byteLength).toBeGreaterThan(0);
    });
});

describe('answersToAggregatedXlsx', () => {
    it('returns an ArrayBuffer', () => {
        const result = answersToAggregatedXlsx(mockCadsWithEmails, mockAllForms);

        expect(result).toBeInstanceOf(ArrayBuffer);
        expect(result.byteLength).toBeGreaterThan(0);
    });

    it('handles empty data gracefully', () => {
        const result = answersToAggregatedXlsx([], []);

        expect(result).toBeInstanceOf(ArrayBuffer);
        expect(result.byteLength).toBeGreaterThan(0);
    });

    it('produces larger output with more data (sanity check)', () => {
        const emptyResult = answersToAggregatedXlsx([], []);
        const fullResult = answersToAggregatedXlsx(mockCadsWithEmails, mockAllForms);

        // Full report should be larger than empty
        expect(fullResult.byteLength).toBeGreaterThan(emptyResult.byteLength);
    });
});
