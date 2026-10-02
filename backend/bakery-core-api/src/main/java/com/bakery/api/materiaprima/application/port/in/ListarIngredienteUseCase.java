package com.bakery.api.materiaprima.application.port.in;

import com.bakery.api.materiaprima.domain.model.Ingrediente;

import java.util.List;

public interface ListarIngredienteUseCase {
    List<Ingrediente> listar();
}
