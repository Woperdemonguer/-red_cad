import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    const email = 'gerencia@hortacuina.org';
    const tempPass = 'Gerencia2026!';

    console.log(`Setting password for ${email} to ${tempPass} via Admin API...`);
    
    // First, find and force update the password
    let targetUid = null;
    let page = 1;
    let found = false;
    while (!found) {
        const { data, error: listErr } = await adminClient.auth.admin.listUsers({ page: page, perPage: 100 });
        if (listErr) { console.error("Error list:", listErr); process.exit(1); }
        if (!data.users || data.users.length === 0) break;
        const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) { targetUid = existing.id; found = true; break; }
        page++;
    }

    if (found) {
        const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetUid, { password: tempPass, email_confirm: true });
        if (updateErr) { console.error("Update error:", updateErr); process.exit(1); }
        console.log("Password explicitly set via Admin.");
    }

    console.log("Attempting to login...");
    const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
        email: email,
        password: tempPass
    });

    if (loginErr) {
        console.error("Login FAILURE:", loginErr.message);
    } else {
        console.log("Login SUCCESS!");
        console.log("Access Token received:", loginData.session.access_token.substring(0, 20) + "...");
    }
}

run();
