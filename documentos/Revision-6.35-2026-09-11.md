# Revisión de la versión 6.35

Se revisó `Codigo_13.gs`, versión `v2026.6.35-VIDEOTECA-ETAPA2`, con SHA-256:

`B2CC259E1217AC6F67BE08FF36658723396317BE8A48288B42554E1C45555808`

Coincide con el prefijo anunciado en la entrega. La revisión fue local; no se instaló ni ejecutó esta versión en Google.

## Arreglos confirmados

Se ejecutaron las funciones reales contra servicios simulados y datos ficticios, mediante `revision_635_pruebas.cjs`:

- La rotación usa la cadena que devuelve el generador y registra el estado pendiente.
- La caducidad se copia como instante exacto; un token vencido se rechaza.
- Un fallo inyectado al guardar el estado pendiente deshace la emisión del sustituto en el caso probado.
- El activador de formulario conserva el identificador del formulario.
- La continuación de ingesta se recrea con el manejador nuevo.
- La combinación viejo+nuevo de una tarea no crea otro sustituto.
- Un reintento después de fallar el borrado del viejo reutiliza el nuevo.
- El texto de un titular que contiene `</script>` ya no se interpola en el HTML inicial.
- Existe una fila del panel para iniciar la rotación.

Estas verificaciones corrigen los casos concretos señalados anteriormente. No prueban todos los fallos posibles de persistencia ni ejecuciones concurrentes.

## 1. Dos activadores antiguos idénticos generan dos sustitutos — prioridad media

**Ubicación:** `inventariarDisparadores`, alrededor de la línea 2356, y el recorrido del inventario en `migrarDisparadoresANombresPrivados`, línea 2407.

La detección de duplicados solo cuenta los elementos que ya tienen nombre nuevo:

```js
.filter(k => porIdentidad[k]
  .filter(t => !RENOMBRADOS_6_34[t.funcion]).length > 1);
```

Con dos activadores viejos de la misma identidad, ambos tienen `yaSustituido: false` en la instantánea inicial. El recorrido crea un sustituto por cada viejo. Resultado reproducido: dos activadores `actualizarDashboardPeriodico_`, cero fallos informados.

**Corrección recomendada:** distinguir las cantidades de viejos y nuevos por identidad. Permitir un viejo y un nuevo como estado recuperable, pero bloquear más de uno de cualquiera de los dos tipos hasta resolver qué conservar:

```js
const duplicados = Object.keys(porIdentidad).filter(k => {
  const grupo = porIdentidad[k];
  const viejos = grupo.filter(t => Boolean(RENOMBRADOS_6_34[t.funcion])).length;
  const nuevos = grupo.length - viejos;
  return viejos > 1 || nuevos > 1;
});
```

Mantener la identidad completa (nombre normalizado, origen, evento y recurso), de modo que dos formularios distintos sigan siendo tareas distintas. Probar: dos viejos, dos nuevos, un viejo+un nuevo, dos formularios distintos. La primera combinación debe bloquear sin crear ni borrar activadores.

La operación aún no toma un bloqueo de script. Antes de permitir ejecuciones simultáneas del migrador, añadir exclusión durante la lectura y modificación del inventario, después de cualquier confirmación de interfaz.

## 2. El activador móvil no conserva el recurso original — prioridad media

**Ubicación:** receta `onEditControlMovilTrigger_`, alrededor de la línea 2284; comprobación de recurso en el migrador, alrededor de la línea 2417.

La receta de formulario recibe el recurso original, pero la del móvil sigue usando `SpreadsheetApp.getActiveSpreadsheet()`. Además, el requisito de recurso se decide mediante `receta.crear.length > 0`; como esa receta no declara parámetros, puede pasar sin recurso identificable.

**Reproducción:** activador viejo de edición asociado a `hoja-distinta`; hoja activa simulada `id`. La migración borra el viejo y crea el nuevo asociado a `id`, sin informar un error. Si ambos identificadores coinciden, este defecto no se manifiesta; el problema es cambiar silenciosamente de recurso cuando no coinciden.

**Corrección propuesta:**

```js
onEditControlMovilTrigger_: {
  tipo: "evento",
  descripcion: "al editar la hoja original",
  crear: recurso => {
    if (!recurso) throw new Error("Sin identificador de la hoja original.");
    return ScriptApp.newTrigger("onEditControlMovilTrigger_")
      .forSpreadsheet(recurso).onEdit();
  }
}
```

Exigir `d.recurso` para todas las recetas de tipo evento, sin deducirlo del número de parámetros. Si la aplicación solo permite trabajar sobre el libro activo, rechazar explícitamente otro recurso y conservar el activador, en lugar de reasignarlo. Probar recurso idéntico, distinto y ausente.

## Paquete y alcance de la revisión anterior

La afirmación anterior sobre la suite describía la carpeta extraída `pruebas_0`, no el contenido de un ZIP que no se había inspeccionado. Esa distinción es importante: no acredita que el ZIP original de la 6.34 estuviera mal armado.

En esta revisión la carpeta contiene el servidor 6.35 y el documento actualizado, pero no aparece un ZIP nuevo ni una extracción nueva de la suite; `pruebas_0` sigue siendo la extracción anterior. Por ello se confirma el hash del servidor, pero **no se verifican aquí las 802 comprobaciones anunciadas**. No se atribuye esta diferencia a un defecto del ZIP no disponible.

## Cómo repetir esta revisión

Desde la carpeta del proyecto:

```powershell
node .\revision_635_pruebas.cjs
```

El archivo distingue los arreglos comprobados de los dos defectos reproducidos. Su salida correcta confirma las observaciones, no la aprobación total del producto. Utiliza el simulador anterior únicamente como infraestructura y carga expresamente `Codigo_13.gs`.

**Siguiente paso recomendado:** corregir estos dos casos del migrador, entregar o extraer el paquete de pruebas exacto junto al servidor, y entonces validar esa versión en la copia de Apps Script. Mantener la decisión de no rotar `MASTER_SECRET_HMAC` en esta etapa. La validación real de la 6.32 permanece como evidencia histórica de aquella versión.
