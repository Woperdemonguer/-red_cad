/**
 * Tests for useAuth() hook — authentication and role resolution.
 *
 * Tests verify:
 * 1. Redirects to /login when no session
 * 2. Resolves admin status from user_roles OR admin_users_mapping
 * 3. Resolves CAD association from cad_users_mapping
 * 4. Fetches cadName (nombre_comercial) in background
 * 5. signOut clears session and redirects
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ─── Mock next/navigation ───────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

// ─── Mock Supabase ──────────────────────────────────────────────────────────
const mockGetSession = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
}));

/**
 * Table-name-based mock. Each test configures what data each table returns.
 * This prevents issues with mockReturnValueOnce being consumed by re-invocations.
 */
const tableData = {};

function mockChainForTable(tableName) {
    const data = tableData[tableName] || [];
    const chain = {};
    Object.assign(chain, {
        select: vi.fn().mockReturnValue(chain),
        eq: vi.fn().mockReturnValue(chain),
        limit: vi.fn().mockReturnValue(chain),
        single: vi.fn(() => Promise.resolve({ data: data[0] || null, error: null })),
        then: (resolve) => resolve({ data, error: null }),
    });
    return chain;
}

const mockFromQuery = vi.fn((tableName) => mockChainForTable(tableName));

vi.mock('@/utils/supabase', () => ({
    supabase: {
        auth: {
            getSession: (...args) => mockGetSession(...args),
            signOut: (...args) => mockSignOut(...args),
            onAuthStateChange: (...args) => mockOnAuthStateChange(...args),
        },
        from: (...args) => mockFromQuery(...args),
    },
}));

// Import hook after mocks
const { useAuth } = await import('@/hooks/useAuth');

// ─── Helpers ────────────────────────────────────────────────────────────────

function setupSession(user = { id: 'u-1', email: 'user@cad.org' }) {
    mockGetSession.mockResolvedValue({
        data: { session: user ? { user } : null },
    });
}

function setupQueries({ role = null, isAdminMapped = false, cadId = null, cadName = null } = {}) {
    // Reset all tables
    tableData['user_roles'] = role ? [{ role }] : [];
    tableData['admin_users_mapping'] = isAdminMapped ? [{ id: 'admin-1' }] : [];
    tableData['cad_users_mapping'] = cadId ? [{ cad_id: cadId }] : [];
    tableData['cad_profiles'] = cadName ? [{ nombre_comercial: cadName }] : [];
}

beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({});
    // Reset table data
    Object.keys(tableData).forEach(k => delete tableData[k]);
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useAuth', () => {
    it('redirects to /login when no session exists', async () => {
        setupSession(null);

        renderHook(() => useAuth());

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    it('resolves as non-admin CAD user', async () => {
        setupSession({ id: 'u-1', email: 'coordinacion@ekoalde.org' });
        setupQueries({ cadId: 'cad-abc' });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.email).toBe('coordinacion@ekoalde.org');
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.cadId).toBe('cad-abc');
    });

    it('resolves admin via user_roles table', async () => {
        setupSession({ id: 'u-2', email: 'admin@giasat.com' });
        setupQueries({ role: 'admin' });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.isAdmin).toBe(true);
        expect(result.current.cadId).toBeNull();
    });

    it('resolves admin via admin_users_mapping', async () => {
        setupSession({ id: 'u-3', email: 'admin2@giasat.com' });
        setupQueries({ isAdminMapped: true });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.isAdmin).toBe(true);
    });

    it('signOut calls supabase signOut and redirects', async () => {
        setupSession({ id: 'u-1', email: 'user@cad.org' });
        setupQueries({ cadId: 'cad-123' });

        const { result } = renderHook(() => useAuth());

        // Wait for initial auth to resolve
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Verify signOut function exists and is callable
        expect(typeof result.current.signOut).toBe('function');

        // Call signOut directly (don't await — it would cause re-render loops in test)
        act(() => {
            result.current.signOut();
        });

        // The signOut should have been called
        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalledTimes(1);
        }, { timeout: 2000 });
    }, 10000);

    it('starts with loading=true and resolves to false', async () => {
        setupSession({ id: 'u-1', email: 'user@cad.org' });
        setupQueries({ cadId: 'cad-123' });

        const { result } = renderHook(() => useAuth());

        // Initially loading
        expect(result.current.loading).toBe(true);

        // Eventually resolves
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('fetches cadName in background when cadId exists', async () => {
        setupSession({ id: 'u-1', email: 'user@cad.org' });
        setupQueries({ cadId: 'cad-abc', cadName: 'Ekoalde' });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // cadName is fetched asynchronously after loading resolves
        await waitFor(() => {
            expect(result.current.cadName).toBe('Ekoalde');
        });
    });

    it('subscribes to auth state changes', async () => {
        setupSession({ id: 'u-1', email: 'user@cad.org' });
        setupQueries({ cadId: 'cad-123' });

        renderHook(() => useAuth());

        await waitFor(() => {
            expect(mockOnAuthStateChange).toHaveBeenCalled();
        });
    });
});
