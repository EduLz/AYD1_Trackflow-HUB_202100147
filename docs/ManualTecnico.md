# Manual técnico — TrackFlow-HUB

Sistema de Gestión de Envíos y Logística

Universidad de San Carlos de Guatemala
Facultad de Ingeniería — Análisis y Diseño de Sistemas 1
Escuela de Vacaciones 2026

---

## Tabla de contenido

1. [Introducción](#1-introducción)
2. [Requerimientos funcionales y no funcionales](#2-requerimientos-funcionales-y-no-funcionales)
3. [Diagrama de casos de uso](#3-diagrama-de-casos-de-uso)
4. [Historias de usuario](#4-historias-de-usuario)
5. [Diagrama de clases](#5-diagrama-de-clases)
6. [Diagrama de secuencias](#6-diagrama-de-secuencias)
7. [Diagrama de componentes](#7-diagrama-de-componentes)
8. [Diagrama de despliegue](#8-diagrama-de-despliegue)
9. [Diagrama entidad relación](#9-diagrama-entidad-relación)
10. [Arquitectura y tecnologías](#10-arquitectura-y-tecnologías)
11. [Instalación y configuración](#11-instalación-y-configuración)
12. [Control de versiones](#12-control-de-versiones)

---

## 1. Introducción

TrackFlow-HUB es una plataforma web para la gestión integral de envíos, paquetes y servicios logísticos, que permite a **clientes**, **operadores logísticos**, **empresas de transporte** y **administradores** interactuar de forma centralizada y eficiente.

---

## 2. Requerimientos funcionales y no funcionales

## Introducción

### Propósito
Describir los requerimientos funcionales del sistema **TRACKFLOW-HUB**, una plataforma web para la gestión integral de envíos, paquetes y servicios logísticos. Su objetivo es servir como base para el análisis, diseño e implementación del sistema.

### Alcance
TRACKFLOW-HUB permitirá a clientes registrarse, buscar y contratar servicios de envío y transporte, gestionar pagos y dejar calificaciones. Los operadores logísticos podrán ofrecer servicios de envío, gestionar reservas y generar reportes. Las empresas de transporte podrán administrar rutas y flota. Los administradores podrán gestionar usuarios, validar registros, revisar reportes y visualizar estadísticas globales de la plataforma.

### Actores del sistema

| Actor | Descripción |
|:---:|:---:|
| **Administrador** | Gestiona la plataforma completa: usuarios, registros, reportes, estadísticas y validación de cambios en perfiles. |
| **Cliente** | Usuario registrado que busca y contrata servicios de envío y transporte, gestiona pagos, calificaciones y reportes. |
| **Operador Logístico** | Usuario verificado y aprobado que ofrece servicios de envío, gestiona reservas, cupones y visualiza reportes propios. |
| **Empresa de Transporte** | Entidad verificada y aprobada que gestiona rutas, flota, cupones y reportes de sus servicios de transporte. |
| **Sistema** | Ejecuta procesos automáticos como envío de correos, validaciones, notificaciones y generación de reportes. |

---

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

### 2.2 Requerimientos no funcionales

---

## 1. Seguridad
| ID | Requerimiento |
|:----:|:---------------:|
| RNF-01 | El sistema debe implementar autenticación basada en roles (Administrador, Cliente, Operador Logístico y Empresa de Transporte) mediante tokens JWT, validando el token en cada petición a rutas protegidas. |
| RNF-02 | Las contraseñas de los usuarios deben almacenarse cifradas con bcrypt (hash con salt), nunca en texto plano. Todos los usuarios deben confirmar su contraseña dos veces al momento del registro. |
| RNF-03 | El administrador debe contar con autenticación de dos factores (2FA): un token enviado al correo electrónico con vigencia de 2 minutos que se requiere en cada inicio de sesión. |
| RNF-04 | Los clientes deben verificar su correo electrónico mediante un token único de 6 caracteres antes de poder iniciar sesión. |
| RNF-05 | Los operadores logísticos deben verificar su correo electrónico y ser aprobados por el administrador antes de acceder a la plataforma. |
| RNF-06 | Las empresas de transporte deben verificar su correo electrónico y ser aprobadas por el administrador mediante reunión virtual antes de acceder a la plataforma. |
| RNF-07 | Todas las consultas a la base de datos deben ser parametrizadas para prevenir inyección SQL. |
| RNF-08 | El sistema debe validar los datos de entrada tanto en el frontend como en el backend (campos obligatorios, formatos y tipos de archivo permitidos). |
| RNF-09 | Las credenciales y datos sensibles deben gestionarse mediante variables de entorno (.env) y no estar escritos directamente en el código fuente. |
| RNF-10 | El número de tarjeta de crédito/débito simulada debe ser validado mediante el algoritmo de Luhn implementado manualmente en el backend. |

## 2. Rendimiento
| ID | Requerimiento |
|:----:|:---------------:|
| RNF-11 | El sistema debe responder a las peticiones del usuario en un tiempo razonable (idealmente menor a 3 segundos en condiciones normales de operación). |
| RNF-12 | El backend debe utilizar un pool de conexiones a la base de datos para reutilizar conexiones y soportar varios usuarios de forma concurrente. |
| RNF-13 | Los archivos de imagen subidos (fotografías de operadores, vehículos y bodegas) deben limitarse en tamaño y formato para no afectar el rendimiento de la plataforma. |
| RNF-14 | El carrito de compras del cliente debe ser persistente: debe mantenerse almacenado aunque el cliente cierre sesión y recuperarse correctamente al volver a ingresar. |

## 3. Usabilidad (UI/UX)
| ID | Requerimiento |
|:----:|:---------------:|
| RNF-15 | La interfaz debe ser intuitiva, accesible y visualmente consistente, aplicando al menos 6 principios heurísticos de Jakob Nielsen seleccionados y documentados por el equipo. |
| RNF-16 | El sistema debe mostrar mensajes claros de carga, confirmación y error en cada operación. |
| RNF-17 | La interfaz de usuario debe presentarse en idioma español. |
| RNF-18 | La interfaz debe ser coherente en iconografía, paleta de colores y ubicación de los elementos en todas las pantallas. No se permite el uso de plantillas descargadas sin personalización ni Bootstrap. Se recomienda el uso de Tailwind CSS u otro framework de estilizado. |
| RNF-19 | Los operadores logísticos deben contar con una vista tipo calendario que permita visualizar las fechas de envíos programados por los clientes, tanto por servicio individual como de forma general. |

## 4. Disponibilidad y Despliegue
| ID | Requerimiento |
|:----:|:---------------:|
| RNF-20 | El sistema debe poder desplegarse en una máquina virtual o servidor en la nube, utilizando contenedores Docker tanto para el backend como para el frontend, garantizando consistencia entre entornos de desarrollo y producción. |
| RNF-21 | La base de datos debe ser relacional. Si no se utiliza un servicio de base de datos en la nube, debe dockerizarse junto con el resto de la aplicación. |
| RNF-22 | El sistema debe implementar un pipeline de Integración Continua/Despliegue Continuo (CI/CD) en GitHub Actions con las etapas de Build, Test y Deploy, ejecutándose únicamente cuando se realice push a la rama main. |

## 5. Mantenibilidad
| ID | Requerimiento |
|:----:|:---------------:|
| RNF-23 | El backend debe seguir una arquitectura por capas que separe responsabilidades y facilite el mantenimiento. |
| RNF-24 | El proyecto debe usar control de versiones con la estrategia GitFlow (ramas main, develop, feature, release y hotfix) y Conventional Commits, garantizando trazabilidad. La versión final debe ser v3.0.0 con su respectivo tag y se deben realizar al menos 3 releases a la rama main. |
| RNF-25 | El código debe ser modular y estar documentado con comentarios claros. Cada integrante debe contar con al menos una rama feature por entregable (feature/funcion_carnet). |
| RNF-26 | Se deben implementar un mínimo de 10 pruebas unitarias (al menos 2 por integrante del equipo de backend) y un mínimo de 10 pruebas E2E utilizando Selenium o Playwright, cubriendo los flujos críticos del sistema. |

## 6. Portabilidad y Compatibilidad
| ID | Requerimiento |
|:----:|:---------------:|
| RNF-27 | El sistema debe ser compatible con los navegadores web modernos (Google Chrome, Microsoft Edge, Mozilla Firefox). |
| RNF-28 | El sistema debe estar construido como una API REST que separe el backend del frontend, permitiendo su evolución de forma independiente. El lenguaje, framework y librerías del backend y frontend quedan a libre elección del equipo, siempre que se justifique técnicamente. |

## 7. Integridad y Confiabilidad
| ID | Requerimiento |
|:----:|:---------------:|
| RNF-29 | La integridad de los datos debe garantizarse mediante llaves foráneas y restricciones de unicidad en la base de datos. |
| RNF-30 | Las reglas de negocio deben validarse en el backend: control de cupos por servicio, ventana mínima de 24 horas para programar envíos, cancelación de reservaciones hasta 24 horas antes del inicio del servicio, y verificación de traslapes de fechas en reservaciones del mismo servicio. |
| RNF-31 | Las notificaciones críticas (veto de usuarios, aprobación/rechazo de registros, cancelación de rutas, confirmación de pagos, cambios en perfiles) deben enviarse por correo electrónico de forma automática y en tiempo real. |
| RNF-32 | La distribución de ganancias debe aplicarse automáticamente: 80% para el operador logístico y 20% para TrackFlow-HUB en servicios de envío; 90% para la empresa de transporte y 10% para TrackFlow-HUB en servicios de transporte. |

---

## 3. Diagrama de casos de uso

## 3.1. Módulo: Gestión de Usuarios y Autenticación
![Diagrama 1](/docs/Anexos/Gestion.png "Diagrama de Gestión")

## 3.2. Módulo: Clientes
![Diagrama 2](/docs/Anexos/Cliente.png "Diagrama de Clientes")

## 3.3. Módulo: Operadores Logísticos
![Diagrama 3](/docs/Anexos/Logistico.png "Diagrama de Logísticos")

## 3.4. Módulo: Empresas de Transporte
![Diagrama 4](/docs/Anexos/Empresa.png "Diagrama de Empresa")

## 3.5. Módulo: Administrador
![Diagrama 5](/docs/Anexos/Administrador.png "Diagrama de Administrador")
---

## 4. Historias de usuario


### HU-001: Inicio de Sesión de Administrador con Doble Factor (2FA)

**Como:** Administrador registrado en la plataforma.

**Quiero:** Iniciar sesión y validar mi identidad mediante un código OTP temporal.

**Para:** Acceder al panel de administración general de manera altamente segura.

**Criterios de Aceptación:**
* El sistema debe solicitar el correo y la contraseña; si el rol identificado es `ADMIN`, debe bloquear el acceso y solicitar el token.
* Se debe enviar al correo electrónico institucional un token de 6 caracteres con una vigencia estricta de 2 minutos.
* El sistema debe validar el código en la API y emitir el JWT final solo si la coincidencia es exitosa.

**Prioridad:** Alta  
**Story Points:** 8

---

### HU-002: Ingreso de Usuarios con Token de Verificación

**Como:** Cliente u Operador Logístico.

**Quiero:** Confirmar la titularidad de mi cuenta ingresando un código único enviado a mi correo electrónico.

**Para:** Completar mi proceso de validación y habilitar el acceso a mi dashboard.

**Criterios de Aceptación:**
* Durante el primer ingreso, o si la cuenta está pendiente de validación, el sistema debe redirigir a una pantalla de captura de Token.
* Se debe aceptar un código alfanumérico de 6 caracteres.
* Las Empresas de Transporte están exentas de este paso, requiriendo únicamente la aprobación manual del Administrador.

**Prioridad:** Alta  
**Story Points:** 5

---

### HU-003: Registro de Clientes Estándar

**Como:** Visitante de la plataforma.

**Quiero:** Crear una cuenta de cliente proporcionando mis datos personales.

**Para:** Buscar, cotizar y contratar servicios de transporte y paquetería a través del sistema.

**Criterios de Aceptación:**
* El formulario debe capturar obligatoriamente: Nombre, Apellido, Teléfono, Correo electrónico y Contraseña.
* El campo de "Dirección de origen predeterminada" debe ser opcional.
* La contraseña debe validarse con un formato seguro (mínimo 8 caracteres, alfanumérica y al menos un carácter especial).
* El sistema debe inyectar en el payload el identificador estricto para el rol de Cliente.

**Prioridad:** Alta  
**Story Points:** 5

---

### HU-004: Registro de Operadores Logísticos

**Como:** Transportista o conductor independiente.

**Quiero:** Registrar mis datos personales y operativos de forma verificable.

**Para:** Ofrecer mis servicios de entrega dentro de TrackFlow-HUB.

**Criterios de Aceptación:**
* El formulario debe capturar: Nombre, Apellido, DPI/CUI (13 dígitos), Correo electrónico, Zona de operación, Género y Contraseña segura.
* El sistema debe requerir la carga obligatoria de un archivo de Fotografía reciente (formatos PNG o JPG) mediante `multipart/form-data`.
* Tras el registro, la cuenta debe quedar en estado "Pendiente", requiriendo aprobación administrativa.

**Prioridad:** Alta  
**Story Points:** 8

---

### HU-005: Registro de Empresas de Transporte

**Como:** Representante legal de una empresa de logística.

**Quiero:** Inscribir a mi compañía detallando la información comercial y operativa.

**Para:** Ingresar a la plataforma y gestionar envíos masivos con mi propia flota de vehículos.

**Criterios de Aceptación:**
* El sistema debe capturar: Nombre de la empresa, Teléfonos, Correo electrónico, NIT, Número de Licencia Operativa y Contraseña.
* El registro no concederá acceso inmediato; mostrará una alerta indicando que la activación requiere una validación legal y reunión virtual con el administrador.

**Prioridad:** Alta  
**Story Points:** 5

---

### HU-006: Creación Interna de Nuevos Administradores

**Como:** Administrador General.

**Quiero:** Registrar nuevas cuentas de usuario con acceso total.

**Para:** Delegar el manejo, la auditoría y la gestión de la plataforma a otros miembros del personal.

**Criterios de Aceptación:**
* La vista de creación debe estar protegida y ser visible únicamente para usuarios logueados con el rol `ADMIN`.
* El formulario debe ser directo (Nombre, Correo, Contraseña) y crear la cuenta activada de inmediato en la base de datos sin requerir verificación por correo.

**Prioridad:** Baja  
**Story Points:** 3

---

### HU-007: Gestión de Solicitudes de Registro y Admisión

**Como:** Administrador.

**Quiero:** Visualizar el listado de solicitudes pendientes emitidas por Operadores y Empresas.

**Para:** Evaluar su información, documentos y decidir si aprobar o rechazar su acceso.

**Criterios de Aceptación:**
* El panel debe desplegar una tabla consumiendo la ruta `GET /admin/solicitudes`.
* El administrador podrá visualizar el detalle de cada solicitud (como el NIT o el archivo de la fotografía).
* Las acciones de "Aprobar" o "Rechazar" deben realizar peticiones HTTP (PUT) para modificar el estado del usuario en la base de datos de forma irreversible.

**Prioridad:** Alta  
**Story Points:** 8

---

### HU-008: Control de Accesos y Vetos de Usuarios

**Como:** Administrador.

**Quiero:** Cambiar el estado de un usuario activo a "Vetado" justificando el motivo en el sistema.

**Para:** Mantener la integridad y seguridad de la plataforma ante comportamientos fraudulentos.

**Criterios de Aceptación:**
* Desde el listado general de usuarios (Clientes, Operadores o Empresas), se debe habilitar una acción de Veto.
* El sistema exigirá ingresar un motivo obligatorio antes de procesar la sanción.
* Al intentar iniciar sesión, el usuario vetado recibirá un mensaje de rechazo (Error 403 Forbidden) indicando que debe contactar soporte.

**Prioridad:** Alta  
**Story Points:** 5

---

### HU-009: Aprobación de Cambios en Perfiles Existentes

**Como:** Administrador.

**Quiero:** Revisar y autorizar las actualizaciones de datos sensibles solicitadas por usuarios operativos.

**Para:** Evitar alteraciones maliciosas en la identidad o licencias de quienes prestan servicio.

**Criterios de Aceptación:**
* Las ediciones mayores realizadas por Operadores y Empresas en sus respectivos paneles generarán un ticket de aprobación.
* La vista del Administrador mostrará una comparativa entre los datos originales y la nueva solicitud.
* Al ser aprobada, la información se impactará formalmente en la base de datos principal.

**Prioridad:** Media  
**Story Points:** 5

---

### HU-010: Visualización Global y Descarga de Reportes (Admin)

**Como:** Administrador.

**Quiero:** Acceder a un dashboard de métricas avanzadas y listados consolidados.

**Para:** Monitorear el estado logístico del sistema y rendir cuentas mediante reportes impresos.

**Criterios de Aceptación:**
* El sistema deberá compilar reportes estadísticos basados en ingresos, comisiones, operaciones exitosas y solicitudes rechazadas.
* Se debe incluir una opción de descarga asíncrona de los documentos en formato PDF consumiendo los endpoints de reportes.

**Prioridad:** Alta  
**Story Points:** 8

---

### HU-011: Configuración de Servicios y Tarifas (Operador)

**Como:** Operador Logístico aprobado.

**Quiero:** Dar de alta, editar y publicar los servicios de transporte individual que ofrezco.

**Para:** Que los clientes visualicen mis ofertas al cotizar un envío.

**Criterios de Aceptación:**
* El formulario permitirá definir la zona de cobertura, el costo por peso/distancia y la descripción del servicio.
* Toda operación debe enviar el Token JWT de Operador en las cabeceras HTTP.

**Prioridad:** Alta  
**Story Points:** 5

---

### HU-012: Edición Restringida del Perfil Operativo

**Como:** Operador Logístico.

**Quiero:** Modificar mis números telefónicos o cambiar mi vehículo asociado desde el panel.

**Para:** Mantener mi cuenta actualizada con mi información operativa real.

**Criterios de Aceptación:**
* El correo electrónico registrado debe estar bloqueado (`disabled`) para impedir cambios.
* Si el operador modifica un dato sensible, el perfil se mantendrá inalterado visualmente para el cliente hasta que el Administrador avale la solicitud.

**Prioridad:** Media  
**Story Points:** 3

---

### HU-013: Carga Masiva de Flota de Vehículos mediante CSV

**Como:** Empresa de Transporte.

**Quiero:** Importar un archivo con formato de valores separados por comas (CSV) conteniendo los datos de múltiples vehículos.

**Para:** Registrar rápidamente las unidades de mi flota sin digitación manual individual.

**Criterios de Aceptación:**
* El Frontend debe habilitar un campo de entrada para archivos `.csv`.
* Antes de enviar el payload, se debe validar en el navegador que el archivo contenga las columnas correctas (Placa, Modelo, Capacidad, etc.).
* El sistema debe devolver un resumen visual de cuántos registros fueron exitosos y cuántos fallaron.

**Prioridad:** Alta  
**Story Points:** 8

---

### HU-014: Diseño de Rutas y Destinos de Entrega

**Como:** Empresa de Transporte.

**Quiero:** Establecer rutas específicas (Orígenes y Destinos) en mi panel de control.

**Para:** Asignar tarifas, disponibilidad y vincular qué vehículos de mi flota cubrirán cada trayecto.

**Criterios de Aceptación:**
* El panel debe listar las rutas actuales y permitir agregar nuevas mediante un formulario de puntos geográficos o áreas.
* Las rutas creadas deben persistirse inmediatamente y quedar disponibles para las búsquedas de los clientes.

**Prioridad:** Alta  
**Story Points:** 5

---

### HU-015: Monitor de Analíticas y Liquidaciones (Empresa)

**Como:** Empresa de Transporte.

**Quiero:** Consultar las estadísticas de desempeño, envíos finalizados y ganancias consolidadas.

**Para:** Optimizar el uso de mi flota y medir mi retorno comercial.

**Criterios de Aceptación:**
* La interfaz mostrará gráficos o tablas totalizadas, filtrables por rangos de fecha predefinidos.
* Las métricas consumirán el servicio de reportes especializado para roles de Empresa.

**Prioridad:** Media  
**Story Points:** 5

---

### HU-016: Motor de Búsqueda y Cotización de Envíos

**Como:** Cliente autenticado.

**Quiero:** Ingresar la ubicación de recolección, el destino y el peso de mi paquete en un buscador.

**Para:** Obtener un listado de tarifas y opciones ofrecidas por los Operadores y Empresas.

**Criterios de Aceptación:**
* El formulario capturará los criterios de envío y realizará una petición GET/POST de búsqueda.
* El resultado debe mostrarse en tarjetas dinámicas indicando: Nombre del prestador (Operador o Empresa), tarifa estimada, tiempo de entrega y el botón "Añadir a Carrito".

**Prioridad:** Alta  
**Story Points:** 8

---

### HU-017: Gestión del Carrito de Envíos y Cupones

**Como:** Cliente.

**Quiero:** Almacenar temporalmente los servicios de envío que he seleccionado.

**Para:** Pagar varios traslados de manera conjunta y aplicar códigos promocionales si dispongo de ellos.

**Criterios de Aceptación:**
* El estado del carrito debe mantenerse persistente en el Front-end mediante Pinia y `localStorage`.
* Debe proveer un campo para ingresar un cupón y calcular dinámicamente el descuento en el subtotal antes del checkout.

**Prioridad:** Alta  
**Story Points:** 5

---

### HU-018: Creación y Emisión de Cupones de Descuento

**Como:** Operador Logístico o Empresa de Transporte.

**Quiero:** Generar códigos promocionales en mi panel de administración.

**Para:** Brindar descuentos a mis clientes, fomentar contrataciones y potenciar mis rutas.

**Criterios de Aceptación:**
* Se debe proveer un formulario que capture: Código alfanumérico, Porcentaje o Monto del descuento, Límite de usos y Fecha de vencimiento.
* El sistema validará que los cupones activos aparezcan disponibles en la base de datos para la verificación durante la compra del cliente.

**Prioridad:** Media  
**Story Points:** 3

---

### HU-019: Proceso de Pago y Confirmación de Órdenes

**Como:** Cliente.

**Quiero:** Finalizar mi selección de envíos utilizando un método de pago registrado (tarjeta).

**Para:** Formalizar el contrato logístico y programar las recolecciones de mis paquetes.

**Criterios de Aceptación:**
* El flujo de pago (`Checkout`) capturará los datos financieros en una interfaz segura y enviará el total exacto.
* Al ser aprobado, el carrito de compras se vaciará y se generarán los comprobantes de confirmación con los IDs de seguimiento de los envíos.

**Prioridad:** Alta  
**Story Points:** 8

---

### HU-020: Sistema de Calificaciones y Reseñas

**Como:** Cliente.

**Quiero:** Evaluar el trato, la velocidad y la calidad del servicio recibido mediante una escala de estrellas y comentarios escritos.

**Para:** Informar a la comunidad y auditar la calidad de los proveedores logísticos.

**Criterios de Aceptación:**
* La opción de calificación solo se habilitará para envíos cuyo estado en la plataforma marque "Entregado" o "Finalizado".
* Se permitirá asignar de 1 a 5 estrellas. Las valoraciones impactarán el promedio visible del Operador o Empresa en futuras búsquedas.

**Prioridad:** Media  
**Story Points:** 3

---

## 5. Diagrama de clases


![Diagrama de clases](/docs/Anexos/clases.jpeg)

---

## 6. Diagrama de secuencias

### 6.1. Registro de Cliente

![Diagrama de secuencias](/docs/Anexos/sd1.jpeg)

### 6.2. Verificación de Correo de inicio de Sesión - Cliente

![Diagrama de secuencias](/docs/Anexos/sd2.jpeg)

### 6.3. Registro, Verificación y Aprobación - Operador logistico

![Diagrama de secuencias](/docs/Anexos/sd3.jpeg)

### 6.4. Registro y Aproabación - Empresa de transporte

![Diagrama de secuencias](/docs/Anexos/s4.jpeg)

### 6.5. Inicio de Sesión - Administrador (2FA)

![Diagrama de secuencias](/docs/Anexos/sd5.jpeg)

### 6.6. Veto de Usuario por Administrador

![Diagrama de secuencias](/docs/Anexos/sd6.jpeg)

### 6.7 Registro de servicio de Envío - Operador Logístico

![Diagrama de secuencias](/docs/Anexos/sd7.jpeg)

### 6.8. Busqueda y Contratación de Envío - Cliente

![Diagrama de secuencias](/docs/Anexos/sd8.jpeg)

### 6.9 Pago y Confirmación de Reservador - Cliente

![Diagrama de secuencias](/docs/Anexos/sd9.jpeg)

### 6.10. Cancelación de Reservación - Cliente

![Diagrama de secuencias](/docs/Anexos/sd10.jpeg)

### 6.11. Califiación y Reseña de Servicio - Cliente

![Diagrama de secuencias](/docs/Anexos/sd11.jpeg)

### 6.12. Reporte de Problema - Cliente

![Diagrama de secuencias](/docs/Anexos/sd12.jpeg)

### 6.13. Gestión de Rutas y Flota - Empresa de Transporte

![Diagrama de secuencias](/docs/Anexos/sd13.jpeg)

### 6.14. Gestión de Cupones - Operador Logístico

![Diagrama de secuencias](/docs/Anexos/sd14.jpeg)

### 6.15. Generación de Reportes PDF - Administrador

![Diagrama de secuencias](/docs/Anexos/sd15.jpeg)

### 6.16. Solicitud y Aprobación de Cambio de Perfil

![Diagrama de secuencias](/docs/Anexos/sd16.jpeg)

## 7. Diagrama de componentes


![Diagrama de componentes](/docs/Anexos/componentes.png)
---

## 8. Diagrama de despliegue


![Diagrama de despliegue](/docs/Anexos/Despliegue.png)


---

## 9. Diagrama entidad relación

![Diagrama entidad relación](/docs/Anexos/ER_G4.png)

---

## 10. Arquitectura y tecnologías

### 10.1 Stack tecnológico

| Capa | Tecnología | Justificación |
|------|------------|----------------|
| Frontend | _Vue 3 + Vite | Curva de aprendizaje corta para el equipo, sistema de componentes reactivo y Vite ofrece arranque y recarga en caliente muy rápidos durante el desarrollo. |
| Backend | Node.js + Express | Permite construir la API REST de forma rápida y minimalista, con amplio soporte de librerías (autenticación JWT, ORM, validación) y consistencia de lenguaje (JavaScript) con el frontend.|
| Base de datos | SQL Server 2022 (relacional) | Motor relacional robusto con buen soporte de tipos de datos avanzados (JSON, DATETIME2) y herramientas de administración (SSMS), cumpliendo con el requerimiento de base de datos relacional del enunciado.|
| Contenedores | Docker | Requerido por el enunciado para consistencia entre entornos |
| CI/CD | GitHub Actions | Requerido por el enunciado para build, test y deploy automatizado |
| Control de versiones | GitHub (estrategia Gitflow) | Requerido por el enunciado |

### 10.2 Arquitectura general

TrackFlow-HUB sigue una **arquitectura cliente-servidor en tres capas**, separando claramente la presentación, la lógica de negocio y el almacenamiento de datos. Esta separación permite que el frontend y el backend se desarrollen, prueben y desplieguen de forma independiente, cada uno en su propio contenedor Docker.
 
**Capa de presentación (frontend)**
Construida con Vue 3 y Vite, es una aplicación de página única (SPA) que se comunica con el backend exclusivamente mediante peticiones HTTP a una API REST. Contiene los módulos correspondientes a los cuatro roles del sistema (cliente, operador logístico, empresa de transporte y administrador), además del carrito de compras persistente. El frontend no accede directamente a la base de datos ni contiene lógica de negocio sensible; su responsabilidad se limita a la interfaz, la validación de formularios en el cliente y el consumo de la API.
 
**Capa de lógica de negocio (backend)**
Construida con Node.js y Express, expone la API REST que centraliza las reglas del negocio: autenticación y autorización basada en roles (incluyendo el doble factor de autenticación para administradores), gestión de usuarios y solicitudes de registro, gestión de servicios de envío y rutas/flota, procesamiento de pagos simulados (incluida la validación de tarjetas con el algoritmo de Luhn), cupones, calificaciones, reportes y notificaciones. El backend es el único componente con acceso a la base de datos, lo que centraliza el control de la integridad de los datos y la seguridad.
 
**Capa de datos**
SQL Server 2022 almacena de forma persistente toda la información del sistema (usuarios, servicios, rutas, reservaciones, pagos, reportes, auditoría, etc.), siguiendo el modelo relacional documentado en el diagrama entidad-relación de la sección 9. El backend accede a esta capa mediante una capa de acceso a datos (data access layer) que encapsula las consultas y evita el acceso directo desde otras partes del sistema.
 
**Comunicación entre capas**
El frontend consume la API mediante peticiones REST/JSON sobre HTTP. La autenticación de cada solicitud se realiza mediante JWT, y los endpoints están protegidos según el rol del usuario autenticado. El backend se comunica con SQL Server 2022 mediante el protocolo TCP/IP en el puerto correspondiente.
 
**Servicios externos**
El sistema se integra con servicios externos para funciones que no forman parte del núcleo de negocio: un servicio SMTP para el envío de notificaciones por correo (verificación de cuenta, tokens de 2FA, resultados de solicitudes, etc.) y GitHub Actions para el pipeline de integración y despliegue continuo (CI/CD), que construye, prueba y despliega automáticamente el backend cuando se realiza un push a la rama `main`.
 
**Despliegue**
Toda la aplicación se despliega en una máquina virtual o servidor en la nube, donde Docker Engine ejecuta los contenedores del frontend y del backend de forma aislada y reproducible. La base de datos puede desplegarse como un contenedor adicional dentro del mismo servidor o como un servicio administrado en la nube, según la decisión del equipo. El detalle completo de esta infraestructura se muestra en el diagrama de despliegue de la sección 8, y la composición interna de los componentes de software en el diagrama de componentes de la sección 7.

---

## 11. Instalación y configuración

### 11.1 Requisitos previos

- Docker y Docker Compose instalados
- Node.js 18 + npm
- Cuenta de GitHub con acceso al repositorio
- SQL Server 2022 (Contenedor de Docker)

### 11.2 Variables de entorno

```env
PORT=3000

DB_USER=sa
DB_PASSWORD=
DB_SERVER=localhost
DB_PORT=1434
DB_DATABASE=TrackFlowHub

JWT_SECRET=trackflow_secret_key
JWT_EXPIRES_IN=24h

EMAIL_USER=gonzalezluisfernando894@gmail.com
EMAIL_PASSWORD=
FRONTEND_URL=http://localhost:3000/api/auth
```

### 11.3 Pasos de instalación

```bash
# Clonar el repositorio
git clone https://github.com/LuisG1o/AYD1_Proyecto_VJ2026_G4.git
cd trackflow-hub

# Levantar los contenedores
docker compose up --build

# Verificar que los servicios estén corriendo
docker ps
```

### 11.4 Ejecución de pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas end-to-end
npm run test:e2e
```

---

## 12. Control de versiones

### 12.1 Estrategia de branching (Gitflow)

- **main** — código en producción, únicamente versiones estables con tag.
- **develop** — rama de integración de funcionalidades antes de cada release.
- **feature/nombreFuncion_carnet** — una rama por funcionalidad y responsable.
- **release** — preparación de una nueva versión antes de fusionar a main.
- **hotfix/v#.#.#** — corrección de errores críticos en producción.

### 12.2 Versionamiento semántico

| Versión | Descripción | Fecha |
|---------|-------------|-------|
| v1.0.0 | Módulo de ingreso, login y registro; gestión de usuarios (administrador) | 18/06/2026 |
| v2.0.0 | Módulo de operadores logísticos y empresas de transporte; pruebas unitarias y E2E | 23/06/2026 |
| v3.0.0 | Módulo de clientes; módulo de administrador completo; Scrum, Kanban, UI/UX y CI/CD | 30/06/2026 |

### 12.3 Conventional Commits

Se utilizan los siguientes prefijos en los mensajes de commit:

- `feat:` nueva funcionalidad
- `fix:` corrección de errores
- `docs:` cambios en documentación
- `refactor:` cambios de código sin alterar funcionalidad
- `test:` adición o modificación de pruebas
- `chore:` tareas de mantenimiento

---

