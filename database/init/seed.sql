USE TrackFlowHUB;
GO

-- Roles del sistema
INSERT INTO Rol (nombre, descripcion) VALUES
('ADMIN',    'Administrador de la plataforma'),
('CLIENTE',  'Cliente que solicita envios'),
('OPERADOR', 'Operador logistico'),
('EMPRESA',  'Empresa de transporte');
GO

-- Estados de usuario
INSERT INTO EstadoUsuario (nombre) VALUES
('PENDIENTE'),
('ACTIVO'),
('SUSPENDIDO'),
('VETADO');
GO

-- Estados de solicitud (registro de operador / empresa)
INSERT INTO EstadoSolicitud (nombre) VALUES
('PENDIENTE'),
('APROBADA'),
('RECHAZADA');
GO

-- Estados de servicio de envio (ServicioEnvio.id_estado)
INSERT INTO EstadoServicio (nombre) VALUES
('ACTIVO'),       -- id 1: visible para clientes
('SUSPENDIDO'),   -- id 2: oculto temporalmente
('ELIMINADO');    -- id 3: soft delete
GO

-- Tipos de cupon (Cupon.id_tipo)
INSERT INTO TipoCupon (nombre) VALUES
('PORCENTAJE'),   -- id 1: descuento porcentual
('MONTO_FIJO');   -- id 2: descuento de monto fijo
GO

-- Estados de reservacion (Reservacion.id_estado)
INSERT INTO EstadoReservacion (nombre) VALUES
('PENDIENTE'),    -- id 1
('ACTIVO'),       -- id 2: en curso
('EN_TRANSITO'),  -- id 3
('ENTREGADO'),    -- id 4
('CANCELADO');    -- id 5
GO

-- Estados de reporte (Reporte.id_estado)
INSERT INTO EstadoReporte (nombre) VALUES
('ENVIADO'),      -- id 1: recibido, no revisado
('EN_REVISION'),  -- id 2: en proceso
('ACEPTADO'),     -- id 3: procede, se aplica sancion
('RECHAZADO');    -- id 4: desestimado
GO

-- Tipos de metodo de pago (MetodoPago.id_tipo)
INSERT INTO TipoMetodoPago (nombre) VALUES
('TARJETA'),      -- id 1: tarjeta credito/debito simulada
('WALLET');       -- id 2: wallet simulado
GO