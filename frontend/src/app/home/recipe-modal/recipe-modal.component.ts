import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonItem, IonInput, IonTextarea,
  IonList, IonLabel, IonIcon, IonCard, IonCardContent, IonSearchbar,
  ModalController, ToastController, LoadingController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline, addOutline, searchOutline } from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-recipe-modal',
  templateUrl: './recipe-modal.component.html',
  styleUrls: ['./recipe-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonItem, IonInput, IonTextarea,
    IonList, IonLabel, IonIcon, IonCard, IonCardContent, IonSearchbar
  ]
})
export class RecipeModalComponent implements OnInit {
  private modalController = inject(ModalController);
  private supabaseService = inject(SupabaseService);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private cdr = inject(ChangeDetectorRef);

  @Input() receta: any = null; // Si viene con datos, estamos editando

  // Campos principales de la receta
  rec_nombre: string = '';
  rec_instrucciones: string = '';

  // Catálogo completo y filtrado para el buscador
  ingredientesDisponibles: any[] = [];
  ingredientesFiltrados: any[] = [];
  searchTerm: string = '';

  // Lista de ingredientes seleccionados para esta receta
  ingredientesSeleccionados: { ing_id: string; ing_nombre: string; cantidad_necesaria: number; unmed_nombre?: string }[] = [];

  // Controles temporales para la selección individual mediante el buscador
  ingredienteSeleccionadoTemp: any = null;
  tempCantidad: number | null = 1;

  constructor() {
    addIcons({
      'close-outline': closeOutline,
      'trash-outline': trashOutline,
      'add-outline': addOutline,
      'search-outline': searchOutline
    });
  }

  ngOnInit() {
    this.cargarIngredientesDisponibles();

    if (this.receta) {
      this.rec_nombre = this.receta.rec_nombre || '';
      this.rec_instrucciones = this.receta.rec_instrucciones || '';
      this.cargarDetalleReceta();
    }
  }

  async cargarIngredientesDisponibles() {
    const { data, error } = await this.supabaseService.client
      .from('ingredientes')
      .select('ing_id, ing_nombre, unidad_medida(unmed_nombre)')
      .eq('is_deleted', false)
      .order('ing_nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar ingredientes:', error.message);
      this.mostrarToast('No se pudieron cargar los ingredientes', 'danger');
    } else {
      this.ingredientesDisponibles = data || [];
      this.ingredientesFiltrados = [...this.ingredientesDisponibles];
    }
  }

  async cargarDetalleReceta() {
    if (!this.receta?.rec_id) return;

    const { data, error } = await this.supabaseService.client
      .from('receta_detalle')
      .select('ing_id, cantidad_necesaria, ingredientes(ing_nombre, unidad_medida(unmed_nombre))')
      .eq('rec_id', this.receta.rec_id);

    if (!error && data) {
      this.ingredientesSeleccionados = data.map((d: any) => ({
        ing_id: d.ing_id,
        ing_nombre: d.ingredientes?.ing_nombre || 'Ingrediente',
        cantidad_necesaria: d.cantidad_necesaria,
        unmed_nombre: d.ingredientes?.unidad_medida?.unmed_nombre || ''
      }));
    }
  }

  filtrarIngredientes(event: any) {
    const texto = event.target.value ? event.target.value.toLowerCase() : '';
    this.searchTerm = texto;

    if (!texto.trim()) {
      this.ingredientesFiltrados = [...this.ingredientesDisponibles];
    } else {
      this.ingredientesFiltrados = this.ingredientesDisponibles.filter(item =>
        item.ing_nombre.toLowerCase().includes(texto)
      );
    }
    this.cdr.detectChanges();
  }

  seleccionarIngrediente(ing: any) {
    this.ingredienteSeleccionadoTemp = ing;
    this.searchTerm = ing.ing_nombre;
    this.ingredientesFiltrados = [];
    this.cdr.detectChanges();
  }

  limpiarSeleccionTemp() {
    this.ingredienteSeleccionadoTemp = null;
    this.searchTerm = '';
    this.ingredientesFiltrados = [...this.ingredientesDisponibles];
    this.cdr.detectChanges();
  }

  // Agrega un ingrediente a la lista local de la receta
  agregarIngredienteALista() {
    if (!this.ingredienteSeleccionadoTemp) {
      this.mostrarToast('Selecciona un ingrediente usando el buscador', 'warning');
      return;
    }
    if (!this.tempCantidad || this.tempCantidad <= 0) {
      this.mostrarToast('Ingresa una cantidad válida', 'warning');
      return;
    }

    const ingId = this.ingredienteSeleccionadoTemp.ing_id;

    // Validar si ya está agregado en la lista
    const existe = this.ingredientesSeleccionados.some(i => i.ing_id === ingId);
    if (existe) {
      this.mostrarToast('Este ingrediente ya está agregado en la receta', 'warning');
      return;
    }

    this.ingredientesSeleccionados.push({
      ing_id: ingId,
      ing_nombre: this.ingredienteSeleccionadoTemp.ing_nombre,
      cantidad_necesaria: this.tempCantidad,
      unmed_nombre: this.ingredienteSeleccionadoTemp.unidad_medida?.unmed_nombre || ''
    });

    // Limpiar campos temporales para el siguiente
    this.limpiarSeleccionTemp();
    this.tempCantidad = 1;
  }

  quitarIngrediente(ing_id: string) {
    this.ingredientesSeleccionados = this.ingredientesSeleccionados.filter(i => i.ing_id !== ing_id);
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.modalController.dismiss(false);
  }

  async guardarReceta() {
    if (!this.rec_nombre.trim()) {
      this.mostrarToast('El nombre de la receta es obligatorio', 'warning');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Guardando receta...' });
    await loading.present();

    try {
      let recId = this.receta?.rec_id;
      const instruccionesFinal = this.rec_instrucciones?.trim() ? this.rec_instrucciones.trim() : null;

      if (recId) {
        // 1A. Actualizar cabecera de la receta
        const { error: errReceta } = await this.supabaseService.client
          .from('receta')
          .update({
            rec_nombre: this.rec_nombre.trim(),
            rec_instrucciones: instruccionesFinal
          })
          .eq('rec_id', recId);

        if (errReceta) throw errReceta;

        // 1B. Borrar detalles anteriores para reinsertar los actualizados limpiamente
        const { error: errDelDetalle } = await this.supabaseService.client
          .from('receta_detalle')
          .delete()
          .eq('rec_id', recId);

        if (errDelDetalle) throw errDelDetalle;

      } else {
        // 2A. Insertar nueva receta
        const { data: dataReceta, error: errReceta } = await this.supabaseService.client
          .from('receta')
          .insert({
            rec_nombre: this.rec_nombre.trim(),
            rec_instrucciones: instruccionesFinal
          })
          .select('rec_id')
          .single();

        if (errReceta) throw errReceta;
        recId = dataReceta.rec_id;
      }

      // 3. Insertar los ingredientes en receta_detalle (si hay seleccionados)
      if (this.ingredientesSeleccionados.length > 0) {
        const detalles = this.ingredientesSeleccionados.map(i => ({
          rec_id: recId,
          ing_id: i.ing_id,
          cantidad_necesaria: i.cantidad_necesaria
        }));

        const { error: errDetalle } = await this.supabaseService.client
          .from('receta_detalle')
          .insert(detalles);

        if (errDetalle) throw errDetalle;
      }

      await loading.dismiss();
      this.mostrarToast('Receta guardada exitosamente');
      this.modalController.dismiss(true);

    } catch (error: any) {
      await loading.dismiss();
      console.error('Error al guardar receta:', error.message || error);
      this.mostrarToast('Error al guardar la receta en la base de datos', 'danger');
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
}
