# CU-09: Creación y Digitalización de Recetas con Archivos Fotográficos

## 1. Descripción General
* **Actor Principal:** Operador.
* **Precondición:** El usuario ha iniciado sesión.
* **Descripción Breve:** Permite digitalizar el recetario físico asociando ingredientes, instrucciones paso a paso y registros fotográficos del producto finalizado.

## 2. Flujo Principal (Camino Feliz)
1. El usuario accede al módulo de Recetario y selecciona "Nueva Receta".
2. Ingresa el título de la receta, descripción y los pasos de preparación en orden secuencial.
3. Utiliza la interfaz de la cámara del dispositivo móvil (o galería) para capturar y adjuntar una fotografía del producto finalizado.
4. Vincula los insumos necesarios para la preparación.
5. Presiona "Guardar Receta".
6. El backend procesa el almacenamiento de datos relacionales y la gestión del archivo multimedia asociado, retornando respuesta exitosa (`201 Created`).