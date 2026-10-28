# Validación real en Apps Script — versión 6.32

Fecha: 11 de septiembre de 2026. Horas de Colombia (UTC−05:00).

**Resultado:** pasaron las pruebas de fallo de escritura parcial, límite de reintentos, aviso en el panel, reanudación manual y recuperación automática tras un fallo de guardado final. La recepción del correo quedó confirmada mediante la captura aportada por el usuario después de la prueba. Esta validación corresponde a la copia y a estos escenarios; no certifica toda la aplicación ni la versión publicada.

## 1. Entorno utilizado

- Hoja: [Videoteca — PRUEBAS 6.32.](https://docs.google.com/spreadsheets/d/1NLEEPZLHtTlieIQGx62V73kYGYmtAv4_rTHQpDvg6jE/edit).
- Proyecto vinculado: [Proyecto de pruebas en Apps Script](https://script.google.com/u/0/home/projects/1IZOJFAYbRSwLRIFouPYGQAC4ths6IGBAKUSYHJKOvMgL3vgFn7AjSckZ/edit).
- Código comprobado: versión 6.32; archivos del proyecto `Código.gs` e `Index.html`.
- Hoja de catálogo: `Videos - Capacitación`. Última fila con datos antes y después: **4972**.
- Cuenta ejecutora del navegador: `sstconsultorescolombia@gmail.com`.
- Destino autorizado para el aviso de prueba: `andressuarezcarmona@gmail.com`.

No se publicó ninguna versión ni se cambiaron las credenciales del sistema. Tampoco se migraron los disparadores de producción. Los activadores temporales de esta validación pertenecían al proyecto de pruebas.

## 2. Método

Se añadieron temporalmente 30 filas pendientes, de la 4973 a la 5002, con direcciones de YouTube obtenidas del propio catálogo. Estas filas sí requerían enriquecimiento y escritura: la prueba no consistió en recorrer un catálogo ya resuelto.

Se insertó una excepción condicionada por `SIMULAR_FALLO_ESCRITURA` inmediatamente **antes** de las dos escrituras de la cola: el volcado parcial y el guardado final. La excepción se introdujo solamente en la copia. Se utilizó la función real de procesamiento con los servicios reales de Google y los activadores creados por esa función.

Se respaldaron las propiedades que se modificaron para la prueba. El correo se habilitó temporalmente para el único destinatario autorizado; Telegram y los webhooks se deshabilitaron temporalmente. Al terminar se restauraron los valores anteriores.

## 3. Resultados observados

| Comprobación | Evidencia real | Resultado |
|---|---|---|
| Fallo en el volcado parcial | Ejecución inicial 15:24:39. El registro indicó fallo del avance parcial, retorno `falloPersistencia: true` y continuación instalada. | Aprobada |
| Conservación del punto seguro | A las 15:26:19, checkpoint `4973`, contador `1`, 30 filas sin ID ni título y un activador de continuación. | Aprobada |
| Reintentos automáticos reales | Ejecuciones basadas en tiempo a las 15:26:20, 15:28:15 y 15:29:46. No se sustituyeron por llamadas manuales sucesivas. | Aprobada |
| Parada tras un intento y tres reintentos | La última ejecución registró cuatro fallos seguidos y eliminó el activador. Conservó el checkpoint en 4973. | Aprobada |
| Aviso visible | El panel mostró «🚨 ATENCIÓN» antes de la configuración de IA y «Ingesta detenida en la fila 4973». | Aprobada |
| Reanudación desde el panel | Se desactivó la simulación, se pulsó el control del aviso y se confirmó «Sí». La ejecución de `lanzarAccionConfig` comenzó a las 15:32:02. | Aprobada |
| Datos después de reanudar | A las 15:32:33: 30 filas con ID, 30 con título; checkpoint, contador, aviso y simulación ausentes; ningún activador. | Aprobada |
| Fallo del guardado final | Con cinco filas pendientes, la ejecución de las 15:33:11 registró «Falló el guardado final del bloque», cero procesados declarados y continuación instalada desde 4973. | Aprobada |
| Ningún avance ficticio tras ese fallo | A las 15:34:46: cinco filas sin ID ni título, checkpoint `4973`, contador `1` y activador presente. La simulación ya estaba desactivada. | Aprobada |
| Recuperación automática | El activador de las 15:35:10 registró cinco filas enriquecidas y actualizadas, y eliminó su continuación. | Aprobada |
| Limpieza automática del estado | A las 15:35:59: cinco filas con ID y título; checkpoint, contador y aviso ausentes; ningún activador. | Aprobada |
| Recepción del correo | El usuario aportó una captura del mensaje recibido a las 15:30, enviado por `sstconsultorescolombia@gmail.com`, asunto `[Videoteca] Evento: ingesta_detenida`, con `fila: 4973` y `fallos: 4`. Coincide con la parada observada en Apps Script. | **Aprobada** |

Un estado «Completada» en Apps Script no demuestra por sí solo el éxito funcional: estas excepciones deliberadas se gestionan dentro del código. Las conclusiones anteriores se apoyan en los registros, las filas escritas, las propiedades y los activadores, no solo en esa etiqueta.

## 4. Limpieza comprobada

La ejecución de limpieza de las 15:36:24 confirmó a las 15:36:27:

```json
{
  "restaurado": true,
  "propiedadesRestauradas": true,
  "respaldoTemporalEliminado": true,
  "filasTemporalesVacias": true,
  "ultimaFila": 4972,
  "triggers": []
}
```

Además:

- Se restauró el texto original completo de `Código.gs` y se comparó con el respaldo tomado del editor: coincidencia exacta normalizando únicamente los saltos de línea.
- La búsqueda de `SIMULAR_FALLO_ESCRITURA` en el código restaurado dio **cero coincidencias**.
- Se eliminó el archivo auxiliar `Sin título.gs`. El proyecto volvió a mostrar solamente `Código.gs` e `Index.html` como archivos de trabajo.
- Al reabrir el panel desapareció la sección de ingesta detenida.
- Se conservaron los registros de ejecución como evidencia. No se borró el historial de la prueba.

La restauración de propiedades incluye la configuración de correo anterior: el envío habilitado para esta prueba no queda instalado como configuración permanente.

## 5. Recomendaciones concretas

### Canal de avisos: recepción confirmada en la copia

La captura del usuario muestra el correo en Recibidos y confirma el evento, la fila y el número de fallos esperados. Con ello se cierra la comprobación de recepción que estaba pendiente. Evidencia aportada: `codex-clipboard-295019c5-a0d4-4fdd-8b5e-7d490a879668.png`.

Para producción, configurar expresamente el canal definitivo y comprobarlo bajo la cuenta que será propietaria de sus activadores. La configuración temporal de esta copia no sustituye ese paso.

### Mejoras pequeñas del panel

El control que reanuda la ingesta aparece con la etiqueta genérica **«Configurar»**. Funcionó, pero conviene cambiarla a **«Reanudar ingesta»** para que la acción sea evidente.

El panel que ya estaba abierto conservó la información anterior hasta cerrarlo y abrirlo de nuevo. Conviene actualizar el estado del panel cuando finalice la reanudación y mostrar su resultado. Mientras no se cambie, cerrar y reabrir el panel es la forma comprobada de consultar su estado actualizado.

Estas son recomendaciones de interfaz; no se modificó el código de producto para aplicarlas durante la validación.

### Siguiente etapa

1. Configurar el canal definitivo de avisos en producción; la recepción en la copia ya está confirmada.
2. Continuar el documento `PENDIENTE_Etapa2_Disparadores_Credenciales_Publicacion_10.md` para la migración de disparadores, verificando los nombres de función realmente presentes en el código que se vaya a instalar.
3. Sustituir las credenciales expuestas con el procedimiento que contempla sus dependencias. No reemplazar una clave de firma de forma aislada sin resolver los valores que dependen de ella.
4. Comprobar el portal y sus permisos en la implementación que se vaya a utilizar; esta prueba se realizó sobre el código del editor de la copia.
5. Publicar solo después de completar esas verificaciones. En esta sesión no se actualizó ninguna implementación.

## 6. Límites de esta validación

No se provocaron cortes duros por tiempo, conexiones de red colgadas, fallos durante `flush()`, escrituras parcialmente aplicadas por el servicio ni concurrencia entre varios usuarios. La excepción utilizada ocurrió antes de `setValues`. Tampoco se ejecutaron los trabajos semanales de mantenimiento o backup ni una auditoría completa de seguridad del portal.

La validación sí aporta evidencia real para los dos caminos de fallo de escritura probados, los reintentos, la parada, el panel y las dos formas de recuperación descritas. No convierte las comprobaciones de servicios simulados de la suite en pruebas de todas las condiciones de Google.
