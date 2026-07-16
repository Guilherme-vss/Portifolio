# 🗄️ Registro — Dados

Bancos, migrações, análises e qualidade do dado. Formato em [`README.md`](README.md).

---

## 2026-07-16 — Início do registro por área

- **O que mudou:** adoção do [REGRAS.md](../REGRAS.md).
- **O que foi testado:** nada (mudança de processo).
- **Resultado:** —
- **Pendências:** entradas anteriores estão só no histórico do Git.

## 2026-07-15 — Planify: profiling e consolidação financeira

- **O que mudou:** o sistema passou a **conhecer o dado antes de organizar**:
  detecção de tipo por coluna (número, moeda, data, texto, vazia) por maioria
  dos valores preenchidos; estatísticas (mín, máx, média, soma) para colunas
  numéricas; contagem de únicos e % de preenchimento (qualidade do dado).
  Consolidação financeira: agrupa por categoria e soma valores, com percentual
  do total, ordenado do maior para o menor.
- **O que foi testado:** JUnit + Vitest (a mesma lógica existe nos dois lados) —
  formato brasileiro (`R$ 1.234,56` → 1234.56), datas `dd/MM/yyyy` → ISO,
  categoria vazia vira `(sem categoria)`, coluna sem número não gera estatística.
- **Resultado:** ✅ 34 (Java) + 19 (TS) testes, 0 falhas.
- **Pendências:** outliers ainda não são sinalizados no perfil — candidato natural
  à próxima evolução (um valor absurdo hoje entra na média sem aviso).

## 2026-07-15 — Bancos por projeto (decisão registrada)

- **O que mudou:** nada no esquema; registro da **razão** de cada escolha:
  - **PostgreSQL** (RotaKids, CorteCerto): dados relacionais de verdade —
    pais→alunos→vínculos→presenças; pedidos→itens. Integridade importa.
  - **MongoDB** (MetaGrana): metas e gastos são documentos de formato variável
    (meta de carro ≠ meta de video game). Schema flexível é vantagem aqui.
  - **MySQL** (Planify): histórico simples e tabular, com JPA/Hibernate — a dupla
    mais comum do mercado corporativo Java.
- **O que foi testado:** —
- **Resultado:** decisão documentada (regra 2: banco é decisão, não hábito).
- **Pendências:** nenhuma.

## 2026-07-15 — RotaKids: coluna `avatar`

- **O que mudou:** `alunos.avatar VARCHAR(8) DEFAULT '🧒'` no `db/init.sql`.
- **O que foi testado:** criação do esquema pelo `docker-entrypoint-initdb.d`.
- **Resultado:** ⚠️ não executado localmente (sem Docker nesta máquina); o
  `init.sql` roda na primeira subida do container.
- **Pendências:** confirmar na primeira execução com Docker.
