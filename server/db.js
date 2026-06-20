const { Pool } = require("pg");

const pool = new Pool({
    host: "localhost",
    port: 5433,
    user: "postgres",
    password: "hello1789",
    database: "chatdb"
});

module.exports = pool;