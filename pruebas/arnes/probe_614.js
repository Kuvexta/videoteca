/* v2026.6.14 — el menú se acorta SIN perder nada.
   La pregunta que importa no es «¿se ve más corto?» sino «¿sigue estando todo?».
   Se compara contra la lista literal de las 145 funciones que tenía el menú en
   6.12, guardada en menu_funciones_v612.txt. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
eval(src + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.ACCIONES_PANEL_CONFIG = ACCIONES_PANEL_CONFIG;
globalThis.ACCIONES_PANEL_HERRAMIENTAS = ACCIONES_PANEL_HERRAMIENTAS;
globalThis.PROP_MENU_AVANZADO = PROP_MENU_AVANZADO;
globalThis.menuAvanzadoActivo = menuAvanzadoActivo;
globalThis.alternarMenuAvanzado = alternarMenuAvanzado;
globalThis.establecerMenuAvanzado = establecerMenuAvanzado;
globalThis.lanzarAccionConfig = lanzarAccionConfig;
globalThis.estadoConfiguracion = estadoConfiguracion;
globalThis.SEMILLA_TAXONOMIA = SEMILLA_TAXONOMIA;
globalThis.t = t;
`);
const cat = new Hoja(NOMBRE_HOJA_DATOS, TOTAL_COLUMNAS);
cat.datos.push(CABECERAS_CATALOGO.slice());
LIBRO.hojas.push(cat);
marcarOrigenConfiable();

let ok = 0, mal = 0;
const comprobar = (n, c, d) => {
  if (c) { ok++; console.log("  ok   " + n); }
  else { mal++; console.log("  FALLA " + n + (d ? "  → " + d : "")); }
};

console.log("\nVersión: " + VERSION_SCRIPT + "\n");

/* El menú se construye con encadenamiento, así que en vez de ejecutarlo se lee
   el bloque de onOpen: es lo único que refleja de verdad qué item existe. */
const onOpenSrc = src.slice(src.indexOf("function onOpen()"),
                            src.indexOf("const PROP_MENU_AVANZADO"));
const itemsMenu = (onOpenSrc.match(/\.addItem\([^,]*, *"([a-zA-Z0-9_]+)"/g) || [])
  .map(s => s.match(/"([a-zA-Z0-9_]+)"$/)[1]);
const bloqueAvanzado = onOpenSrc.slice(onOpenSrc.indexOf("if (avanzado) {"),
                                       onOpenSrc.lastIndexOf("menu.addSeparator()"));
const lee = txt => (txt.match(/\.addItem\([^,]*, *"([a-zA-Z0-9_]+)"/g) || [])
  .map(s => s.match(/"([a-zA-Z0-9_]+)"$/)[1]);
/* Primer nivel = lo que cuelga de `menu` antes del primer submenú, más el
   interruptor del final. Es lo que se ve al desplegar sin entrar en nada. */
const primerNivel = lee(onOpenSrc.slice(onOpenSrc.indexOf("const menu = ui.createMenu"),
                                        onOpenSrc.indexOf("menu.addSubMenu")))
  .concat(lee(onOpenSrc.slice(onOpenSrc.lastIndexOf("menu.addSeparator()"))));
const itemsBasicos = itemsMenu.filter(f => bloqueAvanzado.indexOf('"' + f + '"') === -1);

console.log("1. No se perdió ninguna función por el camino");
const viejas = fs.readFileSync(__dirname + '/menu_funciones_v612.txt', 'utf8')
  .split('\n').map(s => s.trim()).filter(Boolean);
/* Una función puede haber sido envuelta a propósito por otra que pregunta
   antes de actuar. Eso no es perderla, pero tampoco vale con borrarla de la
   lista y olvidarse: se declara aquí, y la prueba comprueba que la envoltura
   existe y que la original sigue en el código. */
const ENVUELTAS = {
  eliminarVideosDuplicados: "eliminarVideosDuplicadosUI"   // [6.15] ahora pide confirmación
};
/* [6.21] Tres contenedores, no dos: lo avanzado dejó de ser submenús y pasó a
   su propio panel porque no cabía en la pantalla. La garantía no cambia —todo
   sigue alcanzable—, cambia dónde. */
const alcanzables = {};
itemsMenu.forEach(f => { alcanzables[f] = "menú"; });
ACCIONES_PANEL_CONFIG.forEach(f => { alcanzables[f] = alcanzables[f] || "configuración"; });
ACCIONES_PANEL_HERRAMIENTAS.forEach(f => { alcanzables[f] = alcanzables[f] || "herramientas"; });
Object.keys(ENVUELTAS).forEach(orig => {
  if (alcanzables[ENVUELTAS[orig]] && src.indexOf("function " + orig + "(") !== -1) {
    alcanzables[orig] = "envuelta en " + ENVUELTAS[orig];
  }
});
const perdidas = viejas.filter(f => !alcanzables[f]);
comprobar("las " + new Set(viejas).size + " funciones de 6.12 siguen alcanzables",
  perdidas.length === 0, perdidas.join(", "));
comprobar("todas las de los dos paneles existen de verdad en el código",
  ACCIONES_PANEL_CONFIG.concat(ACCIONES_PANEL_HERRAMIENTAS)
    .filter(f => src.indexOf("function " + f + "(") === -1).length === 0,
  ACCIONES_PANEL_CONFIG.concat(ACCIONES_PANEL_HERRAMIENTAS)
    .filter(f => src.indexOf("function " + f + "(") === -1).join(", "));
Object.keys(ENVUELTAS).forEach(orig =>
  comprobar(orig + " sigue existiendo, envuelta en " + ENVUELTAS[orig],
    src.indexOf("function " + orig + "(") !== -1 &&
    (itemsMenu.indexOf(ENVUELTAS[orig]) !== -1 ||
     ACCIONES_PANEL_HERRAMIENTAS.indexOf(ENVUELTAS[orig]) !== -1)));
comprobar("todas las del menú existen de verdad en el código",
  itemsMenu.filter(f => src.indexOf("function " + f + "(") === -1).length === 0,
  itemsMenu.filter(f => src.indexOf("function " + f + "(") === -1).join(", "));

console.log("\n2. El menú corto es de verdad corto");
console.log("      primer nivel: " + primerNivel.length + " items · menú corto completo: " +
  itemsBasicos.length + " · menú avanzado: " + itemsMenu.length +
  " · panel: " + ACCIONES_PANEL_CONFIG.length + " acciones");
comprobar("el primer nivel cabe de un vistazo (≤ 12 items)",
  primerNivel.length <= 12, String(primerNivel.length));
comprobar("el menú corto es menos de la mitad que los 145 de 6.12",
  itemsBasicos.length * 2 < 145, String(itemsBasicos.length));
comprobar("y el avanzado sigue siendo más corto que 6.12 (lo de ajuste se fue al panel)",
  itemsMenu.length < 145, String(itemsMenu.length));

console.log("\n3. Lo de cada semana está en el menú corto");
["ejecutarFase1Rapida", "continuarIngestaDesdeCheckpoint", "ejecutarFase2Profunda",
 "actualizarTodo", "crearDashboardTiempoReal", "generarPestanaBuscador",
 "importarVideosDesdePlaylistUI", "abrirDeadLetterQueue",
 "abrirPanelConfiguracion", "alternarMenuAvanzado"].forEach(f =>
  comprobar(f, primerNivel.indexOf(f) !== -1));

console.log("\n4. Lo de una sola vez YA NO está en el menú");
["configurarApiKeyGemini", "configurarClaudeKey", "configurarTwitchKeys",
 "configurarVimeoKey", "configurarFacebookKey", "instalarTriggerDashboard",
 "programarMantenimientoSemanal", "instalarDisparadorBackupSemanal"].forEach(f =>
  comprobar(f + " vive en el panel", itemsMenu.indexOf(f) === -1 &&
    ACCIONES_PANEL_CONFIG.indexOf(f) !== -1));
comprobar("las pruebas unitarias no se ven en el menú corto",
  itemsBasicos.indexOf("ejecutarPruebasUnitarias") === -1);
comprobar("pero siguen ahí, en el panel de herramientas",
  ACCIONES_PANEL_HERRAMIENTAS.indexOf("ejecutarPruebasUnitarias") !== -1);

console.log("\n5. El interruptor");
comprobar("apagado por defecto", menuAvanzadoActivo() === false);
comprobar("no reutiliza APP_MODE, que es del portal",
  PROP_MENU_AVANZADO === "MENU_AVANZADO" && PROP_MENU_AVANZADO !== "APP_MODE");
establecerMenuAvanzado(true);
comprobar("se enciende", menuAvanzadoActivo() === true);
establecerMenuAvanzado(false);
comprobar("y se vuelve a apagar", menuAvanzadoActivo() === false);
comprobar("el texto dice lo que hará el clic, no el estado",
  t("menuAvanzadoOff").indexOf("Mostrar") !== -1 &&
  t("menuAvanzadoOn").indexOf("Ocultar") !== -1,
  t("menuAvanzadoOff") + " / " + t("menuAvanzadoOn"));

console.log("\n6. El panel solo ejecuta lo que está en su lista");
let bloqueado = false;
try { lanzarAccionConfig("eliminarVideosDuplicados"); }
catch (e) { bloqueado = true; }
comprobar("una función que NO está en la lista se rechaza", bloqueado);
let bloqueado2 = false;
try { lanzarAccionConfig("borrarTodo"); } catch (e) { bloqueado2 = true; }
comprobar("un nombre inventado se rechaza", bloqueado2);
comprobar("la lista no tiene duplicados",
  new Set(ACCIONES_PANEL_CONFIG).size === ACCIONES_PANEL_CONFIG.length);

console.log("\n7. El panel dice en qué estado está cada cosa");
/* [6.24] El panel solo existe desde la hoja: se simula tenerla delante, que es
   exactamente la condición que `exigirContextoHoja_` comprueba. */
global.__conInterfaz(true);
const est = estadoConfiguracion();
comprobar("devuelve datos, no HTML", Array.isArray(est) && est.length >= 5);
const filas = est.reduce((a, s) => a.concat(s.filas), []);
comprobar("cada fila sabe a qué función llama",
  filas.every(f => f.fn && ACCIONES_PANEL_CONFIG.indexOf(f.fn) !== -1),
  (filas.find(f => ACCIONES_PANEL_CONFIG.indexOf(f.fn) === -1) || {}).fn);
comprobar("cada fila tiene etiqueta en castellano llano",
  filas.every(f => f.et && f.et.length > 2));
comprobar("distingue lo obligatorio de lo opcional",
  filas.some(f => f.opcional) && filas.some(f => !f.opcional && !f.neutro));
comprobar("sin nada configurado, marca pendientes",
  filas.filter(f => !f.neutro && !f.opcional && !f.ok).length > 0);

console.log("\n8. Nada de lo anterior se movió");
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
