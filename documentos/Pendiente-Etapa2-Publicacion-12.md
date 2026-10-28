# Etapa 2 pendiente: disparadores, credenciales y publicación

**Proyecto:** Videoteca Certificable — Kuvexta
**Código:** `v2026.6.34-VIDEOTECA-ETAPA2`
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

> Números de línea **regenerados contra la 6.32**. Cambian con cada edición del
> servidor: si el archivo que tienes delante no es exactamente ese, búscalas por
> nombre y no por línea.

Cada nombre vive en más sitios que su declaración: el instalador, la tabla del panel que
comprueba si el disparador está puesto, las comparaciones con `getHandlerFunction()`, la
hoja «Acciones Movil» que lo busca por texto, y el código que reprograma una continuación.
Renombrar sin tocarlos todos deja el sistema a medias.

### `ejecutarMantenimientoSemanal`  — 6 referencias

```
   2032: function ejecutarMantenimientoSemanal() {
   2105: const purgados = ejecutarMantenimientoSemanal();
   2225: ScriptApp.newTrigger("ejecutarMantenimientoSemanal")
   2227: "ejecutarMantenimientoSemanal"
   22214: else if (accion.indexOf("Mantenimiento") !== -1) ejecutarMantenimientoSemanal();
   24009: { fn: "programarMantenimientoSemanal", et: "Mantenimiento semanal", ok: !!trig["ejecut
```

### `actualizarDashboardPeriodico`  — 4 referencias

```
   2237: ScriptApp.newTrigger("actualizarDashboardPeriodico").timeBased().everyHours(1),
   2238: "actualizarDashboardPeriodico"
   20236: function actualizarDashboardPeriodico() {
   24007: { fn: "instalarTriggerDashboard", et: "Refrescar el panel solo", ok: !!trig["actualiza
```

### `crearBackupAutomatico`  — 7 referencias

```
   2247: ScriptApp.newTrigger("crearBackupAutomatico")
   2249: "crearBackupAutomatico"
   4800: parte.backupUrl = crearBackupAutomatico();
   22215: else if (accion.indexOf("Backup") !== -1) crearBackupAutomatico();
   22952: function crearBackupAutomatico() {
   22964: crearBackupAutomatico();
   24008: { fn: "instalarDisparadorBackupSemanal", et: "Copia de seguridad semanal", ok: !!trig[
```

### `exportarCatalogoAJsonSilencioso`  — 9 referencias

```
   2258: ScriptApp.newTrigger("exportarCatalogoAJsonSilencioso").timeBased().everyHours(6),
   2259: "exportarCatalogoAJsonSilencioso"
   2284: if (procesados > 0) exportarCatalogoAJsonSilencioso();
   20721: exportarCatalogoAJsonSilencioso();
   20725: function exportarCatalogoAJsonSilencioso() {
   20775: exportarCatalogoAJsonSilencioso();
   22658: exportarCatalogoAJsonSilencioso();
   22712: exportarCatalogoAJsonSilencioso();
   24013: { fn: "instalarDisparadorSincronizacionAgentes", et: "Sincronizar con agentes", ok: !!
```

### `disparadorNocturnoFase2`  — 4 referencias

```
   2271: ScriptApp.newTrigger("disparadorNocturnoFase2").timeBased().everyDays(1).atHour(2),
   2272: "disparadorNocturnoFase2"
   2279: function disparadorNocturnoFase2() {
   24010: { fn: "programarProcesoNocturnoIA", et: "Proceso nocturno de IA", ok: !!trig["disparad
```

### `onEditControlMovilTrigger`  — 5 referencias

```
   2294: ScriptApp.newTrigger("onEditControlMovilTrigger").forSpreadsheet(SpreadsheetApp.getAct
   2295: "onEditControlMovilTrigger"
   22183: function onEditControlMovilTrigger(e) {
   22294: .some(trg => trg.getHandlerFunction() === "onEditControlMovilTrigger");
   24012: { fn: "instalarTriggerMovilManual", et: "Hoja de control móvil", ok: !!trig["onEditCon
```

### `procesarColaTareasSilencioso`  — 6 referencias

```
   2486: .some(trg => trg.getHandlerFunction() === "procesarColaTareasSilencioso");
   2489: ScriptApp.newTrigger("procesarColaTareasSilencioso").timeBased().everyHours(1),
   2490: "procesarColaTareasSilencioso"
   2498: function procesarColaTareasSilencioso() {
   2508: limpiarTriggersPorFuncion("procesarColaTareasSilencioso");
   24011: { fn: "programarColaTareas", et: "Procesar la cola sola", ok: !!trig["procesarColaTare
```

### `procesarColaConAntiTimeout`  — 10 referencias

```
   2134: const eliminados = limpiarTriggersPorFuncion("procesarColaConAntiTimeout");
   11538: function procesarColaConAntiTimeout(silencioso = false) {
   11794: ScriptApp.newTrigger("procesarColaConAntiTimeout").timeBased().after(60 * 1000),
   11795: "procesarColaConAntiTimeout"
   11809: procesarColaConAntiTimeout(false);
   11817: procesarColaConAntiTimeout(false);
   11830: procesarColaConAntiTimeout(false);
   22704: procesarColaConAntiTimeout(true);
   23966: const r = procesarColaConAntiTimeout(false);
   24011: { fn: "programarColaTareas", et: "Procesar la cola sola", ok: !!trig["procesarColaTare
```

### `continuarEmbeddingsCatalogo`  — 6 referencias

```
   12679: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo");
   12720: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo");
   12732: limpiarTriggersPorFuncion("continuarEmbeddingsCatalogo");
   12734: ScriptApp.newTrigger("continuarEmbeddingsCatalogo").timeBased().after(60 * 1000),
   12735: "continuarEmbeddingsCatalogo"
   12740: function continuarEmbeddingsCatalogo() {
```

### `registrarRespuestaFormularioCentralizado`  — 4 referencias

```
   14751: if (trg.getHandlerFunction() === "registrarRespuestaFormularioCentralizado") {
   14766: ScriptApp.newTrigger("registrarRespuestaFormularioCentralizado").forForm(FormApp.openB
   14781: function registrarRespuestaFormularioCentralizado(e) {
   24014: { fn: "sincronizarTriggersFormularios", et: "Recoger respuestas de exámenes", ok: !!tr
```

## 4.bis. Lo que ya trae el código (6.34)

Los diez nombres están migrados **en el código**; los disparadores instalados siguen
apuntando a los viejos hasta que ejecutes el migrador. En el panel de herramientas:

| Acción | Qué hace |
|---|---|
| **Ver los disparadores instalados** | Inventario. No toca nada. Dice cuáles tienen nombre viejo, cuáles son reinstalables y cuáles son temporales, y avisa de duplicados |
| **Migrar disparadores a nombres privados** | Enseña la lista, pregunta, y sustituye uno a uno. **Crea el nuevo antes de borrar el viejo**: si Apps Script rechazara el nombre privado, el viejo sigue ahí |

Con duplicados no migra nada: no se sabe cuál es el bueno, y sustituir dos por uno cambia
el comportamiento sin decirlo. Los temporales —cola y embeddings— se borran pero **no se
reinstalan**: los crea el código cuando hacen falta, y reinstalarlos sería inventarse
trabajo programado.

**El riesgo que no puedo descartar desde aquí:** que el selector de Apps Script no ofrezca
los nombres con guion bajo al crear un disparador a mano. Por eso el migrador los crea por
código. Si aun así el proyecto los rechazara, se revierte el renombrado de esos nombres
concretos y se deja la guarda como única defensa — que es lo que había hasta ahora.

### Avisos

En el panel de configuración hay una sección **📣 Avisos automáticos** al principio, que
marca si hay algún canal y trae **«Enviar prueba»**. Manda un aviso real por los canales
configurados y avisa de lo que ya sabías: que la ventana diga «enviado» no significa que
se haya recibido.

### Rotación de tokens

Dos acciones separadas, a propósito:

1. **Rotar un token expuesto** emite el sustituto con el mismo scope y titular, reapunta
   `ADMIN_TOKEN` si hacía falta, y enseña el valor nuevo **una vez** — no va al registro.
   A partir de ahí los dos son válidos.
2. **Revocar el token ya sustituido** retira el viejo. Es el paso que cierra la fuga.

Entre uno y otro, el panel muestra en **🚨 Atención** que hay una rotación a medias, con
el nombre del titular. Esto responde a «no considerar segura una migración que deja el
antiguo vigente indefinidamente»: sigue vigente, pero no en silencio. Y no se puede
empezar una segunda rotación con otra sin terminar.

**La clave de sellado no se toca.** Decisión tomada: se rotan los tokens y las claves de
proveedor, que es lo que estuvo expuesto. `MASTER_SECRET_HMAC` se queda, así que los
secretos ya sellados se siguen abriendo.

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
