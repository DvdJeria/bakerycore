-- =====================================================================
-- CREACIÓN DEL ESQUEMA CON RLS HABILITADO
-- =====================================================================
DROP TABLE IF EXISTS public.receta_detalle CASCADE;
DROP TABLE IF EXISTS public.receta CASCADE;
DROP TABLE IF EXISTS public.pedido CASCADE;
DROP TABLE IF EXISTS public.estado_pedido CASCADE;
DROP TABLE IF EXISTS public.cotizacion_detalle CASCADE;
DROP TABLE IF EXISTS public.cotizacion CASCADE;
DROP TABLE IF EXISTS public.cliente CASCADE;
DROP TABLE IF EXISTS public.ingredientes CASCADE;
DROP TABLE IF EXISTS public.unidad_medida CASCADE;

-- 1. Unidad de Medida
CREATE TABLE public.unidad_medida (
    unmed_id UUID NOT NULL DEFAULT gen_random_uuid(),
    unmed_nombre VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT unidad_medida_pkey PRIMARY KEY (unmed_id)
);

-- 2. Ingredientes (Materia Prima)
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

-- 3. Recetas (Cuaderno Digital)
CREATE TABLE public.receta (
    rec_id UUID NOT NULL DEFAULT gen_random_uuid(),
    rec_nombre VARCHAR(100) NOT NULL,
    rec_instrucciones TEXT,
    rec_fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT receta_pkey PRIMARY KEY (rec_id)
);

CREATE TABLE public.receta_detalle (
    rec_id UUID NOT NULL,
    ing_id UUID NOT NULL,
    cantidad_necesaria NUMERIC(10, 2) NOT NULL CHECK (cantidad_necesaria > 0),
    CONSTRAINT receta_detalle_pkey PRIMARY KEY (rec_id, ing_id),
    CONSTRAINT rec_det_rec_id_fkey FOREIGN KEY (rec_id) REFERENCES public.receta(rec_id) ON DELETE CASCADE,
    CONSTRAINT rec_det_ing_id_fkey FOREIGN KEY (ing_id) REFERENCES public.ingredientes(ing_id)
);

-- 4. Clientes
CREATE TABLE public.cliente (
    cli_id UUID NOT NULL DEFAULT gen_random_uuid(),
    cli_nombre VARCHAR(100) NOT NULL,
    cli_apellido VARCHAR(100) NOT NULL,
    cli_instagram TEXT,
    cli_telefono TEXT,
    CONSTRAINT cliente_pkey PRIMARY KEY (cli_id)
);

-- 5. Cotizaciones (Plantillas de Costos)
CREATE TABLE public.cotizacion (
    cot_id UUID NOT NULL DEFAULT gen_random_uuid(),
    cot_fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
    cot_total NUMERIC(10, 2) NOT NULL CHECK (cot_total >= 0),
    cot_nombre TEXT,
    CONSTRAINT cotizacion_pkey PRIMARY KEY (cot_id)
);

CREATE TABLE public.cotizacion_detalle (
    cot_id UUID NOT NULL,
    ing_id UUID NOT NULL,
    cantidad_usada NUMERIC(10, 2) NOT NULL CHECK (cantidad_usada > 0),
    precio_unitario_fijo NUMERIC(10, 2) NOT NULL CHECK (precio_unitario_fijo >= 0),
    CONSTRAINT cotizacion_detalle_pkey PRIMARY KEY (cot_id, ing_id),
    CONSTRAINT cot_det_cot_id_fkey FOREIGN KEY (cot_id) REFERENCES public.cotizacion(cot_id) ON DELETE CASCADE,
    CONSTRAINT cot_det_ing_id_fkey FOREIGN KEY (ing_id) REFERENCES public.ingredientes(ing_id)
);

-- 6. Estados y Pedidos (Calendario)
CREATE TABLE public.estado_pedido (
    est_id UUID NOT NULL DEFAULT gen_random_uuid(),
    est_nombre VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT estado_pedido_pkey PRIMARY KEY (est_id)
);

CREATE TABLE public.pedido (
    ped_id UUID NOT NULL DEFAULT gen_random_uuid(),
    cli_id UUID NOT NULL,
    cot_id UUID,
    est_id UUID NOT NULL,
    ped_fecha_entrega TIMESTAMP WITH TIME ZONE NOT NULL,
    ped_precio NUMERIC(10, 2) NOT NULL CHECK (ped_precio >= 0),
    CONSTRAINT pedido_pkey PRIMARY KEY (ped_id),
    CONSTRAINT pedido_cli_id_fkey FOREIGN KEY (cli_id) REFERENCES public.cliente(cli_id),
    CONSTRAINT pedido_cot_id_fkey FOREIGN KEY (cot_id) REFERENCES public.cotizacion(cot_id),
    CONSTRAINT pedido_est_id_fkey FOREIGN KEY (est_id) REFERENCES public.estado_pedido(est_id)
);

-- =====================================================================
-- HABILITACIÖN  DE RLS ENABLE
-- =====================================================================

ALTER TABLE public.unidad_medida ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receta_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizacion_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estado_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido ENABLE ROW LEVEL SECURITY;