import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { banksyncApiRequest, banksyncApiRequestAllTransactions } from './GenericFunctions';
import {
  searchBanks,
  searchAccounts,
  searchFeeds,
  searchEnrichments,
  searchIntegrations,
  searchJobs,
} from './methods/listSearch';

import { bankOperations, bankFields } from './descriptions/BankDescription';
import { accountOperations, accountFields } from './descriptions/AccountDescription';
import { transactionOperations, transactionFields } from './descriptions/TransactionDescription';
import { balanceOperations, balanceFields } from './descriptions/BalanceDescription';
import { tradeOperations, tradeFields } from './descriptions/TradeDescription';
import { holdingOperations, holdingFields } from './descriptions/HoldingDescription';
import { loanOperations, loanFields } from './descriptions/LoanDescription';
import { feedOperations, feedFields } from './descriptions/FeedDescription';
import { jobOperations, jobFields } from './descriptions/JobDescription';
import { enrichmentOperations, enrichmentFields } from './descriptions/EnrichmentDescription';
import { integrationOperations, integrationFields } from './descriptions/IntegrationDescription';

export class BankSync implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'BankSync',
    name: 'bankSync',
    icon: 'file:banksync.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the BankSync API',
    defaults: { name: 'BankSync' },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'bankSyncApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Account', value: 'account' },
          { name: 'Balance', value: 'balance' },
          { name: 'Bank', value: 'bank' },
          { name: 'Enrichment', value: 'enrichment' },
          { name: 'Feed', value: 'feed' },
          { name: 'Holding', value: 'holding' },
          { name: 'Integration', value: 'integration' },
          { name: 'Job', value: 'job' },
          { name: 'Loan', value: 'loan' },
          { name: 'Trade', value: 'trade' },
          { name: 'Transaction', value: 'transaction' },
        ],
        default: 'bank',
      },
      ...bankOperations,
      ...bankFields,
      ...accountOperations,
      ...accountFields,
      ...transactionOperations,
      ...transactionFields,
      ...balanceOperations,
      ...balanceFields,
      ...tradeOperations,
      ...tradeFields,
      ...holdingOperations,
      ...holdingFields,
      ...loanOperations,
      ...loanFields,
      ...feedOperations,
      ...feedFields,
      ...jobOperations,
      ...jobFields,
      ...enrichmentOperations,
      ...enrichmentFields,
      ...integrationOperations,
      ...integrationFields,
    ],
  };

  methods = {
    listSearch: {
      searchBanks,
      searchAccounts,
      searchFeeds,
      searchEnrichments,
      searchIntegrations,
      searchJobs,
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: IDataObject | IDataObject[];

        const getResourceLocatorValue = (param: string): string => {
          const locator = this.getNodeParameter(param, i) as IDataObject;
          return (locator.value as string) || (locator as unknown as string);
        };

        if (resource === 'bank') {
          if (operation === 'list') {
            responseData = await banksyncApiRequest.call(this, 'GET', '/v1/banks');
          } else if (operation === 'get') {
            const bankId = getResourceLocatorValue('bankId');
            responseData = await banksyncApiRequest.call(this, 'GET', `/v1/banks/${bankId}`);
          } else if (operation === 'delete') {
            const bankId = getResourceLocatorValue('bankId');
            responseData = await banksyncApiRequest.call(this, 'DELETE', `/v1/banks/${bankId}`);
          } else {
            throw new Error(`Unsupported operation: ${operation}`);
          }
        } else if (resource === 'account') {
          const bankId = getResourceLocatorValue('bankId');
          if (operation === 'list') {
            responseData = await banksyncApiRequest.call(
              this,
              'GET',
              `/v1/banks/${bankId}/accounts`,
            );
          } else if (operation === 'get') {
            const accountId = getResourceLocatorValue('accountId');
            responseData = await banksyncApiRequest.call(
              this,
              'GET',
              `/v1/banks/${bankId}/accounts/${accountId}`,
            );
          } else {
            throw new Error(`Unsupported operation: ${operation}`);
          }
        } else if (resource === 'transaction') {
          const bankId = getResourceLocatorValue('bankId');
          const accountId = getResourceLocatorValue('accountId');
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

          const qs: IDataObject = {};
          if (additionalFields.from) qs.from = additionalFields.from;
          if (additionalFields.to) qs.to = additionalFields.to;
          if (additionalFields.cursor) qs.cursor = additionalFields.cursor;

          if (returnAll) {
            responseData = await banksyncApiRequestAllTransactions.call(
              this,
              bankId,
              accountId,
              qs,
            );
          } else {
            responseData = await banksyncApiRequest.call(
              this,
              'GET',
              `/v1/banks/${bankId}/accounts/${accountId}/transactions`,
              undefined,
              qs,
            );
          }
        } else if (resource === 'balance') {
          const bankId = getResourceLocatorValue('bankId');
          const accountId = getResourceLocatorValue('accountId');
          responseData = await banksyncApiRequest.call(
            this,
            'GET',
            `/v1/banks/${bankId}/accounts/${accountId}/balances`,
          );
        } else if (resource === 'trade') {
          const bankId = getResourceLocatorValue('bankId');
          const accountId = getResourceLocatorValue('accountId');
          const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
          const qs: IDataObject = {};
          if (additionalFields.from) qs.from = additionalFields.from;
          if (additionalFields.to) qs.to = additionalFields.to;
          responseData = await banksyncApiRequest.call(
            this,
            'GET',
            `/v1/banks/${bankId}/accounts/${accountId}/trades`,
            undefined,
            qs,
          );
        } else if (resource === 'holding') {
          const bankId = getResourceLocatorValue('bankId');
          const accountId = getResourceLocatorValue('accountId');
          responseData = await banksyncApiRequest.call(
            this,
            'GET',
            `/v1/banks/${bankId}/accounts/${accountId}/holdings`,
          );
        } else if (resource === 'loan') {
          const bankId = getResourceLocatorValue('bankId');
          const accountId = getResourceLocatorValue('accountId');
          responseData = await banksyncApiRequest.call(
            this,
            'GET',
            `/v1/banks/${bankId}/accounts/${accountId}/loan`,
          );
        } else if (resource === 'feed') {
          if (operation === 'list') {
            responseData = await banksyncApiRequest.call(this, 'GET', '/v1/feeds');
          } else if (operation === 'get') {
            const feedId = getResourceLocatorValue('feedId');
            responseData = await banksyncApiRequest.call(this, 'GET', `/v1/feeds/${feedId}`);
          } else if (operation === 'create') {
            const body: IDataObject = {
              name: this.getNodeParameter('name', i) as string,
              source: this.getNodeParameter('source', i) as string,
              dataType: this.getNodeParameter('dataType', i) as string,
            };
            const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
            if (additionalFields.sourceConfig)
              body.sourceConfig = JSON.parse(additionalFields.sourceConfig as string);
            if (additionalFields.destinationConfig)
              body.destinationConfig = JSON.parse(additionalFields.destinationConfig as string);
            if (additionalFields.fieldMappings)
              body.fieldMappings = JSON.parse(additionalFields.fieldMappings as string);
            if (additionalFields.dataTypeOptions)
              body.dataTypeOptions = JSON.parse(additionalFields.dataTypeOptions as string);
            if (additionalFields.schedule)
              body.schedule = JSON.parse(additionalFields.schedule as string);
            responseData = await banksyncApiRequest.call(this, 'POST', '/v1/feeds', body);
          } else if (operation === 'update') {
            const feedId = getResourceLocatorValue('feedId');
            const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
            const body: IDataObject = {};
            if (updateFields.name) body.name = updateFields.name;
            if (updateFields.sourceConfig)
              body.sourceConfig = JSON.parse(updateFields.sourceConfig as string);
            if (updateFields.destinationConfig)
              body.destinationConfig = JSON.parse(updateFields.destinationConfig as string);
            if (updateFields.fieldMappings)
              body.fieldMappings = JSON.parse(updateFields.fieldMappings as string);
            if (updateFields.dataTypeOptions)
              body.dataTypeOptions = JSON.parse(updateFields.dataTypeOptions as string);
            if (updateFields.schedule) body.schedule = JSON.parse(updateFields.schedule as string);
            responseData = await banksyncApiRequest.call(this, 'PUT', `/v1/feeds/${feedId}`, body);
          } else if (operation === 'delete') {
            const feedId = getResourceLocatorValue('feedId');
            responseData = await banksyncApiRequest.call(this, 'DELETE', `/v1/feeds/${feedId}`);
          } else if (operation === 'sync') {
            const feedId = getResourceLocatorValue('feedId');
            const syncOptions = this.getNodeParameter('syncOptions', i) as IDataObject;
            const body: IDataObject = {};
            if (syncOptions.startDate) body.startDate = syncOptions.startDate;
            if (syncOptions.endDate) body.endDate = syncOptions.endDate;
            responseData = await banksyncApiRequest.call(
              this,
              'POST',
              `/v1/feeds/${feedId}/sync`,
              body,
            );
          } else if (operation === 'learn') {
            const feedId = getResourceLocatorValue('feedId');
            responseData = await banksyncApiRequest.call(this, 'POST', `/v1/feeds/${feedId}/learn`);
          } else {
            throw new Error(`Unsupported operation: ${operation}`);
          }
        } else if (resource === 'job') {
          const feedId = getResourceLocatorValue('feedId');
          if (operation === 'list') {
            const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
            const qs: IDataObject = {};
            if (additionalFields.limit) qs.limit = additionalFields.limit;
            if (additionalFields.status) qs.status = additionalFields.status;
            responseData = await banksyncApiRequest.call(
              this,
              'GET',
              `/v1/feeds/${feedId}/jobs`,
              undefined,
              qs,
            );
          } else if (operation === 'get') {
            const jobId = this.getNodeParameter('jobId', i) as string;
            responseData = await banksyncApiRequest.call(
              this,
              'GET',
              `/v1/feeds/${feedId}/jobs/${jobId}`,
            );
          } else if (operation === 'cancel') {
            const jobId = this.getNodeParameter('jobId', i) as string;
            responseData = await banksyncApiRequest.call(
              this,
              'DELETE',
              `/v1/feeds/${feedId}/jobs/${jobId}`,
            );
          } else {
            throw new Error(`Unsupported operation: ${operation}`);
          }
        } else if (resource === 'enrichment') {
          if (operation === 'list') {
            responseData = await banksyncApiRequest.call(this, 'GET', '/v1/enrichments');
          } else if (operation === 'get') {
            const enrichmentId = getResourceLocatorValue('enrichmentId');
            responseData = await banksyncApiRequest.call(
              this,
              'GET',
              `/v1/enrichments/${enrichmentId}`,
            );
          } else if (operation === 'create') {
            const body: IDataObject = {
              name: this.getNodeParameter('name', i) as string,
              type: this.getNodeParameter('type', i) as string,
              dataType: this.getNodeParameter('dataType', i) as string,
            };
            const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
            if (additionalFields.enabled !== undefined) body.enabled = additionalFields.enabled;
            if (additionalFields.allFeeds !== undefined) body.allFeeds = additionalFields.allFeeds;
            if (additionalFields.feedIds)
              body.feedIds = JSON.parse(additionalFields.feedIds as string);
            if (additionalFields.ruleConfig)
              body.ruleConfig = JSON.parse(additionalFields.ruleConfig as string);
            if (additionalFields.alertConfig)
              body.alertConfig = JSON.parse(additionalFields.alertConfig as string);
            if (additionalFields.memoryConfig)
              body.memoryConfig = JSON.parse(additionalFields.memoryConfig as string);
            responseData = await banksyncApiRequest.call(this, 'POST', '/v1/enrichments', body);
          } else if (operation === 'update') {
            const enrichmentId = getResourceLocatorValue('enrichmentId');
            const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
            const body: IDataObject = {};
            if (updateFields.name) body.name = updateFields.name;
            if (updateFields.enabled !== undefined) body.enabled = updateFields.enabled;
            if (updateFields.allFeeds !== undefined) body.allFeeds = updateFields.allFeeds;
            if (updateFields.feedIds) body.feedIds = JSON.parse(updateFields.feedIds as string);
            if (updateFields.ruleConfig)
              body.ruleConfig = JSON.parse(updateFields.ruleConfig as string);
            if (updateFields.alertConfig)
              body.alertConfig = JSON.parse(updateFields.alertConfig as string);
            if (updateFields.memoryConfig)
              body.memoryConfig = JSON.parse(updateFields.memoryConfig as string);
            responseData = await banksyncApiRequest.call(
              this,
              'PUT',
              `/v1/enrichments/${enrichmentId}`,
              body,
            );
          } else if (operation === 'delete') {
            const enrichmentId = getResourceLocatorValue('enrichmentId');
            responseData = await banksyncApiRequest.call(
              this,
              'DELETE',
              `/v1/enrichments/${enrichmentId}`,
            );
          } else if (operation === 'preview') {
            const feedId = getResourceLocatorValue('feedId');
            const records = JSON.parse(this.getNodeParameter('records', i) as string);
            responseData = await banksyncApiRequest.call(
              this,
              'POST',
              `/v1/feeds/${feedId}/enrich/preview`,
              { records },
            );
          } else {
            throw new Error(`Unsupported operation: ${operation}`);
          }
        } else if (resource === 'integration') {
          if (operation === 'list') {
            responseData = await banksyncApiRequest.call(this, 'GET', '/v1/integrations');
          } else if (operation === 'delete') {
            const integrationId = getResourceLocatorValue('integrationId');
            responseData = await banksyncApiRequest.call(
              this,
              'DELETE',
              `/v1/integrations/${integrationId}`,
            );
          } else {
            throw new Error(`Unsupported operation: ${operation}`);
          }
        } else {
          throw new Error(`Unsupported resource: ${resource}`);
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
