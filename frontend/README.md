# 📒 Projeto Letrola - Front-end

## Descrição

Este é o frontend para o jogo educacional Letrola, construído com **React** e Vite. Esta aplicação é a interface com a qual o jogador interage, oferecendo uma experiência de jogo dinâmica, visual e responsiva. Ele se comunica com o backend através de uma API RESTful para buscar dados das fases, salvar o progresso e garantir que a lógica do jogo seja consistente.


## 🚀 Funcionalidades
- **Mapa do Jogo:** Visualização interativa do progresso do jogador através das fases.
- **Fases Progressivas:** Cinco fases com desafios de alfabetização, cada uma focada em diferentes habilidades de leitura e escrita.
- **Interface Responsiva:** Layout adaptável para diferentes tamanhos de tela.
- **Navegação entre Páginas:** Transição fluida entre tela inicial,mapa do jogo e fases.
- **Estilização Personalizada:** Temas e elementos visuais voltados para o público infantil.
- **Gerenciamento de Estado:** Controle do progresso do usuário e das respostas em tempo real.
- **Carregamento de Imagens:** Utilização de imagens educativas para enriquecer a experiência.

## Tecnologias Utilizadas

-   **[React](https://react.dev/)**: Biblioteca principal para a construção da interface de usuário.
-   **[Vite](https://vitejs.dev/)**: Ferramenta de build moderna e rápida para o desenvolvimento frontend.
-   **[React Router](https://reactrouter.com/)**: Para o gerenciamento de rotas e navegação entre as diferentes telas do jogo (Home, Mapa, Fases).

## Pré-requisitos

Para rodar este projeto, você precisará ter instalado em sua máquina:
-   [Node.js](https://nodejs.org/) (versão 14 ou superior)
-   [npm](https://www.npmjs.com/) (geralmente vem instalado com o Node.js)

## 📂 Estrutura do frontend
```
📦 frontend
├── 📂 node_modules
├── 📂 public //aqui estão todas as imagens
├── 📂 src
│   ├── 📂 components
│   │   ├── Cronometro.jsx
│   │   ├── Modal.jsx
│   │   ├── ScoreDisplay.jsx
│   ├── 📂 pages
│   │   ├── Ajuda.jsx
│   │   ├── Fase1.jsx
│   │   ├── Fase2.jsx
│   │   ├── Fase3.jsx
│   │   ├── Fase4.jsx
│   │   ├── Fase5.jsx
│   │   ├── GameMap.jsx
│   │   ├── Home.jsx
│   ├── 📂 services
│   │   ├── apiFases.js
│   │   ├── apiItensFase.js
│   │   ├── apiProgresso.js
│   ├── 📂 styles
│   │   ├── Ajuda.css
│   │   ├── Fase.css
│   │   ├── GameMap.css
│   │   ├── Home.css
│   │   ├── Modal.css
│   │   ├── ScoreDisplay.css
│   ├── App.jsx
│   ├── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── vite.config.js
```

## 📌 Como Rodar o Projeto
### 1️⃣ Clonar o repositório
```sh
git clone https://github.com/DevIcaroo/ProjetoLetrola.git
cd ProjetoLetrola
```
### 2️⃣ Instalar dependências
```sh
yarn install
# ou
npm install
```
### 4️⃣ Rodar o projeto React
```sh
cd frontend
yarn start
# ou
cd frontend
npm run dev
```
Acesse **http://localhost:5173** no navegador.

## 📜 Padrões de Commit
Seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

- **feat:** Adicionar nova funcionalidade.
- **fix:** Corrigir um erro.
- **docs:** Alterações na documentação.
- **style:** Ajustes de formatação (espaços, indentação, etc.).
- **refactor:** Melhorias no código sem alterar funcionalidades.
- **test:** Adição ou modificação de testes.
- **chore:** Outras mudanças que não afetam o código-fonte.