# Historias de Usuario - TrackFlow-HUB

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