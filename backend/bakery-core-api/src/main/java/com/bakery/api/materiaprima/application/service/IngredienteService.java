package com.bakery.api.materiaprima.application.service;

import com.bakery.api.materiaprima.application.port.in.ActualizarIngredienteUseCase;
import com.bakery.api.materiaprima.application.port.in.CrearIngredienteUseCase;
import com.bakery.api.materiaprima.application.port.in.EliminarIngredienteUseCase;
import com.bakery.api.materiaprima.application.port.in.ListarIngredienteUseCase;
import com.bakery.api.materiaprima.application.port.out.IngredienteRepositoryPort;
import com.bakery.api.materiaprima.application.port.out.UnidadMedidaRepositoryPort;
import com.bakery.api.materiaprima.domain.exception.IngredienteDuplicadoException;
import com.bakery.api.materiaprima.domain.exception.IngredienteNoEncontradoException;
import com.bakery.api.materiaprima.domain.model.Ingrediente;
import com.bakery.api.materiaprima.domain.model.UnidadMedida;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class IngredienteService implements
        CrearIngredienteUseCase,
        ListarIngredienteUseCase,
        ActualizarIngredienteUseCase,
        EliminarIngredienteUseCase {

    private IngredienteRepositoryPort ingredienteRepositoryPort;
    private UnidadMedidaRepositoryPort unidadMedidaRepositoryPort;

    public IngredienteService(IngredienteRepositoryPort ingredienteRepositoryPort, UnidadMedidaRepositoryPort unidadMedidaRepositoryPort) {
        this.ingredienteRepositoryPort = ingredienteRepositoryPort;
        this.unidadMedidaRepositoryPort = unidadMedidaRepositoryPort;

        /*
        * No sé por qué estamos haciendo un constructor de las interfaces
        */
    }

    @Override
    public Ingrediente create(Ingrediente ing) {
        //Validar que el ingrediente no se encuentra con el mismo nombre
        ingredienteRepositoryPort.findByName(ing.getNombre()).ifPresent(i -> {
            throw new IngredienteDuplicadoException(ing.getNombre());

            /*
            * Hice la llamada de la variable a través del get, porque así se instancía el objeto completo
            * y no estoy pasando variables sueltas. Y también cree así el método en el IngredienteRepositoryPort
            */

        });

        /*
         * No sé si sea bueno buscar por unidad de medida, si solo existen 3 en el catálogo y el usuario lo va
         * a seleccionar desde un listado. No es como que tenga muchas opciones.
         */
        UUID unidadMedidaId = ing.getUnidadMedida().getId();
        UnidadMedida unidadMedida = unidadMedidaRepositoryPort.findById(unidadMedidaId)
                .orElseThrow(() -> new IllegalArgumentException("Unidad medida no encontrada"));

        Ingrediente nuevoIngrediente = new Ingrediente(null, ing.getNombre(), ing.getPrecio(), ing.getCantidadBase(), unidadMedida);

        return ingredienteRepositoryPort.save(nuevoIngrediente);
    }

    @Override
    public List<Ingrediente> listar() {
        return ingredienteRepositoryPort.listar();
    }

    @Override
    public Ingrediente actualizar(Ingrediente ing) {
        Ingrediente ingrediente = ingredienteRepositoryPort.findById(ing.getId())
                .orElseThrow(() -> new IngredienteNoEncontradoException(ing.getId()));

        UnidadMedida unidadMedida = unidadMedidaRepositoryPort.findById(ing.getUnidadMedida().getId())
                .orElseThrow(() -> new IllegalArgumentException("La unidad de medida " + ing.getUnidadMedida().getId() + " no existe"));
        ing.actualizarDatos(ing.getNombre(), ing.getPrecio(), ing.getCantidadBase(), ing.getUnidadMedida());
        return ingredienteRepositoryPort.save(ingrediente);
    }

    @Override
    public void eliminar(UUID id) {
        Ingrediente ingrediente = ingredienteRepositoryPort.findById(id)
                .orElseThrow(()-> new IngredienteNoEncontradoException(id));

        ingrediente.realizarSoftDelete();
        ingredienteRepositoryPort.save(ingrediente);
    }
}
