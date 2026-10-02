package com.bakery.api.materiaprima.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

public class Ingrediente {

    private final UUID id;
    private String nombre;
    private BigDecimal precio;
    private Integer cantidadBase;
    private UnidadMedida unidadMedida;
    private boolean isDeleted;

    public Ingrediente(UUID id, String nombre, BigDecimal precio, Integer cantidadBase, UnidadMedida unidadMedida) {
        validarReglasNegocio(nombre, precio, cantidadBase, unidadMedida);
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.cantidadBase = cantidadBase;
        this.unidadMedida = unidadMedida;
        this.isDeleted = false;
    }

    public void actualizarDatos(String nuevoNombre, BigDecimal nuevoPrecio, Integer nuevaCantidadBase, UnidadMedida nuevaUnidadMedida) {
        validarReglasNegocio(nuevoNombre, nuevoPrecio, nuevaCantidadBase, nuevaUnidadMedida);
        this.nombre = nuevoNombre.trim();
        this.precio = nuevoPrecio;
        this.cantidadBase = nuevaCantidadBase;
        this.unidadMedida = nuevaUnidadMedida;
    }

    public void realizarSoftDelete(){
        this.isDeleted = true;
    }

    private void validarReglasNegocio(String nombre, BigDecimal precio, Integer cantidadBase, UnidadMedida unidadMedida) {
        if (nombre.isEmpty()) {throw new IllegalArgumentException("El nombre es obligatorio");}
        if (precio == null) {throw new IllegalArgumentException("El precio es obligatorio");}
        if (cantidadBase == null) {throw new IllegalArgumentException("El cantidad es obligatorio");}
        if (unidadMedida == null) {throw new IllegalArgumentException("El unidad es obligatorio");}
    }

    public UUID getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public Integer getCantidadBase() {
        return cantidadBase;
    }

    public UnidadMedida getUnidadMedida() {
        return unidadMedida;
    }

    public boolean isDeleted() {
        return isDeleted;
    }
}
