/* v2026.6.20 — el cierre epistemológico del lote de YouTube.
 *
 * 6.19 arregló el síntoma y dejó el principio a medias: usaba
 * `resultadoDeFallo`, que es la regla POR VIDEO, para traducir un fallo POR
 * LOTE. Con 403 y 5xx daba lo correcto por casualidad; con 400, 404 o 410
 * declaraba muertos los 50 videos de la tanda. El código HTTP de una petición
 * por lote describe lo que le pasó a la PETICIÓN, no a cada video que iba
 * dentro, y de un lote caído no se sabe nada de ninguno. */
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
globalThis.resultadoDeFallo = resultadoDeFallo;
globalThis.MARCA_SIN_METADATOS = MARCA_SIN_METADATOS;
globalThis.MARCA_VIDEO_NO_DISPONIBLE = MARCA_VIDEO_NO_DISPONIBLE;
globalThis.claseDeFilaDegradada = claseDeFilaDegradada;
globalThis.esFilaDegradada = esFilaDegradada;
globalThis.verificarMigracionV2 = verificarMigracionV2;
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

const IDS = ["a", "b", "c", "d", "e"];
const lee = (mapa, id) => obtenerMetadatosPorPlataforma({ plataforma: "YouTube", id: id }, "", mapa);

console.log("1. Un lote caído NO mata videos, con NINGÚN código");
/* Los tres de arriba son los que 6.19 traducía mal. Los cuatro de abajo ya
   pasaban, y se dejan para que el día que alguien vuelva a meter
   `resultadoDeFallo` aquí se entere por los siete a la vez. */
[400, 404, 410, 403, 429, 500, 503].forEach(codigo => {
  globalThis.YouTube = { Videos: { list: () => { throw new Error("fallo (" + codigo + ")"); } } };
  const mapa = obtenerMetadatosYouTubeLote50(IDS);
  const degradados = IDS.filter(id => mapa[id] && mapa[id]._sinMetadatos);
  const sinEntrada = IDS.filter(id => mapa[id] === undefined);
  const leidosComoMuertos = IDS.filter(id => lee(mapa, id) === null);
  comprobar("HTTP " + codigo + ": ningún _sinMetadatos", degradados.length === 0,
    degradados.join(", "));
  comprobar("   los " + IDS.length + " traen entrada _error reintentable",
    sinEntrada.length === 0 && IDS.every(id => mapa[id]._error === true),
    JSON.stringify(mapa[IDS[0]]));
  comprobar("   ninguno se lee como video inexistente",
    leidosComoMuertos.length === 0, leidosComoMuertos.join(", "));
});

console.log("\n2. La ÚNICA prueba de que un video no está");
globalThis.YouTube = { Videos: { list: () => ({ items: [
  { id: "a", snippet: { title: "Vive", channelTitle: "c", publishedAt: "2026-01-01" },
    contentDetails: { duration: "PT5M" }, statistics: {} }
] }) } };
const mapaOk = obtenerMetadatosYouTubeLote50(IDS);
comprobar("la consulta terminó bien y «a» vino → metadatos", mapaOk.a.titulo === "Vive");
comprobar("los otros cuatro NO vinieron → sin entrada",
  ["b", "c", "d", "e"].every(id => mapaOk[id] === undefined));
comprobar("y solo esos se leen como no disponibles",
  ["b", "c", "d", "e"].every(id => lee(mapaOk, id) === null) && lee(mapaOk, "a") !== null);

console.log("\n3. La cola de fallos ya no recibe filas que no existen");
comprobar("el catch del lote no registra nada en la DLQ",
  src.indexOf('registrarFallaEnDLQ(0, "yt:"') === -1);
/* Se busca la LLAMADA, no la palabra: el comentario que explica por qué no se
   usa la menciona, y la primera versión de esta comprobación se puso roja por
   su propia explicación. */
comprobar("y ya no hay ninguna llamada a resultadoDeFallo para YouTube",
  src.indexOf('resultadoDeFallo("YouTube"') === -1);
comprobar("resultadoDeFallo sigue vivo para las consultas por video",
  resultadoDeFallo("Vimeo", 404, "x")._sinMetadatos === true);
comprobar("el servicio sin habilitar sí sigue avisando en la DLQ (es configuración)",
  src.indexOf('registrarFallaEnDLQ(0, "servicio:youtube"') !== -1);

console.log("\n4. Dos marcas, dos acciones");
comprobar("existe la marca de video no disponible",
  MARCA_VIDEO_NO_DISPONIBLE === "Video no disponible:", MARCA_VIDEO_NO_DISPONIBLE);
comprobar("«falta el título» → escribir el título",
  claseDeFilaDegradada(MARCA_SIN_METADATOS + " Tencent Video no publica metadatos.") === "titulo");
comprobar("«video no disponible» → cambiar el enlace",
  claseDeFilaDegradada(MARCA_VIDEO_NO_DISPONIBLE + " privado, eliminado o inexistente.") === "no-disponible");
comprobar("una fila sana no está degradada", claseDeFilaDegradada("") === "");
comprobar("la nota nueva desaconseja explícitamente inventar un título",
  src.indexOf("Escribirle un título NO lo arregla") !== -1);
/* Las filas ya marcadas en la hoja de Andrés llevan el prefijo viejo para los
   DOS casos. Si no se reconocieran, se contarían para siempre como «falta el
   título» y nadie las corregiría: la ingesta ya no las toca. */
comprobar("las filas marcadas ANTES de 6.20 se clasifican bien igual",
  claseDeFilaDegradada(MARCA_SIN_METADATOS +
    " el video no está disponible (privado, eliminado o inexistente).") === "no-disponible");
comprobar("las dos marcas cortan el reintento",
  esFilaDegradada(MARCA_SIN_METADATOS + " x") &&
  esFilaDegradada(MARCA_VIDEO_NO_DISPONIBLE + " x") && !esFilaDegradada("otro error"));
comprobar("la ingesta usa el ayudante, no el prefijo a mano",
  src.indexOf("if (esFilaDegradada(datos[i][IDX.ERROR])) continue;") !== -1);

console.log("\n5. El verificador las separa de verdad");
[["❌ Error", ""], ["⚪ Descartado", ""],
 ["🟡 Pendiente", MARCA_SIN_METADATOS + " Tencent Video no publica metadatos."],
 ["🟡 Pendiente", MARCA_VIDEO_NO_DISPONIBLE + " privado, eliminado o inexistente."],
 ["🟡 Pendiente", MARCA_SIN_METADATOS + " el video no está disponible (eliminado)."]
].forEach(([estado, error], i) => {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.URL] = "https://youtu.be/z" + i;
  f[IDX.ESTADO] = estado;
  f[IDX.ERROR] = error;
  cat.datos.push(f);
});
const v = verificarMigracionV2();
comprobar("1 con error · 1 descartada · 1 requiere título · 2 no disponibles",
  v.resumen.enError === 1 && v.resumen.descartadas === 1 &&
  v.resumen.sinMetadatos === 1 && v.resumen.noDisponibles === 2,
  JSON.stringify(v.resumen.enError + "/" + v.resumen.descartadas + "/" +
    v.resumen.sinMetadatos + "/" + v.resumen.noDisponibles));
comprobar("ninguna de las cinco cuenta como anomalía taxonómica", v.anomalias === 0,
  String(v.anomalias));
comprobar("el informe da una acción distinta a cada una",
  src.indexOf("→ escribir el título") !== -1 &&
  src.indexOf("→ cambiar el enlace o descartar") !== -1);

console.log("\n6. Nada de la taxonomía se movió");
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
