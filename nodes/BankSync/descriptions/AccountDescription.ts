import type { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['account'] } },
    options: [
      { name: 'Get', value: 'get', action: 'Get an account', description: 'Retrieve an account' },
      {
        name: 'List',
        value: 'list',
        action: 'List accounts',
        description: 'List all accounts for a bank',
      },
    ],
    default: 'list',
  },
];

export const accountFields: INodeProperties[] = [
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
      {
        displayName: 'By ID',
        name: 'id',
        type: 'string',
        placeholder: 'e.g. abc123',
      },
    ],
    displayOptions: { show: { resource: ['account'], operation: ['list', 'get'] } },
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
      {
        displayName: 'By ID',
        name: 'id',
        type: 'string',
        placeholder: 'e.g. acc123',
      },
    ],
    displayOptions: { show: { resource: ['account'], operation: ['get'] } },
    description: 'The account to retrieve',
  },
];
