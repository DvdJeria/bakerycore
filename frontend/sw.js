// sw.js - Service Worker para Web Push Notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'BakeryCore', body: 'Tienes una nueva actualización' };

  const options = {
    body: data.body,
    icon: '/assets/icon/icon.png', // Asegúrate de tener este ícono o cámbialo por el tuyo
    badge: '/assets/icon/icon.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejar el clic en la notificación para abrir la app en la página correcta
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled:true }).then(windowClients => {
      // Si ya hay una ventana abierta, enfocarla
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir una nueva ventana con la URL del evento
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
