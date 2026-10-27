# Sistema de Gestión de Citas Médicas
**Entregable 3 – Avance funcional**

Aplicación web para apoyar la gestión básica de pacientes y citas médicas. Este avance conserva el enfoque de arquitectura monolítica en tres capas: presentación, lógica de negocio y acceso a datos.

## Integrantes
- Esteban López Madera

## Funcionalidades implementadas
### Módulo de pacientes
- Registrar pacientes.
- Consultar y buscar pacientes por nombre, documento o correo.
- Editar información.
- Eliminar pacientes cuando no tengan citas relacionadas.
- Validación de campos requeridos y restricciones de documento/correo únicos.

### Módulo de citas médicas
- Programar citas para un paciente y un médico.
- Consultar y filtrar citas.
- Editar citas y cambiar su estado.
- Cancelar citas.
- Validar que el médico no tenga otra cita activa en la misma fecha y hora.
- Mostrar paciente, médico y especialidad en el listado.

### Base de datos
Se utiliza SQLite para facilitar la ejecución local. La base se crea automáticamente en `data/citas-medicas.db` al iniciar el servidor. El repositorio no incluye la base generada, porque se crea automáticamente.

Tablas: `Usuario`, `Paciente`, `Especialidad`, `Medico`, `Cita` y `Consulta`, siguiendo las entidades y relaciones del Entregable 2. Paciente y Médico se relacionan con Usuario mediante `id_usuario`; Médico se relaciona con Especialidad; Cita se relaciona con Paciente y Médico; y Consulta se relaciona de forma única con Cita. Los datos iniciales incluyen especialidades y médicos ficticios de ejemplo.

## Tecnologías
- Node.js
- Express
- SQLite mediante `better-sqlite3`
- HTML, CSS y JavaScript sin frameworks de frontend

## Requisitos
- Node.js 20 o superior (se recomienda una versión LTS).
- npm.

## Instalación y ejecución
1. Descarga o clona el repositorio.
2. Abre una terminal en la carpeta `sistema-citas-medicas`.
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia la aplicación:
   ```bash
   npm start
   ```
5. Abre en el navegador: http://localhost:3000

En desarrollo se puede usar `npm run dev`.

## API inicial
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verificar que el servidor está activo |
| GET | `/api/pacientes` | Listar pacientes |
| POST | `/api/pacientes` | Crear paciente |
| GET | `/api/pacientes/:id` | Consultar un paciente |
| PUT | `/api/pacientes/:id` | Actualizar paciente |
| DELETE | `/api/pacientes/:id` | Eliminar paciente si no tiene citas |
| GET | `/api/citas` | Listar citas |
| GET | `/api/citas/catalogos` | Obtener pacientes y médicos disponibles |
| POST | `/api/citas` | Crear cita |
| PUT | `/api/citas/:id` | Actualizar cita |
| PATCH | `/api/citas/:id/cancelar` | Cancelar cita |

## Estructura del proyecto
```text
sistema-citas-medicas/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── database/
│   │   └── db.js
│   ├── routes/
│   │   ├── pacientes.js
│   │   └── citas.js
│   ├── services/
│   │   ├── pacientesService.js
│   │   └── citasService.js
│   └── server.js
├── .gitignore
├── package.json
└── README.md
```

## Arquitectura por capas
- **Presentación:** archivos HTML, CSS y JavaScript en `public/`.
- **Lógica de aplicación:** rutas y servicios en `src/routes/` y `src/services/`.
- **Datos:** persistencia y relaciones en `src/database/db.js`, usando SQLite.

## Pruebas funcionales

Se recomienda realizar las siguientes pruebas para verificar el funcionamiento de los módulos implementados:

Comprobar que la aplicación inicia correctamente.

Registrar un paciente y verificar que aparece en el listado.

Buscar y actualizar la información de un paciente.

Programar una cita para un paciente con uno de los médicos disponibles.

Intentar registrar dos citas para el mismo médico en la misma fecha y hora, verificando que el sistema rechace el conflicto.

Cambiar el estado de una cita y comprobar que la actualización se refleja en el listado.

Reiniciar el servidor y comprobar que los registros guardados permanecen en la base de datos.

Estado actual del proyecto

El proyecto corresponde a un avance funcional académico desarrollado para la asignatura Programación III. Mantiene una arquitectura monolítica organizada en tres capas: presentación, lógica de negocio y acceso a datos.

Actualmente incluye módulos para la gestión de pacientes y citas médicas, con persistencia local mediante SQLite. La validación completa de todos los escenarios depende de las pruebas realizadas en el entorno de ejecución.

El sistema no está destinado al uso clínico real. Entre las funcionalidades que podrían incorporarse en futuras versiones se encuentran la autenticación completa, los permisos por rol, las notificaciones, los respaldos automatizados y los controles adicionales de seguridad y privacidad.

Autor

Esteban López Madera
Matrícula: 2024-0036
Asignatura: Programación III
