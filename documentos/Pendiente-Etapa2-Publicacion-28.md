# Etapa 2 pendiente: disparadores, credenciales y publicación

**Proyecto:** Videoteca Certificable — Kuvexta
**Código:** `v2026.6.37-VIDEOTECA-ETAPA2`
**Qué es esto:** lo que queda por hacer y que **no se puede hacer desde fuera de Apps
Script**.

El código ya trae las herramientas: los diez manejadores están renombrados, hay un
inventario y un migrador de disparadores, una rotación de tokens en dos pasos y una prueba
del canal de avisos. **Se validaron en una copia real el 11/9 los escenarios que detalla
§6.bis** —no todas las combinaciones: la rotación probada fue la de un token temporal de
consulta, y de los diez manejadores se vio ejecutarse uno—. Ejecutarlas sobre producción
sigue siendo tuyo, y el orden de abajo no cambia.

---

## 1. Por qué esta etapa no se hizo con las demás

El guion bajo final es lo único que Apps Script reconoce como privado frente a
`google.script.run`. Pero **cambiar el instalador no toca los disparadores que ya
existen**: un disparador guarda el nombre de la función como texto. Si el código deja de
tener ese nombre, el disparador sigue ahí, se ejecuta a su hora y falla — en silencio,
porque no hay nadie delante. El mantenimiento semanal deja de correr y las copias de
seguridad dejan de hacerse, y eso se descubre el día que hace falta una copia.

Eso no se comprueba desde fuera: se hace con el proyecto delante, en una copia, y
verificando disparador por disparador.

## 2. Los tres disparadores de producción — inventario cerrado el 11/9

Inventario levantado el 11/9/2026 sobre «Proyecto Videoteca BD»
(`1pv0v0_r6…EN4tZ`), leyendo cada diálogo de edición y cerrando con **Cancelar**. Los tres
pertenecen a `andressuarezcarmona@gmail.com`; consultado también desde
`sstconsultorescolombia@gmail.com`, que no tiene ninguno propio. Solo existen esas dos
cuentas con acceso. Aviso de fallos **una vez al día** en los tres, zona horaria
`America/Bogota` (GMT−05:00):

| Función actual | Nombre al migrar | Programación |
|---|---|---|
| `actualizarDashboardPeriodico` | `actualizarDashboardPeriodico_` | cada hora |
| `ejecutarMantenimientoSemanal` | `ejecutarMantenimientoSemanal_` | domingos, 03:00–04:00 |
| `crearBackupAutomatico` | `crearBackupAutomatico_` | domingos, 23:00–00:00 |

Un intervalo horario **no garantiza el minuto**: al recrear el disparador, el minuto
efectivo puede cambiar dentro de la franja. No prometas que se conservará el `:44` que
aparece en las ejecuciones anteriores.

Los tres horarios **coinciden** con las recetas del migrador —`everyHours(1)`, domingo
`atHour(3)`, domingo `atHour(23)`—: recrearlos conserva la programación prevista,
frecuencia y franja. El **minuto efectivo puede cambiar**, como dice el párrafo anterior:
lo que se conserva es el plan, no el instante.

Una precisión que costó descubrir y que corrige lo que decía antes este documento: la
**pantalla** de activadores sí muestra los de otras cuentas, marcados como «Otro usuario»
—se ven, pero no se pueden abrir ni editar—. Lo que solo devuelve los de la cuenta actual
es la **API**: `ScriptApp.getProjectTriggers()`. De ahí la regla del §5 sobre con qué
cuenta se ejecuta el migrador.

## 3. Los temporales, que no salen en esa pantalla

`procesarColaConAntiTimeout` se creó y ejecutó por código el 10/9 — está en el registro de
ejecuciones aunque no aparezca en la lista de disparadores, porque se crea, corre y se
borra. `continuarEmbeddingsCatalogo` hace lo mismo. Sus creadores también usan el nombre
como texto, así que también hay que actualizarlos.

Y una advertencia del informe que conviene repetir: **no instalar un disparador solo
porque la función existe en el código**. Actualizar el creador para que use el nombre
nuevo no es lo mismo que dejar la tarea programada.

### Lo que el inventario del 11/9 dejó a la vista: siete manejadores sin disparador

Diez manejadores renombrados, tres disparadores instalados. Los siete restantes **no son
todos el mismo caso**, y confundirlos lleva a instalar lo que no debe instalarse.

**Tres se gestionan solos. Su ausencia no es un dato por sí misma.**

| Función | Cómo se gestiona |
|---|---|
| `procesarColaTareasSilencioso` | `encolarTareaDiferida` → `asegurarTriggerCola()` lo instala cuando entra trabajo; el propio manejador se retira al quedar la cola sin pendientes |
| `procesarColaConAntiTimeout` | continuación de la ingesta: el código la programa al quedarse sin presupuesto |
| `continuarEmbeddingsCatalogo` | continuación de los embeddings, igual |

Para estos tres la pregunta correcta no es «¿está?», sino **«¿está cuando toca?»**. Y la
ausencia no *significa* nada por sí sola: significa que **hay que ir a consultar el
estado** del trabajo que le corresponde. Presente con todo vacío tampoco es grave —se
retira solo en la siguiente pasada—.

Antes de concluir que se perdió una continuación, cuatro comprobaciones, en este orden:

1. **El checkpoint**: hasta qué fila llegó y cuándo.
2. **Si hay una ejecución en curso** ahora mismo, en el registro de ejecuciones. Un
   trabajo corriendo no necesita un disparador esperando.
3. **`INGESTA_DETENIDA`** y la sección «🚨 Atención» del panel. La ingesta se para
   **a propósito** tras cuatro fallos de escritura consecutivos y deja el checkpoint
   puesto esperando reanudación manual: eso es el mecanismo funcionando, no una
   continuación perdida.
4. **El contador de reintentos**, que dice en qué punto de esos cuatro va.

El orden importa porque el diagnóstico tiene efectos: reanudar una ingesta que se detuvo
a propósito, o relanzar una que ya está corriendo, es peor que dejarla como está. Para la
cola de tareas, el equivalente es mirar `_Tareas_Pendientes`: filas en PENDIENTE sin
disparador y sin ejecución en curso es el caso que sí pide intervención.

Nota sobre `procesarColaTareasSilencioso` y la ventana de instalación: `asegurarTriggerCola()`
busca el nombre **nuevo**, así que si entra una tarea entre instalar la 6.37 y migrar,
instalará un segundo disparador con el nombre nuevo mientras el viejo sigue ahí. No es
grave: el migrador identifica las tareas por nombre normalizado, verá que el sustituto ya
existe y se limitará a retirar el viejo. Pero explica por qué los pasos 5 y 6 van seguidos.

**Cuatro no corren solos y nadie los instala.**

| Función | Lo que haría | Estado |
|---|---|---|
| `exportarCatalogoAJsonSilencioso` | cada 6 horas | sin disparador |
| `disparadorNocturnoFase2` | diario a las 02:00 | sin disparador |
| `onEditControlMovilTrigger` | al editar la hoja de origen | sin disparador |
| `registrarRespuestaFormularioCentralizado` | al enviarse el formulario | sin disparador |

Nada de esto bloquea la migración: el migrador sustituye lo que hay y **nunca crea lo que
falta**, así que el paso es igual de seguro con tres que con diez. Lo que hay que decidir
aparte —y después, no ahora— es si estas cuatro ausencias son deliberadas.

## 4. Las diez funciones y todas sus referencias

> Números de línea **regenerados contra la 6.37**, y con los nombres ya migrados
> (`…_`). Cambian con cada edición del servidor: si el archivo que tienes delante
> no es exactamente ese, búscalas por nombre y no por línea.

Cada nombre vive en más sitios que su declaración: el instalador, la tabla del panel que
comprueba si el disparador está puesto, las comparaciones con `getHandlerFunction()`, la
hoja «Acciones Movil» que lo busca por texto, y el código que reprograma una continuación.
Renombrar sin tocarlos todos deja el sistema a medias.

### `ejecutarMantenimientoSemanal_`  — 9 referencias

```
   2032: function ejecutarMantenimientoSemanal_() {
   2105: const purgados = ejecutarMantenimientoSemanal_();
   2241: ejecutarMantenimientoSemanal: "ejecutarMantenimientoSemanal_",
   2276: ejecutarMantenimientoSemanal_: { tipo: "periodico", descripcion: "domingos a las 03:00
   2277: crear: () => ScriptApp.newTrigger("ejecutarMantenimientoSemanal_")
   2579: ScriptApp.newTrigger("ejecutarMantenimientoSemanal_")
   2581: "ejecutarMantenimientoSemanal_"
   22733: else if (accion.indexOf("Mantenimiento") !== -1) ejecutarMantenimientoSemanal_();
   24604: { fn: "programarMantenimientoSemanal", et: "Mantenimiento semanal", ok: !!trig["ejecut
```

### `actualizarDashboardPeriodico_`  — 7 referencias

```
   2242: actualizarDashboardPeriodico: "actualizarDashboardPeriodico_",
   2274: actualizarDashboardPeriodico_: { tipo: "periodico", descripcion: "cada hora",
   2275: crear: () => ScriptApp.newTrigger("actualizarDashboardPeriodico_").timeBased().everyHo
   2591: ScriptApp.newTrigger("actualizarDashboardPeriodico_").timeBased().everyHours(1),
   2592: "actualizarDashboardPeriodico_"
   20755: function actualizarDashboardPeriodico_() {
   24602: { fn: "instalarTriggerDashboard", et: "Refrescar el panel solo", ok: !!trig["actualiza
```

### `crearBackupAutomatico_`  — 10 referencias

```
   2243: crearBackupAutomatico: "crearBackupAutomatico_",
   2279: crearBackupAutomatico_: { tipo: "periodico", descripcion: "domingos a las 23:00",
   2280: crear: () => ScriptApp.newTrigger("crearBackupAutomatico_")
   2601: ScriptApp.newTrigger("crearBackupAutomatico_")
   2603: "crearBackupAutomatico_"
   5319: parte.backupUrl = crearBackupAutomatico_();
   22734: else if (accion.indexOf("Backup") !== -1) crearBackupAutomatico_();
   23471: function crearBackupAutomatico_() {
   23483: crearBackupAutomatico_();
   24603: { fn: "instalarDisparadorBackupSemanal", et: "Copia de seguridad semanal", ok: !!trig[
```

### `exportarCatalogoAJsonSilencioso_`  — 12 referencias

```
   2244: exportarCatalogoAJsonSilencioso: "exportarCatalogoAJsonSilencioso_",
   2282: exportarCatalogoAJsonSilencioso_: { tipo: "periodico", descripcion: "cada 6 horas",
   2283: crear: () => ScriptApp.newTrigger("exportarCatalogoAJsonSilencioso_").timeBased().ever
   2612: ScriptApp.newTrigger("exportarCatalogoAJsonSilencioso_").timeBased().everyHours(6),
   2613: "exportarCatalogoAJsonSilencioso_"
   2638: if (procesados > 0) exportarCatalogoAJsonSilencioso_();
   21240: exportarCatalogoAJsonSilencioso_();
   21244: function exportarCatalogoAJsonSilencioso_() {
   21294: exportarCatalogoAJsonSilencioso_();
   23177: exportarCatalogoAJsonSilencioso_();
   23231: exportarCatalogoAJsonSilencioso_();
   24608: { fn: "instalarDisparadorSincronizacionAgentes", et: "Sincronizar con agentes", ok: !!
```

### `disparadorNocturnoFase2_`  — 7 referencias

```
   2245: disparadorNocturnoFase2: "disparadorNocturnoFase2_",
   2284: disparadorNocturnoFase2_: { tipo: "periodico", descripcion: "todos los días a las 02:0
   2285: crear: () => ScriptApp.newTrigger("disparadorNocturnoFase2_").timeBased().everyDays(1)
   2625: ScriptApp.newTrigger("disparadorNocturnoFase2_").timeBased().everyDays(1).atHour(2),
   2626: "disparadorNocturnoFase2_"
   2633: function disparadorNocturnoFase2_() {
   24605: { fn: "programarProcesoNocturnoIA", et: "Proceso nocturno de IA", ok: !!trig["disparad
```

### `onEditControlMovilTrigger_`  — 8 referencias

```
   2246: onEditControlMovilTrigger: "onEditControlMovilTrigger_",
   2294: onEditControlMovilTrigger_: { tipo: "evento", exigeRecurso: true,
   2300: return ScriptApp.newTrigger("onEditControlMovilTrigger_")
   2648: ScriptApp.newTrigger("onEditControlMovilTrigger_").forSpreadsheet(SpreadsheetApp.getAc
   2649: "onEditControlMovilTrigger_"
   22702: function onEditControlMovilTrigger_(e) {
   22813: .some(trg => trg.getHandlerFunction() === "onEditControlMovilTrigger_");
   24607: { fn: "instalarTriggerMovilManual", et: "Hoja de control móvil", ok: !!trig["onEditCon
```

### `procesarColaTareasSilencioso_`  — 9 referencias

```
   2247: procesarColaTareasSilencioso: "procesarColaTareasSilencioso_",
   2286: procesarColaTareasSilencioso_: { tipo: "periodico", descripcion: "cada hora",
   2287: crear: () => ScriptApp.newTrigger("procesarColaTareasSilencioso_").timeBased().everyHo
   2840: .some(trg => trg.getHandlerFunction() === "procesarColaTareasSilencioso_");
   2843: ScriptApp.newTrigger("procesarColaTareasSilencioso_").timeBased().everyHours(1),
   2844: "procesarColaTareasSilencioso_"
   2852: function procesarColaTareasSilencioso_() {
   2862: limpiarTriggersPorFuncion("procesarColaTareasSilencioso_");
   24606: { fn: "programarColaTareas", et: "Procesar la cola sola", ok: !!trig["procesarColaTare
```

### `procesarColaConAntiTimeout_`  — 13 referencias

```
   2134: const eliminados = limpiarTriggersPorFuncion("procesarColaConAntiTimeout_");
   2248: procesarColaConAntiTimeout: "procesarColaConAntiTimeout_",
   2314: procesarColaConAntiTimeout_: { tipo: "continuacion",
   2316: crear: () => ScriptApp.newTrigger("procesarColaConAntiTimeout_").timeBased().after(60 
   12057: function procesarColaConAntiTimeout_(silencioso = false) {
   12313: ScriptApp.newTrigger("procesarColaConAntiTimeout_").timeBased().after(60 * 1000),
   12314: "procesarColaConAntiTimeout_"
   12328: procesarColaConAntiTimeout_(false);
   12336: procesarColaConAntiTimeout_(false);
   12349: procesarColaConAntiTimeout_(false);
   23223: procesarColaConAntiTimeout_(true);
   24538: const r = procesarColaConAntiTimeout_(false);
   24606: { fn: "programarColaTareas", et: "Procesar la cola sola", ok: !!trig["procesarColaTare
```

### `continuarEmbeddingsCatalogo_`  — 9 referencias

```
   2249: continuarEmbeddingsCatalogo: "continuarEmbeddingsCatalogo_",
   2317: continuarEmbeddingsCatalogo_: { tipo: "continuacion",
   2319: crear: () => ScriptApp.newTrigger("continuarEmbeddingsCatalogo_").timeBased().after(60
   13198: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo_");
   13239: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo_");
   13251: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo_");
   13253: ScriptApp.newTrigger("continuarEmbeddingsCatalogo_").timeBased().after(60 * 1000),
   13254: "continuarEmbeddingsCatalogo_"
   13259: function continuarEmbeddingsCatalogo_() {
```

### `registrarRespuestaFormularioCentralizado_`  — 7 referencias

```
   2250: registrarRespuestaFormularioCentralizado: "registrarRespuestaFormularioCentralizado_"
   2303: registrarRespuestaFormularioCentralizado_: { tipo: "evento", exigeRecurso: true,
   2310: return ScriptApp.newTrigger("registrarRespuestaFormularioCentralizado_")
   15270: if (trg.getHandlerFunction() === "registrarRespuestaFormularioCentralizado_") {
   15285: ScriptApp.newTrigger("registrarRespuestaFormularioCentralizado_").forForm(FormApp.open
   15300: function registrarRespuestaFormularioCentralizado_(e) {
   24609: { fn: "sincronizarTriggersFormularios", et: "Recoger respuestas de exámenes", ok: !!tr
```

## 5. Procedimiento — EJECUTADO el 11/9 por la noche

> **Hecho.** La 6.37 está instalada en el editor de producción y los tres activadores
> migrados a sus nombres privados, bajo `andressuarezcarmona@gmail.com`. Las 22
> propiedades siguen idénticas —cero nuevas, cero cambiadas, secretos incluidos—, el
> manifiesto no se tocó y **no se publicó**: el portal sigue sirviendo la Versión 1. Los
> pasos de abajo se conservan como registro de cómo se hizo y como guion para la próxima
> vez. Lo que salió distinto de lo previsto está en §5.bis.
>
> Inventario posterior comprobado en los tres diálogos: los tres con su horario intacto y
> **«una vez por día» en los avisos de fallo** — o sea que el paso 8 no hizo falta, el
> valor por omisión coincidió. Que era justo por lo que lo dejamos como «comprobar y
> ajustar solo lo que difiera» en vez de «volver a ponerlo».


> Este procedimiento estaba escrito para cuando había que renombrar a mano. **Ya no.** La
> 6.37 trae los nombres privados y el migrador hace la sustitución, así que los pasos de
> «renombrar en el código» y «borrar y recrear» han desaparecido — y el segundo, además,
> decía borrar primero, que es justo el orden que puede dejar una tarea sin disparador si
> falla la creación.

> Y hay un segundo orden que también estaba mal, este más silencioso: instalar el código
> antes de inventariar. **Guardar la 6.37 deja sin función de destino a los activadores
> instalados que todavía apunten a nombres antiguos**: fallarán si se ejecutan antes de
> completar la migración, porque el nombre vive como texto en el activador y esa función
> ya no existe. Cuántos son lo dirá el inventario —hay diez manejadores renombrados, pero
> eso no significa diez activadores instalados; las capturas mostraban tres—. Todo lo que
> se pueda hacer sin tocar producción —inventariar, respaldar, ensayar en la copia, elegir
> la ventana— va **antes** de instalar, y la migración va inmediatamente **después**, en
> la misma sesión.

1. **Registrar lo que hay** antes de tocar nada: para cada disparador, su función, tipo de
   evento, horario, recurso asociado y **con qué cuenta se creó**. Ese último dato decide
   con qué permisos corre y es el que más se olvida. Y hazlo a mano: el inventario del
   migrador no recupera el horario original ni la preferencia de avisos de fallo, así que
   compararlos con las recetas es trabajo tuyo. **Hecho el 11/9 — ver §2.**
2. **Respaldar**, y que el respaldo sea *restaurable*, no un montón de copias. Cinco
   piezas, porque ninguna arrastra a las otras:

   - **El libro** completo, con fecha en el nombre.
   - **El código** actualmente instalado, tal cual, antes de sustituirlo. Es a lo que se
     vuelve si hay que revertir.
   - **El manifiesto** `appsscript.json`, con su SHA-256 anotado. No se copia solo al
     copiar el proyecto a mano.
   - **La configuración necesaria para restaurar**, y aquí van **los valores**, no solo
     los nombres. La regla correcta no es «los secretos no se respaldan» sino **dónde**:
     no van en documentación, informes, CSV ni ZIP compartido; van a un almacén seguro o
     a un respaldo cifrado aparte, con acceso restringido y **recuperación comprobada** —
     un respaldo cifrado que nadie ha probado a abrir no es un respaldo
     ([OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)).

     Y una advertencia concreta, porque anotar «se genera sola» sería un error caro: hay
     propiedades que el código **crea por su cuenta si no las encuentra**. Dejan
     constancia en el registro al crearse, pero **no detienen la operación**: el sistema
     arranca aparentando normalidad con valores nuevos. Cada una rompe una cosa distinta,
     y conviene no mezclarlas:

     | Propiedad | Qué hace de verdad | Qué pasa si se pierde |
     |---|---|---|
     | `MASTER_SECRET_HMAC` | firma y valida los valores en formato `v2.<firma>.<base64>` | las claves de proveedor (`API_KEY_*`, incluido el refresh de TikTok) dejan de validar, y sin error visible: ver abajo |
     | `APP_CRYPTO_SALT` | solo interviene al **generar** una clave HMAC nueva | nada, mientras se conserve la clave HMAC existente. Perder las dos sí equivale a perder la clave |
     | `MASTER_KEY` | valida únicamente el **formato heredado**, no el `v2.` | se pierde lo que quede guardado en formato antiguo, nada más |

     Lo que ocurre con una clave de proveedor cuya firma ya no valida no es un fallo
     limpio. `descifrar_` devuelve vacío, pero `obtenerApiKey_` **no se rinde ahí**: busca
     una copia heredada —en las propiedades del script y también en las **del usuario**—
     y, si la encuentra, la vuelve a sellar con la clave nueva y la devuelve como si nada.
     Solo devuelve vacío cuando tampoco hay esa alternativa. O sea que la misma pérdida
     puede dar dos resultados distintos según el proveedor, y uno de ellos depende de
     **qué usuario** ejecuta. Un proveedor que sigue funcionando no prueba que la clave
     original esté a salvo.

     Aparte, por otro mecanismo: `API_TOKENS_MAP` es JSON **sin sellar** y `ADMIN_TOKEN`
     es texto **sin sellar**. No dependen de la clave HMAC. Pero si el mapa falta, el
     código emite un token de administrador nuevo, y todos los tokens emitidos antes dejan
     de servir.

     La contraseña compartida del portal se retiró en la 6.24 y **no es una credencial
     activa de la 6.37**: `PORTAL_PASSWORD_ENC` solo puede quedar como residuo. Retirarla
     es una operación posterior, y solo tras confirmar qué código sirve producción hoy —
     **durante el respaldo no se borra nada**: el respaldo conserva el estado original,
     residuos incluidos.

     La instrucción, entonces: respaldar de forma protegida **los valores que existen** y
     comprobar aparte que se recuperan. **Las ausencias también se preservan**, porque son
     parte del estado: crear una propiedad que faltaba no sobrescribe ninguna clave
     presente, pero introduce un valor nuevo que puede ser incompatible con los datos ya
     guardados, y deja el sistema en un estado que el respaldo nunca registró.

     Recordatorio del propio código, que cambia dónde se pone el listón: sellar **no es
     cifrar** —es firma HMAC más Base64—, así que cualquiera que pueda leer las
     propiedades del proyecto puede leer las claves de proveedor. Las propiedades son
     material secreto en sí mismas, estén «selladas» o no.
   - **El inventario** del paso anterior por escrito. Es lo único que permite reconstruir
     un disparador, porque ni el horario ni la cuenta creadora ni los avisos se recuperan
     de ninguna copia.

   Y aparte, **la implementación activa** —su ID y qué versión sirve hoy— registrada por
   separado: no es parte del proyecto copiado y es lo que hace falta para volver atrás sin
   crear una implementación nueva.

   Dos cosas que **no** viajan al copiar un proyecto de Apps Script, y que por eso se
   anotan a mano: los disparadores y las propiedades de script.

   Y la regla que gobierna todo el paso, porque casi todos los accidentes de arriba son
   variantes de lo mismo: **el respaldo captura el estado existente sin ejecutar
   inicializadores, regenerar claves ni limpiar propiedades. Su recuperación se comprueba
   por separado.**

   **Hecho y ensayado el 11/9.** Tres capas, en este orden:

   1. **Captura.** Los cuatro ámbitos de propiedades con sus ausencias preservadas
      —22 de script, 7 de usuario de Andrés, 0 de la otra cuenta, 0 de documento—, código
      actual, portal, manifiesto, los archivos de la **Versión 1 publicada** por separado,
      dos exportaciones XLSX y el inventario. Cifrado con DPAPI y recuperación verificada
      byte a byte.
   2. **Copia portable.** `Videoteca_2026-09-11_portable.7z`, con contraseña y nombres
      internos cifrados, 17 archivos recuperados y comparados, contraseña incorrecta
      rechazada (prueba negativa), y la descarga desde Drive verificada por SHA-256 contra
      el original: `10ef4cf8…`. Esto cierra la dependencia del perfil de Windows.
   3. **Ensayo funcional**, en una copia aparte —ni producción ni el respaldo nativo—,
      restringida y sin activadores. Comprobación previa antes de restaurar nada
      (PREVIA_OK: 32 hojas, cero activadores, cero propiedades), luego las 22 propiedades
      introducidas a mano y verificadas por SHA-256 canónico antes y después. Resultado:
      los cinco secretos sellados se leen con `descifrar_` y `obtenerApiKey_` originales, y
      `ADMIN_TOKEN` es reconocido como administrador vigente. Cierre con `LIMPIEZA_OK` y
      cero propiedades en la copia.

   Un detalle del ensayo que merece quedar escrito, porque prueba justo lo que hacía falta:
   la huella final de las propiedades **coincide** con la inicial. Si la vía heredada de
   `obtenerApiKey_` hubiera entrado en acción, habría vuelto a sellar la clave y esa huella
   habría cambiado. No cambió: los cinco secretos validaron contra la HMAC **restaurada**,
   sin migración de por medio. Es la diferencia entre «funcionó» y «funcionó por el motivo
   que creemos».

   Lo que el ensayo **no** acredita, y conviene repetirlo entero: es la 6.19 bajo la otra
   cuenta, no la candidata ni la versión publicada; no prueba que los proveedores externos
   sigan aceptando esas claves, ni OAuth, ni una publicación web, ni los trabajos
   automáticos.

   Tres cosas que siguen fuera del respaldo o pendientes de cerrar:

   - **Lo enlazado no está dentro.** Documentos, formularios y carpetas que el catálogo
     referencia no viajan con el libro. Si forman parte de lo que hay que poder recuperar,
     hay que delimitarlos y respaldarlos aparte.
   - **La contraseña del portable: confirmada su custodia separada** por el usuario.
     Queda anotado que abrir el archivo acredita que esa contraseña funciona, no que
     exista una segunda vía de recuperarla.
   - **Las 7 propiedades de usuario de Andrés: resuelto.** Se revisaron **solo los
     nombres** y las siete son `FAIL_COUNT_<fila>`: contadores de fallos por fila, estado
     operativo por usuario. Ninguna sigue el patrón `<proveedor>_API_KEY`, así que **no
     hay credenciales heredadas** ahí y la lista de rotación no cambia. Tampoco se
     trasladan a la otra cuenta: son de quien las generó.
3. **Ensayar sobre una copia** del proyecto y del libro: instalar allí la 6.37, recrear
   los disparadores —no se copian con el proyecto— y ejecutar el migrador de principio a
   fin. Aquí es donde se descubren los desajustes entre las recetas y los horarios reales,
   sin coste.
4. **Elegir la ventana** de mantenimiento: sin trabajos largos en marcha y con tiempo
   para hacer los pasos 5, 6 y 8 seguidos.
5. **Instalar la entrega verificada** —la 6.37, que ya contiene los nombres privados— y
   comprobar su identidad en el proyecto correcto. Desde este momento y hasta terminar el
   paso 6, todo activador que siga apuntando a un nombre antiguo falla si se ejecuta. Por
   eso este paso no se hace sin el siguiente al lado.
6. **Ejecutar «Migrar disparadores a nombres privados» desde la cuenta creadora**, que
   aquí es `andressuarezcarmona@gmail.com`. Esto no es una formalidad: el migrador
   trabaja sobre `ScriptApp.getProjectTriggers()`, que devuelve **solo los de la cuenta
   que ejecuta**. Lanzado desde la otra cuenta no daría error: informaría de cero
   disparadores y «nada que migrar», un éxito aparente con los tres antiguos intactos y
   ya apuntando a funciones que no existen. El migrador crea el sustituto y
   después borra el anterior, uno a uno. Esa coexistencia breve es parte del
   procedimiento, no una promesa de que nunca habrá dos a la vez: si el borrado falla, se
   queda el par y hay que deshacerlo a mano — el migrador lo dice con esas palabras.
7. **Leer todos los errores** y comprobar que no quedan duplicados. Repetir la migración
   debe conservar los IDs de los sustitutos que ya existan; si aparecen nuevos, algo va
   mal y hay que pararse.
8. **Comprobar los avisos de fallo** de los tres sustitutos, uno por uno, en Apps Script →
   Activadores → lápiz, y **ajustar solo los que difieran** del «una vez al día» que
   registró el inventario. Apps Script no tiene API para esa preferencia: el migrador crea
   por código y no puede llevársela consigo, así que los sustitutos nacen con el valor por
   omisión de Google — que **podría** coincidir con el anterior, o no. Es la única parte
   del inventario que la migración no transporta, y si no se mira no avisa de nada.
9. **Ejecutar cada uno** y luego **observar una ejecución automática real**. Ejecutar el
   manejador a mano no prueba que el disparador quedó bien instalado. Los semanales quedan
   en seguimiento hasta que corran solos — y con más razón aquí: `ejecutarMantenimientoSemanal`
   y `crearBackupAutomatico` mostraban «−» en última ejecución el 11/9, así que su
   funcionamiento automático **no está acreditado ni antes ni después** de migrar.

Un nombre privado **sí** puede ejecutarse desde un disparador instalado: acreditado el
11/9 a las 16:43:04 (§6.bis). Lo que no se probó es crearlo a mano desde el selector de la
pantalla de activadores, que puede seguir sin ofrecer esos nombres — por eso el migrador
los crea por código, y por eso nunca se crea un alias público para hacerlos aparecer.

`onOpen` conserva su nombre: es un disparador simple y el nombre es reservado.

## 5.bis. El panel dijo «0 disparadores»: qué pudo pasar y cómo salir de dudas

> **Cierre a las 19:55 del 11/9:** al dejar solo la sesión Andrés, la misma prueba devolvió usuario activo y efectivo Andrés, proyecto/libro correctos y tres activadores; `ui.alert` se mostró y se cerró correctamente. El botón original de inventario también mostró tres en pantalla. Queda descartada para este incidente la conclusión general «el panel no puede hablar». Se retiró el diagnóstico y se restauró exactamente la 6.37. Mantener una sola sesión para administrar; no se probaron por extensión todas las acciones ni la rotación. Evidencia completa: `REVISION_PANEL_IDENTIDAD_2026-09-11.md` y `DIAGNOSTICO_PANEL_SESION_UNICA_2026-09-11.json`.

> **Actualización verificada a las 19:50 del 11/9:** el diagnóstico devuelto directamente a la página confirmó usuario activo y efectivo `sstconsultorescolombia@gmail.com`, proyecto y libro correctos, cero activadores propios y `ui.alert` rechazado por falta de acceso. La identidad ya no es hipótesis. No se puede generalizar el fallo a todos los paneles: falta repetir bajo una sesión con solo Andrés. Detalle y evidencia: `REVISION_PANEL_IDENTIDAD_2026-09-11.md` y `DIAGNOSTICO_PANEL_2026-09-11.json`. La narración que sigue describe la investigación anterior; sus afirmaciones generales sobre imposibilidad de diálogos quedan limitadas por esta comprobación. El diagnóstico temporal se retiró y la 6.37 quedó restaurada.

A las 19:21:21 la migración lanzada **desde el panel** informó «No hay ningún disparador
con nombre antiguo. Instalados ahora mismo: 0». Dos minutos después, un lanzador temporal
que llamaba al **mismo migrador** —tras comprobar el ID del proyecto, el correo activo y
el efectivo— migró los tres sin un fallo. No se dio por buena la primera respuesta, que
fue lo correcto: un «0» no es «nada que hacer», es «no veo nada», y son cosas distintas.

**Qué dice ese mensaje exactamente.** Es la rama de `migrarDisparadoresUI` que se toma
cuando `inv.total` vale 0, y ese total sale de `ScriptApp.getProjectTriggers()`. O sea: la
llamada del panel **no vio ningún activador del proyecto**, no es que los viera y los
descartara.

**La hipótesis más simple.** `getProjectTriggers()` devuelve los del usuario efectivo. En
este proyecto hay dos cuentas, y la otra —`sstconsultorescolombia`— tiene **cero**
activadores propios: se comprobó en el inventario del 11/9. Una llamada ejecutada bajo esa
identidad devolvería exactamente 0. Encaja con lo observado sin necesidad de suponer nada
más. Pero encajar no es demostrar, y el encabezado mostraba Andrés, así que queda como
hipótesis principal, no como diagnóstico.

### Lo comprobado el 11/9 a las 19:44

El registro no zanjó la identidad: `_Log_Actividad` tiene filas de Andrés a las 19:19:24 y
19:20:38, y las tres migraciones a las 19:23:5x, también de Andrés, pero **ninguna fila del
panel a las 19:21**. Y el dato tiene un techo que conviene recordar: esa columna guarda
`Session.getActiveUser()`, no el usuario efectivo, y la función se salta la hoja cuando no
hay libro activo y se traga sus propios errores de escritura. Ausencia de filas no es
prueba de nada.

Se repitió entonces «Ver los disparadores instalados» desde el panel: ejecución
**Completada** en 2,49 s, y en el registro de Cloud «Disparadores instalados: 0».
**Reproducido, y después de migrar.** Así que la discrepancia no fue un incidente de aquel
momento.

### Lo que esa repetición sí demostró: el panel no puede hablar

Hay un segundo defecto ahí, y es distinto del primero. Que el mensaje apareciera en el
registro **es la prueba**: `alertarUsuario` intenta `ui.alert()` y solo escribe en el log
**por su rama de excepción**. Es decir, en esa ejecución `SpreadsheetApp.getUi()`
funcionó —si no, `exigirContextoHoja_` habría cortado antes y no habría «Completada»— pero
`ui.alert()` **falló**.

Eso es un tercer estado que el diseño no contemplaba. `hayInterfazDisponible()` pregunta
«¿puedo obtener el objeto Ui?», y nosotros lo leímos siempre como «¿puedo pintar un
diálogo?». En el menú las dos cosas son ciertas; en una app web las dos son falsas; **en
una llamada del panel la primera es cierta y la segunda no**. Consecuencias que ya están
ocurriendo:

- Toda acción del panel que termine en `alertarUsuario` **manda su respuesta al registro en
  vez de a la pantalla**. Desde la hoja parece que no hizo nada. Es exactamente lo que se
  vio a las 19:44.
- Peor, y esto afecta a lo que viene: `preguntarUsuario` comprueba
  `hayInterfazDisponible()`, que devuelve **cierto**, y acto seguido llama a `ui.alert()`,
  que lanza. No cae en su valor por defecto: **revienta**. Las acciones del panel que
  piden confirmación —la rotación de tokens entre ellas— no pueden completarse desde ahí.

La parte tranquilizadora: no hay un «sí» silencioso. Una confirmación que no se puede
mostrar aborta la acción en lugar de darse por aceptada.

### Lo que sigue sin explicarse, y cómo cerrarlo

El «0» **no** lo explica lo anterior: `ui.alert()` falla al final, después de que
`ScriptApp.getProjectTriggers()` ya haya devuelto la lista vacía. Son dos defectos
independientes y la identidad sigue siendo la hipótesis principal, todavía sin demostrar.

El diagnóstico correcto es el que ya está planteado: una sola llamada del panel, de solo
lectura, que devuelva usuario activo, usuario efectivo, ID del proyecto, ID del libro
activo —o su ausencia— y el número de activadores. Sin inicializadores, sin migraciones,
sin rotaciones, sin crear nada. Comprobar el encabezado de la página o ejecutar el
diagnóstico desde el editor no acredita el contexto del panel.

Con un añadido que el hallazgo de arriba vuelve imprescindible: **ese diagnóstico tiene que
devolver su resultado a la página, no enseñarlo con `alertarUsuario`**. Si lo comunica por
la vía de siempre, su respuesta acabará en el registro igual que las dos anteriores — y
habríamos montado una prueba que cae en el mismo agujero que intenta medir.

**Por qué no puede quedarse sin resolver.** Lo que viene —rotar credenciales, configurar
el canal de avisos— se hace desde ese mismo panel, y bajo la identidad equivocada tiene
consecuencias reales:

- Un token emitido bajo otra cuenta queda **atribuido a ese correo** en el mapa de tokens:
  el registro de quién tiene qué deja de ser cierto.
- Peor: cualquier acción del panel que **cree un activador** lo crearía a nombre de la otra
  cuenta. Ese activador correría bajo esa identidad y **no aparecería** en la lista de
  Andrés — un huérfano exactamente del tipo que todo el trabajo de inventario existía para
  evitar.

Hasta aclararlo, las acciones sensibles se lanzan como se lanzó la migración: desde una
ejecución que **comprueba la identidad antes de actuar**. Y por el segundo defecto, las que
piden confirmación o enseñan un resultado se lanzan **desde el menú de la hoja**, no desde
el panel, mientras el panel no sepa devolver lo que responde.

## 6. Credenciales

Los tokens y la clave HMAC aparecieron completos en capturas, así que trátalos como
expuestos. Dos cosas que no son obvias y cuestan caro:

- **`ADMIN_TOKEN` es solo un atajo**; la verdad está en `API_TOKENS_MAP`. Cambiar el atajo
  y dejar el registro antiguo en el mapa no revoca nada: el token viejo sigue valiendo.
  Y borrar el mapa entero se lleva por delante los accesos legítimos de otros.
- **`MASTER_SECRET_HMAC` no se cambia solo.** Todos los secretos guardados están sellados
  con la clave actual; cambiarla los invalida a todos a la vez y la aplicación deja de
  reconocer sus propias API Keys aunque los valores sigan ahí. Hay que preparar los
  nuevos valores sellados y aplicarlos en la misma ventana, con recuperación por si una
  escritura falla a mitad: varias escrituras de propiedades no son una transacción.

Para OAuth —TikTok— no basta con cambiar la propiedad local: si el proveedor sigue
aceptando el secreto antiguo, sigue expuesto. Hay que revocar allí.

Y al cerrar, cambiar `AUTH_REVISION` a un valor **nuevo**, nunca uno anterior: eso echa
todas las sesiones vivas y obliga a volver a entrar con la clave personal.

## 6.bis. Validación en una copia — HECHA sobre la 6.32 y sobre la 6.37

### La segunda, sobre la 6.37 (11/9/2026, tarde) — la que acredita esta entrega

**Resultado: pasó.** Servidor `4e76e36e…` instalado en la copia y comprobado carácter a
carácter contra el editor. Lo acreditado:

| Comprobación | Evidencia |
|---|---|
| Migración de dos disparadores con nombre viejo | 16:41:22, sin errores, conservando el identificador de la hoja |
| Repetir la migración no duplica | Los IDs del inventario antes y después coincidieron exactamente |
| **Un manejador privado lo ejecuta un disparador real** | 16:43:04, `procesarColaConAntiTimeout_`, Completada, 5,866 s, cinco filas procesadas |
| El panel abre desde el menú real y carga sus datos | 16:41:58 abre, 16:42:01 `estadoConfiguracion` |
| Rotación: caducidad exacta y los dos válidos en transición | `{"viejoValido":true,"nuevoValido":true,"caducidadExacta":true}` |
| Revocación: el anterior deja de valer | `{"rotacionPendiente":false,"viejoValido":false,"nuevoValido":true}` |
| El aviso de «Atención» desaparece solo | Sin cerrar y reabrir el panel |
| Correo: enviado **y recibido** | Evento `prueba_de_canal`, ~16:50, confirmado por Andrés |
| Limpieza | Filas 4973–4977 vaciadas, doce propiedades restauradas, cero activadores, auxiliar eliminado, `Código.gs` idéntico a `4e76e36e…` |

Lo que **no** cubrió: la rotación probada fue la de un token de consulta temporal, no la de
un token de administración real ni la de una clave de proveedor; el disparador de edición
se migró pero no se comprobó ejecutándolo con una edición humana; no se repitió la parada
por cuatro fallos —esa evidencia sigue siendo de la 6.32—; y siguen sin cubrirse cortes
duros por tiempo, conexiones colgadas, fallos durante `flush()`, escrituras parcialmente
aplicadas y concurrencia real.

Tampoco se comprobó **qué versión sirve hoy el portal de producción**. Las capturas de
septiembre no acreditan su estado actual: eso hay que mirarlo antes de publicar.

### La primera, sobre la 6.32 (11/9/2026, mediodía)

**Resultado: pasó.** Es la que acredita el ciclo de fallo de escritura, que la segunda no
repitió. Se ejecutó en una copia real con los servicios reales de Google, treinta filas
pendientes de verdad y la
excepción simulada delante de las dos escrituras. Quedaron acreditados los dos caminos de
fallo, los reintentos con sus horas, la parada tras un intento y tres reintentos, el aviso
en el panel, **la recepción del correo** (asunto «[Videoteca] Evento: ingesta_detenida»,
con la fila 4973 y cuatro fallos) y las dos formas de recuperación. La limpieza se
verificó: propiedades restauradas, filas temporales vacías, cero coincidencias de
`SIMULAR_FALLO_ESCRITURA` y ningún disparador residual.

Lo que esa validación **no** cubrió, y sigue sin cubrirse: cortes duros por tiempo,
conexiones colgadas, fallos durante `flush()`, escrituras parcialmente aplicadas por el
servicio, concurrencia entre usuarios, y los trabajos semanales de mantenimiento y backup.

De ella salieron dos arreglos de interfaz, ya aplicados en la **6.33**: el botón del aviso
dice «Reanudar ingesta» en vez de «Configurar», y el panel se repinta solo al terminar una
acción —antes había que cerrarlo y abrirlo para ver el estado de después—.

### El procedimiento

Queda abajo porque **hay que repetirlo sobre la versión que se publique**. Hoy la candidata
es la 6.37 y está validada.

Sobre qué pasa si se toca algo, con más precisión de la que tenía escrita aquí: **todo
cambio de bytes genera una identidad distinta y hay que registrarla**; la evidencia queda
asociada al archivo que se probó y no se traslada sola al siguiente. Pero repetirlo todo
no siempre hace falta: hay que mirar qué cambió y repetir lo afectado. Tocar solo
comentarios no obliga a repetir una ingesta contra Google. Cambiar `VERSION_SCRIPT` sí
altera un dato que el sistema devuelve y registra, aunque no cambie ni una línea de
algoritmo: hay que comprobar la versión visible, la salud, los informes y cualquier cosa
que consuma esa cadena.

El orden importa: publicar sin haber visto llegar un aviso es publicar un aviso que no se
sabe si llega.

1. Confirmar que la copia ejecuta la versión que se va a publicar, no una anterior guardada
   por error. El número sale en el registro de ejecuciones y en `?health=true`, **que no es
   una comprobación pública**: `doGet` exige un token de consulta antes de responderla, así
   que se hace por el procedimiento autorizado. Un «acceso denegado» sin token no es un
   fallo del sistema, es la puerta funcionando. Y ese token no va a informes, capturas ni
   enlaces compartidos.
2. Provocar un fallo de escritura controlado. **Proteger la hoja no sirve**: la
   protección de rangos no puede excluir al propietario, y el script se ejecuta como la
   cuenta publicadora, así que escribiría igual y la prueba pasaría sin haber probado
   nada. Lo controlable es introducir el fallo en el punto de escritura, **solo en la
   copia**: dentro de `procesarColaConAntiTimeout_` —con guion bajo: es el nombre desde la
   6.34—, en la función que se le pasa al
   enriquecedor y en el guardado final, añadir una línea que lance cuando una propiedad
   de prueba esté puesta. Algo así, y nada más:

   ```javascript
   if (PropertiesService.getScriptProperties().getProperty("SIMULAR_FALLO_ESCRITURA")) {
     throw new Error("Fallo de escritura simulado.");
   }
   ```

   Se activa poniendo esa propiedad y se desactiva borrándola, sin tocar más código.

   **Dónde va exactamente:** justo ANTES de `rango.setValues(datos)`, en los dos sitios
   —la función que se le pasa al enriquecedor y el guardado final—, y en el guardado
   final dentro del `try`. Ponerlo ahí reproduce el escenario concreto de **escritura que
   no llega a empezar**, que es el que sostiene la garantía del punto seguro. Ponerlo
   después reproduce otro escenario distinto y no acredita esa garantía.

   Corrijo una frase de una edición anterior de este documento que era demasiado
   absoluta: escribir y luego informar de un fallo **sí puede ocurrir** —un fallo durante
   `flush()`, una escritura parcialmente aplicada por el servicio—. Lo que pasa es que
   esos casos necesitan sus propias pruebas y quedan expresamente fuera de esta.

   **Y con qué catálogo:** con filas pendientes de procesar. Un catálogo ya resuelto no
   escribe nada, así que el fallo simulado no se dispara y la prueba pasa sin haber
   probado nada. Es exactamente la trampa que se comió una de las comprobaciones de la
   suite: «no hubo escrituras» parece un caso de prueba y es un caso vacío.

3. Con el fallo activo, comprobar que la cadena encadena continuación en los fallos 1, 2
   y 3 y **se detiene en el 4.º**, y que el checkpoint quedó en la última fila guardada.
4. Verificar que aparece la sección «🚨 Atención» al principio del panel de
   configuración, con la fila y la fecha correctas.
5. Verificar que **el aviso llega al destinatario configurado**. Si no hay webhook,
   Telegram ni correo de alertas configurado, este punto no queda aprobado: queda
   **pendiente**. No es lo mismo «se comprobó y llega» que «no había a dónde enviarlo».
   En la copia se comprobó con un correo habilitado temporalmente y restaurado después:
   **eso no deja configurado el canal de producción**, que hay que configurar aparte y
   bajo la cuenta que vaya a ser propietaria de los disparadores.
6. Borrar la propiedad, pulsar «Reanudar» y comprobar tres cosas: que arranca **en la
   fila del checkpoint**, que avanza, y que el aviso desaparece solo.
7. **Retirar las líneas de simulación antes de publicar**, y comprobar que no quedan:
   buscar `SIMULAR_FALLO_ESCRITURA` en el archivo de servidor debe dar cero resultados.
   Un mecanismo de prueba que llega a producción es una forma de apagar la ingesta
   poniendo una propiedad.
8. Solo entonces, publicar.

## 7. Publicación

Guardar en el editor **no** actualiza el portal: son cosas distintas, y esa es la causa
más común de «lo arreglé y sigue igual».

### Lo que el respaldo del 11/9 destapó: hay tres versiones, no dos

Al consultar la implementación activa aparecieron tres códigos distintos, y no se
sustituyen en cadena: **cada uno gobierna una cosa**.

| Dónde | Qué hay | SHA-256 |
|---|---|---|
| **Editor de producción** (lo que ejecutan los activadores) | `v2026.6.19-VIDEOTECA-FACETAS` | `49e4edd4…` |
| **Implementación publicada** (lo que ven las personas) | Versión 1, del 9/9/2026 23:04 | `76a96b37…` |
| **Candidata** (lo que queremos publicar) | `v2026.6.37-VIDEOTECA-ETAPA2` | `4e76e36e…` |

Los dos primeros **no coinciden**. Es decir: lo que el portal sirve hoy es anterior incluso
a lo que hay guardado en el editor. La 6.19 nunca llegó a publicarse, y con ella tampoco
ninguna de las correcciones de seguridad posteriores. Conviene decirlo sin rodeos: **el
portal en línea está sirviendo código anterior a las siete rondas de revisión**, y la
implementación tiene acceso «Cualquiera» y se ejecuta como Andrés. Lo que se arregló desde
julio no está protegiendo a nadie todavía.

Esto cambia dos cosas del plan, una a favor y otra en contra:

**A favor de la ventana de mantenimiento:** instalar la 6.37 en el editor **no cambia lo
que ve el portal**. La implementación sigue anclada a la Versión 1 hasta que alguien
publique. Así que los pasos 5 a 9 del §5 —instalar y migrar— afectan a los activadores,
no a las personas conectadas. La ventana es más holgada de lo que parecía.

**En contra de la calma:** la exposición no empieza cuando se publique, ya está corriendo.
Eso no justifica publicar con prisa ni saltarse el ensayo de restauración, pero sí ordena
las prioridades: el pendiente urgente es publicar la candidata verificada, no seguir
puliendo el editor.

Y una consecuencia para la reversión: el punto al que se vuelve **no es el editor
actual**. Si algo sale mal después de publicar, lo que restituye el estado de hoy son los
archivos de la Versión 1 (`76a96b37…`), no los de la 6.19. El respaldo guardó ambos por
separado, que es exactamente lo que hacía falta.

### Confirmación de la implementación activa

Consultada el 11/9: «Web Videoteca BD», Versión 1 del 9/9/2026 23:04, ejecutada como
Andrés, acceso «Cualquiera», ID
`AKfycbxP6AxuL-fSF_aMk4U2hXroWMotJM-_Z47ZjNahomwKmt2O-8ldQSoX-RboJEsaLLGRTA`. Registrada,
no editada. Después de actualizarla hay que comprobar que sirve exactamente la entrega
aprobada.

1. Sustituir el contenido del archivo de servidor y de `Index.html`. **No** añadir un
   segundo archivo de servidor junto al primero: las declaraciones chocarían.
2. La plantilla debe seguir llamándose `Index`: el servidor hace
   `createTemplateFromFile("Index")`.
3. Revisar `appsscript.json` conscientemente —zona horaria, V8, servicios avanzados— en
   vez de reemplazarlo por uno incompleto.
4. Implementar → Administrar implementaciones → «Web Videoteca BD» → lápiz → Versión →
   Nueva versión → Actualizar. Así conserva la URL.
5. Comprobar la URL publicada con una cuenta de alumno, una de administrador y una
   ventana sin sesión, y confirmar que ya no apunta a la Versión 1.

Si hay que revertir, no se vuelve a publicar la versión vulnerable: se restringe el acceso
mientras se repara.

Qué número lleva la entrega que se publique, y qué hay que anotar de ella —hash, versión
de Google, ID de implementación—, está en §9.

## 8. Lo que no está arreglado en el código

- **Una llamada de red colgada.** `UrlFetchApp` no admite tiempo de espera: si un
  proveedor deja la conexión abierta cuatro minutos, esa fila se lleva el presupuesto
  entero y Apps Script corta en seco.

  El corte por reloj **no limita el daño a una fila**: impide empezar más trabajo, pero
  lo ya hecho vive en memoria hasta que se escribe. Quien acota la pérdida es el volcado
  parcial: desde la 6.27 el bloque se guarda cada veinticinco filas —cinco escrituras
  por bloque de cien, cuatro parciales más la final, no cuatro como decía la versión
  anterior de este documento—.

  Y desde la 6.28 esa cota se sostiene también cuando la hoja falla: si un volcado
  parcial no puede escribir, el bloque **se detiene** en vez de seguir acumulando en
  memoria trabajo que ya se sabe que no se está guardando, y el checkpoint retrocede a
  la última fila que sí quedó a salvo. Repetir trabajo es barato —una fila ya resuelta
  se salta sola en la pasada siguiente—; saltárselo no.

  Desde la 6.29 la cadena automática también sobrevive: si la escritura falla, la cola
  deja el checkpoint en la última fila guardada y **programa la continuación** en vez de
  morir con la excepción. Antes un fallo pasajero de escritura rompía el encadenamiento y
  la ingesta no volvía a arrancar sola. Los reintentos van contados, porque encadenar un
  disparador por minuto contra una hoja que no acepta escrituras solo llena el registro:
  **un intento más tres reintentos**, es decir, encadena en los fallos 1, 2 y 3 y para en
  el 4.º. Y son fallos **consecutivos**: si entre medias la hoja aceptó una escritura
  —incluido un volcado parcial—, la cuenta vuelve a empezar.

  Cuando para, la 6.30 deja tres rastros distintos y ninguno depende de que haya alguien
  mirando: una propiedad `INGESTA_DETENIDA` con la fila y la fecha, una sección «🚨
  Atención» al principio del panel de configuración con un botón para reanudar desde
  donde quedó, y el canal de notificaciones que ya esté configurado —webhook, Telegram o
  correo—, que es el único que llega solo. Antes solo escribía en el registro, y eso
  acredita «quedó constancia», no «alguien se enteró».

  Lo que queda: la cota son veinticinco filas de trabajo rehecho, no cero; una llamada
  colgada sigue pudiendo consumir el presupuesto entero; y si la hoja no responde en
  cuatro intentos, la ingesta se para y hay que relanzarla desde el panel. El aviso por
  webhook, Telegram o correo **solo llega si ese canal está configurado**: sin ninguno,
  el rastro son la propiedad y el panel, que hay que ir a mirar. La salida real es medir cuánto
  tarda cada plataforma y bajar el tamaño del bloque para las lentas. Eso no está hecho.
- **El lote de YouTube, ya cerrado en la 6.27.** Se apunta porque el razonamiento vale
  para lo que venga: cien filas de YouTube son dos consultas de cincuenta, y se hacían
  las dos ANTES de que el bucle de filas mirase el reloj, así que el corte por fila no
  servía para el caso más común del catálogo. Ahora el lote también mira la hora, y lo
  que queda sin consultar vuelve marcado como «sin tiempo» —no como «video inexistente»,
  que es la confusión que habría escrito «privado, eliminado o inexistente» en filas
  sanas—. Si mañana se añade otra consulta por lotes antes del bucle, tendrá el mismo
  problema.
- **Duplicados de recordatorios.** `agendarRecordatoriosDeModulosVencidos_` no deduplica
  por módulo, persona y fecha de cierre: ejecutarla dos veces sobre el mismo plazo crea
  los eventos otra vez. Por eso está en el panel con aviso y sin disparador.
- **Orden de los guardados del examen.** `google.script.run` es asíncrono y no garantiza
  el orden de llegada; una respuesta antigua puede pisar a una nueva. Hace falta
  serializar por pregunta o una revisión que el servidor compare antes de escribir.
- **El `orden` de las opciones lo manda el navegador.** Sería más sólido reconstruirlo en
  el servidor con la semilla del intento.
- **El banco de preguntas no se versiona por intento.** Si una pregunta cambia durante un
  examen, se califica con una versión distinta de la que se presentó.
- **Los efectos posteriores a la entrega no son idempotentes.** El intento se marca
  entregado antes de terminar certificado, historial, refuerzo y avisos; si uno falla, la
  reentrega devuelve el informe y no completa lo que quedó a medias.

## 9. Numeración de versiones y registro de entregas

Hasta ahora el número ha crecido solo: `v2026.6.37-VIDEOTECA-ETAPA2`. Ese `6` no es un mes
ni una versión mayor; es un contador que se arrastra. Para lo que viene conviene una
convención dicha en voz alta, porque el número va a aparecer en el portal, en los informes
y en los registros, y quien lo lea dentro de un año tiene que poder situarlo.

### La convención: `AAAA.MM.R`

Año, mes de publicación y **consecutivo de ese mes** —no el día—.

| Ejemplo | Significado |
|---|---|
| `2026.09.1` | Primera entrega publicada en septiembre de 2026 |
| `2026.09.2` | Segunda entrega de ese mismo mes |
| `2026.10.1` | Primera entrega publicada en octubre de 2026 |
| `2026.09.1-rc.1` | Candidata de pruebas, todavía no estable |

El mes es el **real de publicación**, en `America/Bogota`. No llamar `2026.01.01` a una
entrega de septiembre: parecería enero y no diría cuándo se publicó. La cadena histórica
`2026.6.37` se conserva como identificador anterior y **no se reinterpreta**: el 6 nunca
fue un mes.

Esto es una recomendación de trazabilidad para Videoteca, no una exigencia de Apps Script.
Si algún día lo importante pasara a ser comunicar compatibilidad de una API pública,
SemVer (`MAJOR.MINOR.PATCH`) sería la otra opción razonable, pero obliga a definir qué
cambio rompe ese contrato. [CalVer](https://calver.org/) · [SemVer](https://semver.org/).

### Cómo adoptarlo sin perder lo ya validado

**Ahora, y esto es deliberado: la 6.37 se queda como está.** No hace falta renombrar nada
para considerarla candidata a producción; lo validado el 11/9 está atado a este archivo y
a su hash, y cambiar la constante cambiaría el hash y dejaría la evidencia hablando de un
archivo que ya no existe. Mientras tanto se la nombra «Videoteca estable — fuente 6.37».

**Al preparar la entrega definitiva con el esquema nuevo**, y en este orden:

1. Asignar el número —`2026.09.1` si se publica en septiembre—.
2. Cambiar la **única** constante `VERSION_SCRIPT`.
3. Actualizar los comentarios que **describen** la versión actual, no los que la
   **historian**. Hoy quedan cuatro rastros de `v2026.5.0`, y no se tratan igual:

   - La cabecera `Versión: VIDEOTECA CERTIFICABLE v2026.5.0` → se actualiza.
   - La línea de cierre `FIN DEL SCRIPT UNIFICADO — v2026.5.0-…` → se actualiza.
   - En el bloque LINAJE, `v2026.5.0 → ESTA VERSIÓN…` → deja de ser esta versión: la
     línea se conserva como historia y se añade debajo la entrada nueva.
   - El encabezado `QUÉ AÑADE v2026.5.0` y todo lo que cuelga de él → se conserva tal
     cual: describe lo que trajo aquella entrega, y sigue siendo cierto.
4. Calcular el SHA-256 del archivo final y anotarlo.
5. Ejecutar sobre ese archivo las comprobaciones afectadas, y solo entonces publicarlo.

No al revés: no se verifica un archivo y después se le cambia el número atribuyéndole el
hash anterior. Cambiar solo comentarios no obliga a repetir una prueba de ingesta contra
Google; cambiar `VERSION_SCRIPT` **sí** modifica datos que el sistema devuelve y registra
—versión visible, salud, informes, cualquier consumidor de esa cadena—, aunque no toque
ningún algoritmo.

Tampoco se hace un reemplazo global de versiones en todo el material: las referencias
históricas y los registros de pruebas tienen que seguir describiendo los archivos que
realmente se usaron. `AUTH_REVISION` no se mezcla con esta numeración —su trabajo es
invalidar sesiones, no identificar una entrega—, y renombrar una versión no es motivo para
reiniciar tokens, propiedades, base de datos ni `MASTER_SECRET_HMAC`.

### Cuatro datos distintos, y ninguno sustituye a otro

| Dato | Qué es |
|---|---|
| Versión del producto | `2026.09.1`. La asigna el proyecto; es la que ve la gente |
| Versión de Apps Script | Un entero que asigna Google al guardar una instantánea; su secuencia se conserva |
| ID de implementación | Identifica la implementación y su URL |
| Hash del paquete | Identifica el contenido exacto que se validó |

Las versiones guardadas de Apps Script son **instantáneas**. Actualizar una implementación
existente para que apunte a una versión nueva conserva su identidad y su URL; cambiar el
texto de `VERSION_SCRIPT` **no publica nada**. Y «volver a la versión 1» no se hace creando
otro proyecto ni borrando el historial.
[Versiones](https://developers.google.com/apps-script/guides/versions) ·
[Implementaciones](https://developers.google.com/apps-script/concepts/deployments).

En Apps Script los nombres de archivo deben ser estables: `Código.gs`, `Index.html`,
`appsscript.json`. Los sufijos locales —`Codigo_46`, este documento como `_16`— son
contadores de entrega de archivos, no versiones de producto. Para el archivo local, una
carpeta o un ZIP por versión.

### Registro por entrega

Se mantiene una fila por entrega. El hash del servidor por sí solo no identifica el HTML ni
la configuración del proyecto, así que van los tres.

| Campo | Entrega actual |
|---|---|
| Versión del producto | `v2026.6.37-VIDEOTECA-ETAPA2` (esquema anterior) |
| Fecha de validación | 11 de septiembre de 2026 |
| Fecha de publicación | pendiente — se anota el día que se publique, y no antes |
| SHA-256 del servidor | `4e76e36efa3dcdb825532a7ac193b6f4d2e6450154daa321a594f4c8eb94170f` |
| SHA-256 de `Index.html` | `0cd4d6f2e2de7c6a97346c9acba46a62f86a1b4eb2832293edbc48303b9198ec` |
| SHA-256 del manifiesto | pendiente — anotar el de `appsscript.json` en la copia de ensayo y **compararlo** después con el de producción |
| SHA-256 del paquete de pruebas | `6b18b4f69f7564df9d4a6d7c283fdd821d31cc3f1f1b4ffe54804757de5fa22b` — declarado por quien armó el paquete; verificar sobre el ZIP descargado |
| Versión de Apps Script | pendiente — la asigna Google al guardar la instantánea |
| ID de implementación | `AKfycbxP6AxuL-fSF_aMk4U2hXroWMotJM-_Z47ZjNahomwKmt2O-8ldQSoX-RboJEsaLLGRTA` («Web Videoteca BD», acceso Cualquiera, ejecutada como Andrés) |
| Estado de producción al 11/9, noche | editor: **6.37 instalada**; activadores **migrados** a nombres privados; publicado: sigue la Versión 1 del 9/9 (`76a96b37…`). El editor anterior era `v2026.6.19` (`49e4edd4…`), respaldado |
| ID del proyecto | `1pv0v0_r60zn8rLc614fewTK6qS7BPYgNpr0d5LMvSmIAU_fC4YUEN4tZ` («Proyecto Videoteca BD») |
| Inventario de activadores | cerrado el 11/9/2026: tres, todos de `andressuarezcarmona@gmail.com`; dos cuentas con acceso |
| Respaldo | hecho el 11/9/2026: cuatro ámbitos de propiedades, código, portal, manifiesto, archivos de la Versión 1, dos XLSX e inventario. Copia DPAPI local más copia portable con contraseña (`10ef4cf8…`), descarga verificada por hash |
| Restauración funcional | ensayada el 11/9 sobre la **6.19** en copia aislada: 22 propiedades restauradas y verificadas por huella, cinco secretos sellados legibles, `ADMIN_TOKEN` vigente, limpieza confirmada. **No** cubre proveedores externos, OAuth, publicación ni trabajos automáticos |
| Comprobaciones hechas | 818 comprobaciones locales sin fallos; los escenarios de §6.bis en copia real |
| Pendientes | aclarar la identidad del panel (§5.bis), canal definitivo de avisos, rotar credenciales, verificar el portal, publicar |
| Instalación y migración | hechas el 11/9 por la noche: tres activadores migrados, cero fallos, horarios y avisos intactos; 22 propiedades sin cambios; manifiesto intacto; sin publicar |
| Primera ejecución automática | `actualizarDashboardPeriodico_`, 11/9 19:27:34, 3,363 s, Completada. Un nombre privado corriendo desde un activador instalado **en producción**. Los dos semanales siguen sin evidencia |

Dos fechas, no una: **validar y publicar son actos distintos** y pueden separarse días. Una
fila que dice «11 de septiembre» a secas deja al lector suponiendo cuál de las dos es.

Las casillas «pendiente» se rellenan en producción; dejarlas vacías es parte del registro,
no un descuido. Y un hash que uno no ha calculado él mismo se registra como **declarado**
hasta que lo comprueba: el del paquete de pruebas se calculó sobre el ZIP tal como se
entregó, así que quien lo reciba lo verifica sobre el archivo que descargó, no sobre una
carpeta ya extraída —comparar una extracción con un ZIP no demuestra nada sobre el ZIP—.
