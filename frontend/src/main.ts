import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration =
        await navigator.serviceWorker.register('/sw.js');

      console.log(
        'Service Worker registrado correctamente.',
        registration.scope
      );
    } catch (error) {
      console.error(
        'Error registrando Service Worker:',
        error
      );
    }
  });
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});
