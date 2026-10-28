# Instalación 6.37 y migración de producción — 11/09/2026

**Cierre del panel a las 19:55:** con solo Andrés conectado, el diagnóstico confirmó ambas identidades, los tres activadores y un aviso visible. El botón original de inventario mostró también los tres en pantalla. Se retiró el diagnóstico y se restauró exactamente la 6.37. No se necesitan cambios del transporte de diálogos para resolver este incidente. Véase `REVISION_PANEL_IDENTIDAD_2026-09-11.md`; las dudas previas se conservan abajo como historia.

Actualización de las 19:50: la llamada del panel confirmó usuario activo y efectivo SST, pese al encabezado Andrés; el aviso falló por acceso denegado. Véase `REVISION_PANEL_IDENTIDAD_2026-09-11.md`. El diagnóstico temporal se retiró y la fuente 6.37 se restauró exactamente. Las secciones anteriores a esa comprobación se conservan como historia.

## Resultado

Instalados Código.gs e Index.html de la candidata 6.37 en el editor de producción. Migrados los tres activadores bajo andressuarezcarmona@gmail.com. No se actualizó la implementación publicada, no se rotaron credenciales y no se configuró todavía un canal definitivo de avisos de la aplicación.

El usuario confirmó que la contraseña del respaldo portable está guardada aparte y su recuperación comprobada.

## Verificaciones previas

- El servidor previo del editor coincidía con la 6.19 respaldada, comparando el contenido con saltos de línea normalizados.
- Las 22 ScriptProperties coincidían, nombres y valores, con el respaldo; no aparecían checkpoints ni INGESTA_DETENIDA.
- La lista mostraba tres activadores, todos «Yo» bajo Andrés. Última ejecución del dashboard: 18:44:08, completada. Las ejecuciones visibles no mostraban trabajo activo al revisar. Esta observación no equivale a un bloqueo global de todas las sesiones.
- Candidata local: Codigo_15.gs, SHA-256 4e76e36efa3dcdb825532a7ac193b6f4d2e6450154daa321a594f4c8eb94170f. Coincide con pruebas/GAS_v2026.5.0.js.
- Portal local: pruebas/Index.html, SHA-256 0cd4d6f2e2de7c6a97346c9acba46a62f86a1b4eb2832293edbc48303b9198ec.
- No se repitió la suite local sin cambios: la entrega conserva su evidencia previa de 818 comprobaciones y las pruebas reales documentadas.

## Ejecución y contingencia

Los archivos se guardaron aproximadamente a las 19:19–19:20. El panel de herramientas abrió, pero sus llamadas de migración informaron por registro «Instalados ahora mismo: 0» (19:21:21). Esto NO se tomó como migración completada. Aunque el encabezado de Sheets mostraba Andrés, no se acreditó la identidad efectiva de esas llamadas del panel: la causa exacta de esa discrepancia requiere una revisión aparte.

Se añadió un archivo temporal separado, MigracionTemporalVerificada.gs. El lanzador comprobaba el ID exacto de producción, el correo del usuario activo y efectivo de Andrés, y exactamente los tres nombres antiguos. Solo después llamó al migrador original: primero simulación sin errores y después ejecución real. No se modificó la implementación del migrador.

La ejecución inició a las 19:23:51. Los mensajes del migrador registran los tres cambios entre 19:23:55 y 19:23:59. Resultado: tres migrados, cero fallos, cero intactos, inventario final exacto. Se conservan los tiempos de los mensajes; el aviso de finalización tiene un reloj distinto y no se usa para inferir duración precisa.

Una segunda ejecución del lanzador devolvió YA_MIGRADOS y las tres funciones esperadas; no creó nada. Esto prueba la rama de repetición del lanzador, no una segunda llamada real al migrador original. El archivo temporal se retiró después; su fuente sin secretos se conserva localmente junto a los respaldos para auditoría.

## Inventario posterior comprobado en los tres diálogos de edición

| Función | Programación | Aviso de fallo | Cuenta |
|---|---|---|---|
| actualizarDashboardPeriodico_ | Cada 1 hora | Una vez por día | Andrés |
| ejecutarMantenimientoSemanal_ | Domingos, 03:00–04:00 | Una vez por día | Andrés |
| crearBackupAutomatico_ | Domingos, 23:00–00:00 | Una vez por día | Andrés |

Zona horaria Bogotá, GMT−05:00. Se cerraron los diálogos con Cancelar: no hubo que ajustar preferencias. El minuto efectivo de los nuevos activadores puede cambiar. Su mera existencia no acredita una ejecución automática exitosa; los trabajos semanales permanecen pendientes de evidencia real.

## Verificación final

- Solo quedan Código.gs e Index.html como archivos visibles; se retiró el auxiliar temporal.
- Ambos archivos fueron leídos íntegramente desde el editor y coincidieron con los archivos de la candidata al normalizar únicamente retornos de carro.
- No se afirma igualdad binaria entre el archivo local y el texto del portapapeles. SHA-256 de la representación leída del servidor: 5e281b9bbf80f72e92fa32904ec0f9b17bfd56f23cb143dc1fc24efacda0c94c. Del portal: d430921c1ab546f85201b65b641e2fec00dc93216ee9fedefccf692d757e7abb.
- Las 22 ScriptProperties siguen exactamente iguales a la captura anterior: cero nuevas y cero cambiadas, incluidos los secretos.
- No se alteró el manifiesto ni se ejecutó una publicación. La última implementación publicada comprobada sigue siendo la Versión 1 del 9/9; las correcciones del editor no deben darse por publicadas.

## Próximo paso

Configurar y verificar el canal definitivo de avisos de la aplicación bajo la cuenta responsable, revisar el acceso real al portal actualizado mediante implementación de prueba, cerrar la rotación acordada con sus integraciones y actualizar la implementación existente después de verificarla. La discrepancia de identidad/inventario desde el panel debe tratarse explícitamente antes de usar allí otras acciones sensibles. No cambiar permisos del libro como parte implícita de esta instalación.

## Revisión del panel y primera ejecución automática — 19:44

Se leyó una exportación del libro de producción, sin modificar sus celdas. En `_Log_Actividad`, las filas 2104 y 2105 corresponden a «Filtro», a las 19:19:24 y 19:20:38, con Andrés como usuario. Las filas 2106–2108 registran las tres migraciones a las 19:23:56, 19:23:57 y 19:23:59, también con Andrés. No hay filas del panel a las 19:21 en ese registro.

Límite del dato: `registrarLogActividad` obtiene `Session.getActiveUser().getEmail()`, no el usuario efectivo. Además, omite el registro en hoja cuando no tiene libro activo y absorbe errores de escritura. La ausencia de filas no acredita la identidad de la llamada ni demuestra que no se ejecutara.

Se repitió exclusivamente «Ver los disparadores instalados» desde el panel de la hoja. Apps Script registra `lanzarAccionHerramienta` a las 19:44:03, duración 2,49 s, Completada. Su registro de Cloud de las 19:44:05 dice «Disparadores instalados: 0» y «Ninguno con nombre anterior». No apareció un diálogo visible en la hoja. Por tanto, el inventario del panel sigue discrepando del inventario verificado durante la migración; no se da por resuelto.

La hipótesis de otra identidad sigue sin demostrarse. Para resolverla, la siguiente prueba debe obtener en la misma llamada del panel el usuario activo, el efectivo, el ID de proyecto, el ID del libro activo (o su ausencia) y el número de activadores. Debe ser un diagnóstico de lectura y no ejecutar inicializadores, migraciones, rotaciones ni crear activadores. Comprobar el encabezado de la página o ejecutar un diagnóstico solo desde el editor no acredita el contexto del panel. Ese diagnóstico todavía no se añadió ni ejecutó.

Evidencia nueva independiente: la página de Ejecuciones confirma `actualizarDashboardPeriodico_`, tipo «Basada en el tiempo», iniciado a las 19:27:34, duración 3,363 s y estado Completada. Las filas 2109–2110 del libro contienen los registros Dashboard posteriores. Esto acredita la primera ejecución automática del manejador privado del dashboard en producción; no acredita todavía los dos trabajos semanales.

En esta revisión no se modificaron el código, los activadores, las credenciales ni la implementación publicada.
