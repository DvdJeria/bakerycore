# CU-06: Borrado Lógico (Soft Delete) de Insumos

## 1. Descripción General
* **Actor Principal:** Operador.
* **Precondición:** El insumo existe y se encuentra activo.
* **Descripción Breve:** Permite dar de baja un ingrediente ocultándolo de la operación diaria sin comprometer la integridad histórica de cotizaciones pasadas.

## 2. Flujo Principal (Camino Feliz)
1. El usuario selecciona un insumo de la lista y presiona "Eliminar".
2. El sistema despliega un aviso de confirmación: *"¿Está seguro de dar de baja este insumo? Las cotizaciones históricas se mantendrán intactas."*
3. El usuario confirma presionando "Sí, eliminar".
4. La aplicación envía una petición `DELETE /api/insumos/{id}` al servidor.
5. El backend actualiza el registro en PostgreSQL modificando la bandera a `is_deleted = true`.
6. El backend retorna `200 OK` y la aplicación remueve el elemento de la vista activa.