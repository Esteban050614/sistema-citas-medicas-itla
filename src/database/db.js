const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "citas-medicas.db"));
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS Usuario (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  contrasena_hash TEXT,
  rol TEXT NOT NULL CHECK (rol IN ('Administrador','Recepcionista','Medico','Paciente')),
  activo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS Especialidad (
  id_especialidad INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS Medico (
  id_medico INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER UNIQUE,
  id_especialidad INTEGER,
  numero_colegiado TEXT UNIQUE,
  telefono TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL,
  FOREIGN KEY (id_especialidad) REFERENCES Especialidad(id_especialidad)
);

CREATE TABLE IF NOT EXISTS Paciente (
  id_paciente INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER UNIQUE,
  documento TEXT NOT NULL UNIQUE,
  fecha_nacimiento TEXT,
  telefono TEXT,
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Cita (
  id_cita INTEGER PRIMARY KEY AUTOINCREMENT,
  id_paciente INTEGER NOT NULL,
  id_medico INTEGER NOT NULL,
  fecha_hora TEXT NOT NULL,
  motivo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente','Confirmada','Cancelada','Atendida')),
  observaciones TEXT,
  fecha_creacion TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente) ON DELETE RESTRICT,
  FOREIGN KEY (id_medico) REFERENCES Medico(id_medico) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Consulta (
  id_consulta INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cita INTEGER NOT NULL UNIQUE,
  fecha_consulta TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  diagnostico TEXT,
  observaciones TEXT,
  FOREIGN KEY (id_cita) REFERENCES Cita(id_cita) ON DELETE RESTRICT
);
`);

const count = db.prepare("SELECT COUNT(*) AS total FROM Especialidad").get().total;
if (count === 0) {
  const insertEspecialidad = db.prepare("INSERT INTO Especialidad (nombre, descripcion) VALUES (?, ?)");
  const insertUsuario = db.prepare("INSERT INTO Usuario (nombre, correo, rol) VALUES (?, ?, ?)");
  const insertMedico = db.prepare("INSERT INTO Medico (id_usuario, telefono, id_especialidad, numero_colegiado) VALUES (?, ?, ?, ?)");
  const seed = db.transaction(() => {
    const general = insertEspecialidad.run("Medicina general", "Atención primaria y consultas generales").lastInsertRowid;
    const pediatria = insertEspecialidad.run("Pediatría", "Atención médica infantil").lastInsertRowid;
    const cardiologia = insertEspecialidad.run("Cardiología", "Prevención y tratamiento de enfermedades del corazón").lastInsertRowid;
    const laura = insertUsuario.run("Dra. Laura Méndez", "laura.mendez@clinica.test", "Medico").lastInsertRowid;
    const carlos = insertUsuario.run("Dr. Carlos Peña", "carlos.pena@clinica.test", "Medico").lastInsertRowid;
    const ana = insertUsuario.run("Dra. Ana Castillo", "ana.castillo@clinica.test", "Medico").lastInsertRowid;
    insertMedico.run(laura, "809-555-0101", general, "MED-0001");
    insertMedico.run(carlos, "809-555-0102", pediatria, "MED-0002");
    insertMedico.run(ana, "809-555-0103", cardiologia, "MED-0003");
  });
  seed();
}

module.exports = db;
