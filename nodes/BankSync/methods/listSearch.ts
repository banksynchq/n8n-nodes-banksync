import type { IDataObject, ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { banksyncApiRequest } from '../GenericFunctions';

export async function searchBanks(
  this: ILoadOptionsFunctions,
  filter?: string,
): Promise<INodeListSearchResult> {
  const banks = (await banksyncApiRequest.call(this, 'GET', '/v1/banks')) as IDataObject[];

  const results = banks
    .filter((bank) => !filter || (bank.name as string).toLowerCase().includes(filter.toLowerCase()))
    .map((bank) => ({
      name: bank.name as string,
      value: bank.id as string,
    }));

  return { results };
}

export async function searchAccounts(
  this: ILoadOptionsFunctions,
  filter?: string,
): Promise<INodeListSearchResult> {
  const bankIdLocator = this.getNodeParameter('bankId', '') as IDataObject;
  const bankId = (bankIdLocator.value as string) || (bankIdLocator as unknown as string);
  if (!bankId) {
    return { results: [] };
  }

  const accounts = (await banksyncApiRequest.call(
    this,
    'GET',
    `/v1/banks/${bankId}/accounts`,
  )) as IDataObject[];

  const results = accounts
    .filter((a) => {
      if (!filter) return true;
      const display = `${(a.accountName as string) || (a.accountNumber as string)} (${a.accountType} - ${a.currency})`;
      return display.toLowerCase().includes(filter.toLowerCase());
    })
    .map((a) => ({
      name: `${(a.accountName as string) || (a.accountNumber as string)} (${a.accountType} - ${a.currency})`,
      value: a.id as string,
    }));

  return { results };
}

export async function searchFeeds(
  this: ILoadOptionsFunctions,
  filter?: string,
): Promise<INodeListSearchResult> {
  const feeds = (await banksyncApiRequest.call(this, 'GET', '/v1/feeds')) as IDataObject[];

  const results = feeds
    .filter((f) => !filter || (f.name as string).toLowerCase().includes(filter.toLowerCase()))
    .map((f) => ({
      name: f.name as string,
      value: f.id as string,
    }));

  return { results };
}

export async function searchEnrichments(
  this: ILoadOptionsFunctions,
  filter?: string,
): Promise<INodeListSearchResult> {
  const enrichments = (await banksyncApiRequest.call(
    this,
    'GET',
    '/v1/enrichments',
  )) as IDataObject[];

  const results = enrichments
    .filter((e) => !filter || (e.name as string).toLowerCase().includes(filter.toLowerCase()))
    .map((e) => ({
      name: e.name as string,
      value: e.id as string,
    }));

  return { results };
}

export async function searchIntegrations(
  this: ILoadOptionsFunctions,
  filter?: string,
): Promise<INodeListSearchResult> {
  const integrations = (await banksyncApiRequest.call(
    this,
    'GET',
    '/v1/integrations',
  )) as IDataObject[];

  const results = integrations
    .filter((i) => {
      if (!filter) return true;
      const display = `${i.name} (${i.type})`;
      return display.toLowerCase().includes(filter.toLowerCase());
    })
    .map((i) => ({
      name: `${i.name} (${i.type})`,
      value: i.id as string,
    }));

  return { results };
}

export async function searchJobs(
  this: ILoadOptionsFunctions,
  filter?: string,
): Promise<INodeListSearchResult> {
  const feedIdLocator = this.getNodeParameter('feedId', '') as IDataObject;
  const feedId = (feedIdLocator.value as string) || (feedIdLocator as unknown as string);
  if (!feedId) {
    return { results: [] };
  }

  const jobs = (await banksyncApiRequest.call(
    this,
    'GET',
    `/v1/feeds/${feedId}/jobs`,
  )) as IDataObject[];

  const results = jobs
    .filter((j) => {
      if (!filter) return true;
      const display = `${j.id} (${j.status} - ${j.type})`;
      return display.toLowerCase().includes(filter.toLowerCase());
    })
    .map((j) => ({
      name: `${j.id} (${j.status} - ${j.type})`,
      value: j.id as string,
    }));

  return { results };
}
