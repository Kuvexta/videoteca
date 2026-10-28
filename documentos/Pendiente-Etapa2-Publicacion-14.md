# Etapa 2 pendiente: disparadores, credenciales y publicación

**Proyecto:** Videoteca Certificable — Kuvexta
**Código:** `v2026.6.36-VIDEOTECA-ETAPA2`
**Qué es esto:** lo que queda por hacer y que **no se puede hacer desde fuera de Apps
Script**.

En la 6.34 el código ya trae las herramientas para hacerlo: los diez manejadores están
renombrados, hay un inventario y un migrador de disparadores, una rotación de tokens en
dos pasos y una prueba del canal de avisos. **Ejecutarlas sigue siendo tuyo**, y el orden
de abajo no cambia.

Sustituye al `PENDIENTE_Disparadores_Etapa2.md` anterior: incorpora los horarios reales
confirmados en las capturas y la función que faltaba en la lista.

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

## 2. Los tres disparadores que están instalados

Horarios confirmados en la captura del proyecto, cuenta «Yo», aviso de fallos una vez al
día, zona horaria `America/Bogota` (GMT−05:00):

| Función actual | Nombre al migrar | Programación |
|---|---|---|
| `actualizarDashboardPeriodico` | `actualizarDashboardPeriodico_` | cada hora |
| `ejecutarMantenimientoSemanal` | `ejecutarMantenimientoSemanal_` | domingos, 03:00–04:00 |
| `crearBackupAutomatico` | `crearBackupAutomatico_` | domingos, 23:00–00:00 |

Un intervalo horario **no garantiza el minuto**: al recrear el disparador, el minuto
efectivo puede cambiar dentro de la franja. No prometas que se conservará el `:44` que
aparece en las ejecuciones anteriores.

Esa lista es la de **la cuenta que abrió el editor**. Los disparadores creados por otra
cuenta no se ven desde ahí. Si hay más administradores, hay que preguntarles.

## 3. Los temporales, que no salen en esa pantalla

`procesarColaConAntiTimeout` se creó y ejecutó por código el 10/9 — está en el registro de
ejecuciones aunque no aparezca en la lista de disparadores, porque se crea, corre y se
borra. `continuarEmbeddingsCatalogo` hace lo mismo. Sus creadores también usan el nombre
como texto, así que también hay que actualizarlos.

Y una advertencia del informe que conviene repetir: **no instalar un disparador solo
porque la función existe en el código**. Actualizar el creador para que use el nombre
nuevo no es lo mismo que dejar la tarea programada.

## 4. Las diez funciones y todas sus referencias

> Números de línea **regenerados contra la 6.35**, y con los nombres ya migrados
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
   2541: ScriptApp.newTrigger("ejecutarMantenimientoSemanal_")
   2543: "ejecutarMantenimientoSemanal_"
   22695: else if (accion.indexOf("Mantenimiento") !== -1) ejecutarMantenimientoSemanal_();
   24566: { fn: "programarMantenimientoSemanal", et: "Mantenimiento semanal", ok: !!trig["ejecut
```

### `actualizarDashboardPeriodico_`  — 7 referencias

```
   2242: actualizarDashboardPeriodico: "actualizarDashboardPeriodico_",
   2274: actualizarDashboardPeriodico_: { tipo: "periodico", descripcion: "cada hora",
   2275: crear: () => ScriptApp.newTrigger("actualizarDashboardPeriodico_").timeBased().everyHo
   2553: ScriptApp.newTrigger("actualizarDashboardPeriodico_").timeBased().everyHours(1),
   2554: "actualizarDashboardPeriodico_"
   20717: function actualizarDashboardPeriodico_() {
   24564: { fn: "instalarTriggerDashboard", et: "Refrescar el panel solo", ok: !!trig["actualiza
```

### `crearBackupAutomatico_`  — 10 referencias

```
   2243: crearBackupAutomatico: "crearBackupAutomatico_",
   2279: crearBackupAutomatico_: { tipo: "periodico", descripcion: "domingos a las 23:00",
   2280: crear: () => ScriptApp.newTrigger("crearBackupAutomatico_")
   2563: ScriptApp.newTrigger("crearBackupAutomatico_")
   2565: "crearBackupAutomatico_"
   5281: parte.backupUrl = crearBackupAutomatico_();
   22696: else if (accion.indexOf("Backup") !== -1) crearBackupAutomatico_();
   23433: function crearBackupAutomatico_() {
   23445: crearBackupAutomatico_();
   24565: { fn: "instalarDisparadorBackupSemanal", et: "Copia de seguridad semanal", ok: !!trig[
```

### `exportarCatalogoAJsonSilencioso_`  — 12 referencias

```
   2244: exportarCatalogoAJsonSilencioso: "exportarCatalogoAJsonSilencioso_",
   2282: exportarCatalogoAJsonSilencioso_: { tipo: "periodico", descripcion: "cada 6 horas",
   2283: crear: () => ScriptApp.newTrigger("exportarCatalogoAJsonSilencioso_").timeBased().ever
   2574: ScriptApp.newTrigger("exportarCatalogoAJsonSilencioso_").timeBased().everyHours(6),
   2575: "exportarCatalogoAJsonSilencioso_"
   2600: if (procesados > 0) exportarCatalogoAJsonSilencioso_();
   21202: exportarCatalogoAJsonSilencioso_();
   21206: function exportarCatalogoAJsonSilencioso_() {
   21256: exportarCatalogoAJsonSilencioso_();
   23139: exportarCatalogoAJsonSilencioso_();
   23193: exportarCatalogoAJsonSilencioso_();
   24570: { fn: "instalarDisparadorSincronizacionAgentes", et: "Sincronizar con agentes", ok: !!
```

### `disparadorNocturnoFase2_`  — 7 referencias

```
   2245: disparadorNocturnoFase2: "disparadorNocturnoFase2_",
   2284: disparadorNocturnoFase2_: { tipo: "periodico", descripcion: "todos los días a las 02:0
   2285: crear: () => ScriptApp.newTrigger("disparadorNocturnoFase2_").timeBased().everyDays(1)
   2587: ScriptApp.newTrigger("disparadorNocturnoFase2_").timeBased().everyDays(1).atHour(2),
   2588: "disparadorNocturnoFase2_"
   2595: function disparadorNocturnoFase2_() {
   24567: { fn: "programarProcesoNocturnoIA", et: "Proceso nocturno de IA", ok: !!trig["disparad
```

### `onEditControlMovilTrigger_`  — 8 referencias

```
   2246: onEditControlMovilTrigger: "onEditControlMovilTrigger_",
   2289: onEditControlMovilTrigger_: { tipo: "evento", descripcion: "al editar la hoja",
   2290: crear: () => ScriptApp.newTrigger("onEditControlMovilTrigger_")
   2610: ScriptApp.newTrigger("onEditControlMovilTrigger_").forSpreadsheet(SpreadsheetApp.getAc
   2611: "onEditControlMovilTrigger_"
   22664: function onEditControlMovilTrigger_(e) {
   22775: .some(trg => trg.getHandlerFunction() === "onEditControlMovilTrigger_");
   24569: { fn: "instalarTriggerMovilManual", et: "Hoja de control móvil", ok: !!trig["onEditCon
```

### `procesarColaTareasSilencioso_`  — 9 referencias

```
   2247: procesarColaTareasSilencioso: "procesarColaTareasSilencioso_",
   2286: procesarColaTareasSilencioso_: { tipo: "periodico", descripcion: "cada hora",
   2287: crear: () => ScriptApp.newTrigger("procesarColaTareasSilencioso_").timeBased().everyHo
   2802: .some(trg => trg.getHandlerFunction() === "procesarColaTareasSilencioso_");
   2805: ScriptApp.newTrigger("procesarColaTareasSilencioso_").timeBased().everyHours(1),
   2806: "procesarColaTareasSilencioso_"
   2814: function procesarColaTareasSilencioso_() {
   2824: limpiarTriggersPorFuncion("procesarColaTareasSilencioso_");
   24568: { fn: "programarColaTareas", et: "Procesar la cola sola", ok: !!trig["procesarColaTare
```

### `procesarColaConAntiTimeout_`  — 13 referencias

```
   2134: const eliminados = limpiarTriggersPorFuncion("procesarColaConAntiTimeout_");
   2248: procesarColaConAntiTimeout: "procesarColaConAntiTimeout_",
   2303: procesarColaConAntiTimeout_: { tipo: "continuacion",
   2305: crear: () => ScriptApp.newTrigger("procesarColaConAntiTimeout_").timeBased().after(60 
   12019: function procesarColaConAntiTimeout_(silencioso = false) {
   12275: ScriptApp.newTrigger("procesarColaConAntiTimeout_").timeBased().after(60 * 1000),
   12276: "procesarColaConAntiTimeout_"
   12290: procesarColaConAntiTimeout_(false);
   12298: procesarColaConAntiTimeout_(false);
   12311: procesarColaConAntiTimeout_(false);
   23185: procesarColaConAntiTimeout_(true);
   24500: const r = procesarColaConAntiTimeout_(false);
   24568: { fn: "programarColaTareas", et: "Procesar la cola sola", ok: !!trig["procesarColaTare
```

### `continuarEmbeddingsCatalogo_`  — 9 referencias

```
   2249: continuarEmbeddingsCatalogo: "continuarEmbeddingsCatalogo_",
   2306: continuarEmbeddingsCatalogo_: { tipo: "continuacion",
   2308: crear: () => ScriptApp.newTrigger("continuarEmbeddingsCatalogo_").timeBased().after(60
   13160: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo_");
   13201: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo_");
   13213: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo_");
   13215: ScriptApp.newTrigger("continuarEmbeddingsCatalogo_").timeBased().after(60 * 1000),
   13216: "continuarEmbeddingsCatalogo_"
   13221: function continuarEmbeddingsCatalogo_() {
```

### `registrarRespuestaFormularioCentralizado_`  — 7 referencias

```
   2250: registrarRespuestaFormularioCentralizado: "registrarRespuestaFormularioCentralizado_"
   2292: registrarRespuestaFormularioCentralizado_: { tipo: "evento",
   2299: return ScriptApp.newTrigger("registrarRespuestaFormularioCentralizado_")
   15232: if (trg.getHandlerFunction() === "registrarRespuestaFormularioCentralizado_") {
   15247: ScriptApp.newTrigger("registrarRespuestaFormularioCentralizado_").forForm(FormApp.open
   15262: function registrarRespuestaFormularioCentralizado_(e) {
   24571: { fn: "sincronizarTriggersFormularios", et: "Recoger respuestas de exámenes", ok: !!tr
```

## 5. Procedimiento

1. **Registrar lo que hay**, antes de tocar nada: para cada disparador, su función, tipo
   de evento, horario, recurso asociado y **con qué cuenta se creó**. Ese último dato
   decide con qué permisos corre y es el que más se olvida.
2. **Trabajar sobre una copia** del proyecto y del libro. Los disparadores no se copian
   con el proyecto: hay que crearlos en la copia para poder probarlos.
3. **Renombrar en el código**, los sitios de la sección 4 a la vez.
4. **Elegir una ventana** y comprobar que no hay trabajos largos en marcha.
5. **Borrar y recrear** cada disparador con el nombre nuevo, conservando evento, horario,
   cuenta y avisos. Un disparador no se renombra: se sustituye. Y no deben quedar dos
   activos para la misma tarea durante la sustitución.
6. **Comprobar la lista efectiva** después. Editar el código no cambia la referencia
   guardada; si el selector no ofrece el nombre privado, se instala desde un menú
   autorizado — nunca creando un alias público para que aparezca.
7. **Ejecutar cada uno** y luego **observar una ejecución automática real**. Ejecutar el
   manejador a mano no prueba que el disparador quedó bien instalado. Los semanales
   quedan en seguimiento hasta que corran solos.

`onOpen` conserva su nombre: es un disparador simple y el nombre es reservado.

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

## 6.bis. Validación en una copia — HECHA el 11/9/2026 sobre la 6.32

**Resultado: pasó.** Se ejecutó en una copia real —hoja «Videoteca — PRUEBAS 6.32» y su
proyecto— con los servicios reales de Google, treinta filas pendientes de verdad y la
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

El procedimiento queda abajo porque **hay que repetirlo sobre la versión que se publique**,
que ya no es la 6.32. El orden importa: publicar sin haber visto llegar un aviso es
publicar un aviso que no se sabe si llega.

1. Confirmar que la copia ejecuta la versión que se va a publicar —el número sale en el registro y en
   `?health=true`—, no una versión anterior guardada por error.
2. Provocar un fallo de escritura controlado. **Proteger la hoja no sirve**: la
   protección de rangos no puede excluir al propietario, y el script se ejecuta como la
   cuenta publicadora, así que escribiría igual y la prueba pasaría sin haber probado
   nada. Lo controlable es introducir el fallo en el punto de escritura, **solo en la
   copia**: dentro de `procesarColaConAntiTimeout`, en la función que se le pasa al
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
   final dentro del `try`. Si se pone después del `setValues`, la escritura llega a
   hacerse y encima se reporta el fallo: eso no es el escenario que se quiere medir, es
   uno que no puede ocurrir, y deja el «punto seguro» diciendo lo contrario de la verdad.

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

Guardar en el editor **no** actualiza el portal. La implementación «Web Videoteca BD»
apunta a la Versión 1 del 9 de septiembre, así que hasta que no se publique una versión
nueva, el portal sigue sirviendo código anterior a todas estas correcciones.

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
