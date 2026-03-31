import type { INodeProperties } from 'n8n-workflow';

export const integrationOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['integration'] } },
    options: [
      {
        name: 'Delete',
        value: 'delete',
        action: 'Delete an integration',
        description: 'Delete an integration',
      },
      {
        name: 'List',
        value: 'list',
        action: 'List integrations',
        description: 'List all integrations',
      },
    ],
    default: 'list',
  },
];

export const integrationFields: INodeProperties[] = [
  {
    displayName: 'Integration',
    name: 'integrationId',
    type: 'resourceLocator',
    default: { mode: 'list', value: '' },
    required: true,
    modes: [
      {
        displayName: 'From List',
        name: 'list',
        type: 'list',
        typeOptions: { searchListMethod: 'searchIntegrations', searchable: true },
      },
      { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'e.g. int123' },
    ],
    displayOptions: { show: { resource: ['integration'], operation: ['delete'] } },
    description: 'The integration to delete',
  },
];
