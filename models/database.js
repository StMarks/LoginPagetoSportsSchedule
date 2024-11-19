const mysql = require('mysql2');

const pool = mysql.createPool({
     connectionLimit: 10,
     host: 'localhost',
     user: 'root',
     password: 'qrwe',
     database: 'mydb'
});

console.log(pool);

pool.query('SELECT * FROM users', (err, result, fields) => {
     if (err) {
          return console.log(err);
     }
     return console.log(result);
});

module.exports = pool;