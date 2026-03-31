import type { INodeProperties } from 'n8n-workflow';

export const tradeOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['trade'] } },
    options: [
      {
        name: 'List',
        value: 'list',
        action: 'List trades',
        description: 'List trades for an investment account',
      },
    ],
    default: 'list',
  },
];

export const tradeFields: INodeProperties[] = [
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
    displayOptions: { show: { resource: ['trade'], operation: ['list'] } },
    description: 'The bank the account belongs to',
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
    displayOptions: { show: { resource: ['trade'], operation: ['list'] } },
    description: 'The account to list trades for',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['trade'], operation: ['list'] } },
    options: [
      {
        displayName: 'From Date',
        name: 'from',
        type: 'dateTime',
        default: '',
        description: 'Start date (YYYY-MM-DD). Defaults to 90 days ago.',
      },
      {
        displayName: 'To Date',
        name: 'to',
        type: 'dateTime',
        default: '',
        description: 'End date (YYYY-MM-DD). Defaults to today.',
      },
    ],
  },
];
