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