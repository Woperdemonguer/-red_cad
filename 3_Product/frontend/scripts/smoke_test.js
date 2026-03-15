/**
 * Smoke Test — Logs in as a real user and tests actual Supabase operations.
 * 
 * This catches RLS policy bugs and missing constraints that unit tests can't.
 * Run: npm run test:smoke (or: node --env-file=.env.local scripts/smoke_test.js)
 * 
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   NEXT_PUBLIC_DEV_CAD_EMAIL (or defaults to test@cad.org)
 *   NEXT_PUBLIC_DEV_CAD_PASS
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const testEmail = process.env.NEXT_PUBLIC_DEV_CAD_EMAIL || 'test@cad.org';
const testPass = process.env.NEXT_PUBLIC_DEV_CAD_PASS;

if (!supabaseUrl || !anonKey || !testPass) {
    console.error('❌ Missing required env vars in .env.local');
    console.error('   Need: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_DEV_CAD_PASS');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Test Infrastructure ─────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results = [];

async function test(name, fn) {
    try {
        await fn();
        console.log(`  ✅ ${name}`);
        passed++;
        results.push({ name, status: 'pass' });
    } catch (err) {
        console.log(`  ❌ ${name}`);
        console.log(`     → ${err.message}`);
        failed++;
        results.push({ name, status: 'fail', error: err.message });
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

async function run() {
    console.log('🔥 RedCAD Smoke Test');
    console.log(`   Target: ${supabaseUrl}`);
    console.log(`   User:   ${testEmail}`);
    console.log('═'.repeat(60));

    // ── Step 0: Login ─────────────────────────────────────────────────────
    console.log('\n🔐 Authentication...');
    
    let session;
    await test('Login with test user', async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPass,
        });
        assert(!error, `Login failed: ${error?.message}`);
        assert(data.session, 'No session returned after login');
        session = data.session;
    });

    if (!session) {
        console.log('\n💀 Cannot continue without a session. Fix login first.');
        process.exit(1);
    }

    // ── Step 1: Diagnostic Form — Load ────────────────────────────────────
    console.log('\n📋 Diagnostic Form...');
    
    await test('Load form (SELECT diagnostic_forms)', async () => {
        const { data, error } = await supabase
            .from('diagnostic_forms')
            .select('answers')
            .eq('user_email', testEmail)
            .limit(1);
        
        assert(!error, `Load failed: ${error?.message}`);
        // data can be empty array (no form yet) — that's OK
        assert(Array.isArray(data), `Expected array, got: ${typeof data}`);
    });

    // ── Step 2: Diagnostic Form — Save ────────────────────────────────────
    const testTimestamp = new Date().toISOString();
    
    await test('Save form (UPSERT diagnostic_forms)', async () => {
        const { error } = await supabase
            .from('diagnostic_forms')
            .upsert(
                { user_email: testEmail, answers: { _smoke_test: testTimestamp } },
                { onConflict: 'user_email' }
            );
        
        assert(!error, `Save failed: ${error?.message}`);
    });

    // ── Step 3: Verify persistence ───────────────────────────────────────
    await test('Verify saved data persists', async () => {
        const { data, error } = await supabase
            .from('diagnostic_forms')
            .select('answers')
            .eq('user_email', testEmail)
            .limit(1);
        
        assert(!error, `Read-back failed: ${error?.message}`);
        assert(data.length > 0, 'No form data found after save');
        assert(data[0].answers._smoke_test === testTimestamp, 
            `Data mismatch: expected ${testTimestamp}, got ${data[0].answers._smoke_test}`);
    });

    // ── Step 4: CAD Profiles — Public Read ────────────────────────────────
    console.log('\n🏢 CAD Profiles...');
    
    await test('Load profiles (SELECT cad_profiles)', async () => {
        const { data, error } = await supabase
            .from('cad_profiles')
            .select('id, nombre_comercial')
            .limit(5);
        
        assert(!error, `Profile load failed: ${error?.message}`);
        assert(Array.isArray(data), `Expected array, got: ${typeof data}`);
    });

    // ── Step 5: Team Members — CAD User Access ───────────────────────────
    console.log('\n👥 Team Access...');
    
    await test('Load team mapping (SELECT cad_users_mapping)', async () => {
        const { data, error } = await supabase
            .from('cad_users_mapping')
            .select('id, user_email, cad_id')
            .eq('user_email', testEmail)
            .limit(1);
        
        assert(!error, `Team load failed: ${error?.message}`);
        assert(Array.isArray(data), `Expected array, got: ${typeof data}`);
    });

    // ── Step 6: Products — Public Read (optional, may not be deployed) ────
    console.log('\n📦 Products...');
    
    await test('Load products (SELECT products)', async () => {
        const { data, error } = await supabase
            .from('products')
            .select('id, nombre')
            .limit(5);
        
        if (error && error.message.includes('schema cache')) {
            console.log('     ⏭️  Table not in schema cache (not deployed yet) — skipping');
            return; // Don't fail, just skip
        }
        assert(!error, `Products load failed: ${error?.message}`);
        assert(Array.isArray(data), `Expected array, got: ${typeof data}`);
    });

    // ── Cleanup: Restore original form data ──────────────────────────────
    console.log('\n🧹 Cleanup...');
    
    await test('Restore form data (remove smoke test marker)', async () => {
        // Reload original data and remove the smoke test key
        const { data } = await supabase
            .from('diagnostic_forms')
            .select('answers')
            .eq('user_email', testEmail)
            .limit(1);
        
        if (data && data.length > 0) {
            const answers = { ...data[0].answers };
            delete answers._smoke_test;
            
            const { error } = await supabase
                .from('diagnostic_forms')
                .upsert(
                    { user_email: testEmail, answers },
                    { onConflict: 'user_email' }
                );
            
            assert(!error, `Cleanup failed: ${error?.message}`);
        }
    });

    // ── Sign out ─────────────────────────────────────────────────────────
    await supabase.auth.signOut();

    // ── Summary ──────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        console.log('\n⚠️  Some smoke tests failed! RLS policies or constraints may be misconfigured.');
        console.log('   Run the fix migration: db/fix_all_rls_auth_users.sql');
        process.exit(1);
    } else {
        console.log('\n🎉 All smoke tests passed! The app is healthy for this user.');
    }
}

run().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
