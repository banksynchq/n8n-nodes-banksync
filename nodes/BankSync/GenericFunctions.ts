import type {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IPollFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  IDataObject,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function banksyncApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IPollFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  qs?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
  const credentials = await this.getCredentials('bankSyncApi');
  const baseUrl = (credentials.baseUrl as string) || 'https://api.banksync.io';

  const options: IHttpRequestOptions = {
    method,
    url: `${baseUrl}${endpoint}`,
    headers: {
      'X-API-Key': credentials.apiKey as string,
      'Content-Type': 'application/json',
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0) {
    options.body = body;
  }

  if (qs && Object.keys(qs).length > 0) {
    options.qs = qs;
  }

  try {
    const response = await this.helpers.httpRequest(options);

    if (response.success === false) {
      throw new NodeApiError(this.getNode(), response as JsonObject, {
        message: response.error || 'API request failed',
      });
    }

    return response.data as IDataObject | IDataObject[];
  } catch (error) {
    if (error instanceof NodeApiError) {
      throw error;
    }

    const statusCode = (error as { statusCode?: number }).statusCode;
    const responseBody = (error as { response?: { body?: JsonObject } }).response?.body;

    let message: string;
    let description: string | undefined;

    switch (statusCode) {
      case 401:
        message = 'Invalid or expired API key';
        break;
      case 403:
        message = 'Insufficient API key scopes for this operation';
        break;
      case 404:
        message = 'Resource not found';
        break;
      case 409:
        message = getConflictMessage(endpoint, method);
        break;
      case 422:
        message = 'Validation error';
        description = formatValidationErrors(responseBody);
        break;
      case 503:
        message = 'Bank connection requires re-authentication';
        break;
      default:
        message = ((responseBody as IDataObject)?.error as string) || 'Request failed';
    }

    throw new NodeApiError(this.getNode(), (error as JsonObject) ?? {}, {
      message,
      description,
    });
  }
}

function getConflictMessage(endpoint: string, method: string): string {
  if (endpoint.includes('/sync')) {
    return 'A sync is already running for this feed';
  }
  if (endpoint.includes('/jobs/') && method === 'DELETE') {
    return 'Job is already in a terminal state';
  }
  if (endpoint.includes('/enrichments') && method === 'POST') {
    return 'Only one Memory enrichment is allowed per workspace';
  }
  return 'Resource conflict';
}

function formatValidationErrors(body?: JsonObject): string | undefined {
  if (!body) return undefined;
  const parts: string[] = [];
  if (Array.isArray(body.errors)) {
    parts.push(...(body.errors as string[]));
  }
  if (Array.isArray(body.warnings)) {
    parts.push(...(body.warnings as string[]).map((w) => `Warning: ${w}`));
  }
  return parts.length > 0 ? parts.join('; ') : (body.error as string) || undefined;
}

export async function banksyncApiRequestAllTransactions(
  this: IExecuteFunctions,
  bankId: string,
  accountId: string,
  qs: IDataObject,
): Promise<IDataObject[]> {
  const credentials = await this.getCredentials('bankSyncApi');
  const baseUrl = (credentials.baseUrl as string) || 'https://api.banksync.io';
  const endpoint = `/v1/banks/${bankId}/accounts/${accountId}/transactions`;

  const allItems: IDataObject[] = [];
  let cursor: string | undefined;
  const queryParams = { ...qs };

  do {
    if (cursor) {
      queryParams.cursor = cursor;
    }

    // banksyncApiRequest unwraps data, but we need meta for pagination.
    // Use raw httpRequest to access the full response envelope.
    const rawResponse = await this.helpers.httpRequest({
      method: 'GET',
      url: `${baseUrl}${endpoint}`,
      headers: { 'X-API-Key': credentials.apiKey as string },
      qs: queryParams,
      json: true,
    });

    if (Array.isArray(rawResponse.data)) {
      allItems.push(...(rawResponse.data as IDataObject[]));
    }

    const meta = rawResponse.meta as IDataObject | undefined;
    if (meta?.hasMore === true && meta?.cursor) {
      cursor = meta.cursor as string;
      // Clear date params after first request for cursor-based pagination
      delete queryParams.from;
      delete queryParams.to;
    } else {
      cursor = undefined;
    }
  } while (cursor);

  return allItems;
}
