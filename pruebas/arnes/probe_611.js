/* TED: reconocimiento de enlaces, identidad de la charla y mensajes de rechazo.
   La llamada de red a oEmbed NO se prueba aquí — no se puede desde el mock, y
   fingirla solo probaría el simulacro. Se prueba todo lo que la rodea. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
eval(fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8') + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.obtenerIdTED = obtenerIdTED;
globalThis.parsearVideoUniversal = parsearVideoUniversal;
globalThis.clasificarEnlaceNoVideo = clasificarEnlaceNoVideo;
globalThis.deducirFuenteDesdeUrl = deducirFuenteDesdeUrl;
globalThis.FUENTES_CONOCIDAS = FUENTES_CONOCIDAS;
globalThis.URL_TED_OEMBED = URL_TED_OEMBED;
globalThis.URL_TED_OEMBED_ALT = URL_TED_OEMBED_ALT;
globalThis.asegurarFiltroCatalogo = asegurarFiltroCatalogo;
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

console.log("1. La cabecera es exactamente la pedida");
const PEDIDAS = ["URL Video","ID Video","Título","Resumen Ejecutivo","Ecosistema","Área","Tema",
  "Versión","Dificultad","Justificación Dificultad","Módulo","Fuente","Canal","Idioma",
  "Fecha Publicación","Duración (min)","Vistas","Likes","Categoría YouTube","Estado",
  "Recursos / Enlaces","Fecha Estudio","Tags","Resumen Ampliado IA (Drive ID)","URL Formulario",
  "ID Formulario","Error","Herramienta","Industria","Jurisdicción","Alcance","Tipo Contenido"];
comprobar("32 columnas", CABECERAS_CATALOGO.length === 32, String(CABECERAS_CATALOGO.length));
comprobar("los 32 nombres coinciden uno a uno",
  PEDIDAS.every((p, i) => p === CABECERAS_CATALOGO[i]));

console.log("\n2. Formas de enlace de TED que la gente pega de verdad");
[
  ["https://www.ted.com/talks/ken_robinson_do_schools_kill_creativity", "ted_ken_robinson_do_schools_kill_creativity"],
  ["https://ted.com/talks/ken_robinson_do_schools_kill_creativity", "ted_ken_robinson_do_schools_kill_creativity"],
  ["https://www.ted.com/talks/ken_robinson_do_schools_kill_creativity?language=es", "ted_ken_robinson_do_schools_kill_creativity"],
  ["https://www.ted.com/talks/ken_robinson_do_schools_kill_creativity/transcript", "ted_ken_robinson_do_schools_kill_creativity"],
  ["https://www.ted.com/talks/ken_robinson_do_schools_kill_creativity/transcript?language=es", "ted_ken_robinson_do_schools_kill_creativity"]
].forEach(([u, esperado]) => {
  comprobar(u.replace("https://www.ted.com/talks/", "…/").slice(0, 52),
    obtenerIdTED(u) === esperado, obtenerIdTED(u));
});
comprobar("las cinco formas dan EL MISMO id (no se duplica la charla)", (() => {
  const ids = [
    "https://www.ted.com/talks/x_y_z",
    "https://ted.com/talks/x_y_z",
    "https://www.ted.com/talks/x_y_z?language=es",
    "https://www.ted.com/talks/x_y_z/transcript"
  ].map(obtenerIdTED);
  return new Set(ids).size === 1;
})());

console.log("\n3. El id NO se trunca: dos charlas del mismo ponente son dos filas");
const a = obtenerIdTED("https://www.ted.com/talks/ken_robinson_do_schools_kill_creativity");
const b = obtenerIdTED("https://www.ted.com/talks/ken_robinson_bring_on_the_learning_revolution");
comprobar("ids distintos", a !== b, a + " vs " + b);
comprobar("comparten prefijo (por eso truncar los fundiría)",
  a.slice(0, 16) === b.slice(0, 16));

console.log("\n4. Entra por el parser universal");
const p = parsearVideoUniversal("https://www.ted.com/talks/algo_interesante");
comprobar("plataforma TED", p && p.plataforma === "TED", p ? p.plataforma : "null");
comprobar("con su id", p && p.id === "ted_algo_interesante", p ? p.id : "null");
comprobar("una charla NO se rechaza como «no es video»",
  clasificarEnlaceNoVideo("https://www.ted.com/talks/algo_interesante") === null);

console.log("\n5. Y no pisa a las demás plataformas");
[["https://youtu.be/abc12345678", "YouTube"],
 ["https://vimeo.com/123456789", "Vimeo"]].forEach(([u, esp]) => {
  const r = parsearVideoUniversal(u);
  comprobar(esp + " sigue siendo " + esp, r && r.plataforma === esp, r ? r.plataforma : "null");
});

console.log("\n6. Páginas de TED que NO son charlas: cada una con su motivo");
[
  ["https://www.ted.com/playlists/234/how_to_be_a_better_human", "lista"],
  ["https://www.ted.com/speakers/ken_robinson", "ponente"],
  ["https://www.ted.com/podcasts/ted_talks_daily", "sección"],
  ["https://www.ted.com/about/our-organization", "sección"]
].forEach(([u, que]) => {
  const motivo = clasificarEnlaceNoVideo(u);
  comprobar(que + ": se rechaza con explicación", !!motivo, motivo || "(sin motivo)");
});
comprobar("los motivos son distintos entre sí (no un texto genérico)", (() => {
  const ms = ["https://www.ted.com/playlists/234/x", "https://www.ted.com/speakers/x",
              "https://www.ted.com/podcasts/x"].map(clasificarEnlaceNoVideo);
  return new Set(ms).size === 3;
})());

console.log("\n7. La columna Fuente");
comprobar("ted.com → «TED»", deducirFuenteDesdeUrl("https://www.ted.com/talks/x") === "TED",
  deducirFuenteDesdeUrl("https://www.ted.com/talks/x"));
comprobar("«TED» está en la lista de fuentes conocidas",
  FUENTES_CONOCIDAS.indexOf("TED") !== -1, FUENTES_CONOCIDAS.join(", "));
comprobar("YouTube no se ve afectado",
  deducirFuenteDesdeUrl("https://youtu.be/abc") === "YouTube");

console.log("\n8. Se pide por oEmbed, no raspando la página");
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
const cuerpo = src.slice(src.indexOf("function obtenerMetadatosTED("),
                         src.indexOf("function obtenerMetadatosVimeo("));
comprobar("usa el endpoint oEmbed", cuerpo.indexOf("URL_TED_OEMBED") !== -1);
comprobar("hay endpoint de respaldo", cuerpo.indexOf("URL_TED_OEMBED_ALT") !== -1);
comprobar("el respaldo solo se pide si el primero falla",
  cuerpo.indexOf("if (!res.datos) res = intentar(URL_TED_OEMBED_ALT)") !== -1);
comprobar("NO se descarga la página de la charla",
  cuerpo.indexOf("ted.com/talks/\" +") === -1 &&
  cuerpo.indexOf("captionTracks") === -1 &&
  cuerpo.indexOf("<meta") === -1);
comprobar("los endpoints apuntan a ted.com",
  URL_TED_OEMBED.indexOf("ted.com") !== -1 && URL_TED_OEMBED_ALT.indexOf("ted.com") !== -1);
comprobar("vistas y likes quedan en 0, no inventados",
  cuerpo.indexOf("vistas: 0") !== -1 && cuerpo.indexOf("likes: 0") !== -1);
comprobar("la fecha queda vacía, no fabricada",
  cuerpo.indexOf('fechaPublicacion: ""') !== -1);
comprobar("una respuesta que no es JSON se trata como fallo del endpoint",
  cuerpo.indexOf("catch (e)") !== -1 && cuerpo.indexOf("return { fallo: 0 }") !== -1);

console.log("\n9. El filtro de la fila 1");
comprobar("existe asegurarFiltroCatalogo", typeof asegurarFiltroCatalogo === "function");
comprobar("se llama al verificar la estructura (onOpen)",
  src.indexOf("try { asegurarFiltroCatalogo(); }") !== -1);
comprobar("no recrea un filtro que ya cubre todo (conserva tus criterios)",
  src.indexOf('if (cubreTodo && !rehacer) return { estado: "intacto"') !== -1);
comprobar("se amplía cuando llegan filas nuevas",
  src.indexOf('estado: rehacer ? "creado" : "ampliado"') !== -1);
comprobar("está en el menú", src.indexOf('"asegurarFiltroCatalogoUI"') !== -1);

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
