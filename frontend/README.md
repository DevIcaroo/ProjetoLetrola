# 📒 Projeto Letrola - Front-end

Este é o front-end do projeto Letrola, um jogo sério voltado para a alfabetização de crianças.

## 🚀 Funcionalidades


## 🛠️ Tecnologias Utilizadas
- **Frontend:** React, CSS

## 📂 Estrutura do Projeto
```
📦 frontend
├── 📂 node_modules
├── 📂 public //aqui estão todas as imagens
├── 📂 src
│   ├── 📂 components
│   │   ├── Modal.jsx
│   ├── 📂 pages
│   │   ├── Fase1.jsx
│   │   ├── Fase2.jsx
│   │   ├── Fase3.jsx
│   │   ├── Fase4.jsx
│   │   ├── Fase5.jsx
│   │   ├── GameMap.jsx
│   │   ├── Home.jsx
│   │   ├── 📂 styles
│   │   ├── Fase.css
│   │   ├── GameMap.css
│   │   ├── Home.css
│   │   ├── Modal.css
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
Acesse **http://localhost:3000** no navegador.

## 📜 Padrões de Commit
Seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

- **feat:** Adicionar nova funcionalidade.
- **fix:** Corrigir um erro.
- **docs:** Alterações na documentação.
- **style:** Ajustes de formatação (espaços, indentação, etc.).
- **refactor:** Melhorias no código sem alterar funcionalidades.
- **test:** Adição ou modificação de testes.
- **chore:** Outras mudanças que não afetam o código-fonte.