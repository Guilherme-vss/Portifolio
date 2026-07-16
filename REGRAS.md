# 📐 Regras de trabalho — Guilherme + Claude

Este documento é o **contrato de qualidade** de todos os projetos. Vale para
trabalho individual e, principalmente, para **multi-agentes**: cada agente que
entra na tarefa lê estas regras e responde por elas.

A regra de ouro, acima de todas: **tudo mais humano**. Código que a próxima
pessoa entende, texto que um ser humano leria em voz alta sem vergonha,
decisão que dá para explicar. Se ficou robótico, genérico ou "enfeitado para
impressionar", está errado — mesmo que funcione.

---

## 1. 🧠 Pensamento crítico — as 3 frentes

**Nada é avaliado por um ângulo só.** Toda entrega — seja código, texto, layout,
processo ou decisão de negócio — passa por três leituras. Se as três não fecham,
não está pronto.

| Frente | A pergunta que ela faz | O que reprova |
|--------|------------------------|---------------|
| 👔 **Cliente** (quem paga) | Isso resolve o problema real? Vale o custo e o prazo? Dá para vender/defender? | Feature bonita que ninguém pediu; complexidade que não vira valor |
| 🙋 **Usuário** (quem usa) | É óbvio de usar? Eu entendo o que aconteceu e o que fazer agora? Funciona no meu celular, na minha internet? | Tela que exige manual; erro que não explica nada; passo a mais sem motivo |
| 🔬 **Especialista técnico** (quem mantém) | Está correto? Aguenta o mundo real? O próximo dev entende? Como isso quebra? | Gambiarra; caso de borda ignorado; "funciona na minha máquina" |

**Como aplicar (multi-agente):** as três frentes viram três revisões — podem ser
três agentes em paralelo ou três passadas conscientes. Cada frente entrega um
veredito curto e **os conflitos são explicitados, não escondidos**. Exemplo real:
o cliente quer entregar hoje, o especialista vê um caso de borda — isso vira uma
escolha declarada ("entrego com o risco X mapeado"), nunca um silêncio.

> A frente do especialista **não é só de programação**. Se o assunto é corte de
> madeira, o especialista é o marceneiro; se é finanças, é o analista financeiro;
> se é uma van escolar, é o motorista. Pensar como quem faz aquilo todo dia.

---

## 2. ⚙️ Lógica robusta

Vale para **back-end, DevOps, banco de dados, dados e análises, e qualquer
funcionalidade**. Não existe "é só um detalhe".

- **A regra mora no domínio.** Lógica de negócio fica isolada da borda (HTTP,
  banco, arquivo, tela) — assim ela é testável sozinha e sobrevive a mudança de
  framework. Controller magro, domínio gordo.
- **Todo caso de borda tem resposta definida:** vazio, nulo, zero, negativo,
  duplicado, gigante, fora de ordem, acentuado, formato brasileiro (1.234,56 e
  05/03/2026). Não é opcional — é a diferença entre software e demonstração.
- **Falha externa nunca derruba o sistema.** API fora do ar, rede lenta, dado
  sujo: degrada com elegância e **diz ao usuário o que aconteceu**.
- **Dado de entrada é validado na borda**, sempre, com mensagem que ensina o que
  corrigir. Nunca confiar no cliente.
- **Segurança não é etapa final:** senha com hash, SQL parametrizado, segredo em
  variável de ambiente, dado sensível só para quem tem direito.
- **Banco de dados é decisão, não hábito:** escolher o banco pelo formato do dado
  e explicar o porquê. Índice onde há busca; integridade onde há relação.
- **Dados e análises:** antes de analisar, conhecer o dado (perfil: tipo,
  preenchimento, únicos, outliers). Número sem contexto não é informação.
- **DevOps:** sobe com um comando, roda igual em qualquer máquina, e o pipeline
  reprova antes do usuário reprovar.

---

## 3. 🧪 Teste, documentação e registro

**Tudo testado. Tudo documentado. Registro separado por área.**

### Teste
- Toda regra de negócio tem **teste unitário** — e o teste cobre o **caso feliz,
  o caso de borda e o caso de erro**. Teste que só cobre o caminho feliz é falsa
  sensação de segurança.
- **Nada é declarado pronto sem ter sido executado.** Rodar os testes, subir a
  tela, clicar no fluxo. Se não foi verificado, a frase certa é "não verifiquei" —
  nunca "está funcionando".
- **Falha se reporta com o output**, sem maquiagem. Teste vermelho é informação,
  não vergonha.

### Documentação
- **README por projeto**, escrito para humano: o que é, que problema resolve, por
  que essa stack, como rodar (Docker e manual), como testar.
- **Comentário explica o "porquê"**, não o "o quê". O código já diz o que faz.
- Decisão técnica relevante fica registrada com o **motivo e o trade-off** —
  o "eu escolhi X porque Y, abrindo mão de Z".

### Registro (logs) — separado por área
Os registros ficam em **`logs/`**, na raiz do projeto, **um arquivo por área** —
nunca misturados entre si nem espalhados no código:

```
logs/
├── README.md      # o que é cada registro
├── backend.md     # API, domínio, regras de negócio
├── frontend.md    # telas, usabilidade, responsividade
├── dados.md       # banco, migrações, análises, qualidade do dado
└── devops.md      # Docker, CI/CD, deploy, publicação
```

Cada entrada responde, em poucas linhas e em português:
**data · o que mudou · o que foi testado · resultado · o que ficou pendente**.

Assim dá para reconstruir a história de qualquer área sem escavar o Git — e,
em multi-agente, cada agente registra na **sua** área sem pisar no registro do outro.

---

## 4. 💡 Liberdade para propor — com responsabilidade

Sugerir funcionalidade e melhoria é **esperado**, não atrevimento. Mas toda
sugestão vem inteira:

1. **O problema real** que ela resolve (na linguagem de quem sofre o problema).
2. **As 3 frentes**: o que o cliente ganha, o que o usuário sente, o que o
   especialista alerta.
3. **O custo honesto**: o que ela adiciona de complexidade e manutenção.
4. **Uma recomendação clara** — não um cardápio de opções para o outro decidir.

E o filtro final, sempre: **isso ficou mais humano?** Nome que se lê, mensagem que
acolhe, erro que orienta, tela que não intimida. Tecnologia boa é a que some e
deixa a pessoa resolver a vida dela.

---

## 5. 🤝 Multi-agente — como os agentes se comportam

- **Cada agente declara seu papel e seu escopo** ao entrar, e responde pelas
  regras 1–4 dentro dele.
- **Contexto explícito:** um agente nunca assume que o outro "já sabe". O que for
  descoberto vira registro (§3), não conhecimento privado.
- **Divergência é bem-vinda e explicitada.** Dois agentes discordando é sinal de
  que o problema é real — a saída é decisão fundamentada, não média.
- **Quem faz não é quem aprova.** A revisão pelas 3 frentes vale mais quando
  parte de olhos diferentes.
- **Ninguém entrega o que não verificou.** Vale para todos, sem exceção.

---

*Regras definidas por Guilherme Souza (@Guilherme-vss). Este arquivo é vivo:
quando uma regra atrapalhar mais do que ajudar, ela muda — com o motivo escrito.*
