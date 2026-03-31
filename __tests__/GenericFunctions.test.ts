import { describe, it, expect, vi, beforeEach } from 'vitest';
import { banksyncApiRequest } from '../nodes/BankSync/GenericFunctions';
import banksFixture from './fixtures/banks.json';

function createMockContext(httpResponse: unknown, statusCode?: number) {
  const mockContext = {
    getCredentials: vi.fn().mockResolvedValue({
      apiKey: 'bsk_test_key_1234567890',
      baseUrl: 'https://api.banksync.io',
    }),
    helpers: {
      httpRequest: vi.fn(),
    },
    getNode: vi.fn().mockReturnValue({ name: 'BankSync', type: 'bankSync' }),
  };

  if (statusCode && statusCode >= 400) {
    mockContext.helpers.httpRequest.mockRejectedValue({
      statusCode,
      response: { body: httpResponse },
    });
  } else {
    mockContext.helpers.httpRequest.mockResolvedValue(httpResponse);
  }

  return mockContext;
}

describe('banksyncApiRequest', () => {
  it('should make a GET request and unwrap data', async () => {
    const ctx = createMockContext(banksFixture);
    const result = await banksyncApiRequest.call(ctx as any, 'GET', '/v1/banks');

    expect(ctx.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.banksync.io/v1/banks',
        headers: expect.objectContaining({
          'X-API-Key': 'bsk_test_key_1234567890',
        }),
      }),
    );
    expect(result).toEqual(banksFixture.data);
  });

  it('should include query string parameters', async () => {
    const ctx = createMockContext({ success: true, data: [] });
    await banksyncApiRequest.call(ctx as any, 'GET', '/v1/feeds/feed_001/jobs', undefined, {
      limit: 10,
      status: 'completed',
    });

    expect(ctx.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        qs: { limit: 10, status: 'completed' },
      }),
    );
  });

  it('should include request body for POST', async () => {
    const ctx = createMockContext({ success: true, data: { id: 'feed_new' } });
    await banksyncApiRequest.call(ctx as any, 'POST', '/v1/feeds', {
      name: 'Test Feed',
      source: 'sync',
      dataType: 'transactions',
    });

    expect(ctx.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        body: { name: 'Test Feed', source: 'sync', dataType: 'transactions' },
      }),
    );
  });

  it('should throw NodeApiError on 401', async () => {
    const ctx = createMockContext({ error: 'Unauthorized' }, 401);
    await expect(banksyncApiRequest.call(ctx as any, 'GET', '/v1/banks')).rejects.toThrow();
  });

  it('should throw NodeApiError on 403', async () => {
    const ctx = createMockContext({ error: 'Forbidden' }, 403);
    await expect(banksyncApiRequest.call(ctx as any, 'GET', '/v1/banks')).rejects.toThrow();
  });

  it('should throw NodeApiError on 404', async () => {
    const ctx = createMockContext({ error: 'Not found' }, 404);
    await expect(
      banksyncApiRequest.call(ctx as any, 'GET', '/v1/banks/bank_999'),
    ).rejects.toThrow();
  });

  it('should throw conflict error on 409 for sync', async () => {
    const ctx = createMockContext({ error: 'Already running' }, 409);
    await expect(
      banksyncApiRequest.call(ctx as any, 'POST', '/v1/feeds/feed_001/sync'),
    ).rejects.toThrow();
  });

  it('should format 422 validation errors', async () => {
    const ctx = createMockContext(
      {
        error: 'Validation failed',
        errors: ['name is required'],
        warnings: ['deprecated field'],
      },
      422,
    );
    await expect(banksyncApiRequest.call(ctx as any, 'POST', '/v1/feeds')).rejects.toThrow();
  });

  it('should use custom baseUrl from credentials', async () => {
    const ctx = createMockContext({ success: true, data: [] });
    ctx.getCredentials.mockResolvedValue({
      apiKey: 'bsk_test',
      baseUrl: 'https://staging.banksync.io',
    });

    await banksyncApiRequest.call(ctx as any, 'GET', '/v1/banks');

    expect(ctx.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://staging.banksync.io/v1/banks',
      }),
    );
  });
});
