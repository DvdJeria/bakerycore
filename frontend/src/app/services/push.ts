import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private supabaseService = inject(SupabaseService);

  async initPushNotifications() {
    alert('1. Iniciando proceso de push...');

    if (Notification.permission === 'denied') {
      alert('❌ Permisos denegados previamente en el navegador.');
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('❌ Este entorno no soporta Web Push.');
      return;
    }

    try {
      let permission: NotificationPermission = Notification.permission;
      if (permission === 'default') {
        alert('2. Solicitando permiso nativo al usuario...');
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        alert('❌ El usuario rechazó o ignoró el permiso.');
        return;
      }

      alert('3. Permiso concedido. Esperando Service Worker...');
      const registration = await navigator.serviceWorker.ready;
      alert('4. Service Worker listo.');

      const vapidPublicKey = 'BGNHW6iJtHc10Rnh3o_gFgqztbOrDb8OGQOq7j1EG_6f-FhUucDmG43MqNPHsLDKe49x_iyDB-3kfwCLDOTQMME';

      alert('5. Suscribiendo al PushManager...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
      });
      alert('6. Suscripción obtenida con éxito. Guardando en Supabase...');

      await this.guardarSuscripcionEnSupabase(subscription);

    } catch (error: any) {
      alert('🔥 EXCEPCIÓN CRÍTICA: ' + (error.message || JSON.stringify(error)));
    }
  }

  private async guardarSuscripcionEnSupabase(subscription: PushSubscription) {
    try {
      const { data: { user }, error: authError } = await this.supabaseService.client.auth.getUser();

      if (authError || !user) {
        alert('🔥 Error Auth: No hay usuario detectado. ' + (authError?.message || 'User is null'));
        return;
      }

      alert('7. Usuario autenticado ID: ' + user.id.substring(0, 6) + '...');
      const endpointHash = await this.generateEndpointHash(subscription.endpoint);

      const { error } = await this.supabaseService.client
        .from('device_tokens')
        .upsert(
          {
            user_id: user.id,
            token: JSON.stringify(subscription),
            endpoint_hash: endpointHash
          },
          { onConflict: 'endpoint_hash' }
        );

      if (error) {
        alert('🔥 Error Supabase DB: ' + error.message);
      } else {
        alert('🎉 ¡ÉXITO! Token guardado correctamente en la BD.');
      }
    } catch (err: any) {
      alert('🔥 Error en guardado Supabase: ' + err.message);
    }
  }

  private async generateEndpointHash(endpoint: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(endpoint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
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
