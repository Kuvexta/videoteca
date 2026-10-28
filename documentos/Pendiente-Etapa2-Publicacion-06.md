# Etapa 2 pendiente: disparadores, credenciales y publicación

**Proyecto:** Videoteca Certificable — Kuvexta
**Código:** `v2026.6.30-VIDEOTECA-SEGURIDAD`
**Qué es esto:** lo que queda por hacer y que **no se puede hacer desde fuera de Apps
Script**. Nada de este documento está aplicado.

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

> Números de línea **regenerados contra la 6.27**. Cambian con cada edición del
> servidor: si el archivo que tienes delante no es exactamente ese, búscalas por
> nombre y no por línea.

Cada nombre vive en más sitios que su declaración: el instalador, la tabla del panel que
comprueba si el disparador está puesto, las comparaciones con `getHandlerFunction()`, la
hoja «Acciones Movil» que lo busca por texto, y el código que reprograma una continuación.
Renombrar sin tocarlos todos deja el sistema a medias.

### `ejecutarMantenimientoSemanal`  — 6 referencias

```
   2026: function ejecutarMantenimientoSemanal() {
   2099: const purgados = ejecutarMantenimientoSemanal();
   2219: ScriptApp.newTrigger("ejecutarMantenimientoSemanal")
   2221: "ejecutarMantenimientoSemanal"
   22038: else if (accion.indexOf("Mantenimiento") !== -1) ejecutarMantenimientoSemanal();
   23794: { fn: "programarMantenimientoSemanal", et: "Mantenimiento semanal", ok: !!trig["ejecut
```

### `actualizarDashboardPeriodico`  — 4 referencias

```
   2231: ScriptApp.newTrigger("actualizarDashboardPeriodico").timeBased().everyHours(1),
   2232: "actualizarDashboardPeriodico"
   20060: function actualizarDashboardPeriodico() {
   23792: { fn: "instalarTriggerDashboard", et: "Refrescar el panel solo", ok: !!trig["actualiza
```

### `crearBackupAutomatico`  — 7 referencias

```
   2241: ScriptApp.newTrigger("crearBackupAutomatico")
   2243: "crearBackupAutomatico"
   4794: parte.backupUrl = crearBackupAutomatico();
   22039: else if (accion.indexOf("Backup") !== -1) crearBackupAutomatico();
   22776: function crearBackupAutomatico() {
   22788: crearBackupAutomatico();
   23793: { fn: "instalarDisparadorBackupSemanal", et: "Copia de seguridad semanal", ok: !!trig[
```

### `exportarCatalogoAJsonSilencioso`  — 9 referencias

```
   2252: ScriptApp.newTrigger("exportarCatalogoAJsonSilencioso").timeBased().everyHours(6),
   2253: "exportarCatalogoAJsonSilencioso"
   2278: if (procesados > 0) exportarCatalogoAJsonSilencioso();
   20545: exportarCatalogoAJsonSilencioso();
   20549: function exportarCatalogoAJsonSilencioso() {
   20599: exportarCatalogoAJsonSilencioso();
   22482: exportarCatalogoAJsonSilencioso();
   22536: exportarCatalogoAJsonSilencioso();
   23798: { fn: "instalarDisparadorSincronizacionAgentes", et: "Sincronizar con agentes", ok: !!
```

### `disparadorNocturnoFase2`  — 4 referencias

```
   2265: ScriptApp.newTrigger("disparadorNocturnoFase2").timeBased().everyDays(1).atHour(2),
   2266: "disparadorNocturnoFase2"
   2273: function disparadorNocturnoFase2() {
   23795: { fn: "programarProcesoNocturnoIA", et: "Proceso nocturno de IA", ok: !!trig["disparad
```

### `onEditControlMovilTrigger`  — 5 referencias

```
   2288: ScriptApp.newTrigger("onEditControlMovilTrigger").forSpreadsheet(SpreadsheetApp.getAct
   2289: "onEditControlMovilTrigger"
   22007: function onEditControlMovilTrigger(e) {
   22118: .some(trg => trg.getHandlerFunction() === "onEditControlMovilTrigger");
   23797: { fn: "instalarTriggerMovilManual", et: "Hoja de control móvil", ok: !!trig["onEditCon
```

### `procesarColaTareasSilencioso`  — 6 referencias

```
   2480: .some(trg => trg.getHandlerFunction() === "procesarColaTareasSilencioso");
   2483: ScriptApp.newTrigger("procesarColaTareasSilencioso").timeBased().everyHours(1),
   2484: "procesarColaTareasSilencioso"
   2492: function procesarColaTareasSilencioso() {
   2502: limpiarTriggersPorFuncion("procesarColaTareasSilencioso");
   23796: { fn: "programarColaTareas", et: "Procesar la cola sola", ok: !!trig["procesarColaTare
```

### `procesarColaConAntiTimeout`  — 9 referencias

```
   2128: const eliminados = limpiarTriggersPorFuncion("procesarColaConAntiTimeout");
   11494: function procesarColaConAntiTimeout(silencioso = false) {
   11618: ScriptApp.newTrigger("procesarColaConAntiTimeout").timeBased().after(60 * 1000),
   11619: "procesarColaConAntiTimeout"
   11633: procesarColaConAntiTimeout(false);
   11641: procesarColaConAntiTimeout(false);
   11654: procesarColaConAntiTimeout(false);
   22528: procesarColaConAntiTimeout(true);
   23796: { fn: "programarColaTareas", et: "Procesar la cola sola", ok: !!trig["procesarColaTare
```

### `continuarEmbeddingsCatalogo`  — 6 referencias

```
   12503: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo");
   12544: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo");
   12556: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo");
   12558: ScriptApp.newTrigger("continuarEmbeddingsCatalogo").timeBased().after(60 * 1000),
   12559: "continuarEmbeddingsCatalogo"
   12564: function continuarEmbeddingsCatalogo() {
```

### `registrarRespuestaFormularioCentralizado`  — 4 referencias

```
   14575: if (trg.getHandlerFunction() === "registrarRespuestaFormularioCentralizado") {
   14590: ScriptApp.newTrigger("registrarRespuestaFormularioCentralizado").forForm(FormApp.openB
   14605: function registrarRespuestaFormularioCentralizado(e) {
   23799: { fn: "sincronizarTriggersFormularios", et: "Recoger respuestas de exámenes", ok: !!tr
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
  la ingesta no volvía a arrancar sola. Los reintentos van contados: a la tercera vez
  seguida se deja de encadenar y se avisa, porque encadenar un disparador por minuto
  contra una hoja que no acepta escrituras solo llena el registro. La cuenta exacta es
  **un intento más tres reintentos**: encadena en los fallos 1, 2 y 3, y para en el 4.º.

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
