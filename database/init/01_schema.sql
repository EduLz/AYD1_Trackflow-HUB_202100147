CREATE DATABASE TrackFlowHUB;
GO
USE TrackFlowHUB;
GO

CREATE TABLE Rol (
    id_rol      INT IDENTITY(1,1) PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
);

CREATE TABLE EstadoUsuario (
    id_estado INT IDENTITY(1,1) PRIMARY KEY,
    nombre    VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE EstadoSolicitud (
    id_estado INT IDENTITY(1,1) PRIMARY KEY,
    nombre    VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE EstadoServicio (
    id_estado INT IDENTITY(1,1) PRIMARY KEY,
    nombre    VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE EstadoReservacion (
    id_estado INT IDENTITY(1,1) PRIMARY KEY,
    nombre    VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE EstadoReporte (
    id_estado INT IDENTITY(1,1) PRIMARY KEY,
    nombre    VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE TipoMetodoPago (
    id_tipo INT IDENTITY(1,1) PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE TipoCupon (
    id_tipo INT IDENTITY(1,1) PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Usuario (
    id_usuario          INT IDENTITY(1,1) PRIMARY KEY,
    id_rol              INT          NOT NULL,
    id_estado           INT          NOT NULL,
    correo              VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash     VARCHAR(255) NOT NULL,
    correo_verificado   BIT          NOT NULL DEFAULT 0,
    token_verificacion  VARCHAR(10)  NULL,
    token_expiracion    DATETIME2    NULL,
    es_temporal_pwd     BIT          NOT NULL DEFAULT 0,
    fecha_registro      DATETIME2    NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2    NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_rol)    REFERENCES Rol(id_rol),
    FOREIGN KEY (id_estado) REFERENCES EstadoUsuario(id_estado)
);

CREATE TABLE Cliente (
    id_cliente          INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario          INT          NOT NULL UNIQUE,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    telefono            VARCHAR(20)  NOT NULL,
    direccion_origen    VARCHAR(300) NULL,
    fecha_actualizacion DATETIME2    NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE OperadorLogistico (
    id_operador         INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario          INT          NOT NULL UNIQUE,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    dpi_cui             VARCHAR(20)  NOT NULL UNIQUE,
    telefono            VARCHAR(20)  NOT NULL,
    telefono_respaldo   VARCHAR(20)  NULL,
    fotografia_url      VARCHAR(500) NOT NULL,
    zona_operacion      VARCHAR(200) NOT NULL,
    genero              VARCHAR(20)  NOT NULL,
    fecha_actualizacion DATETIME2    NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE EmpresaTransporte (
    id_empresa          INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario          INT          NOT NULL UNIQUE,
    nombre_empresa      VARCHAR(200) NOT NULL,
    telefono            VARCHAR(20)  NOT NULL,
    telefono_respaldo   VARCHAR(20)  NULL,
    nit                 VARCHAR(20)  NOT NULL UNIQUE,
    licencia_operativa  VARCHAR(100) NOT NULL UNIQUE,
    fecha_actualizacion DATETIME2    NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Administrador (
    id_admin            INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario          INT          NOT NULL UNIQUE,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    token_2fa           VARCHAR(10)  NULL,
    token_expiracion    DATETIME2    NULL,
    fecha_actualizacion DATETIME2    NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE SolicitudRegistro (
    id_solicitud      INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario        INT          NOT NULL,
    id_estado         INT          NOT NULL,
    tipo              VARCHAR(20)  NOT NULL,
    notas_admin       VARCHAR(500) NULL,
    id_admin_gestor   INT          NULL,
    fecha_solicitud   DATETIME2    NOT NULL DEFAULT GETDATE(),
    fecha_resolucion  DATETIME2    NULL,
    FOREIGN KEY (id_usuario)      REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_estado)       REFERENCES EstadoSolicitud(id_estado),
    FOREIGN KEY (id_admin_gestor) REFERENCES Administrador(id_admin)
);

CREATE TABLE ReunionVirtual (
    id_reunion      INT IDENTITY(1,1) PRIMARY KEY,
    id_solicitud    INT          NOT NULL,
    id_admin        INT          NOT NULL,
    fecha_hora      DATETIME2    NOT NULL,
    enlace          VARCHAR(500) NOT NULL,
    estado          VARCHAR(30)  NOT NULL DEFAULT 'PROGRAMADA',
    fecha_creacion  DATETIME2    NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_solicitud) REFERENCES SolicitudRegistro(id_solicitud),
    FOREIGN KEY (id_admin)     REFERENCES Administrador(id_admin)
);

CREATE TABLE VetoUsuario (
    id_veto       INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario    INT          NOT NULL,
    id_admin      INT          NOT NULL,
    motivo        VARCHAR(500) NOT NULL,
    fecha_veto    DATETIME2    NOT NULL DEFAULT GETDATE(),
    fecha_levanta DATETIME2    NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_admin)   REFERENCES Administrador(id_admin)
);

CREATE TABLE SolicitudCambioPerfil (
    id_solicitud      INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario        INT           NOT NULL,
    id_estado         INT           NOT NULL,
    datos_nuevos_json NVARCHAR(MAX) NOT NULL,
    id_admin_gestor   INT           NULL,
    notas_admin       VARCHAR(500)  NULL,
    fecha_solicitud   DATETIME2     NOT NULL DEFAULT GETDATE(),
    fecha_resolucion  DATETIME2     NULL,
    FOREIGN KEY (id_usuario)      REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_estado)       REFERENCES EstadoSolicitud(id_estado),
    FOREIGN KEY (id_admin_gestor) REFERENCES Administrador(id_admin)
);

CREATE TABLE ServicioEnvio (
    id_servicio          INT IDENTITY(1,1) PRIMARY KEY,
    id_operador          INT           NOT NULL,
    id_estado            INT           NOT NULL,
    nombre               VARCHAR(200)  NOT NULL,
    zona_cobertura       VARCHAR(300)  NOT NULL,
    capacidad_carga_kg   DECIMAL(10,2) NOT NULL,
    precio_envio         DECIMAL(10,2) NOT NULL,
    descripcion          VARCHAR(1000) NULL,
    calificacion_prom    DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
    total_calificaciones INT           NOT NULL DEFAULT 0,
    fecha_creacion       DATETIME2     NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion  DATETIME2     NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_operador) REFERENCES OperadorLogistico(id_operador),
    FOREIGN KEY (id_estado)   REFERENCES EstadoServicio(id_estado)
);

CREATE TABLE FotoServicioEnvio (
    id_foto     INT IDENTITY(1,1) PRIMARY KEY,
    id_servicio INT          NOT NULL,
    url_foto    VARCHAR(500) NOT NULL,
    orden       INT          NOT NULL DEFAULT 1,
    fecha_carga DATETIME2    NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_servicio) REFERENCES ServicioEnvio(id_servicio)
);

CREATE TABLE Ruta (
    id_ruta              INT IDENTITY(1,1) PRIMARY KEY,
    id_empresa           INT           NOT NULL,
    id_estado            INT           NOT NULL,
    origen               VARCHAR(200)  NOT NULL,
    destino              VARCHAR(200)  NOT NULL,
    tipo_servicio        VARCHAR(100)  NOT NULL,
    hora_inicio          TIME          NOT NULL,
    tiempo_estimado_hrs  DECIMAL(6,2)  NOT NULL,
    precio               DECIMAL(10,2) NOT NULL,
    calificacion_prom    DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
    total_calificaciones INT           NOT NULL DEFAULT 0,
    fecha_creacion       DATETIME2     NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion  DATETIME2     NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_empresa) REFERENCES EmpresaTransporte(id_empresa),
    FOREIGN KEY (id_estado)  REFERENCES EstadoServicio(id_estado)
);

CREATE TABLE Vehiculo (
    id_vehiculo    INT IDENTITY(1,1) PRIMARY KEY,
    id_empresa     INT          NOT NULL,
    placa          VARCHAR(20)  NOT NULL UNIQUE,
    tipo           VARCHAR(100) NOT NULL,
    capacidad_kg   DECIMAL(10,2) NULL,
    modelo         VARCHAR(100) NULL,
    anio           INT          NULL,
    activo         BIT          NOT NULL DEFAULT 1,
    fecha_registro DATETIME2    NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_empresa) REFERENCES EmpresaTransporte(id_empresa)
);

CREATE TABLE RutaVehiculo (
    id_ruta_vehiculo INT IDENTITY(1,1) PRIMARY KEY,
    id_ruta          INT       NOT NULL,
    id_vehiculo      INT       NOT NULL,
    fecha_asignacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_ruta)     REFERENCES Ruta(id_ruta),
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id_vehiculo)
);

CREATE TABLE MetodoPago (
    id_metodo      INT IDENTITY(1,1) PRIMARY KEY,
    id_cliente     INT       NOT NULL,
    id_tipo        INT       NOT NULL,
    activo         BIT       NOT NULL DEFAULT 1,
    fecha_registro DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_tipo)    REFERENCES TipoMetodoPago(id_tipo)
);

CREATE TABLE TarjetaSimulada (
    id_tarjeta        INT IDENTITY(1,1) PRIMARY KEY,
    id_metodo         INT           NOT NULL UNIQUE,
    numero_hash       VARCHAR(255)  NOT NULL,
    numero_ultimos4   CHAR(4)       NOT NULL,
    nombre_titular    VARCHAR(150)  NOT NULL,
    fecha_vencimiento CHAR(7)       NOT NULL,
    cvv_hash          VARCHAR(255)  NOT NULL,
    saldo             DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    fingerprint       VARCHAR(64)   NOT NULL,
    FOREIGN KEY (id_metodo) REFERENCES MetodoPago(id_metodo)
);

CREATE TABLE WalletSimulado (
    id_wallet INT IDENTITY(1,1) PRIMARY KEY,
    id_metodo INT           NOT NULL UNIQUE,
    saldo     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    alias     VARCHAR(100)  NULL,
    FOREIGN KEY (id_metodo) REFERENCES MetodoPago(id_metodo)
);

CREATE TABLE CarritoItem (
    id_item         INT IDENTITY(1,1) PRIMARY KEY,
    id_cliente      INT       NOT NULL,
    id_servicio_env INT       NULL,
    id_ruta         INT       NULL,
    tipo_servicio   VARCHAR(20) NOT NULL,
    fecha_inicio    DATE      NULL,
    fecha_fin       DATE      NULL,
    fecha_agregado  DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_cliente)      REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_servicio_env) REFERENCES ServicioEnvio(id_servicio),
    FOREIGN KEY (id_ruta)         REFERENCES Ruta(id_ruta)
);

CREATE TABLE Cupon (
    id_cupon       INT IDENTITY(1,1) PRIMARY KEY,
    id_tipo        INT           NOT NULL,
    id_operador    INT           NULL,
    id_empresa     INT           NULL,
    codigo         VARCHAR(50)   NOT NULL UNIQUE,
    descripcion    VARCHAR(300)  NULL,
    valor          DECIMAL(10,2) NOT NULL,
    fecha_inicio   DATE          NOT NULL,
    fecha_fin      DATE          NOT NULL,
    usos_maximos   INT           NULL,
    usos_actuales  INT           NOT NULL DEFAULT 0,
    activo         BIT           NOT NULL DEFAULT 1,
    fecha_creacion DATETIME2     NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_tipo)     REFERENCES TipoCupon(id_tipo),
    FOREIGN KEY (id_operador) REFERENCES OperadorLogistico(id_operador),
    FOREIGN KEY (id_empresa)  REFERENCES EmpresaTransporte(id_empresa)
);

CREATE TABLE CuponCliente (
    id_cupon_cliente INT IDENTITY(1,1) PRIMARY KEY,
    id_cupon         INT       NOT NULL,
    id_cliente       INT       NOT NULL,
    usado            BIT       NOT NULL DEFAULT 0,
    fecha_uso        DATETIME2 NULL,
    FOREIGN KEY (id_cupon)   REFERENCES Cupon(id_cupon),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE Reservacion (
    id_reservacion      INT IDENTITY(1,1) PRIMARY KEY,
    id_cliente          INT           NOT NULL,
    id_estado           INT           NOT NULL,
    id_metodo_pago      INT           NOT NULL,
    id_servicio_env     INT           NULL,
    id_ruta             INT           NULL,
    id_cupon_aplicado   INT           NULL,
    tipo_servicio       VARCHAR(20)   NOT NULL,
    fecha_inicio        DATE          NOT NULL,
    fecha_fin           DATE          NULL,
    precio_total        DECIMAL(10,2) NOT NULL,
    comision_plataforma DECIMAL(10,2) NOT NULL,
    monto_proveedor     DECIMAL(10,2) NOT NULL,
    descuento_aplicado  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fecha_reservacion   DATETIME2     NOT NULL DEFAULT GETDATE(),
    fecha_cancelacion   DATETIME2     NULL,
    motivo_cancelacion  VARCHAR(500)  NULL,
    FOREIGN KEY (id_cliente)        REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_estado)         REFERENCES EstadoReservacion(id_estado),
    FOREIGN KEY (id_metodo_pago)    REFERENCES MetodoPago(id_metodo),
    FOREIGN KEY (id_servicio_env)   REFERENCES ServicioEnvio(id_servicio),
    FOREIGN KEY (id_ruta)           REFERENCES Ruta(id_ruta),
    FOREIGN KEY (id_cupon_aplicado) REFERENCES Cupon(id_cupon)
);

CREATE TABLE Pago (
    id_pago        INT IDENTITY(1,1) PRIMARY KEY,
    id_reservacion INT           NOT NULL,
    id_metodo      INT           NOT NULL,
    monto          DECIMAL(10,2) NOT NULL,
    estado         VARCHAR(30)   NOT NULL DEFAULT 'PROCESADO',
    referencia     VARCHAR(100)  NULL,
    fecha_pago     DATETIME2     NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_reservacion) REFERENCES Reservacion(id_reservacion),
    FOREIGN KEY (id_metodo)      REFERENCES MetodoPago(id_metodo)
);

CREATE TABLE Calificacion (
    id_calificacion    INT IDENTITY(1,1) PRIMARY KEY,
    id_reservacion     INT          NOT NULL UNIQUE,
    id_cliente         INT          NOT NULL,
    puntuacion         TINYINT      NOT NULL,
    comentario         VARCHAR(1000) NULL,
    fecha_calificacion DATETIME2    NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_reservacion) REFERENCES Reservacion(id_reservacion),
    FOREIGN KEY (id_cliente)     REFERENCES Cliente(id_cliente)
);

CREATE TABLE RespuestaCalificacion (
    id_respuesta    INT IDENTITY(1,1) PRIMARY KEY,
    id_calificacion INT           NOT NULL UNIQUE,
    respuesta       VARCHAR(1000) NOT NULL,
    fecha_respuesta DATETIME2     NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_calificacion) REFERENCES Calificacion(id_calificacion)
);

CREATE TABLE Reporte (
    id_reporte       INT IDENTITY(1,1) PRIMARY KEY,
    id_estado        INT           NOT NULL,
    id_reportante    INT           NOT NULL,
    id_reportado     INT           NOT NULL,
    id_reservacion   INT           NULL,
    id_admin_gestor  INT           NULL,
    tipo_reporte     VARCHAR(50)   NOT NULL,
    motivo           VARCHAR(300)  NOT NULL,
    descripcion      VARCHAR(2000) NULL,
    accion_tomada    VARCHAR(500)  NULL,
    fecha_reporte    DATETIME2     NOT NULL DEFAULT GETDATE(),
    fecha_resolucion DATETIME2     NULL,
    FOREIGN KEY (id_estado)       REFERENCES EstadoReporte(id_estado),
    FOREIGN KEY (id_reportante)   REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_reportado)    REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_reservacion)  REFERENCES Reservacion(id_reservacion),
    FOREIGN KEY (id_admin_gestor) REFERENCES Administrador(id_admin)
);

CREATE TABLE EvidenciaReporte (
    id_evidencia INT IDENTITY(1,1) PRIMARY KEY,
    id_reporte   INT          NOT NULL,
    tipo         VARCHAR(20)  NOT NULL DEFAULT 'FOTO',
    url          VARCHAR(500) NOT NULL,
    fecha_carga  DATETIME2    NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_reporte) REFERENCES Reporte(id_reporte)
);

CREATE TABLE Notificacion (
    id_notificacion INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario      INT           NOT NULL,
    titulo          VARCHAR(200)  NOT NULL,
    mensaje         VARCHAR(2000) NOT NULL,
    leida           BIT           NOT NULL DEFAULT 0,
    tipo            VARCHAR(50)   NULL,
    referencia_id   INT           NULL,
    fecha_creacion  DATETIME2     NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE LogAuditoria (
    id_log     INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT           NULL,
    accion     VARCHAR(100)  NOT NULL,
    entidad    VARCHAR(100)  NULL,
    id_entidad INT           NULL,
    detalle    NVARCHAR(MAX) NULL,
    ip_origen  VARCHAR(45)   NULL,
    fecha      DATETIME2     NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);
GO
