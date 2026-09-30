# Documentacion Tecnica y Arquitectura del Modelo de Base de Datos

## 1. Proposito y Alcance
Este documento describe la arquitectura relacional de la base de datos para el sistema BackeryCore (pyme Delicias Duche). El esquema esta diseñado e implementado sobre PostgreSQL y Supabase utilizando identificadores unicos universales (UUID) seguros, restricciones de integridad referencial estrictas y tipos de datos normalizados para garantizar la trazabilidad de insumos, costos historicos, cotizaciones y pedidos.

---

## 2. Descripcion de Modulos y Tablas

### Modulo de Insumos y Unidades de Medida
- **unidad_medida:** Almacena las unidades de medida estandarizadas (por ejemplo, kilogramos, gramos, litros, unidades) utilizadas para clasificar los insumos de la pasteleria.
- **ingredientes:** Contiene el catalogo de materias primas. Incluye los campos de control de costos, cantidad base y un indicador de borrado logico (`is_deleted`) que permite dar de baja insumos sin alterar la integridad historica de recetas o cotizaciones pasadas, respaldado por un indice unico condicional para permitir reutilizar nombres de insumos dados de baja.

### Modulo de Clientes y Estados
- **cliente:** Registra la informacion basica de los clientes frecuentes (nombre, apellido, telefono y contacto de red social) para coordinar entregas de forma eficiente.
- **estado_pedido:** Define los estados operativos posibles por los que atraviesa un pedido (por ejemplo, Pendiente, En Proceso, Entregado, Cancelado).

### Modulo de Cotizaciones y Costos
- **cotizacion:** Almacena los presupuestos generados indicando la fecha con zona horaria, el valor total calculado y un nombre o descripcion identificatoria de la preparacion.
- **cotizacion_detalle:** Tabla intermedia que resuelve la relacion de muchos a muchos entre cotizaciones e ingredientes. Su caracteristica principal es almacenar el `precio_unitario_fijo` y la `cantidad_usada`, lo que congela el costo historico del insumo al momento exacto de crear la cotizacion.

### Modulo de Pedidos
- **pedido:** Vincula un cliente, opcionalmente una cotizacion previa y un estado actual, registrando la fecha de entrega acordada con zona horaria y el precio final del pedido.

---

## 3. Optimizaciones, Rendimiento y Consideraciones Tecnicas

- **Generacion Segura de Identificadores (UUID):** Se utiliza la extension nativa `pgcrypto` para la generacion robusta de UUIDs (`gen_random_uuid()`) como llaves primarias en todas las entidades.
- **Estandarizacion de Tipos de Datos y Validaciones (`CHECK`):** Se definieron longitudes fijas para los campos de texto (`VARCHAR`), precisiones decimales exactas (`NUMERIC(10, 2)`) para asegurar que el mapeo con Spring Boot (`BigDecimal`) y los calculos monetarios no presenten errores, junto a restricciones directas para evitar precios negativos o cantidades invalidas.
- **Integridad Referencial y Cascada:** Se implementaron reglas de borrado y restriccion por llave foranea, incluyendo `ON DELETE CASCADE` en el detalle de las cotizaciones para limpiar registros temporales de forma automatica y evitar datos huerfanos.
- **Trazabilidad Historica:** El uso de precios fijos en el detalle de cotizaciones garantiza que aumentos futuros en el costo de las materias primas no alteren el valor financiero de los presupuestos historicos ya emitidos a los clientes.
- **Zonas Horarias Consistentes:** Los campos temporales se manejan mediante `TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`) para alinear la sincronizacion horaria entre el cliente movil, el backend y la nube.
- **Optimizacion de Consultas (`INDEXING`):** Todas las llaves foraneas cuentan con indices explicitos asociados para acelerar las operaciones de cruce (`JOINs`) ejecutadas por los repositorios.

---

## 4. Instrucciones de Despliegue en Supabase

1. Ingresa al panel de administracion de tu proyecto en Supabase.
2. Dirigete a la seccion de **SQL Editor**.
3. Copia y ejecuta el script DDL completo provisto en `database/schema.sql`.
4. Valida en el **Table Editor** que las tablas, restricciones y indices se encuentren creados de manera correcta.