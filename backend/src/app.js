require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({ 
        mensaje: "API funcionando correctamente", 
    });
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
    }
};

startServer();