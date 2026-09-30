# Documentacion Tecnica de Carga Inicial de Catalogos e Insumos

## 1. Proposito
Este documento describe el mecanismo utilizado para la insercion automatizada y segura de los datos maestros (unidades de medida y catalogo inicial de materias primas) en la base de datos de BackeryCore.

---

## 2. Estrategia de Carga (Uso de CTEs)
Para evitar depender de IDs estaticos (lo cual puede generar errores de integridad al mover la base de datos entre entornos de desarrollo, pruebas o produccion), el script de insercion implementa una **Expresion de Tabla Comun (CTE)** con la clausula `RETURNING`.

El flujo se compone de dos etapas ejecutadas en una sola transaccion atomica:
1. **Registro Dinamico de Unidades:** Se insertan las unicas unidades estandar permitidas por el sistema (`Unidad`, `Gramo`, `CC`) y PostgreSQL retorna inmediatamente las llaves primarias (`unmed_id`) autoincrementales generadas.
2. **Vinculacion y Mapeo de Insumos:** Mediante un operador `JOIN` contra la CTE temporal, se cruzan los nombres textuales de la unidad de medida definidos para cada insumo con los IDs reales obtenidos en el paso anterior, asegurando que ningun ingrediente quede con referencias huerfanas.

---

## 3. Consideraciones de Normalizacion y Datos
* **Estandar de Precios y Cantidades Base:** Los costos reflejados corresponden a la unidad de referencia indicada en `ing_cantidad_base` (por ejemplo, el valor por 1000 gramos o por 1 unidad exacta), permitiendo que el sistema calcule proporciones exactas en el modulo de recetas y cotizaciones.
* **Control de Duplicados:** Se diferencio el insumo de decoracion `'Perlas'` por unidad del formato mayorista `'Perlas (formato por kilo)'` para mantener la unicidad descriptiva dentro del inventario de la pasteleria.