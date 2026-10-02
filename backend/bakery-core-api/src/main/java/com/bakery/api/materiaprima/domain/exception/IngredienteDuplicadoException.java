package com.bakery.api.materiaprima.domain.exception;

import java.util.UUID;

public class IngredienteDuplicadoException extends RuntimeException {
    public IngredienteDuplicadoException(String nombre) {
        super("Ya existe un ingrediente con el nombre: " + nombre);
    }
}
