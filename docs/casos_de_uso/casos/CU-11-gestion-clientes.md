# CU-11: Gestión de Clientes Frecuentes

## 1. Descripción General
* **Actor Principal:** Operador.
* **Precondición:** El usuario cuenta con sesión activa.
* **Descripción Breve:** Permite registrar, actualizar y almacenar los datos de contacto y entrega de los clientes frecuentes del negocio.

## 2. Flujo Principal (Camino Feliz)
1. El usuario ingresa al módulo de Clientes y selecciona "Nuevo Cliente".
2. Completa los campos básicos: Nombre, Teléfono de contacto, Correo y Dirección de entrega.
3. Presiona "Guardar".
4. El servidor valida la información y persiste el registro en la base de datos PostgreSQL.
5. La aplicación actualiza el directorio de clientes disponible para la asignación de futuros pedidos.