# n8n-nodes-banksync

n8n community node for the [BankSync](https://banksync.io) financial data API.

Connect your bank accounts, transactions, balances, and more to 500+ n8n integrations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

**Package name:** `n8n-nodes-banksync`

## Nodes

### BankSync

Action node with CRUD operations across all BankSync resources:

| Resource    | Operations                                     |
| ----------- | ---------------------------------------------- |
| Bank        | List, Get, Delete                              |
| Account     | List, Get                                      |
| Transaction | List (with pagination & date filtering)        |
| Balance     | Get (live balance)                             |
| Trade       | List                                           |
| Holding     | List                                           |
| Loan        | Get                                            |
| Feed        | List, Get, Create, Update, Delete, Sync, Learn |
| Job         | List, Get, Cancel                              |
| Enrichment  | List, Get, Create, Update, Delete, Preview     |
| Integration | List, Delete                                   |

### BankSync Trigger

Polling trigger node with two modes:

- **New Transactions** — Polls for new transactions using cursor-based incremental sync
- **Job Completed** — Polls for newly completed sync jobs

## Credentials

1. Log in to [BankSync](https://app.banksync.io)
2. Go to **Settings > API Keys**
3. Create a new API key with the scopes you need
4. In n8n, create a new **BankSync API** credential and paste your key

API keys start with `bsk_` and are workspace-scoped.

### Scopes

| Scope               | Access                                                           |
| ------------------- | ---------------------------------------------------------------- |
| `banks:read`        | Banks, accounts, transactions, balances, trades, holdings, loans |
| `banks:write`       | Delete banks                                                     |
| `feeds:read`        | List/get feeds                                                   |
| `feeds:write`       | Create/update/delete feeds                                       |
| `jobs:read`         | List/get jobs                                                    |
| `jobs:write`        | Trigger syncs, cancel jobs, trigger learn                        |
| `enrichments:read`  | List/get enrichments, preview                                    |
| `enrichments:write` | Create/update/delete enrichments                                 |
| `workspaces:read`   | List integrations                                                |
| `workspaces:write`  | Delete integrations                                              |

## Example Workflows

### Transaction alerts

BankSync Trigger (New Transactions) -> IF (amount > 200) -> Slack

### Sync to database

Schedule -> BankSync (Transaction List, Return All) -> Postgres

### Balance monitoring

Schedule (hourly) -> BankSync (Balance Get) -> IF (current < 5000) -> Email

### Sync health monitoring

Schedule (30min) -> BankSync (Job List, status=failed) -> IF (has items) -> Slack

## Development

```bash
pnpm install
pnpm run build
pnpm test
```

To test locally with n8n:

```bash
# Link the node
cd ~/.n8n/custom
ln -s /path/to/n8n-nodes-banksync

# Start n8n
pnpm run dev
```

## License

[MIT](LICENSE)
