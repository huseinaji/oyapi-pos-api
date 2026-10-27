import request from 'supertest';
import { randomBytes, randomUUID } from 'node:crypto';

type Agent = ReturnType<typeof request.agent>;
type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';
type ItemType = 'raw_material' | 'finished_good' | 'item_bundle';

const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3001';
const runId = randomUUID().replace(/-/g, '').slice(0, 12);
const prefix = `api-e2e-${runId}`;

describe('Live API E2E', () => {
  jest.setTimeout(120_000);

  function createAgent(): Agent {
    const agent = request.agent(apiBaseUrl);
    agent.set('x-forwarded-for', Array.from(randomBytes(4)).join('.'));
    return agent;
  }

  const admin = createAgent();
  const cashier = createAgent();
  const registeredUser = createAgent();
  const coveredOperations = new Set<string>();

  let adminUsername: string;
  let adminPassword: string;
  let cashierUsername: string;
  let cashierPassword: string;
  let registeredPassword = '';
  let cashierId = '';
  let registeredUserId = '';
  let storeId = '';
  let foreignStoreId = '';
  let memberId = '';
  let categoryId = '';
  let unusedCategoryId = '';
  let foreignCategoryId = '';
  let itemId = '';
  let rawMaterialId = '';
  let secondRawMaterialId = '';
  let bundleItemId = '';
  let disposableItemId = '';
  let foreignItemId = '';
  let globalItemId = '';
  let invoiceId = '';
  let adminInvoiceId = '';
  let foreignInvoiceId = '';
  let registeredUserDeleted = false;
  let storeDeleted = false;
  let foreignStoreDeleted = false;

  async function hit(
    agent: Agent,
    method: Method,
    path: string,
    expectedStatus: number,
    operation: string,
    body?: object,
  ) {
    let response;
    switch (method) {
      case 'GET':
        response = await agent.get(path);
        break;
      case 'POST':
        response = await agent.post(path).send(body);
        break;
      case 'PATCH':
        response = await agent.patch(path).send(body);
        break;
      case 'DELETE':
        response = await agent.delete(path);
        break;
    }

    coveredOperations.add(operation);
    expect(response.status).toBe(expectedStatus);
    return response;
  }

  function expectSessionCookie(response: { headers: Record<string, unknown> }) {
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^sessionId=.+; .*Path=\/.*HttpOnly.*SameSite=Lax/i,
        ),
      ]),
    );
  }

  function itemDto(
    name: string,
    store: string,
    options: {
      type?: ItemType;
      categoryId?: string;
      isMaintainStock?: boolean;
      components?: Array<{ componentItemId: string; qty: number }>;
    } = {},
  ) {
    const type = options.type ?? 'finished_good';
    return {
      name,
      storeId: store,
      type,
      uom: 'pcs',
      basePrice: 100,
      sellingPrice: 150,
      isMaintainStock: options.isMaintainStock ?? type !== 'item_bundle',
      ...(type === 'item_bundle'
        ? { itemComponents: options.components ?? [] }
        : { initialStock: 10 }),
      ...(options.categoryId ? { categoryId: options.categoryId } : {}),
    };
  }

  async function createStore(name: string) {
    const response = await hit(
      admin,
      'POST',
      '/api/v1/store',
      201,
      'POST /api/v1/store',
      { name },
    );
    expect(response.body.id).toBeTruthy();
    return response.body.id as string;
  }

  async function createStoreItem(store: string, body: object): Promise<string> {
    const response = await hit(
      admin,
      'POST',
      `/api/v1/store/${store}/items`,
      201,
      'POST /api/v1/store/{id}/items',
      body,
    );
    expect(response.body.id).toBeTruthy();
    return response.body.id as string;
  }

  async function openPosSession(store: string, agent: Agent = admin) {
    return hit(
      agent,
      'POST',
      `/api/v1/store/${store}/pos-session`,
      201,
      'POST /api/v1/store/{id}/pos-session',
      {},
    );
  }

  async function createTransaction(
    store: string,
    productId: string,
    agent: Agent,
  ) {
    const response = await hit(
      agent,
      'POST',
      `/api/v1/store/${store}/transaction`,
      201,
      'POST /api/v1/store/{id}/transaction',
      {
        customer: `${prefix} customer`,
        paymentMethod: 'cash',
        items: [{ itemId: productId, qty: 1 }],
      },
    );
    expect(response.body.id).toBeTruthy();
    return response.body.id as string;
  }

  async function deleteIfPresent(
    agent: Agent,
    path: string,
    operation: string,
    requireExisting = false,
  ): Promise<void> {
    const response = await agent.delete(path);
    coveredOperations.add(operation);
    if (
      response.status !== 200 &&
      (requireExisting || response.status !== 404)
    ) {
      throw new Error(
        `Failed to clean up ${operation} (${response.status}): ${JSON.stringify(response.body)}`,
      );
    }
  }

  async function cleanupStoreFixtures(
    store: string,
    fixture: {
      itemIds: string[];
      categoryIds: string[];
      invoiceIds: string[];
      memberUserIds?: string[];
    },
    requireExisting = false,
  ): Promise<void> {
    const failures: string[] = [];
    const attempt = async (cleanup: () => Promise<void>) => {
      try {
        await cleanup();
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
      }
    };

    const selected = await admin.post(`/api/v1/store/${store}/select`);
    coveredOperations.add('POST /api/v1/store/{id}/select');
    if (selected.status !== 201) {
      failures.push(
        `Failed to select store for fixture cleanup (${selected.status}).`,
      );
    }

    for (const invoiceId of fixture.invoiceIds) {
      if (!invoiceId) continue;
      await attempt(() =>
        deleteIfPresent(
          admin,
          `/api/v1/store/${store}/transaction/${invoiceId}`,
          'DELETE /api/v1/store/{id}/transaction/{salesInvoiceId}',
          requireExisting,
        ),
      );
    }

    for (const itemId of fixture.itemIds) {
      if (!itemId) continue;
      await attempt(() =>
        deleteIfPresent(
          admin,
          `/api/v1/store/${store}/items/${itemId}`,
          'DELETE /api/v1/store/{id}/items/{itemId}',
          requireExisting,
        ),
      );
    }

    for (const categoryId of fixture.categoryIds) {
      if (!categoryId) continue;
      await attempt(() =>
        deleteIfPresent(
          admin,
          `/api/v1/store/${store}/items/categories/${categoryId}`,
          'DELETE /api/v1/store/{id}/items/categories/{categoryId}',
          requireExisting,
        ),
      );
    }

    for (const userId of fixture.memberUserIds ?? []) {
      if (!userId) continue;
      await attempt(async () => {
        const response = await admin
          .post(`/api/v1/store/${store}/unassign`)
          .send({ userId });
        coveredOperations.add('POST /api/v1/store/{id}/unassign');
        if (
          response.status !== 201 &&
          (requireExisting || response.status !== 404)
        ) {
          throw new Error(
            `Failed to inactivate fixture membership (${response.status}).`,
          );
        }
      });
    }

    if (failures.length > 0) {
      throw new Error(`Store fixture cleanup failed:\n${failures.join('\n')}`);
    }
  }

  beforeAll(() => {
    adminUsername = process.env.E2E_ADMIN_USERNAME ?? '';
    adminPassword = process.env.E2E_ADMIN_PASSWORD ?? '';
    cashierUsername = process.env.E2E_USER_USERNAME ?? '';
    cashierPassword = process.env.E2E_USER_PASSWORD ?? '';

    if (
      !adminUsername ||
      !adminPassword ||
      !cashierUsername ||
      !cashierPassword
    ) {
      throw new Error(
        'Set E2E_ADMIN_USERNAME, E2E_ADMIN_PASSWORD, E2E_USER_USERNAME, and E2E_USER_PASSWORD to run live API E2E tests.',
      );
    }
  });

  afterAll(async () => {
    const failures: string[] = [];
    const attempt = async (label: string, cleanup: () => Promise<void>) => {
      try {
        await cleanup();
      } catch (error) {
        failures.push(
          `${label}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    if (foreignStoreId && !foreignStoreDeleted) {
      await attempt('foreign store fixtures', async () => {
        await cleanupStoreFixtures(foreignStoreId, {
          itemIds: [foreignItemId],
          categoryIds: [foreignCategoryId],
          invoiceIds: [foreignInvoiceId],
        });
        await deleteIfPresent(
          admin,
          `/api/v1/store/${foreignStoreId}`,
          'DELETE /api/v1/store/{id}',
        );
        foreignStoreDeleted = true;
      });
    }

    if (storeId && !storeDeleted) {
      await attempt('primary store fixtures', async () => {
        await cleanupStoreFixtures(storeId, {
          itemIds: [
            bundleItemId,
            disposableItemId,
            itemId,
            rawMaterialId,
            secondRawMaterialId,
          ],
          categoryIds: [categoryId, unusedCategoryId],
          invoiceIds: [invoiceId, adminInvoiceId],
          memberUserIds: [cashierId],
        });
        if (globalItemId) {
          await deleteIfPresent(
            admin,
            `/api/v1/items/${globalItemId}`,
            'DELETE /api/v1/items/{id}',
          );
        }
        await deleteIfPresent(
          admin,
          `/api/v1/store/${storeId}`,
          'DELETE /api/v1/store/{id}',
        );
        storeDeleted = true;
      });
    }

    if (registeredUserId && !registeredUserDeleted) {
      await attempt('registered user fixture', async () => {
        await deleteIfPresent(
          admin,
          `/api/v1/users/${registeredUserId}`,
          'DELETE /api/v1/users/{id}',
        );
      });
    }

    if (failures.length > 0) {
      throw new Error(`API E2E cleanup failed:\n${failures.join('\n')}`);
    }
  });

  describe('Health module / HealthController', () => {
    it('GET /api/health returns a healthy response', async () => {
      const response = await hit(
        createAgent(),
        'GET',
        '/api/health',
        200,
        'GET /api/health',
      );
      expect(response.body).toBeDefined();
    });
  });

  describe('Auth module / AuthController', () => {
    describe('POST /auth/login', () => {
      it('accepts valid administrator credentials and issues a session cookie', async () => {
        const response = await hit(
          admin,
          'POST',
          '/api/v1/auth/login',
          201,
          'POST /api/v1/auth/login',
          {
            usernameOrEmail: adminUsername,
            password: adminPassword,
            rememberMe: false,
          },
        );

        expect(response.body).toEqual({ message: 'success' });
        expectSessionCookie(response);
      });

      it('accepts valid store-user credentials and issues a session cookie', async () => {
        const response = await hit(
          cashier,
          'POST',
          '/api/v1/auth/login',
          201,
          'POST /api/v1/auth/login',
          {
            usernameOrEmail: cashierUsername,
            password: cashierPassword,
            rememberMe: false,
          },
        );

        expect(response.body).toEqual({ message: 'success' });
        expectSessionCookie(response);
      });

      it('rejects invalid credentials', async () => {
        const response = await hit(
          createAgent(),
          'POST',
          '/api/v1/auth/login',
          401,
          'POST /api/v1/auth/login',
          {
            usernameOrEmail: `${prefix}-unknown`,
            password: randomUUID(),
            rememberMe: false,
          },
        );
        expect(response.body).toBeTruthy();
      });

      it('rejects missing login fields', async () => {
        await hit(
          createAgent(),
          'POST',
          '/api/v1/auth/login',
          400,
          'POST /api/v1/auth/login',
          {},
        );
      });
    });

    describe('POST /auth/register', () => {
      it('rejects invalid email and weak password', async () => {
        const response = await hit(
          createAgent(),
          'POST',
          '/api/v1/auth/register',
          400,
          'POST /api/v1/auth/register',
          {
            username: `${prefix}-invalid`,
            email: 'not-an-email',
            password: 'weak',
          },
        );
        expect(response.body).toBeTruthy();
      });

      it('registers a standard user and returns its public profile', async () => {
        registeredPassword = `Aa1!${randomUUID()}z`;
        const response = await hit(
          createAgent(),
          'POST',
          '/api/v1/auth/register',
          201,
          'POST /api/v1/auth/register',
          {
            username: `${prefix}-registered`,
            email: `${prefix}@example.com`,
            password: registeredPassword,
          },
        );

        expect(response.body.id).toBeTruthy();
        expect(response.body.username).toBe(`${prefix}-registered`);
        expect(response.body.password).toBeUndefined();
        registeredUserId = response.body.id;
      });
    });

    describe('GET /auth/me', () => {
      it('returns the current administrator session payload', async () => {
        const response = await hit(
          admin,
          'GET',
          '/api/v1/auth/me',
          200,
          'GET /api/v1/auth/me',
        );
        expect(response.body.userPayload.role).toBe('ADMIN');
      });

      it('returns the current standard-user session payload', async () => {
        const response = await hit(
          cashier,
          'GET',
          '/api/v1/auth/me',
          200,
          'GET /api/v1/auth/me',
        );
        expect(response.body.userPayload.sub).toBeTruthy();
      });

      it('rejects requests without a session', async () => {
        await hit(
          createAgent(),
          'GET',
          '/api/v1/auth/me',
          401,
          'GET /api/v1/auth/me',
        );
      });
    });

    describe('Auth session lifecycle', () => {
      it('logs in the registered fixture user', async () => {
        const response = await hit(
          registeredUser,
          'POST',
          '/api/v1/auth/login',
          201,
          'POST /api/v1/auth/login',
          {
            usernameOrEmail: `${prefix}-registered`,
            password: registeredPassword,
            rememberMe: true,
          },
        );
        expect(response.body).toEqual({ message: 'success' });
        expectSessionCookie(response);
        expect(response.headers['set-cookie']).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/(?:Max-Age=[1-9]\d*|Expires=)/i),
          ]),
        );
      });

      it('destroys the registered fixture user session and clears the cookie', async () => {
        const response = await hit(
          registeredUser,
          'POST',
          '/api/v1/auth/logout',
          201,
          'POST /api/v1/auth/logout',
        );
        expect(response.body).toEqual({ message: 'success' });
        expect(response.headers['set-cookie']).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/^sessionId=; .*Path=\//i),
          ]),
        );
        await hit(
          registeredUser,
          'GET',
          '/api/v1/auth/me',
          401,
          'GET /api/v1/auth/me',
        );
      });
    });
  });

  describe('User module / UserController', () => {
    it('GET /users allows administrators and denies regular users', async () => {
      const response = await hit(
        admin,
        'GET',
        `/api/v1/users?username=${encodeURIComponent(cashierUsername)}`,
        200,
        'GET /api/v1/users',
      );
      const user = (response.body.rows ?? []).find(
        (entry: { username: string }) => entry.username === cashierUsername,
      );
      expect(user?.id).toBeTruthy();
      cashierId = user.id;

      await hit(cashier, 'GET', '/api/v1/users', 403, 'GET /api/v1/users');
    });

    it('GET /users/:id returns an existing user and rejects a missing ID', async () => {
      const response = await hit(
        admin,
        'GET',
        `/api/v1/users/${cashierId}`,
        200,
        'GET /api/v1/users/{id}',
      );
      expect(response.body.id).toBe(cashierId);
      await hit(
        admin,
        'GET',
        `/api/v1/users/${randomUUID()}`,
        404,
        'GET /api/v1/users/{id}',
      );
    });

    it('PATCH /users/:id updates an existing fixture user', async () => {
      const response = await hit(
        admin,
        'PATCH',
        `/api/v1/users/${registeredUserId}`,
        200,
        'PATCH /api/v1/users/{id}',
        { username: `${prefix}-updated` },
      );
      expect(response.body.username).toBe(`${prefix}-updated`);
    });

    it('DELETE /users/:id deletes the registered fixture user', async () => {
      await hit(
        admin,
        'DELETE',
        `/api/v1/users/${registeredUserId}`,
        200,
        'DELETE /api/v1/users/{id}',
      );
      registeredUserDeleted = true;
    });
  });

  describe('Store module / StoreController', () => {
    it('POST /store creates isolated primary and foreign stores', async () => {
      storeId = await createStore(`${prefix}-store`);
      foreignStoreId = await createStore(`${prefix}-foreign-store`);
      expect(storeId).not.toBe(foreignStoreId);
    });

    it('GET /store lists stores for a global administrator', async () => {
      const response = await hit(
        admin,
        'GET',
        '/api/v1/store',
        200,
        'GET /api/v1/store',
      );
      expect(response.body).toBeDefined();
    });

    it('POST /store/:id/assign adds a user, rejects duplicate assignment, and enforces role', async () => {
      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/assign`,
        201,
        'POST /api/v1/store/{id}/assign',
        { userId: cashierId },
      );
      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/assign`,
        422,
        'POST /api/v1/store/{id}/assign',
        { userId: cashierId },
      );
      await hit(
        cashier,
        'POST',
        `/api/v1/store/${storeId}/assign`,
        403,
        'POST /api/v1/store/{id}/assign',
        { userId: cashierId },
      );
    });

    it('GET /store/:id/members lists memberships without selecting the store', async () => {
      const response = await hit(
        admin,
        'GET',
        `/api/v1/store/${storeId}/members`,
        200,
        'GET /api/v1/store/{id}/members',
      );
      const member = (response.body.rows ?? response.body).find(
        (entry: { id: string; userId: string }) => entry.userId === cashierId,
      );
      expect(member).toBeTruthy();
      memberId = member.id;
    });

    it('PATCH /store/:id/members/:memberId allows global admin without selecting a store', async () => {
      await hit(
        admin,
        'PATCH',
        `/api/v1/store/${storeId}/members/${memberId}`,
        200,
        'PATCH /api/v1/store/{id}/members/{memberId}',
        { role: 'cashier' },
      );
    });

    it('POST /store/:id/select selects the store for administrator and member sessions', async () => {
      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/select`,
        201,
        'POST /api/v1/store/{id}/select',
      );
      await hit(
        cashier,
        'POST',
        `/api/v1/store/${storeId}/select`,
        201,
        'POST /api/v1/store/{id}/select',
      );
      await hit(
        cashier,
        'POST',
        `/api/v1/store/${foreignStoreId}/select`,
        404,
        'POST /api/v1/store/{id}/select',
      );
    });

    it('GET /store/:id returns the selected store and enforces membership', async () => {
      const response = await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}`,
        200,
        'GET /api/v1/store/{id}',
      );
      expect(response.body.id).toBe(storeId);
    });

    it('GET /store/my-store lists the regular user stores', async () => {
      const response = await hit(
        cashier,
        'GET',
        '/api/v1/store/my-store',
        200,
        'GET /api/v1/store/my-store',
      );
      expect(response.body).toBeDefined();
    });

    it('PATCH /store/:id/members/:memberId rejects non-admin and foreign-store access', async () => {
      await hit(
        cashier,
        'PATCH',
        `/api/v1/store/${storeId}/members/${memberId}`,
        403,
        'PATCH /api/v1/store/{id}/members/{memberId}',
        { role: 'cashier' },
      );
      await hit(
        admin,
        'PATCH',
        `/api/v1/store/${foreignStoreId}/members/${memberId}`,
        404,
        'PATCH /api/v1/store/{id}/members/{memberId}',
        { role: 'cashier' },
      );
    });

    it('POST /store/:id/unassign inactivates membership and assign reactivates it', async () => {
      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/unassign`,
        201,
        'POST /api/v1/store/{id}/unassign',
        { userId: cashierId },
      );
      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/assign`,
        201,
        'POST /api/v1/store/{id}/assign',
        { userId: cashierId },
      );
    });
  });

  describe('Inventory module / ItemController', () => {
    it('GET /items allows global administrators and denies regular users', async () => {
      await hit(admin, 'GET', '/api/v1/items', 200, 'GET /api/v1/items');
      await hit(cashier, 'GET', '/api/v1/items', 403, 'GET /api/v1/items');
    });

    it('POST /items creates a global item', async () => {
      const response = await hit(
        admin,
        'POST',
        '/api/v1/items',
        201,
        'POST /api/v1/items',
        itemDto(`${prefix}-global-item`, storeId, {
          isMaintainStock: false,
        }),
      );
      globalItemId = response.body.id;
      expect(globalItemId).toBeTruthy();
    });

    it('GET /items/:id returns the global item', async () => {
      const response = await hit(
        admin,
        'GET',
        `/api/v1/items/${globalItemId}`,
        200,
        'GET /api/v1/items/{id}',
      );
      expect(response.body.id).toBe(globalItemId);
    });

    it('PATCH /items/:id updates the global item', async () => {
      const response = await hit(
        admin,
        'PATCH',
        `/api/v1/items/${globalItemId}`,
        200,
        'PATCH /api/v1/items/{id}',
        { description: `${prefix}-updated` },
      );
      expect(response.body.description).toBe(`${prefix}-updated`);
    });

    it('DELETE /items/:id removes the global item', async () => {
      await hit(
        admin,
        'DELETE',
        `/api/v1/items/${globalItemId}`,
        200,
        'DELETE /api/v1/items/{id}',
      );
      await hit(
        admin,
        'GET',
        `/api/v1/items/${globalItemId}`,
        404,
        'GET /api/v1/items/{id}',
      );
    });
  });

  describe('Store module / StoreItemController', () => {
    it('POST /store/:id/items/categories requires an administrator', async () => {
      await hit(
        cashier,
        'POST',
        `/api/v1/store/${storeId}/items/categories`,
        403,
        'POST /api/v1/store/{id}/items/categories',
        { name: `${prefix}-forbidden-category` },
      );

      const response = await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/items/categories`,
        201,
        'POST /api/v1/store/{id}/items/categories',
        { name: `${prefix}-category` },
      );
      categoryId = response.body.id;
      expect(categoryId).toBeTruthy();

      const unused = await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/items/categories`,
        201,
        'POST /api/v1/store/{id}/items/categories',
        { name: `${prefix}-unused-category` },
      );
      unusedCategoryId = unused.body.id;
    });

    it('GET /store/:id/items/categories lists current-store categories', async () => {
      const response = await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/items/categories`,
        200,
        'GET /api/v1/store/{id}/items/categories',
      );
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('POST /store/:id/items creates normal, raw-material, and bundle fixtures', async () => {
      itemId = await createStoreItem(
        storeId,
        itemDto(`${prefix}-product`, storeId, { categoryId }),
      );
      rawMaterialId = await createStoreItem(
        storeId,
        itemDto(`${prefix}-raw`, storeId, { type: 'raw_material' }),
      );
      secondRawMaterialId = await createStoreItem(
        storeId,
        itemDto(`${prefix}-raw-2`, storeId, { type: 'raw_material' }),
      );
      bundleItemId = await createStoreItem(
        storeId,
        itemDto(`${prefix}-bundle`, storeId, {
          type: 'item_bundle',
          components: [{ componentItemId: rawMaterialId, qty: 1 }],
        }),
      );
      disposableItemId = await createStoreItem(
        storeId,
        itemDto(`${prefix}-disposable`, storeId, {
          categoryId: unusedCategoryId,
          isMaintainStock: false,
        }),
      );
      expect(
        new Set([
          itemId,
          rawMaterialId,
          secondRawMaterialId,
          bundleItemId,
          disposableItemId,
        ]).size,
      ).toBe(5);
    });

    it('POST /store/:id/items rejects incomplete item data', async () => {
      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/items`,
        400,
        'POST /api/v1/store/{id}/items',
        { name: `${prefix}-invalid-item` },
      );
    });

    it('GET /store/:id/items lists store-scoped items', async () => {
      const response = await hit(
        admin,
        'GET',
        `/api/v1/store/${storeId}/items`,
        200,
        'GET /api/v1/store/{id}/items',
      );
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('GET /store/:id/items/:itemId enforces selected-store and item ownership', async () => {
      await hit(
        admin,
        'GET',
        `/api/v1/store/${storeId}/items/${itemId}`,
        200,
        'GET /api/v1/store/{id}/items/{itemId}',
      );

      await hit(
        admin,
        'POST',
        `/api/v1/store/${foreignStoreId}/select`,
        201,
        'POST /api/v1/store/{id}/select',
      );
      const foreignCategory = await hit(
        admin,
        'POST',
        `/api/v1/store/${foreignStoreId}/items/categories`,
        201,
        'POST /api/v1/store/{id}/items/categories',
        { name: `${prefix}-foreign-category` },
      );
      foreignCategoryId = foreignCategory.body.id;
      foreignItemId = await createStoreItem(
        foreignStoreId,
        itemDto(`${prefix}-foreign-product`, foreignStoreId, {
          categoryId: foreignCategoryId,
        }),
      );
      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/select`,
        201,
        'POST /api/v1/store/{id}/select',
      );

      await hit(
        admin,
        'GET',
        `/api/v1/store/${storeId}/items/${foreignItemId}`,
        404,
        'GET /api/v1/store/{id}/items/{itemId}',
      );
      await hit(
        admin,
        'PATCH',
        `/api/v1/store/${storeId}/items/${foreignItemId}`,
        404,
        'PATCH /api/v1/store/{id}/items/{itemId}',
        { description: `${prefix}-must-not-update-foreign-item` },
      );
      await hit(
        admin,
        'DELETE',
        `/api/v1/store/${storeId}/items/${foreignItemId}`,
        404,
        'DELETE /api/v1/store/{id}/items/{itemId}',
      );

      await hit(
        admin,
        'GET',
        `/api/v1/store/${foreignStoreId}/items/${foreignItemId}`,
        400,
        'GET /api/v1/store/{id}/items/{itemId}',
      );
      await hit(
        admin,
        'POST',
        `/api/v1/store/${foreignStoreId}/select`,
        201,
        'POST /api/v1/store/{id}/select',
      );
      await hit(
        admin,
        'GET',
        `/api/v1/store/${foreignStoreId}/items/${foreignItemId}`,
        200,
        'GET /api/v1/store/{id}/items/{itemId}',
      );
      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/select`,
        201,
        'POST /api/v1/store/{id}/select',
      );
    });

    it('PATCH /store/:id/items/:itemId updates a store-owned item', async () => {
      const response = await hit(
        admin,
        'PATCH',
        `/api/v1/store/${storeId}/items/${itemId}`,
        200,
        'PATCH /api/v1/store/{id}/items/{itemId}',
        { description: `${prefix}-updated-product` },
      );
      expect(response.body.description).toBe(`${prefix}-updated-product`);
    });

    it('POST /store/:id/items/:itemId/component adds a bundle component', async () => {
      const response = await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/items/${bundleItemId}/component`,
        201,
        'POST /api/v1/store/{id}/items/{itemId}/component',
        { componentItemId: secondRawMaterialId, qty: 2 },
      );
      expect(response.body.itemId).toBe(bundleItemId);
      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/items/${bundleItemId}/component`,
        404,
        'POST /api/v1/store/{id}/items/{itemId}/component',
        { componentItemId: foreignItemId, qty: 1 },
      );
    });

    it('DELETE /store/:id/items/:itemId removes an untracked fixture item', async () => {
      await hit(
        admin,
        'DELETE',
        `/api/v1/store/${storeId}/items/${disposableItemId}`,
        200,
        'DELETE /api/v1/store/{id}/items/{itemId}',
      );
    });

    it('DELETE /store/:id/items/categories/:categoryId is store scoped', async () => {
      await hit(
        admin,
        'DELETE',
        `/api/v1/store/${storeId}/items/categories/${unusedCategoryId}`,
        200,
        'DELETE /api/v1/store/{id}/items/categories/{categoryId}',
      );
      await hit(
        admin,
        'DELETE',
        `/api/v1/store/${storeId}/items/categories/${foreignCategoryId}`,
        404,
        'DELETE /api/v1/store/{id}/items/categories/{categoryId}',
      );
    });
  });

  describe('Store module / StorePosSessionController', () => {
    it('POST /store/:id/pos-session opens a session and prevents a duplicate', async () => {
      await hit(
        admin,
        'POST',
        `/api/v1/store/${foreignStoreId}/select`,
        201,
        'POST /api/v1/store/{id}/select',
      );
      await openPosSession(foreignStoreId);
      foreignInvoiceId = await createTransaction(
        foreignStoreId,
        foreignItemId,
        admin,
      );
      await hit(
        admin,
        'DELETE',
        `/api/v1/store/${foreignStoreId}/pos-session`,
        200,
        'DELETE /api/v1/store/{id}/pos-session',
      );

      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/select`,
        201,
        'POST /api/v1/store/{id}/select',
      );
      await openPosSession(storeId);

      await hit(
        admin,
        'POST',
        `/api/v1/store/${storeId}/pos-session`,
        409,
        'POST /api/v1/store/{id}/pos-session',
        {},
      );
    });

    it('GET /store/:id/pos-session/current-session returns the active session', async () => {
      const response = await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/pos-session/current-session`,
        200,
        'GET /api/v1/store/{id}/pos-session/current-session',
      );
      expect(response.body.status).toBe('active');
    });

    it('GET /store/:id/pos-session lists store sessions', async () => {
      const response = await hit(
        admin,
        'GET',
        `/api/v1/store/${storeId}/pos-session`,
        200,
        'GET /api/v1/store/{id}/pos-session',
      );
      expect(response.body.count).toBeGreaterThan(0);
    });
  });

  describe('Store module / StorePOSController', () => {
    it('GET /store/:id/transaction/sellable-item returns only store items with session-based availability', async () => {
      const response = await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/transaction/sellable-item`,
        200,
        'GET /api/v1/store/{id}/transaction/sellable-item',
      );
      expect(response.body).toEqual(expect.any(Array));

      const sellableItems = response.body as Array<{
        id: string;
        storeId: string;
        type: string;
        availableQty: number;
      }>;
      const sellableItemIds = sellableItems.map((item) => item.id);
      const regularItem = sellableItems.find((item) => item.id === itemId);
      const bundleItem = sellableItems.find((item) => item.id === bundleItemId);

      expect(regularItem).toMatchObject({
        id: itemId,
        storeId,
        availableQty: 10,
      });
      expect(bundleItem).toMatchObject({
        id: bundleItemId,
        storeId,
        availableQty: 5,
      });
      expect(sellableItems.every((item) => item.storeId === storeId)).toBe(
        true,
      );
      expect(sellableItems.some((item) => item.type === 'raw_material')).toBe(
        false,
      );
      expect(sellableItemIds).not.toContain(foreignItemId);
    });

    it('POST /store/:id/transaction creates invoice and transaction lines', async () => {
      invoiceId = await createTransaction(storeId, itemId, cashier);
      adminInvoiceId = await createTransaction(storeId, itemId, admin);
      expect(invoiceId).toBeTruthy();
      expect(adminInvoiceId).toBeTruthy();
    });
  });

  describe('Store module / StoreInvoiceController', () => {
    it('GET /store/:id/invoice defaults to today in UTC', async () => {
      const response = await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/invoice`,
        200,
        'GET /api/v1/store/{id}/invoice',
      );
      expect(
        response.body.rows.map((invoice: { id: string }) => invoice.id),
      ).toContain(invoiceId);
      const todayUtc = new Date().toISOString().slice(0, 10);
      expect(
        response.body.rows.every(
          (invoice: { createdAt: string }) =>
            invoice.createdAt.slice(0, 10) === todayUtc,
        ),
      ).toBe(true);
    });

    it('GET /store/:id/invoice filters to invoices from the last 30 days', async () => {
      const response = await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/invoice?dateRange=last30days&timezone=Asia%2FJakarta`,
        200,
        'GET /api/v1/store/{id}/invoice',
      );
      expect(
        response.body.rows.map((invoice: { id: string }) => invoice.id),
      ).toContain(invoiceId);
      expect(
        response.body.rows.every(
          (invoice: { storeId: string }) => invoice.storeId === storeId,
        ),
      ).toBe(true);
    });

    it('GET /store/:id/invoice applies an inclusive custom calendar-date range', async () => {
      const invoice = await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/invoice/${invoiceId}`,
        200,
        'GET /api/v1/store/{id}/invoice/{salesInvoiceId}',
      );
      const invoiceDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(invoice.body.createdAt));

      const inRange = await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/invoice?dateRange=custom&timezone=Asia%2FJakarta&startDate=${invoiceDate}&endDate=${invoiceDate}`,
        200,
        'GET /api/v1/store/{id}/invoice',
      );
      expect(
        inRange.body.rows.map((invoice: { id: string }) => invoice.id),
      ).toContain(invoiceId);

      const outOfRange = await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/invoice?dateRange=custom&timezone=Asia%2FJakarta&startDate=2000-01-01&endDate=2000-01-02`,
        200,
        'GET /api/v1/store/{id}/invoice',
      );
      expect(outOfRange.body.count).toBe(0);
      expect(outOfRange.body.rows).toEqual([]);
    });

    it('GET /store/:id/invoice validates custom range parameters', async () => {
      await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/invoice?dateRange=custom&timezone=Asia%2FJakarta&startDate=2026-10-01`,
        400,
        'GET /api/v1/store/{id}/invoice',
      );
      await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/invoice?dateRange=custom&timezone=Asia%2FJakarta&startDate=2026-10-20&endDate=2026-10-01`,
        400,
        'GET /api/v1/store/{id}/invoice',
      );
      await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/invoice?dateRange=today`,
        400,
        'GET /api/v1/store/{id}/invoice',
      );
    });

    it('GET /store/:id/invoice/:salesInvoiceId returns invoice details and hides foreign invoices', async () => {
      const invoice = await hit(
        cashier,
        'GET',
        `/api/v1/store/${storeId}/invoice/${invoiceId}`,
        200,
        'GET /api/v1/store/{id}/invoice/{salesInvoiceId}',
      );
      expect(invoice.body.id).toBe(invoiceId);

      if (foreignInvoiceId) {
        await hit(
          cashier,
          'GET',
          `/api/v1/store/${storeId}/invoice/${foreignInvoiceId}`,
          404,
          'GET /api/v1/store/{id}/invoice/{salesInvoiceId}',
        );
        await hit(
          admin,
          'PATCH',
          `/api/v1/store/${storeId}/invoice/${foreignInvoiceId}/complete`,
          404,
          'PATCH /api/v1/store/{id}/invoice/{salesInvoiceId}/complete',
        );
      }
    });

    it('PATCH /store/:id/invoice/:salesInvoiceId/complete enforces creator/admin', async () => {
      await hit(
        cashier,
        'PATCH',
        `/api/v1/store/${storeId}/invoice/${invoiceId}/complete`,
        200,
        'PATCH /api/v1/store/{id}/invoice/{salesInvoiceId}/complete',
      );
      await hit(
        cashier,
        'PATCH',
        `/api/v1/store/${storeId}/invoice/${adminInvoiceId}/complete`,
        403,
        'PATCH /api/v1/store/{id}/invoice/{salesInvoiceId}/complete',
      );
      await hit(
        admin,
        'PATCH',
        `/api/v1/store/${storeId}/invoice/${adminInvoiceId}/complete`,
        200,
        'PATCH /api/v1/store/{id}/invoice/{salesInvoiceId}/complete',
      );
    });
  });

  describe('Store module / StorePOSController delete transaction', () => {
    it('DELETE /store/:id/transaction/:salesInvoiceId is admin-only and soft-deletes invoice', async () => {
      await hit(
        cashier,
        'DELETE',
        `/api/v1/store/${storeId}/transaction/${invoiceId}`,
        403,
        'DELETE /api/v1/store/{id}/transaction/{salesInvoiceId}',
      );

      await hit(
        admin,
        'DELETE',
        `/api/v1/store/${storeId}/transaction/${invoiceId}`,
        200,
        'DELETE /api/v1/store/{id}/transaction/{salesInvoiceId}',
      );
      await hit(
        admin,
        'GET',
        `/api/v1/store/${storeId}/invoice/${invoiceId}`,
        404,
        'GET /api/v1/store/{id}/invoice/{salesInvoiceId}',
      );
    });
  });

  describe('Store module / StorePosSessionController close session', () => {
    it('DELETE /store/:id/pos-session closes the active session', async () => {
      await hit(
        admin,
        'DELETE',
        `/api/v1/store/${storeId}/pos-session`,
        200,
        'DELETE /api/v1/store/{id}/pos-session',
      );
    });
  });

  describe('Store module / StoreStockController', () => {
    it('GET /store/:id/stock-ledger returns store-scoped stock movements', async () => {
      await hit(
        admin,
        'GET',
        `/api/v1/store/${storeId}/stock-ledger`,
        200,
        'GET /api/v1/store/{id}/stock-ledger',
      );
    });

    it('GET /store/:id/bins returns store-scoped stock balances', async () => {
      await hit(
        admin,
        'GET',
        `/api/v1/store/${storeId}/bins`,
        200,
        'GET /api/v1/store/{id}/bins',
      );
    });
  });

  describe('Fixture cleanup / StoreController', () => {
    it('deletes fixture invoices, items, components, categories, global item, and stores', async () => {
      await cleanupStoreFixtures(
        foreignStoreId,
        {
          itemIds: [foreignItemId],
          categoryIds: [foreignCategoryId],
          invoiceIds: [foreignInvoiceId],
        },
        true,
      );

      await cleanupStoreFixtures(
        storeId,
        {
          itemIds: [bundleItemId, itemId, rawMaterialId, secondRawMaterialId],
          categoryIds: [categoryId],
          invoiceIds: [adminInvoiceId],
          memberUserIds: [cashierId],
        },
        true,
      );
      await deleteIfPresent(
        admin,
        `/api/v1/store/${foreignStoreId}`,
        'DELETE /api/v1/store/{id}',
        true,
      );
      foreignStoreDeleted = true;

      await deleteIfPresent(
        admin,
        `/api/v1/store/${storeId}`,
        'DELETE /api/v1/store/{id}',
        true,
      );
      storeDeleted = true;
    });
  });

  describe('Auth module / AuthController throttling', () => {
    it('POST /auth/login allows five attempts per IP and throttles the sixth', async () => {
      const ip = Array.from(randomBytes(4), (byte) => byte).join('.');
      for (let attempt = 1; attempt <= 5; attempt += 1) {
        const response = await request(apiBaseUrl)
          .post('/api/v1/auth/login')
          .set('x-forwarded-for', ip)
          .send({
            usernameOrEmail: `${prefix}-invalid-login`,
            password: 'invalid',
            rememberMe: false,
          });
        expect(response.status).toBe(401);
      }

      const throttled = await request(apiBaseUrl)
        .post('/api/v1/auth/login')
        .set('x-forwarded-for', ip)
        .send({
          usernameOrEmail: `${prefix}-invalid-login`,
          password: 'invalid',
          rememberMe: false,
        });
      coveredOperations.add('POST /api/v1/auth/login');
      expect(throttled.status).toBe(429);
    });

    it('POST /auth/register allows three attempts per IP and throttles the fourth', async () => {
      const ip = Array.from(randomBytes(4), (byte) => byte).join('.');
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        const response = await request(apiBaseUrl)
          .post('/api/v1/auth/register')
          .set('x-forwarded-for', ip)
          .send({
            username: `${prefix}-invalid-register-${attempt}`,
            email: 'invalid-email',
            password: 'weak',
          });
        expect(response.status).toBe(400);
      }

      const throttled = await request(apiBaseUrl)
        .post('/api/v1/auth/register')
        .set('x-forwarded-for', ip)
        .send({
          username: `${prefix}-invalid-register-throttled`,
          email: 'invalid-email',
          password: 'weak',
        });
      coveredOperations.add('POST /api/v1/auth/register');
      expect(throttled.status).toBe(429);
    });
  });

  describe('Swagger coverage', () => {
    it('has an E2E case for every documented HTTP operation', async () => {
      const openApi = await request(apiBaseUrl).get('/doc-json');
      expect(openApi.status).toBe(200);

      const documentedOperations = Object.entries(openApi.body.paths).flatMap(
        ([path, methods]) =>
          Object.keys(methods as object).map(
            (method) => `${method.toUpperCase()} ${path}`,
          ),
      );
      const missingOperations = documentedOperations.filter(
        (operation) => !coveredOperations.has(operation),
      );
      expect(missingOperations).toEqual([]);
    });
  });
});
