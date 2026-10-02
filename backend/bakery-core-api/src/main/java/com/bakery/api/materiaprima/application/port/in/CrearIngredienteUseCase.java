package com.bakery.api.materiaprima.application.port.in;

import com.bakery.api.materiaprima.domain.model.Ingrediente;

public interface CrearIngredienteUseCase {
    Ingrediente create(Ingrediente ingrediente);
}
