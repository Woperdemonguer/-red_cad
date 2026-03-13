import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'test@ekoalde.test';
const TARGET_PASS = 'TestPassword123!';

async function run() {
    console.log(`Buscando a ${TARGET_EMAIL}...`);
    
    // 1. Get the Admin UUID
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
        // If the admin doesn't exist at all yet in Auth:
        console.log("No existía en Auth. Creando...");
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: TARGET_EMAIL,
            password: TARGET_PASS,
            email_confirm: true
        });
        if (error) {
            console.error("Fallo creando el admin:", error);
        } else {
            console.log("¡Éxito! Creado con la contraseña maestra.");
        }
    } else {
        // Exists, update it
        console.log(`Encontrado UID: ${targetUid}. Actualizando contraseña...`);
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetUid, {
            password: TARGET_PASS,
            email_confirm: true
        });
        if (error) {
            console.error("Fallo actualizando:', error");
        } else {
             console.log("¡Éxito! Contraseña actualizada.");
        }
    }
}

run();
