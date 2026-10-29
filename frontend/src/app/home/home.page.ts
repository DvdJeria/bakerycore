import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonSpinner, IonList, IonItemSliding, IonItem,
  IonThumbnail, IonLabel, IonAccordionGroup, IonAccordion,
  IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton,
  IonText, AlertController, LoadingController, ModalController, ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { fastFoodOutline, createOutline, trashOutline, add, menuOutline } from 'ionicons/icons';

import { SupabaseService } from '../services/supabase';
import { Router } from '@angular/router';

import { RecipeModalComponent } from './recipe-modal/recipe-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonSpinner, IonList, IonItemSliding, IonItem,
    IonLabel, IonAccordionGroup, IonAccordion,
    IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton, IonText
  ]
})
export class HomePage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private modalController = inject(ModalController);
  private cdr = inject(ChangeDetectorRef); // Inyectamos detector de cambios

  recetas: any[] = [];
  isLoading = false;

  constructor() {
    addIcons({
      'fast-food-outline': fastFoodOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'add': add,
      'menu-outline': menuOutline
    });
  }

  async ngOnInit() {
    await this.cargarRecetas();
  }

  ionViewWillEnter() {
    this.cargarRecetas();
  }

  async cargarRecetas() {
    this.isLoading = true;
    this.cdr.detectChanges(); // Forzamos a que pinte el spinner

    try {
      const { data, error } = await this.supabaseService.client
        .from('receta')
        .select(`
          *,
          receta_detalle (
            cantidad_necesaria,
            ingredientes:ing_id (
              ing_nombre,
              unidad_medida:unmed_id (
                unmed_nombre
              )
            )
          )
        `)
        .order('rec_fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error de Supabase al cargar recetas:', error.message);
        this.recetas = [];
      } else {
        console.log('Recetas cargadas exitosamente:', data);
        this.recetas = data || [];
      }
    } catch (err: any) {
      console.error('Excepción inesperada al cargar:', err);
      this.recetas = [];
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // Forzamos a que la UI se redibuje con las recetas o el estado vacío
    }
  }

  async abrirModalReceta(receta: any = null) {
    const modal = await this.modalController.create({
      component: RecipeModalComponent,
      componentProps: { receta: receta }
    });

    await modal.present();

    const resultado = await modal.onDidDismiss();

    // Si guardó o editó con éxito, recargamos obligatoriamente
    if (resultado && resultado.data === true) {
      await this.cargarRecetas();
    }
  }

  async confirmarEliminacion(receta: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar la receta "${receta.rec_nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.eliminarReceta(receta.rec_id);
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarReceta(rec_id: string) {
    const loading = await this.loadingController.create({ message: 'Eliminando...' });
    await loading.present();

    const { error } = await this.supabaseService.client
      .from('receta')
      .delete()
      .eq('rec_id', rec_id);

    await loading.dismiss();

    if (error) {
      console.error('Error al eliminar:', error.message);
      this.mostrarToast('No se pudo eliminar la receta', 'danger');
    } else {
      this.mostrarToast('Receta eliminada correctamente');
      this.cargarRecetas();
    }
  }

  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  async cerrarSesion() {
    const { error } = await this.supabaseService.client.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
    } else {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
}
