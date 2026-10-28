# Validación de Twitch — 11/09/2026

Tras el aviso del usuario de haber actualizado las credenciales, se ejecutó una comprobación temporal en producción con validación del ID de proyecto y usuario activo y efectivo Andrés.

Se leyeron y validaron los valores sellados de `API_KEY_TWITCH_CLIENT_ID` y `API_KEY_TWITCH_CLIENT_SECRET`, exigiendo previamente su existencia y la de MASTER_SECRET_HMAC. No se invocaron rutas heredadas ni se reutilizó TWITCH_APP_TOKEN de caché.

Resultado registrado a las 22:36:08 de Bogotá:

- OAuth client_credentials: HTTP 200; token de aplicación recibido.
- Helix videos para el ID 2731589001 del catálogo: HTTP 200; respuesta con arreglo de datos válido.
- El video consultado no estaba presente en los datos. No se atribuye una causa específica: esta prueba acredita autenticación y consulta API, no disponibilidad del video.
- Propiedades del script iguales antes y después.

El token de aplicación solo se utilizó en memoria durante esta ejecución; no se imprimió ni guardó en propiedades o caché. No se revocó ese token de prueba. Tampoco se consultaron secretos por URL ni se imprimieron respuestas completas.

Se retiró la función temporal y se verificó por lectura íntegra del editor igualdad exacta del servidor con su estado previo. No se modificaron HTML, manifiesto, activadores ni publicación.

Las credenciales actualmente guardadas funcionan. Esto no comprueba por separado que el Client Secret anterior haya sido invalidado en Twitch; la regeneración es una operación realizada por el usuario en el proveedor.
