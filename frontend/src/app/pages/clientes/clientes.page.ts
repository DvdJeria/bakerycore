import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonSpinner, IonList, IonItemSliding, IonItem,
  IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton,
  IonModal, IonButton, IonInput,
  AlertController, LoadingController, ModalController, ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { personOutline, createOutline, trashOutline, add, menuOutline, callOutline, logoInstagram } from 'ionicons/icons';

import { SupabaseService } from '../../services/supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonSpinner, IonList, IonItemSliding, IonItem,
    IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton,
    IonModal, IonButton, IonInput
  ]
})
export class ClientesPage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private modalController = inject(ModalController);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  clientes: any[] = [];
  isLoading = false;

  // Estado del modal inline
  isModalOpen = false;
  clienteSeleccionado: any = null;
  clientForm: FormGroup;

  constructor() {
    addIcons({
      'person-outline': personOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'add': add,
      'menu-outline': menuOutline,
      'call-outline': callOutline,
      'logo-instagram': logoInstagram
    });

    this.clientForm = this.fb.group({
      cli_nombre: ['', [Validators.required]],
      cli_apellido: ['', [Validators.required]],
      cli_telefono: [''],
      cli_instagram: ['']
    });
  }

  async ngOnInit() {
    await this.cargarClientes();
  }

  ionViewWillEnter() {
    this.cargarClientes();
  }

  async cargarClientes() {
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const { data, error } = await this.supabaseService.client
        .from('cliente')
        .select('*')
        .eq('is_deleted', false)
        .order('cli_nombre', { ascending: true });

      if (error) {
        console.error('Error al cargar clientes:', error.message);
        this.clientes = [];
      } else {
        this.clientes = data || [];
      }
    } catch (err: any) {
      console.error('Excepción inesperada al cargar clientes:', err);
      this.clientes = [];
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  abrirModalCliente(cliente: any = null) {
    this.clienteSeleccionado = cliente;
    if (cliente) {
      this.clientForm.patchValue({
        cli_nombre: cliente.cli_nombre,
        cli_apellido: cliente.cli_apellido,
        cli_telefono: cliente.cli_telefono,
        cli_instagram: cliente.cli_instagram
      });
    } else {
      this.clientForm.reset();
    }
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.clienteSeleccionado = null;
    this.clientForm.reset();
    this.cdr.detectChanges();
  }

  async guardarCliente() {
    if (this.clientForm.invalid) {
      this.mostrarToast('Por favor completa los campos obligatorios (Nombre y Apellido)', 'danger');
      return;
    }

    const formData = this.clientForm.value;
    const loading = await this.loadingController.create({ message: 'Guardando cliente...' });
    await loading.present();

    try {
      if (this.clienteSeleccionado) {
        // Actualizar cliente existente
        const { error } = await this.supabaseService.client
          .from('cliente')
          .update({
            cli_nombre: formData.cli_nombre,
            cli_apellido: formData.cli_apellido,
            cli_telefono: formData.cli_telefono,
            cli_instagram: formData.cli_instagram
          })
          .eq('cli_id', this.clienteSeleccionado.cli_id);

        if (error) throw error;
        this.mostrarToast('Cliente actualizado correctamente');
      } else {
        // Crear nuevo cliente
        const { error } = await this.supabaseService.client
          .from('cliente')
          .insert([{
            cli_nombre: formData.cli_nombre,
            cli_apellido: formData.cli_apellido,
            cli_telefono: formData.cli_telefono,
            cli_instagram: formData.cli_instagram,
            is_deleted: false
          }]);

        if (error) throw error;
        this.mostrarToast('Cliente creado exitosamente');
      }

      await loading.dismiss();
      this.cerrarModal();
      this.cargarClientes();
    } catch (err: any) {
      await loading.dismiss();
      console.error('Error al guardar cliente:', err.message);
      this.mostrarToast('Ocurrió un error al guardar el cliente', 'danger');
    }
  }

  async confirmarEliminacion(cliente: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al cliente "${cliente.cli_nombre} ${cliente.cli_apellido}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.softDeleteCliente(cliente.cli_id);
          }
        }
      ]
    });
    await alert.present();
  }

  async softDeleteCliente(cli_id: string) {
    const loading = await this.loadingController.create({ message: 'Eliminando cliente...' });
    await loading.present();

    const { error } = await this.supabaseService.client
      .from('cliente')
      .update({ is_deleted: true })
      .eq('cli_id', cli_id);

    await loading.dismiss();

    if (error) {
      console.error('Error al hacer soft delete:', error.message);
      this.mostrarToast('No se pudo eliminar el cliente', 'danger');
    } else {
      this.mostrarToast('Cliente eliminado correctamente');
      this.cargarClientes();
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
