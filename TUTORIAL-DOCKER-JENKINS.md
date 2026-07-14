# 🐳 Tutorial: Docker e Jenkins do zero

Este tutorial assume que você **nunca usou** Docker nem Jenkins. Vamos com calma.

---

## Parte 1 — Docker

### O que é?

Pense no Docker como uma "caixa" que embala um programa **junto com tudo que ele
precisa para rodar**: a linguagem, as bibliotecas, as configurações. Essa caixa
(chamada de **container**) roda igual em qualquer computador — acabou o famoso
"na minha máquina funciona".

Três conceitos que você vai ver o tempo todo:

| Termo | O que é | Analogia |
|-------|---------|----------|
| **Imagem** | O "molde" congelado do programa | A receita do bolo |
| **Container** | Uma imagem em execução | O bolo assado |
| **docker-compose** | Arquivo que descreve vários containers juntos | O cardápio completo (app + banco) |

### Instalando no Windows

1. Baixe o **Docker Desktop**: https://www.docker.com/products/docker-desktop/
2. Instale (ele vai pedir para habilitar o **WSL 2** — aceite; talvez precise
   reiniciar o computador).
3. Abra o Docker Desktop e espere o ícone da baleia ficar verde.
4. Teste no terminal (PowerShell):
   ```powershell
   docker --version
   docker run hello-world
   ```
   Se apareceu "Hello from Docker!", está tudo certo. 🎉

### Usando com os projetos deste repositório

Cada projeto tem um `docker-compose.yml` que sobe **o app e o banco de dados
juntos**, já configurados entre si. Basta entrar na pasta e rodar:

```powershell
cd rotakids        # ou metagrana, planify, portfolio
docker compose up -d --build
```

O que cada parte significa:
- `up` — sobe os containers descritos no arquivo
- `-d` — em segundo plano (o terminal fica livre)
- `--build` — reconstrói a imagem caso você tenha mudado o código

Comandos do dia a dia:

```powershell
docker compose ps            # o que está rodando?
docker compose logs -f app   # ver os logs do app ao vivo (Ctrl+C para sair)
docker compose down          # derrubar tudo
docker compose down -v       # derrubar E apagar os dados do banco (cuidado!)
```

Portas de cada projeto depois do `up`:

| Projeto | Endereço |
|---------|----------|
| portfolio | http://localhost:8080 |
| rotakids | http://localhost:3000 |
| metagrana | http://localhost:8000 (API docs em /docs) |
| planify | http://localhost:8081 |
| cortecerto | http://localhost:5080 |

---

## Parte 2 — Jenkins

### O que é?

Jenkins é um "robô" de **integração contínua (CI)**: toda vez que você muda o
código, ele automaticamente **baixa, testa e constrói** o projeto. Se um teste
quebrar, você fica sabendo na hora — antes de o problema chegar em produção.

Cada projeto deste repositório tem um **`Jenkinsfile`**: a receita que diz ao
Jenkins o que fazer, em etapas (**stages**): instalar dependências → rodar os
testes → construir a imagem Docker.

### Instalando o Jenkins (com Docker, claro!)

Já que você acabou de instalar o Docker, vamos usá-lo para subir o Jenkins —
sem instalar mais nada na máquina:

```powershell
docker run -d --name jenkins `
  -p 8090:8080 -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  jenkins/jenkins:lts
```

O que isso faz:
- `-p 8090:8080` — o painel do Jenkins fica em http://localhost:8090
- `-v jenkins_home:...` — guarda as configurações mesmo se o container reiniciar
- `-v /var/run/docker.sock:...` — permite que o Jenkins use o Docker da máquina
  para construir as imagens (necessário para os nossos Jenkinsfiles)

### Primeira configuração (só uma vez)

1. Acesse http://localhost:8090
2. Ele pede uma **senha inicial**. Pegue com:
   ```powershell
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Escolha **"Install suggested plugins"** e aguarde.
4. Crie seu usuário administrador.

### Criando o pipeline de um projeto

1. No painel: **New Item** → digite um nome (ex.: `rotakids`) →
   escolha **Pipeline** → OK.
2. Role até a seção **Pipeline**:
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: a URL do seu repositório no GitHub
     (ex.: `https://github.com/SEU-USUARIO/portfolio.git`)
   - **Branch**: `*/main`
   - **Script Path**: `rotakids/Jenkinsfile` (a pasta do projeto + `/Jenkinsfile`)
3. **Save** → **Build Now**.
4. Clique no build → **Console Output** para acompanhar cada etapa rodando.

Repita para os outros projetos, mudando só o **Script Path**
(`portfolio/Jenkinsfile`, `metagrana/Jenkinsfile`, `planify/Jenkinsfile`).

### Rodando automaticamente a cada push (opcional)

- **Jeito simples (polling):** no pipeline → Configure → **Build Triggers** →
  marque **Poll SCM** e use `H/5 * * * *` (verifica o GitHub a cada 5 minutos).
- **Jeito profissional (webhook):** exige que seu Jenkins seja acessível pela
  internet. No GitHub: Settings do repositório → Webhooks → Add webhook →
  URL `http://SEU-ENDERECO:8090/github-webhook/`. No Jenkins, marque
  **GitHub hook trigger for GITScm polling**.

### Dica sobre os agentes

Os Jenkinsfiles usam `agent any` e comandos `sh` (shell Linux) — funcionam
direto no Jenkins rodando em container Linux, como o do comando acima. O
pipeline do RotaKids e do portfólio precisam de **Node.js** e o do MetaGrana
de **Python** no agente; a forma mais fácil é instalar os plugins
**NodeJS** e usar o Docker (como o Jenkinsfile do Planify já faz, rodando o
Maven dentro de um container `maven:3.9`).

---

## Resumo do fluxo completo

```
você programa → git push → Jenkins detecta → roda os testes →
constrói a imagem Docker → (deploy, quando você quiser evoluir)
```

Com isso você tem o ciclo básico de DevOps rodando na sua máquina. 🚀
