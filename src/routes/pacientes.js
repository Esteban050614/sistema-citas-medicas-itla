const express = require("express");
const service = require("../services/pacientesService");
const router = express.Router();

function validar(body) {
  const nombre = String(body.nombre || "").trim();
  const documento = String(body.documento || "").trim();
  if (!nombre || !documento) return "El nombre y el documento son obligatorios.";
  if (nombre.length > 120 || documento.length > 40) return "Revisa la longitud del nombre o documento.";
  return null;
}
router.get("/", (req, res) => res.json(service.listar()));
router.get("/:id", (req, res) => {
  const item = service.obtener(Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Paciente no encontrado." });
  res.json(item);
});
router.post("/", (req, res, next) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  try { res.status(201).json(service.crear(normalizar(req.body))); } catch (e) { next(e); }
});
router.put("/:id", (req, res, next) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const item = service.actualizar(Number(req.params.id), normalizar(req.body));
    if (!item) return res.status(404).json({ error: "Paciente no encontrado." });
    res.json(item);
  } catch (e) { next(e); }
});
router.delete("/:id", (req, res, next) => {
  try {
    if (!service.eliminar(Number(req.params.id))) return res.status(404).json({ error: "Paciente no encontrado." });
    res.status(204).end();
  } catch (e) { next(e); }
});
function normalizar(b) {
  return {
    nombre: String(b.nombre || "").trim(),
    documento: String(b.documento || "").trim(),
    fecha_nacimiento: b.fecha_nacimiento || null,
    telefono: String(b.telefono || "").trim() || null,
    correo: String(b.correo || "").trim() || null,
    direccion: String(b.direccion || "").trim() || null
  };
}
module.exports = router;
