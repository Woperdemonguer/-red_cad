import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE credentials!");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'redcad@giasat.org';
const TARGET_PASS = '@secretariatecnica!';
const TARGET_NAME = 'Secretaría Técnica (Compartido)';

async function run() {
    console.log(`Setting up Shared Admin: ${TARGET_EMAIL}...`);
    
    // 1. Get the User UUID
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

        const existing = data.users.find(u => u.email.toLowerCase() === TARGET_EMAIL.toLowerCase());
        if (existing) {
            targetUid = existing.id;
            found = true;
            break;
        }
        page++;
    }

    if (!found) {
        // Create the user
        console.log("Creating user in auth.users...");
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: TARGET_EMAIL,
            password: TARGET_PASS,
            email_confirm: true
        });
        if (error) {
            console.error("Failed creating user:", error);
            process.exit(1);
        }
        targetUid = data.user.id;
        console.log(`Success! Created with UID: ${targetUid}`);
    } else {
        // Update password
        console.log(`User found with UID: ${targetUid}. Updating password...`);
        const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUid, {
            password: TARGET_PASS,
            email_confirm: true
        });
        if (error) {
            console.error("Failed updating password:", error);
            process.exit(1);
        }
        console.log("Success! Password updated.");
    }

    // 2. Add to admin_users_mapping
    console.log("Upserting into admin_users_mapping...");
    const { error: mappingError } = await supabaseAdmin
        .from('admin_users_mapping')
        .upsert({ 
            user_email: TARGET_EMAIL, 
            nombre_persona: TARGET_NAME,
            perfil_rol: 'Administrador Red'
        }, { onConflict: 'user_email' });
        
    if (mappingError) {
        console.error("Failed upserting mapping:", mappingError);
    } else {
        console.log("Success! Added to admin_users_mapping.");
    }

    // 3. Add to user_roles
    console.log("Upserting into user_roles...");
    const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({ 
            user_id: targetUid, 
            email: TARGET_EMAIL,
            role: 'admin'
        }, { onConflict: 'user_id' });
        
    if (roleError) {
        console.error("Failed upserting role:", roleError);
    } else {
        console.log("Success! Added admin role.");
    }
    
    console.log("All done! You can now log in.");
}

run();
