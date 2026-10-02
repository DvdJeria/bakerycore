package com.bakery.api.materiaprima.application.port.in;

import com.bakery.api.materiaprima.domain.model.Ingrediente;

public interface ActualizarIngredienteUseCase {
    Ingrediente actualizar(Ingrediente ingrediente);
}
