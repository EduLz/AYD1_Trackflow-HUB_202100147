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

