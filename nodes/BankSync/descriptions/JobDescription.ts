import type { INodeProperties } from 'n8n-workflow';

export const jobOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['job'] } },
    options: [
      {
        name: 'Cancel',
        value: 'cancel',
        action: 'Cancel a job',
        description: 'Cancel a running job',
      },
      { name: 'Get', value: 'get', action: 'Get a job', description: 'Retrieve a job' },
      { name: 'List', value: 'list', action: 'List jobs', description: 'List jobs for a feed' },
    ],
    default: 'list',
  },
];

export const jobFields: INodeProperties[] = [
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
    displayOptions: { show: { resource: ['job'], operation: ['list', 'get', 'cancel'] } },
    description: 'The feed the job belongs to',
  },
  {
    displayName: 'Job ID',
    name: 'jobId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: { show: { resource: ['job'], operation: ['get', 'cancel'] } },
    description: 'The ID of the job',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: { show: { resource: ['job'], operation: ['list'] } },
    options: [
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: { minValue: 1 },
        default: 20,
        description: 'Maximum number of jobs to return',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Queued', value: 'queued' },
          { name: 'In Progress', value: 'in_progress' },
          { name: 'Completed', value: 'completed' },
          { name: 'Failed', value: 'failed' },
          { name: 'Cancelled', value: 'cancelled' },
        ],
        default: '',
        description: 'Filter by job status',
      },
    ],
  },
];
