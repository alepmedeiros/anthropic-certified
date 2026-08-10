# Curso: Introduction to Model Context Protocol

**Domínio da prova coberto:** D2 — Tool Design & MCP Integration (18%)

## Conteúdo do curso (o que estudar)
- Design de tool definitions: escopo estreito e explícito por ferramenta vs. ferramentas genéricas/ambíguas
- `tool_choice`: "auto" (livre), "any" (garante chamada, não especifica qual), forçado (nome específico)
- MCP como mecanismo de centralização de ferramentas reutilizáveis (evita duplicação entre consumidores)
- Escopo de servidores MCP: `.mcp.json` (projeto, versionado, compartilhado) vs. `~/.claude.json` (pessoal)
- Variáveis de ambiente em `.mcp.json` (ex. `${GITHUB_TOKEN}`) para credenciais sem commit de segredo
- Tratamento de erro estruturado: `isError`, categoria do erro (transiente/validação/permissão/negócio), `isRetryable`
- MCP resources — expor catálogos de conteúdo pra reduzir chamadas exploratórias

Referência de apoio: `FUNDAMENTOS-CCARF.md`, seção D2.

## Cobertura atual no banco de questões
- D2: 4 questões (d2-1 a d2-4)

## Gap — o que precisa ser criado
- **+5 questões novas em D2** (chegar a 9, proporcional ao peso 18% num banco de 50)

## Instrução para o Claude Code gerar as questões
1. Ler `FUNDAMENTOS-CCARF.md` (seção D2) e o `ccar-f-guide.pdf` (Task Statements de D2)
2. Gerar cenários **originais** testando: design de tool ambígua vs. estreita, escolha de `tool_choice`, motivação de usar MCP vs. duplicar lógica, escopo de configuração MCP (projeto vs. pessoal), diferenciação de categorias de erro
3. Formato: 1 cenário + 4 alternativas + 1 correta + 3 distratores plausíveis
4. Seguir o shape de objeto já usado em `seed.ts`
5. Citar o Task Statement específico no campo `reinforce`
