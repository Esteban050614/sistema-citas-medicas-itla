const db = require("../database/db");

const selectPaciente = `SELECT p.id_paciente, p.id_usuario, p.documento, p.fecha_nacimiento,
  p.telefono, u.nombre, u.correo
  FROM Paciente p JOIN Usuario u ON u.id_usuario = p.id_usuario`;

function listar() {
  return db.prepare(`${selectPaciente} ORDER BY u.nombre COLLATE NOCASE`).all();
}
function obtener(id) {
  return db.prepare(`${selectPaciente} WHERE p.id_paciente = ?`).get(id);
}
function crear(data) {
  const tx = db.transaction((d) => {
    const userResult = db.prepare(`INSERT INTO Usuario (nombre, correo, rol) VALUES (?, ?, 'Paciente')`)
      .run(d.nombre, d.correo || `paciente-${Date.now()}-${Math.random().toString(16).slice(2)}@sin-correo.invalid`);
    const result = db.prepare(`INSERT INTO Paciente (id_usuario, documento, fecha_nacimiento, telefono)
      VALUES (?, ?, ?, ?)`)
      .run(userResult.lastInsertRowid, d.documento, d.fecha_nacimiento, d.telefono);
    return result.lastInsertRowid;
  });
  return obtener(tx(data));
}
function actualizar(id, data) {
  const current = obtener(id);
  if (!current) return null;
  const tx = db.transaction((d) => {
    db.prepare("UPDATE Usuario SET nombre = ?, correo = ? WHERE id_usuario = ?")
      .run(d.nombre, d.correo || current.correo, current.id_usuario);
    db.prepare(`UPDATE Paciente SET documento = ?, fecha_nacimiento = ?, telefono = ? WHERE id_paciente = ?`)
      .run(d.documento, d.fecha_nacimiento, d.telefono, id);
  });
  tx(data);
  return obtener(id);
}
function eliminar(id) {
  const current = obtener(id);
  if (!current) return false;
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM Paciente WHERE id_paciente = ?").run(id);
    db.prepare("DELETE FROM Usuario WHERE id_usuario = ?").run(current.id_usuario);
  });
  tx();
  return true;
}
module.exports = { listar, obtener, crear, actualizar, eliminar };
