# Justificación de Tecnologías Seleccionadas — TrackFlow-HUB

## Frontend: Vue.js

Vue tiene una curva de aprendizaje más suave que React o Angular, lo cual es relevante porque el proyecto se desarrolla en sprints de solo 6 días: el equipo necesita ser productivo rápido sin perder tiempo en boilerplate.

Su sistema de reactividad declarativa facilita construir las múltiples vistas dinámicas que pide el sistema (estado de envíos en tiempo real, calendarios de programación, listados filtrables de servicios), ya que los cambios en los datos se reflejan automáticamente en la interfaz sin manipulación manual del DOM.

La arquitectura basada en componentes permite reutilizar piezas de UI entre los cuatro módulos de usuario (cliente, operador, empresa, administrador), que comparten patrones similares de formularios, tablas y paneles.

Además, Vue se integra de forma natural con Tailwind CSS (recomendado en el enunciado) mediante componentes de archivo único con estilos encapsulados, y cuenta con herramientas oficiales como Vue Router y Pinia para manejar navegación y estado global, este último necesario para implementar el carrito de compras persistente que exige el módulo de clientes.

---

## Backend: Node.js + Express

Usar JavaScript tanto en frontend como en backend reduce la curva de aprendizaje del equipo y permite compartir convenciones de validación entre cliente y servidor, lo que se traduce en mayor velocidad de desarrollo dentro del tiempo limitado del curso.

La arquitectura de Node basada en eventos y E/S no bloqueante es adecuada para un sistema con muchas operaciones asíncronas: envío de correos con tokens de verificación, notificaciones de cambios de estado, procesamiento de pagos simulados y generación de reportes.

Express, por su parte, es minimalista y permite estructurar fácilmente una API REST con middlewares para autenticación (JWT), control de acceso por rol y validación de formularios, sin imponer una estructura rígida.

El ecosistema de npm ofrece librerías maduras que cubren necesidades puntuales del proyecto:

- **bcrypt** — hashear contraseñas.
- **jsonwebtoken** — tokens de sesión y 2FA.
- **nodemailer** — envío de correos.
- **multer** — carga de fotografías.
- **csv-parser** — carga masiva de flotas y rutas.

Finalmente, Node se containeriza de forma sencilla con Docker y se integra bien en pipelines de CI/CD con GitHub Actions, ambos requisitos explícitos del proyecto.

---

## Base de datos: SQL Server

El dominio del problema es altamente relacional: usuarios con distintos roles, envíos, servicios de transporte, pagos, reportes, cupones y calificaciones, todos con relaciones claras entre sí y necesidad de integridad referencial.

SQL Server, como motor relacional, garantiza transacciones ACID, lo cual es crítico para las operaciones financieras del sistema (procesamiento de pagos, distribución de ganancias 80/20 y 90/10), donde no se puede permitir inconsistencia en los montos.

También ofrece buen soporte para consultas complejas con agregaciones y joins, necesarias para generar las gráficas y reportes administrativos que pide el sistema (zonas con mayor volumen, ingresos por tipo de servicio, destinos frecuentes).

Herramientas como SQL Server Management Studio o Azure Data Studio facilitan el modelado del diagrama entidad-relación que se debe entregar como documentación.

Por último, SQL Server puede desplegarse en un contenedor Docker (imagen oficial de Microsoft) o como servicio administrado en la nube (Azure SQL Database), cumpliendo con el requisito de arquitectura del proyecto, y cuenta con drivers estables para Node.js (`mssql`, `tedious`) que facilitan la integración con el backend.