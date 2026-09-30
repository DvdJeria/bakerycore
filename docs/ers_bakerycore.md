# Especificación de Requisitos de Software (ERS)
## Sistema: BackeryCore (Delicias Duche)

---

### 1. Introducción

#### 1.1 Propósito
El presente documento tiene como objetivo establecer la Especificación de Requisitos de Software (ERS) para el desarrollo de la aplicación **BackeryCore**, un sistema digital diseñado a la medida para optimizar la gestión operativa, el control de materias primas, el cálculo automatizado de costos, el recetario digital y la administración de pedidos de la pyme **Delicias Duche**.

#### 1.2 Alcance del Sistema
BackeryCore es una solución informatica centrada en un modelo monousuario operativo (enfocado en la administración del negocio). Sus módulos principales comprenden:
* Autenticación segura mediante Supabase Auth y tokens JWT.
* Gestión completa (CRUD) de materias primas con soporte para borrado lógico (*soft delete*).
* Módulo de cotizaciones con cálculo automático de costos base y aplicación de reglas de negocio comerciales.
* Recetario digital multimedia con vinculación de instrucciones y fotografías de los productos terminados.
* Administración de clientes frecuentes y registro de pedidos asociados a cotizaciones y fechas de entrega.

#### 1.3 Personal involucrado y Contexto
El sistema busca reemplazar los registros físicos tradicionales (cuadernos y hojas de cálculo dispersas) por una herramienta móvil ágil, multiplataforma y conectada, reduciendo el margen de error en el cálculo de precios y mejorando la trazabilidad de los pedidos de pastelería.

---

### 2. Descripción General

#### 2.1 Perspectiva del Producto
BackeryCore es una aplicación multiplataforma moderna estructurada bajo una arquitectura de tres capas:
* **Frontend:** Aplicación móvil desarrollada en **Ionic, Angular y Capacitor** para dispositivos Android e iOS.
* **Backend:** Servidor central de lógica de negocio desarrollado en **Java con Spring Boot** que expone una API REST segura.
* **Servicios Externos / Persistencia:** Base de datos relacional en **PostgreSQL** alojada en la nube y sistema de autenticación gestionado por **Supabase**.

#### 2.2 Funciones del Producto
* Control centralizado de insumos y costos unitarios de materia prima.
* Generación dinámica de presupuestos y cotizaciones para clientes.
* Digitalización del recetario de la pastelería con soporte visual.
* Coordinación y seguimiento de pedidos y entregas.

#### 2.3 Características de los Usuarios
El sistema **BackeryCore** está diseñado para un perfil de usuario único y específico, priorizando la simplicidad operativa:
* **Perfil Operativo / Administrador del Negocio (Único Usuario):** Propietaria y operadora de la pyme **Delicias Duche**. Requiere una interfaz ágil, botones grandes y flujos directos para la elaboración de productos, gestión de recetas, costos y atención de pedidos, autenticándose mediante una credencial segura.

#### 2.4 Restricciones
* **Tecnológicas del Backend:** Obligatoriedad de uso de **Java con Spring Boot**.
* **Tecnológicas del Frontend:** Obligatoriedad de uso de **Ionic, Angular y Capacitor**.
* **Seguridad y Acceso:** Supresión de sistemas de contraseñas locales complejos; uso exclusivo de **Supabase Auth / JWT**.
* **Arquitectura:** Se excluye la complejidad de sincronización *offline-first* masiva en esta versión del MVP; el sistema opera bajo conectividad web estándar (cliente-servidor).

#### 2.5 Suposiciones y Dependencias
* Se asume conectividad a internet estable en el dispositivo móvil durante las horas de operación diaria.
* Dependencia directa de la disponibilidad del servicio externo de Supabase Auth y de la infraestructura de hosting del backend en Java.

---

### 3. Requisitos Específicos

#### 3.1 Interfaces Externas
* **3.1.1 Interfaces de Usuario (UI):** Pantallas optimizadas para dispositivos táctiles móviles (smartphones y tablets Android / iOS), priorizando la simplicidad y agilidad operativa.
* **3.1.2 Interfaces de Software:** 
  * Integración con **Supabase Auth** (Tokens JWT).
  * Comunicación API REST mediante peticiones HTTP/JSON entre el cliente Ionic y el servidor Java (Spring Boot).
* **3.1.3 Interfaces de Hardware:** Dispositivos móviles con pantalla táctil, conectividad de red y cámara fotográfica integrada para el registro de productos.
* **3.1.4 Interfaces de Comunicación:** Protocolos seguros de red (HTTPS / TLS).

#### 3.2 Funciones (Requisitos Funcionales)
* **Módulo de Autenticación y Seguridad:**
  * **RF-01 (Acceso de Usuario Único):** Permite iniciar sesión exclusivamente a un usuario autorizado mediante las credenciales gestionadas por Supabase Auth.
  * **RF-02 (Validación por Token):** Cada petición desde la app hacia el backend en Java incluirá un token JWT para validar la sesión y proteger las consultas.

* **Módulo de Gestión de Materia Prima (CRUD Completo):**
  * **RF-03 (Registro de Insumos):** Permite registrar nuevos ingredientes indicando nombre, unidad de medida y costo de adquisición.
  * **RF-04 (Listado y Búsqueda):** Provee una vista tabular con todos los insumos y una barra de búsqueda para filtrar por nombre en tiempo real.
  * **RF-05 (Actualización de Costos):** Permite editar los datos y costos de un insumo existente.
  * **RF-06 (Eliminación Lógica / Soft Delete):** Permite dar de baja un ingrediente mediante borrado lógico, ocultándolo de los listados activos sin perder la integridad histórica.

* **Módulo de Cotizaciones:**
  * **RF-07 (Cálculo Base de Costos):** Permite seleccionar materias primas y definir cantidades para calcular automáticamente el costo base de producción.
  * **RF-08 (Aplicación de Regla de Negocio Comercial):** Aplica una regla de tres sobre el costo base de los ingredientes y el total usado en la receta para sugerir el precio de venta final, preparando la estructura para sumar costos fijos constantes (gas, luz, agua).
  * **RF-09 (Historial de Cotizaciones):** Permite guardar cotizaciones asociándoles un nombre identificatorio, además de consultar y buscar registros posteriores.

* **Módulo de Recetario (Digitalización):**
  * **RF-10 (Creación de Recetas):** Permite crear registros de recetas asociando ingredientes, instrucciones paso a paso y la vinculación de archivos fotográficos del producto finalizado.
  * **RF-11 (Consulta de Recetas):** Ofrece una interfaz visual para buscar, visualizar y revisar el recetario digital en reemplazo del cuaderno físico.

* **Módulo de Clientes y Pedidos:**
  * **RF-12 (Gestión de Clientes Frecuentes):** Permite registrar y almacenar datos básicos de clientes para coordinar entregas.
  * **RF-13 (Registro de Pedidos):** Permite asociar un cliente registrado y una cotización guardada a un pedido, especificando fecha, hora e indicaciones de entrega.

#### 3.3 Requisitos de Rendimiento
* Tiempos de respuesta inferiores a 2 segundos en consultas de listados y catálogos bajo condiciones normales de red.
* Comportamiento fluido y sin bloqueos para transacciones monousuario en el servidor backend.

#### 3.4 Restricciones de Diseño
* Estricto apego al stack tecnológico definido (Ionic/Angular + Java Spring Boot + PostgreSQL + Supabase).

#### 3.5 Atributos del Sistema (Fiabilidad y Disponibilidad)
* Alta disponibilidad sujeta a la conectividad de red y los servicios en la nube.
* Integridad de datos garantizada mediante claves foráneas y esquemas relacionales estrictos en PostgreSQL.

#### 3.6 Atributos del Sistema (Mantenibilidad y Usabilidad)
* Arquitectura desacoplada en capas para facilitar futuras expansiones de módulos.
* Interfaz intuitiva y directa diseñada para minimizar la curva de aprendizaje operativo.

---

### 4. Apéndices

#### Apéndice: Modelos y Diagramas de Flujo del Sistema
Los diagramas detallados del diseño del sistema se encuentran disponibles en la carpeta de documentación del repositorio:

* **.1 [Diagrama de Arquitectura General](./diagrams/arquitectura.drawio):** Esquema de 3 capas que detalla la comunicación entre el Frontend Ionic, el Backend Spring Boot, Supabase Auth y la base de datos PostgreSQL.
* **.2 [Flujo Operativo del Módulo de Cotizaciones](./diagrams/cotizaciones.drawio):** Modelo de procesos que ilustra el flujo lógico desde la selección de insumos hasta el cálculo comercial y el almacenamiento.
* **.3 [Relación Materia Prima y Recetario](./diagrams/recetario.drawio):** Diagrama estructural que define el CRUD de insumos con borrado lógico (*soft delete*) y su asociación directa con la creación de recetas y soporte multimedia.