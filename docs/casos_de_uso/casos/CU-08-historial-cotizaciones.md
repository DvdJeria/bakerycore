# CU-08: Historial y Gestión de Cotizaciones

## 1. Descripción General
* **Actor Principal:** Operador.
* **Precondición:** Se han generado cotizaciones previas en el sistema.
* **Descripción Breve:** Permite guardar cotizaciones asociándoles un nombre identificatorio, además de consultar, buscar y reutilizar registros históricos.

## 3. Flujo Principal (Camino Feliz)
1. Una vez calculado el costo de una preparación (CU-07), el usuario ingresa un nombre identificatorio (ej: *"Torta Selva Negra 20 personas"*).
2. Presiona "Guardar Cotización".
3. La aplicación envía la estructura relacional al backend (`POST /api/cotizaciones`), el cual persiste la cabecera y el detalle de insumos mediante una transacción en PostgreSQL.
4. El usuario puede acceder posteriormente al historial, buscar por nombre o fecha, y visualizar los costos congelados al momento de su creación.