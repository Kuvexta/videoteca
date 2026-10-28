/* v2026.6.15 — duplicados y URLs que no son videos.
 *
 * OJO CON EL FICHERO DE PRUEBA. `catalogo_real.tsv` está reconstruido: el
 * export original (nuevo152, 11/9) tiene 8.975 LÍNEAS pero solo 4.997
 * REGISTROS, porque la columna «Recursos / Enlaces» guarda hasta tres enlaces
 * separados por saltos de línea y el export no los entrecomilla. Leer ese
 * fichero línea a línea hace creer que hay miles de filas de apps.odoo.com en
 * el catálogo: no las hay —son la segunda y tercera línea de la celda de
 * Recursos de videos reales—. Yo mismo me lo creí y llegué a decirle a Andrés
 * que el 46 % del catálogo no eran videos.
 *
 * Para regenerarlo hay que volver a unir las líneas de continuación, y la
 * regla buena NO es «menos de 20 tabuladores es continuación»: en este export
 * un registro partido deja una primera línea de 20 tabuladores, que sí es el
 * principio de un registro. Se acumulan líneas hasta juntar 31 tabuladores
 * (32 columnas); eso cierra el registro. Del registro entero se guardan aquí
 * las tres primeras columnas —URL, ID, Título—, que es todo lo que mira esta
 * prueba. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
eval(src + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.clasificarEnlaceNoVideo = clasificarEnlaceNoVideo;
globalThis.motivoUrlNoIngerible = motivoUrlNoIngerible;
globalThis.parsearVideoUniversal = parsearVideoUniversal;
globalThis.huellaDeFila = huellaDeFila;
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

const filas = fs.readFileSync(__dirname + '/catalogo_real.tsv', 'utf8')
  .split('\n').filter(l => l.trim()).map(l => l.split('\t'));

console.log("1. El catálogo real, fila por fila (" + filas.length + " filas)");
let parsea = 0, rechazo = 0, noIngerible = 0;
const porDominio = {};
filas.forEach(f => {
  const url = (f[0] || "").trim();
  if (!url) return;
  if (parsearVideoUniversal(url)) { parsea++; return; }
  const dom = (url.match(/^https?:\/\/(?:www\.)?([^\/?#]+)/i) || [, "(sin dominio)"])[1];
  porDominio[dom] = (porDominio[dom] || 0) + 1;
  if (clasificarEnlaceNoVideo(url)) rechazo++; else noIngerible++;
});
console.log("      videos que el parser abre ......... " + parsea);
console.log("      apartadas con motivo nombrado ..... " + rechazo);
console.log("      apartadas nombrando el dominio .... " + noIngerible);
comprobar("ninguna fila del catálogo real acaba en la cola de fallos",
  parsea + rechazo + noIngerible === filas.filter(f => (f[0] || "").trim()).length,
  String(parsea + rechazo + noIngerible));
/* Estas reglas son defensivas, no correctivas: hoy no hay ninguna ficha del
   app store en la columna URL del catálogo. Existen porque esos enlaces SÍ
   están, a montones, en la columna Recursos, y basta que alguien copie uno a
   la columna equivocada para que la fila entre en la cola de fallos. */
comprobar("una ficha del app store de Odoo se aparta con motivo propio",
  clasificarEnlaceNoVideo("https://apps.odoo.com/apps/modules/18.0/bi_openpay_acquire") !== null,
  String(clasificarEnlaceNoVideo("https://apps.odoo.com/apps/modules/18.0/bi_openpay_acquire")));
comprobar("y el catálogo real NO tiene ninguna en la columna URL",
  filas.filter(f => (f[0] || "").indexOf("apps.odoo.com") !== -1).length === 0,
  String(filas.filter(f => (f[0] || "").indexOf("apps.odoo.com") !== -1).length));
comprobar("y el motivo dice qué es, no «no reconocida»",
  (clasificarEnlaceNoVideo("https://apps.odoo.com/apps/modules/18.0/x") || "").indexOf("app store") !== -1);
["https://github.com/odoo/odoo", "https://drive.google.com/file/d/abc/view",
 "https://docs.google.com/document/d/abc/edit",
 "https://www.odoo.com/documentation/18.0/"].forEach(u =>
  comprobar("se aparta con motivo: " + u.slice(8, 48), !!clasificarEnlaceNoVideo(u)));

/* [6.22] Con el export del 11/9 todas las filas apartadas tienen ya motivo
   propio; la única que no lo tenía era un clip de Twitch, y el motivo genérico
   decía que twitch.tv no era una plataforma reconocida. */
comprobar("ninguna fila del catálogo se aparta sin motivo propio",
  noIngerible === 0, String(noIngerible) + " sin motivo");
comprobar("un clip de Twitch se aparta diciendo que es un clip",
  (clasificarEnlaceNoVideo("https://www.twitch.tv/proxyaspect/clip/DistinctGrotesqueBaconWow-p_ylu") || "").indexOf("clip") !== -1);
comprobar("y también el enlace corto de clips.twitch.tv",
  (clasificarEnlaceNoVideo("https://clips.twitch.tv/DistinctGrotesqueBaconWow") || "").indexOf("clip") !== -1);
comprobar("el VOD normal sigue pasando",
  clasificarEnlaceNoVideo("https://www.twitch.tv/videos/2731589001") === null);

console.log("\n2. Lo que NO se puede reconocer, al menos se nombra");
const m = motivoUrlNoIngerible("https://plataformarara.tv/video/123");
comprobar("el motivo nombra el dominio", m.indexOf("plataformarara.tv") !== -1, m);
comprobar("y dice qué hacer con la fila", m.indexOf("descarta") !== -1);
comprobar("sin URL no revienta", typeof motivoUrlNoIngerible("") === "string");

console.log("\n3. Ningún video de verdad se aparta por error");
["https://www.youtube.com/watch?v=ahssNn4VKNs", "https://youtu.be/3eEJSmm1rkk",
 "https://vimeo.com/1141724147", "https://www.twitch.tv/videos/2731589001",
 "https://www.tiktok.com/@filmexk/video/7445127606086815031",
 "https://www.bilibili.com/video/BV1xx411c7mD",
 "https://v.qq.com/x/page/a0123456789.html",
 "https://www.ted.com/talks/algo_asi"].forEach(u =>
  comprobar(u.slice(8, 50), clasificarEnlaceNoVideo(u) === null && !!parsearVideoUniversal(u),
    clasificarEnlaceNoVideo(u) || "no parsea"));

console.log("\n4. La huella que decide si dos filas son el mismo video");
comprobar("con ID, manda el ID", huellaDeFila("abc123", "https://x") === "id:abc123");
comprobar("sin ID, la URL normalizada",
  huellaDeFila("", "https://www.YouTube.com/watch?v=X/") === huellaDeFila("", "http://youtube.com/watch?v=X"));
comprobar("la marca de tiempo no crea un video nuevo",
  huellaDeFila("", "https://youtu.be/X?t=30") === huellaDeFila("", "https://youtu.be/X"));
comprobar("ni los parámetros de campaña",
  huellaDeFila("", "https://youtu.be/X?utm_source=wa") === huellaDeFila("", "https://youtu.be/X"));
comprobar("dos videos distintos NO se funden",
  huellaDeFila("", "https://youtu.be/X") !== huellaDeFila("", "https://youtu.be/Y"));
comprobar("una fila vacía no tiene huella", huellaDeFila("", "") === "");
comprobar("un ID nunca se confunde con una URL",
  huellaDeFila("X", "").indexOf("id:") === 0 && huellaDeFila("", "https://youtu.be/X").indexOf("url:") === 0);

console.log("\n5. Sobre el catálogo real, cuántas filas sobran");
const cuenta = {};
filas.forEach(f => {
  const h = huellaDeFila(f[1], f[0]);
  if (h) cuenta[h] = (cuenta[h] || 0) + 1;
});
let sobrantes = 0, grupos = 0;
Object.keys(cuenta).forEach(h => { if (cuenta[h] > 1) { grupos++; sobrantes += cuenta[h] - 1; } });
console.log("      videos repetidos: " + grupos + " · filas de más: " + sobrantes);
/* Son 26 sobre 4.997 filas, no 1.735: la cifra grande salía de contar líneas
   de continuación como si fueran filas. El arreglo del deduplicador sigue
   siendo bueno, pero el problema es pequeño, y conviene que la prueba lo diga
   en vez de sugerir una limpieza masiva que no hace falta. */
comprobar("los duplicados son pocos y acotados", sobrantes > 0 && sobrantes < 100,
  String(sobrantes));
/* El viejo solo miraba el ID: se saltaba todo lo que no lo tuviera. */
const soloId = {};
filas.forEach(f => { const id = (f[1] || "").trim(); if (id) soloId[id] = (soloId[id] || 0) + 1; });
let sobrantesViejo = 0;
Object.keys(soloId).forEach(k => { if (soloId[k] > 1) sobrantesViejo += soloId[k] - 1; });
console.log("      lo que veía el de 6.14: " + sobrantesViejo + " filas");
/* Cuántas se le escapan depende del export: cuando el catálogo trae pocos IDs
   rellenos, el viejo no ve casi ninguna; con nuevo152, que trae más, ve 8 de
   26. Lo que no depende del export es que mirar solo el ID deja fuera las
   repeticiones que difieren en la URL, así que se exige el umbral honesto: se
   le escapa más de la mitad. */
comprobar("al viejo se le escapa más de la mitad",
  sobrantesViejo * 2 < sobrantes, sobrantesViejo + " vs " + sobrantes);
comprobar("las repetidas son las mismas que salieron en la DLQ del 10/9",
  Object.keys(cuenta).filter(h => cuenta[h] > 1)
    .some(h => h.indexOf("ahssnn4vkns") !== -1));

console.log("\n6. La memoria por pasada está donde tiene que estar");
comprobar("existe la memoria del bloque", src.indexOf("const memoria = {};") !== -1);
comprobar("la llave es plataforma + id, no la URL",
  src.indexOf('const llave = item.parseado.plataforma + " " + item.parseado.id;') !== -1);
/* [6.26] Sin ventana de caracteres: se comparan las posiciones dentro de la
   función entera. La ventana fija de 1.400 se rompía cada vez que alguien
   escribía un comentario largo entre medias, que es lo que acaba de pasar, y
   una prueba que falla por un comentario no está midiendo lo que dice medir. */
const cuerpoEnriquecedor = (() => {
  const i = src.indexOf("function enriquecerBloqueIngesta(");
  return src.slice(i, src.indexOf("\nfunction ", i + 10));
})();
comprobar("se consulta ANTES de pedir metadatos",
  cuerpoEnriquecedor.indexOf("hasOwnProperty.call(memoria, llave)") <
  cuerpoEnriquecedor.indexOf("obtenerMetadatosPorPlataforma(item.parseado"));
comprobar("guarda también las degradaciones (si no, se repreguntarían)",
  cuerpoEnriquecedor.indexOf("memoria[llave] = videoData;") !== -1);

console.log("\n7. Borrar filas ya no es a ciegas");
/* [6.21] Se mudó del menú al panel de herramientas; lo que importa es que sea
   la versión que pregunta, no dónde esté el botón. */
comprobar("se llama a la versión que pregunta, no a la que borra directo",
  src.indexOf('"eliminarVideosDuplicadosUI"') !== -1 &&
  src.indexOf('.addItem(t("duplicados"), "eliminarVideosDuplicados")') === -1);
comprobar("se puede analizar sin borrar nada",
  src.indexOf("function analizarDuplicados()") !== -1);
comprobar("se conserva siempre la primera de cada grupo",
  src.indexOf("primeraAparicion[h] !== i") !== -1);

console.log("\n8. Nada de lo anterior se movió");
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
