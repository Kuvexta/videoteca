/* v2026.6.18 — las 20 pruebas de aceptación de la especificación, más los
 * invariantes que fija y la salvaguarda que más importa: las tres filas que
 * NO deben clasificarse.
 *
 * Esa última parte es la que da valor a las otras. Un motor que clasifica todo
 * no es un motor bueno: «Top 3 Beginner Mistakes on Inside Corners» es drywall
 * y lo sabemos por el contexto, no por el título, e inventar una regla con
 * «inside corners» para capturarlo se llevaría por delante cualquier video de
 * esquinas. Esas filas deben llegar a Fase 2 sin tocar. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
eval(src + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.motorClasificacionUniversal = motorClasificacionUniversal;
globalThis.detectarJurisdiccion = detectarJurisdiccion;
globalThis.facetasDeRutaV2 = facetasDeRutaV2;
globalThis.normalizarBusqueda = normalizarBusqueda;
globalThis.SEMILLA_TAXONOMIA = SEMILLA_TAXONOMIA;
globalThis.JURISDICCIONES = JURISDICCIONES;
globalThis.HERRAMIENTAS_CONOCIDAS = HERRAMIENTAS_CONOCIDAS;
globalThis.MAPA_MIGRACION_V2 = MAPA_MIGRACION_V2;
globalThis.SIN_CLASIFICAR = SIN_CLASIFICAR;
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
const clasif = t => motorClasificacionUniversal(t, "", "");
const ruta = t => { const c = clasif(t); return c.ecosistema + " / " + c.area; };

console.log("\nVersión: " + VERSION_SCRIPT + "\n");

console.log("1. Invariantes que fija la especificación");
[["Ecosistemas", 17, new Set(SEMILLA_TAXONOMIA.map(r => r[0])).size],
 ["Reglas de fábrica", 183, SEMILLA_TAXONOMIA.length],
 ["Rutas Ecosistema/Área", 111, new Set(SEMILLA_TAXONOMIA.map(r => r[0] + "||" + r[1])).size],
 ["Entradas MAPA_MIGRACION_V2", 59, Object.keys(MAPA_MIGRACION_V2).length],
 ["Columnas catálogo", 32, TOTAL_COLUMNAS],
 ["IDX máximo", 31, Math.max.apply(null, Object.keys(IDX).map(k => IDX[k]))]
].forEach(([n, esp, real]) =>
  comprobar(n + " = " + esp, real === esp, String(real)));

console.log("\n2. Construcción liviana");
[["How to Hang Drywall on Walls", "Drywall y yeso laminado"],
 ["Taping Drywall for Beginners", "Juntas, acabados y reparación"],
 ["Superboard Estructural para entrepisos", "Fibrocemento y placas cementicias"],
 ["How to Install HardieBacker Cement Board", "Fibrocemento y placas cementicias"],
 ["Light Gauge Steel Frame construction", "Steel Framing y perfilería metálica"]
].forEach(([t, tema]) => {
  const c = clasif(t);
  comprobar(t.slice(0, 46), c.area === "Construcción Liviana y Sistemas en Seco",
    c.ecosistema + " / " + c.area);
  comprobar("   tema: " + tema, c.tema === tema, c.tema || "(sin tema)");
});

console.log("\n3. Los desempates que la especificación pide proteger");
comprobar("«Cold-Formed Metal Framing … Revit Tutorial» va a BIM, no a Steel Framing",
  clasif("Cold-Formed Metal Framing Revit Tutorial").area === "BIM",
  ruta("Cold-Formed Metal Framing Revit Tutorial"));
comprobar("«Precio m2 muro en DRYWALL» va a Presupuestos y Costos",
  clasif("Precio m2 muro en DRYWALL").area === "Presupuestos y Costos",
  ruta("Precio m2 muro en DRYWALL"));

console.log("\n4. Seguridad y Salud en el Trabajo");
[["Sistema de Gestión de Seguridad y Salud en el Trabajo", "Sistema de Gestión SST", ""],
 ["Plan de trabajo anual SG-SST", "Sistema de Gestión SST", "Planificación, política y objetivos"],
 ["ISO 45001:2018 requisitos", "ISO 45001", "Requisitos e implementación"],
 ["ISO 45001 vs OHSAS 18001", "ISO 45001", "Transición desde OHSAS 18001"],
 ["Auditoría interna ISO 45001", "Auditoría y Mejora Continua", "Auditoría interna"],
 ["Gestão de SST com Inteligência Artificial", "Tecnología y Software SST", ""]
].forEach(([t, area, tema]) => {
  const c = clasif(t);
  comprobar(t.slice(0, 50), c.ecosistema === "Seguridad y Salud en el Trabajo" && c.area === area,
    c.ecosistema + " / " + c.area);
  if (tema) comprobar("   tema: " + tema, c.tema === tema, c.tema || "(sin tema)");
});

console.log("\n5. El país es una FACETA, no una rama del árbol");
[["Matriz de peligros GTC 45", "Peligros, Riesgos y Controles", "Colombia"],
 ["SG-SST y la Resolución 0312", "Normativa y Cumplimiento SST", "Colombia"],
 ["SST no eSocial S-2210 S-2220 S-2240", "Normativa y Cumplimiento SST", "Brasil"],
 ["NR-1 e ISO 45001 na prática", "Normativa y Cumplimiento SST", "Brasil"],
 ["Ley 29783 y su reglamento DS 005-2012-TR", "Normativa y Cumplimiento SST", "Perú"]
].forEach(([t, area, pais]) => {
  const c = clasif(t);
  comprobar(t.slice(0, 44) + " → " + area,
    c.ecosistema === "Seguridad y Salud en el Trabajo" && c.area === area,
    c.ecosistema + " / " + c.area);
  comprobar("   jurisdicción " + pais, detectarJurisdiccion(t, "") === pais,
    String(detectarJurisdiccion(t, "")));
});
comprobar("Brasil y Portugal están en el vocabulario cerrado",
  JURISDICCIONES.indexOf("Brasil") !== -1 && JURISDICCIONES.indexOf("Portugal") !== -1);
/* Sin marcador, `detectarJurisdiccion` devuelve cadena vacía, no «Global»:
   quien traduce eso a Global es `resolverFacetasDeFila`. Confundir las dos
   cosas es lo que hacía fallar esta comprobación la primera vez. */
comprobar("un título en portugués NO se marca Portugal por el idioma",
  ["", "Global"].indexOf(detectarJurisdiccion("Gestão de SST com Inteligência Artificial", "")) !== -1,
  JSON.stringify(detectarJurisdiccion("Gestão de SST com Inteligência Artificial", "")));
comprobar("ni brasileño por decir «gestão»",
  ["", "Global"].indexOf(detectarJurisdiccion("Gestão de SST na prática", "")) !== -1,
  JSON.stringify(detectarJurisdiccion("Gestão de SST na prática", "")));

/* El desempate que descubrió esta prueba: el número de la norma contra la frase
   genérica del dominio. Sin la forma larga en la regla, la frase de seis
   palabras gana y el video acaba en Fundamentos —Certificable— en vez de
   Normativa —Referencia—, o sea entrando en exámenes. */
[["Ley 29783 – Seguridad y Salud en el Trabajo", "Perú"],
 ["Decreto 1072 y el Sistema de Seguridad y Salud en el Trabajo", "Colombia"],
 ["Resolución 0312: Seguridad y Salud en el Trabajo", "Colombia"]].forEach(([t, pais]) => {
  const c = clasif(t);
  comprobar("«" + t.slice(0, 40) + "» → Normativa, no Fundamentos",
    c.area === "Normativa y Cumplimiento SST", c.ecosistema + " / " + c.area);
  comprobar("   y sigue siendo " + pais, detectarJurisdiccion(t, "") === pais,
    String(detectarJurisdiccion(t, "")));
});

console.log("\n6. LO QUE NO DEBE CLASIFICARSE");
/* Si alguna de estas tres se pone verde de más, alguien metió una regla
   genérica y el catálogo entero está en peligro. */
[["Top 3 Beginner Mistakes on Inside Corners!!", "es drywall por contexto, no por el título"],
 ["Herramienta Evaluación Inicial", "podría ser de cualquier sistema de gestión"],
 ["ISMS Video Demo", "ISMS es seguridad de la INFORMACIÓN, no SST"]
].forEach(([t, porque]) => {
  const c = clasif(t);
  comprobar("«" + t.slice(0, 42) + "» sigue sin clasificar", c.ecosistema === SIN_CLASIFICAR,
    c.ecosistema + " / " + c.area + "  (" + porque + ")");
});
comprobar("«Revisión por la dirección» a secas tampoco cae en SST",
  clasif("Revisión por la dirección").ecosistema !== "Seguridad y Salud en el Trabajo",
  ruta("Revisión por la dirección"));
comprobar("un video de gestión de proyectos no cae en construcción liviana",
  clasif("Project management tools comparison").area !== "Construcción Liviana y Sistemas en Seco",
  ruta("Project management tools comparison"));

console.log("\n7. El consenso de facetas por ruta");
const fCL = facetasDeRutaV2("Construcción, Ingeniería y BIM", "Construcción Liviana y Sistemas en Seco");
comprobar("Construcción Liviana: Alcance uniforme = Certificable",
  fCL && fCL.alcance === "Certificable", fCL ? fCL.alcance : "(sin ruta)");
const fISO = facetasDeRutaV2("Seguridad y Salud en el Trabajo", "ISO 45001");
comprobar("ISO 45001: Alcance uniforme = Certificable",
  fISO && fISO.alcance === "Certificable", fISO ? fISO.alcance : "(sin ruta)");
const fNorm = facetasDeRutaV2("Seguridad y Salud en el Trabajo", "Normativa y Cumplimiento SST");
comprobar("Normativa SST: Alcance uniforme = Referencia",
  fNorm && fNorm.alcance === "Referencia", fNorm ? fNorm.alcance : "(sin ruta)");
const fTec = facetasDeRutaV2("Seguridad y Salud en el Trabajo", "Tecnología y Software SST");
comprobar("Tecnología SST: Alcance uniforme = Referencia",
  fTec && fTec.alcance === "Referencia", fTec ? fTec.alcance : "(sin ruta)");
/* Aquí NO hay consenso a propósito: cuatro países en la misma área. No es un
   descuido — la jurisdicción la pone el título, y para eso están los marcadores. */
comprobar("Normativa SST: jurisdicción SIN consenso, como debe ser",
  fNorm && fNorm.jurisdiccion === "", fNorm ? fNorm.jurisdiccion : "(sin ruta)");

console.log("\n8. NFKD: los títulos estilizados vuelven a leerse");
comprobar("«𝐒𝐆-𝐒𝐒𝐓» conserva la sigla",
  normalizarBusqueda("𝐒𝐆-𝐒𝐒𝐓 Sistema de Gestión").indexOf("sg sst") === 0,
  normalizarBusqueda("𝐒𝐆-𝐒𝐒𝐓 Sistema de Gestión"));
comprobar("y por tanto se clasifica",
  clasif("𝐒𝐆-𝐒𝐒𝐓 Sistema de Gestión").ecosistema === "Seguridad y Salud en el Trabajo",
  ruta("𝐒𝐆-𝐒𝐒𝐓 Sistema de Gestión"));
comprobar("la ligadura ﬁ deja de comerse una letra",
  normalizarBusqueda("ﬁbrocemento") === "fibrocemento", normalizarBusqueda("ﬁbrocemento"));
comprobar("el cirílico sigue SIN dar señales (debe ir a Fase 2)",
  clasif("Монтаж гипсокартона своими руками").ecosistema === SIN_CLASIFICAR,
  ruta("Монтаж гипсокартона своими руками"));

console.log("\n9. Herramienta: familia y marca, ninguna es un área");
["Revit", "Drywall", "Steel Framing", "Fibrocemento", "Superboard", "Panel Rey",
 "Durlock", "Pladur", "Knauf", "Rigips", "HardieBacker", "Durock", "PermaBASE",
 "Safesite", "Safora", "Sylogi", "EHS Insight"].forEach(h =>
  comprobar(h + " está en el desplegable", HERRAMIENTAS_CONOCIDAS.indexOf(h) !== -1));
const ecos = new Set(SEMILLA_TAXONOMIA.map(r => r[0]));
const areas = new Set(SEMILLA_TAXONOMIA.map(r => r[1]));
comprobar("ninguna marca se convirtió en ecosistema o área",
  ["Superboard", "Panel Rey", "Durlock", "HardieBacker", "Knauf"]
    .every(h => !ecos.has(h) && !areas.has(h)));

console.log("\n10. El lote real de SST y construcción liviana (397 registros)");
/* `lote_sst.tsv` es el residuo «Sin clasificar» del 11/9, el que motivó la
   especificación. Aquí no se comprueba un ejemplo inventado: se pasa el lote
   entero y se exige que el motor recupere la gran mayoría Y que deje en paz lo
   que no puede saber. Lo segundo es lo que protege al catálogo. */
const lote = fs.readFileSync(__dirname + '/lote_sst.tsv', 'utf8')
  .split('\n').filter(l => l.trim()).map(l => l.split('\t'));
const titulos = {};
lote.forEach(f => { const t = (f[2] || "").trim(); if (t) titulos[t] = 1; });
let clasificados = 0, sinRuta = [], enSST = 0, enCL = 0;
Object.keys(titulos).forEach(t => {
  const c = clasif(t);
  if (c.ecosistema === SIN_CLASIFICAR) { sinRuta.push(t); return; }
  clasificados++;
  if (c.ecosistema === "Seguridad y Salud en el Trabajo") enSST++;
  if (c.area === "Construcción Liviana y Sistemas en Seco") enCL++;
});
const total = Object.keys(titulos).length;
console.log("      títulos únicos: " + total + " · clasificados: " + clasificados +
  " (SST " + enSST + ", constr. liviana " + enCL + ") · sin ruta: " + sinRuta.length);
comprobar("recupera al menos el 75 % del lote",
  clasificados / total >= 0.75, Math.round(100 * clasificados / total) + "%");
comprobar("el bloque de SST se reconoce de verdad", enSST > 150, String(enSST));
comprobar("y el de construcción liviana también", enCL > 100, String(enCL));
/* Que sobre residuo no es un fallo: es la señal de que el motor determinista
   sabe dónde termina. Si esto bajara a cero, alguien metió una regla genérica. */
comprobar("queda residuo para Fase 2, no se clasifica todo",
  sinRuta.length >= 15, String(sinRuta.length));
["ISMS Video Demo", "Herramienta Evaluación Inicial", "Pasos para crear mi Matriz Legal"]
  .forEach(t => comprobar("«" + t.slice(0, 40) + "» sigue fuera",
    sinRuta.indexOf(t) !== -1, clasif(t).ecosistema + " / " + clasif(t).area));
const cirilicas = sinRuta.filter(t => /[Ѐ-ӿ]/.test(t)).length;
comprobar("los títulos en cirílico quedan para Fase 2, sin inventar reglas",
  cirilicas >= 5, String(cirilicas));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
