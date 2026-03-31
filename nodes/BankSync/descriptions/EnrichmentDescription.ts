import type { INodeProperties } from 'n8n-workflow';

export const enrichmentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['enrichment'] } },
    options: [
      {
        name: 'Create',
        value: 'create',
        action: 'Create an enrichment',
        description: 'Create a new enrichment',
      },
      {
        name: 'Delete',
        value: 'delete',
        action: 'Delete an enrichment',
        description: 'Delete an enrichment',
      },
      {
        name: 'Get',
        value: 'get',
        action: 'Get an enrichment',
        description: 'Retrieve an enrichment',
      },
      {
        name: 'List',
        value: 'list',
        action: 'List enrichments',
        description: 'List all enrichments',
      },
      {
        name: 'Preview',
        value: 'preview',
        action: 'Preview enrichment',
        description: 'Preview enrichment results on sample data',
      },
      {
        name: 'Update',
        value: 'update',
        action: 'Update an enrichment',
        description: 'Update an enrichment',
      },
    ],
    default: 'list',
  },
];

export const enrichmentFields: INodeProperties[] = [
  // Enrichment ID — get, update, delete
  {
    displayName: 'Enrichment',
    name: 'enrichmentId',
    type: 'resourceLocator',
    default: { mode: 'list', value: '' },
    required: true,
    modes: [
      {
        displayName: 'From List',
        name: 'list',
        type: 'list',
        typeOptions: { searchListMethod: 'searchEnrichments', searchable: true },
      },
      { displayName: 'By ID', name: 'id', type: 'string', placeholder: 'e.g. enr123' },
    ],
    displayOptions: { show: { resource: ['enrichment'], operation: ['get', 'update', 'delete'] } },
    description: 'The enrichment to operate on',
  },

  // Create fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
    required: true,
    displayOptions: { show: { resource: ['enrichment'], operation: ['create'] } },
    description: 'Name for the enrichment',
  },
  {
    displayName: 'Type',
    name: 'type',
    type: 'options',
    options: [
      { name: 'Rule', value: 'rule' },
      { name: 'Alert', value: 'alert' },
      { name: 'Memory', value: 'memory' },
    ],
    default: 'rule',
    required: true,
    displayOptions: { show: { resource: ['enrichment'], operation: ['create'] } },
    description: 'Type of enrichment',
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
    displayOptions: { show: { resource: ['enrichment'], operation: ['create'] } },
    description: 'Data type the enrichment applies to',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['enrichment'], operation: ['create'] } },
    options: [
      {
        displayName: 'Enabled',
        name: 'enabled',
        type: 'boolean',
        default: true,
        description: 'Whether the enrichment is enabled',
      },
      {
        displayName: 'All Feeds',
        name: 'allFeeds',
        type: 'boolean',
        default: false,
        description: 'Whether to apply to all feeds',
      },
      {
        displayName: 'Feed IDs (JSON)',
        name: 'feedIds',
        type: 'json',
        default: '[]',
        description: 'Array of feed IDs to apply to',
      },
      {
        displayName: 'Rule Config (JSON)',
        name: 'ruleConfig',
        type: 'json',
        default: '{}',
        description: 'Rule configuration (for type: rule)',
      },
      {
        displayName: 'Alert Config (JSON)',
        name: 'alertConfig',
        type: 'json',
        default: '{}',
        description: 'Alert configuration (for type: alert)',
      },
      {
        displayName: 'Memory Config (JSON)',
        name: 'memoryConfig',
        type: 'json',
        default: '{}',
        description: 'Memory configuration (for type: memory)',
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
    displayOptions: { show: { resource: ['enrichment'], operation: ['update'] } },
    options: [
      { displayName: 'Name', name: 'name', type: 'string', default: '', description: 'New name' },
      {
        displayName: 'Enabled',
        name: 'enabled',
        type: 'boolean',
        default: true,
        description: 'Whether enabled',
      },
      {
        displayName: 'All Feeds',
        name: 'allFeeds',
        type: 'boolean',
        default: false,
        description: 'Whether to apply to all feeds',
      },
      {
        displayName: 'Feed IDs (JSON)',
        name: 'feedIds',
        type: 'json',
        default: '[]',
        description: 'Updated feed IDs',
      },
      {
        displayName: 'Rule Config (JSON)',
        name: 'ruleConfig',
        type: 'json',
        default: '{}',
        description: 'Updated rule config',
      },
      {
        displayName: 'Alert Config (JSON)',
        name: 'alertConfig',
        type: 'json',
        default: '{}',
        description: 'Updated alert config',
      },
      {
        displayName: 'Memory Config (JSON)',
        name: 'memoryConfig',
        type: 'json',
        default: '{}',
        description: 'Updated memory config',
      },
    ],
  },

  // Preview fields
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
    displayOptions: { show: { resource: ['enrichment'], operation: ['preview'] } },
    description: 'The feed to preview enrichments against',
  },
  {
    displayName: 'Records (JSON)',
    name: 'records',
    type: 'json',
    default: '[]',
    required: true,
    displayOptions: { show: { resource: ['enrichment'], operation: ['preview'] } },
    description: 'Array of sample records to preview enrichment on (max 50)',
  },
];
