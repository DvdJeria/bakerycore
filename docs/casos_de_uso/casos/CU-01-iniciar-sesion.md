# CU-01: Autenticación y Validación de Usuario

## 1. Descripción General
* **Actor Principal:** Operador / Administrador.
* **Precondición:** El usuario cuenta con credenciales válidas registradas en Supabase Auth y dispositivo con conexión a red.
* **Descripción Breve:** Permite al usuario iniciar sesión en la aplicación móvil (Ionic) mediante credenciales, obteniendo un token JWT para operar de forma segura.

## 2. Flujo Principal (Camino Feliz)
1. El usuario abre la aplicación BakeryCore y visualiza la pantalla de autenticación.
2. Ingresa su correo electrónico y contraseña.
3. Presiona el botón "Iniciar Sesión".
4. La aplicación envía las credenciales mediante HTTPS a Supabase Auth.
5. Supabase valida las credenciales y retorna un token JWT válido junto con el perfil del usuario.
6. La aplicación almacena de forma segura el token JWT en el almacenamiento local del dispositivo.
7. El sistema redirige automáticamente al usuario al Dashboard principal.

## 3. Flujos Alternativos y Excepciones
* **[A1 - Credenciales Incorrectas]:**
  * *Condición:* Supabase rechaza el correo o la contraseña.
  * *Acción:* La app limpia el campo de contraseña y muestra una alerta visual: *"Credenciales inválidas. Intente nuevamente."*
  * *Salida:* Retorna al paso 2.
* **[A2 - Error de Conectividad]:**
  * *Condición:* Fallo en la red durante la petición a Supabase.
  * *Acción:* El sistema muestra un mensaje de error de red y mantiene habilitado el botón de reintento.