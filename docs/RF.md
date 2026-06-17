# Requerimientos Funcionales - TRACKFLOW-HUB

---

## 1. Introducción

### 1.1 Propósito
Describir los requerimientos funcionales del sistema **TRACKFLOW-HUB**, una plataforma web para la gestión integral de envíos, paquetes y servicios logísticos. Su objetivo es servir como base para el análisis, diseño e implementación del sistema.

### 1.2 Alcance
TRACKFLOW-HUB permitirá a clientes registrarse, buscar y contratar servicios de envío y transporte, gestionar pagos y dejar calificaciones. Los operadores logísticos podrán ofrecer servicios de envío, gestionar reservas y generar reportes. Las empresas de transporte podrán administrar rutas y flota. Los administradores podrán gestionar usuarios, validar registros, revisar reportes y visualizar estadísticas globales de la plataforma.

### 1.3 Actores del sistema

| Actor | Descripción |
|:---:|:---:|
| **Administrador** | Gestiona la plataforma completa: usuarios, registros, reportes, estadísticas y validación de cambios en perfiles. |
| **Cliente** | Usuario registrado que busca y contrata servicios de envío y transporte, gestiona pagos, calificaciones y reportes. |
| **Operador Logístico** | Usuario verificado y aprobado que ofrece servicios de envío, gestiona reservas, cupones y visualiza reportes propios. |
| **Empresa de Transporte** | Entidad verificada y aprobada que gestiona rutas, flota, cupones y reportes de sus servicios de transporte. |
| **Sistema** | Ejecuta procesos automáticos como envío de correos, validaciones, notificaciones y generación de reportes. |

---

## 2. Requerimientos Funcionales

Los requerimientos funcionales describen las acciones que el sistema debe ser capaz de realizar.

### 2.1 Módulo: Gestión de usuarios

| ID | Nombre | Descripción | Actor | Prioridad |
|:---:|:---:|:---:|:---:|:---:|
| RF-01 | Registro de clientes | El sistema debe permitir registrar un nuevo cliente con los campos: nombre, apellido, teléfono, correo electrónico, contraseña (confirmada dos veces) y dirección de origen predeterminada (opcional). | Cliente | Alta |
| RF-02 | Registro de operadores logísticos | El sistema debe permitir registrar un operador logístico con los campos: nombre, apellido, DPI/CUI, teléfono, teléfono de respaldo (opcional), correo electrónico, fotografía, zona de operación y género. La contraseña debe confirmarse dos veces. | Operador Logístico | Alta |
| RF-03 | Registro de empresas de transporte | El sistema debe permitir registrar una empresa de transporte con los campos: nombre de la empresa, teléfono, teléfono de respaldo (opcional), correo electrónico, NIT y número de licencia operativa. La contraseña debe confirmarse dos veces. | Empresa de Transporte | Alta |
| RF-04 | Registro de administradores | El sistema debe permitir registrar nuevos administradores únicamente desde el panel de administración. Los campos de registro quedan a criterio del equipo de desarrollo. | Administrador | Alta |
| RF-05 | Verificación de correo electrónico de clientes | Para ingresar, el cliente debe verificar su correo electrónico mediante un token único de 6 caracteres enviado al correo registrado. El token se solicita inmediatamente después del registro o en cada intento de inicio de sesión mientras no se haya verificado. | Sistema | Alta |
| RF-06 | Verificación y aprobación de operadores logísticos | Para ingresar, el operador debe haber verificado su correo (mismo mecanismo que clientes) y ser aceptado por el administrador. Una vez verificado, recibirá una notificación indicando que su perfil está en revisión. Al ser aceptado, se le enviará una contraseña temporal que deberá cambiar en su primer ingreso. | Administrador / Sistema | Alta |
| RF-07 | Verificación y aprobación de empresas de transporte | Para ingresar, la empresa debe haber verificado su correo y ser aceptada por el administrador mediante una reunión virtual donde presenta su propuesta de servicios. Una vez aprobada la reunión, el administrador proporcionará credenciales de acceso especiales. | Administrador / Sistema | Alta |
| RF-08 | Inicio de sesión con autenticación por roles | El sistema debe autenticar a los usuarios según su rol (Administrador / Cliente / Operador Logístico / Empresa de Transporte) empleando JWT. Cada rol debe acceder únicamente a las funcionalidades que le corresponden. | Todos los actores | Alta |
| RF-09 | Autenticación de dos factores para administradores | Los administradores deben tener doble factor de autenticación (2FA): además de su contraseña, se les enviará un token al correo electrónico con vigencia de 2 minutos para completar el inicio de sesión. | Sistema | Alta |
| RF-10 | Gestión de perfil del cliente | El cliente debe poder ver y editar su información de perfil. El correo electrónico no podrá modificarse salvo en circunstancias debidamente justificadas. | Cliente | Media |
| RF-11 | Gestión de perfil del operador logístico | El operador logístico podrá ver y solicitar cambios en su perfil, pero dichos cambios requerirán aprobación del administrador antes de hacerse efectivos. | Operador Logístico / Administrador | Media |
| RF-12 | Gestión de perfil de empresa de transporte | La empresa de transporte podrá solicitar cambios en su perfil, sujetos a aprobación del administrador. | Empresa de Transporte / Administrador | Media |

### 2.2 Módulo: Administrador

| ID | Nombre | Descripción | Actor | Prioridad |
|:---:|:---:|:---:|:---:|:---:|
| RF-13 | Gestión de solicitudes de registro | El administrador podrá gestionar las solicitudes de registro de operadores logísticos (aceptar o rechazar, notificando al operador en ambos casos) y de empresas de transporte (agendar reuniones virtuales enviando fecha, hora y enlace por correo). | Administrador / Sistema | Alta |
| RF-14 | Gestión de usuarios registrados | El administrador tendrá un panel para observar todos los usuarios registrados, filtrados por rol. Podrá editar usuarios y vetarlos de la plataforma solicitando un motivo de veto. El usuario vetado recibirá notificación por correo con la razón y al intentar iniciar sesión verá un mensaje indicando que está vetado. No existirá módulo de apelaciones. | Administrador / Sistema | Alta |
| RF-15 | Gestión de reportes de usuarios | El administrador podrá observar todos los reportes generados en la plataforma y tomar acciones contra usuarios infractores, desde suspensiones temporales hasta veto permanente. Los estados de los reportes son: Enviado, En revisión, Aceptado y Rechazado. | Administrador | Alta |
| RF-16 | Gestión de cambios en perfiles | El administrador revisará y verificará los nuevos datos solicitados por operadores logísticos y empresas de transporte, pudiendo aceptar o rechazar los cambios. El usuario recibirá una notificación en su vista principal sobre la resolución. | Administrador / Sistema | Media |
| RF-17 | Visualización de información global | El administrador podrá observar en detalle los servicios de transporte registrados en la plataforma, ordenarlos por zona geográfica y empresa. También podrá ver los envíos registrados por los operadores logísticos, ordenados por destino y operador. | Administrador | Media |
| RF-18 | Reportes del administrador | El administrador podrá observar y descargar en PDF los siguientes reportes: logs de registros y vetos de usuarios, gráfica de usuarios aceptados/rechazados por tipo, gráfica de zonas con mayor volumen de envíos, gráfica de servicios de transporte más utilizados, gráfica de ingresos por tipo de servicio, resumen de reportes emitidos y su estado, historial de usuarios con mayor gasto, historial de envíos realizados, historial de servicios de transporte, gráfica de destinos más frecuentes y gráfica de uso de clientes (solo envíos, solo transporte, ambos servicios). | Administrador | Media |

### 2.3 Módulo: Operadores logísticos

| ID | Nombre | Descripción | Actor | Prioridad |
|:---:|:---:|:---:|:---:|:---:|
| RF-19 | Gestión de servicios de envío | El operador logístico podrá registrar los servicios de envío que ofrecerá a los clientes mediante un formulario con los campos mínimos: zona de cobertura, capacidad de carga (kg), precio por envío y fotografías del vehículo/bodega (mínimo 3). Podrá modificar, eliminar y suspender temporalmente sus servicios. | Operador Logístico | Alta |
| RF-20 | Visualización de calificaciones y comentarios | El operador podrá ver las calificaciones y comentarios que los clientes hayan dejado sobre sus servicios, así como responder a dichos comentarios. | Operador Logístico | Media |
| RF-21 | Vista de calendario de envíos | El operador podrá ver en una vista tipo calendario las fechas en que los clientes han programado envíos, tanto de forma individual por servicio como en vista general de todos sus servicios. | Operador Logístico | Media |
| RF-22 | Gestión de reportes del operador | El operador podrá reportar a clientes que hayan infringido las condiciones del servicio, aportando evidencia fotográfica o en video. También podrá ver los reportes que los clientes hayan realizado sobre sus servicios. | Operador Logístico | Alta |
| RF-23 | Gestión de cupones del operador | El operador podrá generar cupones o códigos de descuento para sus clientes según la temporada o fechas especiales. El mecanismo de selección de clientes beneficiarios queda a criterio del equipo de desarrollo. | Operador Logístico | Media |
| RF-24 | Reportes propios del operador | El operador tendrá acceso a los siguientes reportes en PDF: ganancias generadas por servicio y en general, historial de clientes que han utilizado sus servicios y reporte de calificaciones y comentarios recibidos. La distribución de ganancias es 80% para el operador y 20% para TrackFlow-HUB. | Operador Logístico | Media |

### 2.4 Módulo: Empresas de transporte

| ID | Nombre | Descripción | Actor | Prioridad |
|:---:|:---:|:---:|:---:|:---:|
| RF-25 | Gestión de rutas y flota | Las empresas de transporte podrán cargar su flota y rutas mediante carga masiva en formato CSV o registro manual mediante formulario. Podrán editar rutas individuales con reflejos inmediatos en la vista del cliente, y cancelar o suspender rutas por emergencias o condiciones climáticas. Los clientes afectados serán notificados inmediatamente por correo. | Empresa de Transporte / Sistema | Alta |
| RF-26 | Gestión de reportes de la empresa | Las empresas podrán observar los reportes de los clientes sobre sus servicios (retrasos, cancelaciones, cobros extras, entre otros). Las empresas de transporte no pueden reportar directamente a los clientes, ya que se rigen bajo normativa propia. | Empresa de Transporte | Alta |
| RF-27 | Gestión de cupones de la empresa | Las empresas de transporte podrán generar cupones o códigos de descuento por temporada, enviados al correo de los clientes seleccionados según criterio del equipo de desarrollo. | Empresa de Transporte | Media |
| RF-28 | Reportes propios de la empresa | La empresa tendrá acceso a los siguientes reportes: reporte de ganancias generadas por los servicios, historial de servicios contratados, reporte de calificaciones y reseñas recibidas y reporte del estado de las rutas. La distribución de ganancias es 90% para la empresa y 10% para TrackFlow-HUB. | Empresa de Transporte | Media |

### 2.5 Módulo: Clientes

| ID | Nombre | Descripción | Actor | Prioridad |
|:---:|:---:|:---:|:---:|:---:|
| RF-29 | Búsqueda y contratación de servicios de envío | Los clientes podrán buscar servicios de envío por zona de cobertura, operador logístico y nombre del servicio, con filtros por orden alfabético, mejor calificación, precio y capacidad de carga. Podrán ver un resumen del servicio en el listado y acceder a los detalles completos al hacer clic. Podrán programar un envío con al menos 24 horas de anticipación, seleccionando un rango de fechas sin traslape con reservaciones existentes. | Cliente | Alta |
| RF-30 | Búsqueda y contratación de servicios de transporte | Los clientes podrán buscar servicios de transporte por destino, fecha, empresa y tipo de servicio, con filtros por hora de inicio, empresa proveedora, tiempo estimado de entrega, precio y calificación de la empresa. | Cliente | Alta |
| RF-31 | Consideraciones de reservaciones combinadas | El cliente puede contratar solo envíos, solo transporte o ambos servicios. Si elige primero un servicio de envío, se le sugerirán los 3 operadores logísticos mejor calificados para la misma zona. Si elige primero un servicio de transporte, se le sugerirán los 3 operadores de envío mejor calificados del destino. El cliente tendrá un apartado con todos los servicios contratados o completados, incluyendo el estado actual (activo, en tránsito, entregado, cancelado). | Cliente / Sistema | Alta |
| RF-32 | Gestión de pagos | Para confirmar un servicio, el cliente debe realizar el pago. El método principal es por tarjeta de crédito o débito simulada, con saldo inicial de Q1,000 y validación del número mediante el algoritmo de Luhn implementado manualmente. El equipo debe implementar un segundo método de pago alternativo simulado (wallet o transferencia). Las reservaciones se confirman únicamente cuando el pago haya sido procesado exitosamente. Todos los servicios se agregan a un carrito de compras persistente que se mantiene aunque el cliente cierre sesión. | Cliente / Sistema | Alta |
| RF-33 | Cancelación de reservaciones | El cliente podrá cancelar su reservación hasta 24 horas antes del inicio del servicio. El mecanismo de reembolso queda a criterio del equipo de desarrollo. | Cliente | Alta |
| RF-34 | Gestión de calificaciones y reseñas | Los clientes podrán calificar los servicios de envío una vez concluida la fecha de entrega programada y los servicios de transporte una vez finalizado el trayecto contratado. En ambos casos podrán dejar un comentario y una puntuación. | Cliente | Media |
| RF-35 | Gestión de reportes del cliente | Los clientes tendrán un apartado para reportar problemas relacionados con sus servicios contratados, con posibilidad de adjuntar evidencias. Podrán ver el historial de sus reportes con los estados: Enviado, En estudio, Aceptado y Rechazado. | Cliente | Alta |
| RF-36 | Gestión de cupones del cliente | Los clientes podrán canjear cupones otorgados por operadores o empresas de transporte, y verán un historial de cupones utilizados junto con sus condiciones y restricciones. | Cliente | Media |

---
