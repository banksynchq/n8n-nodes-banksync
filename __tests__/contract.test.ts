/**
 * Contract tests that assert the n8n node implementation aligns with the
 * live BankSync OpenAPI spec served at /openapi.json.
 *
 * By default these tests run against the checked-in snapshot
 * (__tests__/fixtures/openapi-spec.json). Set BANKSYNC_API_URL to test
 * against a live spec instead:
 *
 *   BANKSYNC_API_URL=https://api.banksync.io pnpm test
 */
import { describe, it, expect, beforeAll } from 'vitest';
import cachedSpec from './fixtures/openapi-spec.json';

// ---------------------------------------------------------------------------
// Every endpoint the n8n node calls, mapped to the OpenAPI operationId,
// HTTP method, path template, expected path/query params, and whether a
// request body is sent.
// ---------------------------------------------------------------------------
interface EndpointContract {
  /** n8n resource + operation for human-readable test names */
  label: string;
  /** HTTP method (lowercase) */
  method: string;
  /** OpenAPI path template, e.g. /v1/banks/{bid} */
  path: string;
  /** operationId declared in the OpenAPI spec */
  operationId: string;
  /** Parameter names the n8n node sends (path + query) */
  expectedParams: string[];
  /** Whether the n8n node sends a request body */
  sendsBody: boolean;
}

const NODE_ENDPOINTS: EndpointContract[] = [
  // Bank
  {
    label: 'Bank / List',
    method: 'get',
    path: '/v1/banks',
    operationId: 'listBanks',
    expectedParams: [],
    sendsBody: false,
  },
  {
    label: 'Bank / Get',
    method: 'get',
    path: '/v1/banks/{bid}',
    operationId: 'getBank',
    expectedParams: ['bid'],
    sendsBody: false,
  },
  {
    label: 'Bank / Delete',
    method: 'delete',
    path: '/v1/banks/{bid}',
    operationId: 'deleteBank',
    expectedParams: ['bid'],
    sendsBody: false,
  },

  // Account
  {
    label: 'Account / List',
    method: 'get',
    path: '/v1/banks/{bid}/accounts',
    operationId: 'listAccounts',
    expectedParams: ['bid'],
    sendsBody: false,
  },
  {
    label: 'Account / Get',
    method: 'get',
    path: '/v1/banks/{bid}/accounts/{aid}',
    operationId: 'getAccount',
    expectedParams: ['bid', 'aid'],
    sendsBody: false,
  },

  // Transaction
  {
    label: 'Transaction / List',
    method: 'get',
    path: '/v1/banks/{bid}/accounts/{aid}/transactions',
    operationId: 'listTransactions',
    expectedParams: ['bid', 'aid', 'cursor', 'from', 'to'],
    sendsBody: false,
  },

  // Balance
  {
    label: 'Balance / Get',
    method: 'get',
    path: '/v1/banks/{bid}/accounts/{aid}/balances',
    operationId: 'getBalance',
    expectedParams: ['bid', 'aid'],
    sendsBody: false,
  },

  // Trade
  {
    label: 'Trade / List',
    method: 'get',
    path: '/v1/banks/{bid}/accounts/{aid}/trades',
    operationId: 'listTrades',
    expectedParams: ['bid', 'aid', 'from', 'to'],
    sendsBody: false,
  },

  // Holding
  {
    label: 'Holding / List',
    method: 'get',
    path: '/v1/banks/{bid}/accounts/{aid}/holdings',
    operationId: 'listHoldings',
    expectedParams: ['bid', 'aid'],
    sendsBody: false,
  },

  // Loan
  {
    label: 'Loan / Get',
    method: 'get',
    path: '/v1/banks/{bid}/accounts/{aid}/loan',
    operationId: 'getLoan',
    expectedParams: ['bid', 'aid'],
    sendsBody: false,
  },

  // Feed
  {
    label: 'Feed / List',
    method: 'get',
    path: '/v1/feeds',
    operationId: 'listFeeds',
    expectedParams: [],
    sendsBody: false,
  },
  {
    label: 'Feed / Get',
    method: 'get',
    path: '/v1/feeds/{fid}',
    operationId: 'getFeed',
    expectedParams: ['fid'],
    sendsBody: false,
  },
  {
    label: 'Feed / Create',
    method: 'post',
    path: '/v1/feeds',
    operationId: 'createFeed',
    expectedParams: [],
    sendsBody: true,
  },
  {
    label: 'Feed / Update',
    method: 'put',
    path: '/v1/feeds/{fid}',
    operationId: 'updateFeed',
    expectedParams: ['fid'],
    sendsBody: true,
  },
  {
    label: 'Feed / Delete',
    method: 'delete',
    path: '/v1/feeds/{fid}',
    operationId: 'deleteFeed',
    expectedParams: ['fid'],
    sendsBody: false,
  },
  {
    label: 'Feed / Sync',
    method: 'post',
    path: '/v1/feeds/{fid}/sync',
    operationId: 'triggerSync',
    expectedParams: ['fid'],
    sendsBody: false,
  },
  {
    label: 'Feed / Learn',
    method: 'post',
    path: '/v1/feeds/{fid}/learn',
    operationId: 'triggerLearn',
    expectedParams: ['fid'],
    sendsBody: false,
  },

  // Job
  {
    label: 'Job / List',
    method: 'get',
    path: '/v1/feeds/{fid}/jobs',
    operationId: 'listJobs',
    expectedParams: ['fid', 'limit', 'status'],
    sendsBody: false,
  },
  {
    label: 'Job / Get',
    method: 'get',
    path: '/v1/feeds/{fid}/jobs/{jid}',
    operationId: 'getJob',
    expectedParams: ['fid', 'jid'],
    sendsBody: false,
  },
  {
    label: 'Job / Cancel',
    method: 'delete',
    path: '/v1/feeds/{fid}/jobs/{jid}',
    operationId: 'cancelJob',
    expectedParams: ['fid', 'jid'],
    sendsBody: false,
  },

  // Enrichment
  {
    label: 'Enrichment / List',
    method: 'get',
    path: '/v1/enrichments',
    operationId: 'listEnrichments',
    expectedParams: [],
    sendsBody: false,
  },
  {
    label: 'Enrichment / Get',
    method: 'get',
    path: '/v1/enrichments/{eid}',
    operationId: 'getEnrichment',
    expectedParams: ['eid'],
    sendsBody: false,
  },
  {
    label: 'Enrichment / Create',
    method: 'post',
    path: '/v1/enrichments',
    operationId: 'createEnrichment',
    expectedParams: [],
    sendsBody: true,
  },
  {
    label: 'Enrichment / Update',
    method: 'put',
    path: '/v1/enrichments/{eid}',
    operationId: 'updateEnrichment',
    expectedParams: ['eid'],
    sendsBody: true,
  },
  {
    label: 'Enrichment / Delete',
    method: 'delete',
    path: '/v1/enrichments/{eid}',
    operationId: 'deleteEnrichment',
    expectedParams: ['eid'],
    sendsBody: false,
  },
  {
    label: 'Enrichment / Preview',
    method: 'post',
    path: '/v1/feeds/{fid}/enrich/preview',
    operationId: 'previewEnrichment',
    expectedParams: ['fid'],
    sendsBody: true,
  },

  // Integration
  {
    label: 'Integration / List',
    method: 'get',
    path: '/v1/integrations',
    operationId: 'listIntegrations',
    expectedParams: [],
    sendsBody: false,
  },
  {
    label: 'Integration / Delete',
    method: 'delete',
    path: '/v1/integrations/{iid}',
    operationId: 'deleteIntegration',
    expectedParams: ['iid'],
    sendsBody: false,
  },
];

// Intentionally excluded from the node (require browser UI or Firebase Auth)
const EXCLUDED_OPERATION_IDS = [
  'createBankLink', // POST /v1/banks/link — requires browser for Plaid Link
  'connectBank', // POST /v1/banks/connect — requires Plaid public_token from UI
  'listApiKeys', // Requires Firebase Auth
  'createApiKey', // Requires Firebase Auth + admin role
  'revokeApiKey', // Requires Firebase Auth + admin role
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface OpenAPISpec {
  paths: Record<string, Record<string, OpenAPIOperation>>;
}

interface OpenAPIOperation {
  operationId?: string;
  parameters?: Array<{ name: string; in: string }>;
  requestBody?: unknown;
}

async function loadSpec(): Promise<OpenAPISpec> {
  const apiUrl = process.env.BANKSYNC_API_URL;
  if (apiUrl) {
    const res = await fetch(`${apiUrl}/openapi.json`);
    if (!res.ok) throw new Error(`Failed to fetch spec: ${res.status}`);
    return (await res.json()) as OpenAPISpec;
  }
  return cachedSpec as unknown as OpenAPISpec;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('API Contract Tests', () => {
  let spec: OpenAPISpec;

  beforeAll(async () => {
    spec = await loadSpec();
  });

  describe('Every n8n node endpoint exists in the OpenAPI spec', () => {
    for (const endpoint of NODE_ENDPOINTS) {
      it(`${endpoint.label}: ${endpoint.method.toUpperCase()} ${endpoint.path}`, () => {
        const pathObj = spec.paths[endpoint.path];
        expect(pathObj, `Path ${endpoint.path} not found in spec`).toBeDefined();

        const operation = pathObj[endpoint.method];
        expect(
          operation,
          `Method ${endpoint.method.toUpperCase()} not found on ${endpoint.path}`,
        ).toBeDefined();
      });
    }
  });

  describe('Operation IDs match', () => {
    for (const endpoint of NODE_ENDPOINTS) {
      it(`${endpoint.label} → operationId="${endpoint.operationId}"`, () => {
        const operation = spec.paths[endpoint.path]?.[endpoint.method];
        expect(operation?.operationId).toBe(endpoint.operationId);
      });
    }
  });

  describe('Parameters align with spec', () => {
    for (const endpoint of NODE_ENDPOINTS) {
      it(`${endpoint.label}: params [${endpoint.expectedParams.join(', ')}]`, () => {
        const operation = spec.paths[endpoint.path]?.[endpoint.method];
        const specParams = (operation?.parameters ?? []).map((p) => p.name).sort();
        const expectedParams = [...endpoint.expectedParams].sort();
        expect(specParams).toEqual(expectedParams);
      });
    }
  });

  describe('Request body presence matches', () => {
    for (const endpoint of NODE_ENDPOINTS) {
      it(`${endpoint.label}: body=${endpoint.sendsBody}`, () => {
        const operation = spec.paths[endpoint.path]?.[endpoint.method];
        const hasBody = operation?.requestBody !== undefined;
        expect(hasBody).toBe(endpoint.sendsBody);
      });
    }
  });

  describe('No spec endpoints are missing from the node (excluding intentional omissions)', () => {
    it('all non-excluded operations are covered', () => {
      const coveredOpIds = new Set(NODE_ENDPOINTS.map((e) => e.operationId));
      const excludedOpIds = new Set(EXCLUDED_OPERATION_IDS);

      const missingOps: string[] = [];
      for (const [path, methods] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
          const opId = (operation as OpenAPIOperation).operationId;
          if (opId && !coveredOpIds.has(opId) && !excludedOpIds.has(opId)) {
            missingOps.push(`${method.toUpperCase()} ${path} (${opId})`);
          }
        }
      }

      expect(
        missingOps,
        `The following API operations are not covered by the n8n node:\n${missingOps.join('\n')}`,
      ).toEqual([]);
    });
  });

  describe('Auth scheme uses X-API-Key header', () => {
    it('spec declares apiKey security scheme via X-API-Key header', () => {
      const schemes = (spec as any).components?.securitySchemes;
      expect(schemes?.apiKey).toBeDefined();
      expect(schemes.apiKey.type).toBe('apiKey');
      expect(schemes.apiKey.in).toBe('header');
      expect(schemes.apiKey.name).toBe('X-API-Key');
    });
  });
});
