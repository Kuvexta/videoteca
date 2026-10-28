# Panel: identidad y avisos — validación real del 11/09/2026

## Cierre comprobado a las 19:55 — sesión única

Después de cerrar la sesión SST, la cuenta de Google mostró Andrés activo y SST como «Saliste de tu cuenta». Se recargó producción y se repitió el mismo diagnóstico desde el panel.

Resultado de las **19:55:33,817 de Bogotá**: usuario activo y efectivo Andrés; proyecto y libro de producción correctos; los tres activadores privados presentes; obtención de Ui correcta. Esta vez **el aviso apareció en la hoja y se cerró con Aceptar**. La respuesta regresó a la página con `alerta.ok: true` y `dialogo cerrado`. Evidencia: `DIAGNOSTICO_PANEL_SESION_UNICA_2026-09-11.json`.

Además se ejecutó el botón original «Ver los disparadores instalados», sin modificar su función: mostró un diálogo con **3**, los nombres `ejecutarMantenimientoSemanal_`, `actualizarDashboardPeriodico_` y `crearBackupAutomatico_`, y «Ninguno con nombre anterior».

Por tanto, la discrepancia observada queda resuelta en sesión única. No se sostiene la conclusión general de que el panel no puede mostrar diálogos: funcionó bajo Andrés. La revisión no ensayó `ui.prompt`, rotación ni todas las confirmaciones de las demás acciones; no se les atribuye esa validación por extensión.

Se retiró nuevamente el diagnóstico y se comprobó por lectura íntegra del editor la igualdad exacta con el texto previo al ensayo y la coincidencia con la candidata 6.37 normalizando retornos de carro. El panel temporal se cerró. No se modificaron activadores, credenciales, manifiesto ni publicación. La evidencia de las 19:50 que sigue se conserva como historia del contraste entre sesiones.

Regla operativa: administrar este proyecto con una sola cuenta iniciada, la responsable de sus activadores. No ampliar permisos como solución a la mezcla de sesiones. Canal definitivo, rotación y publicación siguen siendo operaciones pendientes distintas.

## Resultado

La identidad dejó de ser una hipótesis. Una llamada del panel de herramientas de producción, a las **19:50:49 de Bogotá**, devolvió a la propia página:

| Comprobación | Resultado |
|---|---|
| Usuario activo | sstconsultorescolombia@gmail.com |
| Usuario efectivo | sstconsultorescolombia@gmail.com |
| Cuenta mostrada en el encabezado de Sheets | andressuarezcarmona@gmail.com |
| Proyecto | 1pv0v0_r60zn8rLc614fewTK6qS7BPYgNpr0d5LMvSmIAU_fC4YUEN4tZ — producción |
| Libro activo | 1d3H1ZngdEKAacqYG2Ya3W6geY_UrWWThIuwA5Itc57I — producción |
| Activadores de la cuenta ejecutora | Lista vacía |
| Obtener objeto Ui | Correcto |
| Mostrar ui.alert | Error de acceso |

Error exacto capturado: `You do not have access to perform that action. Please ask the owner of this item to grant access to you.`

La evidencia devuelta se conserva en `DIAGNOSTICO_PANEL_2026-09-11.json`. No contiene valores de propiedades, tokens ni claves de proveedor.

## Qué corrige del documento pendiente 28

1. El cero es coherente con la cuenta realmente ejecutora, que no tenía activadores propios en el inventario. No es una pérdida de los tres activadores de Andrés.
2. Obtener Ui y poder mostrar un aviso son comprobaciones distintas: en esta ejecución la primera funcionó y la segunda falló.
3. No queda demostrada una incapacidad general de los paneles para mostrar avisos. La excepción real es de permisos y apareció bajo la identidad equivocada. Hay que repetir con una sesión de una sola cuenta antes de atribuir ambos síntomas a defectos independientes del producto.
4. `preguntarUsuario` no captura un error de `ui.alert`. Si ocurre, la operación aborta; no concede confirmación automáticamente. Esto se verificó en el código, sin intentar revocar ni emitir tokens reales. La emisión de sustitutos usa además `ui.prompt` directamente; no se ensayó en esta revisión.
5. El menú puede ser una vía de contingencia, pero su encabezado tampoco sustituye una comprobación de usuario activo y efectivo antes de una operación sensible.

Google documenta que iniciar sesión simultáneamente en varias cuentas no está soportado en Apps Script y recomienda una sesión privada con una sola cuenta o cerrar las demás sesiones: https://developers.google.com/apps-script/guides/support/troubleshooting . La mezcla de cuentas observada concuerda con esa limitación. Todavía no se realizó la comparación en sesión única.

## Intervención y limpieza

Se agregó temporalmente un botón al panel y una función de diagnóstico protegida por contexto de hoja y el ID exacto del proyecto. Solo consultaba identidades, IDs, nombres de activadores y Ui, y probaba un aviso sin efectos de negocio. El resultado regresaba mediante `withSuccessHandler` y se dibujaba con `textContent`, sin depender de `alertarUsuario` ni de registros.

Después se restauró íntegramente el servidor anterior. La lectura del editor coincidió exactamente con la lectura previa al diagnóstico; coincide con `Codigo_15.gs` normalizando únicamente retornos de carro. Se comprobó la ausencia de la función temporal. El panel temporal se cerró. No se cambió Index.html, el manifiesto, los activadores, las credenciales ni la implementación publicada.

Servidor candidato local conservado: SHA-256 `4e76e36efa3dcdb825532a7ac193b6f4d2e6450154daa321a594f4c8eb94170f`. La sintaxis de la fuente temporal se verificó antes de instalarla. No se atribuye a ese añadido la suite de 818 comprobaciones de la candidata.

## Continuación necesaria

1. Abrir producción en una sesión con **solo andressuarezcarmona@gmail.com**, sin SST simultáneamente. No ampliar permisos del libro para ocultar el síntoma.
2. Repetir el diagnóstico de la misma llamada del panel: ambas identidades deben ser Andrés, proyecto/libro correctos y tres activadores. Comprobar también si el aviso se muestra y se puede cerrar.
3. Si el aviso sigue fallando con esa identidad, entonces investigar y corregir su transporte como problema independiente. Si funciona, documentar la limitación de sesión múltiple y valorar una comprobación explícita de identidad en acciones administrativas.
4. Retirar otra vez el diagnóstico y comprobar el contenido final antes de avanzar al canal definitivo, rotación de credenciales y validación/publicación del portal. Esas operaciones siguen pendientes; no se dieron por completadas con este ensayo.

La ejecución automática de `actualizarDashboardPeriodico_` a las 19:27:34, 3,363 s, Completada, permanece acreditada. Los dos trabajos semanales siguen pendientes de evidencia real.
