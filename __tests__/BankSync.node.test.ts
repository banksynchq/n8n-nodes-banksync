import { describe, it, expect, vi, beforeEach } from 'vitest';

import banksFixture from './fixtures/banks.json';
import accountsFixture from './fixtures/accounts.json';
import transactionsFixture from './fixtures/transactions.json';
import feedsFixture from './fixtures/feeds.json';
import jobsFixture from './fixtures/jobs.json';
import enrichmentsFixture from './fixtures/enrichments.json';

// Mock the generic functions module
vi.mock('../nodes/BankSync/GenericFunctions', () => ({
  banksyncApiRequest: vi.fn(),
  banksyncApiRequestAllTransactions: vi.fn(),
}));

import {
  banksyncApiRequest,
  banksyncApiRequestAllTransactions,
} from '../nodes/BankSync/GenericFunctions';
const mockApiRequest = vi.mocked(banksyncApiRequest);
const mockApiRequestAll = vi.mocked(banksyncApiRequestAllTransactions);

function createMockExecuteFunctions(
  resource: string,
  operation: string,
  params: Record<string, unknown> = {},
) {
  return {
    getInputData: vi.fn().mockReturnValue([{ json: {} }]),
    getNodeParameter: vi.fn().mockImplementation((name: string, _index: number) => {
      if (name === 'resource') return resource;
      if (name === 'operation') return operation;
      return params[name] ?? {};
    }),
    getCredentials: vi.fn().mockResolvedValue({
      apiKey: 'bsk_test',
      baseUrl: 'https://api.banksync.io',
    }),
    getNode: vi.fn().mockReturnValue({ name: 'BankSync' }),
    helpers: {
      constructExecutionMetaData: vi.fn().mockImplementation((data) => data),
      returnJsonArray: vi
        .fn()
        .mockImplementation((data) =>
          Array.isArray(data)
            ? data.map((d: Record<string, unknown>) => ({ json: d }))
            : [{ json: data }],
        ),
      httpRequest: vi.fn(),
    },
    continueOnFail: vi.fn().mockReturnValue(false),
  };
}

describe('BankSync Node Execute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bank resource', () => {
    it('should list banks', async () => {
      mockApiRequest.mockResolvedValue(banksFixture.data as any);
      const ctx = createMockExecuteFunctions('bank', 'list');

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      const result = await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('GET', '/v1/banks');
      expect(result[0]).toHaveLength(2);
    });

    it('should get a bank', async () => {
      mockApiRequest.mockResolvedValue(banksFixture.data[0] as any);
      const ctx = createMockExecuteFunctions('bank', 'get', {
        bankId: { value: 'bank_001' },
      });

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('GET', '/v1/banks/bank_001');
    });

    it('should delete a bank', async () => {
      mockApiRequest.mockResolvedValue({} as any);
      const ctx = createMockExecuteFunctions('bank', 'delete', {
        bankId: { value: 'bank_001' },
      });

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('DELETE', '/v1/banks/bank_001');
    });
  });

  describe('Account resource', () => {
    it('should list accounts for a bank', async () => {
      mockApiRequest.mockResolvedValue(accountsFixture.data as any);
      const ctx = createMockExecuteFunctions('account', 'list', {
        bankId: { value: 'bank_001' },
      });

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('GET', '/v1/banks/bank_001/accounts');
    });
  });

  describe('Transaction resource', () => {
    it('should list transactions with date filters', async () => {
      mockApiRequest.mockResolvedValue(transactionsFixture.data as any);
      const ctx = createMockExecuteFunctions('transaction', 'list', {
        bankId: { value: 'bank_001' },
        accountId: { value: 'acc_001' },
        returnAll: false,
        additionalFields: { from: '2025-03-01', to: '2025-03-31' },
      });

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith(
        'GET',
        '/v1/banks/bank_001/accounts/acc_001/transactions',
        undefined,
        { from: '2025-03-01', to: '2025-03-31' },
      );
    });

    it('should return all transactions when returnAll is true', async () => {
      mockApiRequestAll.mockResolvedValue(transactionsFixture.data as any);
      const ctx = createMockExecuteFunctions('transaction', 'list', {
        bankId: { value: 'bank_001' },
        accountId: { value: 'acc_001' },
        returnAll: true,
        additionalFields: {},
      });

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequestAll).toHaveBeenCalledWith('bank_001', 'acc_001', {});
    });
  });

  describe('Feed resource', () => {
    it('should create a feed', async () => {
      mockApiRequest.mockResolvedValue(feedsFixture.data[0] as any);
      const ctx = createMockExecuteFunctions('feed', 'create', {
        name: 'New Feed',
        source: 'sync',
        dataType: 'transactions',
        additionalFields: {},
      });

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('POST', '/v1/feeds', {
        name: 'New Feed',
        source: 'sync',
        dataType: 'transactions',
      });
    });

    it('should trigger a sync', async () => {
      mockApiRequest.mockResolvedValue(jobsFixture.data[0] as any);
      const ctx = createMockExecuteFunctions('feed', 'sync', {
        feedId: { value: 'feed_001' },
        syncOptions: {},
      });

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('POST', '/v1/feeds/feed_001/sync', {});
    });
  });

  describe('Job resource', () => {
    it('should list jobs with status filter', async () => {
      mockApiRequest.mockResolvedValue(jobsFixture.data as any);
      const ctx = createMockExecuteFunctions('job', 'list', {
        feedId: { value: 'feed_001' },
        additionalFields: { limit: 10, status: 'completed' },
      });

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('GET', '/v1/feeds/feed_001/jobs', undefined, {
        limit: 10,
        status: 'completed',
      });
    });

    it('should cancel a job', async () => {
      mockApiRequest.mockResolvedValue(jobsFixture.data[0] as any);
      const ctx = createMockExecuteFunctions('job', 'cancel', {
        feedId: { value: 'feed_001' },
        jobId: 'job_001',
      });

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('DELETE', '/v1/feeds/feed_001/jobs/job_001');
    });
  });

  describe('Enrichment resource', () => {
    it('should list enrichments', async () => {
      mockApiRequest.mockResolvedValue(enrichmentsFixture.data as any);
      const ctx = createMockExecuteFunctions('enrichment', 'list');

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('GET', '/v1/enrichments');
    });

    it('should preview enrichments', async () => {
      mockApiRequest.mockResolvedValue({ records: [], summary: {} } as any);
      const ctx = createMockExecuteFunctions('enrichment', 'preview', {
        feedId: { value: 'feed_001' },
        records: '[{"description": "STARBUCKS", "amount": -5.75}]',
      });

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      await node.execute.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('POST', '/v1/feeds/feed_001/enrich/preview', {
        records: [{ description: 'STARBUCKS', amount: -5.75 }],
      });
    });
  });

  describe('Error handling', () => {
    it('should continue on fail when configured', async () => {
      mockApiRequest.mockRejectedValue(new Error('API Error'));
      const ctx = createMockExecuteFunctions('bank', 'list');
      ctx.continueOnFail.mockReturnValue(true);

      const { BankSync } = await import('../nodes/BankSync/BankSync.node');
      const node = new BankSync();
      const result = await node.execute.call(ctx as any);

      expect(result[0][0].json).toEqual({ error: 'API Error' });
    });
  });
});
