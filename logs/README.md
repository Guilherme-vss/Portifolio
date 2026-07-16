# 📋 Registros por área

Aqui fica a história de cada área do projeto, **separada** — como manda a
[regra 3 do REGRAS.md](../REGRAS.md). Um arquivo por área, sem misturar:

| Arquivo | Cobre |
|---------|-------|
| [`backend.md`](backend.md) | APIs, domínio, regras de negócio (Node, Python, Java, .NET) |
| [`frontend.md`](frontend.md) | Telas, usabilidade, responsividade (React, Vue, Angular, Svelte) |
| [`dados.md`](dados.md) | Bancos, migrações, análises, qualidade do dado |
| [`devops.md`](devops.md) | Docker, CI/CD, deploy e publicação |

## Como registrar

Uma entrada por mudança relevante, sempre em português e nesta ordem:

```markdown
## AAAA-MM-DD — Título curto do que aconteceu

- **O que mudou:** ...
- **O que foi testado:** ... (comando e cenários)
- **Resultado:** ... (número de testes, o que passou/falhou)
- **Pendências:** ... (ou "nenhuma")
```

**Por que separado?** Para reconstruir a história de uma área sem escavar o Git —
e, em multi-agente, cada agente escreve na *sua* área sem pisar no registro do outro.

**O que NÃO vai aqui:** log de execução da aplicação (isso é `stdout`/arquivo de
runtime). Aqui é registro de trabalho: o que foi feito, testado e concluído.
