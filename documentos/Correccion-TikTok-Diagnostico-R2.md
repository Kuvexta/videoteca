# TikTok: interpretación de respuestas y estado de credenciales

## Cambio preparado

Servidor `Codigo_17_TikTok_diagnostico.gs`, versión `v2026.6.37-VIDEOTECA-ETAPA2-TIKTOK-R2`.
SHA-256: `0dfa1793ee290596be4f43f91f2ea41c67c7d82b92d34472fc54e1de8df88111`.
Se conserva R1 intacta. La captura aportada por el usuario acredita que el retorno de autorización R1 mostró «TikTok conectado».

- El indicador exige ambas claves reales: TIKTOK_CLIENT_KEY y TIKTOK_CLIENT_SECRET.
- Una ausencia en resultados deja de etiquetarse como propiedad ajena.
- La consulta distingue falta de token, cuota agotada, HTTP fallido, error lógico de TikTok y respuesta ilegible o incompleta.
- Se exige `error.code=ok` y una lista de videos válida. Las respuestas válidas vacías se distinguen de fallos.
- Se mantiene el mapa de metadatos para los consumidores existentes, con diagnóstico opcional separado.
- Las filas sin datos conservan sus valores; los resultados parciales válidos pueden actualizarse.
- El resultado del completado devuelve `sinDatos`, `consultados` y `errores`, en lugar del campo engañoso `ajenos`. No hay consumidores de `.ajenos` en el servidor revisado.

## Verificación local

11 pruebas de diagnóstico y conservación de datos aprobadas; 15 pruebas de autorización ejecutadas sobre R2 también aprobadas. Incluyen sintaxis del servidor completo. Servicios simulados; no sustituyen las comprobaciones reales. La suite histórica de 818 pruebas no se ejecutó para esta revisión.

Fuentes oficiales contrastadas:
- https://developers.tiktok.com/docs/en/tiktok-api-v2-video-query
- https://developers.tiktok.com/docs/en/tiktok-api-v2-video-list

## Verificación real e instalación

El editor previo coincidía exactamente con R1 normalizando los finales de línea. Diagnóstico temporal restringido al proyecto y a las identidades activa y efectiva de Andrés; consulta lista pública y hasta 100 videos pendientes sin escribir en las filas del catálogo. Solo registra estados y cantidades, nunca tokens ni respuestas completas.

Ejecución real del 12 de septiembre de 2026, 18:13, completada:
- `video/list`, max_count=1: HTTP 200, error.code=ok, 0 videos, has_more=false.
- `video/query`, los 64 pendientes en lotes 20+20+20+4: cuatro HTTP 200, error.code=ok, cero videos devueltos en todos.
- La lectura autorizada funciona. La lista pública disponible a esta integración está vacía. No se demuestra la propiedad de cada video ni la causa de su ausencia.
- No se modificaron filas del catálogo. La comparación de todas las propiedades dio false: el control normal de cuota escribe CUOTA_CONTADOR_TIKTOK en cada petición. No se afirma igualdad total ni se comprobó individualmente qué otras propiedades pudieron cambiar durante la ejecución.
- Se retiró el diagnóstico temporal después de ejecutar y se leyó de nuevo el código del editor: coincide exactamente con R2 normalizando finales de línea.

Publicación completada: Google confirmó «Se actualizó correctamente la implementación. Versión 6 del 12 sept 2026, 6:14 p.m.». Se conservó el ID `AKfycbyWXkkfk8tTizluP1lCOtIMcGtXUjQJIlPnlTrZ2KEw26svHSdQcKLoDz50SJrtw4LLDQ`, su URL y sus permisos. En esta apertura Google mostraba la implementación activa como «Sin título»; se identificó por ID, no por descripción. No se archivaron implementaciones.

Una apertura nueva de la URL publicada mostró el acceso Videoteca y la versión `v2026.6.37-VIDEOTECA-ETAPA2-TIKTOK-R2`. La hoja se recargó. No se acreditó visualmente el indicador del panel nuevo: el menú personalizado no se mostró en la vista estrecha disponible. El indicador se verificó en pruebas y mediante lectura del código instalado.
