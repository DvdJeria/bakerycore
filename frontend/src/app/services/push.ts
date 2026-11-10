import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private supabaseService = inject(SupabaseService);
  private toastController = inject(ToastController);

  async initPushNotifications() {
    if (Notification.permission === 'denied') {
      await this.presentToast('Permisos denegados previamente en el navegador.', 'danger');
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      await this.presentToast('Este entorno no soporta Web Push.', 'danger');
      return;
    }

    try {
      let permission: NotificationPermission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        await this.presentToast('El usuario rechazó o ignoró el permiso de notificaciones.', 'danger');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = 'BGNHW6iJtHc10Rnh3o_gFgqztbOrDb8OGQOq7j1EG_6f-FhUucDmG43MqNPHsLDKe49x_iyDB-3kfwCLDOTQMME';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
      });

      await this.guardarSuscripcionEnSupabase(subscription);

    } catch (error: any) {
      console.error('Excepción crítica en Push:', error);
      await this.presentToast('Error al inicializar las notificaciones.', 'danger');
    }
  }

  private async guardarSuscripcionEnSupabase(subscription: PushSubscription) {
    try {
      const { data: { user }, error: authError } = await this.supabaseService.client.auth.getUser();

      if (authError || !user) {
        console.error('Error Auth:', authError?.message || 'User is null');
        await this.presentToast('No hay una sesión de usuario activa.', 'danger');
        return;
      }

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
        console.error(`Error Supabase [${error.code}]:`, error.message, error.details);
        await this.presentToast('No se pudo guardar la suscripción en la base de datos.', 'danger');
      } else {
        await this.presentToast('¡Notificaciones configuradas correctamente!', 'success');
      }
    } catch (err: any) {
      console.error('Error en guardado Supabase:', err);
      await this.presentToast('Error de comunicación con el servidor.', 'danger');
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

  private async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
