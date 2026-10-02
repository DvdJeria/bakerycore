package com.bakery.api.materiaprima.domain.model;

import java.util.UUID;

public class UnidadMedida {

    private final UUID id;
    private final String nombre;

    public UnidadMedida(UUID id, String nombre) {
        if(nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        this.id = id;
        this.nombre = nombre;
    }

    public UUID getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }
}
