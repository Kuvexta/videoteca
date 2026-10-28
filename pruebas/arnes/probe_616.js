/* v2026.6.16 — los tres fallos que solo aparecieron al correr Fase 1 de verdad.
 *
 * Ninguno de los tres lo habría encontrado una prueba sintética: hacían falta
 * un catálogo con 8.570 filas reales y una DLQ con los intentos contados. Por
 * eso esta prueba usa el catálogo real y simula el orden de escritura del
 * bloque en vez de comprobar funciones sueltas. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
eval(src + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.marcarEnlaceNoProcesable = marcarEnlaceNoProcesable;
globalThis.anotarPendienteDeConfiguracion = anotarPendienteDeConfiguracion;
globalThis.escribirEnFila = escribirEnFila;
globalThis.detectarJurisdiccion = detectarJurisdiccion;
globalThis.motorClasificacionUniversal = motorClasificacionUniversal;
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

console.log("1. El write-after-write: escribir EN la copia, no contra ella");
/* El fallo real: la ingesta lee 100 filas, estas funciones escribían el Estado
   directamente en la hoja, y al final `setValues(datos)` volcaba la copia
   antigua y lo borraba. Aquí se comprueba que con `filaMem` el valor acaba en
   el array —que es lo que se vuelca— y no se pierde. */
const filaMem = new Array(TOTAL_COLUMNAS).fill("");
marcarEnlaceNoProcesable(999999, "no es un video", filaMem);
comprobar("marcarEnlaceNoProcesable escribe el Estado en la copia",
  filaMem[IDX.ESTADO] === "⚪ Descartado", String(filaMem[IDX.ESTADO]));
comprobar("y también el motivo", filaMem[IDX.ERROR] === "no es un video");
const filaMem2 = new Array(TOTAL_COLUMNAS).fill("");
anotarPendienteDeConfiguracion(999999, "falta la clave", filaMem2);
comprobar("anotarPendienteDeConfiguracion también", filaMem2[IDX.ERROR] === "falta la clave");
comprobar("sin filaMem sigue escribiendo en la hoja (uso desde fuera del bloque)",
  src.indexOf("if (filaMem) { filaMem[columna] = valor; return; }") !== -1);
comprobar("los tres puntos de la ingesta pasan datos[idx]",
  (src.match(/gestionarErrorFila\([^;]*datos\[idx\]\)/g) || []).length >= 2 &&
  src.indexOf("marcarEnlaceNoProcesable(startRow + i,") !== -1 &&
  src.indexOf("motivoUrlNoIngerible(url), datos[i]);") !== -1);

console.log("\n2. Un bloque sin ningún acierto también se guarda");
/* [6.26] El retorno creció con `detenidoEn`, que dice por qué fila se soltó el
   bloque. Lo que esta prueba defiende sigue siendo lo mismo: que «tocadas»
   viaja aparte de «procesados», porque un bloque entero de filas apartadas es
   trabajo hecho y antes se tiraba. */
comprobar("el bloque devuelve procesados Y tocadas",
  src.indexOf("return { procesados: totalProcesados, tocadas: tocadas, detenidoEn: detenidoEn,") !== -1);
/* [6.29] La condición creció: además de «cambió algo» se exige que la
   persistencia no haya fallado ya, porque reintentar la escritura que acaba de
   lanzar solo servía para tirar la función entera y dejar la cadena rota. */
comprobar("se vuelca si cambió algo, no solo si algo salió bien",
  src.indexOf("if (res.tocadas > 0 && !res.falloPersistencia) {") !== -1);
comprobar("ya no existe el volcado condicionado a procesadosBloque",
  src.indexOf("if (procesadosBloque > 0) {\n      rango.setValues") === -1);
comprobar("las filas apartadas cuentan como tocadas", (() => {
  const i = src.indexOf("motivoUrlNoIngerible(url), datos[i]);");
  return src.slice(i, i + 120).indexOf("tocadas++") !== -1;
})());

console.log("\n3. Fase 1 ya no vuelve a atacar lo que declaró muerto");
comprobar("se salta «❌ Error» además de «⚪ Descartado»",
  src.indexOf('estadoFila === "⚪ Descartado" || estadoFila === "❌ Error"') !== -1);
comprobar("«Reprocesar DLQ» sigue existiendo para reactivarlas a propósito",
  src.indexOf("function reprocesarRegistrosDLQ()") !== -1);
comprobar("y sigue devolviéndolas a Pendiente", (() => {
  const i = src.indexOf("function reprocesarRegistrosDLQ()");
  return src.slice(i, i + 2500).indexOf("🟡 Pendiente") !== -1;
})());

console.log("\n4. El verificador no confunde enlace roto con falta de reglas");
comprobar("mira el Estado de la fila",
  src.indexOf('const est  = (r[IDX.ESTADO] || "").toString().trim();') !== -1);
comprobar("cuenta Error y Descartado aparte",
  src.indexOf("resumen.enError++") !== -1 && src.indexOf("resumen.descartadas++") !== -1);
comprobar("y no las mete en el recuento de anomalías", (() => {
  const i = src.indexOf('if (est === "❌ Error" || est === "⚪ Descartado") {');
  return i !== -1 && src.slice(i, i + 220).indexOf("continue;") !== -1;
})());
/* Se comprueba el concepto —que hay un bloque aparte con los tres recuentos—
   y no la frase exacta: 6.19 la reescribió al añadir «sin metadatos» y esta
   prueba se puso roja por un cambio de redacción, no por un fallo. */
comprobar("el informe las enseña, pero separadas",
  src.indexOf("Aparte, sin texto que clasificar") !== -1 &&
  src.indexOf("${res.resumen.enError}") !== -1 &&
  src.indexOf("${res.resumen.descartadas}") !== -1);

console.log("\n5. Regresión de Panamá");
[["Localización Panameña para Odoo v20: Facturación Electrónica, ITBMS", "Panamá"],
 ["Configurar ITBMS en Odoo", "Panamá"],
 ["Facturación electrónica DGI Panamá paso a paso", "Panamá"],
 ["Retención en la fuente y ReteICA en Colombia", "Colombia"]].forEach(([t, esp]) =>
  comprobar(t.slice(0, 52) + " → " + esp, detectarJurisdiccion(t, "") === esp,
    String(detectarJurisdiccion(t, ""))));
comprobar("un título sin país no inventa uno",
  ["", "Global", null, undefined].indexOf(detectarJurisdiccion("Cómo instalar Docker", "")) !== -1,
  String(detectarJurisdiccion("Cómo instalar Docker", "")));

console.log("\n6. Construcción liviana: la rama nueva sobre títulos REALES");
const filasCat = fs.readFileSync(__dirname + '/catalogo_real.tsv', 'utf8')
  .split('\n').filter(l => l.trim()).map(l => l.split('\t'));
const AREA = "Construcción Liviana y Sistemas en Seco";
let enArea = 0, fueraDeConstruccion = 0;
const vistos = {};
filasCat.forEach(f => {
  const tit = (f[2] || "").trim();
  if (!tit || vistos[tit]) return;
  vistos[tit] = 1;
  const c = motorClasificacionUniversal(tit, "", "");
  if (c.area === AREA) {
    enArea++;
    if (c.ecosistema !== "Construcción, Ingeniería y BIM") fueraDeConstruccion++;
  }
});
console.log("      títulos reales que caen en la nueva área: " + enArea);
comprobar("reconoce el lote de construcción liviana", enArea > 150, String(enArea));
comprobar("y todos quedan bajo Construcción, Ingeniería y BIM",
  fueraDeConstruccion === 0, String(fueraDeConstruccion));
[["Light gauge steel frame building system for low cost housing projects", "Steel Framing"],
 ["Sena en 1 Minuto - formación en construcción liviana", ""],
 ["Guía COMPLETA para DRYWALL", "Drywall"]].forEach(([t, pista]) => {
  const c = motorClasificacionUniversal(t, "", "");
  comprobar("«" + t.slice(0, 46) + "» ya tiene ruta", c.area === AREA,
    c.ecosistema + " / " + c.area);
  if (pista) comprobar("   y su tema es el correcto",
    (c.tema || "").indexOf(pista) === 0, c.tema || "(sin tema)");
});

console.log("\n7. Las reglas nuevas no le roban videos a nadie");
/* Los ecosistemas que más cerca están: ferretería vende material de
   construcción y Gestión de Obra habla de obra. Ninguno debe perder videos. */
[["Herramienta eléctrica para el mostrador de la ferretería", "Retail, Ferretería y Comercio"],
 ["Residente de obra: bitácora y supervisión", "Construcción, Ingeniería y BIM"],
 ["Análisis de precios unitarios APU construcción", "Construcción, Ingeniería y BIM"],
 ["Revit y coordinación BIM con Navisworks", "Construcción, Ingeniería y BIM"]].forEach(([t, eco]) => {
  const c = motorClasificacionUniversal(t, "", "");
  comprobar("«" + t.slice(0, 44) + "» sigue en su sitio",
    c.ecosistema === eco && c.area !== AREA, c.ecosistema + " / " + c.area);
});

console.log("\n8. La semilla creció, y creció donde debía");
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("13 de ellas son de construcción liviana",
  SEMILLA_TAXONOMIA.filter(r => r[1] === AREA).length === 13,
  String(SEMILLA_TAXONOMIA.filter(r => r[1] === AREA).length));
comprobar("todas con Industria = Construcción",
  SEMILLA_TAXONOMIA.filter(r => r[1] === AREA).every(r => r[6] === "Construcción"));
comprobar("y todas Certificables",
  SEMILLA_TAXONOMIA.filter(r => r[1] === AREA).every(r => r[8] === "Certificable"));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
