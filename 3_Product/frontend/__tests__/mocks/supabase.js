/**
 * Shared Supabase mock for all tests.
 *
 * The mock intercepts `import { supabase } from "@/utils/supabase"`
 * and replaces it with a controllable fake client. Each test can
 * configure what `.from().select().eq()...` chains return.
 */
import { vi } from 'vitest';

// ─── Chainable query builder ─────────────────────────────────────────────────
// Each method returns `this` so chains like `.from("x").select("*").eq("k","v").single()` work.
// Call `mockResult()` to set what the terminal method (`.single()`, the auto-resolve, etc.) returns.

export function createMockQueryBuilder(defaultReturn = { data: null, error: null }) {
    let _result = { ...defaultReturn };

    const builder = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve(_result)),

        // Terminal: when the chain is awaited without `.single()`
        then: (resolve) => resolve(_result),

        // Set what the next query returns
        mockResult(data, error = null) {
            _result = { data, error };
            return builder;
        },
        mockError(message) {
            _result = { data: null, error: { message, code: 'ERROR' } };
            return builder;
        },
    };

    return builder;
}

// ─── Mock Supabase client ────────────────────────────────────────────────────

export function createMockSupabase() {
    const _builders = {};

    return {
        from: vi.fn((table) => {
            if (!_builders[table]) {
                _builders[table] = createMockQueryBuilder();
            }
            return _builders[table];
        }),

        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
            signInWithOtp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } },
            })),
        },

        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(() => Promise.resolve({ error: null })),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock.url/file.png' } })),
            })),
        },

        // Helper to get a table's mock builder for configuration
        _table(table) {
            if (!_builders[table]) {
                _builders[table] = createMockQueryBuilder();
            }
            return _builders[table];
        },
    };
}
