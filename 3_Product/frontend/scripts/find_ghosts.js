import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    let page = 1;

    while (true) {
        const { data, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
            page: page,
            perPage: 100
        });
        if (listErr) {
            console.error("Error listing users:", listErr);
            process.exit(1);
        }
        if (!data.users || data.users.length === 0) break;

        data.users.forEach(u => {
            if (u.email.includes("hortacuina")) {
                console.log(`FOUND: "${u.email}" (ID: ${u.id})`);
            }
        });
        page++;
    }
}

run();
