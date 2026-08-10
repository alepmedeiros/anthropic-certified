# Fundamentos CCAR-F — Base de Conhecimento Completa (todos os 30 Task Statements)

Síntese em linguagem própria de TODO o conteúdo testável do Exam Guide oficial v1.0 — os 5 domínios, seus Task Statements completos, os 6 cenários, exercícios oficiais, e o que fica de fora. Sempre leia o PDF original (`ccar-f-guide.pdf`) para a versão definitiva; este documento é o resumo de estudo/grounding.

**Nota sobre formato:** a prova é 60 questões, 120 min, 4 dos 6 cenários sorteados, corte 720/1000. **Correção (ver `ADDENDUM-MULTI-RESPOSTA.md`):** a seção 3 do próprio `ccar-f-guide.pdf` ("Exam Details at a Glance") declara explicitamente "Item format: Multiple-choice and multiple-response items; each item states how many responses to select" — ou seja, a prova mistura single-choice e multi-response. As 12 questões de exemplo do guia serem todas single-choice é viés de amostra, não confirmação do formato geral. O simulado já suporta os dois formatos (`question_type`, `correct_options`, `select_count` no schema).

---

## D1 — Agentic Architecture & Orchestration (27%) — 7 Task Statements

**1.1 — Loop agentic:** controle de fluxo via `stop_reason` ("tool_use" = continua, "end_turn" = termina). Resultados de tool são anexados ao histórico da conversa para o próximo raciocínio. Antipadrões: parsear texto pra decidir quando parar, usar limite fixo de iterações como mecanismo principal, checar conteúdo de texto como indicador de conclusão.

**1.2 — Orquestração multi-agente (hub-and-spoke):** um coordenador gerencia toda comunicação entre subagentes, tratamento de erro e roteamento. O coordenador decompõe a tarefa, delega, agrega resultados, e decide dinamicamente quais subagentes invocar (não sempre rotear pelo pipeline inteiro). Risco: decomposição estreita demais deixa cobertura incompleta de tópicos amplos.

**1.3 — Configuração de subagentes:** `Task` precisa estar no `allowedTools` do coordenador para ele conseguir invocar subagentes. Subagentes **não herdam contexto automaticamente** — precisa passar explicitamente no prompt. `AgentDefinition` configura descrição, system prompt e restrição de ferramentas por tipo de subagente. `fork_session` permite explorar abordagens divergentes a partir de uma mesma base de análise. Boas práticas: incluir achados anteriores diretamente no prompt do subagente, separar conteúdo de metadados (fonte, data) pra preservar atribuição, disparar múltiplos `Task` numa mesma resposta pra paralelizar.

**1.4 — Workflows multi-etapa com enforcement e handoff:** diferença entre enforcement programático (hooks, gates) e orientação via prompt. Enforcement determinístico é necessário quando falha tem custo real (ex. verificação de identidade antes de operação financeira) — instrução em prompt tem taxa de falha não-zero. Handoff estruturado para escalonamento no meio do processo deve incluir dados do cliente, causa raiz e ação recomendada.

**1.5 — Hooks do Agent SDK:** `PostToolUse` intercepta resultado de tool antes do modelo processar (ex. normalizar formatos de data/status heterogêneos vindos de diferentes MCP tools). Hooks também podem interceptar chamadas de saída pra bloquear ação que viola política (ex. reembolso acima de limite) e redirecionar. Hooks dão garantia determinística; prompt dá conformidade probabilística.

**1.6 — Decomposição de tarefas complexas:** pipeline sequencial fixo (prompt chaining) para revisões previsíveis multi-aspecto vs. decomposição dinâmica adaptativa para investigação aberta. Dividir revisão de código grande em passes por arquivo + um pass de integração cross-file evita diluição de atenção.

**1.7 — Gestão de sessão (estado, retomada, fork):** `--resume <nome-da-sessão>` retoma sessão nomeada específica. `fork_session` cria branches independentes a partir de uma baseline compartilhada. Ao retomar após mudanças em arquivos já analisados, é preciso informar explicitamente o agente sobre essas mudanças. Começar sessão nova com um resumo estruturado é mais confiável que retomar com resultados de tool desatualizados.

---

## D2 — Tool Design & MCP Integration (18%) — 5 Task Statements

**2.1 — Design de interface de tool:** a descrição da tool é o principal mecanismo que o LLM usa pra escolher qual chamar — descrição mínima causa seleção não-confiável entre tools parecidas. Boas descrições incluem formato de input, exemplos, casos de borda e limites de uso. Tools ambíguas/sobrepostas (ex. `analyze_content` vs `analyze_document` quase idênticas) causam roteamento errado. Palavras-chave no system prompt também podem criar associação indevida com uma tool.

**2.2 — Erro estruturado em MCP:** flag `isError`. Categorias: erro transiente (timeout), validação (input inválido), negócio (violação de política), permissão. Mensagem genérica ("Operation failed") impede o agente de decidir a recuperação certa. Retornar `errorCategory`, `isRetryable` (booleano) e descrição legível. `retriable: false` + explicação amigável para violação de regra de negócio. Diferenciar falha de acesso (precisa decidir retry) de resultado vazio válido (busca bem-sucedida sem resultados).

**2.3 — Distribuição de tools e tool_choice:** dar tools demais a um agente (ex. 18 em vez de 4-5) degrada a confiabilidade de seleção. Agente com tools fora de sua especialização tende a usá-las mal. Escopar tools por papel, com poucas tools cross-role pra necessidades frequentes específicas. `tool_choice`: `"auto"` (livre), `"any"` (garante chamada de alguma tool, não especifica qual), forçado (nome específico) — usado pra garantir ordem (ex. forçar `extract_metadata` antes de enriquecimento).

**2.4 — Integração de servidores MCP:** `.mcp.json` (nível projeto, compartilhado via versionamento) vs. `~/.claude.json` (nível pessoal). Variável de ambiente (`${GITHUB_TOKEN}`) evita commitar segredo. Tools de todos os servidores MCP configurados ficam disponíveis simultaneamente ao se conectar. MCP resources expõem catálogos de conteúdo (sumários, hierarquia de docs, schemas) reduzindo chamadas exploratórias. Preferir servidor MCP da comunidade já existente a implementação própria para integrações padrão (ex. Jira); reservar custom pra workflows específicos do time.

**2.5 — Tools nativas (Read, Write, Edit, Bash, Grep, Glob):** `Grep` busca conteúdo (padrões, nomes de função, mensagens de erro); `Glob` busca por padrão de caminho/nome de arquivo; `Read`/`Write` para arquivo inteiro; `Edit` para modificação pontual com correspondência de texto único — quando `Edit` falha por texto não-único, usar `Read` + `Write` como fallback. Construir entendimento do código incrementalmente: `Grep` pra achar pontos de entrada, depois `Read` pra seguir imports, em vez de ler tudo de uma vez.

---

## D3 — Claude Code Configuration & Workflows (20%) — 6 Task Statements

**3.1 — Hierarquia de CLAUDE.md:** usuário (`~/.claude/CLAUDE.md`, não compartilhado via versionamento), projeto (raiz do repo ou `.claude/CLAUDE.md`), diretório (mais específico). Configuração de nível usuário não chega aos colegas de time — causa clássica de "novo membro do time não recebe as instruções". `@import` referencia arquivos externos pra manter CLAUDE.md modular (ex. importar só os padrões relevantes por pacote). `.claude/rules/` como alternativa a um CLAUDE.md monolítico. Comando `/memory` verifica quais arquivos de memória estão carregados.

**3.2 — Slash commands e skills customizados:** `.claude/commands/` (projeto, compartilhado via versionamento) vs. `~/.claude/commands/` (pessoal). Skills em `.claude/skills/` com `SKILL.md` e frontmatter: `context: fork` (roda em subagente isolado, não polui a conversa principal), `allowed-tools` (restringe ferramentas durante a skill), `argument-hint` (orienta parâmetros esperados). Skills = invocação sob demanda; CLAUDE.md = padrão sempre carregado.

**3.3 — Regras específicas por caminho (path-specific rules):** `.claude/rules/` com frontmatter YAML e campo `paths` com glob pattern (ex. `paths: ["**/*.test.tsx"]`) — carrega a regra só quando o arquivo editado casa com o padrão, reduzindo contexto irrelevante. Vantagem sobre CLAUDE.md por diretório: convenções que atravessam múltiplos diretórios (ex. arquivos de teste espalhados pelo repo).

**3.4 — Plan mode vs. execução direta:** plan mode para tarefas complexas — mudanças em larga escala, múltiplas abordagens válidas, decisões arquiteturais, modificação multi-arquivo. Execução direta para mudanças simples e bem delimitadas (ex. adicionar uma validação numa função). Plan mode permite exploração segura antes de comprometer mudanças, evitando retrabalho caro. `Explore` subagent isola descoberta verbosa e retorna resumo, preservando o contexto da conversa principal.

**3.5 — Refinamento iterativo:** exemplos concretos de input/output são mais eficazes que descrição em prosa quando a interpretação varia. Iteração orientada a teste: escrever suite de testes primeiro, iterar compartilhando falhas. Padrão de entrevista: Claude faz perguntas pra levantar considerações antes de implementar em domínio desconhecido. Problemas que interagem entre si → resolver numa única mensagem detalhada; problemas independentes → iteração sequencial.

**3.6 — Claude Code em CI/CD:** flag `-p` (ou `--print`) roda em modo não-interativo (evita travar esperando input). `--output-format json` + `--json-schema` produzem saída estruturada pra parsing automatizado (ex. postar comentário inline em PR). CLAUDE.md fornece contexto de projeto (padrões de teste, critérios de review) pro Claude Code invocado em CI. Sessão que gerou o código é menos eficaz revisando a si mesma — instância independente pega mais problema.

---

## D4 — Prompt Engineering & Structured Output (20%) — 6 Task Statements

**4.1 — Critério explícito para reduzir falso positivo:** critério específico e categórico (ex. "só sinalize comentário quando o comportamento reivindicado contradiz o código real") funciona melhor que instrução vaga ("seja conservador", "só reporte alta confiança"). Alta taxa de falso positivo numa categoria mina a confiança do time em categorias corretas — vale desativar temporariamente uma categoria problemática enquanto refina o prompt.

**4.2 — Few-shot pra consistência:** exemplos few-shot são a técnica mais eficaz quando instrução detalhada sozinha produz resultado inconsistente. Servem pra demonstrar tratamento de caso ambíguo, generalizar julgamento pra padrões novos (não só casos pré-especificados), e reduzir alucinação em extração (formatos variados de documento).

**4.3 — Output estruturado via tool_use e JSON schema:** `tool_use` com JSON schema é a forma mais confiável de garantir conformidade de schema, eliminando erro de sintaxe JSON (mas não erro semântico, tipo itens que não somam ao total). `tool_choice`: "auto" (pode responder em texto), "any" (deve chamar alguma tool), forçado (tool específica nomeada — usado pra garantir que uma extração específica rode antes de passos de enriquecimento). Campos opcionais/nulos quando a informação pode não existir na fonte, pra evitar que o modelo invente valor pra satisfazer campo obrigatório. Enum com "other" + campo de detalhe pra categoria extensível.

**4.4 — Validação, retry e feedback loop:** retry com feedback do erro específico anexado ao prompt guia a correção. Retry não resolve quando a informação simplesmente não existe na fonte (só resolve erro de formato/estrutura). Campo `detected_pattern` em achados estruturados permite análise sistemática de padrões de descarte.

**4.5 — Processamento em lote (batch):** Message Batches API — 50% de economia, até 24h de janela, sem SLA de latência garantido, sem suporte a chamada de tool multi-turn dentro de uma mesma requisição. Apropriado para trabalho não-bloqueante e tolerante a latência (relatório noturno); inadequado para checagem bloqueante (pre-merge). `custom_id` correlaciona request/response. Reenviar só os documentos que falharam (identificados por `custom_id`).

**4.6 — Arquitetura de revisão multi-instância/multi-pass:** autorrevisão é limitada — o modelo mantém o raciocínio da geração e tende a não questionar a própria decisão na mesma sessão. Instância independente (sem o contexto de raciocínio anterior) pega mais problema sutil. Dividir revisão grande em passes por arquivo + pass de integração cross-file evita diluição de atenção e achados contraditórios.

---

## D5 — Context Management & Reliability (15%) — 6 Task Statements

**5.1 — Preservar informação crítica em interações longas:** resumo progressivo corre o risco de condensar valores numéricos, percentuais, datas e expectativas do cliente em algo vago demais. Efeito "lost in the middle": modelo processa bem início e fim de input longo, mas pode perder achados do meio. Extrair fatos transacionais (valores, datas, números de pedido) num bloco persistente de "fatos do caso", fora do histórico resumido. Aparar saída verbosa de tool pros campos relevantes antes de acumular no contexto.

**5.2 — Escalonamento e resolução de ambiguidade:** gatilhos apropriados: pedido explícito do cliente por humano, exceção/lacuna de política (não só complexidade), incapacidade de progredir. Honrar pedido explícito do cliente imediatamente, sem tentar investigar primeiro. **Confiança auto-reportada e análise de sentimento são proxies não confiáveis** pra complexidade real do caso — o modelo pode estar "confiante" e errado. Quando há múltiplos matches (ex. clientes homônimos), pedir identificador adicional em vez de escolher por heurística.

**5.3 — Propagação de erro em sistemas multi-agente:** contexto de erro estruturado (tipo de falha, o que foi tentado, resultado parcial, alternativas) habilita decisão de recuperação inteligente pelo coordenador. Diferenciar falha de acesso (precisa decisão de retry) de resultado vazio válido. Status genérico ("search unavailable") esconde contexto valioso. Antipadrões: suprimir erro silenciosamente (retornar vazio como sucesso) e terminar o workflow inteiro por uma falha isolada.

**5.4 — Gestão de contexto em exploração de código grande:** em sessões longas o modelo degrada e passa a citar "padrões típicos" em vez de classes específicas já descobertas. Arquivos de scratchpad persistem achados-chave entre limites de contexto. Delegação a subagente isola exploração verbosa enquanto o agente principal coordena o entendimento de alto nível. Persistência de estado estruturado (manifest) pra recovery após falha. `/compact` reduz uso de contexto em sessões longas de exploração.

**5.5 — Revisão humana e calibração de confiança:** métrica agregada de acurácia (ex. "97% geral") pode esconder desempenho ruim num tipo específico de documento/campo. Amostragem aleatória estratificada pra medir taxa de erro em extrações de alta confiança e detectar padrão novo de erro. Score de confiança por campo, calibrado com conjunto de validação rotulado, pra rotear atenção de revisão. Validar acurácia por tipo de documento e campo antes de automatizar extrações de alta confiança.

**5.6 — Proveniência da informação e incerteza em síntese multi-fonte:** atribuição de fonte se perde quando achados são resumidos sem preservar o mapeamento claim→fonte. Dados conflitantes de fontes confiáveis: anotar o conflito com atribuição de fonte, não escolher um valor arbitrariamente. Exigir data de publicação/coleta nos outputs estruturados pra não confundir diferença temporal com contradição.

---

## Os 6 cenários oficiais (4 sorteados por prova)

1. **Customer Support Resolution Agent** — domínios primários: D1, D2, D5
2. **Code Generation with Claude Code** — domínios primários: D3, D5
3. **Multi-Agent Research System** — domínios primários: D1, D2, D5
4. **Developer Productivity with Claude** — domínios primários: D2, D3, D1
5. **Claude Code for Continuous Integration** — domínios primários: D3, D4
6. **Structured Data Extraction** — domínios primários: D4, D5

## O que NÃO cai na prova (confirmado no guia)

Fine-tuning/treino de modelo custom · autenticação/billing/conta da API · implementação detalhada de linguagem/framework específico · deploy/hospedagem de servidor MCP (infra, rede, containers) · arquitetura interna do Claude, treino, pesos · Constitutional AI/RLHF · embeddings/vector database · computer use (automação de navegador/desktop) · análise de imagem/visão · streaming API/server-sent events · rate limiting/quotas/cálculo de preço · OAuth/rotação de API key · **configuração específica de provedor de nuvem (AWS/GCP/Azure)** · benchmarking/comparação de modelo · detalhe de implementação de prompt caching · algoritmo de tokenização

## Exercícios práticos oficiais (resumo dos passos reais do guia)

**Exercício 1 (D1, D2, D5) — Agente multi-tool com escalonamento:** defina 3-4 MCP tools com descrições detalhadas (2 delas parecidas de propósito, pra forçar diferenciação clara); implemente loop checando `stop_reason`; adicione erro estruturado (`errorCategory`, `isRetryable`); implemente hook que bloqueia operação acima de um limite e redireciona pra escalonamento; teste com mensagem multi-assunto.

**Exercício 2 (D3, D2) — Claude Code pra time:** CLAUDE.md de projeto com padrões universais; `.claude/rules/` com glob por área de código; skill com `context: fork` e `allowed-tools`; um MCP server em `.mcp.json` (compartilhado) + um pessoal em `~/.claude.json`; teste plan mode vs. execução direta em tarefas de complexidade crescente.

**Exercício 3 (D4, D5) — Pipeline de extração estruturada:** tool de extração com schema (campo obrigatório, opcional/nulo, enum "other"+detalhe); loop de validação-retry incluindo o erro específico no reenvio; few-shot pra formatos variados de documento; lote de 100 documentos via Batches API com reenvio por `custom_id`; roteamento de revisão humana por confiança de campo.

**Exercício 4 (D1, D2, D5) — Pipeline de pesquisa multi-agente:** coordenador com `Task` no `allowedTools`, delegando a 2+ subagentes com contexto explícito no prompt; múltiplos `Task` numa resposta pra paralelizar; output estruturado separando conteúdo de metadados (fonte, data); simular timeout de subagente e verificar erro estruturado chegando ao coordenador; testar dado conflitante entre fontes e verificar que ambos os valores são preservados com atribuição, não escolha arbitrária.
