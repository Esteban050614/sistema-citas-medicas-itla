const db = require("../database/db");

function listar() {
  return db.prepare(`
    SELECT c.*, up.nombre AS paciente, p.documento, um.nombre AS medico, e.nombre AS especialidad
    FROM Cita c
    JOIN Paciente p ON p.id_paciente = c.id_paciente
    JOIN Usuario up ON up.id_usuario = p.id_usuario
    JOIN Medico m ON m.id_medico = c.id_medico
    JOIN Usuario um ON um.id_usuario = m.id_usuario
    LEFT JOIN Especialidad e ON e.id_especialidad = m.id_especialidad
    ORDER BY c.fecha_hora DESC
  `).all();
}
function obtener(id) {
  return db.prepare("SELECT * FROM Cita WHERE id_cita = ?").get(id);
}
function validarHorario(idMedico, fechaHora, excluirId = null) {
  const sql = `
    SELECT id_cita FROM Cita
    WHERE id_medico = ? AND fecha_hora = ? AND estado != 'Cancelada'
      AND (? IS NULL OR id_cita != ?)
  `;
  return db.prepare(sql).get(idMedico, fechaHora, excluirId, excluirId);
}
function crear(data) {
  if (validarHorario(data.id_medico, data.fecha_hora)) {
    const error = new Error("Ese médico ya tiene una cita activa en ese horario.");
    error.status = 409; throw error;
  }
  const result = db.prepare(`
    INSERT INTO Cita (id_paciente, id_medico, fecha_hora, motivo, estado, observaciones)
    VALUES (@id_paciente, @id_medico, @fecha_hora, @motivo, 'Pendiente', @observaciones)
  `).run(data);
  return obtener(result.lastInsertRowid);
}

function actualizar(id, data) {
  const cita = obtener(id);

  if (!cita) {
    return null;
  }

  if (["Atendida", "Cancelada"].includes(cita.estado)) {
    const error = new Error(
      "No se puede editar una cita atendida o cancelada."
    );
    error.status = 409;
    throw error;
  }

  if (validarHorario(data.id_medico, data.fecha_hora, id)) {
    const error = new Error(
      "Ese médico ya tiene una cita activa en ese horario."
    );
    error.status = 409;
    throw error;
  }

  const result = db.prepare(`
    UPDATE Cita
    SET id_paciente = @id_paciente,
        id_medico = @id_medico,
        fecha_hora = @fecha_hora,
        motivo = @motivo,
        observaciones = @observaciones
    WHERE id_cita = @id
  `).run({ ...data, id });

  return result.changes ? obtener(id) : null;
}

function cambiarEstado(id, estadoActual, estadoNuevo) {
  return db.prepare("UPDATE Cita SET estado=? WHERE id_cita=? AND estado=?")
    .run(estadoNuevo, id, estadoActual).changes > 0;
}
function confirmar(id) { return cambiarEstado(id, "Pendiente", "Confirmada"); }
function atender(id) { return cambiarEstado(id, "Confirmada", "Atendida"); }
function cancelar(id) {
  return db.prepare("UPDATE Cita SET estado='Cancelada' WHERE id_cita=? AND estado IN ('Pendiente','Confirmada')").run(id).changes > 0;
}
function catalogos() {
  return {
    
pacientes: db.prepare(`
  SELECT p.id_paciente, u.nombre, p.documento
  FROM Paciente p
  JOIN Usuario u ON u.id_usuario = p.id_usuario
  ORDER BY u.nombre
`).all(),

    medicos: db.prepare(`
      SELECT m.id_medico, u.nombre, e.nombre AS especialidad
      FROM Medico m JOIN Usuario u ON u.id_usuario=m.id_usuario
      LEFT JOIN Especialidad e ON e.id_especialidad=m.id_especialidad
      WHERE m.activo=1 ORDER BY u.nombre
    `).all()
  };
}
module.exports = { listar, obtener, crear, actualizar, confirmar, atender, cancelar, catalogos };
