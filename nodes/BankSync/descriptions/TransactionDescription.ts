import type { INodeProperties } from 'n8n-workflow';

export const transactionOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['transaction'] } },
    options: [
      {
        name: 'List',
        value: 'list',
        action: 'List transactions',
        description: 'List transactions for an account',
      },
    ],
    default: 'list',
  },
];

export const transactionFields: INodeProperties[] = [
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
    displayOptions: { show: { resource: ['transaction'], operation: ['list'] } },
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
    displayOptions: { show: { resource: ['transaction'], operation: ['list'] } },
    description: 'The account to list transactions for',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['transaction'], operation: ['list'] } },
    description: 'Whether to return all results or only a single page',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['transaction'], operation: ['list'] } },
    options: [
      {
        displayName: 'From Date',
        name: 'from',
        type: 'dateTime',
        default: '',
        description: 'Start date (YYYY-MM-DD). Used for date-range based banks.',
      },
      {
        displayName: 'To Date',
        name: 'to',
        type: 'dateTime',
        default: '',
        description: 'End date (YYYY-MM-DD). Used for date-range based banks.',
      },
      {
        displayName: 'Cursor',
        name: 'cursor',
        type: 'string',
        default: '',
        description: 'Pagination cursor for cursor-based sync (Plaid banks)',
      },
    ],
  },
];
