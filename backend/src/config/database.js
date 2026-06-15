require("dotenv").config();
const sql = require("mssql");

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,

    options: {
        encrypt: false,
        trustServerCertificate: true
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log("SQL Server conectado");
        }
        return pool;
    } catch (error) {
        console.error("Error de conexión:", error);
        throw error;
    }
};

module.exports = {
    sql,
    connectDB
};