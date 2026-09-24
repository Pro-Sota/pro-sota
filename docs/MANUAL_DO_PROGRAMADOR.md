# Manual do Programador — ProSota BackOffice

Versão do manual: 1.0 · Data: 23/09/2026 · Aplicação: `pro-sota` (`package.json`: versão 0.1.0).

## 1. Objectivo e âmbito

Este manual orienta a instalação, compreensão, desenvolvimento e manutenção do backOffice ProSota. Destina-se a programadores que assumam o projecto ou implementem novas funcionalidades.

Foi elaborado a partir dos ficheiros deste repositório. Descreve o código observado, sem certificar o funcionamento do ambiente remoto. Não foram executados o servidor, o build, o lint ou operações no Supabase durante a elaboração. As políticas de acesso, triggers, estrutura efectiva da base de dados e configuração de produção precisam de confirmação no ambiente correspondente.

O sistema reúne gestão de projectos, tarefas, equipas, clientes, leads, fornecedores, recursos, assiduidade, calendário, documentos, orçamento e mensagens. A existência de uma página ou serviço não significa que todos os seus fluxos estejam concluídos; consultar a secção 12.

## 2. Tecnologias e requisitos

| Elemento | Versão ou configuração observada | Utilização |
| --- | --- | --- |
| Next.js | 16.2.9 no lockfile | App Router, páginas, layouts e execução no servidor |
| React | 19.2.7 no lockfile | Componentes e interacção |
| TypeScript | Dependência `^5`; modo `strict` | Tipagem |
| Tailwind CSS | Dependência `^4` | Estilos |
| Supabase JS | 2.110.7 no lockfile | Acesso a dados, autenticação, Storage e Realtime |
| Supabase SSR | Dependência `^0.12.3` | Sessão por cookies |
| ESLint | Dependência `^9` | Análise estática com regras Next.js |
| Leaflet e bibliotecas Gantt/Kanban | Ver `package.json` | Mapas e planeamento |
| Prisma Client | 7.8.0 no lockfile | Dependência declarada; não assumir um fluxo de migrações Prisma |

Usar uma versão de Node.js compatível com **todas** as dependências. Node.js 22.12 ou superior dentro da série 22 satisfaz os requisitos dos pacotes Next.js, Supabase JS e Prisma Client registados no lockfile. O mínimo do Next.js, isoladamente, não basta: Supabase JS exige Node.js >=22.0.0.

São necessários npm, acesso ao repositório e a um projecto Supabase preparado para desenvolvimento. `package-lock.json` fixa a resolução das dependências; usar `npm ci` para reproduzi-la.

## 3. Preparação do ambiente

### 3.1 Instalar e configurar

Executar na raiz do backOffice, e não no repositório do website:

```powershell
node --version
npm --version
npm ci
```

Criar manualmente `.env.local` na raiz com os valores do ambiente de desenvolvimento:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
```

Estas são as duas variáveis de configuração Supabase lidas pelos clientes da aplicação. O prefixo `NEXT_PUBLIC_` torna os valores acessíveis ao navegador; nunca colocar uma chave administrativa ou `service_role` nestas variáveis. O `.gitignore` ignora `.env*`.

O proxy único em `src/proxy.ts` deriva os destinos HTTP(S) e WS(S) da política CSP a partir de `NEXT_PUBLIC_SUPABASE_URL`, evitando um domínio Supabase fixo.

### 3.2 Preparar o Supabase

Obter junto da equipa responsável um ambiente com o esquema, relações, políticas RLS e permissões necessários. O repositório contém `supabase/config.toml`, mas não contém migrações SQL nem um seed que reconstrua a aplicação.

Confirmar antes do primeiro uso:

1. Utilizador de teste em Supabase Auth e o respectivo registo em `profiles`, com `profile_id` correspondente ao identificador Auth.
2. Dados de teste e associações a projectos em `project_members`.
3. Buckets `profile-pictures` e `documents`, com políticas de leitura e escrita adequadas.
4. Tabelas e relações utilizadas pelo módulo a testar, incluindo `document_versions` para versões de documentos.
5. Configuração Realtime para `messages` e `project_members` quando forem testadas as actualizações em tempo real.
6. URLs e opções de autenticação compatíveis com o ambiente.

O ficheiro de configuração local indica API na porta 54321, PostgreSQL na 54322 e versão principal PostgreSQL 17. Estes valores descrevem o ambiente local configurado; não comprovam a configuração remota. Iniciar um Supabase vazio não cria automaticamente o esquema ProSota.

### 3.3 Executar

```powershell
npm run dev
```

Abrir `http://localhost:3000/login`. Para escolher outra porta:

```powershell
npm run dev -- --port 3001
```

Reiniciar o processo após alterar as variáveis de ambiente. Para validar o modo de produção local:

```powershell
npm run build
npm run start
```

O layout usa `next/font/google`; se o build falhar no carregamento de fontes, verificar a conectividade indicada pelo erro.

## 4. Estrutura do código

```text
pro-sota/
├── src/
│   ├── app/
│   │   ├── (auth)/             Login, registo e logout
│   │   ├── management/         Páginas do backOffice
│   │   ├── actions/            Server Actions de mensagens e recursos
│   │   ├── components/         Componentes partilhados e Kanban
│   │   ├── lib/supabase/       Clientes, autenticação e tipos
│   │   ├── layout.tsx          Layout global e fontes
│   │   └── globals.css         Estilos globais
│   ├── components/ui/          Componentes de interface reutilizáveis
│   ├── services/               Consultas e operações por domínio
│   ├── lib/utils.ts            Utilitários de interface
│   └── proxy.ts                Autenticação e cabeçalhos CSP
├── public/                    Ficheiros estáticos
├── supabase/config.toml       Configuração Supabase local
├── models.ts                  Outra cópia dos tipos gerados
├── next.config.ts             Configuração Next.js e cabeçalhos
├── package.json               Scripts e dependências
└── docs/MANUAL_DO_PROGRAMADOR.md
```

O alias `@/*` aponta para `src/*`, conforme `tsconfig.json`. Assim, `@/services/clients` corresponde a `src/services/clients.ts`.

### 4.1 Fluxo de dados

```text
Pedido de página → componente de servidor → serviço → cliente Supabase SSR
                                                      ↓
                                                 Base de dados
                                                      ↑
Interacção → componente cliente → serviço browser ou Server Action → serviço
```

O acesso não passa por uma única API interna: existem serviços usados no navegador, serviços de servidor e operações Supabase dentro de componentes. Antes de reutilizar uma função, verificar os seus imports e o contexto em que pode executar.

Exemplo existente: `management/projects/page.tsx` carrega `getProjects()` de `services/projects_server.ts` e entrega os resultados ao componente `projects.tsx`. O serviço obtém a sessão, procura o perfil e filtra os projectos através de `project_members`.

### 4.2 Separação cliente/servidor

- `app/lib/supabase/client.ts`: cria o cliente de navegador.
- `app/lib/supabase/server.ts`: recebe o cookie store obtido com `await cookies()` e cria o cliente SSR.
- `app/lib/supabase/middleware.ts`: gere cookies no contexto do pedido e da resposta.
- `app/actions/message.ts` e `app/actions/resources.ts`: expõem funções com `"use server"`.
- Componentes com `"use client"` suportam estado, eventos e APIs do navegador.

Não importar serviços dependentes de `next/headers` em componentes cliente. Para esses casos, usar uma Server Action ou carregar os dados na página de servidor. Nos segmentos dinâmicos existentes, `params` é tratado como Promise e aguardado antes de usar o identificador.

## 5. Rotas e módulos

Os grupos `(auth)`, `(details)` e `(edit)` organizam ficheiros sem acrescentar esses nomes ao URL. `[projectId]`, `[resourceId]` e `[chatId]` são parâmetros dinâmicos; `[[...folder]]` é um segmento opcional com vários níveis.

| Rota | Responsabilidade | Referências principais |
| --- | --- | --- |
| `/login`, `/register`, `/logout` | Autenticação | `app/(auth)`, `services/auth_client.ts` |
| `/management` | Dashboard | `management/dashboard.tsx`, `services/dashboard.ts` |
| `/management/projects` | Lista de projectos | `services/projects_server.ts` |
| `/management/projects/create-project` | Formulário de criação | `services/new_project.ts` |
| `/management/projects/[projectId]` | Redirecciona para `overview` | Página do segmento |
| `/management/projects/[projectId]/edit` | Edição | Grupo `(edit)` |
| `/management/tasks`, `/management/my-tasks` | Quadro Kanban | `components/kanban`, `services/project_tasks.ts` |
| `/management/tasks-and-schedule` | Página ainda básica | Página do segmento |
| `/management/team`, `/management/team/create-member` | Equipa e criação de membro | Páginas do módulo, serviços de autenticação |
| `/management/clients`, `/management/clients/create-client` | Clientes | `services/clients.ts` |
| `/management/leads` | Leads comerciais | `services/leads.ts` |
| `/management/suppliers`, `/management/suppliers/new` | Fornecedores | `services/supplier.ts`, `supplier_client.ts` |
| `/management/work-resources`, `/management/work-resources/[resourceId]` | Recursos e detalhe | `services/resources.ts`, `actions/resources.ts` |
| `/management/attendance` | Assiduidade | `services/attendance.ts` |
| `/management/calendar` | Calendário | `services/calendar.ts` |
| `/management/messages`, `/management/messages/[chatId]` | Conversas e mensagens | `services/messages.ts`, `actions/message.ts` |
| `/management/profile`, `/management/profile/edit` | Perfil | `services/auth_server.ts`, `auth_client.ts` |
| `/management/notifications` | Interface de notificações | Páginas do módulo |

Dentro de `/management/projects/[projectId]`, existem `overview`, `tasks`, `team`, `phases`, `phases/[phaseId]`, `timeline-and-milestone`, `documents/[[...folder]]`, `approvals-and-reviews` e `budget`.

Para localizar uma alteração: começar pela página, seguir os componentes importados, identificar o serviço e só depois a tabela. Nem todos os módulos usam a mesma convenção de ficheiros.

## 6. Autenticação e controlo de acesso

`auth_client.ts` implementa entrada com `signInWithPassword`, registo com `signUp` e operações de perfil. A criação de utilizador Auth e a criação de perfil são operações distintas no código; confirmar sempre ambos os registos ao diagnosticar uma conta.

`app/lib/supabase/auth.ts` disponibiliza `getAuthenticatedUser()` e `requireUser()`. A primeira devolve o utilizador ou `null`; a segunda redirecciona para `/login` quando não existe sessão válida.

O fluxo de autenticação funciona da seguinte forma:

- `src/proxy.ts` verifica a sessão em `/management` e nos seus descendentes, acrescentando `redirectTo` ao URL de login quando necessário. Também aplica CSP às páginas abrangidas pelo matcher.
- O cliente de middleware expõe a resposta actualizada após a renovação da sessão. Os cookies são preservados também nos redireccionamentos.
- `management/layout.tsx` é assíncrono e aguarda `requireUser()` antes de devolver o layout, permitindo ao Next.js tratar o sinal interno `NEXT_REDIRECT`.

Após esta correcção, TypeScript e lint dos ficheiros alterados passaram. Pedidos locais sem sessão a `/management` e `/management/projects?view=list` devolveram HTTP 307 para o login; `/login` devolveu HTTP 200. Não foi validado o login com uma conta real nem a renovação de sessão contra o Supabase.

Os tipos incluem `roles`, `permissions`, `role_permissions` e `project_members`. A existência destas estruturas não demonstra que todas as operações verificam permissões. Confirmar autorização no servidor e políticas RLS no Supabase para cada operação sensível, sobretudo nos acessos directos do navegador. Ocultar um botão não impede uma chamada à base de dados.

## 7. Dados e tipos

### 7.1 Mapa funcional

A tabela seguinte lista entidades referenciadas no código, não um inventário certificado do esquema remoto.

| Domínio | Tabelas ou entidades referenciadas |
| --- | --- |
| Identidade e acesso | `profiles`, `roles`, `permissions`, `role_permissions` |
| Projectos | `projects`, `project_members`, `clients` |
| Tarefas | `tasks`, `task_columns` |
| Fases e entregas | `phases`, `steps`, `deliverables`, `milestones`; os tipos também contêm `phase_steps` e `step_deliverables` |
| Comunicação | `conversations`, `conversation_participants`, `messages` |
| Documentação | `folders`, `documents`, `document_versions` |
| Aprovações | `submissions`, `submission_files` nos tipos |
| Comercial | `leads`, `suppliers`, `supplier_projects` nos tipos |
| Financeiro | `project_budgets`, `budget_revisions`, `project_costs`, `project_invoices`, `payment_records` |
| Recursos | `resources`, `resource_locations`, `resource_stock`, `resource_assignments`, `resource_movements`, `resource_maintenance`, `resource_delivery_terms`, `resource_attachments`, `project_resource_stock` |
| Operação | `attendance_records`, `calendar_events`, `site_visits`, `work_requests` |
| Actividade | `activities`, `activity_logs`; `phases.ts` também consulta `activity` |

Os relacionamentos lógicos principais são: perfil ↔ projecto por `project_members`; conversa ↔ perfil por `conversation_participants`; mensagens pertencem a conversas; documentos pertencem a pastas e têm versões. Confirmar chaves estrangeiras e regras de eliminação no esquema real antes de alterar dados relacionados.

### 7.2 Actualizar os tipos

Existem duas cópias: `models.ts` na raiz e `src/app/lib/supabase/models.ts`. Vários serviços importam a segunda, mas `npm run update-types` escreve na primeira e contém um identificador de projecto Supabase fixo.

Procedimento de manutenção:

1. Confirmar o projecto Supabase alvo e o acesso da CLI antes de executar a geração.
2. Gerar os tipos para um ficheiro temporário e verificar se a geração terminou sem erro.
3. Comparar as tabelas e enums gerados com as duas cópias existentes e os imports consumidores.
4. Actualizar deliberadamente o ficheiro usado pela aplicação; definir uma única fonte de tipos e alinhar o script numa alteração própria.
5. Executar análise TypeScript e build.

Não substituir uma cópia pela outra sem comparar: já existem diferenças e os serviços referenciam entidades ausentes dos tipos gerados. Exemplos: os serviços de fases usam `steps` e `deliverables`, enquanto os tipos registam `phase_steps` e `step_deliverables`.

Os tipos TypeScript não criam tabelas nem substituem migrações, constraints ou políticas RLS.

## 8. Fluxos que exigem atenção

### 8.1 Criação de projecto

O formulário actual importa `createProject` de `services/new_project.ts`. Essa função insere apenas o projecto e devolve uma tupla `[projecto, erro]`.

Existe outra função com o mesmo nome em `services/projects.ts`, que insere o projecto, associa o criador, cria uma conversa e associa o participante. As operações são sequenciais e podem falhar parcialmente; não constituem uma transacção única.

Como a listagem de `projects_server.ts` filtra por associação em `project_members`, um projecto inserido sem essa associação pode não aparecer ao criador. Verificar se o ambiente possui triggers que completem a operação antes de concluir que o fluxo está íntegro. Ao alterar a criação, escolher explicitamente qual contrato será usado e tratar falhas parciais.

### 8.2 Kanban

O componente partilhado está em `app/components/kanban/kanban_board.tsx`. Tipos e lógica auxiliar estão em `types.ts` e `logic/`; os serviços concentram operações de colunas e tarefas em `project_tasks.ts`, com carregamento de servidor em `projects_server.ts`.

Ao mudar uma tarefa, validar pertença ao projecto, coluna de destino, posição, responsável e persistência após recarregar. As páginas `tasks` e `my-tasks` chamam ambas `getTaskBoard()` sem argumentos; não inferir filtragem pessoal apenas pelo nome da rota.

### 8.3 Mensagens e Realtime

`actions/message.ts` valida identificadores e conteúdo não vazio antes de delegar em `services/messages.ts`. A página `[chatId]` subscreve alterações da tabela `messages` e remove o canal ao terminar a subscrição. A equipa do projecto também subscreve `project_members`.

Para diagnosticar problemas, confirmar sessão, participação na conversa, políticas de leitura/escrita, configuração Realtime e ligação WSS. Testar com dois utilizadores e verificar que mensagens não se duplicam após reconexão ou mudança de conversa.

### 8.4 Documentos e ficheiros

`upload_document.tsx`, no módulo de documentos do projecto, usa o bucket `documents`. O caminho é construído com projecto, pasta, UUID e nome normalizado. Primeiro envia o ficheiro e depois regista o documento e a versão em `documents`/`document_versions`. Existem tentativas de remoção do objecto quando ocorrem erros.

Storage e base de dados não formam uma transacção única neste fluxo. Testar falhas intermédias, nomes repetidos, novas versões, permissões da pasta e consistência dos metadados. O bucket `profile-pictures` é usado por `auth_client.ts` para fotografias de perfil; não presumir a mesma política de acesso para documentos.

### 8.5 Recursos e orçamento

`actions/resources.ts` traduz rótulos da interface para valores internos, como `Material consumível` → `material`, e valida campos numéricos e stock. As operações de recursos estão em `services/resources.ts`. Preservar a distinção entre stock, movimentos, atribuições, manutenção e estado operacional.

O módulo financeiro usa `services/budget.ts` para orçamento, revisões, custos, facturas e pagamentos. Ao alterar cálculos, confirmar unidades monetárias, arredondamento, datas e regras de agregação com os contratos reais; não assumir uma regra contabilística a partir de um rótulo da interface.

## 9. Como implementar uma funcionalidade

1. Identificar a rota e os serviços existentes do domínio. Ler `AGENTS.md`; este exige consultar os guias locais da versão instalada em `node_modules/next/dist/docs/` antes de escrever código Next.js.
2. Definir entradas, resultado esperado, estados vazios, falhas e quem pode realizar a operação.
3. Confirmar o esquema e, se necessário, preparar uma migração versionada, relações, índices e RLS. Actualmente não existe uma base de migrações neste repositório.
4. Actualizar os tipos e criar ou estender o serviço no contexto correcto, cliente ou servidor.
5. Para uma operação de servidor chamada pela interface, usar uma Server Action com validação e autorização próprias.
6. Construir o formulário ou vista reutilizando os componentes existentes. Validar também no servidor ou na camada de dados os campos relevantes.
7. Tratar carregamento, erro, sucesso e actualização da lista após guardar, sem apresentar sucesso antes da confirmação da persistência.
8. Validar o fluxo em dados de teste, incluindo acesso negado e falhas parciais. Actualizar este manual quando mudar uma convenção, variável, tabela ou rota.

Respeitar os contratos existentes: alguns serviços lançam erros e outros devolvem tuplas. Não misturar os padrões sem adaptar os consumidores. Evitar registos de payloads pessoais em produção; `new_project.ts`, por exemplo, contém logs detalhados que merecem revisão antes da publicação.

## 10. Verificação e qualidade

Scripts disponíveis:

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Verificação de tipos com as dependências instaladas |
| `npm run build` | Compilação de produção |
| `npm run start` | Servir um build já criado |
| `npm run update-types` | Geração de tipos; observar os cuidados da secção 7 |

Não existe script `test` em `package.json`, nem foi identificada uma suite de testes no inventário consultado. Não considerar um build bem-sucedido prova suficiente de autorização ou persistência.

Roteiro manual sugerido em ambiente de teste:

| Cenário | Resultado a confirmar |
| --- | --- |
| Acesso sem sessão a uma página de gestão | Bloqueio ou redireccionamento consistente |
| Login, recarregamento e logout | Sessão mantida e depois efectivamente terminada |
| Conta sem perfil ou sem associação ao projecto | Erro ou estado vazio compreensível, sem acesso indevido |
| Criar projecto | Registo persistido e visibilidade coerente para o criador |
| Criar e mover tarefa | Estado conservado após recarregar |
| Conversa com dois utilizadores | Entrega, actualização e isolamento entre conversas |
| Documento novo e nova versão | Objecto e metadados consistentes; sem duplicação indevida |
| Recurso com stock inválido | Rejeição da entrada e ausência de gravação parcial inesperada |
| Utilizador sem permissão | Operação recusada também na camada de dados |
| Falha de rede ou sessão expirada | Mensagem útil e ausência de falso sucesso |

Registar comandos executados, resultado, ambiente e limitações numa entrega de código. Corrigir ou justificar falhas antes de declarar a funcionalidade pronta.

## 11. Publicação e operação

Não foi identificado um pipeline de publicação no inventário consultado. O README original contém instruções genéricas de Next.js; não comprova um alojamento de produção existente.

Para uma publicação futura:

1. Definir plataforma com execução de servidor compatível com Next.js e a versão de Node seleccionada. A aplicação depende de cookies e operações de servidor; não assumir exportação estática.
2. Configurar as duas variáveis Supabase no ambiente de build/execução. Os valores públicos incorporados no cliente exigem novo build quando mudam.
3. Confirmar o esquema, políticas, buckets, Realtime e URLs de autenticação do ambiente alvo.
4. Confirmar a autenticação e os destinos da CSP em `src/proxy.ts`. O `next.config.ts` configura HSTS, `nosniff`, bloqueio de frames, política de referenciador, permissões de navegador e isolamento de origem.
5. Executar lint, verificação de tipos, build e o roteiro funcional pertinente num ambiente de validação.
6. Publicar uma versão identificável e conservar a anterior para reversão. Alterações à base de dados precisam de estratégia própria de compatibilidade e recuperação.

Confirmar backups e restauração com a equipa responsável pelo Supabase antes de alterações estruturais. Reverter o código não desfaz automaticamente alterações à base de dados ou ficheiros enviados.

## 12. Limitações e pontos de manutenção identificados

Estes itens resultam de leitura estática; não foram corrigidos como parte deste manual.

| Ponto | Evidência | Consequência para o programador |
| --- | --- | --- |
| Tipos duplicados | `models.ts` e `app/lib/supabase/models.ts` | Script e imports apontam para destinos diferentes |
| Esquema não reproduzível só pelo repositório | Apenas configuração em `supabase/` | Obter e versionar migrações, políticas e dados mínimos |
| Nomes de entidades divergentes | Serviços de fases e tipos | Comparar com o esquema real antes de alterar consultas |
| Criação de projecto com dois contratos | `new_project.ts` e `projects.ts` | A página usa o fluxo que só insere o projecto |
| Edição de perfil incompleta | `profile/edit/edit_form.tsx` | `handleSubmit` contém TODO para `updateProfile` |
| Guardar submissão incompleto no modal | `approvals-and-reviews/submission_modal.tsx` | Chamada de persistência está num TODO; o modal fecha sem a executar |
| Resumo da equipa incompleto | `create-project/summary_panel.tsx` | Lista de membros está vazia com TODO |
| Página de planeamento básica | `tasks-and-schedule/page.tsx` | Apenas título e texto de apresentação |
| CSP permissiva para scripts | `src/proxy.ts` | Mantém `unsafe-eval` e `unsafe-inline`; reforçar numa alteração específica com validação da interface |
| Metadados globais genéricos | `app/layout.tsx` | Título de template e `lang="en"` merecem alinhamento com o produto |

Priorizar a coerência da autenticação e do esquema, depois os fluxos de gravação incompletos e a consolidação de tipos. A ordem final depende do que estiver efectivamente em utilização.

## 13. Resolução de problemas

| Sintoma | Verificações iniciais |
| --- | --- |
| Instalação acusa versão incompatível | Node instalado versus `engines` das dependências no lockfile |
| Cliente Supabase não inicia | Nomes e valores de `.env.local`; reinício do servidor |
| Ligações bloqueadas por CSP | Console do navegador, proxy activo, domínio HTTPS/WSS configurado |
| Login funciona, mas gestão falha | Registo `profiles`, cookies, proxies e chamada assíncrona no layout |
| Projecto criado não aparece | `project_members`, serviço de criação usado e eventuais triggers |
| Consulta refere tabela/coluna inexistente | Esquema remoto versus serviço e tipos; não regenerar às cegas |
| Consulta devolve vazio ou acesso negado | Filtros, sessão, associações e políticas RLS |
| Upload falha | Bucket, políticas, pasta, objecto e tabelas de versões |
| Mensagens só aparecem ao actualizar | Subscrição, configuração Realtime, WSS e permissões |
| Guardar perfil ou submissão não persiste | TODOs descritos na secção 12 |
| Build falha em fontes | Erro de `next/font/google` e acesso de rede do ambiente |

## 14. Referências internas e manutenção do manual

Começar por `package.json`, `package-lock.json`, `AGENTS.md`, `next.config.ts`, `tsconfig.json`, os clientes em `src/app/lib/supabase/` e os serviços do domínio alterado. O código e o esquema verificado no ambiente são as fontes de verdade; este manual deve acompanhar a sua evolução.

Ao entregar uma alteração, documentar: comportamento alterado, ficheiros relevantes, migrações e configuração necessárias, verificações realizadas e limitações conhecidas. Rever este manual sempre que forem resolvidos os pontos da secção 12.

