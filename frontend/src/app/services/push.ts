import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private supabaseService = inject(SupabaseService);

  async initPushNotifications() {
    if (Notification.permission === 'denied') {
      console.warn('Los permisos de notificación fueron denegados por el usuario.');
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Este navegador no soporta Web Push Notifications.');
      return;
    }

    try {
      let permission: NotificationPermission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        console.log('Permiso de notificación no concedido.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = 'BGNHW6iJtHc10Rnh3o_gFgqztbOrDb8OGQOq7j1EG_6f-FhUucDmG43MqNPHsLDKe49x_iyDB-3kfwCLDOTQMME';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      await this.guardarSuscripcionEnSupabase(subscription);

    } catch (error) {
      console.error('Error al inicializar las notificaciones push:', error);
    }
  }

  private async guardarSuscripcionEnSupabase(subscription: PushSubscription) {
    const { data: { user } } = await this.supabaseService.client.auth.getUser();
    if (!user) {
      console.warn('No hay un usuario autenticado para asociar el token push.');
      return;
    }

    const { error } = await this.supabaseService.client
      .from('device_tokens')
      .upsert(
        {
          user_id: user.id,
        },
      );

    if (error) {
      console.error('Error al guardar la suscripción en Supabase:', error.message);
    } else {
      console.log('Suscripción Web Push sincronizada exitosamente en Supabase.');
    }
  }

    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
