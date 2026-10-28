# Estado de TikTok

Tras el aviso del usuario, se inspeccionaron las propiedades visibles del proyecto de producción bajo Andrés, sin modificar sus valores ni imprimir secretos.

Están presentes `API_KEY_TIKTOK_CLIENT_KEY` y `API_KEY_TIKTOK_CLIENT_SECRET`. No aparecen `API_KEY_TIKTOK_REFRESH_TOKEN` ni `TIKTOK_OPEN_ID` entre las 28 propiedades del script. Esta inspección acredita presencia, no aceptación de las credenciales por TikTok.

El código necesita autorización de una cuenta para la API de videos: `iniciarAutorizacionTikTok` prepara el consentimiento, `completarAutorizacionTikTok` canjea el código y guarda la autorización. `obtenerTokenTikTok_` no puede renovar sin refresh token. No se realizó una llamada que se pudiera presentar como validación de autenticación.

La URL de retorno se obtiene de `ScriptApp.getService().getUrl()`. La implementación pública conocida sigue en la versión anterior; la validación del portal corregido se hizo en `/dev`. Debe verificarse y actualizarse el despliegue público y la URL de retorno registrada antes de completar esta conexión, para no atribuir al código nuevo una autorización atendida por otro código.

No se generó un enlace de consentimiento, no se concedieron permisos de TikTok ni se cambiaron propiedades. La validación de TikTok queda pendiente de conexión OAuth y consulta autenticada. La API configurada obtiene métricas de videos de la cuenta autorizada; la consulta pública de videos de terceros no acredita la autorización.
