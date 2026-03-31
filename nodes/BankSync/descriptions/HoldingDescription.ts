import type { INodeProperties } from 'n8n-workflow';

export const holdingOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['holding'] } },
    options: [
      {
        name: 'List',
        value: 'list',
        action: 'List holdings',
        description: 'List holdings for an investment account',
      },
    ],
    default: 'list',
  },
];

export const holdingFields: INodeProperties[] = [
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
    displayOptions: { show: { resource: ['holding'], operation: ['list'] } },
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
    displayOptions: { show: { resource: ['holding'], operation: ['list'] } },
    description: 'The account to list holdings for',
  },
];
