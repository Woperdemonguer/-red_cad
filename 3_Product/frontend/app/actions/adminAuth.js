"use server"

import { createClient } from "@supabase/supabase-js";

/**
 * Server Action for Admins to create or reset CAD user passwords.
 * Bypasses email confirmations using the Supabase Service Role Key.
 * 
 * @param {string} accessToken - The caller's JWT returned by supabase.auth.getSession()
 * @param {string} targetEmail - The email of the CAD to reset
 * @param {string} newPassword - The new password to assign
 */
export async function adminResetUserPassword(accessToken, targetEmail, newPassword) {
    targetEmail = (targetEmail || "").trim();
    newPassword = (newPassword || "").trim();

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return { success: false, error: "Faltan credenciales de entorno (SUPABASE_SERVICE_ROLE_KEY) en el servidor de Vercel." };
        }

        // 1. Verify caller is an admin using their token
        const client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const { data: { user }, error: authErr } = await client.auth.getUser(accessToken);
        
        if (authErr || !user) {
            return { success: false, error: "Permiso denegado: Token inválido o ha caducado." };
        }

        // 2. We have the user securely extracted from the Token. Initialize root Admin client
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 3. Verify they exist in the admin tables using root privileges (since RLS might block anonymous read)
        const { data: adminRecord } = await adminClient
            .from("admin_users_mapping")
            .select("id")
            .eq("user_email", user.email)
            .limit(1);

        const { data: roleRecord } = await adminClient
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .limit(1);

        const isAdmin = (roleRecord && roleRecord.length > 0 && roleRecord[0].role === 'admin') || 
                        (adminRecord && adminRecord.length > 0);

        if (!isAdmin) {
            return { success: false, error: "Permiso denegado: No tienes rol de Administrador verificado." };
        }

        // 3. Find if user exists
        let targetUid = null;
        let page = 1;
        let found = false;

        // Loop through users to find them by email (Supabase admin API pagination)
        while (!found) {
            const { data, error: listErr } = await adminClient.auth.admin.listUsers({
                page: page,
                perPage: 100
            });
            if (listErr) throw listErr;
            if (!data.users || data.users.length === 0) break;

            const existing = data.users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
            if (existing) {
                targetUid = existing.id;
                found = true;
                break;
            }
            page++;
        }

        if (found && targetUid) {
            // User exists: Force update password and auto-confirm
            const { error: updateErr } = await adminClient.auth.admin.updateUserById(
                targetUid,
                { password: newPassword, email_confirm: true }
            );
            if (updateErr) throw updateErr;
            return { success: true, message: `Contraseña actualizada correctamente para ${targetEmail}.` };
        } else {
            // User does not exist: Create them clean
            const { error: createErr } = await adminClient.auth.admin.createUser({
                email: targetEmail,
                password: newPassword,
                email_confirm: true // Force confirm 
            });
            if (createErr) throw createErr;
            return { success: true, message: `Nueva cuenta ${targetEmail} creada y confirmada exitosamente.` };
        }

    } catch (err) {
        console.error("Admin Password Reset Error:", err);
        return { success: false, error: err.message || "Error interno del servidor resolviendo la cuenta." };
    }
}
