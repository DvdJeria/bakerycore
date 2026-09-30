# CU-05: Actualización de Datos y Costos de Insumos

## 1. Descripción General
* **Actor Principal:** Operador.
* **Precondición:** El insumo a modificar existe y está activo.
* **Descripción Breve:** Permite editar los datos principales o actualizar el costo de adquisición de un ingrediente existente ante fluctuaciones de mercado.

## 2. Flujo Principal (Camino Feliz)
1. El usuario selecciona un insumo de la lista y presiona el botón "Editar".
2. Modifica los campos requeridos (por ejemplo, el costo de adquisición debido a inflación).
3. Presiona "Guardar Cambios".
4. La aplicación envía una petición `PUT /api/insumos/{id}` al backend con los datos actualizados.
5. El backend valida el ID, ejecuta la actualización en la base de datos y retorna `200 OK`.
6. La interfaz refleja el cambio de forma inmediata en los listados generales.