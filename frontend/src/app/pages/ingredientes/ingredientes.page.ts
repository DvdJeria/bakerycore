import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonSearchbar, IonButton,
  IonCard, IonItem, IonIcon, IonModal, IonInput, IonSelect, IonSelectOption, ToastController, IonGrid,
  IonRow, IonCol, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonFab, IonFabButton
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-ingredientes',
  templateUrl: './ingredientes.page.html',
  styleUrls: ['./ingredientes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonSearchbar, IonButton, IonCard, IonItem, IonIcon, IonModal, IonInput, IonSelect, IonSelectOption,
    IonGrid, IonRow, IonCol, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonFab, IonFabButton
  ]
})
export class IngredientesPage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);
  private toastController = inject(ToastController);

  ingredientes: any[] = [];
  ingredientesFiltrados: any[] = [];
  unidadesMedida: any[] = [];
  textoBuscar: string = '';

  // Control del Modal y Formulario
  isModalOpen: boolean = false;
  isEditMode: boolean = false;

  // Modelo del formulario
  currentIngrediente: {
    ing_id?: string;
    ing_nombre: string;
    ing_precio: number;
    ing_cantidad_base: number;
    unmed_id: string;
  } = {
    ing_nombre: '',
    ing_precio: 0,
    ing_cantidad_base: 1,
    unmed_id: ''
  };

  constructor() {
    addIcons({
      'add': add,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'close-outline': closeOutline
    });
  }

  async ngOnInit() {
    await this.cargarUnidadesMedida();
    await this.cargarIngredientes();
  }

  async ionViewWillEnter() {
    await this.cargarIngredientes();
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  async cargarUnidadesMedida() {
    const { data, error } = await this.supabaseService.client
      .from('unidad_medida')
      .select('*')
      .order('unmed_nombre', { ascending: true });

    if (error) {
      console.log('Unidades de medida cargadas:', data);
      console.error('Error al cargar unidades de medida:', error.message);
    } else {
      this.unidadesMedida = data || [];
    }
  }

  async cargarIngredientes() {
    const { data, error } = await this.supabaseService.client
      .from('ingredientes')
      .select(`
        ing_id,
        ing_nombre,
        ing_precio,
        ing_cantidad_base,
        unmed_id,
        is_deleted,
        unidad_medida!ingredientes_unmed_id_fkey (
          unmed_nombre
        )
      `)
      .eq('is_deleted', false)
      .order('ing_nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar ingredientes:', error.message);
    } else {
      console.log('Estructura recibida:', data);
      this.ingredientes = data || [];
      this.ingredientesFiltrados = [...this.ingredientes];
      this.cdr.detectChanges();
    }
  }

  filtrarIngredientes() {
    const texto = this.textoBuscar.toLowerCase().trim();
    if (!texto) {
      this.ingredientesFiltrados = [...this.ingredientes];
      return;
    }

    this.ingredientesFiltrados = this.ingredientes.filter(item =>
      item.ing_nombre.toLowerCase().includes(texto)
    );
  }

  // Abrir modal para CREAR
  abrirModalCrear() {
    this.isEditMode = false;
    this.currentIngrediente = {
      ing_nombre: '',
      ing_precio: 0,
      ing_cantidad_base: 1,
      unmed_id: this.unidadesMedida.length > 0 ? this.unidadesMedida[0].unmed_id : ''
    };
    this.isModalOpen = true;
  }

  // Abrir modal para EDITAR
  abrirModalEditar(item: any) {
    this.isEditMode = true;
    this.currentIngrediente = {
      ing_id: item.ing_id,
      ing_nombre: item.ing_nombre,
      ing_precio: item.ing_precio,
      ing_cantidad_base: item.ing_cantidad_base,
      unmed_id: item.unmed_id
    };
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
  }

  // Guardar (Crear o Actualizar)
  async guardarIngrediente() {
    if (!this.currentIngrediente.ing_nombre.trim()) {
      await this.mostrarToast('El nombre del ingrediente es obligatorio.', 'danger');
      return;
    }

    if (this.isEditMode) {
      // Actualizar
      const { error } = await this.supabaseService.client
        .from('ingredientes')
        .update({
          ing_nombre: this.currentIngrediente.ing_nombre,
          ing_precio: this.currentIngrediente.ing_precio,
          ing_cantidad_base: this.currentIngrediente.ing_cantidad_base,
          unmed_id: this.currentIngrediente.unmed_id
        })
        .eq('ing_id', this.currentIngrediente.ing_id);

      if (error) {
        console.error('Error al actualizar ingrediente:', error.message);
        await this.mostrarToast('Error al actualizar el ingrediente.', 'danger');
      } else {
        // 1. Cerramos el modal primero para volver a la página principal
        this.cerrarModal();
        await this.cargarIngredientes();
        await this.mostrarToast('Ingrediente actualizado con éxito.');

      }
    } else {
      // Crear
      const { error } = await this.supabaseService.client
        .from('ingredientes')
        .insert([{
          ing_nombre: this.currentIngrediente.ing_nombre,
          ing_precio: this.currentIngrediente.ing_precio,
          ing_cantidad_base: this.currentIngrediente.ing_cantidad_base,
          unmed_id: this.currentIngrediente.unmed_id
        }]);

      if (error) {
        console.error('Error al crear ingrediente:', error.message);
        await this.mostrarToast('Error al crear el ingrediente.', 'danger');
      } else {
        this.cerrarModal();
        await this.cargarIngredientes();
        await this.mostrarToast('Ingrediente creado con éxito.');

      }
    }
  }


  async eliminarIngrediente(id: string) {
    const client = this.supabaseService.client;

    // 1. Comprobar la sesión actual
    const {
      data: { session },
      error: sessionError
    } = await client.auth.getSession();

    // 2. Ejecutar el soft delete
    const { data, error } = await this.supabaseService.client
      .from('ingredientes')
      .update({ is_deleted: true })
      .eq('ing_id', id)
      .select('ing_id, is_deleted');

    if (error) {
      await this.mostrarToast(
        'No se pudo eliminar el ingrediente.',
        'danger'
      );
      return;
    }

    // 4. Recargar el listado
    await this.cargarIngredientes();

    await this.mostrarToast(
      'Ingrediente eliminado correctamente.'
    );
  }


  // Método que se ejecuta al cambiar la unidad de medida en el select
  onUnidadCambiada() {
    const unidadSeleccionada = this.unidadesMedida.find(
      u => u.unmed_id === this.currentIngrediente.unmed_id
    );

    // Si el nombre de la unidad es "Unidad" (o similar), bloqueamos la cantidad base en 1
    if (unidadSeleccionada && unidadSeleccionada.unmed_nombre.toLowerCase().includes('unidad')) {
      this.currentIngrediente.ing_cantidad_base = 1;
    }
  }

  // Getter para saber si la unidad actual es de tipo "Unidad"
  get esUnidadSeleccionada(): boolean {
    const unidadSeleccionada = this.unidadesMedida.find(
      u => u.unmed_id === this.currentIngrediente.unmed_id
    );
    return unidadSeleccionada ? unidadSeleccionada.unmed_nombre.toLowerCase().includes('unidad') : false;
  }
}
