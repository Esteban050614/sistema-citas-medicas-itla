# Entregable 3 – Avance funcional
## Sistema de Gestión de Citas Médicas

### 1. Repositorio
El código está organizado para publicarse en GitHub o GitLab. Al crear el repositorio remoto, se debe añadir su URL y compartir el acceso con el docente. El historial de commits debe reflejar la evolución real del proyecto.

### 2. Estructura organizada
El sistema separa la interfaz de usuario (`public`), los endpoints (`src/routes`), las operaciones de negocio (`src/services`) y el acceso a datos (`src/database`). Esta organización corresponde al enfoque monolítico de tres capas definido en el diseño anterior.

### 3. Funcionalidades principales
Se implementaron dos módulos:
- Gestión de pacientes: registro, consulta, búsqueda, edición y eliminación condicionada por relaciones existentes.
- Gestión de citas: creación, consulta, edición, filtrado y cancelación, con validación de conflictos de horario para el médico.

### 4. Base de datos
La aplicación utiliza SQLite. Las tablas principales son Paciente, Medico, Especialidad y Cita, además de Usuario y Consulta preparadas para ampliar el sistema. Las claves foráneas protegen las relaciones entre pacientes, médicos y citas. La base se crea automáticamente al iniciar la aplicación.

### 5. Documentación técnica
El README describe las tecnologías, requisitos, instalación, ejecución, estructura, rutas de API y pruebas manuales recomendadas.

### Evidencias que deben añadirse antes de entregar
- URL real del repositorio remoto.
- Captura de la aplicación ejecutándose en el navegador.
- Captura del módulo de pacientes con un registro de prueba.
- Captura del módulo de citas con una cita de prueba.
- Historial de commits visible en GitHub/GitLab.

**Nota:** no se debe afirmar que existe un repositorio remoto o commits compartidos hasta que se haya creado y subido el proyecto.
