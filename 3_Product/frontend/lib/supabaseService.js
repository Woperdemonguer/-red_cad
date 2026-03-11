import { supabase } from "@/utils/supabase";

/**
 * supabaseService — Centralized data access layer.
 *
 * All Supabase CRUD operations go through here.
 * Pages should never call `supabase.from()` directly — they use these services instead.
 * This makes it easy to add error handling, caching, or swap the backend later.
 */

export { supabase };

// ─── Profile Service ───────────────────────────────────────────────────────────

export const profileService = {
    /**
     * Fetch a single CAD profile by ID.
     * Returns the profile object or null.
     */
    async get(cadId) {
        const { data, error } = await supabase
            .from("cad_profiles")
            .select("*")
            .eq("id", cadId)
            .single();

        if (error) throw new Error(`Error cargando perfil: ${error.message}`);
        return data;
    },

    /**
     * Resolves the primary email associated with a CAD profile to be used as a login username.
     * Tries the contact email first, then the first team member's email.
     * @param {string} cadId - The id of the CAD profile
     * @returns {string|null} - The primary email or null if none found
     */
    async resolveEmail(cadId) {
        const { data, error } = await supabase
            .from('cad_profiles')
            .select('email_contacto, perfiles_equipo')
            .eq('id', cadId)
            .single();
            
        if (error || !data) return null;
        
        if (data.email_contacto) return data.email_contacto;
        
        if (data.perfiles_equipo && data.perfiles_equipo.length > 0) {
            const firstEmail = data.perfiles_equipo.find(p => p.email)?.email;
            if (firstEmail) return firstEmail;
        }
        
        return null;
    },

    /**
     * Fetch all CAD profiles, ordered by name.
     * Filters out empty/ghost profiles (no nombre_comercial).
     */
    async list() {
        const { data, error } = await supabase
            .from("cad_profiles")
            .select("*")
            .order("nombre_comercial");

        if (error) throw new Error(`Error cargando directorio: ${error.message}`);
        return (data || []).filter(cad => cad.nombre_comercial);
    },

    /**
     * Fetch all CAD profiles with minimal fields for admin panel.
     */
    async listForAdmin() {
        const { data, error } = await supabase
            .from("cad_profiles")
            .select("id, nombre_comercial, territorio, estado")
            .order("nombre_comercial");

        if (error) throw new Error(`Error cargando lista de CADs: ${error.message}`);
        return data || [];
    },

    /**
     * Update a CAD profile's public data.
     * Only updates the fields that are part of the profile schema.
     */
    async update(cadId, profileData) {
        const { error } = await supabase
            .from("cad_profiles")
            .update({
                nombre_comercial: profileData.nombre_comercial,
                descripcion_corta: profileData.descripcion_corta,
                territorio: profileData.territorio,
                email_contacto: profileData.email_contacto,
                telefono: profileData.telefono,
                ano_constitucion: parseInt(profileData.ano_constitucion) || null,
                num_socios_productoras: parseInt(profileData.num_socios_productoras) || null,
                num_personas_trabajadoras: parseInt(profileData.num_personas_trabajadoras) || null,
                forma_juridica: profileData.forma_juridica,
                tipo_gobernanza: profileData.tipo_gobernanza,
                madurez_evaluacion: profileData.madurez_evaluacion,
                madurez_fortalezas: profileData.madurez_fortalezas,
                madurez_cuellos_botella: profileData.madurez_cuellos_botella,
                intercoop_compartir: profileData.intercoop_compartir,
                intercoop_apoyo_necesario: profileData.intercoop_apoyo_necesario,
                intercoop_disposicion: profileData.intercoop_disposicion,
                intercoop_referentes: profileData.intercoop_referentes,
                logo_url: profileData.logo_url,
                estado: profileData.estado,
                grupo_motor: profileData.grupo_motor,
                perfiles_equipo: profileData.perfiles_equipo,
                propiedad_instalaciones: profileData.propiedad_instalaciones,
                datos_adicionales: profileData.datos_adicionales, // Dynamic JSONB catch-all
            })
            .eq("id", cadId);

        if (error) throw new Error(`Error guardando perfil: ${error.message}`);
    },

    /**
     * Create a new CAD profile (admin only).
     * Returns the new profile object.
     */
    async create(name = "Nueva Agrupación") {
        const { data, error } = await supabase
            .from("cad_profiles")
            .insert({ nombre_comercial: name })
            .select()
            .single();

        if (error) throw new Error(`Error creando perfil: ${error.message}`);
        return data;
    },

    /**
     * Delete a CAD profile (admin only).
     */
    async delete(cadId) {
        const { error } = await supabase
            .from("cad_profiles")
            .delete()
            .eq("id", cadId);

        if (error) throw new Error(`Error eliminando perfil: ${error.message}`);
    },
};

// ─── Team Service ───────────────────────────────────────────────────────────────

export const teamService = {
    /**
     * Fetch all team members for a CAD.
     * @param {string} cadId - CAD profile UUID
     */
    async listForCad(cadId) {
        const { data, error } = await supabase
            .from("cad_users_mapping")
            .select("*")
            .eq("cad_id", cadId);

        if (error) throw new Error(`Error cargando equipo: ${error.message}`);
        return data || [];
    },

    /**
     * Fetch all admin team members.
     */
    async listAdmins() {
        const { data, error } = await supabase
            .from("admin_users_mapping")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) throw new Error(`Error cargando administradores: ${error.message}`);
        return data || [];
    },

    /**
     * Add a new team member to a CAD or admin team.
     * @param {boolean} isAdmin - If true, adds to admin_users_mapping
     * @param {object} member - { user_email, nombre_persona, perfil_rol, telefono }
     * @param {string|null} cadId - Required for CAD members
     */
    async add(isAdmin, member, cadId = null) {
        const table = isAdmin ? "admin_users_mapping" : "cad_users_mapping";
        const payload = isAdmin ? { ...member } : { cad_id: cadId, ...member };

        const { data, error } = await supabase
            .from(table)
            .insert([payload])
            .select()
            .single();

        if (error) throw new Error(`Error añadiendo miembro: ${error.message}`);
        return data;
    },

    /**
     * Update a team member's data.
     * @param {boolean} isAdmin - Which table to update
     * @param {string} memberId - UUID of the member row
     * @param {object} updates - Fields to update
     */
    async update(isAdmin, memberId, updates) {
        const table = isAdmin ? "admin_users_mapping" : "cad_users_mapping";

        const { error } = await supabase
            .from(table)
            .update({
                nombre_persona: updates.nombre_persona,
                user_email: updates.user_email,
                perfil_rol: updates.perfil_rol,
                telefono: updates.telefono,
            })
            .eq("id", memberId);

        if (error) throw new Error(`Error actualizando miembro: ${error.message}`);
    },

    /**
     * Remove a team member.
     * @param {boolean} isAdmin - Which table to delete from
     * @param {string} memberId - UUID of the member row
     */
    async remove(isAdmin, memberId) {
        const table = isAdmin ? "admin_users_mapping" : "cad_users_mapping";

        const { error } = await supabase
            .from(table)
            .delete()
            .eq("id", memberId);

        if (error) throw new Error(`Error eliminando miembro: ${error.message}`);
    },
};

// ─── Diagnostic Form Service ────────────────────────────────────────────────────

export const formService = {
    /**
     * Load saved form answers for a given email.
     * Returns the answers object or null if no entry exists.
     */
    async load(email) {
        const { data, error } = await supabase
            .from("diagnostic_forms")
            .select("answers")
            .eq("user_email", email)
            .limit(1);

        if (error) {
            throw new Error(`Error cargando formulario: ${error.message}`);
        }

        return data && data.length > 0 ? data[0].answers : null;
    },

    /**
     * Save form answers (upsert: insert if new, update if exists).
     * Uses native Supabase upsert for atomicity and fewer round trips.
     */
    async save(email, answers) {
        const { error } = await supabase
            .from("diagnostic_forms")
            .upsert(
                { user_email: email, answers },
                { onConflict: "user_email" }
            );

        if (error) throw new Error(`Error guardando formulario: ${error.message}`);
    },

    /**
     * Resolve the target email for a form.
     * If a cad_id is provided, tries to find the primary mapped user.
     * Falls back to the CAD's email_contacto.
     */
    async resolveEmail(cadId) {
        // Try cad_users_mapping first
        const { data: mapping } = await supabase
            .from("cad_users_mapping")
            .select("user_email")
            .eq("cad_id", cadId)
            .limit(1);

        if (mapping && mapping.length > 0) {
            return mapping[0].user_email;
        }

        // Fallback to cad_profiles.email_contacto
        const { data: profile } = await supabase
            .from("cad_profiles")
            .select("email_contacto")
            .eq("id", cadId)
            .limit(1);

        return profile && profile.length > 0 ? profile[0].email_contacto : null;
    },
};

// ─── Storage Service ────────────────────────────────────────────────────────────

export const storageService = {
    /**
     * Upload a logo image to Supabase Storage.
     * Returns the public URL.
     */
    async uploadLogo(cadId, file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${cadId}-${Math.random()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error } = await supabase.storage
            .from("cad_media")
            .upload(filePath, file);

        if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

        const { data } = supabase.storage
            .from("cad_media")
            .getPublicUrl(filePath);

        return data.publicUrl;
    },
};
