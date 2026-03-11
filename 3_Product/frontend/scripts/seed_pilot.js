const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase Client (requires Service Role Key to bypass RLS for seeding)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST USE SERVICE ROLE KEY HERE!

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
    console.log("🌱 Starting RedCAD Pilot Seed Script...");

    // 1. Read the CSV file
    const csvPath = path.join(__dirname, '../../../Blueprint/seed_data_cads.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');

    // Quick and dirty CSV parser for our specific format
    const rows = csvData.split('\n').filter(r => r.trim() !== '');
    const headers = rows[0].split(',');

    const cadsData = rows.slice(1).map(row => {
        const values = row.split(',');
        return {
            nombre_comercial: values[0]?.trim(),
            territorio: values[1]?.trim(),
            nombre_persona: values[2]?.trim(),
            email: values[3]?.trim(),
            telefono: values[4]?.trim(),
            perfil_rol: values[5]?.trim()
        };
    });

    // 2. We need unique CAD profiles (since some have multiple emails like VallyVega)
    const uniqueCads = new Map();
    cadsData.forEach(entry => {
        if (!uniqueCads.has(entry.nombre_comercial) && entry.nombre_comercial !== 'Secretaría Técnica') {
            uniqueCads.set(entry.nombre_comercial, {
                nombre_comercial: entry.nombre_comercial,
                territorio: entry.territorio,
                estado: 'active'
            });
        }
    });

    console.log(`Found ${uniqueCads.size} unique CADs. Injecting into cad_profiles...`);

    // 3. Insert CAD Profiles
    for (const cad of uniqueCads.values()) {
        const { data: existing } = await supabase.from('cad_profiles').select('id').eq('nombre_comercial', cad.nombre_comercial).single();
        let profile, error;

        if (existing && existing.id) {
            ({ data: profile, error } = await supabase.from('cad_profiles').update(cad).eq('id', existing.id).select().single());
        } else {
            ({ data: profile, error } = await supabase.from('cad_profiles').insert(cad).select().single());
        }

        if (error) {
            console.error(`Error inserting ${cad.nombre_comercial}:`, error.message);
        } else {
            console.log(`✅ Profile processed: ${cad.nombre_comercial} (ID: ${profile.id})`);
            // Save the ID back for mapping
            uniqueCads.set(cad.nombre_comercial, { ...cad, id: profile.id });
        }
    }

    // 4. Insert User Mappings (Connecting Emails to their CADs)
    console.log("\nConnecting Emails to CAD Profiles...");

    for (const entry of cadsData) {
        if (entry.nombre_comercial === 'Secretaría Técnica' || !entry.email) continue;

        // Handle multiple emails in one string (e.g. Ecoagra)
        // "miguel.roig@osbiosbardos.com , miguel.mroig@gmail.com"
        // Wait, the CSV might have split them weirdly if they contained commas.
        // But looking at the provided CSV, I separated them into rows when possible, or we need to be careful.
        const cadInfo = uniqueCads.get(entry.nombre_comercial);
        if (!cadInfo) continue;

        const { error } = await supabase
            .from('cad_users_mapping')
            .upsert({
                cad_id: cadInfo.id,
                user_email: entry.email,
                nombre_persona: entry.nombre_persona,
                perfil_rol: entry.perfil_rol
            }, { onConflict: 'user_email' });

        if (error) {
            console.error(`  ❌ Failed mapping for ${entry.email}:`, error.message);
        } else {
            console.log(`  🔗 Mapped ${entry.email} -> ${entry.nombre_comercial}`);
        }
    }

    // 5. Seed the Admin Role for the PM
    console.log("\nSetting up Admin Role for PM...");
    // Note: We don't have the user_id yet because they haven't logged in. 
    // For now, we will map them by email but we can't fully create the user_roles until auth triggers.
    // Actually, we can pre-create the user in auth.users via Admin API (Future enhancement).
    console.log("Admin setup requires Auth completion first. Seed finished.");

    console.log("\n✅ Pilot Seeding Complete!");
}

seedDatabase().catch(console.error);
