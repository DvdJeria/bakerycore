import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  calendarOutline,
  calculatorOutline,
  peopleOutline,
  cubeOutline,
  add
} from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon
  ]
})
export class HomePage implements OnInit {
  private supabaseService = inject(SupabaseService);
  recetas: any[] = [];

  constructor() {
    // Registramos los iconos que usaremos en el menú y vistas
    addIcons({
      'book-outline': bookOutline,
      'calendar-outline': calendarOutline,
      'calculator-outline': calculatorOutline,
      'people-outline': peopleOutline,
      'cube-outline': cubeOutline,
      'add': add
    });
  }

  async ngOnInit() {
    await this.cargarRecetas();
  }

  async cargarRecetas() {
    const { data, error } = await this.supabaseService.client
      .from('receta')
      .select('*');

    if (error) {
      console.error('Error al cargar las recetas:', error.message);
    } else {
      this.recetas = data || [];
    }
  }
}
