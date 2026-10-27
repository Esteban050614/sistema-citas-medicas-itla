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

## Pruebas manuales recomendadas
1. Abrir el panel y comprobar que el servidor carga.
2. Registrar un paciente y verificar que aparece en la tabla.
3. Editar el paciente y buscarlo por documento.
4. Crear una cita para ese paciente y uno de los médicos disponibles.
5. Crear otra cita para el mismo médico en la misma fecha y hora; debe mostrar un mensaje de conflicto.
6. Cancelar una cita y comprobar que el estado cambia.
7. Reiniciar el servidor y verificar que los registros persisten.

## Estado y alcance
Este es un avance académico para ejecución local, no un sistema listo para uso clínico real. Los módulos de pacientes y citas están implementados en el código, pero deben instalarse y probarse en el equipo antes de declarar la validación completa. No incluye autenticación completa, permisos por rol, despliegue en internet, notificaciones, pagos ni expediente clínico completo. Antes de un uso real serían necesarias pruebas adicionales, controles de seguridad, copias de seguridad y revisión de privacidad.

## Subirlo a GitHub
Crea un repositorio vacío en GitHub y, desde esta carpeta, ejecuta:
```bash
git init
git add .
git commit -m "Entrega 3: estructura inicial y base de datos"
git branch -M main
git remote add origin URL_DE_TU_REPOSITORIO
git push -u origin main
```
Después de probar los módulos, realiza commits separados para documentar los cambios. No subas `node_modules/` ni datos de pacientes reales.
