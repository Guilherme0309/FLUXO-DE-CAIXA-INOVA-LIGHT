const express = require('express');
const db = require('../database/db');
const router = express.Router();


router.get('/', (req, res) => {
    console.log("GET /");

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril",
        "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    db.all(
        `SELECT
            SUBSTR(DATA, 1, 7) AS MES,

            COALESCE(SUM(
                CASE WHEN TIPO_MOV = 'ENT' THEN VALOR ELSE 0 END
            ), 0) AS ENTRADAS,

            COALESCE(SUM(
                CASE WHEN TIPO_MOV = 'SAI' THEN VALOR ELSE 0 END
            ), 0) AS SAIDAS,

            COALESCE(SUM(
                CASE WHEN TIPO_MOV = 'ENT' THEN VALOR
                     WHEN TIPO_MOV = 'SAI' THEN -VALOR
                     ELSE 0 END
            ), 0) AS SALDO

        FROM MOVIMENTACOES
        WHERE DATA LIKE ?
        GROUP BY SUBSTR(DATA, 1, 7)
        ORDER BY MES`,

        [anoAtual + '-%'],

        (erro, totalMeses) => {
            if (erro) {
                console.error(erro);
                return res.status(500).send("Erro ao calcular totais!");
            }

            db.get(
                `SELECT
                    COALESCE(SUM(
                        CASE WHEN TIPO_MOV = 'ENT'
                        THEN VALOR ELSE 0 END
                    ), 0) AS ENTRADAS,

                    COALESCE(SUM(
                        CASE WHEN TIPO_MOV = 'SAI'
                        THEN VALOR ELSE 0 END
                    ), 0) AS SAIDAS,

                    COALESCE(SUM(
                        CASE WHEN TIPO_MOV = 'ENT' THEN VALOR
                             WHEN TIPO_MOV = 'SAI' THEN -VALOR
                             ELSE 0 END
                    ), 0) AS SALDO

                FROM MOVIMENTACOES
                WHERE DATA LIKE ?`,

                [anoAtual + '-%'],

                (erro, totais) => {
                    if (erro) {
                        console.error(erro);
                        return res.status(500).send("Erro ao calcular totais!");
                    }

                    
                  db.all(
                      `SELECT *
                      FROM MOVIMENTACOES
                      WHERE TIPO_MOV = 'ENT'
                      ORDER BY DATA DESC, ID DESC
                      LIMIT 5`,

                      (erro, ultimasEntradas) => {
                          if (erro) {
                              console.error(erro);
                              return res.status(500).send(
                                  "Erro ao buscar últimas entradas!"
                              );
                          }
                          console.log (JSON.stringify(ultimasEntradas))
                          res.render('pagInicial', {
                              totais,
                              totalMeses,
                              anoAtual,
                              meses,
                              ultimasEntradas
                          });
                      }
                  );

                }
            );
        }
    );
});


router.get('/novaMovimentacao', (req, res) => {
  console.log("GET /novaMovimentacao")
  db.all('SELECT * FROM MOVIMENTACOES ORDER BY id DESC', [], (erro, movs) => {
    if (erro) return res.status(500).send('Erro ao consultar banco');
    const hoje = new Date();
    const dataAtual = [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, '0'),
        String(hoje.getDate()).padStart(2, '0')
    ].join('-');

    res.render('novaMov', { movs, dataAtual });
  });
});

router.post('/novaMovimentacao', (req, res) => {
  console.log("POST /novaMovimentacao");
  console.log(req.body);
  const { tipo_mov, data, descricao, valor } = req.body;

  //Converte o valor para número decimal
    const valorNumerico = Number(valor);
  
  //PUXA A DATA ATUAL
    const hoje = new Date();

    const dataAtual = [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, '0'),
        String(hoje.getDate()).padStart(2, '0')
    ].join('-');

  //VALIDAÇÕES
  if (!["ENT", "SAI"].includes(tipo_mov)) {
        return res.status(400).send("Tipo de movimentação inválido!");
  } else if (typeof descricao !== "string" || descricao.trim() === "") {
        return res.status(400).send("Descrição obrigatória!");
  } else if (!Number.isFinite(valorNumerico) || valorNumerico <= 0){
    return res.status(400).send("Valor inválido!");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return res.status(400).send("Data inválida!");
  } else if (data > dataAtual) {
    return res.status(400).send(
        "Não é possível cadastrar uma movimentação com data futura!"
    );
}

  db.run('INSERT INTO movimentacoes (TIPO_MOV, DATA, DESCRICAO, VALOR) VALUES (?, ?, ?, ?)', [tipo_mov, data, descricao, valor], (erro) => {
    if (erro) return res.status(500).send('Erro ao gravar movimentação');
    res.redirect('/novaMovimentacao');
  });
});

router.get('/TabMovimentacoes', (req, res) => {
  console.log ("get /TabMovimentacoes");
  console.log (req.query);

  //Recebe a Pagina
  const pag = Number(req.query.pag) || 1;

  // Recebe o mês e a página pela URL
  const hoje = new Date();
    const mesAtual = 
    hoje.getFullYear() +
    '-' +
    String(hoje.getMonth() + 1).padStart(2, '0'); //padStart completa com 0 a esquerda ate ficas com 2 caracteres
    const mes = req.query.mes || mesAtual; //Recebe ou mes passado nos parametros ou mes atual 
    console.log("Mes: ", mes)

    //Recebe movPadrao
    const movPadrao = "%";
    const tipo_mov = req.query.tipo_mov || movPadrao;
    console.log ("Tipo Mov: ", tipo_mov);

    let totalMes;

    db.get(
    `SELECT
        COALESCE(SUM(CASE
            WHEN TIPO_MOV = 'ENT'
            THEN VALOR
            ELSE 0
        END), 0) AS ENTRADAS,

        COALESCE(SUM(CASE
            WHEN TIPO_MOV = 'SAI' 
            THEN VALOR
            ELSE 0
        END), 0) AS SAIDAS,

        COALESCE(SUM(CASE
            WHEN TIPO_MOV = 'ENT' 
            THEN VALOR
            ELSE -VALOR
        END), 0) AS SALDO

    FROM MOVIMENTACOES
    WHERE DATA LIKE ?`,

    [mes + '%'],

    (erro, totalMes) => {
        if (erro) {
            return res.status(500).send("Erro ao calcular totais!");
        }
        console.log(totalMes);
        
        db.all( 
        `SELECT * FROM MOVIMENTACOES
         WHERE DATA LIKE ? AND TIPO_MOV LIKE ?
         ORDER BY DATA DESC`,
        [mes + '%', tipo_mov],
        (erro, dados) => {

            if (erro) {
                return res.status(500).send(
                    "Erro ao buscar movimentações!"
                );
            }

            // Quantidade total de páginas
            const totalPaginas = Math.max(
                1,
                Math.ceil(dados.length / 8)
            );

            // Garante que a página esteja dentro do limite
            const pagina = Math.max(
                1,
                Math.min(Math.floor(pag), totalPaginas)
            );

            res.render('TabMovimentacoes', {
                dados: dados,
                pag: pagina,
                mes: mes,
                tipo_mov: tipo_mov,
                totalPaginas: totalPaginas,
                totalMes: totalMes
            });
        }
    );
    }
);

});


module.exports = router;
