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

app.use("/uploads", express.static("src/uploads"));
app.use("/api/auth",require("./routes/auth.routes"));
app.use("/api/clientes", require("./routes/client.routes"));
app.use("/api/operadores", require("./routes/operador.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/empresas", require("./routes/company.routes"));
app.use("/api/reuniones", require("./routes/meeting.routes"));

app.use((err, req, res, next) => {
    res.status(400).json({ error: err.message });
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

module.exports = app;