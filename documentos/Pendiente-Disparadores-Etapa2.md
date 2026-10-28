# Etapa 2 pendiente: hacer privados los disparadores

**Proyecto:** Videoteca Certificable — Kuvexta
**Estado del código:** `v2026.6.24-VIDEOTECA-SEGURIDAD`
**Qué es esto:** el inventario que hay que tener delante para completar R1.2 sobre las
funciones que usan disparadores instalados. No se ha aplicado nada de lo que hay aquí.

## Por qué quedó fuera de la primera etapa

El guion bajo final es lo único que Apps Script reconoce como privado frente a
`google.script.run`. Renombrar una función que usa un disparador no es solo cambiar el
código: **cambiar el instalador no toca los disparadores que ya existen**. Un disparador
guarda el nombre de la función como texto; si el código deja de tener ese nombre, el
disparador sigue existiendo, se ejecuta a su hora y falla. Y falla en silencio, porque no
hay nadie delante: el mantenimiento semanal deja de correr, las copias de seguridad dejan
de hacerse, y nadie se entera hasta que hace falta una.

Eso no se puede comprobar desde fuera de Apps Script, así que la etapa 2 se hace con el
proyecto delante, en una copia, y verificando disparador por disparador.

## Las diez funciones y todas sus referencias

Cada nombre aparece en más sitios que su propia declaración: en el instalador, en la
tabla del panel que comprueba si el disparador está puesto, y a veces en la hoja de
control móvil, que lo busca por texto. Renombrar sin tocar los tres es dejar el sistema
a medias.


### ejecutarMantenimientoSemanal  (6 referencias)
   2023: function ejecutarMantenimientoSemanal() {
   2096: const purgados = ejecutarMantenimientoSemanal();
   2216: ScriptApp.newTrigger("ejecutarMantenimientoSemanal")
   2218: "ejecutarMantenimientoSemanal"
   21812: else if (accion.indexOf("Mantenimiento") !== -1) ejecutarMantenimientoSemanal();
   23568: { fn: "programarMantenimientoSemanal", et: "Mantenimiento semanal", ok: !!trig["

### actualizarDashboardPeriodico  (4 referencias)
   2228: ScriptApp.newTrigger("actualizarDashboardPeriodico").timeBased().everyHours(1),
   2229: "actualizarDashboardPeriodico"
   19834: function actualizarDashboardPeriodico() {
   23566: { fn: "instalarTriggerDashboard", et: "Refrescar el panel solo", ok: !!trig["act

### crearBackupAutomatico  (7 referencias)
   2238: ScriptApp.newTrigger("crearBackupAutomatico")
   2240: "crearBackupAutomatico"
   4774: parte.backupUrl = crearBackupAutomatico();
   21813: else if (accion.indexOf("Backup") !== -1) crearBackupAutomatico();
   22550: function crearBackupAutomatico() {
   22562: crearBackupAutomatico();
   23567: { fn: "instalarDisparadorBackupSemanal", et: "Copia de seguridad semanal", ok: !

### exportarCatalogoAJsonSilencioso  (9 referencias)
   2249: ScriptApp.newTrigger("exportarCatalogoAJsonSilencioso").timeBased().everyHours(6
   2250: "exportarCatalogoAJsonSilencioso"
   2275: if (procesados > 0) exportarCatalogoAJsonSilencioso();
   20319: exportarCatalogoAJsonSilencioso();
   20323: function exportarCatalogoAJsonSilencioso() {
   20373: exportarCatalogoAJsonSilencioso();
   22256: exportarCatalogoAJsonSilencioso();
   22310: exportarCatalogoAJsonSilencioso();
   23572: { fn: "instalarDisparadorSincronizacionAgentes", et: "Sincronizar con agentes", 

### disparadorNocturnoFase2  (4 referencias)
   2262: ScriptApp.newTrigger("disparadorNocturnoFase2").timeBased().everyDays(1).atHour(
   2263: "disparadorNocturnoFase2"
   2270: function disparadorNocturnoFase2() {
   23569: { fn: "programarProcesoNocturnoIA", et: "Proceso nocturno de IA", ok: !!trig["di

### onEditControlMovilTrigger  (5 referencias)
   2285: ScriptApp.newTrigger("onEditControlMovilTrigger").forSpreadsheet(SpreadsheetApp.
   2286: "onEditControlMovilTrigger"
   21781: function onEditControlMovilTrigger(e) {
   21892: .some(trg => trg.getHandlerFunction() === "onEditControlMovilTrigger");
   23571: { fn: "instalarTriggerMovilManual", et: "Hoja de control móvil", ok: !!trig["onE

### procesarColaTareasSilencioso  (6 referencias)
   2477: .some(trg => trg.getHandlerFunction() === "procesarColaTareasSilencioso");
   2480: ScriptApp.newTrigger("procesarColaTareasSilencioso").timeBased().everyHours(1),
   2481: "procesarColaTareasSilencioso"
   2489: function procesarColaTareasSilencioso() {
   2499: limpiarTriggersPorFuncion("procesarColaTareasSilencioso");
   23570: { fn: "programarColaTareas", et: "Procesar la cola sola", ok: !!trig["procesarCo

### procesarColaConAntiTimeout  (9 referencias)
   2125: const eliminados = limpiarTriggersPorFuncion("procesarColaConAntiTimeout");
   11343: function procesarColaConAntiTimeout(silencioso = false) {
   11423: ScriptApp.newTrigger("procesarColaConAntiTimeout").timeBased().after(60 * 1000),
   11424: "procesarColaConAntiTimeout"
   11438: procesarColaConAntiTimeout(false);
   11446: procesarColaConAntiTimeout(false);
   11459: procesarColaConAntiTimeout(false);
   22302: procesarColaConAntiTimeout(true);
   23570: { fn: "programarColaTareas", et: "Procesar la cola sola", ok: !!trig["procesarCo

### continuarEmbeddingsCatalogo  (6 referencias)
   12308: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo");
   12349: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo");
   12361: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo");
   12363: ScriptApp.newTrigger("continuarEmbeddingsCatalogo").timeBased().after(60 * 1000)
   12364: "continuarEmbeddingsCatalogo"
   12369: function continuarEmbeddingsCatalogo() {

### registrarRespuestaFormularioCentralizado  (4 referencias)
   14380: if (trg.getHandlerFunction() === "registrarRespuestaFormularioCentralizado") {
   14395: ScriptApp.newTrigger("registrarRespuestaFormularioCentralizado").forForm(FormApp
   14410: function registrarRespuestaFormularioCentralizado(e) {
   23573: { fn: "sincronizarTriggersFormularios", et: "Recoger respuestas de exámenes", ok


## Procedimiento

1. **Antes de tocar nada, registrar lo que hay.** En el proyecto de Apps Script, anotar
   para cada disparador: su función, su tipo de evento, su horario, el recurso asociado
   —el libro, el formulario— y **con qué cuenta se creó**. Ese último dato es el que más
   se olvida y el que decide con qué permisos corre.
2. **Trabajar sobre una copia** del proyecto y del libro. Los disparadores no se copian
   con el proyecto: hay que crearlos en la copia para poder probarlos.
3. **Renombrar en el código**, los tres sitios a la vez: la declaración, las llamadas
   directas y las cadenas de texto (`ScriptApp.newTrigger("…")`, la tabla del panel,
   la hoja «Acciones Movil»).
4. **Borrar y recrear** cada disparador afectado con el nombre nuevo, conservando evento,
   horario y cuenta. Un disparador no se renombra: se sustituye.
5. **Ejecutar cada uno** en la copia y comprobar que hace su trabajo y que tiene permisos.
6. **No dejar alias públicos.** `function nombreAntiguo() { return nombreNuevo_(); }`
   vuelve a abrir exactamente lo que se acaba de cerrar.
7. **Mantener las guardas** aunque el nombre ya sea privado. El guion bajo y la guarda
   protegen de cosas distintas; tener las dos es lo correcto, no una redundancia.

## Nota sobre `onOpen`

`onOpen` conserva su nombre: es un disparador simple y el nombre es reservado. Lo que sí
conviene revisar es que no haga más de lo que ese disparador necesita.
