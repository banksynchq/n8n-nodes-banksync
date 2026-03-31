import type { INodeProperties } from 'n8n-workflow';

export const feedOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['feed'] } },
    options: [
      {
        name: 'Create',
        value: 'create',
        action: 'Create a feed',
        description: 'Create a new feed',
      },
      { name: 'Delete', value: 'delete', action: 'Delete a feed', description: 'Delete a feed' },
      { name: 'Get', value: 'get', action: 'Get a feed', description: 'Retrieve a feed' },
      {
        name: 'Learn',
        value: 'learn',
        action: 'Trigger learn',
        description: 'Trigger Memory enrichment learn phase for a feed',
      },
      { name: 'List', value: 'list', action: 'List feeds', description: 'List all feeds' },
      {
        name: 'Sync',
        value: 'sync',
        action: 'Trigger sync',
        description: 'Trigger a sync for a feed',
      },
      { name: 'Update', value: 'update', action: 'Update a feed', description: 'Update a feed' },
    ],
    default: 'list',
  },
];

export const feedFields: INodeProperties[] = [
  // Feed ID — used by get, update, delete, sync, learn
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
    displayOptions: {
      show: { resource: ['feed'], operation: ['get', 'update', 'delete', 'sync', 'learn'] },
    },
    description: 'The feed to operate on',
  },

  // Create fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
    required: true,
    displayOptions: { show: { resource: ['feed'], operation: ['create'] } },
    description: 'Name for the feed',
  },
  {
    displayName: 'Source',
    name: 'source',
    type: 'options',
    options: [
      { name: 'Sync', value: 'sync' },
      { name: 'Extractor', value: 'extractor' },
      { name: 'Upload', value: 'upload' },
    ],
    default: 'sync',
    required: true,
    displayOptions: { show: { resource: ['feed'], operation: ['create'] } },
    description: 'Feed source type',
  },
  {
    displayName: 'Data Type',
    name: 'dataType',
    type: 'options',
    options: [
      { name: 'Transactions', value: 'transactions' },
      { name: 'Balances', value: 'balances' },
      { name: 'Trades', value: 'trades' },
      { name: 'Holdings', value: 'holdings' },
      { name: 'Loans', value: 'loans' },
      { name: 'Receipts', value: 'receipts' },
      { name: 'Invoices', value: 'invoices' },
      { name: 'Documents', value: 'documents' },
    ],
    default: 'transactions',
    required: true,
    displayOptions: { show: { resource: ['feed'], operation: ['create'] } },
    description: 'Type of data the feed handles',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['feed'], operation: ['create'] } },
    options: [
      {
        displayName: 'Source Config (JSON)',
        name: 'sourceConfig',
        type: 'json',
        default: '{}',
        description: 'Source configuration as JSON. See API docs for structure.',
      },
      {
        displayName: 'Destination Config (JSON)',
        name: 'destinationConfig',
        type: 'json',
        default: '{}',
        description: 'Destination configuration as JSON. See API docs for structure.',
      },
      {
        displayName: 'Field Mappings (JSON)',
        name: 'fieldMappings',
        type: 'json',
        default: '[]',
        description: 'Array of { sourceField, destinationField } mappings',
      },
      {
        displayName: 'Data Type Options (JSON)',
        name: 'dataTypeOptions',
        type: 'json',
        default: '{}',
        description: 'Data type specific options as JSON',
      },
      {
        displayName: 'Schedule (JSON)',
        name: 'schedule',
        type: 'json',
        default: '{}',
        description: 'Schedule config: { enabled, frequency, timeOfDay, dayOfWeek?, dayOfMonth? }',
      },
    ],
  },

  // Update fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['feed'], operation: ['update'] } },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'New feed name',
      },
      {
        displayName: 'Source Config (JSON)',
        name: 'sourceConfig',
        type: 'json',
        default: '{}',
        description: 'Updated source configuration',
      },
      {
        displayName: 'Destination Config (JSON)',
        name: 'destinationConfig',
        type: 'json',
        default: '{}',
        description: 'Updated destination configuration',
      },
      {
        displayName: 'Field Mappings (JSON)',
        name: 'fieldMappings',
        type: 'json',
        default: '[]',
        description: 'Updated field mappings',
      },
      {
        displayName: 'Data Type Options (JSON)',
        name: 'dataTypeOptions',
        type: 'json',
        default: '{}',
        description: 'Updated data type options',
      },
      {
        displayName: 'Schedule (JSON)',
        name: 'schedule',
        type: 'json',
        default: '{}',
        description: 'Updated schedule configuration',
      },
    ],
  },

  // Sync fields
  {
    displayName: 'Sync Options',
    name: 'syncOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { resource: ['feed'], operation: ['sync'] } },
    options: [
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Start date for date-range sync (YYYY-MM-DD). Empty = incremental.',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'End date for date-range sync (YYYY-MM-DD)',
      },
    ],
  },
];
