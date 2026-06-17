USE TrackFlowHUB;
GO

-- Administrador inicial (bootstrap). Los demas se crean desde el panel.
INSERT INTO Usuario (id_rol, id_estado, correo, contrasena_hash, correo_verificado, es_temporal_pwd)
VALUES (1, 2, 'admin@trackflowhub.com', '$2b$10$14h5rPC3o9yQOzxuVJVU3eRrF.osLvthqBXl5gF3yOjzkdN5qce3y', 1, 0);
GO

INSERT INTO Administrador (id_usuario, nombre, apellido)
VALUES ((SELECT id_usuario FROM Usuario WHERE correo='admin@trackflowhub.com'), 'Admin', 'Principal');
GO