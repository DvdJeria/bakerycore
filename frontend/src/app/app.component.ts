import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  IonApp,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  bookOutline,
  calendarOutline,
  calculatorOutline,
  peopleOutline,
  cubeOutline
} from 'ionicons/icons';

import { SupabaseService } from './services/supabase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    RouterModule,
    IonApp,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet
  ]
})
export class AppComponent {

  private supabaseService = inject(SupabaseService);

  constructor() {
    addIcons({
      'book-outline': bookOutline,
      'calendar-outline': calendarOutline,
      'calculator-outline': calculatorOutline,
      'people-outline': peopleOutline,
      'cube-outline': cubeOutline
    });
  }

}
