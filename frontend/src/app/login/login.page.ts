import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  ToastController
} from '@ionic/angular';
import { SupabaseService } from '../services/supabase';
import { PushService } from '../services/push';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton
  ]
})

export class LoginPage{

  // Inyección de dependencias moderna con inject()
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private pushService = inject(PushService);

  email: string = '';
  password: string = '';
  cargando: boolean = false;

  async mostrarMensaje(mensaje: string, color: 'danger' | 'warning' | 'success' = 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3500,
      color: color,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  async onLogin() {
    if (!this.email || !this.password) {
      await this.mostrarMensaje('Por favor ingresa tu correo y contraseña.', 'warning');
      return;
    }

    this.cargando = true;

    try {
      const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });

      if (error) {
        // Mapeo de errores comunes para mostrar un mensaje claro al usuario
        if (error.message.includes('Invalid login credentials')) {
          await this.mostrarMensaje('Correo o contraseña incorrectos. Revisa tus datos e intenta nuevamente.');
        } else {
          await this.mostrarMensaje(`Error al iniciar sesión: ${error.message}`);
        }
      } else if (data.session) {
        await this.mostrarMensaje('¡Bienvenido a BakeryCore!', 'success');
        this.router.navigate(['/home'], { replaceUrl: true });
        this.despuesDeLogin();
      }
    } catch (err) {
      console.error('Error inesperado al iniciar sesión:', err);
      await this.mostrarMensaje('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      this.cargando = false;
    }
  }

  async despuesDeLogin() {
    await this.pushService.initPushNotifications();
  }

}
