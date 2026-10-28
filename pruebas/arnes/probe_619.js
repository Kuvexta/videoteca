/* v2026.6.19 — los cuatro cierres operativos.
 *
 * El primero es el que importa: hasta ahora, un fallo temporal de la API de
 * YouTube podía dejar cincuenta videos vivos marcados como muertos, y desde
 * 6.13 esa marca además impide reintentarlos. Aquí se simulan los tres
 * desenlaces del lote —responde bien, se cae, no está habilitado— y se exige
 * que solo el primero permita concluir que un video no existe. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
eval(src + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.obtenerMetadatosYouTubeLote50 = obtenerMetadatosYouTubeLote50;
globalThis.obtenerMetadatosPorPlataforma = obtenerMetadatosPorPlataforma;
globalThis.esFalloDefinitivo = esFalloDefinitivo;
globalThis.MARCA_SIN_METADATOS = MARCA_SIN_METADATOS;
globalThis.SEMILLA_TAXONOMIA = SEMILLA_TAXONOMIA;
globalThis.verificarMigracionV2 = verificarMigracionV2;
globalThis.obtenerHojaDatos = obtenerHojaDatos;
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

const IDS = ["vivo1", "vivo2", "borrado"];
const comoLoLee = entrada =>
  obtenerMetadatosPorPlataforma({ plataforma: "YouTube", id: entrada }, "", mapa);
let mapa;

console.log("1. La API responde bien: el id ausente SÍ es un video que no está");
globalThis.YouTube = { Videos: { list: () => ({ items: [
  { id: "vivo1", snippet: { title: "Uno", channelTitle: "c", publishedAt: "2026-01-01" },
    contentDetails: { duration: "PT5M" }, statistics: {} },
  { id: "vivo2", snippet: { title: "Dos", channelTitle: "c", publishedAt: "2026-01-01" },
    contentDetails: { duration: "PT5M" }, statistics: {} }
] }) } };
mapa = obtenerMetadatosYouTubeLote50(IDS);
comprobar("los dos que respondieron traen título",
  mapa.vivo1 && mapa.vivo1.titulo === "Uno" && mapa.vivo2.titulo === "Dos");
comprobar("el que NO vino se queda sin entrada", mapa.borrado === undefined,
  JSON.stringify(mapa.borrado));
comprobar("y la ingesta lo lee como «no disponible»", comoLoLee("borrado") === null);

console.log("\n2. LO IMPORTANTE: el lote se cae y NADIE queda como inexistente");
[[403, "quota exceeded (403)"], [429, "rate limit (429)"], [500, "backend error (500)"],
 [503, "service unavailable (503)"]].forEach(([codigo, mensaje]) => {
  globalThis.YouTube = { Videos: { list: () => { throw new Error(mensaje); } } };
  mapa = obtenerMetadatosYouTubeLote50(IDS);
  const faltan = IDS.filter(id => mapa[id] === undefined);
  comprobar("HTTP " + codigo + ": los " + IDS.length + " ids traen entrada",
    faltan.length === 0, "sin entrada: " + faltan.join(", "));
  comprobar("   y ninguno se lee como video inexistente",
    IDS.every(id => comoLoLee(id) !== null),
    IDS.filter(id => comoLoLee(id) === null).join(", "));
  comprobar("   son _error, o sea reintentables",
    IDS.every(id => mapa[id] && mapa[id]._error === true), JSON.stringify(mapa[IDS[0]]));
  comprobar("   y NO degradan (no llevan la marca que corta el reintento)",
    IDS.every(id => !mapa[id]._sinMetadatos));
});

console.log("\n3. El servicio avanzado sin habilitar es configuración, no videos muertos");
delete globalThis.YouTube;
mapa = obtenerMetadatosYouTubeLote50(IDS);
comprobar("todos los ids traen entrada", IDS.every(id => mapa[id] !== undefined));
comprobar("marcada como problema de configuración",
  IDS.every(id => mapa[id].configuracion === true), JSON.stringify(mapa[IDS[0]]));
comprobar("ninguno se lee como inexistente", IDS.every(id => comoLoLee(id) !== null));
comprobar("el mensaje dice qué hacer",
  (mapa[IDS[0]].mensaje || "").indexOf("Habilita el servicio") === 0, mapa[IDS[0]].mensaje);
/* Con `configuracion` la ingesta usa `anotarPendienteDeConfiguracion`: no toca
   el Estado, así que la siguiente pasada la recoge sola. */
comprobar("existe la rama que respeta el Estado en esos casos",
  src.indexOf("videoData._error && videoData.configuracion") !== -1);

console.log("\n4. Una sola definición de «fallo definitivo»");
comprobar("gestionarErrorFila usa esFalloDefinitivo",
  src.indexOf("const terminal = esFalloDefinitivo(httpCode);") !== -1);
comprobar("ya no queda la lista vieja con 403",
  src.indexOf("httpCode === 403 || httpCode === 404 || httpCode === 410") === -1);
comprobar("403 NO es definitivo (es «no tienes permiso»)", esFalloDefinitivo(403) === false);
comprobar("404 sigue siéndolo", esFalloDefinitivo(404) === true);

console.log("\n5. La marca corta el reintento aunque no haya id");
comprobar("la condición ya no exige id",
  src.indexOf("if (esFilaDegradada(datos[i][IDX.ERROR])) continue;") !== -1 &&
  src.indexOf("if (id && (datos[i][IDX.ERROR]") === -1);
comprobar("el enlace corto de TikTok, que nunca da id, queda cubierto",
  src.indexOf("nunca llega a dar uno") !== -1);

console.log("\n6. El verificador conoce el tercer estado operacional");
comprobar("cuenta las filas sin metadatos aparte",
  src.indexOf("resumen.sinMetadatos++") !== -1);
comprobar("y las salta antes de juzgarlas", (() => {
  const i = src.indexOf('const clase = claseDeFilaDegradada(r[IDX.ERROR]);');
  return i !== -1 && src.slice(i, i + 260).indexOf("continue;") !== -1;
})());
/* [6.20] La etiqueta única se partió en dos, con una acción cada una. */
comprobar("el informe las muestra con su propia etiqueta",
  src.indexOf("📝 Requieren título manual") !== -1);
comprobar("y explica la acción de cada clase",
  src.indexOf("→ escribir el título") !== -1 &&
  src.indexOf("→ cambiar el enlace o descartar") !== -1);
/* Prueba de verdad: tres filas, una de cada clase, más una anomalía real. */
["❌ Error", "⚪ Descartado", "🟡 Pendiente", "🟡 Pendiente"].forEach((estado, i) => {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.URL] = "https://youtu.be/x" + i;
  f[IDX.ESTADO] = estado;
  if (i === 2) f[IDX.ERROR] = MARCA_SIN_METADATOS + " Tencent Video no publica metadatos.";
  if (i === 3) { f[IDX.TITULO] = "Un video de algo raro"; }
  cat.datos.push(f);
});
const v = verificarMigracionV2();
comprobar("separa las tres clases operacionales",
  v.resumen.enError === 1 && v.resumen.descartadas === 1 && v.resumen.sinMetadatos === 1,
  JSON.stringify({ err: v.resumen.enError, desc: v.resumen.descartadas, sin: v.resumen.sinMetadatos }));
comprobar("y solo juzga la fila que sí tiene texto", v.filas > 0 && v.anomalias <= 3,
  "anomalías: " + v.anomalias);

console.log("\n7. Los «147» residuales");
comprobar("no queda ningún 147 en todo el bundle", src.indexOf("147") === -1);
comprobar("el verificador cuenta la semilla en caliente",
  src.indexOf('"Ninguna de las " + SEMILLA_TAXONOMIA.length') !== -1);
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
