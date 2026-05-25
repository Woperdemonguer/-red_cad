/**
 * Keep-Alive API Route — Prevents Supabase free-tier project from pausing.
 *
 * Supabase pauses free-tier projects after ~7 days of inactivity, which kills
 * DNS resolution entirely (ERR_NAME_NOT_RESOLVED). This endpoint makes a
 * lightweight query to keep the project alive.
 *
 * Triggered by: Vercel Cron Job (configured in vercel.json)
 * Schedule: Once daily at 06:00 UTC
 *
 * Security: Protected by CRON_SECRET to prevent unauthorized external calls.
 * Vercel automatically sends the Authorization header with CRON_SECRET for cron invocations.
 *
 * Related: Lesson from 2026-05-25 — Supabase paused project caused production outage.
 */

import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
    // ── Security: Verify this is a legitimate cron invocation ──
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is configured, enforce it. In development, allow unauthenticated calls.
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return Response.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return Response.json(
                { error: 'Missing Supabase configuration' },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Lightweight query: just check if the DB is responsive
        const { count, error } = await supabase
            .from('cad_profiles')
            .select('id', { count: 'exact', head: true });

        if (error) {
            console.error('[keep-alive] Supabase query failed:', error.message);
            return Response.json(
                {
                    status: 'error',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                },
                { status: 500 }
            );
        }

        console.log(`[keep-alive] Supabase is alive. ${count} profiles found at ${new Date().toISOString()}`);

        return Response.json({
            status: 'ok',
            supabase: 'alive',
            profiles: count,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('[keep-alive] Unexpected error:', err);
        return Response.json(
            {
                status: 'error',
                message: err.message,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
