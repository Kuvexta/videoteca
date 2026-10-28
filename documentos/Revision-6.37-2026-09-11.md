# Verificación de entrega 6.37

**Resultado:** entrega verificada localmente, sin nuevos hallazgos en los cambios revisados. Lista para validar en la copia de Apps Script; no se ha publicado ni instalado esta versión durante esta revisión.

## Identidad del servidor

`Codigo_15.gs` y `pruebas/GAS_v2026.5.0.js` coinciden en el SHA-256 anunciado:

```text
4e76e36efa3dcdb825532a7ac193b6f4d2e6450154daa321a594f4c8eb94170f
```

La comparación completa de `Codigo_14.gs` y `Codigo_15.gs` muestra una sola modificación: `VERSION_SCRIPT` pasa de 6.36 a 6.37. No hay otros cambios de código.

El LEEME de `pruebas` declara la versión, el hash y el total correctos. Se revisó también el documento de pendientes terminado en `_15.md`, identificado como 6.37. `pruebas_0` continúa siendo una extracción anterior.

## Pruebas ejecutadas

Se ejecutaron todos los `probe_*.js` desde la carpeta `pruebas`:

- 18 archivos con comprobaciones: **818 aprobadas, 0 fallidas**.
- `probe_624.js`: 201 aprobadas, frente a las 195 de la entrega anterior.
- `probe_taxo.js`: diagnóstico sin comprobaciones, salida correcta.
- Los 19 procesos terminaron con código de salida cero.

Se inspeccionaron las pruebas del cerrojo: instrumentan adquisición y liberación, exigen lectura del inventario bajo bloqueo, comprueban liberación ante excepción, propagación del error, ausencia de lectura con bloqueo ocupado y simulación sin modificar activadores. Sigue existiendo una comprobación textual complementaria sobre la UI; no se confunde con una prueba de concurrencia real.

## Qué sigue

La revisión local queda cerrada para esta entrega. Validar ahora la 6.37 en la copia de Apps Script:

1. Migrar activadores de prueba y observar una ejecución real de un manejador privado.
2. Repetir la migración y verificar que no duplique ni cambie recursos.
3. Probar una rotación completa con tokens ficticios: sustituto aceptado y token anterior rechazado tras revocarlo.
4. Comprobar el panel y la recepción de avisos bajo la cuenta propietaria de los activadores.

Mantener la decisión de no rotar `MASTER_SECRET_HMAC` en esta etapa. La evidencia real anterior corresponde a la 6.32; las 818 comprobaciones se ejecutan con servicios simulados y no sustituyen esta validación en Google.

No se modificó el producto ni ningún recurso de Google. Se añadió únicamente este registro de verificación.
