# Base de Datos - BakeryCore

Esta sección documenta la arquitectura relacional, las políticas de seguridad (Row Level Security) y los scripts de inicialización de la base de datos en PostgreSQL (alojada en Supabase).

## Estructura del Esquema (`schema.sql`)

El diseño de la base de datos está normalizado para administrar clientes, pedidos, cotizaciones, recetas e ingredientes de forma segura y consistente:

* **`cliente`**: Almacena la información de contacto y datos comerciales de los clientes.
* **`cotizacion` y `cotizacion_detalle`**: Gestionan presupuestos previos y desglose de productos para pastelería y repostería artesanal.
* **`pedido` y `estado_pedido`**: Controlan el flujo operativo de los encargos, incluyendo fechas y horas de entrega programadas.
* **`receta` y `receta_detalle`**: Manejan la trazabilidad de ingredientes y proporciones por preparación.
* **`ingredientes` y `unidad_medida`**: Catálogos base para el control de inventario y costos.
* **`device_tokens`**: Almacena los endpoints de suscripción push vinculados al `user_id` para las notificaciones móviles.

## Seguridad (Row Level Security - RLS)

Todas las tablas tienen RLS habilitado. El acceso está restringido mediante las siguientes políticas:
* **Usuarios Autenticados**: Tienen permisos de lectura, inserción y actualización según su rol comercial (`authenticated`).
* **Tokens de Dispositivos**: Los usuarios solo pueden gestionar (`ALL`) sus propios registros donde `auth.uid() = user_id`.
* **Roles de Servicio (`service_role`)**: Tienen privilegios elevados para que las tareas automatizadas y Edge Functions puedan consultar pedidos sin restricciones de sesión de usuario.