-- =====================================================================
-- SEED CATALOGO UNIDAD_MEDIDA
-- =====================================================================

INSERT INTO public.unidad_medida (unmed_nombre) VALUES
('GRAMOS'),
('CC'),
('UNIDAD');

-- =====================================================================
-- SEED CATALOGO INGREDIENTES
-- =====================================================================

INSERT INTO public.ingredientes (ing_nombre, ing_precio, ing_cantidad_base, unmed_id, is_deleted) VALUES
('Azúcar flor', 2250.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Azúcar granulada', 1100.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Base de tortas 30', 3150.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Base de tortas 35', 1800.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Base de tortas 40', 2000.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Base de tortas 45', 4000.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Brillo matizador', 5000.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Cacao', 1500.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Caja de torta 30', 2650.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Chips de chocolate', 6000.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Chocolate botones', 6200.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Colorantes', 1000.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Crema chantilli', 4300.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Crema de leche', 1500.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Decoración', 0.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Durazno', 1500.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Fondant de kilo', 6400.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Fondant de medio', 3900.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Frambuesa', 6000.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Frutilla', 1200.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Gelatina', 1000.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Harina', 1000.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Huevos', 223.33, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Kiwi', 1500.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Leche condensada', 2000.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Leche entera', 1300.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'CC'), false),
('Leche evaporada', 1900.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Limon', 1000.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Maicena', 1700.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Manjar', 3800.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Manjar sin lactosa Nestle', 6000.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Mantequilla', 4500.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Mantequilla Butter Cream', 4500.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Mantequilla sin lactosa', 4800.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Mantequilla sin sal', 1500.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Margarina Hornito', 4000.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Mermala frutos rojos', 5000.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Mermelada frambuesa', 6000.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Nueces', 7500.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Perlas', 1000.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Piña', 2000.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Pulpa de lucuma', 9000.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false),
('Soporte torta', 1500.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Toppers', 3500.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Vela larga', 1000.00, 1, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'UNIDAD'), false),
('Vino blanco', 2500.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'CC'), false),
('Yogurth', 1500.00, 1000, (SELECT unmed_id FROM public.unidad_medida WHERE unmed_nombre = 'GRAMOS'), false);