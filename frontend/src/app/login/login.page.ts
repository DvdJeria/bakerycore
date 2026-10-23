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
  IonButton
} from '@ionic/angular';
import { SupabaseService } from '../services/supabase';

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
export class LoginPage implements OnInit {
  // Inyección de dependencias moderna con inject()
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  email: string = '';
  password: string = '';

  async ngOnInit() {}

  async onLogin() {
    if (!this.email || !this.password) {
      console.warn('Por favor ingresa correo y contraseña');
      return;
    }

    try {
      const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });

      if (error) {
        console.error('Error al iniciar sesión:', error.message);
      } else {
        console.log('¡Inicio de sesión exitoso!', data);
        this.router.navigate(['/home']);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
    }
  }
}
