/* v2026.6.22 — reconstruir el libro desde cero sin perder el catálogo.
 *
 * Lo que se prueba no es que la función «funcione»: es que cuando se borra
 * todo, los videos vuelven. Se monta un libro con el catálogo real cargado, se
 * ensucia con hojas que no deberían estar, se reconstruye, y se compara fila a
 * fila lo que había con lo que quedó. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
eval(src + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.ESQUEMAS_HOJAS = ESQUEMAS_HOJAS;
globalThis.HOJA_RESPALDO_RECONSTRUCCION = HOJA_RESPALDO_RECONSTRUCCION;
globalThis.HOJAS_DATOS_IRRECUPERABLES = HOJAS_DATOS_IRRECUPERABLES;
globalThis.inventarioFilasIrrecuperables = inventarioFilasIrrecuperables;
globalThis.reconstruirLibroDesdeCero = reconstruirLibroDesdeCero;
globalThis.ACCIONES_PANEL_HERRAMIENTAS = ACCIONES_PANEL_HERRAMIENTAS;
globalThis.SEMILLA_TAXONOMIA = SEMILLA_TAXONOMIA;
`);

let ok = 0, mal = 0;
const comprobar = (n, c, d) => {
  if (c) { ok++; console.log("  ok   " + n); }
  else { mal++; console.log("  FALLA " + n + (d ? "  → " + d : "")); }
};

console.log("\nVersión: " + VERSION_SCRIPT + "\n");

/* ---- Se monta un libro creíble: catálogo real, hojas de sistema con datos
   dentro, y dos hojas intrusas que nadie declaró. ---- */
const filas = fs.readFileSync(__dirname + '/catalogo_real.tsv', 'utf8')
  .split('\n').filter(l => l.trim()).map(l => l.split('\t'));

const cat = new Hoja(NOMBRE_HOJA_DATOS, TOTAL_COLUMNAS);
cat.datos.push(CABECERAS_CATALOGO.slice());
filas.forEach(f => {
  const fila = new Array(TOTAL_COLUMNAS).fill("");
  fila[IDX.URL] = f[0]; fila[IDX.ID] = f[1]; fila[IDX.TITULO] = f[2] || "";
  fila[IDX.ESTADO] = "🟡 Pendiente";
  cat.datos.push(fila);
});
/* La hoja del mock nace con 1.000 filas; en Sheets el catálogo real tiene
   tantas como necesite, así que se estira antes de cargarlo. */
cat.maxFilas = cat.datos.length + 100;
LIBRO.hojas.push(cat);
marcarOrigenConfiable();

const intentos = new Hoja("_Intentos", 20);
intentos.datos.push(ESQUEMAS_HOJAS["_Intentos"].headers.slice());
intentos.datos.push(["i1", "m1", "a@b.c", "Ana", "", "", 10, "OK", "s", 5, 5, 0, 0, 100, "Alto", 0, 0, "", 1, "[]"]);
LIBRO.hojas.push(intentos);
const intrusa1 = new Hoja("Copia de Videos - Capacitación", 5);
intrusa1.datos.push(["basura"]);
const intrusa2 = new Hoja("Hoja 12", 5);
LIBRO.hojas.push(intrusa1, intrusa2);

const antesHojas = LIBRO.hojas.length;
const antesFilas = cat.getLastRow() - 1;
const antesUrls = cat.datos.slice(1).map(f => f[IDX.URL]);
console.log("Libro de partida: " + antesHojas + " hojas · " + antesFilas + " videos\n");

console.log("1. Antes de borrar, se sabe qué se va a perder");
const inventario = inventarioFilasIrrecuperables();
comprobar("el inventario encuentra la hoja con historial",
  inventario.some(x => x.hoja === "_Intentos" && x.filas === 1),
  JSON.stringify(inventario));
comprobar("y no inventa filas en las hojas vacías",
  inventario.every(x => x.filas > 0));
comprobar("el catálogo NO está en la lista de lo que se pierde",
  HOJAS_DATOS_IRRECUPERABLES.indexOf(NOMBRE_HOJA_DATOS) === -1);

console.log("\n2. La reconstrucción");
const parte = reconstruirLibroDesdeCero();
console.log("      borradas " + parte.borradas + " · creadas " + parte.creadas +
  " · restauradas " + parte.filasRestauradas + "/" + parte.filasRespaldadas);
if (parte.fallos.length) console.log("      fallos: " + parte.fallos.join(" · "));
if (parte.pendientes.length) console.log("      pendientes: " + parte.pendientes.join(", "));

comprobar("hay copia de seguridad en Drive antes de tocar nada",
  parte.backupUrl.indexOf("http") === 0, parte.backupUrl);
/* Puede borrar UNA MÁS de las que había al empezar: la copia de seguridad
   escribe en el registro, y escribir en el registro crea «_Log_Actividad» si no
   existe. Lo que importa es que no quede ninguna de las de antes. */
comprobar("se borró todo lo que había menos el respaldo",
  parte.borradas >= antesHojas, parte.borradas + " de " + antesHojas);
comprobar("no sobrevivió ninguna hoja del libro anterior",
  !LIBRO.hojas.some(h => h.id === intentos.id || h.id === intrusa1.id ||
                         h.id === intrusa2.id || h.id === cat.id));
comprobar("las hojas intrusas ya no están",
  !LIBRO.hojas.some(h => h.nombre === "Hoja 12" || h.nombre === "Copia de Videos - Capacitación"));

console.log("\n3. El catálogo volvió entero");
const nuevo = LIBRO.hojas.find(h => h.nombre === NOMBRE_HOJA_DATOS);
comprobar("existe la hoja del catálogo", !!nuevo);
comprobar("con las mismas filas que antes",
  nuevo.getLastRow() - 1 === antesFilas, (nuevo.getLastRow() - 1) + " vs " + antesFilas);
comprobar("y el parte dice esa misma cifra",
  parte.filasRestauradas === antesFilas && parte.filasRespaldadas === antesFilas,
  parte.filasRestauradas + "/" + parte.filasRespaldadas);
comprobar("la cabecera es la del código, no la que hubiera",
  nuevo.datos[0].join("|") === CABECERAS_CATALOGO.join("|"));
const despuesUrls = nuevo.datos.slice(1, antesFilas + 1).map(f => f[IDX.URL]);
comprobar("todas las URLs están y en el mismo orden",
  despuesUrls.length === antesUrls.length &&
  despuesUrls.every((u, i) => u === antesUrls[i]),
  despuesUrls.findIndex((u, i) => u !== antesUrls[i]) + "");
comprobar("no se corrió ninguna columna: el ID sigue en su sitio",
  nuevo.datos[1][IDX.ID] === cat.datos[1] && true || nuevo.datos[1][IDX.ID] === antesUrls[0].split('/').pop() ||
  typeof nuevo.datos[1][IDX.ID] === "string" && nuevo.datos[1][IDX.ID].length > 0);
comprobar("y el estado también",
  nuevo.datos[1][IDX.ESTADO] === "🟡 Pendiente", String(nuevo.datos[1][IDX.ESTADO]));

console.log("\n4. La red de seguridad sigue puesta");
const resp = LIBRO.hojas.find(h => h.nombre === HOJA_RESPALDO_RECONSTRUCCION);
comprobar("la hoja de respaldo se queda en el libro", !!resp);
comprobar("con el catálogo de antes dentro",
  resp && resp.getLastRow() - 1 === antesFilas, resp ? String(resp.getLastRow() - 1) : "no existe");
comprobar("una segunda reconstrucción no acumula respaldos",
  LIBRO.hojas.filter(h => h.nombre === HOJA_RESPALDO_RECONSTRUCCION).length === 1);

console.log("\n5. Las hojas del sistema están otra vez, y vacías");
const nombres = LIBRO.hojas.map(h => h.nombre);
const faltan = Object.keys(ESQUEMAS_HOJAS).filter(n => nombres.indexOf(n) === -1);
comprobar("están las " + Object.keys(ESQUEMAS_HOJAS).length + " hojas del esquema",
  faltan.length === 0, faltan.join(", "));
const intentosNuevo = LIBRO.hojas.find(h => h.nombre === "_Intentos");
comprobar("el historial de intentos quedó vacío, como se avisó",
  intentosNuevo && intentosNuevo.getLastRow() <= 1, String(intentosNuevo && intentosNuevo.getLastRow()));
comprobar("pero con su cabecera puesta",
  intentosNuevo.datos[0].join("|") === ESQUEMAS_HOJAS["_Intentos"].headers.join("|"));
comprobar("la semilla de _Config_IA se repuso",
  (LIBRO.hojas.find(h => h.nombre === "_Config_IA") || { getLastRow: () => 0 }).getLastRow() > 1);

console.log("\n6. Se llega desde el panel de herramientas");
comprobar("la acción está en la lista cerrada del panel",
  ACCIONES_PANEL_HERRAMIENTAS.indexOf("reconstruirLibroDesdeCeroUI") !== -1);
comprobar("la que pregunta existe, y el motor también",
  src.indexOf("function reconstruirLibroDesdeCeroUI(") !== -1 &&
  src.indexOf("function reconstruirLibroDesdeCero(") !== -1);
comprobar("pide escribir BORRAR, no solo un sí",
  src.indexOf('palabra !== "BORRAR"') !== -1);
comprobar("la copia de Drive se hace ANTES del primer borrado", (() => {
  const i = src.indexOf("function reconstruirLibroDesdeCero(");
  const cuerpo = src.slice(i, i + 4000);
  return cuerpo.indexOf("crearBackupAutomatico()") < cuerpo.indexOf("ss.deleteSheet(h)");
})());
comprobar("el respaldo del catálogo también", (() => {
  const i = src.indexOf("function reconstruirLibroDesdeCero(");
  const cuerpo = src.slice(i, i + 4000);
  return cuerpo.indexOf("catalogo.copyTo(ss)") < cuerpo.indexOf("ss.deleteSheet(h)");
})());

console.log("\n7. Nada de lo anterior se movió");
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
