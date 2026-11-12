-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.unidad_medida (
  unmed_id uuid NOT NULL DEFAULT gen_random_uuid(),
  unmed_nombre character varying NOT NULL UNIQUE,
  CONSTRAINT unidad_medida_pkey PRIMARY KEY (unmed_id)
);
CREATE TABLE public.ingredientes (
  ing_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ing_nombre character varying NOT NULL,
  ing_precio numeric NOT NULL CHECK (ing_precio >= 0::numeric),
  ing_cantidad_base integer NOT NULL DEFAULT 1 CHECK (ing_cantidad_base > 0),
  unmed_id uuid NOT NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT ingredientes_pkey PRIMARY KEY (ing_id),
  CONSTRAINT ingredientes_unmed_id_fkey FOREIGN KEY (unmed_id) REFERENCES public.unidad_medida(unmed_id)
);
CREATE TABLE public.receta (
  rec_id uuid NOT NULL DEFAULT gen_random_uuid(),
  rec_nombre character varying NOT NULL,
  rec_instrucciones text,
  rec_fecha_creacion timestamp with time zone DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  rec_imagen text,
  CONSTRAINT receta_pkey PRIMARY KEY (rec_id)
);
CREATE TABLE public.receta_detalle (
  rec_id uuid NOT NULL,
  ing_id uuid NOT NULL,
  cantidad_necesaria numeric NOT NULL CHECK (cantidad_necesaria > 0::numeric),
  CONSTRAINT receta_detalle_pkey PRIMARY KEY (rec_id, ing_id),
  CONSTRAINT rec_det_rec_id_fkey FOREIGN KEY (rec_id) REFERENCES public.receta(rec_id),
  CONSTRAINT rec_det_ing_id_fkey FOREIGN KEY (ing_id) REFERENCES public.ingredientes(ing_id)
);
CREATE TABLE public.cliente (
  cli_id uuid NOT NULL DEFAULT gen_random_uuid(),
  cli_nombre character varying NOT NULL,
  cli_apellido character varying NOT NULL,
  cli_instagram text,
  cli_telefono text,
  is_deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT cliente_pkey PRIMARY KEY (cli_id)
);
CREATE TABLE public.cotizacion (
  cot_id uuid NOT NULL DEFAULT gen_random_uuid(),
  cot_fecha timestamp with time zone DEFAULT now(),
  cot_total numeric NOT NULL CHECK (cot_total >= 0::numeric),
  cot_nombre text,
  CONSTRAINT cotizacion_pkey PRIMARY KEY (cot_id)
);
CREATE TABLE public.cotizacion_detalle (
  cot_id uuid NOT NULL,
  ing_id uuid NOT NULL,
  cantidad_usada numeric NOT NULL CHECK (cantidad_usada > 0::numeric),
  precio_unitario_fijo numeric NOT NULL CHECK (precio_unitario_fijo >= 0::numeric),
  CONSTRAINT cotizacion_detalle_pkey PRIMARY KEY (cot_id, ing_id),
  CONSTRAINT cot_det_cot_id_fkey FOREIGN KEY (cot_id) REFERENCES public.cotizacion(cot_id),
  CONSTRAINT cot_det_ing_id_fkey FOREIGN KEY (ing_id) REFERENCES public.ingredientes(ing_id)
);
CREATE TABLE public.estado_pedido (
  est_id uuid NOT NULL DEFAULT gen_random_uuid(),
  est_nombre character varying NOT NULL UNIQUE,
  CONSTRAINT estado_pedido_pkey PRIMARY KEY (est_id)
);
CREATE TABLE public.pedido (
  ped_id uuid NOT NULL DEFAULT gen_random_uuid(),
  cli_id uuid NOT NULL,
  cot_id uuid,
  est_id uuid NOT NULL,
  ped_fecha_entrega timestamp with time zone NOT NULL,
  ped_precio numeric NOT NULL CHECK (ped_precio >= 0::numeric),
  ped_nombre character varying,
  ped_observaciones text,
  ped_fecha_creacion timestamp with time zone DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT pedido_pkey PRIMARY KEY (ped_id),
  CONSTRAINT pedido_cli_id_fkey FOREIGN KEY (cli_id) REFERENCES public.cliente(cli_id),
  CONSTRAINT pedido_cot_id_fkey FOREIGN KEY (cot_id) REFERENCES public.cotizacion(cot_id),
  CONSTRAINT pedido_est_id_fkey FOREIGN KEY (est_id) REFERENCES public.estado_pedido(est_id)
);
CREATE TABLE public.device_tokens (
  token_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  endpoint_hash text UNIQUE,
  CONSTRAINT device_tokens_pkey PRIMARY KEY (token_id),
  CONSTRAINT device_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
