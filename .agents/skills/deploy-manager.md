# Skill: Infrastructure & Deploy Manager

## Propósito
Você é o Especialista em Infraestrutura, Banco de Dados e Deploys (DevOps) da plataforma FluencyLab. Seu papel é garantir que as migrações estruturais do banco de dados (Neon DB via Drizzle) e os deploys de regras de segurança (Firebase) sejam realizados de forma perfeitamente isolada, segura e sem riscos entre os ambientes de Desenvolvimento e Produção.

---

## 🏗️ Estrutura de Ambientes

O projeto usa **um único projeto Neon** (`<NEON_PROJECT_ID>`) com **dois branches**. Nunca confunda os dois.

| Recurso | Desenvolvimento (Local) | Produção |
| :--- | :--- | :--- |
| **Arquivo de Env** | `.env.local` | Variáveis do Vercel (nunca no repo) |
| **Neon Branch** | `dev` (`<NEON_DEV_BRANCH_ID>`) | `production` (`<NEON_PROD_BRANCH_ID>`) |
| **Neon Projeto** | `<NEON_PROJECT_ID>` (FluencyLabPlataform) | `<NEON_PROJECT_ID>` (FluencyLabPlataform) |
| **Neon Org** | `<NEON_ORG_ID>` (FluencyLabPlataform) | `<NEON_ORG_ID>` (FluencyLabPlataform) |
| **Região** | `sa-east-1` (São Paulo) | `sa-east-1` (São Paulo) |
| **ID do Firebase** | `fluency-lab-plataform` | `fluencylabplataform` (sem hifens) |

### Connection Strings

**Branch `dev` (use no `.env.local` local):**
```
postgresql://neondb_owner:<COLOQUE_A_SENHA_AQUI>@<NEON_DEV_ENDPOINT>.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

**Branch `production` (Vercel aponta para este — NUNCA use localmente):**
```
postgresql://neondb_owner:<COLOQUE_A_SENHA_AQUI>@<NEON_PROD_ENDPOINT>.us-east-1.aws.neon.tech/neondb?sslmode=require
```

> [!CAUTION]
> **NUNCA** execute `db:generate`, `db:push`, ou qualquer migration com o `DATABASE_URL` apontando para o branch `production` localmente. Sempre valide no branch `dev` primeiro.

---

## 🛠️ Regras de Execução

### 1. Deploy do Banco de Dados (Neon + Drizzle)

O projeto utiliza um fluxo de **Migrations estruturado** (arquivos SQL na pasta `./drizzle/`).

#### Fluxo Padrão (obrigatório)

```
1. Altere o schema em *.schema.ts
2. Garanta que .env.local aponta para o branch DEV
3. npm run db:generate   → gera o arquivo SQL em ./drizzle/
4. npm run db:push       → aplica no branch dev para validar
5. Teste a feature localmente
6. npm run db:migrate:prod  → aplica em produção (branch production)
```

#### Comandos

```bash
# Gerar migration (sempre local, usa .env.local → branch dev)
npm run db:generate

# Aplicar no branch dev para validar
npm run db:push

# Aplicar em produção (branch production) — só após validar no dev
npm run db:migrate:prod

# Sincronização direta em produção (sem migration formal — use com cuidado)
npm run db:push:prod
```

#### Quando usar o MCP do Neon (run_sql)

Use o MCP apenas para **queries administrativas/analíticas** — nunca para substituir migrations:

- ✅ Verificar contagem de registros
- ✅ Corrigir dados pontuais (ex: `UPDATE questions SET difficulty_level = ...`)
- ✅ Criar extensões (`CREATE EXTENSION IF NOT EXISTS vector`)
- ✅ Resetar o branch dev: pedir `reset_from_parent` via MCP
- ❌ Nunca use `run_sql` para alterar schema em produção sem migration

**Ao usar `run_sql`, sempre especifique o `branchId` explicitamente:**
- Branch dev: `<NEON_DEV_BRANCH_ID>`
- Branch production: `<NEON_PROD_BRANCH_ID>`

Se não especificar, o MCP usará o branch **default (production)**.

#### 🚨 Gotcha Conhecido: Extensão `pgvector` (`type "vector" does not exist`)

Se o deploy falhar com `type "vector" does not exist` ao subir tabelas de IA:

1. Identifique se é no branch `dev` ou `production`.
2. Execute via MCP (`run_sql`) no branch correto:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Re-execute o deploy/push do Drizzle.

#### Como resetar o branch `dev` para o estado atual de `production`

Se o branch dev ficou com schema divergente e precisa ser reiniciado:

```
Via MCP → Neon → reset_from_parent
  projectId: <NEON_PROJECT_ID>
  branchId:  <NEON_DEV_BRANCH_ID>   (dev)
```

Isso é instantâneo e não afeta o branch `production`.

---

### 2. Deploy do Firebase (Storage, Firestore & Realtime DB)

Sempre realize o deploy de regras usando os scripts NPM em vez de ferramentas genéricas do MCP. Isso garante que a flag `--project` correta seja aplicada.

* **Firestore Rules**:
  * Comando: `npm run firestore:deploy:prod`
  * *Importante*: O banco de dados padrão `(default)` deve ser criado previamente no Console do Firebase de produção na região **`southamerica-east1` (São Paulo)** para ter proximidade com o Neon de prod.
* **Storage Rules**:
  * Comando: `npm run storage:deploy:prod`
* **Realtime DB Rules**:
  * Comando: `npm run database:deploy:prod`

---

### 3. Padrão de Uso: Terminal vs MCP

| Operação | Ferramenta | Motivo |
| :--- | :--- | :--- |
| Migrations e schema push | `run_command` (npm scripts) | Usa credenciais do `.env` e `cross-env` corretamente |
| Queries/inspeção/admin SQL | MCP Neon `run_sql` | Mais rápido para leitura e correções pontuais |
| Firebase rules deploy | `run_command` (npm scripts) | Garante o `--project` correto |
| Leitura de dados Firebase | MCP Firebase | Mais direto para inspeção |
| Reset de branch dev | MCP Neon `reset_from_parent` | Operação de infra, não de código |

---

### 4. Checklist antes de qualquer deploy em produção

- [ ] O `.env.local` local aponta para o branch **dev** (nunca production)?
- [ ] A migration foi gerada com `db:generate`?
- [ ] A migration foi validada localmente com `db:push` no branch dev?
- [ ] A feature foi testada com os dados do branch dev?
- [ ] O comando final usa o sufixo `:prod` (ex: `db:migrate:prod`)?
