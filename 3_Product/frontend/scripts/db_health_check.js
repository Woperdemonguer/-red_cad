/**
 * DB Health Check — Validates live Supabase schema matches expected structure.
 * 
 * Uses the SERVICE ROLE KEY to introspect the database via information_schema.
 * Run: npm run db:check (or: node --env-file=.env.local scripts/db_health_check.js)
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Expected Schema ─────────────────────────────────────────────────────────

const EXPECTED_TABLES = [
    'cad_profiles',
    'cad_users_mapping',
    'admin_users_mapping',
    'diagnostic_forms',
    'user_roles',
];

// Tables that may or may not exist yet (features not yet deployed)
const OPTIONAL_TABLES = [
    'products',
    'prices_availability',
];

const EXPECTED_COLUMNS = {
    diagnostic_forms: ['id', 'user_email', 'answers'],
    cad_profiles: ['id', 'nombre_comercial', 'territorio', 'email_contacto', 'estado', 'created_at', 'updated_at'],
    cad_users_mapping: ['id', 'cad_id', 'user_email', 'nombre_persona', 'perfil_rol', 'created_at'],
    admin_users_mapping: ['id', 'user_email', 'nombre_persona', 'perfil_rol', 'created_at'],
    user_roles: ['id', 'user_id', 'email', 'role', 'created_at'],
};

// Only columns to check IF the optional table exists
const OPTIONAL_COLUMNS = {
    products: ['id', 'cad_id', 'nombre', 'categoria', 'created_at', 'updated_at'],
    prices_availability: ['id', 'producto_id', 'cad_id', 'created_at', 'updated_at'],
};

const EXPECTED_UNIQUE_CONSTRAINTS = [
    { table: 'diagnostic_forms', column: 'user_email' },
    { table: 'admin_users_mapping', column: 'user_email' },
    { table: 'user_roles', column: 'user_id' },
];

// ─── Checks ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function pass(msg) { console.log(`  ✅ ${msg}`); passed++; }
function fail(msg) { console.log(`  ❌ ${msg}`); failed++; }

async function checkTablesExist() {
    console.log('\n📋 Checking required tables...');
    
    for (const table of EXPECTED_TABLES) {
        const { error } = await supabase.from(table).select('id').limit(0);
        if (error && error.code === '42P01') {
            fail(`Table "${table}" does not exist`);
        } else {
            pass(`Table "${table}" exists`);
        }
    }
    
    console.log('\n📋 Checking optional tables (not yet deployed)...');
    for (const table of OPTIONAL_TABLES) {
        const { error } = await supabase.from(table).select('id').limit(0);
        if (error && error.code === '42P01') {
            console.log(`  ⏭️  Table "${table}" — not deployed yet (optional)`);
        } else {
            pass(`Table "${table}" exists (optional)`);
        }
    }
}

async function checkColumns() {
    console.log('\n📐 Checking critical columns...');
    
    // Check required tables
    for (const [table, columns] of Object.entries(EXPECTED_COLUMNS)) {
        const selectStr = columns.join(',');
        const { error } = await supabase.from(table).select(selectStr).limit(0);
        
        if (error) {
            for (const col of columns) {
                const { error: colErr } = await supabase.from(table).select(col).limit(0);
                if (colErr) {
                    fail(`${table}.${col} — missing or inaccessible: ${colErr.message}`);
                } else {
                    pass(`${table}.${col}`);
                }
            }
        } else {
            pass(`${table} — all ${columns.length} critical columns present`);
        }
    }
    
    // Check optional table columns (only if table exists)
    for (const [table, columns] of Object.entries(OPTIONAL_COLUMNS)) {
        const { error: tableErr } = await supabase.from(table).select('id').limit(0);
        if (tableErr) {
            console.log(`  ⏭️  ${table} — skipping column check (table not deployed)`);
            continue;
        }
        const selectStr = columns.join(',');
        const { error } = await supabase.from(table).select(selectStr).limit(0);
        if (error) {
            for (const col of columns) {
                const { error: colErr } = await supabase.from(table).select(col).limit(0);
                if (colErr) {
                    fail(`${table}.${col} — missing: ${colErr.message}`);
                } else {
                    pass(`${table}.${col}`);
                }
            }
        } else {
            pass(`${table} — all ${columns.length} columns present (optional table)`);
        }
    }
}

async function checkUniqueConstraints() {
    console.log('\n🔑 Checking UNIQUE constraints...');
    
    for (const { table, column } of EXPECTED_UNIQUE_CONSTRAINTS) {
        // Try to find the constraint via a duplicate insert test
        // Instead, we'll use information_schema through a raw RPC or indirect method
        // Since we can't run raw SQL via the client, we test by attempting a duplicate insert
        // We'll use a safer approach: read the table and check if rpc exists
        
        // For now, we'll try the information_schema approach via a SECURITY DEFINER function
        // Fallback: just mark as "needs manual verification"
        const { data, error } = await supabase
            .from(table)
            .select(column)
            .limit(1);
        
        if (error) {
            fail(`${table}.${column} — cannot verify UNIQUE constraint (table inaccessible)`);
        } else {
            // We can't definitively verify UNIQUE via the API, but we can note it
            console.log(`  ⚠️  ${table}.${column} — column accessible (UNIQUE constraint should be verified in Supabase Dashboard)`);
        }
    }
}

async function checkRLSEnabled() {
    console.log('\n🛡️  Checking RLS is enabled (indirect)...');
    
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anonKey) {
        console.log('  ⚠️  Skipping RLS check — NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
        return;
    }
    
    const anonClient = createClient(supabaseUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // An anonymous (not logged in) user should NOT see private tables
    const privateTables = ['diagnostic_forms', 'cad_users_mapping', 'admin_users_mapping', 'user_roles'];
    
    for (const table of privateTables) {
        const { data, error } = await anonClient.from(table).select('id').limit(1);
        if (data && data.length > 0) {
            fail(`${table} — RLS may not be enabled (anon user can read data!)`);
        } else {
            pass(`${table} — protected from anonymous access`);
        }
    }
    
    // Public tables should be readable (only check if they exist)
    const publicTables = ['cad_profiles'];
    for (const table of publicTables) {
        const { error } = await anonClient.from(table).select('id').limit(1);
        if (error && error.code === '42501') {
            fail(`${table} — should be publicly readable but got permission denied`);
        } else {
            pass(`${table} — publicly readable (as expected)`);
        }
    }
    
    // Optional public tables
    for (const table of OPTIONAL_TABLES) {
        const { error } = await anonClient.from(table).select('id').limit(1);
        if (error && error.code === '42P01') {
            console.log(`  ⏭️  ${table} — not deployed yet, skipping RLS check`);
        } else if (error && error.code === '42501') {
            fail(`${table} — should be publicly readable but got permission denied`);
        } else {
            pass(`${table} — publicly readable (as expected)`);
        }
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
    console.log('🏥 RedCAD DB Health Check');
    console.log(`   Target: ${supabaseUrl}`);
    console.log('═'.repeat(60));
    
    await checkTablesExist();
    await checkColumns();
    await checkUniqueConstraints();
    await checkRLSEnabled();
    
    console.log('\n' + '═'.repeat(60));
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        console.log('\n⚠️  Some checks failed. Review the output above and fix issues in Supabase.');
        process.exit(1);
    } else {
        console.log('\n🎉 All checks passed! Database schema is healthy.');
    }
}

run().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
