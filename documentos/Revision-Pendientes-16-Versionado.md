# Revisión del documento 16 y propuesta de versiones

Fecha: 11 de septiembre de 2026.

## Resultado

Revisado `PENDIENTE_Etapa2_Disparadores_Credenciales_Publicacion_16.md` contra `Codigo_15.gs` y el informe de validación real 6.37. Las **91 referencias numeradas coinciden** con el inicio de las líneas correspondientes del servidor. Su SHA-256 sigue siendo:

`4e76e36efa3dcdb825532a7ac193b6f4d2e6450154daa321a594f4c8eb94170f`

La evidencia de las 16:43:04 acredita la ejecución real de `procesarColaConAntiTimeout_` por un activador. No acredita la ejecución de los otros nueve manejadores. La sección 6.bis refleja correctamente las principales pruebas y sus límites. No se repitió la suite de 818 comprobaciones porque el código no cambió; esta revisión es documental y de trazabilidad.

## Correcciones recomendadas antes de usarlo como guía de producción

### 1. Procedimiento de migración: corregir el orden y retirar el renombrado manual

**Ubicación:** líneas 215–219, sección 5. Es la corrección operativa más importante.

La guía pide «Renombrar en el código» y «Borrar y recrear». La 6.37 ya tiene los nombres privados y el migrador crea el sustituto antes de borrar el anterior (`Codigo_15.gs`, líneas 2479–2481). Borrar primero puede dejar la tarea sin activador si falla la creación.

Texto propuesto:

> Instalar la entrega 6.37 verificada, que ya contiene los nombres privados. Inventariar los activadores y comparar sus horarios y recursos con las recetas del migrador. En una ventana sin trabajos en curso, ejecutar «Migrar disparadores a nombres privados». El migrador crea el sustituto y después elimina el anterior. Revisar todos los errores y comprobar que no queden duplicados; repetir la operación debe conservar los IDs de los sustitutos existentes.

La coexistencia breve del anterior y su sustituto es parte del procedimiento, no una garantía de que nunca haya dos registros simultáneamente. Si falla el borrado, hay que resolver esa coexistencia. El migrador utiliza horarios definidos en sus recetas; el inventario no obtiene automáticamente el horario original ni la preferencia de avisos de fallo. Compararlos manualmente sigue siendo necesario.

### 2. No afirmar el estado actual de producción con capturas anteriores

**Ubicación:** líneas 354–367, sección 7.

La sección 6.bis reconoce que no se consultó el portal actual, pero la sección 7 vuelve a afirmar que sirve la Versión 1. Sustituirlo por:

> Las capturas anteriores mostraban la Versión 1 del 9 de septiembre. Antes de publicar, consultar la implementación activa y registrar su versión actual. Después de actualizarla, comprobar que sirve exactamente la entrega aprobada.

También conviene titular la sección 2 «Activadores observados en las capturas» hasta volver a inventariar producción. Respecto a los avisos, lo acreditado es que la prueba **no dejó configurado un canal de producción**; no se inspeccionó producción para demostrar que carece de cualquier canal.

### 3. Limitar la afirmación de validación al alcance probado

**Ubicación:** línea 10 y sección 6.bis.

Cambiar «Todas se validaron» por «Se validaron los escenarios detallados en §6.bis». Se probó un token temporal de consulta, no una rotación de administrador ni de proveedor. Se migraron dos tipos de activador y se observó una ejecución automática del manejador de ingesta.

Que la guarda rechazara abrir el panel desde el editor es compatible con el comportamiento esperado; ese rechazo, por sí solo, no demuestra que todas las rutas del portal estén protegidas. Esa conclusión necesita sus propias pruebas de acceso.

### 4. Corregir el nombre del manejador en el procedimiento de fallo simulado

**Ubicación:** línea 311.

Usar `procesarColaConAntiTimeout_`, con guion bajo final. El nombre sin guion bajo de la sección histórica sobre el 10 de septiembre sí puede permanecer, porque describe una ejecución anterior.

### 5. Aclarar que la comprobación de salud requiere autorización

**Ubicación:** línea 306.

`?health=true` no es una comprobación pública autónoma: `doGet` valida un token de consulta antes de devolverla (`Codigo_15.gs`, líneas 25371–25378). Especificar que debe ejecutarse mediante el procedimiento autorizado de consulta. No incluir tokens reales en informes, capturas o enlaces compartidos. Una respuesta de acceso denegado sin token no demuestra un fallo del sistema.

### 6. Ajustar la explicación del fallo después de escribir

**Ubicación:** líneas 323–327.

Es correcto inyectar el fallo antes de `setValues` para probar una escritura que no se inicia. Es demasiado absoluto afirmar que escribir y después informar de un fallo «no puede ocurrir»: quedan expresamente fuera de esta validación fallos durante `flush()` y resultados parciales o inciertos.

Texto propuesto:

> Colocar el fallo antes de `setValues` reproduce el escenario concreto de escritura no iniciada. Colocarlo después reproduce otro escenario y no acredita esa garantía. Los fallos durante la confirmación y las escrituras parcialmente aplicadas requieren pruebas separadas.

### 7. Separar identidad exacta y alcance de las pruebas

**Ubicación:** línea 301.

Sustituir «si se toca una línea más, vuelve a no estarlo» por:

> Todo cambio de bytes genera una identidad distinta que debe registrarse. Revisar el cambio y repetir las pruebas afectadas antes de publicar. La evidencia anterior se conserva asociada a su archivo original; no se transfiere automáticamente al nuevo.

Cambiar solo comentarios no exige necesariamente repetir una prueba de ingesta con Google. Cambiar `VERSION_SCRIPT` sí modifica datos que el sistema devuelve y registra, aunque no cambie el algoritmo: comprobar versión visible, salud, informes y cualquier consumidor de esa cadena. Repetir pruebas de migración o ingesta si sus rutas cambian.

## Numeración recomendada para la entrega definitiva

Para este proyecto recomiendo **año.mes.revisión**, una convención de calendario: `AAAA.MM.R`. El último número es el consecutivo de publicación de ese mes, no el día.

| Ejemplo | Significado |
|---|---|
| `2026.09.1` | Primera entrega publicada en septiembre de 2026 |
| `2026.09.2` | Segunda entrega de ese mismo mes |
| `2026.10.1` | Primera entrega publicada en octubre de 2026 |
| `2026.09.1-rc.1` | Candidata de pruebas, todavía no estable |

Usar el mes real de publicación, según `America/Bogota`, y documentar esta convención. No llamar `2026.01.01` a una entrega de septiembre: parecería una fecha de enero y no reflejaría su publicación. La cadena histórica `2026.6.37` se conserva como identificador anterior; no reinterpretar el 6 como mes de una entrega que no seguía esta convención.

CalVer admite distintas combinaciones de calendario. Esta elección es una recomendación para la trazabilidad de Videoteca, no una obligación de Apps Script. Si en el futuro lo principal es comunicar compatibilidad de una API pública, SemVer (`MAJOR.MINOR.PATCH`) sería otra opción: exige definir qué cambios rompen ese contrato. [CalVer](https://calver.org/), [SemVer](https://semver.org/).

### Cómo adoptar el nombre sin perder lo validado

**Ahora:** conservar intacta la 6.37 y su hash. No hace falta renombrar código para considerarlo candidato a producción. Se puede describir la entrega como «Videoteca estable — fuente 6.37» y registrar la fecha cuando se publique.

**Al preparar la entrega definitiva con el nuevo esquema:** asignar el número, actualizar la única constante `VERSION_SCRIPT`, calcular el nuevo hash y ejecutar las verificaciones afectadas sobre ese archivo final. No cambiar el número después de verificarlo y atribuirle el hash anterior. Los comentarios de encabezado y cierre aún mencionan `v2026.5.0`; actualizar los que describen la versión actual y conservar los del historial.

Ejemplo para una primera publicación en septiembre, todavía no aplicado:

```javascript
const VERSION_SCRIPT = "2026.09.1";
```

No hacer un reemplazo global de versiones: las referencias históricas y los registros de pruebas deben seguir describiendo los archivos que realmente se usaron. No mezclar `AUTH_REVISION` con esta numeración: su función es invalidar sesiones, no identificar una entrega. Tampoco reiniciar tokens, propiedades, base de datos o `MASTER_SECRET_HMAC` para cambiar el nombre de versión.

## Cuatro datos distintos que deben registrarse

| Dato | Ejemplo o función |
|---|---|
| Versión del producto | `2026.09.1`, asignada por el proyecto |
| Versión de Apps Script | Entero asignado por Google al crear la instantánea; conservar su secuencia |
| ID de implementación | Identifica la implementación existente y su URL |
| Hash del paquete | Identifica el contenido exacto validado |

Las versiones guardadas de Apps Script son instantáneas. Actualizar una implementación existente para que apunte a una versión nueva conserva su identidad de implementación; cambiar el texto `VERSION_SCRIPT` no publica el portal. No crear otro proyecto ni borrar el historial para «volver a versión 1». [Versiones de Apps Script](https://developers.google.com/apps-script/guides/versions), [Gestión de implementaciones](https://developers.google.com/apps-script/concepts/deployments).

Mantener por entrega un registro con versión del producto, fecha real, SHA-256 del servidor, de `Index.html` y del manifiesto aplicable, número de versión de Google, ID de implementación, comprobaciones realizadas y pendientes. El hash del servidor por sí solo no identifica el HTML ni la configuración del proyecto.

En Apps Script los nombres deben ser estables: `Código.gs`, `Index.html`, `appsscript.json`. Para las entregas locales, usar una carpeta o ZIP por versión; los sufijos `Codigo_15` y documento `_16` son contadores de entrega de archivos, no versiones de producto.

## Cambios realizados en esta revisión

Solo se creó este informe. No se modificaron el documento recibido, el servidor, los tokens, los activadores ni las implementaciones de Google. Las correcciones anteriores están propuestas para la próxima edición del documento.
