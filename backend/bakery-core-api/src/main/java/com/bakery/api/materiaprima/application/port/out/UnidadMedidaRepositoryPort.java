package com.bakery.api.materiaprima.application.port.out;

import com.bakery.api.materiaprima.domain.model.UnidadMedida;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UnidadMedidaRepositoryPort {
    Optional<UnidadMedida> findById(UUID id);
    List<UnidadMedida> listar(String nombre);
}
