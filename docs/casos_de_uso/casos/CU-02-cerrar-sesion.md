# CU-02: Cierre de Sesión de Usuario

## 1. Descripción General
* **Actor Principal:** Operador / Administrador.
* **Precondición:** El usuario se encuentra autenticado en la aplicación.
* **Descripción Breve:** Permite finalizar la sesión actual limpiando las credenciales locales de forma segura.

## 2. Flujo Principal (Camino Feliz)
1. El usuario accede al menú de configuración o perfil en la interfaz móvil.
2. Selecciona la opción "Cerrar Sesión".
3. El sistema muestra un cuadro de diálogo de confirmación: *"¿Está seguro que desea cerrar sesión?"*.
4. El usuario confirma presionando "Sí".
5. La aplicación elimina el token JWT del almacenamiento local seguro.
6. El sistema redirige al usuario a la pantalla de Inicio de Sesión (`CU-01`).