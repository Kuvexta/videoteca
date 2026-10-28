/* Bilibili y Tencent Video: reconocimiento, identidad y —lo importante—
   que un fallo de la API NO convierta la fila en un video roto. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
eval(fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8') + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.obtenerIdBilibili = obtenerIdBilibili;
globalThis.obtenerIdTencent = obtenerIdTencent;
globalThis.parsearVideoUniversal = parsearVideoUniversal;
globalThis.clasificarEnlaceNoVideo = clasificarEnlaceNoVideo;
globalThis.deducirFuenteDesdeUrl = deducirFuenteDesdeUrl;
globalThis.obtenerMetadatosPorPlataforma = obtenerMetadatosPorPlataforma;
globalThis.obtenerMetadatosBilibili = obtenerMetadatosBilibili;
globalThis.FUENTES_CONOCIDAS = FUENTES_CONOCIDAS;
globalThis.MARCA_SIN_METADATOS = MARCA_SIN_METADATOS;
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

console.log("1. Identidad de un video de Bilibili");
[
  ["https://www.bilibili.com/video/BV1xx411c7mD", "BV1xx411c7mD"],
  ["https://www.bilibili.com/video/BV1xx411c7mD?p=2&t=30", "BV1xx411c7mD"],
  ["https://bilibili.com/video/BV1xx411c7mD/", "BV1xx411c7mD"],
  ["https://www.bilibili.com/video/av170001", "av170001"],
  ["https://b23.tv/AbCdEf1", "b23_AbCdEf1"]
].forEach(([u, esp]) => comprobar(u.slice(0, 50), obtenerIdBilibili(u) === esp, obtenerIdBilibili(u)));
comprobar("las dos numeraciones NO se confunden entre sí",
  obtenerIdBilibili("https://www.bilibili.com/video/BV1xx411c7mD") !==
  obtenerIdBilibili("https://www.bilibili.com/video/av170001"));

console.log("\n2. Identidad de un video de Tencent");
[
  ["https://v.qq.com/x/page/a0123456789.html", "a0123456789"],
  ["https://v.qq.com/x/cover/mzc00200abcdefg/x0987654321.html", "x0987654321"],
  ["https://v.qq.com/x/cover/mzc00200abcdefg.html?vid=z1234567890", "z1234567890"]
].forEach(([u, esp]) => comprobar(u.slice(0, 52), obtenerIdTencent(u) === esp, obtenerIdTencent(u)));
comprobar("en una serie se toma el EPISODIO, no la serie", (() => {
  const a = obtenerIdTencent("https://v.qq.com/x/cover/serieABC/ep111111111.html");
  const b = obtenerIdTencent("https://v.qq.com/x/cover/serieABC/ep222222222.html");
  return a !== b && a === "ep111111111";
})(), obtenerIdTencent("https://v.qq.com/x/cover/serieABC/ep111111111.html"));

console.log("\n3. Entran por el parser y no pisan a nadie");
const b = parsearVideoUniversal("https://www.bilibili.com/video/BV1xx411c7mD");
const q = parsearVideoUniversal("https://v.qq.com/x/page/a0123456789.html");
comprobar("Bilibili reconocida", b && b.plataforma === "Bilibili", b ? b.plataforma : "null");
comprobar("Tencent reconocida", q && q.plataforma === "Tencent Video", q ? q.plataforma : "null");
["https://youtu.be/abc12345678", "https://vimeo.com/123456789",
 "https://www.ted.com/talks/x_y"].forEach(u => {
  const r = parsearVideoUniversal(u);
  comprobar("sigue reconociéndose " + (r ? r.plataforma : "??"), !!r, u);
});
comprobar("un video de Bilibili NO se rechaza como «no es video»",
  clasificarEnlaceNoVideo("https://www.bilibili.com/video/BV1xx411c7mD") === null);
comprobar("un video de Tencent tampoco",
  clasificarEnlaceNoVideo("https://v.qq.com/x/page/a0123456789.html") === null);

console.log("\n4. Páginas que NO son videos");
[["https://space.bilibili.com/123456", null],
 ["https://www.bilibili.com/space/123456", "canal"],
 ["https://www.bilibili.com/bangumi/play/ss12345", "serie"],
 ["https://v.qq.com/channel/tv", "canal Tencent"]].forEach(([u, etiqueta]) => {
  if (!etiqueta) return;
  comprobar(etiqueta + " se rechaza con explicación", !!clasificarEnlaceNoVideo(u),
    clasificarEnlaceNoVideo(u) || "(sin motivo)");
});

console.log("\n5. La columna Fuente");
comprobar("bilibili.com → Bilibili", deducirFuenteDesdeUrl("https://www.bilibili.com/video/BV1") === "Bilibili");
comprobar("b23.tv → Bilibili", deducirFuenteDesdeUrl("https://b23.tv/AbCdEf") === "Bilibili");
comprobar("v.qq.com → Tencent Video", deducirFuenteDesdeUrl("https://v.qq.com/x/page/a1.html") === "Tencent Video");
comprobar("las dos están en la lista de fuentes",
  FUENTES_CONOCIDAS.indexOf("Bilibili") !== -1 && FUENTES_CONOCIDAS.indexOf("Tencent Video") !== -1,
  FUENTES_CONOCIDAS.join(", "));

console.log("\n6. LO IMPORTANTE: fallar NO es estar roto");
const degradadoQQ = obtenerMetadatosPorPlataforma({ plataforma: "Tencent Video", id: "a1" },
  "https://v.qq.com/x/page/a1.html", {});
comprobar("Tencent devuelve degradación, no error",
  degradadoQQ && degradadoQQ._sinMetadatos === true && !degradadoQQ._error,
  JSON.stringify(degradadoQQ));
comprobar("Tencent no gasta ni una petición", degradadoQQ.origenMetadatos === undefined);

/* Sin red en el mock, la llamada a Bilibili falla: es exactamente el escenario
   del día en que Bilibili cierre el endpoint o bloquee las IP de Google. */
const bili = obtenerMetadatosBilibili("BV1xx411c7mD");
comprobar("Bilibili caída → degradación, NUNCA _error",
  bili && bili._sinMetadatos === true && !bili._error, JSON.stringify(bili));
comprobar("un enlace corto no gasta una petición condenada",
  obtenerMetadatosBilibili("b23_AbCdEf")._sinMetadatos === true);
comprobar("id vacío también degrada", obtenerMetadatosBilibili("")._sinMetadatos === true);

console.log("\n7. La fila degradada no entra en bucle ni gasta IA");
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
comprobar("hay una rama propia para _sinMetadatos",
  src.indexOf("} else if (videoData && videoData._sinMetadatos) {") !== -1);
comprobar("va ANTES de la rama de error (si no, nunca se alcanzaría)",
  src.indexOf("videoData._sinMetadatos") < src.indexOf("videoData._error && videoData.configuracion") ||
  src.indexOf("videoData._sinMetadatos") < src.indexOf("} else if (videoData && videoData._error) {"));
/* [6.20] El corte dejó de mirar el prefijo a mano: ahora hay un ayudante que
   reconoce las DOS marcas degradadas. Se comprueba el ayudante. */
comprobar("la ingesta corta el reintento de esas filas",
  src.indexOf('if (esFilaDegradada(datos[i][IDX.ERROR])) continue;') !== -1);
comprobar("el título se deja VACÍO (eso la mantiene fuera de Fase 2)", (() => {
  const i = src.indexOf("videoData._sinMetadatos) {");
  const rama = src.slice(i, src.indexOf("} else if (videoData && videoData._error) {", i));
  return rama.indexOf("IDX.TITULO] =") === -1;
})());
comprobar("pero sí se guardan id, fuente y estado", (() => {
  const i = src.indexOf("videoData._sinMetadatos) {");
  const rama = src.slice(i, src.indexOf("} else if (videoData && videoData._error) {", i));
  return rama.indexOf("IDX.ID]") !== -1 && rama.indexOf("IDX.FUENTE]") !== -1 &&
         rama.indexOf("IDX.ESTADO]") !== -1;
})());
comprobar("no se inventa un estado fuera de la lista cerrada",
  src.indexOf('ESTADOS_CATALOGO = ["🟡 Pendiente", "🟢 Estudiado / Aplicado", "⭐ Esencial / Referencia", "⚪ Descartado", "❌ Error"]') !== -1);
comprobar("el contenido de Bilibili se declara en chino, no se adivina",
  src.indexOf('audioLang: "zh"') !== -1);

console.log("\n8. Nada de la semilla se movió");
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
