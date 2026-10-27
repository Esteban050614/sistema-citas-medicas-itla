const express = require("express");
const path = require("path");
const pacientes = require("./routes/pacientes");
const citas = require("./routes/citas");
require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (req, res) => res.json({ estado: "ok", sistema: "Sistema de Gestión de Citas Médicas" }));
app.use("/api/pacientes", pacientes);
app.use("/api/citas", citas);

app.use((err, req, res, next) => {
  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({ error: "Ya existe un registro con ese documento o correo." });
  }
  if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
    return res.status(409).json({ error: "No se puede completar la operación porque el registro está relacionado con otros datos." });
  }
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor." });
});

app.listen(PORT, () => console.log(`Sistema disponible en http://localhost:${PORT}`));
