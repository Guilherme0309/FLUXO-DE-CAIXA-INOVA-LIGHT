const express = require('express');
const path = require('path');
require('./database/db');
const paginas = require('./routes/paginas');
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'troque-esta-chave-em-producao', resave: false, saveUninitialized: false }));
app.use('/', paginas);

app.use((req, res) => res.status(404).send('Página não encontrada'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));
