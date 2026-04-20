import type {
  IPollFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { banksyncApiRequest } from './GenericFunctions';
import { searchBanks, searchAccounts, searchFeeds } from './methods/listSearch';

export class BankSyncTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'BankSync Trigger',
    name: 'bankSyncTrigger',
    icon: 'file:banksync.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Triggers when new transactions arrive or jobs complete in BankSync',
    defaults: { name: 'BankSync Trigger' },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'bankSyncApi',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'New Transactions',
            value: 'newTransactions',
            description: 'Triggers when new transactions are detected',
          },
          {
            name: 'Job Completed',
            value: 'jobCompleted',
            description: 'Triggers when a sync job completes',
          },
        ],
        default: 'newTransactions',
        required: true,
      },
      // New Transactions fields
      {
        displayName: 'Bank',
        name: 'bankId',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        modes: [
          {
            displayName: 'From List',
            name: 'list',
            type: 'list',
            typeOptions: { searchListMethod: 'searchBanks', searchable: true },
          },
          { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'e.g. abc123' },
        ],
        displayOptions: { show: { event: ['newTransactions'] } },
        description: 'The bank to monitor for new transactions',
      },
      {
        displayName: 'Account',
        name: 'accountId',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        modes: [
          {
            displayName: 'From List',
            name: 'list',
            type: 'list',
            typeOptions: { searchListMethod: 'searchAccounts', searchable: true },
          },
          { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'e.g. acc123' },
        ],
        displayOptions: { show: { event: ['newTransactions'] } },
        description: 'The account to monitor for new transactions',
      },
      // Job Completed fields
      {
        displayName: 'Feed',
        name: 'feedId',
        type: 'resourceLocator',
        default: { mode: 'list', value: '' },
        required: true,
        modes: [
          {
            displayName: 'From List',
            name: 'list',
            type: 'list',
            typeOptions: { searchListMethod: 'searchFeeds', searchable: true },
          },
          { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'e.g. feed123' },
        ],
        displayOptions: { show: { event: ['jobCompleted'] } },
        description: 'The feed to monitor for completed jobs',
      },
    ],
  };

  methods = {
    listSearch: {
      searchBanks,
      searchAccounts,
      searchFeeds,
    },
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const event = this.getNodeParameter('event') as string;
    const workflowStaticData = this.getWorkflowStaticData('node');

    if (event === 'newTransactions') {
      return await pollNewTransactions.call(this, workflowStaticData);
    } else if (event === 'jobCompleted') {
      return await pollJobCompleted.call(this, workflowStaticData);
    }

    return null;
  }
}

async function pollNewTransactions(
  this: IPollFunctions,
  staticData: IDataObject,
): Promise<INodeExecutionData[][] | null> {
  const bankIdLocator = this.getNodeParameter('bankId') as IDataObject;
  const accountIdLocator = this.getNodeParameter('accountId') as IDataObject;
  const bankId = (bankIdLocator.value as string) || (bankIdLocator as unknown as string);
  const accountId = (accountIdLocator.value as string) || (accountIdLocator as unknown as string);

  const credentials = await this.getCredentials('bankSyncApi');
  const baseUrl = (credentials.baseUrl as string) || 'https://api.banksync.io';

  const qs: IDataObject = {};

  // Use cursor if we have one from a previous poll
  if (staticData.cursor) {
    qs.cursor = staticData.cursor as string;
  } else {
    // First run: fetch last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    qs.from = thirtyDaysAgo.toISOString().split('T')[0];
    qs.to = new Date().toISOString().split('T')[0];
  }

  const response = await this.helpers.httpRequestWithAuthentication.call(this, 'bankSyncApi', {
    method: 'GET',
    url: `${baseUrl}/v1/banks/${bankId}/accounts/${accountId}/transactions`,
    qs,
    json: true,
  });

  if (!response.success) {
    return null;
  }

  // Save cursor for next poll
  const meta = response.meta as IDataObject | undefined;
  if (meta?.cursor) {
    staticData.cursor = meta.cursor;
  }

  const transactions = (response.data as IDataObject[]) || [];

  if (transactions.length === 0) {
    return null;
  }

  const returnData: INodeExecutionData[] = transactions.map((transaction) => ({
    json: transaction,
  }));

  return [returnData];
}

async function pollJobCompleted(
  this: IPollFunctions,
  staticData: IDataObject,
): Promise<INodeExecutionData[][] | null> {
  const feedIdLocator = this.getNodeParameter('feedId') as IDataObject;
  const feedId = (feedIdLocator.value as string) || (feedIdLocator as unknown as string);

  const jobs = (await banksyncApiRequest.call(this, 'GET', `/v1/feeds/${feedId}/jobs`, undefined, {
    limit: 10,
    status: 'completed',
  })) as IDataObject[];

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return null;
  }

  const lastSeenTimestamp = staticData.lastSeenTimestamp as string | undefined;
  const newJobs = lastSeenTimestamp
    ? jobs.filter((job) => {
        const completedAt = job.completedAt as string;
        return completedAt && completedAt > lastSeenTimestamp;
      })
    : jobs;

  if (newJobs.length === 0) {
    return null;
  }

  // Update the last seen timestamp to the most recent job
  const mostRecent = newJobs.reduce((latest, job) => {
    const completedAt = job.completedAt as string;
    return completedAt > (latest.completedAt as string) ? job : latest;
  });
  staticData.lastSeenTimestamp = mostRecent.completedAt;

  const returnData: INodeExecutionData[] = newJobs.map((job) => ({
    json: job,
  }));

  return [returnData];
}
