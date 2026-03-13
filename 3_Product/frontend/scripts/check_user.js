import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    console.log("Searching for gerencia@hortacuina.org...");
    
    let targetUid = null;
    let page = 1;
    let found = false;

    while (!found) {
        const { data, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
            page: page,
            perPage: 100
        });
        if (listErr) {
            console.error("Error listing users:", listErr);
            process.exit(1);
        }
        if (!data.users || data.users.length === 0) break;

        const existing = data.users.find(u => u.email.toLowerCase() === 'gerencia@hortacuina.org');
        if (existing) {
            console.log("FOUND USER:", JSON.stringify(existing, null, 2));
            found = true;
            break;
        }
        page++;
    }

    if (!found) {
        console.log("User not found in auth.users.");
    }
}

run();
