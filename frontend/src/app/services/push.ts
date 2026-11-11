import {Injectable, inject} from '@angular/core';
import {ToastController} from '@ionic/angular';
import {SupabaseService} from './supabase';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  private supabaseService = inject(SupabaseService);
  private toastController = inject(ToastController);

  private readonly vapidPublicKey = 'BGNHW6iJtHc10Rnh3o_gFgqztbOrDb8OGQOq7j1EG_6f-FhUucDmG43MqNPHsLDKe49x_iyDB-3kfwCLDOTQMME';

  /**
   * Inicializa las notificaciones Push.
   * Debe ejecutarse desde una interacción del usuario.
   */
  async initPushNotifications(): Promise<void> {

    // 1. Comprobar soporte del navegador
    if (
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      await this.presentToast(
        'Este navegador no soporta notificaciones Web Push.',
        'danger'
      );
      return;
    }

    // 2. Comprobar permisos
    if (Notification.permission === 'denied') {
      await this.presentToast(
        'Los permisos están bloqueados. Debes habilitarlos en los ajustes del navegador.',
        'danger'
      );
      return;
    }

    try {

      // 3. Solicitar permiso si todavía no existe
      let permission: NotificationPermission = Notification.permission;

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        await this.presentToast(
          'No se concedieron los permisos de notificaciones.',
          'danger'
        );
        return;
      }

      // 4. Obtener el Service Worker registrado
      const registration = await navigator.serviceWorker.ready;

      // 5. Comprobar si ya existe una suscripción
      let subscription = await registration.pushManager.getSubscription();

      // 6. Crear suscripción solamente si no existe
      if (!subscription) {

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToArrayBuffer(
            this.vapidPublicKey
          )
        });
      }

      // 7. Guardar suscripción en Supabase
      await this.guardarSuscripcionEnSupabase(subscription);

    } catch (error: unknown) {

      console.error('Error inicializando Push:', error);

      await this.presentToast(
        'No fue posible inicializar las notificaciones.',
        'danger'
      );
    }
  }

  /**
   * Guarda o actualiza la suscripción del dispositivo.
   */
  private async guardarSuscripcionEnSupabase(
    subscription: PushSubscription
  ): Promise<void> {

    try {

      // 1. Obtener usuario autenticado
      const {
        data: {user},
        error: authError
      } = await this.supabaseService.client.auth.getUser();

      if (authError || !user) {

        console.error(
          'Error de autenticación:',
          authError?.message
        );

        await this.presentToast(
          'No existe una sesión de usuario activa.',
          'danger'
        );

        return;
      }

      // 2. Generar hash del endpoint
      const endpointHash = await this.generateEndpointHash(
        subscription.endpoint
      );

      // 3. Preparar información de la suscripción
      const subscriptionData = {
        user_id: user.id,
        token: JSON.stringify(subscription.toJSON()),
        endpoint_hash: endpointHash
      };

      // 4. Guardar en Supabase
      const {error} = await this.supabaseService.client
        .from('device_tokens')
        .upsert(
          subscriptionData,
          {
            onConflict: 'endpoint_hash'
          }
        );

      if (error) {

        console.error('Error Supabase:', {
          code: error.code,
          message: error.message,
          details: error.details
        });

        await this.presentToast(
          'No se pudo guardar la suscripción.',
          'danger'
        );

        return;
      }

      console.log(
        'Suscripción Push registrada correctamente.',
        {
          userId: user.id,
          endpointHash
        }
      );

      await this.presentToast(
        '¡Notificaciones configuradas correctamente!',
        'success'
      );

    } catch (error: unknown) {

      console.error(
        'Error guardando suscripción:',
        error
      );

      await this.presentToast(
        'Error de comunicación con Supabase.',
        'danger'
      );
    }
  }

  /**
   * Genera SHA-256 del endpoint Push.
   */
  private async generateEndpointHash(
    endpoint: string
  ): Promise<string> {

    const encoder = new TextEncoder();

    const data = encoder.encode(endpoint);

    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      data
    );

    const hashArray = Array.from(
      new Uint8Array(hashBuffer)
    );

    return hashArray
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convierte la clave pública VAPID Base64 URL-safe.
   */

  private urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {

    const padding = '='.repeat(
      (4 - (base64String.length % 4)) % 4
    );

    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);

    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer as ArrayBuffer;
  }


  /**
   * Muestra mensajes al usuario.
   */
  private async presentToast(
    message: string,
    color: 'success' | 'danger'
  ): Promise<void> {

    const toast = await this.toastController.create({
      message,
      duration: 3500,
      position: 'bottom',
      color,
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
