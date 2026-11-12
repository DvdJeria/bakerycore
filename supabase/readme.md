# Backend y Arquitectura Serverless (Supabase & Deno)

El backend de BakeryCore está construido bajo un enfoque serverless y orientado a eventos, utilizando **Supabase Edge Functions** ejecutadas en un entorno **Deno (TypeScript)**.

## Automatización con `pg_cron`
Las tareas periódicas del negocio no dependen de un servidor Node.js tradicional encendido. Se ejecutan directamente desde PostgreSQL utilizando la extensión `pg_cron`, la cual realiza llamadas HTTP seguras (`net.http_post`) hacia las Edge Functions en horarios específicos configurados según el huso horario comercial (`America/Santiago`).

## Funciones Desplegadas

### 1. `enviar-recordatorios-pedidos` (Alerta de 3 Días)
* **Propósito:** Consulta diariamente los pedidos cuya fecha de entrega se encuentra en una ventana de 72 horas.
* **Funcionamiento:**
    1. Obtiene los pedidos próximos y los tokens de dispositivos activos (`device_tokens`).
    2. Genera los payloads con deep-links hacia la PWA de Angular.
    3. Firma criptográficamente el mensaje utilizando el estándar VAPID (ECDSA P-256 / `@negrel/webpush`).
    4. Despacha la notificación push a través de los servicios de Apple (APNs) y Google (FCM).

### 2. `enviar-alertas-pedidos-atrasados`
* **Propósito:** Detecta encargos cuya fecha de entrega programada ya expiró y que continúan en estado `pendiente`.
* **Funcionamiento:** Notifica de forma proactiva al personal operativo para evitar incumplimientos comerciales.