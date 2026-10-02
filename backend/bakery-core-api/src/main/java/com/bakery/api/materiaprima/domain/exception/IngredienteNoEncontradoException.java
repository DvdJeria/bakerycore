package com.bakery.api.materiaprima.domain.exception;

import java.util.UUID;

public class IngredienteNoEncontradoException extends RuntimeException {
    public IngredienteNoEncontradoException(UUID id) {
        super("Ingrediente no encontrado: " + id);
    }
}
