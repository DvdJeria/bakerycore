import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonSpinner, IonButton, IonIcon, IonItem,
  IonInput, IonLabel, IonCard, IonCardContent, IonList,
  IonItemSliding, IonItemOptions, IonItemOption,
  AlertController, LoadingController, ToastController, IonFab, IonFabButton, IonModal, IonSearchbar
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  calculatorOutline, addOutline, trashOutline,
  saveOutline, documentTextOutline, add, createOutline, closeOutline
} from 'ionicons/icons';

import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-cotizaciones',
  templateUrl: './cotizaciones.page.html',
  styleUrls: ['./cotizaciones.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonSpinner, IonButton, IonIcon, IonItem,
    IonInput, IonCard,
    IonCardContent, IonList, IonItemSliding, IonItemOptions, IonItemOption,
    IonFab, IonFabButton, IonModal, IonSearchbar
  ]
})
export class CotizacionesPage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  cotizaciones: any[] = [];
  ingredientesDisponibles: any[] = [];
  ingredientesFiltrados: any[] = [];
  isLoading = false;

  // Estado del Modal (Crear / Editar)
  isModalOpen = false;
  cotizacionForm: FormGroup;
  cotizacionEditando: any = null; // Si tiene valor, estamos editando

  // Variables temporales para el buscador dentro del modal
  searchTerm: string = '';
  ingredienteSeleccionadoTemp: any = null;
  cantidadUsadaTemp: number = 1;

  constructor() {
    addIcons({
      'calculator-outline': calculatorOutline,
      'add-outline': addOutline,
      'trash-outline': trashOutline,
      'save-outline': saveOutline,
      'document-text-outline': documentTextOutline,
      'add': add,
      'create-outline': createOutline,
      'close-outline': closeOutline
    });

    this.cotizacionForm = this.fb.group({
      cot_nombre: ['', [Validators.required]],
      detalles: this.fb.array([])
    });
  }

  async ngOnInit() {
    await Promise.all([this.cargarIngredientes(), this.cargarCotizacionesGuardadas()]);
  }

  ionViewWillEnter() {
    this.cargarCotizacionesGuardadas();
  }

  async cargarIngredientes() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('ingredientes')
        .select(`
          ing_id,
          ing_nombre,
          ing_precio,
          ing_cantidad_base,
          unidad_medida (
            unmed_nombre
          )
        `)
        .eq('is_deleted', false)
        .order('ing_nombre', { ascending: true });

      if (error) throw error;
      this.ingredientesDisponibles = data || [];
      this.ingredientesFiltrados = [...this.ingredientesDisponibles];
    } catch (err: any) {
      console.error('Error al cargar ingredientes:', err.message);
    }
  }

  async cargarCotizacionesGuardadas() {
    this.isLoading = true;
    try {
      const { data, error } = await this.supabaseService.client
        .from('cotizacion')
        .select('*')
        .order('cot_fecha', { ascending: false });

      if (error) throw error;
      this.cotizaciones = data || [];
    } catch (err: any) {
      console.error('Error al cargar cotizaciones:', err.message);
      this.cotizaciones = [];
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  get detalles(): FormArray {
    return this.cotizacionForm.get('detalles') as FormArray;
  }

  async abrirModalCotizacion(cotizacion: any = null) {
    this.cotizacionForm.reset();
    this.detalles.clear();
    this.ingredienteSeleccionadoTemp = null;
    this.searchTerm = '';
    this.ingredientesFiltrados = [...this.ingredientesDisponibles];
    this.cantidadUsadaTemp = 1;

    if (cotizacion) {
      // Modo Edición
      this.cotizacionEditando = cotizacion;
      this.cotizacionForm.patchValue({ cot_nombre: cotizacion.cot_nombre });

      // Cargar los detalles de esta cotización desde Supabase
      const loading = await this.loadingController.create({ message: 'Cargando detalles...' });
      await loading.present();

      const { data, error } = await this.supabaseService.client
        .from('cotizacion_detalle')
        .select(`
          cantidad_usada,
          precio_unitario_fijo,
          ingredientes (
            ing_id,
            ing_nombre,
            ing_precio,
            ing_cantidad_base,
            unidad_medida (
              unmed_nombre
            )
          )
        `)
        .eq('cot_id', cotizacion.cot_id);

      await loading.dismiss();

      if (!error && data) {
        data.forEach((det: any) => {
          const ing = det.ingredientes;
          const detalleGroup = this.fb.group({
            ing_id: [ing?.ing_id, Validators.required],
            ing_nombre: [ing?.ing_nombre || 'Ingrediente'],
            ing_precio: [det.precio_unitario_fijo || ing?.ing_precio],
            ing_cantidad_base: [ing?.ing_cantidad_base || 1],
            unmed_nombre: [ing?.unidad_medida?.unmed_nombre || 'Unidad'],
            cantidad_usada: [det.cantidad_usada, [Validators.required, Validators.min(0.01)]]
          });
          this.detalles.push(detalleGroup);
        });
      }
    } else {
      // Modo Creación Nueva
      this.cotizacionEditando = null;
    }

    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.cotizacionEditando = null;
    this.cotizacionForm.reset();
    this.detalles.clear();
    this.cdr.detectChanges();
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

  agregarIngredienteAlDetalle() {
    if (!this.ingredienteSeleccionadoTemp) {
      this.mostrarToast('Selecciona un ingrediente', 'warning');
      return;
    }

    if (!this.cantidadUsadaTemp || this.cantidadUsadaTemp <= 0) {
      this.mostrarToast('Ingresa una cantidad válida mayor a 0', 'warning');
      return;
    }

    const ingId = this.ingredienteSeleccionadoTemp.ing_id;
    const existe = this.detalles.controls.some(ctrl => ctrl.value.ing_id === ingId);

    if (existe) {
      this.mostrarToast('Este ingrediente ya está agregado en la cotización', 'warning');
      return;
    }

    const detalleGroup = this.fb.group({
      ing_id: [ingId, Validators.required],
      ing_nombre: [this.ingredienteSeleccionadoTemp.ing_nombre],
      ing_precio: [this.ingredienteSeleccionadoTemp.ing_precio],
      ing_cantidad_base: [this.ingredienteSeleccionadoTemp.ing_cantidad_base],
      unmed_nombre: [this.ingredienteSeleccionadoTemp.unidad_medida?.unmed_nombre || 'Unidad'],
      cantidad_usada: [this.cantidadUsadaTemp, [Validators.required, Validators.min(0.01)]]
    });

    this.detalles.push(detalleGroup);

    this.limpiarSeleccionTemp();
    this.cantidadUsadaTemp = 1;
    this.cdr.detectChanges();
  }

  removerDetalle(index: number) {
    this.detalles.removeAt(index);
    this.cdr.detectChanges();
  }

  calcularSubtotal(detalleValue: any): number {
    const precio = Number(detalleValue.ing_precio) || 0;
    const usada = Number(detalleValue.cantidad_usada) || 0;
    const base = Number(detalleValue.ing_cantidad_base) || 1;

    if (base <= 0) return 0;
    return (precio * usada) / base;
  }

  get sumaIngredientes(): number {
    let total = 0;
    for (const ctrl of this.detalles.controls) {
      total += this.calcularSubtotal(ctrl.value);
    }
    return total;
  }

  get cotizacionTotal(): number {
    return this.sumaIngredientes * 2;
  }

  async guardarCotizacion() {
    if (this.cotizacionForm.invalid || this.detalles.length === 0) {
      this.mostrarToast('Asigna un nombre a la cotización y agrega al menos un ingrediente', 'danger');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Guardando cotización...' });
    await loading.present();

    try {
      const nombreCotización = this.cotizacionForm.get('cot_nombre')?.value;
      const totalFinal = this.cotizacionTotal;
      let cotId: string;

      if (this.cotizacionEditando) {
        // --- MODO EDITAR ---
        cotId = this.cotizacionEditando.cot_id;

        const { error: updateError } = await this.supabaseService.client
          .from('cotizacion')
          .update({
            cot_nombre: nombreCotización,
            cot_total: totalFinal
          })
          .eq('cot_id', cotId);

        if (updateError) throw updateError;

        // Borrar detalles antiguos y reinsertar los nuevos
        const { error: delError } = await this.supabaseService.client
          .from('cotizacion_detalle')
          .delete()
          .eq('cot_id', cotId);

        if (delError) throw delError;

      } else {
        // --- MODO CREAR ---
        const { data: cotData, error: cotError } = await this.supabaseService.client
          .from('cotizacion')
          .insert([{
            cot_nombre: nombreCotización,
            cot_total: totalFinal,
            cot_fecha: new Date().toISOString()
          }])
          .select('cot_id')
          .single();

        if (cotError) throw cotError;
        cotId = cotData.cot_id;
      }

      // Insertar Detalles con Histórico de Precios
      const detallesInserts = this.detalles.controls.map(ctrl => {
        const val = ctrl.value;
        return {
          cot_id: cotId,
          ing_id: val.ing_id,
          cantidad_usada: val.cantidad_usada,
          precio_unitario_fijo: val.ing_precio
        };
      });

      const { error: detError } = await this.supabaseService.client
        .from('cotizacion_detalle')
        .insert(detallesInserts);

      if (detError) throw detError;

      await loading.dismiss();
      this.mostrarToast(this.cotizacionEditando ? '¡Cotización actualizada exitosamente!' : '¡Cotización guardada exitosamente!');
      this.cerrarModal();
      this.cargarCotizacionesGuardadas();

    } catch (err: any) {
      await loading.dismiss();
      console.error('Error al guardar cotización:', err.message);
      this.mostrarToast('Ocurrió un error al guardar', 'danger');
    }
  }

  async confirmarEliminacion(cot: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar la cotización "${cot.cot_nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.eliminarCotizacion(cot.cot_id);
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarCotizacion(cot_id: string) {
    const loading = await this.loadingController.create({ message: 'Eliminando...' });
    await loading.present();

    const { error } = await this.supabaseService.client
      .from('cotizacion')
      .delete()
      .eq('cot_id', cot_id);

    await loading.dismiss();

    if (error) {
      console.error('Error al eliminar:', error.message);
      this.mostrarToast('No se pudo eliminar la cotización', 'danger');
    } else {
      this.mostrarToast('Cotización eliminada correctamente');
      this.cargarCotizacionesGuardadas();
    }
  }

  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
