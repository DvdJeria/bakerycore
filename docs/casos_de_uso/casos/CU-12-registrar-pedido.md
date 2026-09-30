# CU-12: Registro y Vinculación de Pedidos

## 1. Descripción General
* **Actor Principal:** Operador.
* **Precondición:** Existen clientes registrados y cotizaciones guardadas previamente.
* **Descripción Breve:** Permite asociar un cliente específico y una cotización a un pedido formal, fijando fecha, hora e indicaciones especiales de entrega.

## 2. Flujo Principal (Camino Feliz)
1. El usuario accede al módulo de Pedidos y selecciona "Registrar Nuevo Pedido".
2. Selecciona un cliente del directorio de clientes frecuentes.
3. Selecciona la cotización guardada que compone el producto encargado.
4. Ingresa la fecha de entrega, hora estimada y notas operativas especiales (ej: tipo de dedicatoria, requerimientos de empaque).
5. Presiona "Confirmar Pedido".
6. El backend procesa la transacción relacional en PostgreSQL vinculando cliente, cotización y metadatos del pedido.
7. La aplicación muestra el comprobante del pedido listo para su seguimiento operativo.