-- ******************************************************
-- Script DDL Completo y Optimizado para Producción / Supabase
-- Proyecto: BackeryCore (Delicias Duche)
-- Motor: PostgreSQL
-- ******************************************************

-- 0. Asegurar extensión para generación segura de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Limpieza previa en orden inverso de dependencias (por si se requiere reiniciar)
DROP TABLE IF EXISTS public.cotizacion_detalle CASCADE;
DROP TABLE IF EXISTS public.pedido CASCADE;
DROP TABLE IF EXISTS public.cotizacion CASCADE;
DROP TABLE IF EXISTS public.estado_pedido CASCADE;
DROP TABLE IF EXISTS public.cliente CASCADE;
DROP TABLE IF EXISTS public.ingredientes CASCADE;
DROP TABLE IF EXISTS public.unidad_medida CASCADE;

-- 1. Tabla: Unidad de Medida
CREATE TABLE public.unidad_medida (
    unmed_id UUID NOT NULL DEFAULT gen_random_uuid(),
    unmed_nombre VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT unidad_medida_pkey PRIMARY KEY (unmed_id)
);

-- 2. Tabla: Ingredientes (con Soft Delete, restricciones de precios y unicidad condicional)
CREATE TABLE public.ingredientes (
    ing_id UUID NOT NULL DEFAULT gen_random_uuid(),
    ing_nombre VARCHAR(100) NOT NULL,
    ing_precio NUMERIC(10, 2) NOT NULL CHECK (ing_precio >= 0),
    ing_cantidad_base INT NOT NULL DEFAULT 1 CHECK (ing_cantidad_base > 0),
    unmed_id UUID NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT ingredientes_pkey PRIMARY KEY (ing_id),
    CONSTRAINT ingredientes_unmed_id_fkey FOREIGN KEY (unmed_id) REFERENCES public.unidad_medida(unmed_id)
);

-- Índice único condicional: Permite recrear un ingrediente con el mismo nombre si el anterior fue eliminado lógicamente
CREATE UNIQUE INDEX idx_ingrediente_activo_nombre 
ON public.ingredientes (ing_nombre) 
WHERE is_deleted = false;

-- 3. Tabla: Cliente
CREATE TABLE public.cliente (
    cli_id UUID NOT NULL DEFAULT gen_random_uuid(),
    cli_nombre VARCHAR(50) NOT NULL,
    cli_apellido VARCHAR(50) NOT NULL,
    cli_instagram TEXT,
    cli_telefono TEXT,
    CONSTRAINT cliente_pkey PRIMARY KEY (cli_id)
);

-- 4. Tabla: Estado de Pedido
CREATE TABLE public.estado_pedido (
    est_id UUID NOT NULL DEFAULT gen_random_uuid(),
    est_nombre VARCHAR(50) NOT NULL UNIQUE, -- Ej: Pendiente, En Proceso, Entregado, Cancelado
    CONSTRAINT estado_pedido_pkey PRIMARY KEY (est_id)
);

-- 5. Tabla: Cotización
CREATE TABLE public.cotizacion (
    cot_id UUID NOT NULL DEFAULT gen_random_uuid(),
    cot_fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cot_total NUMERIC(10, 2) NOT NULL CHECK (cot_total >= 0),
    cot_nombre TEXT, 
    CONSTRAINT cotizacion_pkey PRIMARY KEY (cot_id)
);

-- 6. Tabla: Cotización Detalle (Relación Muchos a Muchos con Historial de Precios)
CREATE TABLE public.cotizacion_detalle (
    cot_id UUID NOT NULL,
    ing_id UUID NOT NULL,
    cantidad_usada NUMERIC(10, 2) NOT NULL CHECK (cantidad_usada > 0),
    precio_unitario_fijo NUMERIC(10, 2) NOT NULL CHECK (precio_unitario_fijo >= 0),
    CONSTRAINT cotizacion_detalle_pkey PRIMARY KEY (cot_id, ing_id),
    CONSTRAINT cot_det_cot_id_fkey FOREIGN KEY (cot_id) REFERENCES public.cotizacion(cot_id) ON DELETE CASCADE,
    CONSTRAINT cot_det_ing_id_fkey FOREIGN KEY (ing_id) REFERENCES public.ingredientes(ing_id)
);

-- 7. Tabla: Pedido (Con zona horaria estricta para fechas locales)
CREATE TABLE public.pedido (
    ped_id UUID NOT NULL DEFAULT gen_random_uuid(),
    cli_id UUID NOT NULL,
    cot_id UUID NULL, 
    est_id UUID NOT NULL,
    ped_fecha_entrega TIMESTAMP WITH TIME ZONE NOT NULL,
    ped_precio NUMERIC(10, 2) NOT NULL CHECK (ped_precio >= 0),
    CONSTRAINT pedido_pkey PRIMARY KEY (ped_id),
    CONSTRAINT pedido_cli_id_fkey FOREIGN KEY (cli_id) REFERENCES public.cliente(cli_id),
    CONSTRAINT pedido_cot_id_fkey FOREIGN KEY (cot_id) REFERENCES public.cotizacion(cot_id),
    CONSTRAINT pedido_est_id_fkey FOREIGN KEY (est_id) REFERENCES public.estado_pedido(est_id)
);

-- ******************************************************
-- Índices de Rendimiento para Llaves Foráneas (Foreign Keys)
-- ******************************************************
CREATE INDEX idx_ingredientes_unmed ON public.ingredientes(unmed_id);
CREATE INDEX idx_cotizacion_detalle_cot ON public.cotizacion_detalle(cot_id);
CREATE INDEX idx_cotizacion_detalle_ing ON public.cotizacion_detalle(ing_id);
CREATE INDEX idx_pedido_cliente ON public.pedido(cli_id);
CREATE INDEX idx_pedido_estado ON public.pedido(est_id);
CREATE INDEX idx_pedido_cotizacion ON public.pedido(cot_id);