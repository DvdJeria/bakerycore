# CU-03: Registro de Insumos

## 1. Descripción General
* **Actor Principal:** Operador.
* **Precondición:** El usuario ha iniciado sesión y cuenta con un token JWT válido.
* **Descripción Breve:** Permite dar de alta un nuevo ingrediente en el sistema indicando su nombre, unidad de medida y costo de adquisición.

## 2. Flujo Principal (Camino Feliz)
1. El usuario navega al módulo de Insumos y selecciona "Nuevo Insumo".
2. Ingresa los datos solicitados: Nombre, Costo de Adquisición, Cantidad Base y Unidad de Medida (ej: Gramos, Kilos, Unidades, Litros).
3. Presiona el botón "Guardar".
4. La aplicación valida localmente que los campos no estén vacíos y que los valores numéricos sean mayores a cero.
5. La app envía una petición `POST /api/insumos` al servidor Spring Boot adjuntando el token JWT en la cabecera.
6. El backend procesa la solicitud, inserta el registro en la base de datos PostgreSQL estableciendo `is_deleted = false` y responde con `201 Created`.
7. La interfaz actualiza la lista localmente y muestra una notificación de éxito.

## 3. Flujos Alternativos y Excepciones
* **[A1 - Datos Inválidos]:**
  * *Condición:* Campos obligatorios vacíos o valores negativos en costos/cantidades.
  * *Acción:* La UI bloquea el envío y resalta los campos erróneos.
* **[A2 - Conflicto por Nombre Duplicado]:**
  * *Condición:* El nombre del ingrediente ya existe activo en la base de datos.
  * *Acción:* El backend retorna error `409 Conflict`. El sistema avisa al usuario que ya existe un insumo con ese nombre.