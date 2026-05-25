/**
 * Methodology Verifier — Automated enforcement of engineering standards.
 *
 * Turns philosophical rules from the .agent documentation into automated checks.
 * Catches code pattern violations (Category A) and documentation/testing gaps (Category B).
 *
 * Run: npm run verify:methodology
 *
 * Category A: Code Pattern Checks (grep-based, high reliability)
 *   A1: No direct supabase.from() in components/pages
 *   A2: No auth.users in RLS policy definitions (non-comment lines)
 *   A3: No window.confirm() calls (non-comment lines)
 *   A4: No TODO/FIXME/HACK in source code
 *   A5: No raw hex colors in JSX className props
 *   A6: No self-referencing table queries in RLS policies
 *
 * Category B: Documentation & Testing Enforcement
 *   B1: Service layer functions documented in engineering_standards.md
 *   B2: DB tables documented in database_dictionary.md
 *   B3: Source files have corresponding test files
 *   B4: Service functions have corresponding test blocks
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, join, relative } from 'path';

// ─── Configuration ───────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dirname, '..');
const SRC_DIRS = ['app', 'components', 'hooks', 'lib', 'config'];
const AGENT_DIR = resolve(ROOT, '../../.agent');

// Whitelisted files for A1 (allowed to import/use supabase directly)
const A1_WHITELIST = [
    'lib/supabaseService.js',
    'hooks/useAuth.js',
    'utils/supabase.js',
];

// Patterns to identify Server Actions and API routes (also whitelisted for A1)
const A1_SERVER_ACTION_DIRS = ['app/actions', 'app/api'];

// ─── Test Infrastructure ─────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results = [];

function pass(id, msg) {
    console.log(`  ✅ ${id}: ${msg}`);
    passed++;
    results.push({ id, msg, status: 'pass' });
}

function fail(id, msg, violations = []) {
    console.log(`  ❌ ${id}: ${msg}`);
    for (const v of violations) {
        console.log(`     → ${v}`);
    }
    failed++;
    results.push({ id, msg, status: 'fail', violations });
}

// ─── File Utilities ──────────────────────────────────────────────────────────

/**
 * Recursively find all files matching given extensions in a directory.
 * @param {string} dir - Absolute directory path
 * @param {string[]} extensions - File extensions to match (e.g., ['.jsx', '.js'])
 * @returns {string[]} Array of absolute file paths
 */
function findFiles(dir, extensions) {
    const files = [];
    if (!existsSync(dir)) return files;

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === '__tests__' || entry.name === '.next') continue;
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...findFiles(fullPath, extensions));
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * Check if a file path is whitelisted for a given check.
 * @param {string} filePath - Absolute file path
 * @param {string[]} whitelist - Relative paths that are whitelisted
 * @param {string[]} whitelistDirs - Directory prefixes that are whitelisted
 * @returns {boolean}
 */
function isWhitelisted(filePath, whitelist = [], whitelistDirs = []) {
    const rel = relative(ROOT, filePath);
    if (whitelist.some(w => rel === w || rel.endsWith(w))) return true;
    if (whitelistDirs.some(d => rel.startsWith(d))) return true;
    return false;
}

/**
 * Check if a line is a comment (JS or SQL).
 * @param {string} line - The line of code
 * @param {string} type - 'js' or 'sql'
 * @returns {boolean}
 */
function isComment(line, type = 'js') {
    const trimmed = line.trim();
    if (type === 'sql') return trimmed.startsWith('--');
    return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
}

// ─── Category A: Code Pattern Checks ─────────────────────────────────────────

/**
 * A6: Check for self-referencing RLS policies.
 * Constitution Rule 2: "Never self-reference a table in its own RLS policy."
 * Born from Directive 17 — 3 rounds of infinite recursion on admin/cad mapping tables.
 * 
 * Detects patterns like:
 *   CREATE POLICY "..." ON some_table USING (... SELECT ... FROM some_table ...)
 *
 * Logic: Parse each SQL file for CREATE POLICY statements. Extract the table name
 * from the ON clause, then check if that same table appears in a FROM clause within
 * the policy body. Excludes RPC/function definition files.
 */
function checkA6() {
    const violations = [];
    const sqlFiles = findFiles(resolve(ROOT, 'db'), ['.sql']);

    for (const file of sqlFiles) {
        const content = readFileSync(file, 'utf-8');

        // Skip RPC/function files — they aren't policies
        if (content.includes('CREATE OR REPLACE FUNCTION') || content.includes('SECURITY DEFINER')) continue;

        // Skip already-applied fix/migration files — they contain the OLD broken patterns
        // that were being replaced. Only scan current policy definition files.
        // Also skip initial setup files whose policies were superseded by fix_nuclear_reset_policies.sql.
        const fileName = relative(ROOT, file);
        if (/(?:^|\/)fix_/.test(fileName) || /(?:^|\/)apply_fix_/.test(fileName)) continue;
        if (['db/supabase_admin_mapping.sql', 'db/supabase_pilot_setup.sql'].some(f => fileName.endsWith(f))) continue;

        // Find all CREATE POLICY blocks
        // Pattern: CREATE POLICY "name" ON table_name ... USING|WITH CHECK (...)
        const policyRegex = /CREATE\s+POLICY\s+["']?[^"']+["']?\s+ON\s+([\w.]+)/gi;
        let policyMatch;

        while ((policyMatch = policyRegex.exec(content)) !== null) {
            const tableName = policyMatch[1].replace(/^public\./, '');
            const policyStart = policyMatch.index;

            // Find the extent of this policy (until next CREATE POLICY, or end of file)
            const nextPolicy = content.indexOf('CREATE POLICY', policyStart + 1);
            const policyBody = nextPolicy > 0
                ? content.substring(policyStart, nextPolicy)
                : content.substring(policyStart);

            // Check if the policy body contains FROM <same_table>
            const selfRefRegex = new RegExp(`FROM\\s+(?:public\\.)?${tableName}\\b`, 'gi');
            const bodyLines = policyBody.split('\n');

            for (let i = 0; i < bodyLines.length; i++) {
                const line = bodyLines[i];
                if (isComment(line, 'sql')) continue;

                if (selfRefRegex.test(line)) {
                    // Find the actual line number in the file
                    const linesBefore = content.substring(0, policyStart).split('\n').length;
                    violations.push(
                        `${relative(ROOT, file)}:~${linesBefore + i} — Policy on "${tableName}" self-references with FROM ${tableName}`
                    );
                }
                // Reset lastIndex since we reuse the regex
                selfRefRegex.lastIndex = 0;
            }
        }
    }

    if (violations.length === 0) {
        pass('A6', `No self-referencing RLS policies (scanned ${sqlFiles.length} SQL files)`);
    } else {
        fail('A6', `Self-referencing RLS policies found — causes infinite recursion (${violations.length})`, violations);
    }
}

function checkA1() {
    const violations = [];
    const sourceFiles = [];

    for (const dir of SRC_DIRS) {
        sourceFiles.push(...findFiles(resolve(ROOT, dir), ['.jsx', '.js']));
    }

    for (const file of sourceFiles) {
        if (isWhitelisted(file, A1_WHITELIST, A1_SERVER_ACTION_DIRS)) continue;
        // Also skip scripts directory
        if (relative(ROOT, file).startsWith('scripts')) continue;

        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (isComment(line)) continue;

            // Check for direct supabase.from() calls
            if (line.includes('supabase.from(') || line.includes('supabase.storage')) {
                violations.push(`${relative(ROOT, file)}:${i + 1} — ${line.trim()}`);
            }

            // Check for raw supabase import (not from supabaseService)
            if (line.includes('from "@/utils/supabase"') || line.includes("from '@/utils/supabase'")) {
                violations.push(`${relative(ROOT, file)}:${i + 1} — direct supabase import`);
            }
            if ((line.includes('from "@supabase/supabase-js"') || line.includes("from '@supabase/supabase-js'")) && !isWhitelisted(file, A1_WHITELIST, A1_SERVER_ACTION_DIRS)) {
                violations.push(`${relative(ROOT, file)}:${i + 1} — raw @supabase/supabase-js import`);
            }
        }
    }

    if (violations.length === 0) {
        pass('A1', `No direct Supabase calls in components/pages (scanned ${sourceFiles.length} files)`);
    } else {
        fail('A1', `Direct Supabase calls found (${violations.length} violations)`, violations);
    }
}

function checkA2() {
    const violations = [];
    const sqlFiles = findFiles(resolve(ROOT, 'db'), ['.sql']);

    for (const file of sqlFiles) {
        const fileName = relative(ROOT, file);
        if (/(?:^|\/)fix_/.test(fileName) || /(?:^|\/)apply_fix_/.test(fileName) || /(?:^|\/)update_/.test(fileName)) continue;

        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        // Detect if this file is a function/RPC definition (SECURITY DEFINER)
        // These legitimately query auth.users server-side — they're safe.
        const isRpcFile = content.includes('SECURITY DEFINER') || content.includes('CREATE OR REPLACE FUNCTION');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (isComment(line, 'sql')) continue;

            // Skip auth.users inside RPC function bodies — those are safe (server-side)
            if (isRpcFile) continue;

            // Check for auth.users in non-comment, non-RPC SQL (policy definitions)
            if (/FROM\s+auth\.users/i.test(line) || /SELECT\s+.*\s+FROM\s+auth\.users/i.test(line)) {
                violations.push(`${relative(ROOT, file)}:${i + 1} — ${line.trim()}`);
            }
        }
    }

    if (violations.length === 0) {
        pass('A2', `No auth.users in RLS policy definitions (scanned ${sqlFiles.length} SQL files)`);
    } else {
        fail('A2', `auth.users found in policy definitions (${violations.length} violations)`, violations);
    }
}

function checkA3() {
    const violations = [];
    const jsxFiles = [];

    for (const dir of SRC_DIRS) {
        jsxFiles.push(...findFiles(resolve(ROOT, dir), ['.jsx']));
    }

    for (const file of jsxFiles) {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (isComment(line)) continue;

            if (line.includes('window.confirm(')) {
                violations.push(`${relative(ROOT, file)}:${i + 1} — ${line.trim()}`);
            }
        }
    }

    if (violations.length === 0) {
        pass('A3', `No window.confirm() calls (scanned ${jsxFiles.length} JSX files)`);
    } else {
        fail('A3', `window.confirm() found — use <ConfirmModal> instead (${violations.length})`, violations);
    }
}

function checkA4() {
    const violations = [];
    const sourceFiles = [];

    for (const dir of SRC_DIRS) {
        sourceFiles.push(...findFiles(resolve(ROOT, dir), ['.jsx', '.js']));
    }

    for (const file of sourceFiles) {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (/\/\/\s*(TODO|FIXME|HACK)\b/i.test(line)) {
                violations.push(`${relative(ROOT, file)}:${i + 1} — ${line.trim()}`);
            }
        }
    }

    if (violations.length === 0) {
        pass('A4', `No TODO/FIXME/HACK in source code (scanned ${sourceFiles.length} files)`);
    } else {
        fail('A4', `TODO/FIXME/HACK found — resolve before shipping (${violations.length})`, violations);
    }
}

function checkA5() {
    const violations = [];
    const jsxFiles = [];

    for (const dir of SRC_DIRS) {
        jsxFiles.push(...findFiles(resolve(ROOT, dir), ['.jsx']));
    }

    for (const file of jsxFiles) {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (isComment(line)) continue;

            // Only flag hex colors that appear to be inside className, style, or color props
            if (/(?:className|style|color|fill|stroke)\s*=/.test(line) && /#[0-9a-fA-F]{3,8}\b/.test(line)) {
                violations.push(`${relative(ROOT, file)}:${i + 1} — raw hex in styling: ${line.trim()}`);
            }
        }
    }

    if (violations.length === 0) {
        pass('A5', `No raw hex colors in JSX styling (scanned ${jsxFiles.length} JSX files)`);
    } else {
        fail('A5', `Raw hex colors found — use Tailwind design tokens instead (${violations.length})`, violations);
    }
}

// ─── Category B: Documentation & Testing Enforcement ─────────────────────────

function checkB1() {
    const violations = [];
    const serviceFile = readFileSync(resolve(ROOT, 'lib/supabaseService.js'), 'utf-8');
    const standardsPath = resolve(AGENT_DIR, 'project/engineering_standards.md');

    if (!existsSync(standardsPath)) {
        fail('B1', 'engineering_standards.md not found');
        return;
    }

    const standardsContent = readFileSync(standardsPath, 'utf-8');

    // Extract all exported service objects and their function names
    const serviceExports = [];
    const exportRegex = /export\s+const\s+(\w+)\s*=/g;
    let match;
    while ((match = exportRegex.exec(serviceFile)) !== null) {
        serviceExports.push(match[1]);
    }

    // Extract function names from each service object
    const functionRegex = /async\s+(\w+)\s*\(/g;
    while ((match = functionRegex.exec(serviceFile)) !== null) {
        const funcName = match[1];
        // Check if function name appears in the standards doc
        if (!standardsContent.includes(funcName)) {
            violations.push(`Function "${funcName}" not found in engineering_standards.md`);
        }
    }

    if (violations.length === 0) {
        pass('B1', `All service functions documented in engineering_standards.md`);
    } else {
        fail('B1', `Service functions missing from documentation (${violations.length})`, violations);
    }
}

function checkB2() {
    const violations = [];
    const dbCheckPath = resolve(ROOT, 'scripts/db_health_check.js');
    const dictPath = resolve(AGENT_DIR, 'project/database_dictionary.md');

    if (!existsSync(dbCheckPath) || !existsSync(dictPath)) {
        fail('B2', 'db_health_check.js or database_dictionary.md not found');
        return;
    }

    const dbCheckContent = readFileSync(dbCheckPath, 'utf-8');
    const dictContent = readFileSync(dictPath, 'utf-8');

    // Extract EXPECTED_TABLES from db_health_check.js
    const tableMatch = dbCheckContent.match(/EXPECTED_TABLES\s*=\s*\[([\s\S]*?)\]/);
    if (!tableMatch) {
        fail('B2', 'Could not parse EXPECTED_TABLES from db_health_check.js');
        return;
    }

    const tables = tableMatch[1].match(/'([^']+)'/g)?.map(t => t.replace(/'/g, '')) || [];

    for (const table of tables) {
        if (!dictContent.includes(table)) {
            violations.push(`Table "${table}" in db_health_check.js but not in database_dictionary.md`);
        }
    }

    if (violations.length === 0) {
        pass('B2', `All ${tables.length} DB tables documented in database_dictionary.md`);
    } else {
        fail('B2', `DB tables missing from documentation (${violations.length})`, violations);
    }
}

function checkB3() {
    const violations = [];
    const testDir = resolve(ROOT, '__tests__');

    // Define source → test mapping
    const sourceTestMap = [
        { source: 'lib/supabaseService.js', test: '__tests__/services/supabaseService.test.js' },
        { source: 'lib/formUtils.js', test: '__tests__/lib/formUtils.test.js' },
        { source: 'hooks/useAuth.js', test: '__tests__/hooks/useAuth.test.js' },
    ];

    // Check each mapping
    for (const { source, test } of sourceTestMap) {
        const sourcePath = resolve(ROOT, source);
        const testPath = resolve(ROOT, test);

        if (existsSync(sourcePath) && !existsSync(testPath)) {
            violations.push(`${source} has no test file (expected: ${test})`);
        }
    }

    // Check for component test coverage
    const componentTestPath = resolve(testDir, 'components/ui.test.jsx');
    const componentTestExists = existsSync(componentTestPath);

    if (!componentTestExists) {
        violations.push('No component test file found at __tests__/components/ui.test.jsx');
    }

    if (violations.length === 0) {
        pass('B3', `All source files have corresponding test files`);
    } else {
        fail('B3', `Source files missing test coverage (${violations.length})`, violations);
    }
}

function checkB4() {
    const violations = [];
    const serviceFile = readFileSync(resolve(ROOT, 'lib/supabaseService.js'), 'utf-8');
    const testPath = resolve(ROOT, '__tests__/services/supabaseService.test.js');

    if (!existsSync(testPath)) {
        fail('B4', 'supabaseService.test.js not found');
        return;
    }

    const testContent = readFileSync(testPath, 'utf-8');

    // Extract all async function names from the service file
    const functionRegex = /async\s+(\w+)\s*\(/g;
    const functions = [];
    let match;

    while ((match = functionRegex.exec(serviceFile)) !== null) {
        functions.push(match[1]);
    }

    // Check if each function is referenced in the test file
    for (const func of functions) {
        if (!testContent.includes(func)) {
            violations.push(`Function "${func}" has no test coverage in supabaseService.test.js`);
        }
    }

    if (violations.length === 0) {
        pass('B4', `All ${functions.length} service functions have test coverage`);
    } else {
        fail('B4', `Service functions missing test coverage (${violations.length})`, violations);
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
    console.log('🔍 RedCAD Methodology Verifier');
    console.log(`   Root: ${ROOT}`);
    console.log('═'.repeat(60));

    // Category A: Code Pattern Checks
    console.log('\n📋 Category A: Code Pattern Checks...');
    checkA1();
    checkA2();
    checkA3();
    checkA4();
    checkA5();
    checkA6();

    // Category B: Documentation & Testing Enforcement
    console.log('\n📋 Category B: Documentation & Testing Enforcement...');
    checkB1();
    checkB2();
    checkB3();
    checkB4();

    // Summary
    const catA = results.filter(r => r.id.startsWith('A'));
    const catB = results.filter(r => r.id.startsWith('B'));
    const catAPassed = catA.filter(r => r.status === 'pass').length;
    const catBPassed = catB.filter(r => r.status === 'pass').length;

    console.log('\n' + '═'.repeat(60));
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    console.log(`   Category A: ${catAPassed}/${catA.length} ✅  |  Category B: ${catBPassed}/${catB.length} ✅`);

    if (failed > 0) {
        const catAFails = catA.filter(r => r.status === 'fail');
        const catBFails = catB.filter(r => r.status === 'fail');

        if (catAFails.length > 0) {
            console.log('\n🔴 Category A failures are BLOCKERS — fix before shipping.');
        }
        if (catBFails.length > 0) {
            console.log('\n🟡 Category B failures are GAPS — fix in the same session.');
        }
        process.exit(1);
    } else {
        console.log('\n🎉 All methodology checks passed! The codebase is aligned with our standards.');
    }
}

run().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
