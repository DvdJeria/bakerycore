# BakeryCore

## Descripción del Proyecto

**BakeryCore** es una plataforma de gestión operativa y control de costos diseñada para negocios de repostería y panadería artesanal. El sistema centraliza la administración de materia prima, la estandarización de recetarios, el cálculo automatizado de costos de producción y la trazabilidad de pedidos de clientes.

Arquitectónicamente, el proyecto se compone de una aplicación cliente multiplataforma desarrollada con **Ionic/Angular** y un backend robusto basado en **Spring Boot**, conectado a una base de datos relacional **PostgreSQL**.

---

## Objetivos del MVP (Minimum Viable Product)

Para la primera versión funcional (MVP), el desarrollo se concentra exclusivamente en resolver los flujos críticos de la operación diaria:

1. **Autenticación y Seguridad:** 
   * Control de acceso mediante tokens JWT para proteger los endpoints del sistema.
2. **Gestión de Insumos (CRUD):** 
   * Registro, actualización de costos, búsqueda y borrado lógico de materias primas.
3. **Recetario Digital:** 
   * Almacenamiento estructurado de recetas, ingredientes asociados y pasos de preparación.
4. **Motor de Costos y Cotizaciones:** 
   * Cálculo automático del costo base de producción a partir de los insumos y las cantidades de la receta, generando un precio comercial sugerido.
5. **Gestión de Clientes y Pedidos:** 
   * Registro básico de clientes frecuentes y vinculación de pedidos con fechas de entrega y referencias de cotización.

---

## Alcance y Visión a Futuro

El propósito de esta primera etapa es establecer una base sólida, desacoplada y mantenible que elimine el uso de planillas desconectadas y registros físicos. 

* **Fase Actual (MVP):** Estabilidad del backend, integridad de datos relacionales en PostgreSQL y despliegue de las funciones core de costos y pedidos.
* **Evolución Futura:** Automatización del desstock de inventario en tiempo real por cada pedido completado, reportes avanzados de rendimiento financiero y optimización offline-first en el cliente móvil.