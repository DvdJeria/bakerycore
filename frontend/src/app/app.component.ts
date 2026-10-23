import { Component } from '@angular/core';
import { IonApp, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet
} from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet
  ],
})
export class AppComponent {
  constructor() {}
}
