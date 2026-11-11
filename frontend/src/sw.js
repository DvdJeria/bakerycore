
/**
 * BakeryCore - Service Worker
 * Gestión de notificaciones Web Push.
 */

/**
 * Recepción de notificaciones Push.
 */
self.addEventListener('push', (event) => {

  let data = {
    title: 'BakeryCore',
    body: 'Tienes una nueva notificación.',
    icon: '/assets/icon/icon.png',
    badge: '/assets/icon/icon.png',
    url: '/'
  };

  // Interpretar información recibida desde Supabase
  try {

    if (event.data) {
      data = {
        ...data,
        ...event.data.json()
      };
    }

  } catch (error) {

    console.error(
      'Error interpretando el mensaje Push:',
      error
    );
  }

  // Configuración de la notificación
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: {
      url: data.url || '/'
    },
    tag: data.tag || 'bakerycore-notification',
    renotify: false
  };

  // Mostrar notificación en el dispositivo
  event.waitUntil(
    self.registration.showNotification(
      data.title,
      options
    )
  );

});


/**
 * Acción al pulsar una notificación.
 */
self.addEventListener('notificationclick', (event) => {

  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || '/',
    self.location.origin
  );

  // Evitar abrir direcciones externas
  if (targetUrl.origin !== self.location.origin) {
    return;
  }

  event.waitUntil(

    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })

      .then(async (windowClients) => {

        // Buscar una ventana existente de BakeryCore
        for (const client of windowClients) {

          if (
            new URL(client.url).origin === self.location.origin
          ) {

            await client.focus();

            // Navegar a la ruta indicada
            if (client.navigate) {
              return client.navigate(targetUrl.href);
            }

            return;
          }
        }

        // Abrir aplicación si no existe una ventana
        return clients.openWindow(targetUrl.href);

      })

  );

});


/**
 * Cierre de notificaciones.
 */
self.addEventListener('notificationclose', (event) => {

  console.log(
    'Notificación cerrada:',
    event.notification.tag
  );

});
