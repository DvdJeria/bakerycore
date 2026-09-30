# CU-04: Listado y Búsqueda en Tiempo Real de Insumos

## 1. Descripción General
* **Actor Principal:** Operador.
* **Precondición:** El usuario ha iniciado sesión.
* **Descripción Breve:** Provee una vista tabular optimizada para dispositivos táctiles con todos los insumos activos y una barra de búsqueda en tiempo real.

## 2. Flujo Principal (Camino Feliz)
1. El usuario accede al módulo de Insumos.
2. La aplicación envía una petición `GET /api/insumos` al backend.
3. El backend consulta en PostgreSQL los registros donde `is_deleted = false` y retorna la lista en formato JSON.
4. La interfaz renderiza una tabla táctil con el nombre, costo actual y unidad de medida.
5. El usuario escribe un término en la barra de búsqueda superior.
6. La interfaz filtra dinámicamente los elementos en pantalla que coincidan con el texto ingresado.