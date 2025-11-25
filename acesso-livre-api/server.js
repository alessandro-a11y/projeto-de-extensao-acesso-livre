const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ROTA GET: Carregar todos os depoimentos
app.get('/api/depoimentos', async (req, res) => {
    try {
        // Renomeamos a coluna para 'data' para garantir que o frontend receba o nome esperado
        const [rows] = await pool.query(
            'SELECT id, nome, texto, data_criacao AS data FROM depoimentos ORDER BY data_criacao DESC'
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao carregar depoimentos:', err);
        res.status(500).json({ error: 'Falha interna ao carregar os dados.' });
    }
});

// ROTA POST: Salvar um novo depoimento
app.post('/api/depoimentos', async (req, res) => {
    const { nome, texto } = req.body;

    if (!nome || !texto) {
        return res.status(400).json({ error: 'Nome e texto do depoimento são obrigatórios.' });
    }

    try {
        // Deixamos o MySQL gerenciar o timestamp usando NOW() para máxima precisão
        const query = 'INSERT INTO depoimentos (nome, texto, data_criacao) VALUES (?, ?, NOW())';
        
        await pool.query(query, [nome, texto]);

        res.status(201).json({ message: 'Depoimento salvo com sucesso!', nome, texto });
    } catch (err) {
        console.error('Erro ao salvar depoimento:', err);
        res.status(500).json({ error: 'Falha interna ao salvar o depoimento.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('API pronta para receber requisições...');
});