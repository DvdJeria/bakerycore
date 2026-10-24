import { Component } from '@angular/core';
import { RouterLink, RouterModule } from "@angular/router";
import {
  IonApp, IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent,
  IonList,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,

} from '@ionic/angular'; // <-- Importa los componentes de la lista
import { addIcons } from 'ionicons';
import { bookOutline, calendarOutline, calculatorOutline, peopleOutline, cubeOutline } from 'ionicons/icons';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    RouterModule, // <-- Indispensable para que funcionen tus routerLink en Standalone
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonApp, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonRouterOutlet
  ],
})
export class AppComponent {
  constructor() {
    // REGISTRA LOS ÍCONOS NUEVAMENTE PARA ESTE COMPONENTE
    addIcons({
      'book-outline': bookOutline,
      'calendar-outline': calendarOutline,
      'calculator-outline': calculatorOutline,
      'people-outline': peopleOutline,
      'cube-outline': cubeOutline
    });
  }
}
