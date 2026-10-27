const express = require("express");
const service = require("../services/citasService");
const router = express.Router();

function normalizar(b) {
  return {
    id_paciente: Number(b.id_paciente),
    id_medico: Number(b.id_medico),
    fecha_hora: String(b.fecha_hora || "").trim(),
    motivo: String(b.motivo || "").trim(),
    observaciones: String(b.observaciones || "").trim() || null
  };
}
function validar(d) {
  if (!Number.isInteger(d.id_paciente) || d.id_paciente < 1) return "Selecciona un paciente.";
  if (!Number.isInteger(d.id_medico) || d.id_medico < 1) return "Selecciona un médico.";
  if (!d.fecha_hora || !d.motivo) return "La fecha, la hora y el motivo son obligatorios.";
  if (Number.isNaN(Date.parse(d.fecha_hora))) return "La fecha y hora no son válidas.";
  return null;
}
router.get("/", (req, res) => res.json(service.listar()));
router.get("/catalogos", (req, res) => res.json(service.catalogos()));
router.post("/", (req, res, next) => {
  const data = normalizar(req.body), error = validar(data);
  if (error) return res.status(400).json({ error });
  try { res.status(201).json(service.crear(data)); } catch (e) { next(e); }
});
router.put("/:id", (req, res, next) => {
  const data = normalizar(req.body), error = validar(data);
  if (error) return res.status(400).json({ error });
  try {
    const item = service.actualizar(Number(req.params.id), data);
    if (!item) return res.status(404).json({ error: "Cita no encontrada." });
    res.json(item);
  } catch (e) { next(e); }
});
router.patch("/:id/confirmar", (req, res) => {
  if (!service.confirmar(Number(req.params.id))) return res.status(409).json({ error: "Solo se pueden confirmar citas que estén pendientes." });
  res.json({ mensaje: "Cita confirmada correctamente." });
});
router.patch("/:id/atender", (req, res) => {
  if (!service.atender(Number(req.params.id))) return res.status(409).json({ error: "Solo se pueden marcar como atendidas las citas confirmadas." });
  res.json({ mensaje: "Cita marcada como atendida." });
});
router.patch("/:id/cancelar", (req, res) => {
  if (!service.cancelar(Number(req.params.id))) return res.status(409).json({ error: "Solo se pueden cancelar citas pendientes o confirmadas." });
  res.json({ mensaje: "Cita cancelada correctamente." });
});
module.exports = router;
