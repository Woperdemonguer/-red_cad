/**
 * Tests for supabaseService.js — the centralized data access layer.
 *
 * These tests verify that service methods:
 * 1. Call the correct Supabase table/methods
 * 2. Return data in the expected format
 * 3. Throw meaningful errors when Supabase returns errors
 * 4. Handle edge cases (empty results, null fields)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase before importing services ────────────────────────────────
const mockFrom = vi.fn();
const mockStorage = {
    from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://cdn.example.com/logos/test.png' } })),
    })),
};
const mockAuth = {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
};

vi.mock('@/utils/supabase', () => ({
    supabase: {
        from: (...args) => mockFrom(...args),
        storage: mockStorage,
        auth: mockAuth,
    },
}));

// Import after mock is set up
const { profileService, formService, teamService, storageService, authService } = await import('@/lib/supabaseService');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockChain(resolvedValue) {
    const chain = {};
    Object.assign(chain, {
        select: vi.fn().mockReturnValue(chain),
        insert: vi.fn().mockReturnValue(chain),
        update: vi.fn().mockReturnValue(chain),
        upsert: vi.fn().mockReturnValue(chain),
        delete: vi.fn().mockReturnValue(chain),
        eq: vi.fn().mockReturnValue(chain),
        order: vi.fn().mockReturnValue(chain),
        limit: vi.fn().mockReturnValue(chain),
        single: vi.fn(() => Promise.resolve(resolvedValue)),
        then: (resolve) => resolve(resolvedValue),
    });
    return chain;
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── profileService ──────────────────────────────────────────────────────────

describe('profileService', () => {
    describe('get()', () => {
        it('returns a profile by ID', async () => {
            const fakeProfile = { id: 'abc-123', nombre_comercial: 'Ekoalde', territorio: 'Navarra' };
            mockFrom.mockReturnValue(mockChain({ data: fakeProfile, error: null }));

            const result = await profileService.get('abc-123');

            expect(mockFrom).toHaveBeenCalledWith('cad_profiles');
            expect(result).toEqual(fakeProfile);
        });

        it('throws on Supabase error', async () => {
            mockFrom.mockReturnValue(mockChain({ data: null, error: { message: 'Not found' } }));

            await expect(profileService.get('bad-id')).rejects.toThrow('Error cargando perfil');
        });
    });

    describe('list()', () => {
        it('returns profiles filtered by nombre_comercial', async () => {
            const fakeData = [
                { id: '1', nombre_comercial: 'Ekoalde' },
                { id: '2', nombre_comercial: null },       // ghost profile
                { id: '3', nombre_comercial: 'Biocanarias' },
            ];
            mockFrom.mockReturnValue(mockChain({ data: fakeData, error: null }));

            const result = await profileService.list();

            expect(result).toHaveLength(2);
            expect(result.map(r => r.nombre_comercial)).toEqual(['Ekoalde', 'Biocanarias']);
        });

        it('returns empty array when data is null', async () => {
            mockFrom.mockReturnValue(mockChain({ data: null, error: null }));

            const result = await profileService.list();
            expect(result).toEqual([]);
        });
    });

    describe('update()', () => {
        it('sends correct fields to Supabase', async () => {
            const chain = mockChain({ data: null, error: null });
            mockFrom.mockReturnValue(chain);

            await profileService.update('abc-123', {
                nombre_comercial: 'Test',
                ano_constitucion: '2015',
                num_socios_productoras: 'not-a-number',
            });

            expect(chain.update).toHaveBeenCalled();
            const updateArg = chain.update.mock.calls[0][0];
            expect(updateArg.nombre_comercial).toBe('Test');
            expect(updateArg.ano_constitucion).toBe(2015);
            expect(updateArg.num_socios_productoras).toBe(null); // NaN → null
        });
    });
});

// ─── formService ─────────────────────────────────────────────────────────────

describe('formService', () => {
    describe('load()', () => {
        it('returns answers when form exists', async () => {
            const fakeAnswers = { '1.1': 'Sí', '2.3': ['opt1', 'opt2'] };
            // Real code uses .limit(1) which returns an array, not .single()
            mockFrom.mockReturnValue(mockChain({ data: [{ answers: fakeAnswers }], error: null }));

            const result = await formService.load('user@test.com');
            expect(result).toEqual(fakeAnswers);
        });

        it('returns null when no form exists (empty array)', async () => {
            // Real code: .limit(1) returns empty array when no rows found
            mockFrom.mockReturnValue(mockChain({ data: [], error: null }));

            const result = await formService.load('newuser@test.com');
            expect(result).toBeNull();
        });

        it('throws on real errors', async () => {
            mockFrom.mockReturnValue(mockChain({
                data: null,
                error: { message: 'Connection failed', code: 'NETWORK' },
            }));

            await expect(formService.load('user@test.com')).rejects.toThrow('Error cargando formulario');
        });
    });

    describe('save()', () => {
        it('calls upsert with correct conflict key', async () => {
            const chain = mockChain({ data: null, error: null });
            mockFrom.mockReturnValue(chain);

            const answers = { '1.1': 'Yes' };
            await formService.save('user@test.com', answers);

            expect(mockFrom).toHaveBeenCalledWith('diagnostic_forms');
            expect(chain.upsert).toHaveBeenCalledWith(
                { user_email: 'user@test.com', answers },
                { onConflict: 'user_email' }
            );
        });
    });
});

// ─── teamService ─────────────────────────────────────────────────────────────

describe('teamService', () => {
    describe('listForCad()', () => {
        it('queries cad_users_mapping', async () => {
            const fakeMembers = [{ id: '1', user_email: 'a@test.com' }];
            mockFrom.mockReturnValue(mockChain({ data: fakeMembers, error: null }));

            const result = await teamService.listForCad('cad-123');

            expect(mockFrom).toHaveBeenCalledWith('cad_users_mapping');
            expect(result).toEqual(fakeMembers);
        });
    });

    describe('listAdmins()', () => {
        it('queries admin_users_mapping', async () => {
            mockFrom.mockReturnValue(mockChain({ data: [], error: null }));

            const result = await teamService.listAdmins();

            expect(mockFrom).toHaveBeenCalledWith('admin_users_mapping');
            expect(result).toEqual([]);
        });
    });

    describe('add()', () => {
        it('inserts into correct table based on isAdmin flag', async () => {
            const chain = mockChain({ data: { id: 'new-1' }, error: null });
            mockFrom.mockReturnValue(chain);

            // Admin member
            await teamService.add(true, { user_email: 'admin@test.com', nombre_persona: 'Admin' });
            expect(mockFrom).toHaveBeenCalledWith('admin_users_mapping');

            // CAD member
            mockFrom.mockClear();
            mockFrom.mockReturnValue(chain);
            await teamService.add(false, { user_email: 'cad@test.com' }, 'cad-123');
            expect(mockFrom).toHaveBeenCalledWith('cad_users_mapping');
        });
    });

    describe('remove()', () => {
        it('deletes from correct table', async () => {
            const chain = mockChain({ data: null, error: null });
            mockFrom.mockReturnValue(chain);

            await teamService.remove(true, 'member-id');
            expect(mockFrom).toHaveBeenCalledWith('admin_users_mapping');
            expect(chain.delete).toHaveBeenCalled();
        });
    });
});

// ─── storageService ──────────────────────────────────────────────────────────

describe('storageService', () => {
    describe('uploadLogo()', () => {
        it('uploads to cad_media bucket and returns public URL', async () => {
            const file = { name: 'logo.png' };
            const result = await storageService.uploadLogo('cad-123', file);

            expect(mockStorage.from).toHaveBeenCalledWith('cad_media');
            expect(result).toBe('https://cdn.example.com/logos/test.png');
        });
    });
});

// ─── Additional coverage for untested methods (Round 5) ─────────────────────

describe('profileService (extended)', () => {
    describe('create()', () => {
        it('inserts a new profile with default name', async () => {
            const chain = mockChain({ data: { id: 'new-id', nombre_comercial: 'Nueva Agrupación' }, error: null });
            mockFrom.mockReturnValue(chain);

            const result = await profileService.create();

            expect(mockFrom).toHaveBeenCalledWith('cad_profiles');
            expect(chain.insert).toHaveBeenCalledWith({ nombre_comercial: 'Nueva Agrupación' });
            expect(result.id).toBe('new-id');
        });

        it('throws on Supabase error', async () => {
            mockFrom.mockReturnValue(mockChain({ data: null, error: { message: 'Insert failed' } }));
            await expect(profileService.create('Test')).rejects.toThrow('Error creando perfil');
        });
    });

    describe('delete()', () => {
        it('deletes a profile by ID', async () => {
            const chain = mockChain({ data: null, error: null });
            mockFrom.mockReturnValue(chain);

            await profileService.delete('abc-123');

            expect(mockFrom).toHaveBeenCalledWith('cad_profiles');
            expect(chain.delete).toHaveBeenCalled();
            expect(chain.eq).toHaveBeenCalledWith('id', 'abc-123');
        });

        it('throws on Supabase error', async () => {
            mockFrom.mockReturnValue(mockChain({ data: null, error: { message: 'Delete failed' } }));
            await expect(profileService.delete('bad-id')).rejects.toThrow('Error eliminando perfil');
        });
    });

    describe('listForAdmin()', () => {
        it('fetches only the 4 slim columns', async () => {
            const chain = mockChain({ data: [{ id: '1', nombre_comercial: 'Ekoalde', territorio: 'Navarra', estado: 'active' }], error: null });
            mockFrom.mockReturnValue(chain);

            const result = await profileService.listForAdmin();

            expect(mockFrom).toHaveBeenCalledWith('cad_profiles');
            expect(chain.select).toHaveBeenCalledWith('id, nombre_comercial, territorio, estado');
            expect(result).toHaveLength(1);
        });
    });
});

describe('formService (extended)', () => {
    describe('getFormOwnerEmail()', () => {
        it('returns email from cad_users_mapping when available', async () => {
            const chain = mockChain({ data: [{ user_email: 'user@cad.org' }], error: null });
            mockFrom.mockReturnValue(chain);

            const result = await formService.getFormOwnerEmail('cad-123');

            expect(mockFrom).toHaveBeenCalledWith('cad_users_mapping');
            expect(result).toBe('user@cad.org');
        });
    });
});

describe('teamService (extended)', () => {
    describe('update()', () => {
        it('updates the correct table and fields', async () => {
            const chain = mockChain({ data: null, error: null });
            mockFrom.mockReturnValue(chain);

            await teamService.update(false, 'member-1', {
                nombre_persona: 'Updated Name',
                user_email: 'new@test.com',
                perfil_rol: 'Manager',
                telefono: '123456',
            });

            expect(mockFrom).toHaveBeenCalledWith('cad_users_mapping');
            expect(chain.update).toHaveBeenCalled();
            expect(chain.eq).toHaveBeenCalledWith('id', 'member-1');
        });

        it('throws on error', async () => {
            mockFrom.mockReturnValue(mockChain({ data: null, error: { message: 'Update failed' } }));
            await expect(teamService.update(true, 'id', {})).rejects.toThrow('Error actualizando miembro');
        });
    });

    describe('listForCad() error', () => {
        it('throws with Spanish error message', async () => {
            mockFrom.mockReturnValue(mockChain({ data: null, error: { message: 'Network error' } }));
            await expect(teamService.listForCad('cad-123')).rejects.toThrow('Error cargando equipo');
        });
    });
});

// ─── authService ─────────────────────────────────────────────────────────────

describe('authService', () => {
    describe('signIn()', () => {
        it('returns session data on successful login', async () => {
            const fakeData = { user: { id: 'u-1', email: 'test@cad.org' }, session: { access_token: 'tok-123' } };
            mockAuth.signInWithPassword.mockResolvedValue({ data: fakeData, error: null });

            const result = await authService.signIn('test@cad.org', 'password123');

            expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@cad.org',
                password: 'password123',
            });
            expect(result.user.email).toBe('test@cad.org');
            expect(result.session.access_token).toBe('tok-123');
        });

        it('throws on invalid credentials', async () => {
            mockAuth.signInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'Invalid login credentials' },
            });

            await expect(authService.signIn('bad@test.com', 'wrong'))
                .rejects.toThrow('Invalid login credentials');
        });
    });

    describe('getSession()', () => {
        it('returns the current session', async () => {
            const fakeSession = { access_token: 'tok-abc', user: { id: 'u-1' } };
            mockAuth.getSession.mockResolvedValue({
                data: { session: fakeSession },
                error: null,
            });

            const result = await authService.getSession();
            expect(result).toEqual(fakeSession);
        });

        it('throws on error', async () => {
            mockAuth.getSession.mockResolvedValue({
                data: { session: null },
                error: { message: 'Session expired' },
            });

            await expect(authService.getSession()).rejects.toThrow('Error obteniendo sesión');
        });
    });

    describe('getAccessToken()', () => {
        it('returns the access token string when session exists', async () => {
            mockAuth.getSession.mockResolvedValue({
                data: { session: { access_token: 'my-token' } },
                error: null,
            });

            const token = await authService.getAccessToken();
            expect(token).toBe('my-token');
        });

        it('returns null when no session exists', async () => {
            mockAuth.getSession.mockResolvedValue({
                data: { session: null },
                error: null,
            });

            const token = await authService.getAccessToken();
            expect(token).toBeNull();
        });
    });
});

// ─── Edge cases (Round 6) ───────────────────────────────────────────────────

describe('formService (edge cases)', () => {
    describe('getFormOwnerEmail()', () => {
        it('returns null when no mapping exists', async () => {
            mockFrom.mockReturnValue(mockChain({ data: [], error: null }));

            const result = await formService.getFormOwnerEmail('unmapped-cad');
            expect(result).toBeNull();
        });
    });

    describe('save()', () => {
        it('throws on Supabase error', async () => {
            mockFrom.mockReturnValue(mockChain({ data: null, error: { message: 'Write failed' } }));

            await expect(formService.save('user@test.com', { '1.1': 'Yes' }))
                .rejects.toThrow('Error guardando formulario');
        });
    });
});
