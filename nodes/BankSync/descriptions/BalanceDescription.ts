import type { INodeProperties } from 'n8n-workflow';

export const balanceOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['balance'] } },
    options: [
      {
        name: 'Get',
        value: 'get',
        action: 'Get balance',
        description: 'Get live balance for an account',
      },
    ],
    default: 'get',
  },
];

export const balanceFields: INodeProperties[] = [
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
    displayOptions: { show: { resource: ['balance'], operation: ['get'] } },
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
    displayOptions: { show: { resource: ['balance'], operation: ['get'] } },
    description: 'The account to get the balance for',
  },
];
