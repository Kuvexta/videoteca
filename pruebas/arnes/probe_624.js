/* v2026.6.24 — la segunda revisión: R1 a R5.
 *
 * El hilo de las dos revisiones es el mismo: en Apps Script toda función global
 * es alcanzable desde `google.script.run`, y proteger la puerta de entrada no
 * protege lo que hay detrás si eso también es una puerta. Por eso casi todo lo
 * que sigue se prueba DOS veces: por el camino bueno y llamando directamente a
 * la implementación.
 *
 * Cada rechazo va acompañado de su permiso correspondiente. Un arreglo que
 * bloquea todo pasa las pruebas de seguridad y rompe el producto. */
const { LIBRO, Hoja, PROPS } = require('./mockgas.js');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
/* El portal se lee de esta misma carpeta: la prueba tiene que poder ejecutarse
   allí donde estén los archivos, no solo donde se escribió. */
const portal = fs.readFileSync(__dirname + '/Index.html', 'utf8');
eval(src + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS; globalThis.IDX = IDX;
globalThis.INT = INT; globalThis.INT_COLS = INT_COLS;
globalThis.ESTADO_INTENTO = ESTADO_INTENTO;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.limpiarOrigenConfiable = limpiarOrigenConfiable;
globalThis.ACCIONES_PANEL_CONFIG = ACCIONES_PANEL_CONFIG;
globalThis.ACCIONES_PANEL_HERRAMIENTAS = ACCIONES_PANEL_HERRAMIENTAS;
globalThis.lanzarAccionConfig = lanzarAccionConfig;
globalThis.lanzarAccionHerramienta = lanzarAccionHerramienta;
globalThis.generarEnlacePublicoJSON = generarEnlacePublicoJSON;
globalThis.estadoConfiguracion = estadoConfiguracion;
globalThis.conVentanaDeFilas = conVentanaDeFilas;
globalThis.actualizarTodoDesdeFila = actualizarTodoDesdeFila;
globalThis.emitirSesionInterna_ = emitirSesionInterna_;
globalThis.obtenerDatosToken_ = obtenerDatosToken_;
globalThis.obtenerRevisionAuth_ = obtenerRevisionAuth_;
globalThis.informeIntentoDeSesion = informeIntentoDeSesion;
globalThis.obtenerInformeIntento = obtenerInformeIntento;
globalThis.exigirIntentoEntregado_ = exigirIntentoEntregado_;
globalThis.procesarComandoVoz = procesarComandoVoz;
globalThis.doPost = doPost;
globalThis.documentoRAGDelCatalogo_ = documentoRAGDelCatalogo_;
globalThis.enriquecerBloqueIngesta = enriquecerBloqueIngesta;
globalThis.obtenerMetadatosYouTubeLote50 = obtenerMetadatosYouTubeLote50;
globalThis.procesarColaConAntiTimeout_ = procesarColaConAntiTimeout_;
globalThis.MAX_REINTENTOS_ESCRITURA_INGESTA = MAX_REINTENTOS_ESCRITURA_INGESTA;
globalThis.estadoConfiguracion = estadoConfiguracion;
globalThis.conVentanaDeFilas = conVentanaDeFilas;
globalThis.actualizarTodoDesdeFila = actualizarTodoDesdeFila;
globalThis.inventariarDisparadores = inventariarDisparadores;
globalThis.migrarDisparadoresANombresPrivados = migrarDisparadoresANombresPrivados;
globalThis.rotarTokenExpuestoUI = rotarTokenExpuestoUI;
globalThis.abrirPanelConfiguracion = abrirPanelConfiguracion;
globalThis.SEMILLA_TAXONOMIA = SEMILLA_TAXONOMIA;
`);

let ok = 0, mal = 0;
const comprobar = (n, c, d) => {
  if (c) { ok++; console.log("  ok   " + n); }
  else { mal++; console.log("  FALLA " + n + (d ? "  → " + d : "")); }
};
/** Contexto del portal: ni hoja delante ni marca de origen. */
const desdeElPortal = fn => {
  global.__conInterfaz(false); limpiarOrigenConfiable();
  try { return { bloqueado: false, valor: fn() }; }
  catch (e) { return { bloqueado: true, error: e.message }; }
};
/** Contexto de la hoja: hay interfaz, como cuando se pulsa en el panel. */
const desdeLaHoja = fn => {
  global.__conInterfaz(true); limpiarOrigenConfiable();
  try { return { bloqueado: false, valor: fn() }; }
  catch (e) { return { bloqueado: true, error: e.message }; }
};

const cat = new Hoja(NOMBRE_HOJA_DATOS, TOTAL_COLUMNAS);
cat.datos.push(CABECERAS_CATALOGO.slice());
LIBRO.hojas.push(cat);

console.log("\nVersión: " + VERSION_SCRIPT + "\n");

// ---------------------------------------------------------------- R1
console.log("R1. La administración no se ejecuta desde el navegador");
const p1 = desdeElPortal(() => lanzarAccionHerramienta("generarEnlacePublicoJSON"));
comprobar("el puente de herramientas se cierra sin hoja delante", p1.bloqueado, String(p1.error));
const p2 = desdeElPortal(() => lanzarAccionConfig("configurarApiKeyGemini"));
comprobar("el puente de configuración también", p2.bloqueado);
/* La comprobación que de verdad importa: el puente no es el único camino. */
const p3 = desdeElPortal(() => generarEnlacePublicoJSON());
comprobar("y la operación llamada POR SU NOMBRE también se cierra", p3.bloqueado, String(p3.error));
comprobar("no se llegó a publicar nada en Drive",
  (p3.error || "").indexOf("setSharing") === -1);
const p4 = desdeElPortal(() => estadoConfiguracion());
comprobar("el estado de la configuración no se filtra al portal", p4.bloqueado);
const p5 = desdeLaHoja(() => lanzarAccionHerramienta("nombreInventado"));
comprobar("desde la hoja, un nombre inventado se sigue rechazando", p5.bloqueado);
const p6 = desdeLaHoja(() => estadoConfiguracion());
comprobar("y desde la hoja el panel sí funciona",
  !p6.bloqueado && Array.isArray(p6.valor), String(p6.error));

console.log("\nR1.2. Las funciones de secretos ya no son globales");
/* El guion bajo final es lo único que Apps Script reconoce como privado. Aquí
   se comprueba sobre el texto del script: si alguien reintroduce una de estas
   sin guion, `google.script.run` vuelve a alcanzarla. */
["emitirSesionInterna", "obtenerClaveMaestraSegura", "obtenerClaveMaestra", "obtenerSalDerivada",
 "obtenerMapaTokens", "guardarMapaTokens", "obtenerTokenAdministrador", "obtenerTokenTikTok",
 "obtenerDatosToken", "cifrar", "descifrar", "obtenerApiKey", "guardarApiKey"
].forEach(n => comprobar(n + " es privada",
  src.indexOf("function " + n + "_(") !== -1 && src.indexOf("function " + n + "(") === -1));
comprobar("no quedó ningún alias público que las reabra",
  src.indexOf("function emitirSesionInterna(") === -1 &&
  src.indexOf("function obtenerMapaTokens(") === -1);
comprobar("apiPortal sigue siendo pública: es la puerta del portal",
  src.indexOf("function apiPortal(") !== -1);

console.log("\nR1.3. Las 122 acciones de panel llevan su propia guarda");
const sinGuarda = ACCIONES_PANEL_CONFIG.concat(ACCIONES_PANEL_HERRAMIENTAS).filter(fn => {
  const i = src.indexOf("function " + fn + "(");
  if (i === -1) return false;
  const cuerpo = src.slice(i, src.indexOf("\n}\n", i));
  return cuerpo.indexOf("exigirOrigenInterno(") === -1 &&
         cuerpo.indexOf("exigirContextoHoja_(") === -1 &&
         cuerpo.indexOf("validarTokenConScope(") === -1;
});
comprobar("ninguna acción del panel se queda sin guarda",
  sinGuarda.length === 0, sinGuarda.slice(0, 6).join(", "));

console.log("\nR1.4. Lo que escribe, publica o manda correo tampoco es alcanzable");
/* Las acciones de panel eran 122; las piezas internas con efectos reales son
   otras 92, y una pieza interna pública es una ruta más aunque nadie la
   anuncie. Se comprueba sobre una muestra de cada familia. */
[["setValues en el catálogo", "apartarEnlacesNoVideo"],
 ["publicar en Drive", "generarEnlacePublicoJSON"],
 ["crear un certificado", "generarCertificadoAprobado"],
 ["mandar correo a un tutor", "enviarAlertaEmailTutor"],
 ["salir a la red", "ejecutarFetchSeguro"],
 ["crear carpetas en Drive", "obtenerSubcarpeta"]
].forEach(par => {
  const i = src.indexOf("function " + par[1] + "(");
  const cuerpo = src.slice(i, i + 900);
  comprobar(par[0] + " lleva guarda (" + par[1] + ")",
    i !== -1 && cuerpo.indexOf('exigirOrigenInterno("' + par[1] + '")') !== -1);
});
const conEfectos = ["enviarEmailDiplomaEstudiante", "generarInformePDFIntento", "persistirTextoPesado",
                    "registrarHistoricoEnDrive", "notificarEvento", "enviarEmailRefuerzo"];
comprobar("y la familia entera de la muestra también",
  conEfectos.every(n => {
    const i = src.indexOf("function " + n + "(");
    return i !== -1 && src.slice(i, i + 900).indexOf("exigirOrigenInterno(") !== -1;
  }),
  conEfectos.filter(n => {
    const i = src.indexOf("function " + n + "(");
    return i === -1 || src.slice(i, i + 900).indexOf("exigirOrigenInterno(") === -1;
  }).join(", "));

// ---------------------------------------------------------------- R2
console.log("\nR2. Ningún informe antes de entregar");
marcarOrigenConfiable(); global.__conInterfaz(false);
const hojaInt = new Hoja("_Intentos", INT_COLS);
hojaInt.datos.push(new Array(INT_COLS).fill("cab"));
LIBRO.hojas.push(hojaInt);
const poner = (id, correo, estado) => {
  const f = new Array(INT_COLS).fill("");
  f[INT.ID] = id; f[INT.MODULO] = "MOD_X"; f[INT.EMAIL] = correo; f[INT.NOMBRE] = "Ana";
  f[INT.INICIO] = new Date(); f[INT.ESTADO] = estado; f[INT.PREGUNTAS] = "[]"; f[INT.NUMERO] = 1;
  hojaInt.datos.push(f);
};
poner("I_CURSO", "ana@kuvexta.com", ESTADO_INTENTO.EN_CURSO);
poner("I_VENCIDO", "ana@kuvexta.com", ESTADO_INTENTO.VENCIDO);
poner("I_ANULADO", "ana@kuvexta.com", ESTADO_INTENTO.ANULADO);
poner("I_ENTREGADO", "ana@kuvexta.com", ESTADO_INTENTO.ENTREGADO);
poner("I_AJENO", "otro@kuvexta.com", ESTADO_INTENTO.ENTREGADO);

const sesionAna = { email: "ana@kuvexta.com", scope: "exam" };
const sesionAdmin = { email: "jefe@kuvexta.com", scope: "admin" };
const pedir = (id, ses) => {
  try { informeIntentoDeSesion(id, ses); return { bloqueado: false }; }
  catch (e) { return { bloqueado: true, error: e.message }; }
};
[["I_CURSO", "en curso"], ["I_VENCIDO", "vencido"], ["I_ANULADO", "anulado"]].forEach(par => {
  const r = pedir(par[0], sesionAna);
  comprobar("el dueño NO ve el informe de un intento " + par[1], r.bloqueado, r.error);
});
comprobar("ni un administrador ve el de un intento en curso",
  pedir("I_CURSO", sesionAdmin).bloqueado);
comprobar("un alumno no ve el informe de otro", pedir("I_AJENO", sesionAna).bloqueado);
comprobar("sin sesión, no hay informe", pedir("I_ENTREGADO", null).bloqueado);
const rechazo = pedir("I_CURSO", sesionAna);
comprobar("el rechazo no lleva soluciones dentro",
  (rechazo.error || "").indexOf("respuestaCorrecta") === -1 &&
  (rechazo.error || "").indexOf("justificacion") === -1, rechazo.error);
comprobar("la invariante vive en el generador, no solo en la ruta",
  src.slice(src.indexOf("function obtenerInformeIntento("), src.indexOf("function obtenerInformeIntento(") + 700)
     .indexOf("exigirIntentoEntregado_(registro)") !== -1);
comprobar("y se comprueba ANTES de leer el banco de preguntas", (() => {
  const c = src.slice(src.indexOf("function obtenerInformeIntento("));
  return c.indexOf("exigirIntentoEntregado_(registro)") < c.indexOf("leerClavesExamen(");
})());
comprobar("las tres rutas delegan en la misma función",
  (src.match(/informeIntentoDeSesion\(/g) || []).length >= 4);
comprobar("el PDF comprueba antes de crear el documento", (() => {
  const c = src.slice(src.indexOf('if (action === "informe_pdf")'), src.indexOf('if (action === "notas")'));
  return c.indexOf("informeIntentoDeSesion(") < c.indexOf("generarInformePDFIntento(");
})());

// ---------------------------------------------------------------- R3
console.log("\nR3. La contraseña compartida ya no abre nada");
const resp = JSON.parse(doPost({ postData: { contents: JSON.stringify({
  action: "login", email: "jefe@kuvexta.com", password: "loquesea"
}) } }).getContent());
comprobar("el login responde 403 y sin token",
  resp.exito === false && resp.codigo === 403 && !resp.token, JSON.stringify(resp).slice(0, 90));
comprobar("y el texto dice qué hacer en su lugar",
  (resp.mensaje || "").toLowerCase().indexOf("clave personal") !== -1, resp.mensaje);
comprobar("el panel ya no la anuncia como algo que configurar",
  src.indexOf('et: "Contraseña compartida (retirada)"') !== -1);

console.log("\nR3.1. Las sesiones anteriores quedan invalidadas");
marcarOrigenConfiable();
const viva = emitirSesionInterna_("ana@kuvexta.com", 30, "exam");
comprobar("una sesión nueva vale", Boolean(obtenerDatosToken_(viva)));
comprobar("y lleva dentro la revisión vigente",
  JSON.parse(CacheService.getScriptCache().get("SESSION_" + viva)).revisionAuth === obtenerRevisionAuth_());
/* Una sesión de la versión anterior: la misma forma, sin el campo nuevo. */
const antigua = "sess_antigua";
CacheService.getScriptCache().put("SESSION_" + antigua, JSON.stringify({
  email: "jefe@kuvexta.com", nombre: "Jefe", scope: "admin",
  creado: Date.now(), expira: Date.now() + 3600000
}), 3600);
comprobar("una sesión emitida antes del arreglo se rechaza",
  obtenerDatosToken_(antigua) === null);
PROPS.AUTH_REVISION = "revision-incidente-2";
comprobar("y cambiar AUTH_REVISION echa también a las de ahora",
  obtenerDatosToken_(viva) === null);
delete PROPS.AUTH_REVISION;

// ---------------------------------------------------------------- R4
console.log("\nR4. El asistente pide credencial");
const pedirAsistente = cuerpo => JSON.parse(doPost({ postData: {
  contents: JSON.stringify(Object.assign({ action: "assistant_command" }, cuerpo))
} }).getContent());
/* Lo que se exige de un rechazo no es un código concreto sino que no haya
   respuesta: ni pendientes, ni resultados de búsqueda, ni nada que costara una
   llamada de IA. */
const rechazado = r => r.status === "error" || r.error === true || r.exito === false;
const sinDatos = r => !r.data && !r.respuesta && !r.resultados;
const sinToken = pedirAsistente({ command: "cuántos pendientes hay", email: "jefe@kuvexta.com" });
comprobar("sin token no responde", rechazado(sinToken) && sinDatos(sinToken),
  JSON.stringify(sinToken).slice(0, 90));
const conBasura = pedirAsistente({ token: "sess_inventada", command: "hola" });
comprobar("con un token inventado tampoco", rechazado(conBasura) && sinDatos(conBasura),
  JSON.stringify(conBasura).slice(0, 90));
comprobar("el correo del cliente se ignora: se usa el del token",
  src.indexOf("procesarComandoVoz(comando, sesionAsist.email)") !== -1);
comprobar("la implementación lleva su propia guarda",
  desdeElPortal(() => procesarComandoVoz("hola", "x@y.z")).bloqueado);
comprobar("hay tope de longitud declarado",
  src.indexOf("const LIMITE_COMANDO_ASISTENTE = 1000;") !== -1);

// ---------------------------------------------------------------- R5
console.log("\nR5. «Dejar en blanco» deja en blanco de verdad");
const manejador = portal.slice(portal.indexOf('const lim = document.getElementById("ex-limpiar")'),
                               portal.indexOf('const ant = document.getElementById("ex-ant")'));
comprobar("el campo se vacía además de guardarse",
  manejador.indexOf("campoActual.value = \"\"") !== -1);
comprobar("y se vacía ANTES de guardar, que es lo que evita que reaparezca",
  manejador.indexOf("campoActual.value") < manejador.indexOf('escribirRespuesta(p, "")'));
comprobar("las de opción múltiple siguen por su camino",
  manejador.indexOf("elegirOpcion(p, -1)") !== -1);
comprobar("sin repintar la pregunta: el cursor sigue donde estaba",
  manejador.indexOf("pintarPregunta()") === -1);

// ---------------------------------------------------------------- tercera revisión
console.log("\nA. Los lectores RAG y la ruta que los usa");
["recuperarDocumentoRAG", "recuperarTextoPesado", "recuperarSegmentosRAG",
 "consultarTextoDesacopladoDeDrive"].forEach(n =>
  comprobar(n + " es privada y con guarda",
    src.indexOf("function " + n + "_(") !== -1 &&
    src.indexOf("function " + n + "(") === -1 &&
    src.slice(src.indexOf("function " + n + "_("), src.indexOf("function " + n + "_(") + 400)
       .indexOf('exigirOrigenInterno("' + n + '_")') !== -1));
const rutaRag = src.slice(src.indexOf("if (params.fetch_drive_id)"),
                          src.indexOf("if (params.q)"));
comprobar("la ruta pública exige que el documento sea del catálogo",
  rutaRag.indexOf("documentoRAGDelCatalogo_(params.fetch_drive_id)") !== -1);
comprobar("y lo comprueba ANTES de leer Drive",
  rutaRag.indexOf("documentoRAGDelCatalogo_") < rutaRag.indexOf("recuperarTextoPesado_"));
comprobar("el rechazo no distingue «no existe» de «no es tuyo»",
  rutaRag.indexOf("err_documento_no_autorizado") !== -1 &&
  rutaRag.indexOf("no existe") === -1);
/* La pertenencia se comprueba contra el catálogo real, no contra una lista. */
marcarOrigenConfiable();
cat.datos.push((() => { const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.URL] = "https://youtu.be/X"; f[IDX.ID] = "X"; f[IDX.DRIVE_RAG] = "drv_legitimo"; return f; })());
comprobar("un documento del catálogo se reconoce", documentoRAGDelCatalogo_("drv_legitimo"));
comprobar("uno ajeno no", documentoRAGDelCatalogo_("drv_de_otro") === false);
comprobar("y un id vacío tampoco", documentoRAGDelCatalogo_("") === false);

console.log("\nB. La función de recordatorios ya no se declara confiable a sí misma");
comprobar("es privada",
  src.indexOf("function agendarRecordatoriosDeModulosVencidos_(") !== -1 &&
  src.indexOf("function agendarRecordatoriosDeModulosVencidos(") === -1);
const cuerpoRec = src.slice(src.indexOf("function agendarRecordatoriosDeModulosVencidos_("),
                            src.indexOf("function agendarRecordatoriosDeModulosVencidosUI("));
comprobar("exige origen en vez de marcarlo",
  cuerpoRec.indexOf('exigirOrigenInterno("agendarRecordatoriosDeModulosVencidos_")') !== -1 &&
  cuerpoRec.indexOf("marcarOrigenConfiable()") === -1);
comprobar("la entrada de la hoja avisa antes de mandar invitaciones",
  src.indexOf("No hay control de repetidos") !== -1);
comprobar("y está en el panel, no colgada de un disparador",
  ACCIONES_PANEL_HERRAMIENTAS.indexOf("agendarRecordatoriosDeModulosVencidosUI") !== -1 &&
  src.indexOf('newTrigger("agendarRecordatorios') === -1);

console.log("\nC. La cola mira el reloj antes de gastarlo");
const cuerpoCola = src.slice(src.indexOf("function procesarColaConAntiTimeout_("),
                             src.indexOf("function programarContinuacionIngesta("));
comprobar("hay reserva declarada para el cierre",
  cuerpoCola.indexOf("RESERVA_CIERRE_MS = 90 * 1000") !== -1);
comprobar("la comprobación va ANTES de procesar el bloque",
  cuerpoCola.indexOf("transcurrido + coste + RESERVA_CIERRE_MS > PRESUPUESTO_MS") <
  cuerpoCola.indexOf("enriquecerBloqueIngesta("));
comprobar("se mide lo que tardó el bloque anterior",
  cuerpoCola.indexOf("duracionUltimoBloque = new Date().getTime() - arranqueBloque") !== -1);

console.log("\nE. Un bloque que se pasa de tiempo se suelta por la mitad");
/* El reproche de la tercera revisión: mirar el reloj antes de empezar el bloque
   no acorta el bloque ya empezado. Aquí se le da un límite YA VENCIDO y se
   exige que suelte en la primera fila costosa, diciendo por dónde iba. */
marcarOrigenConfiable();
const filasBloque = [];
for (let i = 0; i < 5; i++) {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  // Un ID de YouTube son once caracteres: con menos el parser lo aparta y la
  // fila no llega a la parte cara, que es justo la que aquí se quiere medir.
  f[IDX.URL] = "https://youtu.be/aaaaaaaaaa" + i;
  filasBloque.push(f);
}
const vencido = enriquecerBloqueIngesta(filasBloque, 200, Date.now() - 1000);
comprobar("suelta el bloque en vez de terminarlo", vencido.detenidoEn === 200,
  "detenidoEn=" + vencido.detenidoEn);
comprobar("y no procesó ninguna fila", vencido.procesados === 0);
comprobar("las filas intactas siguen sin título",
  filasBloque.every(f => !f[IDX.TITULO]));
/* Sin límite se comporta como siempre: el parámetro no cambia a los llamadores
   que no corren contra reloj. */
const sinLimite = enriquecerBloqueIngesta([[]].map(() => new Array(TOTAL_COLUMNAS).fill("")), 300);
comprobar("sin límite, ningún corte", sinLimite.detenidoEn === 0);
const cuerpoCola2 = src.slice(src.indexOf("function procesarColaConAntiTimeout_("),
                              src.indexOf("function programarContinuacionIngesta("));
comprobar("el checkpoint apunta a la fila soltada, no al final del bloque",
  cuerpoCola2.indexOf("startRow = res.detenidoEn;") !== -1);
comprobar("y el bloque se vuelca ANTES de decidir el corte",
  cuerpoCola2.indexOf("rango.setValues(datos)") < cuerpoCola2.indexOf("res.detenidoEn > 0"));
comprobar("el límite del bloque descuenta la reserva de cierre",
  cuerpoCola2.indexOf("inicioEjecucion + PRESUPUESTO_MS - RESERVA_CIERRE_MS") !== -1);
comprobar("queda escrito que una llamada colgada sigue sin acotarse",
  src.indexOf("no admite tiempo de espera") !== -1);

console.log("\nF. El lote de YouTube también mira el reloj");
/* El corte por fila no servía para el caso más común: cien filas de YouTube son
   dos consultas de cincuenta, y las dos se hacían ANTES de que el bucle de
   filas mirara nada. */
const ids = [];
for (let i = 0; i < 120; i++) ids.push("id" + ("00000000" + i).slice(-8));
global.__ytReset();
const lote = obtenerMetadatosYouTubeLote50(ids, Date.now() - 1000);
comprobar("con el límite vencido no consulta ninguno",
  ids.every(id => lote[id] && lote[id].sinTiempo === true));
comprobar("y CERO llamadas a la API, no solo cero datos",
  global.__ytLlamadas === 0, "llamadas=" + global.__ytLlamadas);
global.__ytReset();
const loteVivo = obtenerMetadatosYouTubeLote50(ids, Date.now() + 60000);
comprobar("sin límite vencido sí consulta, en lotes de 50",
  global.__ytLlamadas === 3 && Boolean(loteVivo[ids[0]].titulo),
  "llamadas=" + global.__ytLlamadas);
comprobar("y lo dice con una marca propia, no como «video inexistente»",
  lote[ids[0]].mensaje.indexOf("tiempo") !== -1 && !lote[ids[0]].configuracion,
  lote[ids[0]].mensaje);
const cuerpoLote = src.slice(src.indexOf("function obtenerMetadatosYouTubeLote50("),
                             src.indexOf("function obtenerMetadatosYouTubeLote50(") + 3000);
comprobar("la comprobación va antes de la llamada a la API",
  cuerpoLote.indexOf("limiteMs && Date.now() > limiteMs") < cuerpoLote.indexOf("YouTube.Videos.list"));
comprobar("el enriquecedor le pasa el mismo límite",
  src.indexOf("obtenerMetadatosYouTubeLote50(idsYouTube, limiteMs)") !== -1);
/* Lo que de verdad importa: una fila sin consultar NO se procesa. */
const filasYT = [];
for (let i = 0; i < 3; i++) {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.URL] = "https://youtu.be/bbbbbbbbbb" + i;
  filasYT.push(f);
}
const cortado = enriquecerBloqueIngesta(filasYT, 500, Date.now() - 1000);
comprobar("la primera fila sin consultar corta el bloque", cortado.detenidoEn === 500,
  "detenidoEn=" + cortado.detenidoEn);
comprobar("y ninguna se marca como video inexistente",
  filasYT.every(f => (f[IDX.ERROR] || "").toString().indexOf("inexistente") === -1),
  String(filasYT[0][IDX.ERROR]).slice(0, 60));

console.log("\nG. El avance se guarda cada pocas filas, no solo al final");
comprobar("hay volcado parcial declarado",
  src.indexOf("const VOLCAR_CADA = 25;") !== -1);
comprobar("el llamador le pasa cómo persistir",
  src.indexOf("rango.setValues(datos);\n        SpreadsheetApp.flush();") !== -1);
comprobar("y se fuerza un volcado justo antes de soltar el bloque",
  (src.match(/volcarSiToca\(true, filaSheet\)/g) || []).length >= 2);
/* Se comprueba de verdad: se cuenta cuántas veces se llama al volcado. */
let volcados = 0;
const filasMuchas = [];
for (let i = 0; i < 60; i++) {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.URL] = "https://vimeo.com/" + (900000 + i);   // no es YouTube: sin lote previo
  filasMuchas.push(f);
}
enriquecerBloqueIngesta(filasMuchas, 700, 0, function () { volcados++; });
comprobar("60 filas se vuelcan más de una vez por el camino", volcados >= 2,
  "volcados=" + volcados);

/* Lo que de verdad sostiene la promesa de «como mucho 25 filas»: qué pasa
   cuando la hoja deja de aceptar escrituras. Si el enriquecedor sigue adelante
   tomando nota en memoria, la promesa es falsa. */
let intentos = 0, procesadasTrasFallo = 0;
const filasFallo = [];
for (let i = 0; i < 60; i++) {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.URL] = "https://vimeo.com/" + (800000 + i);
  filasFallo.push(f);
}
const resFallo = enriquecerBloqueIngesta(filasFallo, 1000, 0, function () {
  intentos++;
  throw new Error("La hoja no acepta escrituras (simulado).");
});
procesadasTrasFallo = filasFallo.filter(f => f[IDX.TITULO]).length;
comprobar("un volcado que falla detiene el bloque", resFallo.detenidoEn > 0,
  "detenidoEn=" + resFallo.detenidoEn);
comprobar("y no se reintenta el volcado una y otra vez", intentos === 1,
  "intentos=" + intentos);
comprobar("no sigue procesando filas a ciegas", procesadasTrasFallo <= 25,
  procesadasTrasFallo + " filas tocadas");
comprobar("el checkpoint vuelve al principio, que es lo único a salvo",
  resFallo.detenidoEn === 1000, "detenidoEn=" + resFallo.detenidoEn);
comprobar("si el volcado va bien, la fila segura avanza",
  src.indexOf("filaSegura = filaActual;") !== -1);

/* [6.29] El corte POR TIEMPO también puede fallar al guardar, y entonces la
   fila devuelta no puede ser la de ahora. Diez filas desde la 2000, volcado que
   siempre falla: lo único a salvo es la 2000. */
const filasCorte = [];
for (let i = 0; i < 10; i++) {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.URL] = "https://vimeo.com/" + (700000 + i);
  filasCorte.push(f);
}
/* En el simulador la red es instantánea, así que un corte por tiempo nunca
   llegaría a dispararse a mitad de bloque. Se le hace tardar: 30 ms por fila
   basta para que la primera pase y la segunda encuentre el plazo vencido, que
   es el escenario que se quiere medir —algo hecho y sin guardar—. */
const fetchReal = global.UrlFetchApp.fetch;
global.UrlFetchApp.fetch = function () {
  const hasta = Date.now() + 30;
  while (Date.now() < hasta) { /* espera activa: no hay sleep en este simulador */ }
  return fetchReal.apply(null, arguments);
};
let llamadaVolcado = 0;
const resCorte = enriquecerBloqueIngesta(filasCorte, 2000, Date.now() + 20, function () {
  llamadaVolcado++;
  throw new Error("La hoja no acepta escrituras (simulado).");
});
global.UrlFetchApp.fetch = fetchReal;
comprobar("al cortar por tiempo con la hoja caída, se devuelve la fila segura",
  resCorte.detenidoEn === 2000, "detenidoEn=" + resCorte.detenidoEn);
comprobar("y se marca falloPersistencia, no un corte normal",
  resCorte.falloPersistencia === true);
comprobar("un corte por tiempo SIN fallo no lo marca", (() => {
  const limpias = [];
  for (let i = 0; i < 5; i++) {
    const f = new Array(TOTAL_COLUMNAS).fill("");
    f[IDX.URL] = "https://vimeo.com/" + (600000 + i);
    limpias.push(f);
  }
  const r = enriquecerBloqueIngesta(limpias, 3000, Date.now() - 1000);
  return r.detenidoEn === 3000 && r.falloPersistencia === false;
})());

console.log("\nH. La cola sobrevive a una hoja que no deja escribir");
/* Se ejecuta la función REAL de la cola contra una hoja cuyo setValues lanza.
   Lo que se exige no es que no falle: es que el checkpoint quede donde debe y
   que la cadena automática siga viva. */
const hojaCola = new Hoja(NOMBRE_HOJA_DATOS + "_cola", TOTAL_COLUMNAS);
hojaCola.datos.push(CABECERAS_CATALOGO.slice());
for (let i = 0; i < 8; i++) {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.URL] = "https://vimeo.com/" + (500000 + i);
  hojaCola.datos.push(f);
}
hojaCola.maxFilas = 200;
/* La hoja del catálogo pasa a ser esta, y deja de aceptar escrituras. */
LIBRO.hojas.length = 0;
hojaCola.nombre = NOMBRE_HOJA_DATOS;
LIBRO.hojas.push(hojaCola);
const getRangeReal = hojaCola.getRange.bind(hojaCola);
let escriturasIntentadas = 0;
hojaCola.getRange = function (f, c, nf, nc) {
  const r = getRangeReal(f, c, nf, nc);
  const setValuesReal = r.setValues.bind(r);
  r.setValues = function () { escriturasIntentadas++; throw new Error("Hoja bloqueada (simulado)."); };
  r.setValuesReal = setValuesReal;
  return r;
};
delete PROPS.INGESTA_CHECKPOINT;
delete PROPS.INGESTA_FALLOS_ESCRITURA;
__triggersCreados.length = 0;
const rCola = procesarColaConAntiTimeout_(true);
comprobar("la cola no revienta: devuelve su parte", Boolean(rCola) && rCola.falloPersistencia === true,
  JSON.stringify(rCola));
comprobar("el checkpoint queda en la primera fila no guardada",
  PROPS.INGESTA_CHECKPOINT === "2", "checkpoint=" + PROPS.INGESTA_CHECKPOINT);
comprobar("la continuación SÍ se programa: la cadena no se rompe",
  __triggersCreados.indexOf("procesarColaConAntiTimeout_") !== -1,
  __triggersCreados.join(", ") || "(ninguno)");
comprobar("y se cuenta el fallo para no reintentar eternamente",
  PROPS.INGESTA_FALLOS_ESCRITURA === "1", PROPS.INGESTA_FALLOS_ESCRITURA);
/* A la tercera se deja de encadenar. */
PROPS.INGESTA_FALLOS_ESCRITURA = String(MAX_REINTENTOS_ESCRITURA_INGESTA);
__triggersCreados.length = 0;
const rCola2 = procesarColaConAntiTimeout_(true);
comprobar("pasado el tope, deja de encadenar", rCola2.reintentando === false);
comprobar("y no programa otro disparador",
  __triggersCreados.indexOf("procesarColaConAntiTimeout_") === -1,
  __triggersCreados.join(", "));
comprobar("el contador solo se borra tras una ESCRITURA de verdad",
  src.indexOf("if (huboEscrituraCorrecta) {") !== -1 &&
  src.indexOf("huboEscrituraCorrecta = true;") !== -1);
comprobar("y el volcado parcial también cuenta como escritura",
  src.indexOf("SpreadsheetApp.flush();\n        huboEscrituraCorrecta = true;") !== -1);
comprobar("los fallos que cuentan son los CONSECUTIVOS",
  src.indexOf('if (huboEscrituraCorrecta) props.deleteProperty("INGESTA_FALLOS_ESCRITURA");') !== -1);

/* Los cuatro escenarios del contador, cada uno montado a mano. `prepararCola`
   deja un catálogo con `filas` filas por resolver y el contador donde se diga;
   `escribirFalla` decide cuál de las escrituras revienta. */
const prepararCola = (filas, contador, escribirFalla) => {
  LIBRO.hojas.length = 0;
  const h = new Hoja(NOMBRE_HOJA_DATOS, TOTAL_COLUMNAS);
  h.datos.push(CABECERAS_CATALOGO.slice());
  for (let i = 0; i < filas; i++) {
    const f = new Array(TOTAL_COLUMNAS).fill("");
    f[IDX.URL] = "https://vimeo.com/" + (100000 + i);
    h.datos.push(f);
  }
  h.maxFilas = filas + 50;
  const getRangeReal = h.getRange.bind(h);
  let nEscritura = 0;
  h.getRange = function (f, c, nf, nc) {
    const r = getRangeReal(f, c, nf, nc);
    const setReal = r.setValues.bind(r);
    r.setValues = function (v) {
      nEscritura++;
      if (escribirFalla && escribirFalla(nEscritura)) throw new Error("Hoja bloqueada (simulado).");
      return setReal(v);
    };
    return r;
  };
  LIBRO.hojas.push(h);
  if (contador === null) delete PROPS.INGESTA_FALLOS_ESCRITURA;
  else PROPS.INGESTA_FALLOS_ESCRITURA = String(contador);
  delete PROPS.INGESTA_CHECKPOINT;
  delete PROPS.INGESTA_DETENIDA;
  __triggersCreados.length = 0;
  return h;
};

/* 1. Sin escrituras y con recorrido pendiente: el contador se conserva.
   Las filas ya están resueltas, así que no hay nada que escribir; y la ventana
   se acota para que NO se llegue al final del catálogo, que es donde limpiar
   sí está permitido. */
LIBRO.hojas.length = 0;
const hSin = new Hoja(NOMBRE_HOJA_DATOS, TOTAL_COLUMNAS);
hSin.datos.push(CABECERAS_CATALOGO.slice());
for (let i = 0; i < 300; i++) {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.URL] = "https://youtu.be/dddddddddd" + (i % 10);
  f[IDX.ID] = "dddddddddd" + (i % 10);
  f[IDX.TITULO] = "Ya resuelto";           // nada que hacer
  hSin.datos.push(f);
}
hSin.maxFilas = 400;
LIBRO.hojas.push(hSin);
PROPS.INGESTA_FALLOS_ESCRITURA = "2";
delete PROPS.INGESTA_CHECKPOINT;
/* La ventana corta el recorrido en la fila 150: así la pasada termina SIN haber
   llegado al final del catálogo, que es la única forma de separar «no había
   nada que escribir» de «se acabó el trabajo». Sin acotar, una pasada sin
   trabajo recorre las 300 filas de una sentada y entra por el cierre. */
conVentanaDeFilas(2, 150, function () { procesarColaConAntiTimeout_(true); });
comprobar("sin escrituras y con recorrido pendiente, el contador se conserva",
  PROPS.INGESTA_FALLOS_ESCRITURA === "2", "contador=" + PROPS.INGESTA_FALLOS_ESCRITURA);
comprobar("una ventana terminada NO se confunde con el catálogo terminado",
  src.indexOf("if (ultFila >= ultFilaReal) {") !== -1);
/* [6.32] Esta comprobación era mala: con `|| "0"`, un checkpoint BORRADO se
   convertía en cero y pasaba el «<= 151». Un valor ausente y un valor correcto
   no pueden dar el mismo veredicto. Lo que de verdad protege al usuario no es
   el valor que deje la llamada directa a la cola —esa se usa con ventana solo
   desde dentro— sino que `actualizarTodoDesdeFila`, que es la operación real,
   DEVUELVA el checkpoint como estaba. Eso se prueba abajo, con el valor exacto. */
comprobar("la ventana deja el checkpoint donde llegó, sin borrarlo",
  PROPS.INGESTA_CHECKPOINT === "151", "checkpoint=" + PROPS.INGESTA_CHECKPOINT);
comprobar("solo el final de verdad borra el checkpoint",
  src.indexOf("if (ultFila >= ultFilaReal) props.deleteProperty(\"INGESTA_CHECKPOINT\");") !== -1);

/* La operación completa: «sincronizar desde la fila X hasta la Y» no puede
   llevarse por delante una ingesta que estaba a medias. */
PROPS.INGESTA_CHECKPOINT = "42";
__triggersCreados.length = 0;
actualizarTodoDesdeFila(2, 60);
comprobar("sincronizar un rango devuelve el checkpoint EXACTAMENTE como estaba",
  PROPS.INGESTA_CHECKPOINT === "42", "checkpoint=" + PROPS.INGESTA_CHECKPOINT);
comprobar("y no deja encadenada la continuación, que se saldría de la ventana",
  __triggersCreados.indexOf("procesarColaConAntiTimeout_") === -1,
  __triggersCreados.join(", "));
/* Y si no había ingesta a medias, tampoco se inventa una. */
delete PROPS.INGESTA_CHECKPOINT;
actualizarTodoDesdeFila(2, 60);
comprobar("sin checkpoint previo, no queda ninguno inventado",
  PROPS.INGESTA_CHECKPOINT === undefined, "checkpoint=" + PROPS.INGESTA_CHECKPOINT);
/* Sin fila final es otra cosa: ahí la ingesta SÍ debe seguir su curso. */
PROPS.INGESTA_CHECKPOINT = "42";
actualizarTodoDesdeFila(2, 0);
comprobar("sin fila final, el checkpoint no se restaura: la ingesta sigue",
  PROPS.INGESTA_CHECKPOINT !== "42", "checkpoint=" + PROPS.INGESTA_CHECKPOINT);
delete PROPS.INGESTA_CHECKPOINT;

/* 2. Catálogo terminado: se limpia el contador y el aviso, aunque no se
   escribiera nada. Es un cierre, no una vuelta más. */
PROPS.INGESTA_FALLOS_ESCRITURA = "2";
PROPS.INGESTA_DETENIDA = JSON.stringify({ fila: 9, fallos: 4, cuando: new Date().toISOString() });
PROPS.INGESTA_CHECKPOINT = String(hSin.getLastRow() + 1);
procesarColaConAntiTimeout_(true);
comprobar("al terminar el catálogo se limpian contador y aviso",
  PROPS.INGESTA_FALLOS_ESCRITURA === undefined && PROPS.INGESTA_DETENIDA === undefined,
  "contador=" + PROPS.INGESTA_FALLOS_ESCRITURA + " aviso=" + PROPS.INGESTA_DETENIDA);

/* 3. Un volcado parcial bueno y el siguiente malo: esos fallos NO son
   consecutivos, así que la cuenta vuelve a 1 y la cadena sigue viva. */
prepararCola(60, 3, n => n >= 2);          // la 1.ª escritura pasa, las demás fallan
const r3 = procesarColaConAntiTimeout_(true);
comprobar("un guardado parcial bueno reinicia la cuenta de consecutivos",
  PROPS.INGESTA_FALLOS_ESCRITURA === "1", "contador=" + PROPS.INGESTA_FALLOS_ESCRITURA);
comprobar("y la continuación se programa igualmente",
  __triggersCreados.indexOf("procesarColaConAntiTimeout_") !== -1 && r3.reintentando === true);
comprobar("el checkpoint queda después de lo que sí se guardó",
  parseInt(PROPS.INGESTA_CHECKPOINT, 10) > 2, "checkpoint=" + PROPS.INGESTA_CHECKPOINT);

/* 4. Cuatro fallos sin ninguna escritura buena: parada, aviso y sin cadena. */
prepararCola(60, 3, () => true);           // ninguna escritura funciona
const r4 = procesarColaConAntiTimeout_(true);
comprobar("cuatro fallos seguidos sin escribir detienen la cadena",
  r4.reintentando === false && PROPS.INGESTA_FALLOS_ESCRITURA === "4",
  "contador=" + PROPS.INGESTA_FALLOS_ESCRITURA);
comprobar("queda el estado de parada",
  Boolean(PROPS.INGESTA_DETENIDA), String(PROPS.INGESTA_DETENIDA));
comprobar("y no se programa ninguna continuación",
  __triggersCreados.indexOf("procesarColaConAntiTimeout_") === -1,
  __triggersCreados.join(", "));
delete PROPS.INGESTA_DETENIDA;
delete PROPS.INGESTA_FALLOS_ESCRITURA;

console.log("\nI. Una parada deja rastro donde alguien lo va a ver");
comprobar("el tope se llama reintentos y la cuenta coincide",
  src.indexOf("const MAX_REINTENTOS_ESCRITURA_INGESTA = 3;") !== -1 &&
  src.indexOf("if (fallos <= MAX_REINTENTOS_ESCRITURA_INGESTA) {") !== -1);
comprobar("al pararse se guarda un estado persistente",
  src.indexOf('props.setProperty("INGESTA_DETENIDA"') !== -1);
comprobar("y se usa el canal de notificaciones, no solo el registro",
  src.indexOf('notificarEvento("ingesta_detenida"') !== -1);
/* Sin ventana de caracteres: se compara dentro de la función entera, para que
   escribir un comentario no rompa la comprobación. */
const cuerpoCierre = (() => {
  const i = src.indexOf("function cerrarPorFalloDeEscritura_(");
  return src.slice(i, src.indexOf("\nfunction ", i + 10));
})();
comprobar("el aviso no depende de que alguien tenga la hoja abierta",
  cuerpoCierre.indexOf("notificarEvento(") < cuerpoCierre.indexOf("alertarUsuario("));
comprobar("y el estado persistente se guarda antes que ninguno de los dos",
  cuerpoCierre.indexOf('props.setProperty("INGESTA_DETENIDA"') < cuerpoCierre.indexOf("notificarEvento("));
comprobar("el panel enseña el aviso arriba del todo",
  src.indexOf('(prop("INGESTA_DETENIDA") || prop("TOKEN_ROTACION_PENDIENTE")) ? [{ titulo: "🚨 Atención"') !== -1);
/* [6.33] Las dos cosas que salieron de la validación real en Apps Script. */
comprobar("el botón del aviso dice lo que hace, no «Configurar»",
  src.indexOf('accion: "Reanudar ingesta"') !== -1);
comprobar("el panel sabe pintar una etiqueta propia por fila",
  src.indexOf("var etiqueta = f.accion || (f.ok ?") !== -1);
comprobar("y se repinta solo al terminar una acción",
  src.indexOf("function refrescar() {") !== -1 &&
  src.indexOf(".estadoConfiguracion();") !== -1 &&
  src.slice(src.indexOf("function lanzar(boton, fn)"),
            src.indexOf("function lanzar(boton, fn)") + 1200).indexOf("refrescar()") !== -1);
/* [6.35] Esta comprobación defendía el diseño anterior —secciones incrustadas
   como JSON— que resultó ser justo el agujero. Lo que importa sigue siendo que
   el panel maneje datos y no HTML cocido; lo que cambia es de dónde salen. */
comprobar("las secciones viajan como datos, no como HTML cocido",
  src.indexOf("function pintar(secciones) {") !== -1 &&
  src.indexOf("function filaHTML(f) {") !== -1);
comprobar("el texto que viene de la hoja se escapa antes de pintarlo",
  src.indexOf('.replace(/&/g, "&amp;").replace(/</g, "&lt;")') !== -1);
/* [6.35] Y sobre todo: los datos ya no se interpolan dentro del <script>. */
comprobar("el panel NO lleva las secciones incrustadas en su HTML",
  src.indexOf("var SECCIONES = ${JSON.stringify(secciones)};") === -1 &&
  src.indexOf("var SECCIONES = [];") !== -1);
comprobar("las pide al servidor al abrirse, por el mismo camino que el refresco",
  src.slice(src.indexOf("function abrirPanelConfiguracion("))
     .slice(0, 6000).indexOf(".estadoConfiguracion();") !== -1);
comprobar("y ofrece reanudar desde donde quedó",
  ACCIONES_PANEL_CONFIG.indexOf("reanudarIngestaDetenidaUI") !== -1 &&
  src.indexOf("function reanudarIngestaDetenidaUI(") !== -1);
/* El aviso solo debe aparecer cuando ha pasado algo. */
global.__conInterfaz(true);
delete PROPS.INGESTA_DETENIDA;
comprobar("sin parada, el panel no enseña la sección de atención",
  estadoConfiguracion().every(s2 => s2.titulo.indexOf("Atención") === -1));
PROPS.INGESTA_DETENIDA = JSON.stringify({ fila: 42, fallos: 4, cuando: new Date().toISOString() });
const conAviso = estadoConfiguracion();
comprobar("con parada, sí, y dice por qué fila iba",
  conAviso[0].titulo.indexOf("Atención") !== -1 &&
  conAviso[0].filas[0].et.indexOf("42") !== -1,
  conAviso[0].filas[0] && conAviso[0].filas[0].et);
delete PROPS.INGESTA_DETENIDA;
global.__conInterfaz(false);

console.log("\nD. El sello no se anuncia como cifrado");

comprobar("el formato está documentado como firma, no como confidencialidad",
  src.indexOf("ESTO NO CIFRA") !== -1 && src.indexOf("Base64 no es cifrado") !== -1);
comprobar("el registro tampoco promete cifrado",
  src.indexOf("sello HMAC (firmada, no cifrada)") !== -1);

console.log("\nJ. La etapa 2: disparadores, avisos y rotación de tokens");
/* Los diez manejadores de disparador son ya privados. El guion bajo es lo único
   que Apps Script reconoce, y estos son los que quedaban sin él. */
["ejecutarMantenimientoSemanal", "actualizarDashboardPeriodico", "crearBackupAutomatico",
 "exportarCatalogoAJsonSilencioso", "disparadorNocturnoFase2", "onEditControlMovilTrigger",
 "procesarColaTareasSilencioso", "procesarColaConAntiTimeout", "continuarEmbeddingsCatalogo",
 "registrarRespuestaFormularioCentralizado"
].forEach(n => comprobar(n + " es privada",
  src.indexOf("function " + n + "_(") !== -1 && src.indexOf("function " + n + "(") === -1));
comprobar("y las cadenas de newTrigger usan el nombre nuevo",
  (src.match(/newTrigger\("[a-zA-Z0-9_]+"\)/g) || [])
    .every(m => /_"\)$/.test(m)),
  (src.match(/newTrigger\("[a-zA-Z0-9_]+"\)/g) || []).filter(m => !/_"\)$/.test(m)).join(", "));
comprobar("onOpen conserva su nombre reservado",
  src.indexOf("function onOpen()") !== -1 && src.indexOf("function onOpen_(") === -1);

/* Los siete escenarios de la revisión de la 6.34, ahora como conducta exigida.
   Se monta un ScriptApp con disparadores de verdad —con recurso, origen y
   evento— porque la mitad de los fallos venían de tratar todos igual. */
marcarOrigenConfiable();
let seq = 0, instalados = [], fallarBorrado = null;
const disp = (fn, id, recurso) => ({
  getUniqueId: () => id || String(++seq), getHandlerFunction: () => fn,
  getTriggerSource: () => (recurso ? "FORMS" : "CLOCK"),
  getEventType: () => (recurso ? "ON_FORM_SUBMIT" : "CLOCK"),
  getTriggerSourceId: () => recurso || ""
});
global.ScriptApp.getProjectTriggers = () => instalados.slice();
global.ScriptApp.deleteTrigger = t => {
  if (fallarBorrado && t.getHandlerFunction() === fallarBorrado) throw new Error("fallo al borrar");
  instalados = instalados.filter(x => x.getUniqueId() !== t.getUniqueId());
};
/* El simulador guarda A QUÉ se ató el disparador, que es lo único que permite
   comprobar que la migración no lo cambia de sitio. */
global.ScriptApp.newTrigger = fn => {
  let recurso = "";
  return {
    timeBased() { return this; }, everyHours() { return this; }, everyWeeks() { return this; },
    onWeekDay() { return this; }, atHour() { return this; }, everyDays() { return this; },
    after() { return this; }, inTimezone() { return this; },
    forSpreadsheet(s) { recurso = typeof s === "string" ? s : s.getId(); return this; },
    forForm(f) { recurso = typeof f === "string" ? f : f.getId(); return this; },
    onEdit() { return this; }, onFormSubmit() { return this; },
    create() { const t = disp(fn, "nuevo" + (++seq), recurso || global.__recursoDeTurno || "");
               instalados.push(t); return t; }
  };
};
global.FormApp = { openById: id => ({ getId: () => id }) };

/* 1. El disparador de un formulario NO se borra sin sustituto. */
global.__recursoDeTurno = "form-prueba";
instalados = [disp("registrarRespuestaFormularioCentralizado", "f1", "form-prueba")];
let r = migrarDisparadoresANombresPrivados(false);
comprobar("el disparador de formulario se sustituye, no se borra",
  instalados.length === 1 &&
  instalados[0].getHandlerFunction() === "registrarRespuestaFormularioCentralizado_",
  instalados.map(t => t.getHandlerFunction()).join(", ") || "(ninguno)");
comprobar("y se recrea para el MISMO formulario",
  instalados[0].getTriggerSourceId() === "form-prueba");
global.__recursoDeTurno = "";

/* 2. Una continuación pendiente tampoco se queda sin quien la despierte. */
instalados = [disp("procesarColaConAntiTimeout", "c1")];
migrarDisparadoresANombresPrivados(false);
comprobar("la continuación de la ingesta se recrea",
  instalados.length === 1 &&
  instalados[0].getHandlerFunction() === "procesarColaConAntiTimeout_",
  instalados.map(t => t.getHandlerFunction()).join(", ") || "(ninguno)");

/* 3. Viejo y nuevo del mismo trabajo SÍ son la misma tarea: no se crea un tercero. */
instalados = [disp("actualizarDashboardPeriodico", "v1"),
              disp("actualizarDashboardPeriodico_", "n1")];
r = migrarDisparadoresANombresPrivados(false);
comprobar("con el sustituto ya puesto, solo se retira el viejo",
  instalados.length === 1 && instalados[0].getUniqueId() === "n1",
  instalados.map(t => t.getHandlerFunction() + ":" + t.getUniqueId()).join(", "));
comprobar("y se informa como «ya estaba», no como migrado",
  r.yaEstaban.length === 1 && r.migrados.length === 0);

/* 4. Si falla el borrado, el reintento NO duplica. */
instalados = [disp("actualizarDashboardPeriodico", "v2")];
fallarBorrado = "actualizarDashboardPeriodico";
r = migrarDisparadoresANombresPrivados(false);
comprobar("un borrado fallido se cuenta como fallo, no como éxito",
  r.fallos.length === 1 && r.fallos[0].indexOf("SUSTITUTO CREADO") !== -1, r.fallos.join(" | "));
fallarBorrado = null;
migrarDisparadoresANombresPrivados(false);
comprobar("y al reintentar no se crea un segundo sustituto",
  instalados.filter(t => t.getHandlerFunction() === "actualizarDashboardPeriodico_").length === 1,
  instalados.map(t => t.getHandlerFunction()).join(", "));

/* 5. [6.36] DOS viejos idénticos: no se migra ninguno, se avisa. Antes se creaba
   un sustituto por cada uno y quedaban dos haciendo el mismo trabajo. */
instalados = [disp("actualizarDashboardPeriodico", "d1"),
              disp("actualizarDashboardPeriodico", "d2")];
r = migrarDisparadoresANombresPrivados(false);
comprobar("dos viejos idénticos bloquean la migración",
  r.fallos.length === 1 && r.migrados.length === 0, r.fallos.join(" | "));
comprobar("y no se crea ni se borra nada",
  instalados.length === 2 &&
  instalados.every(t => t.getHandlerFunction() === "actualizarDashboardPeriodico"),
  instalados.map(t => t.getHandlerFunction()).join(", "));
/* Dos NUEVOS iguales también: es el mismo problema por el otro lado. */
instalados = [disp("actualizarDashboardPeriodico", "d3"),
              disp("actualizarDashboardPeriodico_", "n2"),
              disp("actualizarDashboardPeriodico_", "n3")];
r = migrarDisparadoresANombresPrivados(false);
comprobar("dos sustitutos iguales también bloquean", r.fallos.length === 1 && instalados.length === 3);
/* Pero dos formularios DISTINTOS son dos tareas legítimas. */
instalados = [disp("registrarRespuestaFormularioCentralizado", "fa", "form-A"),
              disp("registrarRespuestaFormularioCentralizado", "fb", "form-B")];
global.__recursoPorNombre = true;
r = migrarDisparadoresANombresPrivados(true);
comprobar("dos formularios distintos NO son un duplicado",
  r.fallos.length === 0 && r.migrados.length === 2, r.fallos.join(" | "));
global.__recursoPorNombre = false;

/* 6. [6.36] El disparador de otra hoja vuelve a SU hoja, no a la activa. */
instalados = [disp("onEditControlMovilTrigger", "m1", "hoja-distinta")];
global.__recursoDeTurno = "";   // lo pone la receta, no el simulador
r = migrarDisparadoresANombresPrivados(false);
comprobar("el disparador de edición conserva su hoja de origen",
  instalados.length === 1 && instalados[0].getTriggerSourceId() === "hoja-distinta",
  instalados.map(t => t.getHandlerFunction() + "@" + t.getTriggerSourceId()).join(", "));
/* Y sin recurso identificable, no se toca. */
instalados = [disp("onEditControlMovilTrigger", "m2")];
r = migrarDisparadoresANombresPrivados(false);
comprobar("sin recurso identificable, no se migra y se informa",
  instalados.length === 1 && r.intactos.length === 1 &&
  r.intactos[0].motivo.indexOf("recurso") !== -1, JSON.stringify(r.intactos));
comprobar("el requisito de recurso se declara, no se deduce de los parámetros",
  src.indexOf("exigeRecurso: true") !== -1 &&
  src.indexOf("receta.crear.length > 0") === -1);
comprobar("y la hoja se abre por ID en vez de coger la activa",
  src.indexOf("SpreadsheetApp.openById(recurso)).onEdit()") !== -1);

/* 7. [6.37] El cerrojo, probado por conducta y no por texto.
   Que la línea exista no dice cuándo se toma, ni si se suelta cuando algo
   revienta. Se instrumenta el cerrojo y se exige el orden real. */
let tomados = 0, soltados = 0, tomado = false, lecturas = 0;
const lockReal = global.LockService.getScriptLock;
const getTriggersReal = global.ScriptApp.getProjectTriggers;
global.LockService.getScriptLock = () => ({
  waitLock() { if (tomado) throw new Error("ya estaba tomado"); tomado = true; tomados++; },
  releaseLock() { tomado = false; soltados++; }
});
global.ScriptApp.getProjectTriggers = () => { lecturas++; if (!tomado) throw new Error("SE LEYÓ SIN CERROJO"); return instalados.slice(); };

instalados = [disp("crearBackupAutomatico", "L1")];
r = migrarDisparadoresANombresPrivados(false);
comprobar("el inventario se lee DESPUÉS de tomar el cerrojo",
  r.fallos.length === 0 && r.migrados.length === 1, r.fallos.join(" | "));
comprobar("y el cerrojo se suelta al terminar", tomados === soltados && !tomado,
  tomados + " tomados / " + soltados + " soltados");

/* Si leer el inventario revienta, el cerrojo NO se queda puesto: un cerrojo
   olvidado bloquea todas las migraciones siguientes hasta que caduque. */
global.ScriptApp.getProjectTriggers = () => { throw new Error("fallo de inventario"); };
let propagó = false;
try { migrarDisparadoresANombresPrivados(false); } catch (e) { propagó = true; }
comprobar("una excepción al leer el inventario suelta el cerrojo",
  tomados === soltados && !tomado, tomados + "/" + soltados);
comprobar("y el error no se traga: sale a la superficie", propagó);

/* Con el cerrojo ocupado no se lee ni se modifica nada. */
global.ScriptApp.getProjectTriggers = () => { lecturas++; return instalados.slice(); };
global.LockService.getScriptLock = () => ({
  waitLock() { throw new Error("ocupado"); }, releaseLock() { throw new Error("no adquirido"); }
});
lecturas = 0;
r = migrarDisparadoresANombresPrivados(false);
comprobar("con el cerrojo ocupado se devuelve un fallo, no una excepción",
  r.fallos.length === 1 && r.migrados.length === 0, r.fallos.join(" | "));
comprobar("y NO se llega a leer el inventario", lecturas === 0, "lecturas=" + lecturas);

/* Simular no modifica nada, así que no necesita cerrojo: pedirlo sería
   bloquear a quien esté migrando de verdad solo por mirar. */
const antesSim = instalados.map(t => t.getUniqueId()).join(",");
const sim2 = migrarDisparadoresANombresPrivados(true);
comprobar("la simulación no pide cerrojo ni toca nada",
  sim2.simulado === true && instalados.map(t => t.getUniqueId()).join(",") === antesSim);
global.LockService.getScriptLock = lockReal;
global.ScriptApp.getProjectTriggers = () => instalados.slice();
comprobar("el cerrojo no se mantiene durante el diálogo de confirmación",
  src.slice(src.indexOf("function migrarDisparadoresUI("))
     .slice(0, 3000).indexOf("getScriptLock") === -1);

/* Lo que no se sabe recrear se queda intacto y se dice. */
instalados = [disp("continuarEmbeddingsCatalogo", "e1"), disp("funcionRara", "x1")];
r = migrarDisparadoresANombresPrivados(false);
comprobar("una función desconocida no se toca",
  instalados.some(t => t.getHandlerFunction() === "funcionRara"));
comprobar("la simulación sigue sin escribir nada", (() => {
  instalados = [disp("crearBackupAutomatico", "b1")];
  const antes = instalados.length;
  const sim = migrarDisparadoresANombresPrivados(true);
  return instalados.length === antes && sim.migrados.length === 1 && sim.simulado === true;
})());

console.log("\nK. El canal de avisos y la rotación de tokens");
global.__conInterfaz(true);
delete PROPS.TOKEN_ROTACION_PENDIENTE; delete PROPS.INGESTA_DETENIDA;
const secciones = estadoConfiguracion();
comprobar("el panel tiene una sección para los avisos",
  secciones.some(s => s.titulo.indexOf("Avisos") !== -1));
const secAvisos = secciones.find(s => s.titulo.indexOf("Avisos") !== -1);
comprobar("sin ningún canal, la marca es «falta»", secAvisos.filas[0].ok === false);
comprobar("y ofrece mandar una prueba", secAvisos.filas[0].accion === "Enviar prueba");
PROPS.ALERTAS_EMAIL_ACTIVO = "true";
comprobar("con correo activo, la marca cambia",
  estadoConfiguracion().find(s => s.titulo.indexOf("Avisos") !== -1).filas[0].ok === true);
delete PROPS.ALERTAS_EMAIL_ACTIVO;
comprobar("la prueba avisa de que «enviado» no es «recibido»",
  src.indexOf("que esta ventana diga «enviado» solo") !== -1);

/* [6.35] La rotación, ejecutada de verdad: el generador devuelve una CADENA y
   tratarla como objeto reventaba justo después de emitir. */
global.__conInterfaz(true);
for (const k of Object.keys(PROPS)) delete PROPS[k];
PROPS.ADMIN_TOKEN = "adm_prueba";
const expiraOriginal = Date.now() + 45 * 86400000;
PROPS.API_TOKENS_MAP = JSON.stringify({
  adm_prueba: { scope: "admin", client: "Admin de prueba" },
  tkn_lector: { scope: "read_only", client: "Integración lectora", expira: expiraOriginal },
  tkn_viejo: { scope: "read_only", client: "Caducado", expira: Date.now() - 86400000 }
});
const avisos = [];
let aRotar = "tkn_lector";
global.SpreadsheetApp.getUi = () => ({
  ButtonSet: { OK_CANCEL: 1, OK: 2, YES_NO: 3 }, Button: { OK: "OK", YES: "YES" },
  prompt: () => ({ getSelectedButton: () => "OK", getResponseText: () => aRotar }),
  alert: (...a) => { avisos.push(a.join(" ")); return "OK"; },
  showModalDialog: () => {}
});
let reventó = false;
try { rotarTokenExpuestoUI(); } catch (e) { reventó = true; }
comprobar("rotar un token no lanza", !reventó);
const mapaTras = JSON.parse(PROPS.API_TOKENS_MAP);
const emitido = Object.keys(mapaTras).find(k => k !== "adm_prueba" && k !== "tkn_lector" && k !== "tkn_viejo");
comprobar("se emitió el sustituto", Boolean(emitido), Object.keys(mapaTras).join(", "));
comprobar("y se ENSEÑA, que era lo que se perdía al fallar",
  avisos.some(a => emitido && a.indexOf(emitido) !== -1));
comprobar("queda registrada la rotación pendiente",
  Boolean(PROPS.TOKEN_ROTACION_PENDIENTE), String(PROPS.TOKEN_ROTACION_PENDIENTE));
comprobar("la caducidad se copia EXACTA, no en días redondeados",
  mapaTras[emitido].expira === expiraOriginal,
  mapaTras[emitido].expira + " vs " + expiraOriginal);
comprobar("mismo scope y mismo titular", mapaTras[emitido].scope === "read_only");
/* Un token ya caducado no se rota: rotarlo le regalaría vigencia. */
delete PROPS.TOKEN_ROTACION_PENDIENTE;
aRotar = "tkn_viejo";
avisos.length = 0;
rotarTokenExpuestoUI();
comprobar("un token caducado no se rota",
  !PROPS.TOKEN_ROTACION_PENDIENTE &&
  avisos.some(a => a.indexOf("caducado") !== -1), avisos.join(" | "));
comprobar("el token emitido no aparece en el registro",
  src.indexOf('logInfo("Seguridad", "Rotación iniciada para un token de scope "') !== -1 &&
  src.indexOf("logInfo(\"Seguridad\", nuevoToken") === -1);
for (const k of Object.keys(PROPS)) delete PROPS[k];
global.__conInterfaz(false);

comprobar("rotar es emitir y revocar, en dos pasos",
  src.indexOf("function rotarTokenExpuestoUI(") !== -1 &&
  src.indexOf("function revocarTokenRotadoUI(") !== -1);
comprobar("si algo falla tras emitir, se deshace en vez de dejarlo huérfano",
  src.indexOf("delete deshacer[nuevoToken];") !== -1);
comprobar("no se puede empezar una rotación con otra a medias",
  src.indexOf("Ya hay una rotación empezada y sin terminar") !== -1);
PROPS.TOKEN_ROTACION_PENDIENTE = JSON.stringify({
  client: "Integración ERP", scope: "admin", nuevoPrefijo: "adm_abc",
  cuando: new Date().toISOString(), viejo: "adm_viejo" });
const conRotacion = estadoConfiguracion();
comprobar("una rotación a medias sale en «Atención»",
  conRotacion[0].titulo.indexOf("Atención") !== -1 &&
  conRotacion[0].filas.some(f => f.accion === "Revocar el anterior"));
comprobar("y el texto dice de quién es el token",
  conRotacion[0].filas.some(f => (f.et || "").indexOf("Integración ERP") !== -1),
  conRotacion[0].filas.map(f => f.et).join(" | "));
delete PROPS.TOKEN_ROTACION_PENDIENTE;
global.__conInterfaz(false);

console.log("\nNada de lo anterior se movió");
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
