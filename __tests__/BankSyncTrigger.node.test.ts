import { describe, it, expect, vi, beforeEach } from 'vitest';

import transactionsFixture from './fixtures/transactions.json';
import jobsFixture from './fixtures/jobs.json';

vi.mock('../nodes/BankSync/GenericFunctions', () => ({
  banksyncApiRequest: vi.fn(),
}));

import { banksyncApiRequest } from '../nodes/BankSync/GenericFunctions';
const mockApiRequest = vi.mocked(banksyncApiRequest);

function createMockPollFunctions(
  event: string,
  params: Record<string, unknown> = {},
  staticData: Record<string, unknown> = {},
) {
  return {
    getNodeParameter: vi.fn().mockImplementation((name: string) => {
      if (name === 'event') return event;
      return params[name] ?? {};
    }),
    getWorkflowStaticData: vi.fn().mockReturnValue(staticData),
    getCredentials: vi.fn().mockResolvedValue({
      apiKey: 'bsk_test',
      baseUrl: 'https://api.banksync.io',
    }),
    getNode: vi.fn().mockReturnValue({ name: 'BankSync Trigger' }),
    helpers: {
      httpRequest: vi.fn(),
    },
  };
}

describe('BankSync Trigger Node', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('New Transactions polling', () => {
    it('should fetch transactions and save cursor on first run', async () => {
      const ctx = createMockPollFunctions('newTransactions', {
        bankId: { value: 'bank_001' },
        accountId: { value: 'acc_001' },
      });

      ctx.helpers.httpRequest.mockResolvedValue(transactionsFixture);

      const { BankSyncTrigger } = await import('../nodes/BankSync/BankSyncTrigger.node');
      const trigger = new BankSyncTrigger();
      const result = await trigger.poll.call(ctx as any);

      expect(ctx.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://api.banksync.io/v1/banks/bank_001/accounts/acc_001/transactions',
        }),
      );
      expect(result).not.toBeNull();
      expect(result![0]).toHaveLength(2);
    });

    it('should use cursor from static data on subsequent runs', async () => {
      const staticData = { cursor: 'cursor_previous' };
      const ctx = createMockPollFunctions(
        'newTransactions',
        { bankId: { value: 'bank_001' }, accountId: { value: 'acc_001' } },
        staticData,
      );

      ctx.helpers.httpRequest.mockResolvedValue({
        success: true,
        data: [],
        meta: { count: 0, cursor: 'cursor_next', hasMore: false },
      });

      const { BankSyncTrigger } = await import('../nodes/BankSync/BankSyncTrigger.node');
      const trigger = new BankSyncTrigger();
      const result = await trigger.poll.call(ctx as any);

      expect(ctx.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          qs: expect.objectContaining({ cursor: 'cursor_previous' }),
        }),
      );
      // No transactions, should return null
      expect(result).toBeNull();
    });

    it('should return null when no new transactions', async () => {
      const ctx = createMockPollFunctions('newTransactions', {
        bankId: { value: 'bank_001' },
        accountId: { value: 'acc_001' },
      });

      ctx.helpers.httpRequest.mockResolvedValue({
        success: true,
        data: [],
        meta: { count: 0 },
      });

      const { BankSyncTrigger } = await import('../nodes/BankSync/BankSyncTrigger.node');
      const trigger = new BankSyncTrigger();
      const result = await trigger.poll.call(ctx as any);

      expect(result).toBeNull();
    });
  });

  describe('Job Completed polling', () => {
    it('should return newly completed jobs', async () => {
      mockApiRequest.mockResolvedValue(jobsFixture.data as any);
      const ctx = createMockPollFunctions('jobCompleted', {
        feedId: { value: 'feed_001' },
      });

      const { BankSyncTrigger } = await import('../nodes/BankSync/BankSyncTrigger.node');
      const trigger = new BankSyncTrigger();
      const result = await trigger.poll.call(ctx as any);

      expect(mockApiRequest).toHaveBeenCalledWith('GET', '/v1/feeds/feed_001/jobs', undefined, {
        limit: 10,
        status: 'completed',
      });
      expect(result).not.toBeNull();
      expect(result![0]).toHaveLength(1);
    });

    it('should skip already-seen jobs based on timestamp', async () => {
      const staticData = { lastSeenTimestamp: '2025-03-15T10:05:00Z' };
      mockApiRequest.mockResolvedValue(jobsFixture.data as any);

      const ctx = createMockPollFunctions(
        'jobCompleted',
        { feedId: { value: 'feed_001' } },
        staticData,
      );

      const { BankSyncTrigger } = await import('../nodes/BankSync/BankSyncTrigger.node');
      const trigger = new BankSyncTrigger();
      const result = await trigger.poll.call(ctx as any);

      // The fixture job has completedAt exactly equal to lastSeenTimestamp, so it's not "newer"
      expect(result).toBeNull();
    });

    it('should return null when no completed jobs', async () => {
      mockApiRequest.mockResolvedValue([] as any);
      const ctx = createMockPollFunctions('jobCompleted', { feedId: { value: 'feed_001' } });

      const { BankSyncTrigger } = await import('../nodes/BankSync/BankSyncTrigger.node');
      const trigger = new BankSyncTrigger();
      const result = await trigger.poll.call(ctx as any);

      expect(result).toBeNull();
    });
  });
});
