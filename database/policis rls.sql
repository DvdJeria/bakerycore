-- Habilitar RLS y crear políticas para la tabla: cliente
ALTER TABLE public.cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura a usuarios autenticados" ON public.cliente
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insercion a usuarios autenticados" ON public.cliente
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir actualizacion a usuarios autenticados" ON public.cliente
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir select en cliente" ON public.cliente
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert en cliente" ON public.cliente
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir update en cliente" ON public.cliente
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


-- Habilitar RLS y crear políticas para la tabla: cotizacion
ALTER TABLE public.cotizacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir select en cotizacion" ON public.cotizacion
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert en cotizacion" ON public.cotizacion
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir update en cotizacion" ON public.cotizacion
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir delete en cotizacion" ON public.cotizacion
    FOR DELETE TO authenticated USING (true);


-- Habilitar RLS y crear políticas para la tabla: cotizacion_detalle
ALTER TABLE public.cotizacion_detalle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir select en cotizacion_detalle" ON public.cotizacion_detalle
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert en cotizacion_detalle" ON public.cotizacion_detalle
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir update en cotizacion_detalle" ON public.cotizacion_detalle
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir delete en cotizacion_detalle" ON public.cotizacion_detalle
    FOR DELETE TO authenticated USING (true);


-- Habilitar RLS y crear políticas para la tabla: device_tokens
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gestionan sus propios tokens" ON public.device_tokens
    FOR ALL TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


-- Habilitar RLS y crear políticas para la tabla: pedido
ALTER TABLE public.pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir select en pedido" ON public.pedido
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir insert en pedido" ON public.pedido
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir update en pedido" ON public.pedido
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir lectura de servicio a pedidos" ON public.pedido
    FOR SELECT TO service_role USING (true);


-- Habilitar RLS y crear políticas para la tabla: estado_pedido
ALTER TABLE public.estado_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir select en estado_pedido" ON public.estado_pedido
    FOR SELECT TO authenticated USING (true);


-- Habilitar RLS y crear políticas para la tabla: receta
ALTER TABLE public.receta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de recetas activas" ON public.receta
    FOR SELECT TO public USING (((auth.role() = 'authenticated'::text) AND ((is_deleted = false) OR (is_deleted IS NULL))));

CREATE POLICY "Permitir insercion de recetas a autenticados" ON public.receta
    FOR INSERT TO public WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "Permitir actualizacion de recetas a autenticados" ON public.receta
    FOR UPDATE TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "receta_select_all" ON public.receta
    FOR SELECT TO public USING (true);

CREATE POLICY "receta_insert_all" ON public.receta
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "receta_update_all" ON public.receta
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "receta_delete_all" ON public.receta
    FOR DELETE TO public USING (true);


-- Habilitar RLS y crear políticas para la tabla: unidad_medida
ALTER TABLE public.unidad_medida ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de unidades de medida" ON public.unidad_medida
    FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));


-- Habilitar RLS y crear políticas para la tabla: ingredientes
ALTER TABLE public.ingredientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingredientes_insert_all" ON public.ingredientes
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "ingredientes_update_all" ON public.ingredientes
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "ingredientes_select_authenticated" ON public.ingredientes
    FOR SELECT TO authenticated USING (true);


-- Habilitar RLS y crear políticas para la tabla: receta_detalle
ALTER TABLE public.receta_detalle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "receta_detalle_select_all" ON public.receta_detalle
    FOR SELECT TO public USING (true);

CREATE POLICY "receta_detalle_insert_all" ON public.receta_detalle
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "receta_detalle_update_all" ON public.receta_detalle
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "receta_detalle_delete_all" ON public.receta_detalle
    FOR DELETE TO public USING (true);
