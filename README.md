# Base Node.js + Express + EJS + SQLite

Projeto inicial com HTML, CSS, JavaScript, Express, EJS, express-session, SQLite3 e Nodemon.

## Requisitos
- Node.js LTS e npm

## Iniciar
```bash
npm install
npm run dev
```
Acesse http://localhost:3000

O arquivo `database/database.db` é criado automaticamente ao iniciar o servidor. A tabela `tarefas` também é criada automaticamente.

Para iniciar sem Nodemon: `npm start`.

## Estrutura
- `app.js`: configuração do servidor
- `routes/paginas.js`: rotas HTTP
- `database/db.js`: conexão e criação da tabela SQLite
- `views/index.ejs`: HTML com EJS
- `public/css/style.css`: CSS
- `public/js/script.js`: JavaScript do navegador

## Atenção
A chave padrão de sessão é apenas para desenvolvimento. Em produção, defina `SESSION_SECRET` em variável de ambiente e utilize um armazenamento de sessão persistente, HTTPS e medidas de segurança adicionais.
