# Guía de Contribución

¡Gracias por tu interés en colaborar con **BackeryCore**! Este documento describe las pautas para proponer cambios, reportar problemas o desarrollar nuevas funcionalidades en el repositorio.

## Flujo de Trabajo (Git Flow Simplificado)

1. **Ramas de Trabajo:** 
   * La rama principal para producción y versiones estables es `main`.
   * Para desarrollar nuevas características o corregir errores, crea una rama temática a partir de `main`:
     ```bash
     git checkout -b feature/nombre-de-la-caracteristica
     git checkout -b fix/descripcion-del-error
     ```
2. **Commits Limpios y Descriptivos:**
   Sigue una convención clara en tus mensajes de commit (basada en Conventional Commits):
   * `feat: añade módulo de cotizaciones`
   * `fix: corrige cálculo de precio unitario en detalle`
   * `docs: actualiza especificación ERS`

3. **Pull Requests:**
   * Sube tu rama al repositorio remoto (`git push origin feature/...`).
   * Abre un *Pull Request* hacia la rama `main` detallando los cambios realizados y los componentes afectados.