/* Verificación de la v2026.6.8 sobre el script REAL, no sobre una copia.
   Cuatro preguntas, una por cada cosa que la 6.8 dice arreglar, más el gate. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
eval(fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8') + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.verificarYEstructurarHojasConfig = verificarYEstructurarHojasConfig;
globalThis.motorClasificacionUniversal = motorClasificacionUniversal;
globalThis.textoParaClasificar = textoParaClasificar;
globalThis.esCasoOdooMCP = esCasoOdooMCP;
globalThis.RUTA_ODOO_MCP = RUTA_ODOO_MCP;
globalThis.facetasDeRutaV2 = facetasDeRutaV2;
globalThis.resolverFacetasDeFila = resolverFacetasDeFila;
globalThis.filaAdmiteFase2 = filaAdmiteFase2;
globalThis.filaEsCertificable = filaEsCertificable;
globalThis.aplicarEnriquecimientoAFila = aplicarEnriquecimientoAFila;
globalThis.migrarCatalogoAV2 = migrarCatalogoAV2;
globalThis.ALCANCE_PENDIENTE = ALCANCE_PENDIENTE;
globalThis.ALCANCE_CERTIFICABLE = ALCANCE_CERTIFICABLE;
globalThis.ALCANCE_REFERENCIA = ALCANCE_REFERENCIA;
globalThis.ALCANCE_NO_CERTIFICABLE = ALCANCE_NO_CERTIFICABLE;
globalThis.SIN_CLASIFICAR = SIN_CLASIFICAR;
globalThis.INDUSTRIA_TRANSVERSAL = INDUSTRIA_TRANSVERSAL;
globalThis.JURISDICCION_GLOBAL = JURISDICCION_GLOBAL;
globalThis.SEMILLA_TAXONOMIA = SEMILLA_TAXONOMIA;
`);

const cat = new Hoja(NOMBRE_HOJA_DATOS, TOTAL_COLUMNAS);
cat.datos.push(CABECERAS_CATALOGO.slice());
LIBRO.hojas.push(cat);
marcarOrigenConfiable();
verificarYEstructurarHojasConfig();

let ok = 0, mal = 0;
const comprobar = (nombre, condicion, detalle) => {
  if (condicion) { ok++; console.log("  ok   " + nombre); }
  else { mal++; console.log("  FALLA " + nombre + (detalle ? "  → " + detalle : "")); }
};
const fila = () => new Array(TOTAL_COLUMNAS).fill("");

console.log("\nVersión declarada: " + VERSION_SCRIPT);
/* La versión se compara por NÚMERO, no con una expresión regular que enumere
   los que existen hoy. La primera versión de esto decía `6\.([89]|1[0-9])` y se
   puso roja al llegar a 6.20 —un menor que se evaluaba como texto—, obligando a
   tocar la prueba en cada corte. */
const menorDeVersion = () => {
  const m = /^v(\d+)\.(\d+)\.(\d+)/.exec(VERSION_SCRIPT);
  return m ? Number(m[3]) : -1;
};
comprobar("la versión es 6.8 o posterior", menorDeVersion() >= 8, VERSION_SCRIPT);

// ---------------------------------------------------------------- 1. HASHTAGS
console.log("\n1. Hashtags y menciones: se conserva la palabra");
[
  ["Novedades #Odoo18 en contabilidad", "odoo"],
  ["Instalar #OdooApps desde cero", "odoo"],
  ["Gracias a @Odoo por el soporte", "odoo"],
  ["Configurar #odoo en Ubuntu", "odoo"]
].forEach(([t, esperado]) => {
  const txt = textoParaClasificar(t, "");
  comprobar('«' + t + '» conserva «' + esperado + '»', txt.indexOf(esperado) !== -1, txt);
});
comprobar("los enlaces siguen desapareciendo",
  textoParaClasificar("Ver https://midominio.com/x aqui", "").indexOf("midominio") === -1,
  textoParaClasificar("Ver https://midominio.com/x aqui", ""));
comprobar("los correos siguen desapareciendo",
  textoParaClasificar("Escribe a hola@midominio.com", "").indexOf("midominio") === -1,
  textoParaClasificar("Escribe a hola@midominio.com", ""));

console.log("\n   Y llegan a clasificarse (antes quedaban «Sin clasificar»):");
[
  "Novedades #Odoo18 en contabilidad",
  "Instalar #OdooApps desde cero",
  "Tour por #odoo17 inventario"
].forEach(t => {
  const c = motorClasificacionUniversal(t, "", "");
  comprobar('«' + t + '» → ' + c.ecosistema + " / " + c.area,
    c.ecosistema === "Odoo ERP", c.ecosistema);
});

// --------------------------------------------------------------- 2. ODOO+MCP
console.log("\n2. El empate Odoo + MCP");
const TITULO_MCP = "How to Connect Claude to Odoo Data — Full Odoo MCP Server Demo";
comprobar("esCasoOdooMCP reconoce el caso", esCasoOdooMCP(TITULO_MCP) === true);
const cMcp = motorClasificacionUniversal(TITULO_MCP, "", "");
comprobar("cae en «" + RUTA_ODOO_MCP.ecosistema + " / " + RUTA_ODOO_MCP.area + "»",
  cMcp.ecosistema === RUTA_ODOO_MCP.ecosistema && cMcp.area === RUTA_ODOO_MCP.area,
  cMcp.ecosistema + " / " + cMcp.area);
comprobar("lleva Herramienta = Odoo", cMcp.herramienta === "Odoo", cMcp.herramienta);
comprobar("el resumen es el de la ruta de destino, no el de la que perdió",
  (cMcp.resumen || "").toLowerCase().indexOf("odoo") !== -1, cMcp.resumen);
comprobar("también con hashtag: «Demo del #OdooMCP server»",
  (() => { const c = motorClasificacionUniversal("Demo del #OdooMCP server para Claude", "", "");
           return c.ecosistema === "Odoo ERP" && c.area === "IA en Odoo"; })());

console.log("\n   Y NO se lleva por delante lo que no es el caso:");
const soloMcp = motorClasificacionUniversal("What is MCP? Model Context Protocol explained", "", "");
comprobar("MCP sin Odoo sigue en Inteligencia Artificial",
  soloMcp.ecosistema === "Inteligencia Artificial", soloMcp.ecosistema + " / " + soloMcp.area);
const soloOdoo = motorClasificacionUniversal("Conteo cíclico de inventario en Odoo", "", "");
comprobar("Odoo sin MCP no acaba en «IA en Odoo»",
  soloOdoo.area !== "IA en Odoo", soloOdoo.ecosistema + " / " + soloOdoo.area);
comprobar("un «odoo» suelto en la descripción no basta",
  esCasoOdooMCP("What is MCP? Model Context Protocol explained") === false);

// -------------------------------------------------------- 3. FASE 2: ADMISIÓN
console.log("\n3. Qué deja entrar la Fase 2");
const conAlcance = a => { const f = fila(); f[IDX.TITULO] = "Guía de inventario"; f[IDX.ALCANCE] = a; return f; };
comprobar("«Pendiente de revisión» ENTRA", filaAdmiteFase2(conAlcance(ALCANCE_PENDIENTE)) === true);
comprobar("«Referencia» ENTRA",            filaAdmiteFase2(conAlcance(ALCANCE_REFERENCIA)) === true);
comprobar("«Certificable» ENTRA",          filaAdmiteFase2(conAlcance(ALCANCE_CERTIFICABLE)) === true);
comprobar("«No certificable» queda FUERA", filaAdmiteFase2(conAlcance(ALCANCE_NO_CERTIFICABLE)) === false);
comprobar("filaEsCertificable NO ha cambiado (sigue exigiendo Certificable)",
  filaEsCertificable(conAlcance(ALCANCE_PENDIENTE)) === false &&
  filaEsCertificable(conAlcance(ALCANCE_REFERENCIA)) === false &&
  filaEsCertificable(conAlcance(ALCANCE_CERTIFICABLE)) === true);
const musical = fila();
musical[IDX.TITULO] = "Morgan Wallen - Last Night (Official Music Video)";
musical[IDX.CATEGORIA_YT] = "Música";
comprobar("un musical sin migrar sigue fuera", filaAdmiteFase2(musical) === false);

// ------------------------------------------------- 4. FASE 2: LAS CINCO FACETAS
console.log("\n4. La Fase 2 resuelve las cinco facetas");
const f1 = fila();
f1[IDX.TITULO] = "Configurar el punto de venta";
f1[IDX.ALCANCE] = ALCANCE_PENDIENTE;
aplicarEnriquecimientoAFila(f1, {
  resumen: "", tema: "", version: "",
  ecosistema: "Odoo ERP", area: "POS y Retail"
});
comprobar("clasifica", f1[IDX.ECOSISTEMA] === "Odoo ERP");
comprobar("Alcance deja de estar Pendiente → «" + f1[IDX.ALCANCE] + "»",
  f1[IDX.ALCANCE] === ALCANCE_CERTIFICABLE, f1[IDX.ALCANCE]);
comprobar("Herramienta = Odoo", f1[IDX.HERRAMIENTA] === "Odoo", f1[IDX.HERRAMIENTA]);
comprobar("Industria rellena",  !!f1[IDX.INDUSTRIA], f1[IDX.INDUSTRIA]);
comprobar("Jurisdicción rellena", !!f1[IDX.JURISDICCION], f1[IDX.JURISDICCION]);
comprobar("Tipo de contenido rellena", !!f1[IDX.TIPO_CONTENIDO], f1[IDX.TIPO_CONTENIDO]);

const f2 = fila();
f2[IDX.TITULO] = "El telescopio James Webb explicado";
f2[IDX.ALCANCE] = ALCANCE_PENDIENTE;
aplicarEnriquecimientoAFila(f2, {
  resumen: "", tema: "", version: "",
  ecosistema: "Ciencia y Tecnología", area: "Astronomía y Espacio"
});
comprobar("Ciencia resuelve a «Referencia», no a Certificable",
  f2[IDX.ALCANCE] === ALCANCE_REFERENCIA, f2[IDX.ALCANCE]);

const f3 = fila();
f3[IDX.TITULO] = "Facturación electrónica DIAN paso a paso";
f3[IDX.ALCANCE] = ALCANCE_PENDIENTE;
aplicarEnriquecimientoAFila(f3, {
  resumen: "", tema: "", version: "",
  ecosistema: "Cumplimiento Electrónico y Fiscal", area: "Facturación Electrónica"
});
comprobar("la jurisdicción sale del título → «" + f3[IDX.JURISDICCION] + "»",
  f3[IDX.JURISDICCION] === "Colombia", f3[IDX.JURISDICCION]);

const f4 = fila();
f4[IDX.TITULO] = "Odoo para hoteles";
f4[IDX.ECOSISTEMA] = "Odoo ERP";
f4[IDX.AREA] = "Industrias y Verticales";
f4[IDX.ALCANCE] = ALCANCE_PENDIENTE;
resolverFacetasDeFila(f4);
comprobar("ruta con VARIAS reglas: no se inventa una industria",
  f4[IDX.INDUSTRIA] === INDUSTRIA_TRANSVERSAL, f4[IDX.INDUSTRIA]);

const f5 = fila();
f5[IDX.TITULO] = "Algo que nadie reconoció";
f5[IDX.ECOSISTEMA] = SIN_CLASIFICAR;
f5[IDX.AREA] = SIN_CLASIFICAR;
f5[IDX.ALCANCE] = ALCANCE_PENDIENTE;
resolverFacetasDeFila(f5);
comprobar("sin ruta NO se deduce nada", f5[IDX.ALCANCE] === ALCANCE_PENDIENTE &&
  !f5[IDX.HERRAMIENTA], f5[IDX.ALCANCE] + " / " + f5[IDX.HERRAMIENTA]);

const f6 = fila();
f6[IDX.TITULO] = "Odoo para hoteles";
f6[IDX.ECOSISTEMA] = "Odoo ERP";
f6[IDX.AREA] = "Industrias y Verticales";
f6[IDX.INDUSTRIA] = "Hotelería";
f6[IDX.ALCANCE] = ALCANCE_REFERENCIA;
resolverFacetasDeFila(f6);
comprobar("una corrección a mano se respeta",
  f6[IDX.INDUSTRIA] === "Hotelería" && f6[IDX.ALCANCE] === ALCANCE_REFERENCIA,
  f6[IDX.INDUSTRIA] + " / " + f6[IDX.ALCANCE]);

const f7 = fila();
f7[IDX.TITULO] = "Odoo inventario";
f7[IDX.ECOSISTEMA] = "Odoo ERP";
f7[IDX.AREA] = "Inventario y Almacén";
f7[IDX.INDUSTRIA] = "Hospitality";      // inventada, fuera del vocabulario
f7[IDX.ALCANCE] = ALCANCE_PENDIENTE;
resolverFacetasDeFila(f7);
comprobar("un valor inventado se corrige",
  f7[IDX.INDUSTRIA] === INDUSTRIA_TRANSVERSAL, f7[IDX.INDUSTRIA]);

// ------------------------------------------------------------- 5. EL GATE
console.log("\n5. El gate vive en el mutador");
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
const cuerpo = src.slice(src.indexOf("function migrarCatalogoAV2("));
const cuerpoMut = cuerpo.slice(0, cuerpo.indexOf("function resumenRutasSinMapa"));
comprobar("migrarCatalogoAV2 comprueba sinMapa antes de escribir",
  cuerpoMut.indexOf("Object.keys(sinMapa).length > 0") !== -1 &&
  cuerpoMut.indexOf("Object.keys(sinMapa).length > 0") < cuerpoMut.indexOf("rango.setValues(datos)"));
comprobar("y consume el override con deleteProperty",
  cuerpoMut.indexOf('deleteProperty("MIGRACION_V2_ACEPTAR_RUTAS")') !== -1);
comprobar("el logWarn del override registra las rutas aceptadas",
  cuerpoMut.indexOf("Rutas aceptadas: ") !== -1);
comprobar("deleteProperty ocurre ANTES del setValues",
  cuerpoMut.indexOf('deleteProperty("MIGRACION_V2_ACEPTAR_RUTAS")') < cuerpoMut.indexOf("rango.setValues(datos)"));
comprobar("la UI atiende el bloqueo del mutador",
  src.indexOf("if (res.bloqueada)") !== -1);
comprobar("el override no se consume en la UI (leer no gasta)",
  (src.match(/deleteProperty\("MIGRACION_V2_ACEPTAR_RUTAS"\)/g) || []).length === 1);

// ------------------------------------------------------- 6. NADA MÁS SE MOVIÓ
console.log("\n6. Invariantes de esquema");
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));
comprobar("IDX llega a 31", IDX.TIPO_CONTENIDO === 31, String(IDX.TIPO_CONTENIDO));
comprobar("la semilla mantiene sus reglas", SEMILLA_TAXONOMIA.length === 183,
  String(SEMILLA_TAXONOMIA.length));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
