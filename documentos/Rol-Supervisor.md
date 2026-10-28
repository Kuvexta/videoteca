# Rol supervisor

Creado por solicitud del usuario, sin asignar credenciales a personas.

## Alcance

Scope `supervisor` separado de la jerarquía anterior. Permite canjear su credencial por sesión, consultar identidad y marca del portal, cerrar sesión y consultar `supervision_resultados`. No alcanza read_only, exam, append ni admin. Así no hereda las operaciones de escritura que ya usaban read_only.

`acceso_portal` es un requisito interno de acceso para los scopes válidos; no es un scope emitible. `supervisor` también es satisfecho por admin. La validación de caducidad y revocación existente permanece antes de comprobar capacidades.

La nueva pantalla Resultados muestra calificaciones de `_Historial_Calificaciones`, con correo exacto normalizado opcional y páginas de 50 registros. No es una vista de todos los estados de exámenes: no muestra intentos abiertos que aún no estén en el historial. No devuelve enlaces de certificados, identificadores internos ni anexos forenses. Tampoco permite editar.

La pantalla está disponible para admin y supervisor. Supervisor es redirigido allí si intenta navegar a otra sección; el servidor rechaza las otras operaciones independientemente de esa redirección. Participantes conservan sus vistas y controles de propiedad.

El diálogo de creación de tokens incluye `supervisor`. Solo un administrador puede emitirlo mediante el mecanismo existente. No se creó ningún token ni se concedió acceso al libro maestro. Antes de asignarlo hace falta identificar al destinatario autorizado.

## Validación

- 22 pruebas específicas: filtro, paginación, datos minimizados, rechazo de participantes y tokens inválidos, acceso de admin, canje sin elevación, rechazo de escritura y todas las rutas no permitidas.
- 18 pruebas anteriores de aislamiento de resultados, 15 de retorno TikTok y 11 de diagnóstico TikTok ejecutadas sobre el servidor nuevo: todas aprobadas. Total 66 pruebas locales.
- Sintaxis de servidor completo y scripts del HTML comprobada.
- Pantalla real en navegador local con datos ficticios: dos registros, filtro reduce a uno, texto con marcado se representa como texto. Este ensayo no usa Google ni datos de empleados.
- Lectura del editor antes de instalar coincide con R2/Index_4. Después coincide con Codigo_18_Supervision.gs e Index_5_Supervision.html normalizando finales de línea.

No se probó una sesión real de supervisor ni se emitió una credencial de prueba en producción. No se ejecutó la suite histórica completa. No se afirma una auditoría global de todas las rutas o permisos externos.

Publicación confirmada por Google: versión 7 del 12/9/2026, 18:43, sobre el mismo ID `AKfycbyWXkkfk8tTizluP1lCOtIMcGtXUjQJIlPnlTrZ2KEw26svHSdQcKLoDz50SJrtw4LLDQ`. Sin cambiar cuenta ejecutora ni permisos de la web.

Archivos:
- Codigo_18_Supervision.gs: SHA-256 `8f846476acd5c036c24ae2e0b9f390fccd06b13f2a54ad7807e40ccbd03234b6`.
- Index_5_Supervision.html: SHA-256 `5c876bea76e32d0a6b9a8bc677c2bf4d59bab798238046d09055cbe1322bfc5f`.

Las versiones R2 anteriores y el respaldo cifrado permanecen conservados. La creación del rol no cambia el mapa de credenciales; el respaldo portable R2 sigue conteniendo el código anterior, no estos dos archivos nuevos.

## Alta real de supervisor — 13/09/2026

- Autorizado por el usuario: Alberto Suarez, kubexta@gmail.com, supervisor, 365 días.
- Se comprobó ausencia de accesos previos para ese correo antes de emitir uno único mediante generarTokenAdmin.
- Caducidad registrada: 1820812718301 (13/09/2027, aproximadamente 00:18, Bogotá).
- Comprobación con el token real: supervision_resultados permitió lectura; validarTokenConScope con admin la rechazó.
- Prueba en el portal publicado versión 7: ingreso correcto, identidad ALBERTO SUAREZ / SUPERVISOR, consulta con 0 resultados registrados; sesión cerrada al terminar. No se guardó la clave en el navegador.
- Función temporal retirada; código del editor vuelto a leer y comparado exactamente con Codigo_18_Supervision.gs, normalizando saltos de línea. No se creó otra implementación.
- Acceso y propiedades actuales respaldados con DPAPI y recuperación verificada en la carpeta privada local 2026-09-13_Supervisor; también se guardaron Codigo_18 e Index_5. Este complemento aún NO está incorporado al portable de la nube.
- Visor local Abrir acceso Alberto.cmd permite copiar el acceso sin guardar su clave en texto plano. No se envió correo ni se escribió el token en este documento o en registros.

### Complemento portable cerrado — 13/09/2026
La copia Videoteca_2026-09-13_Supervisor_portable.7z incluye 7 archivos, recuperación sin DPAPI comprobada, contenido idéntico y contraseña incorrecta rechazada. Subida a Drive privado de Andrés: https://drive.google.com/file/d/1mHjNNVEH3odArw25kr_z6KcdAicZu1sC/view . Permiso Restringido, solo el propietario. Descargada desde Drive y cotejada contra original: SHA-256 83e3a2566d22e38ffb7b752a1ef1d865833eac0fd0ec4a220f3f7086e8f425f6. Este cierre resuelve la pendiente del complemento señalada arriba; conservar también el respaldo integral del 11/09 y los anteriores.
