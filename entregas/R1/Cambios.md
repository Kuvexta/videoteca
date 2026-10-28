# Revisión R4 de Videoteca para pruebas completas

Fecha: 16 de septiembre de 2026. Preparada localmente, pendiente de instalar y publicar. Origen: Código 19 e Index 5. Entrega: Código 21 e Index 7.

## HTML

- Añade viewport móvil y mantiene el zoom disponible.
- Oculta los caracteres de la clave y deja Recordar desactivado inicialmente. Los enlaces de invitación no guardan la clave automáticamente de forma permanente.
- El catálogo distingue Por palabras sin IA, opción inicial, y Por significado con IA e índice. Conserva ambos caminos y sus filtros.
- El menú del supervisor ofrece Resultados y Cerrar sesión; no muestra enlaces que su rol no puede utilizar. No modifica permisos del servidor.
- Reutiliza un solo temporizador de caducidad al renovar sesión.
- Al cerrar o caducar, limpia examen en memoria, favoritos, cachés, paneles, notas pendientes, temporizadores y vistas; reconstruye el catálogo al volver a entrar.
- Descarta respuestas tardías de otra sesión y evita que un error 401 antiguo expulse a una sesión nueva. Cancela guardados diferidos de notas asociados a la sesión anterior.
- Distingue cierre local de confirmación remota. No afirma revocación remota cuando no pudo confirmarla.
- Un timeout informa que la operación puede continuar, para no inducir una entrega duplicada. El error de conexión recomienda revisar la versión de la implementación existente.
- Tolera parámetros mal codificados y conserva valores con signo igual en la navegación. Maneja rechazos asíncronos de carga y conserva filtros al reingresar.
- Identifica Index 7 en el pie de acceso.

## Servidor y panel de la hoja

- Indicador Twitch comprueba TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET.
- Cambia Probar que responde por Revisar prompts (sin llamada a IA).
- Explica que el interruptor de IA controla enriquecimiento y no anula la clasificación por reglas.
- Renombrado de renovación para distinguir vigencia y cambio de clave.
- Fila de ejemplo usa los índices del esquema de 32 columnas, solicita URL HTTPS real y no inventa métricas; cancelación o entrada inválida no inserta filas.
- Nueva identificación v2026.6.37-VIDEOTECA-PILOTO-R4.

## Alcance

Se conservaron las 52 rutas del puente, las funciones existentes y sus permisos. No se cambiaron claves, preguntas, resultados, activadores, modelos o recursos de producción. No se implementó una nueva pantalla familiar ni una migración de embeddings. Esas funciones y requisitos están documentados para los ensayos, no ocultos del paquete.

El capítulo 23 explica instalación y vuelta a la versión anterior. Antes de publicar se debe conservar el respaldo del estado actual. Publicar esta revisión no requiere recrear la aplicación de TikTok ni cambiar la URL de retorno si se mantiene el despliegue.
