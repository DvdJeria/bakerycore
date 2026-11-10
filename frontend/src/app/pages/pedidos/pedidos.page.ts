import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonDatetime, IonCard, IonCardContent, IonList,
  IonItem, IonItemSliding, IonItemOptions, IonItemOption,
  IonIcon, IonFab, IonFabButton, IonModal, IonButton, ToastController, ModalController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, calendarOutline, createOutline, trashOutline } from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase';
import { PedidoModalComponent } from './pedido-modal/pedido-modal.component';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonDatetime, IonCard, IonCardContent, IonList,
    IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon,
    IonFab, IonFabButton, IonModal, IonButton
  ]
})
export class PedidosPage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private toastController = inject(ToastController);
  private modalController = inject(ModalController);
  private cdr = inject(ChangeDetectorRef);

  fechaSeleccionada: string = new Date().toISOString();
  todosLosPedidos: any[] = [];
  pedidosDelDia: any[] = [];
  isModalDiaOpen: boolean = false;
  diasResaltados: any[] = [];
  nombreUsuario: string = '';

  constructor() {
    addIcons({
      'add': add,
      'calendar-outline': calendarOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline
    });
  }

  async ngOnInit() {
    await this.cargarPedidos();
    await this.cargarUsuario();
  }

  ionViewWillEnter() {
    this.cargarPedidos();
    this.cargarUsuario();
  }

  async cargarUsuario() {
    const { data: { user } } = await this.supabaseService.client.auth.getUser();
    if (user) {
      // Si tiene metadata con nombre, lo usa; si no, toma la parte inicial de su correo
      this.nombreUsuario = user.user_metadata?.['nombre'] || user.email?.split('@')[0] || 'Usuario';
    }

    this.cdr.detectChanges();
  }

  async cargarPedidos() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('pedido')
        .select(`
        *,
        cliente:cli_id (cli_id, cli_nombre, cli_apellido, cli_telefono),
        estado_pedido:est_id (est_id, est_nombre)
      `)
        .eq('is_deleted', false)
        .order('ped_fecha_entrega', { ascending: true });

      if (error) throw error;
      this.todosLosPedidos = data || [];
      this.filtrarPedidosPorFecha(this.fechaSeleccionada);

      // Mapear las fechas para que el calendario las resalte
      this.diasResaltados = this.todosLosPedidos.map(p => {
        const fechaYMD = p.ped_fecha_entrega.split('T')[0];
        return {
          date: fechaYMD,
          textColor: '#ffffff',
          backgroundColor: 'var(--ion-color-primary)'
        };
      });

      this.cdr.detectChanges();
    } catch (err: any) {
      console.error('Error al cargar pedidos:', err.message);
      this.mostrarToast('Error al sincronizar los pedidos', 'danger');
    }
  }

  onDateSelected(event: any) {
    const fecha = event.detail.value;
    if (!fecha) return;

    this.fechaSeleccionada = fecha;
    this.filtrarPedidosPorFecha(fecha);

    //Forzamos la apertura limpia del modal al primer toque
    this.isModalDiaOpen = false; //Breve reseteo de estado por si acaso
    setTimeout(() => {
      this.isModalDiaOpen = true;
      this.cdr.detectChanges();
    }, 50);
  }

  filtrarPedidosPorFecha(fechaIso: string) {
    const fechaStr = fechaIso.split('T')[0];

    this.pedidosDelDia = this.todosLosPedidos.filter(p => {
      if (!p.ped_fecha_entrega) return false;
      return p.ped_fecha_entrega.startsWith(fechaStr);
    });
    this.cdr.detectChanges();
  }

  getClaseEstado(nombreEstado: string = ''): string {
    switch (nombreEstado.toLowerCase()) {
      case 'pendiente': return 'badge-pendiente';
      case 'en preparación': return 'badge-preparacion';
      case 'entregado': return 'badge-entregado';
      case 'cancelado': return 'badge-cancelado';
      default: return 'badge-pendiente';
    }
  }

  // Abrir modal para Crear (sin pedido) o Editar (con objeto pedido)
  async abrirModalFormulario(pedido: any = null) {
    if (this.isModalDiaOpen) {
      this.isModalDiaOpen = false;
    }

    /* Si abrimos un pedido nuevo desde el botón general (+),
     * validamos si la fecha seleccionada actual es anterior a hoy.
     * Si es anterior, mandamos la fecha de hoy (o vacía) para que el modal no se abra bloqueado.
     */
    let fechaParaModal = this.fechaSeleccionada;

    if (!pedido && this.esFechaAnteriorHoy()) {
      fechaParaModal = new Date().toISOString(); // Setea hoy por defecto si el calendario estaba en el pasado
    }

    const modal = await this.modalController.create({
      component: PedidoModalComponent,
      componentProps: {
        pedido: pedido ? { ...pedido } : null,
        fechaSugerida: fechaParaModal
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.recargar) {
      await this.cargarPedidos();
    }
  }

  editarPedido(pedido: any) {
    this.abrirModalFormulario(pedido);
  }

  async eliminarPedido(pedido: any) {
    try {
      const { error } = await this.supabaseService.client
        .from('pedido')
        .update({ is_deleted: true })
        .eq('ped_id', pedido.ped_id);

      if (error) throw error;

      this.mostrarToast('Pedido eliminado correctamente', 'success');
      await this.cargarPedidos();
    } catch (err: any) {
      console.error('Error al eliminar:', err.message);
      this.mostrarToast('No se pudo eliminar el pedido', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  esFechaAnteriorHoy(): boolean {
    if (!this.fechaSeleccionada) return false;

    const fechaSelStr = this.fechaSeleccionada.split('T')[0];

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    return fechaSelStr < todayString;
  }
}
