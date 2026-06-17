# Requerimientos No Funcionales - TRACKFLOW-HUB

Los requerimientos no funcionales describen las cualidades, restricciones y
atributos de calidad que debe cumplir TRACKFLOW-HUB; es decir, **cómo** debe
operar el sistema, a diferencia de los requerimientos funcionales que
describen **qué** hace.

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
