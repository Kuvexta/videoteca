/* v2026.6.23 — los agujeros de la revisión de seguridad, cerrados y clavados.
 *
 * Cada bloque reproduce el ataque tal y como se haría desde el portal y exige
 * que ahora falle. Son pruebas de que algo NO se puede hacer, que son las que
 * nadie escribe hasta que ya ha pasado.
 *
 * El mock no tiene `SpreadsheetApp.getUi()`, igual que una ejecución de
 * `google.script.run` o de `doPost`: por eso `limpiarOrigenConfiable()` deja el
 * entorno exactamente en el del navegador, y `marcarOrigenConfiable()` en el
 * del menú. Esa es toda la frontera que separa una llamada legítima de un
 * ataque, así que probarla aquí es probarla de verdad. */
const { LIBRO, Hoja, PROPS } = require('./mockgas.js');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
eval(src + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS; globalThis.IDX = IDX;
globalThis.INT = INT; globalThis.INT_COLS = INT_COLS;
globalThis.ESTADO_INTENTO = ESTADO_INTENTO;
globalThis.INTENTO_VIGENCIA_HORAS = INTENTO_VIGENCIA_HORAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.limpiarOrigenConfiable = limpiarOrigenConfiable;
globalThis.emitirSesionInterna_ = emitirSesionInterna_;
globalThis.generarSesionCorta_ = generarSesionCorta_;
globalThis.obtenerTokenAdministrador_ = obtenerTokenAdministrador_;
globalThis.obtenerClaveMaestraSegura_ = obtenerClaveMaestraSegura_;
globalThis.obtenerClaveMaestra_ = obtenerClaveMaestra_;
globalThis.obtenerSalDerivada_ = obtenerSalDerivada_;
globalThis.obtenerMapaTokens_ = obtenerMapaTokens_;
globalThis.guardarMapaTokens_ = guardarMapaTokens_;
globalThis.validarTokenConScope = validarTokenConScope;
globalThis.obtenerDatosToken_ = obtenerDatosToken_;
globalThis.reconstruirLibroDesdeCero = reconstruirLibroDesdeCero;
globalThis.entregarIntentoModulo = entregarIntentoModulo;
globalThis.migrarCatalogoAV2 = migrarCatalogoAV2;
globalThis.obtenerTokenTikTok_ = obtenerTokenTikTok_;
globalThis.SEMILLA_TAXONOMIA = SEMILLA_TAXONOMIA;
`);

const cat = new Hoja(NOMBRE_HOJA_DATOS, TOTAL_COLUMNAS);
cat.datos.push(CABECERAS_CATALOGO.slice());
LIBRO.hojas.push(cat);

let ok = 0, mal = 0;
const comprobar = (n, c, d) => {
  if (c) { ok++; console.log("  ok   " + n); }
  else { mal++; console.log("  FALLA " + n + (d ? "  → " + d : "")); }
};
/** Ejecuta como lo haría el navegador: sin origen confiable y sin interfaz. */
const desdeElNavegador = fn => {
  limpiarOrigenConfiable();
  try { return { bloqueado: false, valor: fn() }; }
  catch (e) { return { bloqueado: true, error: e.message }; }
  finally { marcarOrigenConfiable(); }
};

console.log("\nVersión: " + VERSION_SCRIPT + "\n");

console.log("1. google.script.run ya no emite sesiones");
marcarOrigenConfiable();
const s1 = desdeElNavegador(() => emitirSesionInterna_("jefe@kuvexta.com", 360, "admin"));
comprobar("emitirSesionInterna_ se bloquea desde el cliente", s1.bloqueado, String(s1.valor));
const s2 = desdeElNavegador(() => generarSesionCorta_("jefe@kuvexta.com", 360, "admin"));
comprobar("y la envoltura también, como ya hacía", s2.bloqueado);
comprobar("desde el menú sigue funcionando",
  typeof emitirSesionInterna_("ana@kuvexta.com", 30, "exam") === "string");

console.log("\n2. Los secretos no salen por la puerta de servicio");
PROPS.ADMIN_TOKEN = "tok_maestro_ficticio";
const t1 = desdeElNavegador(() => obtenerTokenAdministrador_());
comprobar("obtenerTokenAdministrador_ se bloquea", t1.bloqueado, String(t1.valor));
comprobar("y NO devuelve el token en el mensaje de error",
  (t1.error || "").indexOf("tok_maestro_ficticio") === -1, t1.error);
[["obtenerClaveMaestraSegura_", obtenerClaveMaestraSegura_],
 ["obtenerClaveMaestra_", obtenerClaveMaestra_],
 ["obtenerSalDerivada_", obtenerSalDerivada_],
 ["obtenerMapaTokens_", obtenerMapaTokens_],
 ["obtenerTokenTikTok_", obtenerTokenTikTok_]
].forEach(par => {
  const r = desdeElNavegador(par[1]);
  comprobar(par[0] + " se bloquea", r.bloqueado, JSON.stringify(r.valor || "").slice(0, 40));
});
comprobar("desde el menú la clave maestra sigue disponible",
  typeof obtenerClaveMaestraSegura_() === "string" && obtenerClaveMaestraSegura_().length > 10);

console.log("\n3. Lo destructivo tampoco se alcanza desde el portal");
const r1 = desdeElNavegador(() => reconstruirLibroDesdeCero());
comprobar("reconstruirLibroDesdeCero se bloquea", r1.bloqueado, String(r1.error));
comprobar("el libro sigue en pie", LIBRO.hojas.length >= 1 &&
  Boolean(LIBRO.hojas.find(h => h.nombre === NOMBRE_HOJA_DATOS)));
const r2 = desdeElNavegador(() => migrarCatalogoAV2(true));
comprobar("migrarCatalogoAV2 se bloquea", r2.bloqueado);

console.log("\n4. Un token caducado ya no autoriza por ninguna ruta");
marcarOrigenConfiable();
const ayer = Date.now() - 86400000;
const manana = Date.now() + 86400000;
guardarMapaTokens_({
  tok_vencido: { scope: "admin", client: "Integración vieja", email: "x@y.z", expira: ayer },
  tok_vivo: { scope: "admin", client: "Integración viva", email: "x@y.z", expira: manana },
  tok_perpetuo: { scope: "read_only", client: "Lector", email: "l@y.z" }
});
let bloqueoVencido = false;
try { validarTokenConScope("tok_vencido", "read_only"); } catch (e) { bloqueoVencido = true; }
comprobar("validarTokenConScope rechaza el vencido", bloqueoVencido);
comprobar("obtenerDatosToken_ decía lo mismo, y ahora coinciden",
  obtenerDatosToken_("tok_vencido") === null);
comprobar("el token vivo sigue valiendo", validarTokenConScope("tok_vivo", "admin") === true);
comprobar("y el perpetuo sin fecha también", validarTokenConScope("tok_perpetuo", "read_only") === true);
let bloqueoScope = false;
try { validarTokenConScope("tok_perpetuo", "admin"); } catch (e) { bloqueoScope = true; }
comprobar("el scope se sigue exigiendo", bloqueoScope);
comprobar("obtenerTokenAdministrador_ no elige el vencido",
  obtenerTokenAdministrador_() === "tok_vivo", obtenerTokenAdministrador_());

console.log("\n5. El login compartido ya no reparte privilegios: ya no existe");
/* En la 6.23 se limitó a scope «exam»; en la 6.24 se retiró entero, así que lo
   que aquí se comprueba es que no quedó ni el código antiguo debajo. */
comprobar("no emite ninguna sesión",
  src.indexOf('const scopeSesion = rol === "admin" ? "admin" : "exam";') === -1 &&
  src.indexOf('const scopeSesion = "exam";') === -1);
comprobar("y no quedó el compara-contraseña debajo",
  src.indexOf("compararEnTiempoConstante(pass, masterPass)") === -1);
comprobar("la vía del administrador sigue siendo su clave personal",
  src.indexOf("function canjearTokenPorSesion(") !== -1);

console.log("\n6. El solucionario ya no se descarga antes del examen");
const bloqueAudit = src.slice(src.indexOf('if (action === "audit_exam")'),
                              src.indexOf('if (action === "mark_task")'));
comprobar("audit_exam exige scope admin",
  bloqueAudit.indexOf('validarTokenConScope(payload.token, "admin")') !== -1);
comprobar("ya no se conforma con read_only",
  bloqueAudit.indexOf('"read_only"') === -1);
comprobar("el informe propio sigue abierto al alumno (informe_intento)",
  src.indexOf('if (action === "informe_intento")') !== -1);

console.log("\n7. Un examen vencido o anulado no se califica");
marcarOrigenConfiable();
const hojaInt = new Hoja("_Intentos", INT_COLS);
hojaInt.datos.push(new Array(INT_COLS).fill("cab"));
LIBRO.hojas.push(hojaInt);
const sesion = emitirSesionInterna_("ana@kuvexta.com", 60, "exam");
const filaIntento = (id, estado, inicio) => {
  const f = new Array(INT_COLS).fill("");
  f[INT.ID] = id; f[INT.MODULO] = "MOD_X"; f[INT.EMAIL] = "ana@kuvexta.com";
  f[INT.NOMBRE] = "Ana"; f[INT.INICIO] = inicio; f[INT.ESTADO] = estado;
  f[INT.PREGUNTAS] = "[]"; f[INT.NUMERO] = 1;
  hojaInt.datos.push(f);
  return f;
};
filaIntento("INT_VENCIDO", ESTADO_INTENTO.VENCIDO, new Date());
filaIntento("INT_ANULADO", ESTADO_INTENTO.ANULADO, new Date());
filaIntento("INT_CADUCO", ESTADO_INTENTO.EN_CURSO,
  new Date(Date.now() - (INTENTO_VIGENCIA_HORAS + 2) * 3600 * 1000));

const entregar = id => {
  try { entregarIntentoModulo(sesion, id, []); return { bloqueado: false }; }
  catch (e) { return { bloqueado: true, error: e.message }; }
};
const eV = entregar("INT_VENCIDO"), eA = entregar("INT_ANULADO"), eC = entregar("INT_CADUCO");
comprobar("un intento VENCIDO se rechaza", eV.bloqueado, eV.error);
comprobar("un intento ANULADO se rechaza", eA.bloqueado, eA.error);
comprobar("y uno EN_CURSO fuera de plazo también", eC.bloqueado, eC.error);
comprobar("el mensaje dice qué pasó, no «error»",
  (eV.error || "").indexOf("entregar") !== -1 || (eV.error || "").indexOf("VENCIDO") !== -1, eV.error);
comprobar("el que caducó queda marcado VENCIDO en la hoja",
  hojaInt.datos.some(f => f[INT.ID] === "INT_CADUCO" && f[INT.ESTADO] === ESTADO_INTENTO.VENCIDO),
  (hojaInt.datos.find(f => f[INT.ID] === "INT_CADUCO") || [])[INT.ESTADO]);

console.log("\n8. El portal sabe pintar una pregunta de completar");
/* Se lee de esta misma carpeta: una prueba con la ruta de la máquina donde se
   escribió solo funciona en esa máquina, que es justo lo contrario de lo que
   sirve una suite que se entrega. */
const portal = fs.readFileSync(__dirname + '/Index.html', 'utf8');
comprobar("hay un campo de texto para ese tipo",
  portal.indexOf('p.tipo === "completar"') !== -1 && portal.indexOf('id="ex-texto"') !== -1);
comprobar("lo escrito se guarda sin repintar (no se pierde el cursor)",
  portal.indexOf("async function escribirRespuesta(") !== -1 &&
  portal.slice(portal.indexOf("async function escribirRespuesta("),
              portal.indexOf("async function elegirOpcion(")).indexOf("pintarPregunta()") === -1);
comprobar("la entrega manda textoRespuesta y no un índice inventado",
  portal.indexOf('textoRespuesta: typeof dada === "string" ? dada : ""') !== -1);
comprobar("al reanudar se recupera el texto escrito",
  portal.indexOf("p.textoPrevio && p.textoPrevio.trim()") !== -1);
comprobar("el servidor ya mandaba el tipo; no hacía falta tocarlo",
  src.indexOf("function filtrarPreguntaParaCliente(") !== -1 &&
  src.slice(src.indexOf("function filtrarPreguntaParaCliente(")).slice(0, 700).indexOf("tipo: q.tipo") !== -1);

console.log("\n9. Nada de lo anterior se movió");
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
