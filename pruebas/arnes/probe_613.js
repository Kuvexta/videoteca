/* v2026.6.13 — «fallar no es estar roto», ahora para TODAS las plataformas.
   La regla de 6.12 vivía solo dentro de Bilibili y Tencent. Aquí se comprueba
   que se aplica en general Y —lo que más importa— que NO se aplica de más:
   un 500 de Vimeo tiene que seguir siendo un error ruidoso. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
eval(fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8') + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.esFalloDefinitivo = esFalloDefinitivo;
globalThis.resultadoDeFallo = resultadoDeFallo;
globalThis.CODIGOS_FALLO_DEFINITIVO = CODIGOS_FALLO_DEFINITIVO;
globalThis.clasificarEnlaceNoVideo = clasificarEnlaceNoVideo;
globalThis.parsearVideoUniversal = parsearVideoUniversal;
globalThis.obtenerMetadatosBilibili = obtenerMetadatosBilibili;
globalThis.SEMILLA_TAXONOMIA = SEMILLA_TAXONOMIA;
globalThis.MARCA_SIN_METADATOS = MARCA_SIN_METADATOS;
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

console.log("1. Qué cuenta como definitivo");
[400, 404, 410].forEach(c =>
  comprobar("HTTP " + c + " es definitivo", esFalloDefinitivo(c) === true));
[401, 403, 429, 500, 502, 503, 504, 0].forEach(c =>
  comprobar("HTTP " + c + " NO es definitivo", esFalloDefinitivo(c) === false));

console.log("\n2. La traducción a resultado");
const defi = resultadoDeFallo("Twitch", 404, "VOD de Twitch no encontrado");
comprobar("un 404 degrada, no da error",
  defi._sinMetadatos === true && !defi._error, JSON.stringify(defi));
comprobar("y conserva la plataforma para la columna Fuente", defi.plataforma === "Twitch");
const trans = resultadoDeFallo("Vimeo", 500, "Vimeo HTTP 500");
comprobar("un 500 sigue siendo _error", trans._error === true && !trans._sinMetadatos,
  JSON.stringify(trans));
comprobar("un 429 sigue siendo _error (cuota, no video roto)",
  resultadoDeFallo("TikTok", 429, "x")._error === true);
comprobar("un 401 sigue siendo _error (credencial, no video roto)",
  resultadoDeFallo("Twitch", 401, "x")._error === true);

console.log("\n3. LO IMPORTANTE: una caída NO degrada el catálogo");
/* Si esto fallara, el día que Vimeo se caiga media hora entrarían cientos de
   filas sin título y el sistema diría que todo va bien. */
comprobar("Vimeo caído (503) NO degrada ninguna fila",
  resultadoDeFallo("Vimeo", 503, "Vimeo HTTP 503")._sinMetadatos === undefined);
comprobar("un timeout (código 0) NO degrada",
  resultadoDeFallo("Vimeo", 0, "timeout")._sinMetadatos === undefined);
comprobar("Bilibili sigue degradando SIEMPRE, esté o no caída (es su contrato)",
  obtenerMetadatosBilibili("BV1xx411c7mD")._sinMetadatos === true);

console.log("\n4. Ya no queda ningún _error incondicional de plataforma");
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
[["TikTok HTTP", "TikTok"], ["Twitch HTTP", "Twitch"], ["Vimeo HTTP", "Vimeo"],
 ["Facebook HTTP", "Facebook"], ["Dailymotion HTTP", "Dailymotion"],
 ["TED oEmbed HTTP", "TED"]].forEach(([marca, nombre]) => {
  const i = src.indexOf('mensaje: "' + marca);
  const linea = i === -1 ? "" : src.slice(src.lastIndexOf("\n", i), i);
  comprobar(nombre + " pasa por la regla compartida",
    i === -1 || linea.indexOf("_error: true") === -1, linea.trim().slice(0, 70));
});
comprobar("«VOD de Twitch no encontrado» ya no es _error",
  src.indexOf('_error: true, httpCode: 404, mensaje: "VOD de Twitch') === -1);
comprobar("el enlace corto muerto de TikTok ya no es _error", (() => {
  const i = src.indexOf("El enlace corto de TikTok ya no lleva");
  return src.slice(i - 220, i).indexOf("_error: true") === -1;
})());
comprobar("un JSON roto SÍ sigue siendo _error (es transitorio)",
  src.indexOf('_error: true, httpCode: 500, mensaje: "Vimeo JSON inválido"') !== -1);

console.log("\n5. El 404 lógico deja de ir a la cola de fallos");
const i404 = src.indexOf("Sin metadatos: privado, eliminado o inexistente");
comprobar("ya no llama a gestionarErrorFila",
  i404 === -1 || src.slice(i404 - 400, i404 + 400).indexOf("gestionarErrorFila") === -1);
comprobar("la rama final guarda id, fuente y estado", (() => {
  const i = src.indexOf("MARCA_VIDEO_NO_DISPONIBLE + \" privado");
  const r = src.slice(i - 900, i + 400);
  return r.indexOf("IDX.ID]") !== -1 && r.indexOf("IDX.FUENTE]") !== -1 &&
         r.indexOf("IDX.ESTADO]") !== -1;
})());
comprobar("y NO escribe título (la mantiene fuera de Fase 2)", (() => {
  const i = src.indexOf("MARCA_VIDEO_NO_DISPONIBLE + \" privado");
  return src.slice(i - 900, i + 400).indexOf("IDX.TITULO] =") === -1;
})());
/* [6.20] La distinción que 6.13 hacía con el texto pasó a ser estructural:
   dos marcas distintas, con dos acciones distintas. */
comprobar("la nota distingue «borrado» de «sin metadatos»",
  src.indexOf("MARCA_VIDEO_NO_DISPONIBLE") !== -1 &&
  src.indexOf("no publica metadatos") !== -1);
comprobar("lleva una marca que corta el reintento", (() => {
  const i = src.indexOf('MARCA_VIDEO_NO_DISPONIBLE + " privado');
  return i !== -1 && src.slice(i - 400, i).indexOf("IDX.ERROR] =") !== -1;
})());

console.log("\n6. Los listados de canal de Twitch no son videos");
["https://www.twitch.tv/improfficial/videos",
 "https://www.twitch.tv/music_review/videos?filter=all",
 "https://www.twitch.tv/tehxtbook/videos",
 "https://www.twitch.tv/tpain/videos?filter=all",
 "https://www.twitch.tv/tpain"].forEach(u =>
  comprobar(u.replace("https://www.", ""), !!clasificarEnlaceNoVideo(u),
    clasificarEnlaceNoVideo(u) || "(no se rechaza)"));
comprobar("un VOD de verdad NO se rechaza",
  clasificarEnlaceNoVideo("https://www.twitch.tv/videos/2731589001") === null,
  clasificarEnlaceNoVideo("https://www.twitch.tv/videos/2731589001") || "");
comprobar("y el VOD sigue entrando por el parser", (() => {
  const p = parsearVideoUniversal("https://www.twitch.tv/videos/2731589001");
  return p && p.plataforma === "Twitch";
})());

console.log("\n7. Nada de lo anterior se movió");
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));
["https://youtu.be/abc12345678", "https://vimeo.com/123456789",
 "https://www.bilibili.com/video/BV1xx411c7mD",
 "https://v.qq.com/x/page/a0123456789.html"].forEach(u =>
  comprobar("sigue reconociéndose " + u.slice(8, 40), !!parsearVideoUniversal(u)));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
