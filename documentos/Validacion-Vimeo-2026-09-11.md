# Validación de la clave guardada de Vimeo

## Nueva comprobación correcta — 20:30

Después de que el usuario corrigiera la credencial, se repitió exactamente la consulta autenticada. El registro de las 20:30:06 confirmó **HTTP 200**, URI del video esperado y título presente, propiedades sin cambios y sin alternativa pública. La clave actualmente guardada queda validada para esa lectura de la API de Vimeo.

Se retiró la función temporal y se verificó igualdad exacta del servidor leído antes y después de la prueba. No se modificaron otros archivos ni se publicó. El resultado no acredita por sí mismo que el token anterior haya sido revocado en Vimeo: ese punto requiere confirmación o comprobación separada. El fallo previo que sigue se conserva como historial.

El usuario informó que había pegado Vimeo. Se comprobó la credencial guardada en producción, bajo usuario activo y efectivo Andrés y con el ID exacto del proyecto verificado.

Una función temporal leyó `API_KEY_VIMEO`, exigió la existencia previa de `MASTER_SECRET_HMAC`, validó el valor sellado con `descifrar_` y realizó una sola consulta autenticada a `https://api.vimeo.com/videos/1189845345?fields=uri,name`. El identificador procede del catálogo entregado. No usó la ruta pública oEmbed, no siguió redirecciones y no imprimió credenciales ni cuerpos de respuesta.

Resultado registrado el 11/09/2026 a las 20:21:12 de Bogotá:

- HTTP **401**.
- Video esperado y título no obtenidos.
- Propiedades del script idénticas antes y después.
- Sin alternativa pública.

La clave sellada es legible, pero la API de Vimeo no autorizó la consulta. No queda validada la nueva credencial ni cerrada su rotación. El resultado no identifica por sí solo si se pegó un dato equivocado, un token incompleto o un token ya inválido. Tampoco acredita la revocación de la credencial anterior.

Se retiró la función temporal y la lectura íntegra del servidor coincidió exactamente con la lectura previa. Se conserva la 6.37; no se modificaron el HTML, el manifiesto, los activadores ni la publicación.

Siguiente paso: verificar en la cuenta de desarrollador de Vimeo que se usa el token de acceso completo correspondiente y guardarlo mediante la configuración de Vimeo. No enviar valores al chat. Repetir la consulta antes de dar por buena la configuración o retirar otra credencial.
