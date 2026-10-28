# Revisión de la entrega 6.34

**Conclusión:** corregir los puntos siguientes antes de usar el migrador o la rotación en producción. La validación real anterior sigue acreditando los escenarios probados en la 6.32; no se ha instalado esta entrega en Google durante esta revisión.

Revisados: `Codigo_12.gs` (6.34), el documento de pendientes terminado en `_12.md` y el paquete `pruebas_0`. Se creó `revision_634_repros.cjs` con siete reproducciones locales sobre el código 6.34. No se modificaron los archivos del producto.

## 1. La rotación falla después de emitir el sustituto — prioridad alta

**Ubicación:** `generarTokenAdmin`, línea 3623; `rotarTokenExpuestoUI`, líneas 3707–3726.

El generador devuelve una cadena (`return nuevo`), pero la rotación trata su resultado como un objeto: `nuevo.token`, `nuevo.token.slice(...)`.

**Reproducción:** con un token administrador y otro de consulta ficticios, la función real emite un tercer token y luego lanza `Cannot read properties of undefined (reading 'slice')`. No se crea `TOKEN_ROTACION_PENDIENTE`. El sustituto ya existe, pero no se muestra y no queda la advertencia prometida. Si se rota el token de `ADMIN_TOKEN`, además se intenta escribir `undefined` en esa propiedad antes del fallo.

**Corrección mínima del contrato:** utilizar la cadena devuelta, sin cambiar el contrato del generador para todos sus otros llamadores:

```js
const nuevoToken = generarTokenAdmin(admin, client, scope, email, dias);
if (typeof nuevoToken !== "string" || !nuevoToken) {
  throw new Error("El generador no devolvió un token válido.");
}
// En esta función, usar nuevoToken en los tres lugares:
// ADMIN_TOKEN, nuevoPrefijo y el diálogo que muestra el sustituto.
```

Esto no basta para proteger los fallos intermedios de persistencia. Preparar el cambio del mapa, el estado pendiente y el atajo administrativo como una operación recuperable; si falla después de emitir, registrar o revertir explícitamente el sustituto. No dejar una emisión huérfana. Probar por separado la rotación de un token de consulta y del propio administrador, con errores inyectados entre los pasos.

**Otra precisión:** la expresión `Math.max(1, Math.ceil(...))` no conserva la caducidad exacta: puede ampliarla y da un día nuevo a un token vencido. Si la política es conservar la caducidad, copiar el instante `expira` original y rechazar la rotación de un token que ya no sea vigente, o tratar su renovación como una acción diferente y explícita.

## 2. El migrador borra tareas que necesitan continuidad — prioridad alta

**Ubicación:** `HORARIOS_DISPARADORES`, línea 2259; rama `if (!receta)` del migrador, línea 2353.

La ausencia de receta se interpreta como «temporal» y autoriza borrar el activador sin sustituto. Esa clasificación es incorrecta para `registrarRespuestaFormularioCentralizado`: es un activador de envío vinculado a un formulario. La reproducción lo elimina y devuelve cero fallos.

También se elimina la continuación pendiente de `procesarColaConAntiTimeout` sin programar su equivalente privado. Que el código sepa crear otra continuación no implica que vaya a ejecutarse después de eliminar la única que lo iba a despertar. El mismo análisis se necesita para embeddings y la cola de tareas. Esta última tiene una revisión horaria mientras queda trabajo, según `asegurarTriggerCola`.

**Cómo corregirlo:**

1. Separar expresamente tres tipos: periódicos, eventos de hoja/formulario y continuaciones de trabajo pendiente.
2. Para formularios, conservar `recurso` y evento; crear el nuevo manejador para el mismo formulario antes de retirar el anterior. Si no se puede identificar el recurso, no borrar nada y devolver un fallo accionable.
3. Para continuaciones, comprobar el checkpoint o el estado de la cola y programar el nuevo manejador sin ejecutar el trabajo durante la migración. Si no se puede preservar la continuidad, detener la migración de ese elemento y explicar cómo reanudarlo.
4. Una función sin clasificación conocida debe quedar intacta y aparecer como pendiente de resolución; no debe asumirse que es desechable.

La API de Google permite consultar el origen, tipo de evento e identificador del recurso del activador: [referencia oficial de Trigger](https://developers.google.com/apps-script/reference/script/trigger).

## 3. La migración no es segura frente a reintentos — prioridad alta

**Ubicación:** detección de duplicados, línea 2311; creación y borrado, líneas 2373–2383.

Se cuentan duplicados por el nombre literal. Si existe uno viejo y otro nuevo para el mismo trabajo, el inventario dice que no hay duplicados. El migrador crea un segundo nuevo y borra el viejo.

La misma situación aparece si se crea correctamente el nuevo y falla el borrado del viejo. Repetir la operación vuelve a crear otro. Ambas secuencias están reproducidas.

**Cómo corregirlo:**

- Normalizar primero el nombre: `RENOMBRADOS_6_34[nombre] || nombre`.
- Definir la identidad de la tarea con nombre normalizado, origen, evento y recurso. Dos formularios diferentes pueden tener legítimamente el mismo manejador; no deben bloquearse solo por compartir nombre.
- Volver a consultar el inventario bajo un bloqueo de script antes de modificarlo; no mantener el bloqueo durante un diálogo de confirmación.
- Si ya hay un sustituto compatible, no crear otro. Resolver y verificar el retiro del viejo.
- Conservar el ID creado y registrar estados parciales: «nuevo creado, viejo pendiente de borrar».
- Probar migración repetida y fallos al crear, al borrar y al consultar el inventario.

**Matiz del supuesto respaldo:** conservar el activador viejo no conserva una tarea operativa si su función ya fue eliminada del código. El informe del migrador debe indicar esa situación y el procedimiento de reversión; no afirmar que conservar el registro basta para evitar la interrupción.

## 4. El panel todavía permite inyectar un cierre de script — prioridad alta

**Ubicación:** `abrirPanelConfiguracion`, línea 24503.

`esc()` protege varios textos cuando se genera su HTML, pero se ejecuta demasiado tarde para los datos iniciales:

```js
var SECCIONES = ${JSON.stringify(secciones)};
```

Ese JSON se incrusta directamente dentro de un `<script>`. Un titular con `</script><script>...</script>` llega sin escapar al HTML generado. La reproducción usa una marca inocua y confirma el contenido del documento generado; no se ejecutó una explotación en Google ni se acreditó una vía de escritura anónima. La consecuencia depende de quién pueda controlar esos valores, pero el contexto de inserción es inseguro.

**Corrección preferida:** obtener los datos iniciales con `google.script.run.estadoConfiguracion()` y pintar en su manejador de éxito, sin interpolar JSON en el HTML. Mostrar carga y error recuperable.

**Alternativa si se mantiene la inserción:** serializar en el servidor de forma segura para un elemento script:

```js
const datosIniciales = JSON.stringify(secciones)
  .replace(/</g, "\\u003c")
  .replace(/\u2028/g, "\\u2028")
  .replace(/\u2029/g, "\\u2029");
// Interpolar datosIniciales en lugar del JSON sin transformar.
```

Para construir filas, preferir `textContent`, `createElement` y `setAttribute` a concatenaciones de HTML. Las pruebas deben incluir `</script>`, comillas y ampersands tanto en la carga inicial como después del refresco. La lista cerrada de acciones debe mantenerse; Google documenta la comunicación asíncrona y la inaccesibilidad de las funciones con guion bajo final desde `google.script.run`: [documentación oficial](https://developers.google.com/apps-script/guides/html/communication).

## 5. Falta el acceso visible para iniciar la rotación — prioridad media

**Ubicación:** lista de acciones permitidas, línea 24264, y sección «Portal y accesos» de `estadoConfiguracion`, línea 24443.

`rotarTokenExpuestoUI` está en la lista permitida del puente, pero no hay una fila que la invoque. La búsqueda de referencias solo encuentra su declaración, guarda y permiso. La función que abre «Tokens de acceso» ofrece generar un token; no ofrece rotarlo. El botón para finalizar aparece si hay un estado pendiente, pero no existe el paso visible para iniciarlo.

**Corrección:** añadir una fila en «Portal y accesos»:

```js
{ fn: "rotarTokenExpuestoUI", et: "Sustituir un token expuesto",
  accion: "Iniciar rotación", neutro: true }
```

Aplicar primero la corrección del punto 1. Probar el recorrido completo desde el panel, sin lanzar funciones manualmente desde el editor.

## 6. El paquete entregado no acredita las 790 comprobaciones

En la carpeta revisada:

- `Codigo_12.gs` declara 6.34. SHA-256: `822FBBED7A27F432CF70814BB3DDA003C9CFF79E7327000CF11D602C70D66C2F`.
- `pruebas_0/GAS_v2026.5.0.js` coincide exactamente con `Codigo_11.gs`, la 6.33. SHA-256: `BDE0E98604F7D8C19491D768C026FF4AEF6DDDE01639C8C3A2E46FC2693B149A`.
- Sus 18 archivos con comprobaciones suman **761 aprobadas, cero fallidas**. `probe_taxo.js` es un diagnóstico sin comprobaciones y terminó correctamente al ejecutarse desde su carpeta, como indica el LEEME.
- Por tanto, no puedo confirmar aquí las **790** ni su ejecución sobre la 6.34. No implica que no existan en otra máquina; faltan en este paquete.

**Entrega necesaria:** empaquetar el servidor exacto 6.34 corregido, sus pruebas actualizadas y los casos anteriores; publicar el hash del servidor probado y el total real. No limitarse a cambiar la cifra en el LEEME. El documento `_12.md` también conserva una advertencia de líneas referidas a la 6.32: actualizarla o sustituir las referencias por nombres de funciones.

## Reproducción y siguiente paso

Desde la carpeta de esta revisión:

```powershell
node .\revision_634_repros.cjs
```

Ejecuta las funciones reales de `Codigo_12.gs` con servicios simulados y datos ficticios. Sus siete escenarios comprueban que los problemas descritos se presentan; que termine correctamente significa que reprodujo los defectos, no que el producto esté aprobado. Tras corregir el producto deben convertirse en pruebas de la conducta esperada.

Orden recomendado: corregir rotación y serialización; hacer recuperable e idempotente el migrador; añadir el acceso visible; entregar el paquete exacto; después revalidar en la copia de Apps Script antes de configurar producción o publicar. Mantener la decisión del usuario de no rotar `MASTER_SECRET_HMAC` en esta etapa.
