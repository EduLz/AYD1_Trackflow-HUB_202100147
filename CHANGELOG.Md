# Changelog


## [1.0.0] - 2026-06-17

Primer entregable del proyecto. Incluye el módulo de registro e ingreso para los
cuatro tipos de usuario, y el módulo de administrador limitado a la gestión de
solicitudes de registro.

### Added

- **feat(auth):** registro de clientes con nombre, apellido, teléfono, correo,
  contraseña y dirección de origen predeterminada.
- **feat(auth):** verificación de cuenta de clientes mediante token de 6 caracteres
  enviado por correo electrónico.
- **feat(auth):** registro de operadores logísticos con DPI/CUI, teléfono,
  fotografía, zona de operación y género.
- **feat(auth):** flujo de revisión y aprobación de operadores logísticos por parte
  del administrador, con generación de contraseña temporal.
- **feat(auth):** registro de empresas de transporte con NIT y número de licencia
  operativa.
- **feat(auth):** flujo de aprobación de empresas de transporte mediante reunión
  virtual agendada por el administrador.
- **feat(auth):** inicio de sesión de administradores con doble factor de
  autenticación (2FA) vía token de correo con vigencia de 2 minutos.
- **feat(admin):** gestión de solicitudes de registro de operadores logísticos
  (aceptar/rechazar con notificación).
- **feat(admin):** agendamiento de reuniones virtuales con empresas de transporte
  (fecha, hora y enlace enviados por correo).
- **feat(admin):** registro de nuevos administradores desde el panel
  administrativo.

### Infrastructure

- **chore(git):** configuración del repositorio con estrategia de branching
  Gitflow (`main`, `develop`, `feature`, `release`, `hotfix`).
- **chore(git):** adopción de Conventional Commits para el historial del
  repositorio.
- **chore(ci):** configuración base del tablero Kanban (Por hacer / En proceso /
  Realizado).

### Docs

- **docs:** Requerimientos Funcionales y No Funcionales.
- **docs:** Diagrama de Casos de Uso.
- **docs:** Historias de Usuario del Sprint 1.

 
---
 
## [2.0.0] - 2026-06-23
 
### Added — Módulo de Operadores Logísticos
 
- **Gestión de servicios de envío:** Los operadores logísticos pueden registrar nuevos servicios mediante formulario, incluyendo zona de cobertura, capacidad de carga (kg), precio por envío y fotografías del vehículo/bodega (mínimo 3).
- **Edición y eliminación de servicios:** Los operadores pueden modificar y eliminar sus servicios registrados.
- **Suspensión temporal de servicios:** Nueva opción para ocultar un servicio de la vista del cliente sin eliminarlo del sistema, útil durante mantenimientos o periodos de inactividad.
- **Vista de calificaciones y comentarios:** Los operadores pueden consultar las reseñas dejadas por clientes en sus servicios y responder a los comentarios.
- **Vista de calendario de envíos:** Los operadores pueden ver, en formato calendario, las fechas en que los clientes han programado envíos, tanto por servicio individual como en vista general de todos sus servicios.
- **Generación de cupones y códigos de descuento:** Los operadores pueden crear cupones para sus clientes según temporada o fechas especiales.
- **Gestión de reportes recibidos:** Los operadores pueden visualizar los reportes que los clientes hayan realizado sobre sus servicios.
- **Reporte de clientes infractores:** Los operadores pueden reportar a clientes que hayan violado las condiciones del servicio, adjuntando evidencia fotográfica o en vídeo.
- **Edición de perfil con flujo de aprobación:** Los operadores pueden solicitar cambios en su información de perfil; los cambios quedan pendientes hasta la aprobación del administrador.
- **Reportes del operador (PDF):**
  - Reporte de ganancias generadas por servicio y en general.
  - Historial de clientes que han utilizado sus servicios.
  - Reporte de calificaciones y comentarios recibidos.
- **Distribución de ganancias:** Lógica implementada donde el operador retiene el 80% del costo del envío y TrackFlow-HUB el 20%.
---
 
### Added — Módulo de Empresas de Transporte
 
- **Carga masiva de flota y rutas vía CSV:** Las empresas de transporte pueden importar su flota y rutas mediante archivo CSV.
- **Registro manual de rutas:** Las empresas pueden registrar rutas individualmente mediante formulario.
- **Edición de rutas individuales:** Los cambios en rutas se reflejan de forma inmediata en la vista del cliente.
- **Cancelación y suspensión de rutas:** Las empresas pueden suspender rutas por emergencias o condiciones climáticas; los clientes afectados son notificados automáticamente por correo electrónico.
- **Gestión de reportes de clientes:** Las empresas pueden consultar los reportes emitidos por clientes sobre sus servicios (retrasos, cancelaciones, cobros extras, entre otros).
- **Generación de cupones y códigos de descuento:** Las empresas pueden generar cupones por temporada, enviados al correo de los clientes seleccionados.
- **Edición de perfil con flujo de aprobación:** Las empresas pueden solicitar cambios en su perfil, sujetos a aprobación del administrador.
- **Reportes de la empresa (PDF):**
  - Reporte de ganancias generadas por los servicios.
  - Historial de servicios contratados.
  - Reporte de calificaciones y reseñas recibidas.
  - Reporte del estado de las rutas.
- **Distribución de ganancias:** Lógica implementada donde la empresa retiene el 90% del costo del servicio y TrackFlow-HUB el 10%.
---
 
### Added — Pruebas
 
- **Pruebas unitarias:** Se implementaron un mínimo de 10 pruebas unitarias cubriendo los componentes principales de los módulos de operadores logísticos y empresas de transporte. Cada integrante del equipo de backend realizó al menos 2 pruebas unitarias.
- **Pruebas E2E:** Se implementaron un mínimo de 10 pruebas end-to-end con cypress cubriendo los flujos críticos de ambos módulos desde la perspectiva del usuario final.
---

