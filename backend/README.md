# 📒 Projeto Letrola - Back-end

## Descrição

Este é o servidor backend para o jogo educacional Letrola. Construído com Node.js e Express, este servidor é responsável por gerenciar toda a lógica de negócio, dados do jogo e progresso dos jogadores. Ele se comunica com um banco de dados SQLite para persistir as informações e expõe uma API RESTful para o frontend consumir.

## 🚀 Funcionalidades

-   **Gerenciamento de Progresso:** Salva e recupera o progresso de cada jogador, incluindo a fase atual, estrelas ganhas e tempo de conclusão.
-   **Conteúdo Dinâmico das Fases:** Serve os itens (frutas), diálogos e outras informações específicas de cada mundo e fase diretamente do banco de dados.
-   **Controle de Acesso:** Valida se um jogador tem permissão para acessar uma determinada fase com base em seu progresso.
-   **Estrutura Escalável:** Projetado com um esquema de "Mundos" e "Fases" para facilitar a adição de novo conteúdo sem a necessidade de alterar o código do frontend.

## Pré-requisitos

Para rodar este projeto, você precisará ter instalado em sua máquina:
-   [Node.js](https://nodejs.org/) (versão 14 ou superior)
-   [npm](https://www.npmjs.com/) (geralmente vem instalado com o Node.js)

## 📂 Estrutura do backend
```
📦 backend
├── 📂 node_modules
├── 📂 routes
│   ├── dialogos.js
│   ├── fases.js
│   ├── itensFase.js
│   ├── progresso.js
├── .gitignore
├── db.js
├── initDatabase.js
├── package-lock.json
├── package.json
├── progresso.db
├── README.md
├── server.js
├── testeApi.js
```
## 📌 Como Rodar o Projeto

### Clonar o repositório
```sh
git clone https://github.com/DevIcaroo/ProjetoLetrola.git
cd ProjetoLetrola
```
### Instalar dependências a partir da raiz da pasta `backend`:
    ```bash
    npm install
    ```
Isso instalará o Express, SQLite3, CORS e outras dependências necessárias.

A primeira vez que você rodar o servidor, o banco de dados `database.db` será criado automaticamente, junto com todas as tabelas e dados de teste definidos em `initDatabase.js`.

## Como Rodar o Servidor

Para iniciar o servidor, execute o seguinte comando na raiz da pasta `backend`:

```bash
node server.js
```

Por padrão, o servidor irá rodar em `http://localhost:3000`.

## Estrutura dos Arquivos

-   `server.js`: O arquivo principal que inicia o servidor Express e configura as rotas e middlewares.
-   `db.js`: Configura a conexão com o banco de dados SQLite.
-   `initDatabase.js`: Script para criar as tabelas e popular o banco com dados iniciais de teste.
-   `/routes`: Contém os arquivos que definem os endpoints da API (ex: `progresso.js`, `fases.js`).

## API Endpoints (Rotas)

A seguir estão os endpoints disponíveis para o frontend consumir.

---

### Progresso do Jogador

#### `POST /salvar-progresso`
Salva ou atualiza o progresso de um jogador em uma fase específica.

-   **Corpo da Requisição (JSON):**
    ```json
    {
      "id_jogador": "nome-do-jogador",
      "mundo": 1,
      "fase": 1,
      "estrelas": 3,
      "tempo_gasto": 55
    }
    ```
-   **Resposta de Sucesso (201):**
    ```json
    {
      "message": "Progresso salvo/atualizado com sucesso."
    }
    ```

#### `GET /progresso/:id_jogador/:mundo_id`
Busca a fase mais alta que um jogador pode acessar em um determinado mundo.

-   **Parâmetros:**
    -   `id_jogador` (string): O nome do jogador.
    -   `mundo_id` (number): O ID do mundo.
-   **Resposta de Sucesso (200):**
    ```json
    {
      "fase_atual": 2 
    }
    ```
    *(Significa que o jogador pode jogar até a fase 2)*

#### `GET /estrelas/:id_jogador/:mundo_id/:fase_id`
Busca o número de estrelas que um jogador obteve em uma fase específica.

-   **Parâmetros:**
    -   `id_jogador` (string)
    -   `mundo_id` (number)
    -   `fase_id` (number)
-   **Resposta de Sucesso (200):**
    ```json
    {
      "estrelas": 3
    }
    ```
    *(Retorna `{ "estrelas": 0 }` se a fase nunca foi jogada)*

---

### Conteúdo do Jogo

#### `GET /itens-fase/:mundo_id/:fase_id`
Retorna todos os itens (frutas) de uma fase específica.

-   **Parâmetros:**
    -   `mundo_id` (number)
    -   `fase_id` (number)
-   **Resposta de Sucesso (200):**
    ```json
    [
      {
        "id": 1,
        "mundo": 1,
        "fase": 1,
        "ordem": 1,
        "resposta": "UVA",
        "letras": "[\"U\",\"V\",\"A\"]",
        "dica1": "Sou uma fruta pequena.",
        "dica2": "Cresço em cachos e faço suco.",
        "imagem_url": "/uva.svg"
      },
      { ...outros itens... }
    ]
    ```

#### `GET /fase/:id_jogador/:mundo_id/:fase_id`
Verifica se um jogador tem permissão para acessar uma fase.

-   **Parâmetros:**
    -   `id_jogador` (string)
    -   `mundo_id` (number)
    -   `fase_id` (number)
-   **Resposta de Sucesso (200 - Acesso Permitido):**
    ```json
    {
      "permitido": true
    }
    ```
-   **Resposta de Erro (403 - Acesso Negado):**
    ```json
    {
      "permitido": false,
      "mensagem": "Você precisa concluir a Fase 1 primeiro!"
    }
    ```