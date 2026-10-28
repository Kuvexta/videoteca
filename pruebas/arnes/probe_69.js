/* Los tres defectos que la 6.9 corrige, cada uno con la prueba que habría
   fallado en la 6.8. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
eval(fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8') + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.verificarYEstructurarHojasConfig = verificarYEstructurarHojasConfig;
globalThis.resolverFacetasDeFila = resolverFacetasDeFila;
globalThis.aplicarEnriquecimientoAFila = aplicarEnriquecimientoAFila;
globalThis.enriquecimientoFueUtil = enriquecimientoFueUtil;
globalThis.facetasDeRutaV2 = facetasDeRutaV2;
globalThis.ALCANCE_PENDIENTE = ALCANCE_PENDIENTE;
globalThis.ALCANCE_CERTIFICABLE = ALCANCE_CERTIFICABLE;
globalThis.ALCANCE_REFERENCIA = ALCANCE_REFERENCIA;
globalThis.ALCANCE_NO_CERTIFICABLE = ALCANCE_NO_CERTIFICABLE;
globalThis.SIN_CLASIFICAR = SIN_CLASIFICAR;
globalThis.INDUSTRIA_TRANSVERSAL = INDUSTRIA_TRANSVERSAL;
globalThis.JURISDICCION_GLOBAL = JURISDICCION_GLOBAL;
globalThis.SEMILLA_TAXONOMIA = SEMILLA_TAXONOMIA;
globalThis.AREAS_REFERENCIA_V2 = AREAS_REFERENCIA_V2;
globalThis.ALCANCE_POR_ECOSISTEMA_V2 = ALCANCE_POR_ECOSISTEMA_V2;
`);
const cat = new Hoja(NOMBRE_HOJA_DATOS, TOTAL_COLUMNAS);
cat.datos.push(CABECERAS_CATALOGO.slice());
LIBRO.hojas.push(cat);
marcarOrigenConfiable();
verificarYEstructurarHojasConfig();

let ok = 0, mal = 0;
const comprobar = (n, c, d) => {
  if (c) { ok++; console.log("  ok   " + n); }
  else { mal++; console.log("  FALLA " + n + (d ? "  → " + d : "")); }
};
const fila = () => new Array(TOTAL_COLUMNAS).fill("");

console.log("\nVersión: " + VERSION_SCRIPT);
/* La versión se compara por NÚMERO, no con una expresión regular que enumere
   los que existen hoy. La primera versión de esto decía `6\.([89]|1[0-9])` y se
   puso roja al llegar a 6.20 —un menor que se evaluaba como texto—, obligando a
   tocar la prueba en cada corte. */
const menorDeVersion = () => {
  const m = /^v(\d+)\.(\d+)\.(\d+)/.exec(VERSION_SCRIPT);
  return m ? Number(m[3]) : -1;
};
comprobar("es 6.9 o posterior", menorDeVersion() >= 9, VERSION_SCRIPT);

// ------------------------------------------------------- 1. PRIORIDAD ALCANCE
console.log("\n1. Área excepcional → Ecosistema → regla");
const inst = fila();
inst[IDX.TITULO] = "Tutorial de guitarra: acordes básicos";
inst[IDX.ECOSISTEMA] = "Cultura y Entretenimiento";
inst[IDX.AREA] = "Instrumentos Musicales";
inst[IDX.ALCANCE] = ALCANCE_PENDIENTE;
resolverFacetasDeFila(inst);
comprobar("Instrumentos Musicales → Referencia (no «No certificable»)",
  inst[IDX.ALCANCE] === ALCANCE_REFERENCIA, inst[IDX.ALCANCE]);
comprobar("coincide con lo que dice la propia semilla",
  (facetasDeRutaV2("Cultura y Entretenimiento", "Instrumentos Musicales") || {}).alcance
    === ALCANCE_REFERENCIA);

const mus = fila();
mus[IDX.TITULO] = "Morgan Wallen - Last Night";
mus[IDX.ECOSISTEMA] = "Cultura y Entretenimiento";
mus[IDX.AREA] = "Música y Espectáculos";
mus[IDX.ALCANCE] = ALCANCE_PENDIENTE;
resolverFacetasDeFila(mus);
comprobar("el resto de Cultura sigue en «No certificable»",
  mus[IDX.ALCANCE] === ALCANCE_NO_CERTIFICABLE, mus[IDX.ALCANCE]);

const cie = fila();
cie[IDX.TITULO] = "El telescopio James Webb";
cie[IDX.ECOSISTEMA] = "Ciencia y Tecnología";
cie[IDX.AREA] = "Astronomía y Espacio";
cie[IDX.ALCANCE] = ALCANCE_PENDIENTE;
resolverFacetasDeFila(cie);
comprobar("Ciencia sigue en «Referencia»", cie[IDX.ALCANCE] === ALCANCE_REFERENCIA, cie[IDX.ALCANCE]);

/* Y el criterio tiene que ser el MISMO que el de la migración, que es de donde
   salió: si divergen, migrar y clasificar dejan la misma fila distinta. */
console.log("\n   Coherencia con migrarCatalogoAV2() en las 102 rutas de la semilla:");
let divergen = 0;
const rutas = {};
SEMILLA_TAXONOMIA.forEach(r => { rutas[r[0] + "||" + r[1]] = 1; });
Object.keys(rutas).forEach(k => {
  const [eco, area] = k.split("||");
  // Lo que decidiría la migración, copiado de su propio orden de condiciones.
  let esperado;
  if (AREAS_REFERENCIA_V2[area]) esperado = ALCANCE_REFERENCIA;
  else if (ALCANCE_POR_ECOSISTEMA_V2[eco]) esperado = ALCANCE_POR_ECOSISTEMA_V2[eco];
  else esperado = ALCANCE_CERTIFICABLE;
  const f = fila();
  f[IDX.TITULO] = "x";
  f[IDX.ECOSISTEMA] = eco; f[IDX.AREA] = area; f[IDX.ALCANCE] = ALCANCE_PENDIENTE;
  resolverFacetasDeFila(f);
  if (f[IDX.ALCANCE] !== esperado) {
    divergen++;
    console.log("     ! " + k + ": migración=" + esperado + " / facetas=" + f[IDX.ALCANCE]);
  }
});
comprobar("ninguna ruta diverge", divergen === 0, String(divergen));

// -------------------------------------------------- 2. PLACEHOLDERS DEL FORZADO
console.log("\n2. Los rellenos del reclasificado forzado son reemplazables");

/* Fila tal como la deja «Reclasificar → Sí (forzar)» cuando ninguna regla la
   reconoce: Sin clasificar y las tres facetas por defecto. */
const trasForzar = (titulo) => {
  const f = fila();
  f[IDX.TITULO] = titulo;
  f[IDX.ECOSISTEMA] = SIN_CLASIFICAR;
  f[IDX.AREA] = SIN_CLASIFICAR;
  f[IDX.INDUSTRIA] = INDUSTRIA_TRANSVERSAL;
  f[IDX.JURISDICCION] = JURISDICCION_GLOBAL;
  f[IDX.TIPO_CONTENIDO] = "Tutorial";
  f[IDX.ALCANCE] = ALCANCE_PENDIENTE;
  return f;
};

const hot = trasForzar("Cómo organizar el turno de recepción");
aplicarEnriquecimientoAFila(hot, { resumen: "", tema: "", version: "",
  ecosistema: "Hotelería y Hospitalidad", area: "Recepción y Reservas" });
comprobar("Industria deja de ser «Transversal» → «" + hot[IDX.INDUSTRIA] + "»",
  hot[IDX.INDUSTRIA] !== INDUSTRIA_TRANSVERSAL, hot[IDX.INDUSTRIA]);

const fis = trasForzar("Cómo habilitarse para facturar");
aplicarEnriquecimientoAFila(fis, { resumen: "", tema: "", version: "",
  ecosistema: "Cumplimiento Electrónico y Fiscal", area: "Facturación Electrónica" });
comprobar("Jurisdicción deja de ser «Global» → «" + fis[IDX.JURISDICCION] + "»",
  fis[IDX.JURISDICCION] !== JURISDICCION_GLOBAL, fis[IDX.JURISDICCION]);

const pia = trasForzar("Clase para empezar con el teclado");
aplicarEnriquecimientoAFila(pia, { resumen: "", tema: "", version: "",
  ecosistema: "Cultura y Entretenimiento", area: "Instrumentos Musicales" });
comprobar("Tipo deja de ser «Tutorial» → «" + pia[IDX.TIPO_CONTENIDO] + "»",
  pia[IDX.TIPO_CONTENIDO] === "Curso", pia[IDX.TIPO_CONTENIDO]);
comprobar("y su Alcance es «Referencia»", pia[IDX.ALCANCE] === ALCANCE_REFERENCIA, pia[IDX.ALCANCE]);

console.log("\n   Pero solo cuando la fila ACABA de clasificarse:");
const yaClasificada = fila();
yaClasificada[IDX.TITULO] = "Recepción de huéspedes";
yaClasificada[IDX.ECOSISTEMA] = "Hotelería y Hospitalidad";
yaClasificada[IDX.AREA] = "Recepción y Reservas";
yaClasificada[IDX.INDUSTRIA] = INDUSTRIA_TRANSVERSAL;   // decisión de una persona
yaClasificada[IDX.TIPO_CONTENIDO] = "Tutorial";
yaClasificada[IDX.ALCANCE] = ALCANCE_PENDIENTE;
aplicarEnriquecimientoAFila(yaClasificada, { resumen: "", tema: "", version: "",
  ecosistema: "", area: "" });                          // la IA no reclasificó
comprobar("«Transversal» puesto a mano NO se pisa",
  yaClasificada[IDX.INDUSTRIA] === INDUSTRIA_TRANSVERSAL, yaClasificada[IDX.INDUSTRIA]);
comprobar("pero el Alcance sí se resuelve igual",
  yaClasificada[IDX.ALCANCE] === ALCANCE_CERTIFICABLE, yaClasificada[IDX.ALCANCE]);

const corregida = trasForzar("Odoo para hoteles");
corregida[IDX.INDUSTRIA] = "Hotelería";     // corrección explícita, no un relleno
aplicarEnriquecimientoAFila(corregida, { resumen: "", tema: "", version: "",
  ecosistema: "Odoo ERP", area: "Industrias y Verticales" });
comprobar("una corrección real sobrevive a la reclasificación por IA",
  corregida[IDX.INDUSTRIA] === "Hotelería", corregida[IDX.INDUSTRIA]);

// ------------------------------------------------------------- 3. EL CONTEO
console.log("\n3. Los dos caminos cuentan lo mismo");
comprobar("sin cambios → no es útil",
  enriquecimientoFueUtil({ resumen: false, clasificacion: false, tema: false,
                           version: false, facetas: false }) === false);
comprobar("solo facetas → sí es útil",
  enriquecimientoFueUtil({ resumen: false, clasificacion: false, tema: false,
                           version: false, facetas: true }) === true);
comprobar("solo tema → sí es útil",
  enriquecimientoFueUtil({ tema: true }) === true);
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
comprobar("el camino secuencial usa el criterio compartido",
  src.indexOf("let util = enriquecimientoFueUtil(cambios)") !== -1);
comprobar("y el paralelo también",
  src.indexOf("if (!enriquecimientoFueUtil(cambios)) {") !== -1);
comprobar("ya no hay un procesados++ incondicional",
  (src.match(/datos\[i\]\[IDX\.ERROR\] = "";\n *procesados\+\+/g) || []).length === 0);

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
