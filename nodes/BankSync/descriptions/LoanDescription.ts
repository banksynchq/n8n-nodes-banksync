import type { INodeProperties } from 'n8n-workflow';

export const loanOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['loan'] } },
    options: [
      {
        name: 'Get',
        value: 'get',
        action: 'Get loan details',
        description: 'Get loan/liability details for an account',
      },
    ],
    default: 'get',
  },
];

export const loanFields: INodeProperties[] = [
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
    displayOptions: { show: { resource: ['loan'], operation: ['get'] } },
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
    displayOptions: { show: { resource: ['loan'], operation: ['get'] } },
    description: 'The account to get loan details for',
  },
];
