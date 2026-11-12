# BakeryCore

## Descripcion General

BakeryCore es una aplicacion web progresiva (PWA) de nivel empresarial disenada para automatizar, gestionar y optimizar las operaciones integrales, el control de inventario y la trazabilidad de pedidos para negocios de artesania y pasteleria. 

El sistema esta concebido bajo una arquitectura moderna desacoplada, priorizando la eficiencia del rendimiento movil, la resiliencia en segundo plano y una experiencia de usuario multiplataforma fluida tanto en dispositivos moviles (iOS y Android) como en equipos de escritorio.

---

## Stack Tecnologico Completo

### Frontend y Experiencia de Usuario
* **Framework Principal:** Angular (TypeScript)
* **UI y Componentes Moviles:** Ionic Framework, optimizado para empaquetado y ejecucion como Progressive Web App (PWA).
* **Gestion de Estado y Conectividad:** Clientes HTTP reactivos, manejo de promesas asincronas y observadores para sincronizacion de datos en tiempo real.
* **Service Workers:** Configuracion avanzada para gestion de cache, almacenamiento sin conexion y escucha de eventos de notificacion en segundo plano (`notificationclick`).

### Backend, Base de Datos y Servidor
* **Motor de Base de Datos:** PostgreSQL (alojado en Supabase), con diseno relacional normalizado para entidades de clientes, pedidos, estados y tokens de dispositivos (`device_tokens`).
* **Serverless Edge Functions:** Deno runtime ejecutando funciones en TypeScript para procesamiento aislado en el servidor.
* **Automatizacion de Tareas (Database Cron):** Extension `pg_cron` de PostgreSQL para la ejecucion programada y automatizada de procesos periodicos en el servidor sin servidores intermedios.

### Protocolos de Seguridad y Notificaciones Web Push
* **Estandar Web Push:** Implementacion nativa del protocolo de notificaciones web mediante bibliotecas especializadas (`jsr:@negrel/webpush`).
* **Criptografia y Autenticacion VAPID:** Firmas digitales bajo el estandar ECDSA sobre la curva P-256 (algoritmo ES256). Conversion estructurada de claves publicas y privadas a formato JSON Web Key (JWK) y codificacion Base64Url.
* **Gestion de Suscripciones:** Registro seguro, limpieza y almacenamiento persistente de endpoints de suscripcion push por dispositivo.

---

## Modulos y Funcionalidades Principales

### 1. Sistema Integral de Gestion de Pedidos
* Registro y seguimiento detallado de estados de pedidos (`pendiente`, `entregado`, `cancelado`).
* Control estricto de fechas y horas de entrega con soporte para husos horarios especificos de operacion comercial.
* Validaciones de integridad relacional para asegurar la consistencia de los datos del cliente y los productos asociados.

### 2. Motor Automatizado de Notificaciones Push (Ventana de 3 Dias)
* Tarea automatizada programada diariamente en la base de datos que consulta los pedidos con entregas proximas en una ventana de tiempo de 72 horas.
* Generacion dinamica de payloads enriquecidos que incluyen titulos, descripciones personalizadas e iconos corporativos.
* Despacho masivo y seguro de alertas hacia los dispositivos registrados sin intervencion manual.

### 3. Sistema de Alertas por Pedidos Atrasados
* Monitoreo automatizado diario que detecta aquellos pedidos cuya fecha de entrega programada ya expiro y que permanecen inalterados en estado `pendiente`.
* Notificacion proactiva al personal operativo para evitar incumplimientos y facilitar la actualizacion inmediata del estado comercial del encargo.

### 4. Deep-Linking y Enrutamiento Contextual
* Interceptacion de eventos de interaccion en las notificaciones push (`notificationclick` en el Service Worker).
* Redireccion automatizada del usuario desde la bandeja del sistema operativo directamente hacia la vista de edicion o detalle del pedido especifico dentro de la aplicacion Angular, optimizando el tiempo de respuesta operativa.

---

## Arquitectura y Desafios Tecnicos Resueltos

* **Resolucion de Restricciones en iOS (Apple Push Notification service - APNs):** Mitigacion de errores criptograficos de tipo `BadJwtToken` (HTTP 403) mediante la correcta estructuracion de cabeceras de autorizacion VAPID, normalizacion exacta de longitudes de llaves privadas (32 bytes crudos) y manejo de firmas ES256 compatibles con las estrictas politicas de seguridad de Safari en iOS.
* **Sincronizacion de Zonas Horarias:** Ajuste de ejecucion cronometrica en `pg_cron` (nativo en UTC) mapeado precisamente al huso horario comercial local (`America/Santiago`), garantizando que los disparadores automaticos operen en el momento exacto requerido por el negocio.
* **Persistencia y Ciclo de Vida de PWA:** Configuracion de instalacion en pantalla de inicio para dispositivos moviles (iPhone y tablets Samsung/Android), permitiendo comportamiento similar a una aplicacion nativa con soporte completo para notificaciones en segundo plano.

---

## Instalacion y Configuracion Local

1. **Clonar el repositorio:**
   `git clone https://github.com/tu-usuario/bakerycore.git`

2. **Instalar dependencias del frontend:**
   `npm install`

3. **Configurar variables de entorno:**
   Crea un archivo `.env` o configura los entornos en `src/environments/` con tus credenciales de Supabase y claves VAPID publicas/privadas.

4. **Ejecutar en modo desarrollo:**
   `ionic serve`
