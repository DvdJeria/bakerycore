package com.bakery.api.materiaprima.application.port.out;

import com.bakery.api.materiaprima.domain.model.Ingrediente;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IngredienteRepositoryPort {
    Ingrediente save(Ingrediente ingrediente);
    Optional<Ingrediente> findById(UUID id);
    Optional<Ingrediente> findByName(String nombre);
    List<Ingrediente> listar();
}
