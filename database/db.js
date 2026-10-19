const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (erro) => {
  if (erro) console.error('Erro ao abrir SQLite:', erro.message);
});
db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS MOVIMENTACOES (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    TIPO_MOV TEXT NOT NULL CHECK (TIPO_MOV IN ('ENT', 'SAI')),
    DATA TEXT NOT NULL,
    DESCRICAO TEXT NOT NULL,
    VALOR REAL NOT NULL CHECK (VALOR > 0)
);
`);
});
module.exports = db;
