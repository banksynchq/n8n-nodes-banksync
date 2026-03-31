import type { INodeProperties } from 'n8n-workflow';

export const bankOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['bank'] } },
    options: [
      {
        name: 'Delete',
        value: 'delete',
        action: 'Delete a bank',
        description: 'Delete a bank connection',
      },
      {
        name: 'Get',
        value: 'get',
        action: 'Get a bank',
        description: 'Retrieve a bank connection',
      },
      {
        name: 'List',
        value: 'list',
        action: 'List banks',
        description: 'List all bank connections',
      },
    ],
    default: 'list',
  },
];

export const bankFields: INodeProperties[] = [
  // Get + Delete
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
    displayOptions: { show: { resource: ['bank'], operation: ['get', 'delete'] } },
    description: 'The bank to operate on',
  },
];
