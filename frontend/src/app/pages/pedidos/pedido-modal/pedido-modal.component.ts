import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonItem, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonDatetimeButton, IonModal, IonDatetime, ModalController, ToastController
} from '@ionic/angular';
import { SupabaseService } from '../../../services/supabase';

@Component({
  selector: 'app-pedido-modal',
  templateUrl: './pedido-modal.component.html',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonItem, IonInput, IonSelect, IonSelectOption,
    IonTextarea, IonDatetimeButton, IonModal, IonDatetime
  ]
})
export class PedidoModalComponent implements OnInit {
  @Input() pedido: any = null;
  @Input() fechaSugerida: string = new Date().toISOString();

  private supabaseService = inject(SupabaseService);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  esEdicion: boolean = false;
  clientes: any[] = [];
  estados: any[] = [];
  minFechaEntrega: string = '';

  pedidoForm = {
    cli_id: '',
    est_id: '',
    ped_nombre: '',
    ped_observaciones: '',
    ped_fecha_entrega: '',
    ped_precio: 0
  };

  async ngOnInit() {
    // 1. REGLA DE NEGOCIO: Calcular fecha mínima permitida (ahora + 24 horas)
    const fechaMinima = new Date();
    fechaMinima.setHours(fechaMinima.getHours() + 24);
    this.minFechaEntrega = this.toLocalISOString(fechaMinima);

    if (this.pedido) {
      this.esEdicion = true;

      // FIX ZONA HORARIA: Extraer fecha y hora local exacta sin desfases UTC
      const fechaOriginal = new Date(this.pedido.ped_fecha_entrega);
      const fechaLocalStr = this.toLocalISOString(fechaOriginal);

      this.pedidoForm = {
        cli_id: this.pedido.cli_id,
        est_id: this.pedido.est_id,
        ped_nombre: this.pedido.ped_nombre,
        ped_observaciones: this.pedido.ped_observaciones || '',
        ped_fecha_entrega: fechaLocalStr, // <--- Aquí estaba el detalle: usaba la original con desfase
        ped_precio: this.pedido.ped_precio
      };
    } else {
      // Si es nuevo, usar la fecha sugerida o la fecha mínima calculada (lo que sea mayor)
      const sugerida = new Date(this.fechaSugerida);
      const fechaInicialDate = (sugerida >= fechaMinima) ? sugerida : fechaMinima;

      this.pedidoForm.ped_fecha_entrega = this.toLocalISOString(fechaInicialDate);
      this.pedidoForm.ped_precio = 0; // Asegurar precio en 0 por defecto
    }

    // 2. Cargar primero los catálogos para tener los estados disponibles
    await this.cargarCatalogos();

    // 3. Forzar al DOM/Ionic a pintar los valores por defecto de inmediato
    this.cdr.detectChanges();
  }

  async cargarCatalogos() {
    try {
      const [resClientes, resEstados] = await Promise.all([
        this.supabaseService.client.from('cliente').select('*').order('cli_nombre'),
        this.supabaseService.client.from('estado_pedido').select('*')
      ]);

      if (resClientes.error) throw resClientes.error;
      if (resEstados.error) throw resEstados.error;

      this.clientes = resClientes.data || [];
      this.estados = resEstados.data || [];

      // SELECCIÓN AUTOMÁTICA DE "PENDIENTE"
      if (!this.esEdicion && this.estados.length > 0) {
        const pendiente = this.estados.find(e => e.est_nombre.toLowerCase() === 'pendiente');
        if (pendiente) {
          this.pedidoForm.est_id = pendiente.est_id;
        } else {
          this.pedidoForm.est_id = this.estados[0].est_id;
        }
      }
    } catch (err: any) {
      console.error('Error al cargar catalogos:', err.message);
    }
  }

  async guardarPedido() {
    try {
      // 1. Validar campos obligatorios
      if (!this.pedidoForm.cli_id || !this.pedidoForm.ped_nombre || !this.pedidoForm.ped_fecha_entrega) {
        await this.mostrarToast('Por favor completa los campos obligatorios', 'danger');
        return;
      }

      // 2. REGLA DE NEGOCIO: El precio no puede ser menor a 0
      if (this.pedidoForm.ped_precio < 0) {
        await this.mostrarToast('El precio del pedido no puede ser menor a 0', 'danger');
        return;
      }

      // 3. REGLA DE NEGOCIO: No se pueden registrar fechas con menos de 24 horas de anticipación
      const fechaSeleccionada = new Date(this.pedidoForm.ped_fecha_entrega).getTime();
      const fechaMinimaPermitida = new Date().getTime() + (24 * 60 * 60 * 1000); // Ahora + 24 horas en milisegundos

      if (fechaSeleccionada < fechaMinimaPermitida) {
        await this.mostrarToast('Los pedidos deben agendarse con al menos 24 horas de anticipacion', 'danger');
        return;
      }

      // 4. NUEVA REGLA DE NEGOCIO: Validar que no exista otro pedido activo en la misma hora
      const fechaIngresada = new Date(this.pedidoForm.ped_fecha_entrega);
      const anio = fechaIngresada.getFullYear();
      const mes = fechaIngresada.getMonth();
      const dia = fechaIngresada.getDate();
      const hora = fechaIngresada.getHours();

      // Rango de la misma hora (ej. de 15:00:00 a 15:59:59)
      const inicioHora = new Date(anio, mes, dia, hora, 0, 0).toISOString();
      const finHora = new Date(anio, mes, dia, hora, 59, 59).toISOString();

      let query = this.supabaseService.client
        .from('pedido')
        .select('ped_id')
        .eq('is_deleted', false) // Consideramos solo pedidos activos según tu DDL
        .gte('ped_fecha_entrega', inicioHora)
        .lte('ped_fecha_entrega', finHora);

      // Si estamos editando, filtramos para que no choque consigo mismo
      if (this.esEdicion && this.pedido?.ped_id) {
        query = query.neq('ped_id', this.pedido.ped_id);
      }

      const { data: pedidosEnHora, error: errorHora } = await query;
      if (errorHora) throw errorHora;

      if (pedidosEnHora && pedidosEnHora.length > 0) {
        await this.mostrarToast(`Ya existe un pedido agendado a las ${hora}:00 hrs. Elige otra hora.`, 'danger');
        return;
      }

      // 5. Guardar en Supabase (Insert o Update) asegurando el formato local limpio
      const datosAGuardar = {
        ...this.pedidoForm,
        ped_fecha_entrega: this.toLocalISOString(new Date(this.pedidoForm.ped_fecha_entrega))
      };

      if (this.esEdicion) {
        const { error } = await this.supabaseService.client
          .from('pedido')
          .update(datosAGuardar)
          .eq('ped_id', this.pedido.ped_id);

        if (error) throw error;
      } else {
        const { error } = await this.supabaseService.client
          .from('pedido')
          .insert([datosAGuardar]);

        if (error) throw error;
      }

      await this.mostrarToast(this.esEdicion ? 'Pedido actualizado exitosamente' : 'Pedido creado exitosamente', 'success');
      this.modalController.dismiss({ recargar: true });
    } catch (err: any) {
      console.error('Error al guardar pedido:', err.message);
      await this.mostrarToast('Error al guardar el pedido en la base de datos', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  cerrarModal() {
    this.modalController.dismiss({ recargar: false });
  }

  // Función auxiliar para mantener la hora local exacta sin conversiones UTC automáticas
  toLocalISOString(dateInput: string | Date): string {
    if(!dateInput) return '';
    const date = new Date(dateInput);
    if(isNaN(date.getTime())) return '';

    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const pad = (n: number)=>String(Math.floor(Math.abs(n))).padStart(2, '0');

    const hoursOffset = pad(offsetMinutes / 60);
    const minutesOffset = pad(offsetMinutes % 60);

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${hoursOffset}:${minutesOffset}`;
  }
}
