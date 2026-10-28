# Validación real 6.37 — completada en la copia

Fecha: 11 de septiembre de 2026. Horas de Bogotá.

**Resultado:** aprobadas las comprobaciones reales de migración, repetición sin duplicados, ejecución automática de un manejador privado, rotación de un token de consulta, actualización del panel y recepción del correo de prueba. Limpieza completada. Este resultado no equivale a una certificación integral del sistema ni autoriza por sí mismo la publicación en producción.

## Alcance

Se trabaja exclusivamente en la copia «Videoteca — PRUEBAS 6.32», cuyo nombre aún conserva la versión anterior. El código instalado y verificado en el editor es la 6.37. No se ha publicado una implementación ni modificado el proyecto de producción.

- Hoja: `1NLEEPZLHtTlieIQGx62V73kYGYmtAv4_rTHQpDvg6jE`.
- Proyecto de pruebas: `1IZOJFAYbRSwLRIFouPYGQAC4ths6IGBAKUSYHJKOvMgL3vgFn7AjSckZ`.
- Servidor: `Codigo_15.gs`, SHA-256 `4e76e36efa3dcdb825532a7ac193b6f4d2e6450154daa321a594f4c8eb94170f`.
- Cuenta observada: `sstconsultorescolombia@gmail.com`.

La revisión local anterior acredita 818 comprobaciones aprobadas. No equivale a 818 pruebas ejecutadas contra Google.

## Comprobaciones aprobadas en Google

1. Se sustituyó el servidor de la copia por el contenido de la 6.37 y se comprobó la igualdad del texto del editor, normalizando únicamente los finales de línea.
2. Se crearon dos activadores de prueba con los nombres anteriores: una continuación de ingesta y un activador de edición ligado a esta hoja.
3. A las 16:41:22 se ejecutó el migrador real. Migró ambos a `procesarColaConAntiTimeout_` y `onEditControlMovilTrigger_`, sin errores y conservando el identificador de la hoja.
4. La segunda migración no creó sustitutos adicionales: los IDs del inventario antes y después coincidieron exactamente.
5. A las **16:43:04**, Google ejecutó automáticamente `procesarColaConAntiTimeout_`, tipo **A partir del tiempo**, con estado **Completada** y duración **5,866 segundos**. Esto acredita que ese manejador privado puede ser invocado por un activador real.
6. La lectura posterior de estado confirmó cinco filas de prueba con identificador y título; checkpoint, contador de fallos y aviso de detención ausentes al terminar. Solo permanecía el activador privado de edición, sin nombres antiguos ni duplicados.
7. El panel se abrió desde el menú real de la hoja a las 16:41:58 y cargó sus datos mediante `estadoConfiguracion` a las 16:42:01. Mostró el canal de avisos y la acción para iniciar la rotación.

## Incidencia de la preparación

El ayudante temporal intentó abrir el panel desde el editor y recibió la guarda «Esta operación solo está disponible desde la hoja de cálculo». La preparación del token temporal anterior a esa llamada sí terminó. Se abrió después el panel por el menú real, correctamente. No se modificó ni debilitó la guarda y esta incidencia no demuestra un fallo del panel.

## Rotación y panel: aprobados

Se utilizó un token temporal con permiso `read_only` y cliente «CODEX VALIDACION 6.37 - TEMPORAL». El usuario realizó las confirmaciones de emisión y revocación en la hoja. No se rotaron credenciales de producción ni claves de proveedores.

La ejecución de comprobación iniciada a las **16:49:35** devolvió:

```json
{"rotacionPendiente":true,"viejoValido":true,"nuevoValido":true,"caducidadExacta":true,"scopeNuevo":"read_only"}
```

Esto verifica que el sustituto conserva la caducidad exacta y el permiso de consulta, y que el anterior permanece válido durante la transición. El panel mostró automáticamente la sección de atención con el botón «Revocar el anterior».

Después de la revocación, la ejecución iniciada a las **16:50:03** devolvió:

```json
{"rotacionPendiente":false,"viejoValido":false,"nuevoValido":true,"caducidadExacta":null,"scopeNuevo":"read_only"}
```

La caducidad aparece como `null` en esta segunda lectura porque el registro anterior ya no existe; su igualdad se comprobó antes de revocarlo. El aviso de atención desapareció del panel sin cerrarlo y volverlo a abrir.

## Correo: envío y recepción aprobados

Se utilizó el botón real «Enviar prueba». La confirmación mostró únicamente el correo autorizado `andressuarezcarmona@gmail.com`. Se envió el evento `prueba_de_canal`, aproximadamente a las **16:50**, y el panel informó del envío.

El usuario confirmó expresamente en esta conversación **«Sí, lo recibí»** para ese nuevo correo. Por tanto, este punto acredita recepción, además del resultado mostrado por el panel. La configuración era temporal en la copia y se restauró posteriormente; no queda establecido un canal de producción.

## Limpieza completada

La restauración iniciada a las **16:50:49** terminó correctamente y devolvió:

```json
{"restaurado":true,"ultimaFila":4972,"sinRespaldoTemporal":true,"activadores":0,"version":"v2026.6.37-VIDEOTECA-ETAPA2"}
```

- Se limpiaron las cinco filas temporales, 4973 a 4977.
- Las doce propiedades respaldadas recuperaron exactamente sus valores originales, incluidos el canal de avisos, el mapa de tokens, el token administrador y el estado de ingesta. Se retiraron así los tokens creados exclusivamente para la prueba.
- Se eliminó el respaldo temporal `CODEX_637_VALIDACION`.
- No quedaron activadores de prueba.
- Se eliminó `Validacion637Temporal.gs` del proyecto. El editor volvió a mostrar únicamente `Código.gs` e `Index.html`.
- Una lectura final del contenido completo de `Código.gs` coincidió con `Codigo_15.gs`, normalizando únicamente finales de línea. Se conserva la 6.37 en la copia, sin el auxiliar ni cambios de prueba en el servidor.

El auxiliar local se conserva como registro técnico de la prueba, no como archivo para instalar en producción.

## Límites

La rotación probada fue la de un token temporal de consulta, no la de un token administrador real ni la de una clave de proveedor. Se comprobó la migración del activador de edición y su recurso, pero no su ejecución mediante una edición humana. No se han acreditado los trabajos semanales, concurrencia real, cortes duros, conexiones colgadas ni fallos durante `flush()`. Tampoco se repitió en esta sesión la prueba de detención por cuatro fallos y reanudación: la evidencia real de ese escenario corresponde a la 6.32.

No se ha comprobado en esta sesión qué versión sirve actualmente el portal de producción: las capturas anteriores no prueban su estado actual.

No se modificó `MASTER_SECRET_HMAC`. La publicación y las operaciones sobre producción permanecen pendientes.

## Recomendación para producción

No se detectaron nuevos fallos en los caminos ejercitados. Antes de publicar:

1. Instalar la entrega verificada y comprobar su identidad en el proyecto correcto; conservar una versión anterior recuperable.
2. Configurar y probar el canal definitivo con la cuenta propietaria de los activadores. La recepción en la copia no acredita ese canal.
3. Inventariar los activadores reales, conservar sus horarios y recursos y ejecutar la migración; comprobar el resultado sin duplicados y observar las tareas programadas. En esta prueba no se migraron los trabajos de producción.
4. Sustituir las credenciales de producción que corresponda y revocar las anteriores tras actualizar las integraciones. Mantener la decisión de no cambiar la clave de sellado en esta etapa.
5. Validar el portal con acceso normal y comprobar las operaciones relevantes de examen y autorización antes de actualizar la implementación existente.

Estas son acciones posteriores: no constan como realizadas por este informe.
