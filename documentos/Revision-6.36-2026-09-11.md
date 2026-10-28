# Revisión local de la versión 6.36

**Resultado:** los dos defectos pendientes del migrador están corregidos y las comprobaciones adicionales del cerrojo pasan. La suite entregada se ejecutó: **812 comprobaciones aprobadas, 0 fallidas**. No se detectaron nuevos bloqueos en los cambios revisados. Esto permite pasar a la validación de esta versión en la copia de Apps Script; no constituye una aprobación del despliegue de producción.

## Archivos y correspondencia

- Servidor: `Codigo_14.gs`, versión `v2026.6.36-VIDEOTECA-ETAPA2`.
- Documento: `PENDIENTE_Etapa2_Disparadores_Credenciales_Publicacion_14.md`.
- Suite actualizada: carpeta `pruebas`.
- `pruebas/GAS_v2026.5.0.js` y `Codigo_14.gs` tienen el mismo SHA-256:

```text
ca4d2a350606e16126a7b3fa3787570982c97bbfa323462ff547a5eb49eceb41
```

El LEEME de `pruebas` declara esa versión, ese hash y 812 comprobaciones; los tres datos coinciden con lo verificado. La carpeta `pruebas_0` permanece en la 6.33 y no debe utilizarse para acreditar la entrega actual. No se encontró un ZIP en el árbol de esta carpeta; se verificó el paquete extraído en `pruebas`, que sí estaba disponible.

## Correcciones verificadas

| Caso | Resultado |
|---|---|
| Dos activadores viejos con la misma identidad | Se bloquea la migración sin crear ni borrar ninguno |
| Dos activadores nuevos con la misma identidad | Se informa duplicidad y se bloquea |
| Un viejo y un nuevo de la misma tarea | Se conserva el sustituto sin crear otro |
| Fallo al borrar el viejo y posterior reintento | No se duplica el sustituto |
| Activador móvil de otra hoja | Se conserva el ID de la hoja original |
| Activador móvil sin recurso identificable | Se deja intacto y se informa |
| Dos formularios distintos con el mismo manejador | Se migran como tareas distintas conservando ambos recursos |
| Continuación pendiente de ingesta | Se crea el manejador nuevo |
| Excepción al consultar el inventario | Se libera el cerrojo mediante `finally` |
| Cerrojo ocupado | Se devuelve un fallo sin consultar ni modificar el inventario |
| Simulación | No modifica activadores y no requiere adquirir el cerrojo |

Se comprobó además que la lectura del inventario en una migración real simulada ocurre después de adquirir el cerrojo. Su ubicación está dentro del migrador, fuera de los diálogos de confirmación.

También pasaron los casos locales anteriores de rotación: emisión de una cadena, estado pendiente, caducidad exacta, rechazo de tokens vencidos y reversión ante el fallo inyectado al guardar el estado pendiente. Se mantuvieron la carga del panel sin interpolación del JSON inicial y el botón para iniciar la rotación.

## Ejecución de pruebas

La suite de `pruebas` se ejecutó desde su propia carpeta. Los 18 archivos que contienen comprobaciones sumaron 812 aprobadas y cero fallidas. El diagnóstico `probe_taxo.js`, que no suma comprobaciones, también terminó con código de salida cero. Todos los procesos terminaron correctamente.

Se creó además `revision_636_pruebas.cjs`, que carga expresamente `Codigo_14.gs` y utiliza el simulador de la carpeta `pruebas`. Contiene verificaciones independientes de los cambios revisados. Puede repetirse desde la carpeta principal:

```powershell
node .\revision_636_pruebas.cjs
```

Estas comprobaciones adicionales no se sumaron a las 812 anunciadas. Se revisó asimismo la diferencia entre `Codigo_13.gs` y `Codigo_14.gs`: se concentra en versión, recurso explícito, detección de duplicados y bloqueo del migrador.

## Recomendación siguiente

1. Usar el servidor y la suite cuyos hashes coinciden; mantener identificada `pruebas_0` como entrega anterior.
2. Validar la 6.36 en la copia de Apps Script: migración de activadores de prueba, ejecución efectiva de manejadores privados, repetición de la migración y conservación de recursos.
3. Probar la rotación con credenciales ficticias de la copia, incluida la revocación del viejo y aceptación del sustituto. Mantener sin cambios `MASTER_SECRET_HMAC`, conforme a la decisión del usuario.
4. Comprobar el panel actualizado y el canal de avisos bajo la cuenta que ejecutará los activadores.
5. Después completar la configuración y las verificaciones de producción antes de publicar.

La validación real anterior corresponde a la 6.32. Esta revisión no reprodujo cuotas ni concurrencia real en Google, cortes duros de ejecución o conexiones colgadas. El cerrojo se verificó mediante un simulador instrumentado; no mediante dos ejecuciones simultáneas de Apps Script.

No se modificaron los archivos del producto, los ajustes de Google ni la implementación publicada. Solo se añadieron este informe y el archivo local de comprobaciones.
