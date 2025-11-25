const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1', 
    port: 3306,     
    user: 'root',      
    password: process.env.senha_do_mysql, // <<-- IMPORTANTE: Mude para a sua senha REAL do MySQL!
    database: 'acessolivre_db', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;