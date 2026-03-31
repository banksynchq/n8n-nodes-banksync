import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class BankSyncApi implements ICredentialType {
  name = 'bankSyncApi';
  displayName = 'BankSync API';
  documentationUrl = 'https://docs.banksync.io';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your BankSync API key (starts with bsk_)',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.banksync.io',
      description: 'API base URL. Only change for staging or self-hosted.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      method: 'GET',
      url: '/v1/banks',
      baseURL: '={{$credentials.baseUrl}}',
    },
  };
}
