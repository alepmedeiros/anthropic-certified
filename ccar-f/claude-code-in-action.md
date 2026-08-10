# Curso: Claude Code in Action

**Domínio da prova coberto:** D3 — Claude Code Configuration & Workflows (20%)

## Conteúdo do curso (o que estudar)
- Hierarquia de CLAUDE.md: usuário (`~/.claude/CLAUDE.md`), projeto (raiz do repo, versionado), diretório (mais específico prevalece sobre o mais genérico)
- `.claude/rules/` com frontmatter YAML e glob patterns (ex. `paths: ['**/*.test.tsx']`) para convenções que cruzam diretórios
- Hooks de automação (garantia determinística, ex. bloquear conclusão até os testes passarem)
- Plan mode vs. execução direta — quando usar cada um
- Skills com frontmatter (`context: fork`, `allowed-tools`)
- Integração de Claude Code em CI/CD — padrão seguro (PR para revisão humana, nunca auto-merge direto)

Referência de apoio: `FUNDAMENTOS-CCARF.md`, seção D3.

## Cobertura atual no banco de questões
- D3: 5 questões (d3-1 a d3-5)

## Gap — o que precisa ser criado
- **+5 questões novas em D3** (chegar a 10, proporcional ao peso 20% num banco de 50)

## Instrução para o Claude Code gerar as questões
1. Ler `FUNDAMENTOS-CCARF.md` (seção D3) e o `ccar-f-guide.pdf` (Task Statements de D3)
2. Gerar cenários **originais** testando: conflito de hierarquia de CLAUDE.md, quando usar `.claude/rules/` vs. CLAUDE.md por pasta, automação via hooks vs. instrução em texto, critério para escolher plan mode, integração segura em pipeline de CI/CD
3. Formato: 1 cenário + 4 alternativas + 1 correta + 3 distratores plausíveis
4. Seguir o shape de objeto já usado em `seed.ts`
5. Citar o Task Statement específico no campo `reinforce`
