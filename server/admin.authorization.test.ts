import { describe, expect, it } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type UserRole = 'admin' | 'owner' | 'renter' | 'user';

function context(role: UserRole): TrpcContext {
  return {
    user: {
      id: role === 'admin' ? 1 : 2,
      openId: `${role}-user`,
      email: `${role}@example.com`,
      name: role,
      loginMethod: 'test',
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

describe('Admin authorization boundary', () => {
  it('rejects a renter from the admin overview', async () => {
    const caller = appRouter.createCaller(context('renter'));
    await expect(caller.admin.overview()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects a renter from the host availability mutation', async () => {
    const caller = appRouter.createCaller(context('renter'));
    await expect(caller.listings.setAvailability({ listingId: 1, blockedRanges: [] })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects an owner from the admin users endpoint', async () => {
    const caller = appRouter.createCaller(context('owner'));
    await expect(caller.admin.users()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('allows an admin to access the overview even when the database is unavailable', async () => {
    const caller = appRouter.createCaller(context('admin'));
    const result = await caller.admin.overview();
    expect(result.users).toBeGreaterThanOrEqual(0);
    expect(result.platformFees).toBeGreaterThanOrEqual(0);
    expect(result.listings).toBeGreaterThanOrEqual(0);
  });
});
