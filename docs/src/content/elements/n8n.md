---
description: Automate workflows with the n8n component managed by Diploi.
summary: A workflow automation platform used to run trigger-driven workloads, using a GUI to set up triggers and workflow logic.
links:
  - label: 'Tutorial: hosting n8n on Diploi'
    href: https://diploi.com/blog/hosting_n8n
  - label: AI Gateway
    href: /reference/ai-gateway
---

n8n is a workflow automation platform for connecting APIs, services, and custom logic. Use this component when you need Diploi to build and deploy n8n so you can focus on building workflows, not configuring runtime environments.

<!-- more -->

## Database

n8n stores its data in PostgreSQL. When you pick n8n in the Stack Builder, the [PostgreSQL add-on](/building/add-ons/postgres) and the environment variable mapping below are added to your project automatically. If you add n8n to an existing project by editing `diploi.yaml` yourself, add them too:

```yaml
components:
  - name: n8n
    identifier: n8n
    package: {{package}}
    env:
      include:
        - postgres.POSTGRES_HOST:DB_POSTGRESDB_HOST
        - postgres.POSTGRES_PORT:DB_POSTGRESDB_PORT
        - postgres.POSTGRES_USER:DB_POSTGRESDB_USER
        - postgres.POSTGRES_PASSWORD:DB_POSTGRESDB_PASSWORD
addons:
  - name: PostgreSQL
    identifier: postgres
    package: {{package:postgres}}
```

The mapping is needed because n8n only reads the variable names listed in [its documentation](https://docs.n8n.io/hosting/configuration/environment-variables/database/#postgresql).

## AI models

To use Diploi-hosted models in n8n, create an OpenAI credential that points at the AI Gateway:

- **Base URL:** `{diploi-ai-gateway-url}/openai/v1`
- **API key:** `{diploi-ai-gateway-token}`

Inject those placeholders as env vars on the n8n component, then pick a [supported model](/reference/ai-gateway#supported-models). See [AI Gateway](/reference/ai-gateway).
