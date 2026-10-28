/* v2026.6.21 — el menú cabe en la pantalla.
 *
 * La prueba central es aritmética, no estética. Un menú de Google Sheets tiene
 * unas 26 filas útiles desde su borde superior, y un submenú abierto en la fila
 * p dispone de las (26 − p) que quedan por debajo: lo que no cabe se queda
 * fuera de la pantalla, sin aviso y sin scroll. En 6.20, nueve de los diez
 * submenús se salían. Aquí se mide el presupuesto y se exige que sobre. */
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
globalThis.HERRAMIENTAS_AVANZADAS = HERRAMIENTAS_AVANZADAS;
globalThis.lanzarAccionHerramienta = lanzarAccionHerramienta;
globalThis.SEMILLA_TAXONOMIA = SEMILLA_TAXONOMIA;
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

/* Lo que cabe, medido sobre la captura de pantalla real de Andrés: el menú
   ocupaba 24 filas entre y=100 y y=862 (~32 px por fila) y la pantalla acaba
   en y≈930. Se deja margen: 26 filas. */
const FILAS_UTILES = 26;
const onOpenSrc = src.slice(src.indexOf("function onOpen()"),
                            src.indexOf("const PROP_MENU_AVANZADO"));

/* Se cuenta lo que el usuario VE, y hay que separar los dos niveles: los items
   que cuelgan de `menu` ocupan una fila del menú principal; los que cuelgan de
   un `ui.createMenu(...)` ocupan una fila DENTRO de su submenú. La primera
   versión de esta prueba los sumaba todos y decía que el menú corto tenía 42
   filas cuando tiene 16 — contar mal es la forma más fácil de que una prueba de
   geometría no sirva para nada. */
const filasDe = txt =>
  (txt.match(/\.addItem\(/g) || []).length +
  (txt.match(/\.addSeparator\(\)/g) || []).length;

/* Los cuerpos de los submenús, para poder descontarlos del primer nivel. */
const cuerposSub = [];
const reSub = /ui\.createMenu\(t\("(sub[A-Za-z]+)"\)\)([\s\S]*?)\)\);/g;
let mm;
const cuerpoMenu = onOpenSrc.slice(onOpenSrc.indexOf("const menu = ui.createMenu"));
while ((mm = reSub.exec(cuerpoMenu))) cuerposSub.push({ nombre: mm[1], cuerpo: mm[2] });

/** Filas del PRIMER nivel: todo lo que cuelga de `menu`, más una por submenú. */
const filasPrimerNivel = txt => {
  let limpio = txt;
  cuerposSub.forEach(s => { limpio = limpio.split(s.cuerpo).join(""); });
  return filasDe(limpio) + (txt.match(/\.addSubMenu\(/g) || []).length;
};

const bloqueAvanzado = onOpenSrc.slice(onOpenSrc.indexOf("if (avanzado) {"),
                                       onOpenSrc.lastIndexOf("menu.addSeparator()"));

console.log("1. El menú completo cabe en la pantalla");
const filasLargo = filasPrimerNivel(cuerpoMenu);
const filasCorto = filasLargo - filasPrimerNivel(bloqueAvanzado);
console.log("      menú corto: " + filasCorto + " filas · menú completo: " + filasLargo +
  " filas · presupuesto: " + FILAS_UTILES);
comprobar("el menú corto cabe", filasCorto <= FILAS_UTILES, String(filasCorto));
comprobar("el menú completo también", filasLargo <= FILAS_UTILES, String(filasLargo));
comprobar("y sobra sitio para crecer", filasLargo <= FILAS_UTILES - 4,
  (FILAS_UTILES - filasLargo) + " filas libres");

console.log("\n2. Cada submenú cabe desde donde se abre");
/* Es la comprobación que 6.20 no tenía y por eso nadie vio que «Administración»
   tenía tres filas para dieciocho. */
cuerposSub.forEach(s => {
  const alto = filasDe(s.cuerpo) + 1;          // +1: la cabecera del submenú
  const antes = filasPrimerNivel(cuerpoMenu.slice(0, cuerpoMenu.indexOf('t("' + s.nombre + '")')));
  const disponible = FILAS_UTILES - antes;
  comprobar(s.nombre + ": " + alto + " filas, dispone de " + disponible,
    alto <= disponible, "se sale por " + (alto - disponible));
});
const submenus = cuerposSub;
comprobar("quedan pocos submenús, y solo de lo que se usa",
  submenus.length <= 3, String(submenus.length));

console.log("\n3. Nada se perdió: sigue todo alcanzable");
const viejas = fs.readFileSync(__dirname + '/menu_funciones_v612.txt', 'utf8')
  .split('\n').map(s => s.trim()).filter(Boolean);
const ENVUELTAS = { eliminarVideosDuplicados: "eliminarVideosDuplicadosUI" };
const alcanzables = {};
(cuerpoMenu.match(/\.addItem\([^,]*, *"([a-zA-Z0-9_]+)"/g) || [])
  .forEach(s => { alcanzables[s.match(/"([a-zA-Z0-9_]+)"$/)[1]] = "menú"; });
ACCIONES_PANEL_CONFIG.forEach(f => { alcanzables[f] = alcanzables[f] || "configuración"; });
ACCIONES_PANEL_HERRAMIENTAS.forEach(f => { alcanzables[f] = alcanzables[f] || "herramientas"; });
Object.keys(ENVUELTAS).forEach(o => {
  if (alcanzables[ENVUELTAS[o]]) alcanzables[o] = "envuelta";
});
const perdidas = viejas.filter(f => !alcanzables[f]);
comprobar("las " + new Set(viejas).size + " funciones de 6.12 siguen alcanzables",
  perdidas.length === 0, perdidas.join(", "));
console.log("      reparto: menú " +
  Object.values(alcanzables).filter(v => v === "menú").length + " · configuración " +
  ACCIONES_PANEL_CONFIG.length + " · herramientas " + ACCIONES_PANEL_HERRAMIENTAS.length);

console.log("\n4. El panel de herramientas");
comprobar("todas sus acciones existen en el código",
  ACCIONES_PANEL_HERRAMIENTAS.filter(f => src.indexOf("function " + f + "(") === -1).length === 0,
  ACCIONES_PANEL_HERRAMIENTAS.filter(f => src.indexOf("function " + f + "(") === -1).join(", "));
comprobar("sin nombres repetidos",
  new Set(ACCIONES_PANEL_HERRAMIENTAS).size === ACCIONES_PANEL_HERRAMIENTAS.length);
comprobar("ninguna está también en el de configuración",
  ACCIONES_PANEL_HERRAMIENTAS.filter(f => ACCIONES_PANEL_CONFIG.indexOf(f) !== -1).length === 0,
  ACCIONES_PANEL_HERRAMIENTAS.filter(f => ACCIONES_PANEL_CONFIG.indexOf(f) !== -1).join(", "));
const filasPanel = HERRAMIENTAS_AVANZADAS.reduce((a, s) => a.concat(s.filas), []);
comprobar("cada acción se explica en una línea",
  filasPanel.every(f => f[2] && f[2].length > 12),
  (filasPanel.find(f => !f[2] || f[2].length <= 12) || [])[1]);
comprobar("las que cambian muchas filas van avisadas",
  filasPanel.filter(f => f[3]).length >= 8,
  String(filasPanel.filter(f => f[3]).length));
comprobar("hay filtro de texto, que es medio panel",
  src.indexOf("document.getElementById('q').addEventListener('input'") !== -1);

console.log("\n5. El panel solo ejecuta lo suyo");
let fuera = false, inventado = false;
try { lanzarAccionHerramienta("configurarApiKeyGemini"); } catch (e) { fuera = true; }
try { lanzarAccionHerramienta("borrarTodoYa"); } catch (e) { inventado = true; }
comprobar("una acción del OTRO panel se rechaza", fuera);
comprobar("un nombre inventado se rechaza", inventado);
comprobar("la lista sale de la tabla, no se escribe dos veces",
  src.indexOf("HERRAMIENTAS_AVANZADAS\n  .reduce(") !== -1 ||
  src.indexOf("HERRAMIENTAS_AVANZADAS.reduce(") !== -1 ||
  src.indexOf(".reduce((a, s) => a.concat(s.filas.map(f => f[0])), [])") !== -1);

console.log("\n6. Nada de la taxonomía se movió");
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
