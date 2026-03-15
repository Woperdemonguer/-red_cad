/**
 * Tests for verify_methodology.js — the automated methodology enforcement script.
 *
 * These tests ensure the verifier itself works correctly:
 * - Catches real violations when they exist
 * - Produces zero false positives on a clean codebase
 * - Generates correct exit codes and output format
 *
 * Journey: Enforcement System (Golden Rule #7 — ENFORCE)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';

const FRONTEND_ROOT = resolve(import.meta.dirname, '../..');
const VERIFIER_PATH = resolve(FRONTEND_ROOT, 'scripts/verify_methodology.js');

/**
 * Helper: Run the verifier and capture stdout + exit code.
 */
function runVerifier() {
    const result = spawnSync('node', [VERIFIER_PATH], {
        cwd: FRONTEND_ROOT,
        encoding: 'utf-8',
        timeout: 15000,
    });
    const stdout = (result.stdout || '') + (result.stderr || '');
    return { stdout, exitCode: result.status || 0 };
}

// ─── Clean Codebase Tests ────────────────────────────────────────────────────

describe('verify_methodology on clean codebase', () => {
    it('passes all 10 checks with zero false positives', () => {
        const { stdout, exitCode } = runVerifier();

        expect(exitCode).toBe(0);
        expect(stdout).toContain('10 passed, 0 failed');
        expect(stdout).toContain('All methodology checks passed');
    });

    it('reports correct category breakdown', () => {
        const { stdout } = runVerifier();

        expect(stdout).toContain('Category A: 6/6 ✅');
        expect(stdout).toContain('Category B: 4/4 ✅');
    });

    it('scans the correct number of files', () => {
        const { stdout } = runVerifier();

        // A1 counts source files, A3 counts JSX files
        expect(stdout).toMatch(/scanned \d+ files/);
        expect(stdout).toMatch(/scanned \d+ JSX files/);
        expect(stdout).toMatch(/scanned \d+ SQL files/);
    });
});

// ─── Violation Detection Tests ───────────────────────────────────────────────

describe('verify_methodology violation detection', () => {
    const TEMP_VIOLATION_FILE = resolve(FRONTEND_ROOT, 'components/_test_violation_.jsx');

    afterEach(() => {
        // Clean up temp violation file
        if (existsSync(TEMP_VIOLATION_FILE)) {
            unlinkSync(TEMP_VIOLATION_FILE);
        }
    });

    it('A1: catches direct supabase.from() in a component', () => {
        // Plant a violation
        writeFileSync(TEMP_VIOLATION_FILE, `
            import { supabase } from "@/utils/supabase";
            export function BadComponent() {
                const data = supabase.from("cad_profiles").select("*");
                return <div>{data}</div>;
            }
        `);

        const { stdout, exitCode } = runVerifier();

        expect(exitCode).toBe(1);
        expect(stdout).toContain('❌ A1');
        expect(stdout).toContain('_test_violation_.jsx');
    });

    it('A4: catches TODO comments in source code', () => {
        writeFileSync(TEMP_VIOLATION_FILE, `
            export function IncompleteComponent() {
                // TODO: finish this component
                return <div>placeholder</div>;
            }
        `);

        const { stdout, exitCode } = runVerifier();

        expect(exitCode).toBe(1);
        expect(stdout).toContain('❌ A4');
        expect(stdout).toContain('_test_violation_.jsx');
    });

    it('A3: catches window.confirm() in non-comment lines', () => {
        writeFileSync(TEMP_VIOLATION_FILE, `
            export function BadModal() {
                const ok = window.confirm("Are you sure?");
                return <div>{ok}</div>;
            }
        `);

        const { stdout, exitCode } = runVerifier();

        expect(exitCode).toBe(1);
        expect(stdout).toContain('❌ A3');
    });
});

// ─── Whitelist Tests ─────────────────────────────────────────────────────────

describe('verify_methodology whitelists', () => {
    it('A1: does NOT flag supabaseService.js (whitelisted)', () => {
        const { stdout } = runVerifier();
        expect(stdout).not.toContain('supabaseService.js');
    });

    it('A1: does NOT flag useAuth.js (whitelisted)', () => {
        const { stdout } = runVerifier();
        expect(stdout).not.toContain('useAuth.js');
    });

    it('A2: does NOT flag RPC function files (SECURITY DEFINER)', () => {
        const { stdout } = runVerifier();
        // rpc_get_user_id.sql should be excluded
        expect(stdout).not.toContain('rpc_get_user_id.sql');
    });
});

// ─── Output Format Tests ─────────────────────────────────────────────────────

describe('verify_methodology output format', () => {
    it('matches existing script format (consistent with smoke_test/db_health_check)', () => {
        const { stdout } = runVerifier();

        // Check for standardized elements
        expect(stdout).toContain('═'.repeat(10)); // Separator bars
        expect(stdout).toContain('✅');            // Pass markers
        expect(stdout).toContain('📋');            // Category headers
        expect(stdout).toContain('📊 Results:');   // Summary line
    });

    it('shows check IDs in format A1-A6, B1-B4', () => {
        const { stdout } = runVerifier();

        expect(stdout).toContain('A1:');
        expect(stdout).toContain('A2:');
        expect(stdout).toContain('A3:');
        expect(stdout).toContain('A4:');
        expect(stdout).toContain('A5:');
        expect(stdout).toContain('A6:');
        expect(stdout).toContain('B1:');
        expect(stdout).toContain('B2:');
        expect(stdout).toContain('B3:');
        expect(stdout).toContain('B4:');
    });
});
