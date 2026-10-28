# Corrección de retorno OAuth TikTok R1

## Instalado y verificado

- Servidor: `Codigo_16_TikTok_redirect.gs`, versión `v2026.6.37-VIDEOTECA-ETAPA2-TIKTOK-R1`.
- SHA-256 local: `46eb9765a6c6592b7a114bfd0344b3b7782d898f7609e5e966d2d9c5bd44d662`.
- Código del editor antes del cambio coincidente con `Codigo_15.gs`, normalizando finales de línea. Copia original conservada.
- Proyecto: `1pv0v0_r60zn8rLc614fewTK6qS7BPYgNpr0d5LMvSmIAU_fC4YUEN4tZ`.
- Implementación existente actualizada de versión Google 4 a 5. Confirmación de Google: 12 septiembre 2026, 17:59, correctamente actualizada.
- URL conservada: https://script.google.com/macros/s/AKfycbyWXkkfk8tTizluP1lCOtIMcGtXUjQJIlPnlTrZ2KEw26svHSdQcKLoDz50SJrtw4LLDQ/exec
- Misma cuenta ejecutora y acceso existentes. No se crearon implementaciones ni se archivaron otras.
- Apertura real de esa URL: pantalla de acceso Videoteca muestra la versión terminada en `TIKTOK-R1`.

## Cambio

La autorización exige `TIKTOK_REDIRECT_URI`, valida URL HTTPS de Apps Script terminada en `/exec` sin parámetros y no usa una URL automática como alternativa. Conserva estado, URL y Client Key en caché por 900 segundos. El canje utiliza la URL conservada. Si cambió el Client Key, exige comenzar otra autorización. No acepta estados del formato anterior.

Se configuró la propiedad con la URL anterior mediante un instalador temporal limitado al proyecto y a las identidades activa/efectiva de Andrés. Verificó que ninguna otra propiedad cambiara y comprobó el retorno mediante la función real. Registro `TIKTOK_RETORNO_CONFIGURADO_OK`. El instalador se retiró antes de publicar; lectura posterior del editor coincide con el archivo corregido.

El formulario de propiedades no permitió guardar porque había dos campos vacíos preexistentes. No se borraron ni se rellenaron esos campos. Primer intento del instalador se detuvo antes de escribir por `getUi()` no disponible desde el editor; se retiró esa comprobación, manteniendo cuenta y proyecto explícitos, y el segundo terminó correctamente.

## Pruebas y límites

`node verificar_tiktok_redirect.cjs`: 15 pruebas correctas, incluyendo sintaxis completa, URL configurada, ausencia/URL inválida, cambio o borrado de propiedad tras iniciar, estado incorrecto/caducado/antiguo/reutilizado, cambio de Client Key y caché ilegible. Servicios simulados: no acreditan un canje real de tokens.

El panel de configuración real abrió; la automatización del clic de conectar encontró una limitación de interacción del marco. Falta ejecutar una autorización nueva desde la hoja y completar el consentimiento en TikTok. No se afirma recepción de tokens ni lectura real de videos.

No copiar la frase «El enlace caduca en 15 minutos» junto con el enlace: en un intento anterior quedó adjunta al parámetro state. Usar exclusivamente la URL de autorización recién generada.
