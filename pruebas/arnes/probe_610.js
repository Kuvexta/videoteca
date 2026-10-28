/* La ventana de filas: qué acota, qué no, y que no se queda pegada. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
eval(fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8') + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.verificarYEstructurarHojasConfig = verificarYEstructurarHojasConfig;
globalThis.iterarCatalogoPorBloques = iterarCatalogoPorBloques;
globalThis.conVentanaDeFilas = conVentanaDeFilas;
globalThis.limitesRecorridoCatalogo = limitesRecorridoCatalogo;
globalThis.Hoja_ = Hoja;
`);

const cat = new Hoja(NOMBRE_HOJA_DATOS, TOTAL_COLUMNAS);
cat.datos.push(CABECERAS_CATALOGO.slice());
LIBRO.hojas.push(cat);
marcarOrigenConfiable();
verificarYEstructurarHojasConfig();

// 200 filas de datos: filas 2..201
for (let n = 2; n <= 201; n++) {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.URL] = "https://youtu.be/id" + n;
  f[IDX.ID] = "id" + n;
  f[IDX.TITULO] = "Video " + n;
  cat.datos.push(f);
}

let ok = 0, mal = 0;
const comprobar = (n, c, d) => {
  if (c) { ok++; console.log("  ok   " + n); }
  else { mal++; console.log("  FALLA " + n + (d ? "  → " + d : "")); }
};

/** Devuelve los números de fila que un recorrido llega a visitar. */
function filasVisitadas() {
  const vistas = [];
  iterarCatalogoPorBloques(function (datos, inicio) {
    for (let i = 0; i < datos.length; i++) vistas.push(inicio + i);
    return false;
  });
  return vistas;
}

console.log("\nVersión: " + VERSION_SCRIPT);
console.log("Catálogo de prueba: filas 2 a 201\n");

console.log("1. Sin ventana no cambia nada");
const todas = filasVisitadas();
comprobar("visita las 200 filas", todas.length === 200, String(todas.length));
comprobar("de la 2 a la 201", todas[0] === 2 && todas[todas.length - 1] === 201,
  todas[0] + "–" + todas[todas.length - 1]);

console.log("\n2. Solo fila de inicio");
const desde150 = conVentanaDeFilas(150, 0, filasVisitadas);
comprobar("empieza en la 150", desde150[0] === 150, String(desde150[0]));
comprobar("llega hasta el final", desde150[desde150.length - 1] === 201,
  String(desde150[desde150.length - 1]));
comprobar("son 52 filas", desde150.length === 52, String(desde150.length));

console.log("\n3. Rango cerrado");
const rango = conVentanaDeFilas(50, 60, filasVisitadas);
comprobar("exactamente 50–60", rango[0] === 50 && rango[rango.length - 1] === 60,
  rango[0] + "–" + rango[rango.length - 1]);
comprobar("son 11 filas", rango.length === 11, String(rango.length));
comprobar("no se cuela ninguna de fuera",
  rango.every(n => n >= 50 && n <= 60));

console.log("\n4. Los bordes");
comprobar("desde 1 se corrige a 2", conVentanaDeFilas(1, 0, filasVisitadas)[0] === 2);
comprobar("desde 0 se corrige a 2", conVentanaDeFilas(0, 0, filasVisitadas)[0] === 2);
comprobar("hasta más allá del final se recorta",
  conVentanaDeFilas(195, 99999, filasVisitadas).pop() === 201);
comprobar("desde más allá del final no visita nada",
  conVentanaDeFilas(500, 0, filasVisitadas).length === 0);
comprobar("rango invertido no visita nada",
  conVentanaDeFilas(80, 60, filasVisitadas).length === 0);
comprobar("una sola fila", (() => {
  const v = conVentanaDeFilas(77, 77, filasVisitadas);
  return v.length === 1 && v[0] === 77;
})());

console.log("\n5. La ventana NO se queda pegada");
comprobar("después de un rango, el recorrido vuelve a ser completo",
  filasVisitadas().length === 200, String(filasVisitadas().length));
let lanzo = false;
try {
  conVentanaDeFilas(50, 60, function () { throw new Error("fallo simulado"); });
} catch (e) { lanzo = true; }
comprobar("el error se propaga", lanzo === true);
comprobar("y aun así la ventana quedó limpia (esto es lo que importa)",
  filasVisitadas().length === 200, String(filasVisitadas().length));

console.log("\n6. Anidada: se restaura la de fuera, no se borra");
const anidada = conVentanaDeFilas(10, 100, function () {
  const dentro = conVentanaDeFilas(20, 30, filasVisitadas);
  const fuera = filasVisitadas();
  return { dentro: dentro, fuera: fuera };
});
comprobar("la interior manda mientras dura",
  anidada.dentro[0] === 20 && anidada.dentro.pop() === 30);
comprobar("al salir se recupera la exterior, no «sin ventana»",
  anidada.fuera[0] === 10 && anidada.fuera.pop() === 100,
  anidada.fuera[0] + "–" + anidada.fuera[anidada.fuera.length - 1]);

console.log("\n7. Otra hoja NO se acota por números de fila del catálogo");
const otra = new Hoja_("_Hoja_Aparte", TOTAL_COLUMNAS);
otra.datos.push(CABECERAS_CATALOGO.slice());
for (let n = 2; n <= 21; n++) {
  const f = new Array(TOTAL_COLUMNAS).fill("");
  f[IDX.TITULO] = "otra " + n;
  otra.datos.push(f);
}
LIBRO.hojas.push(otra);
const enOtra = conVentanaDeFilas(150, 160, function () {
  let n = 0;
  iterarCatalogoPorBloques(function (datos) { n += datos.length; return false; }, 100, otra);
  return n;
});
comprobar("se recorre entera (20 filas), no cero", enOtra === 20, String(enOtra));

console.log("\n8. El comando nuevo está enganchado");
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
comprobar("existe actualizarTodoDesdeFila", src.indexOf("function actualizarTodoDesdeFila(") !== -1);
comprobar("existe su diálogo", src.indexOf("function actualizarTodoDesdeFilaUI(") !== -1);
comprobar("está en el menú", src.indexOf('"actualizarTodoDesdeFilaUI"') !== -1);
comprobar("tiene etiqueta en los dos idiomas",
  (src.match(/actualizarDesdeFila:/g) || []).length === 2);
const cuerpo = src.slice(src.indexOf("function actualizarTodoDesdeFila("),
                         src.indexOf("function actualizarTodoDesdeFilaUI("));
comprobar("las cuatro etapas por fila van DENTRO de la ventana", (() => {
  const v = cuerpo.indexOf("conVentanaDeFilas(desde, hasta");
  const cierre = cuerpo.indexOf("});", v);
  const dentro = cuerpo.slice(v, cierre);
  return ["procesarColaConAntiTimeout", "actualizarDificultadCatalogo",
          "reevaluarClasificacionYResumen", "actualizarSoloMetricas"]
    .every(f => dentro.indexOf(f) !== -1);
})());
comprobar("los agregados van FUERA", (() => {
  const v = cuerpo.indexOf("conVentanaDeFilas(desde, hasta");
  const cierre = cuerpo.indexOf("});", v);
  const dentro = cuerpo.slice(v, cierre);
  return ["crearDashboardTiempoReal", "exportarCatalogoAJsonSilencioso",
          "caducarIntentosAbandonados"].every(f => dentro.indexOf(f) === -1);
})());
comprobar("con fila final se corta la cadena de la ingesta",
  cuerpo.indexOf("if (hasta) {") !== -1 && cuerpo.indexOf("limpiarTriggersIngesta();") !== -1);
comprobar("y se restaura el checkpoint anterior",
  cuerpo.indexOf("if (checkpointPrevio) props.setProperty(\"INGESTA_CHECKPOINT\", checkpointPrevio)") !== -1);
comprobar("la ingesta también respeta el fin de la ventana",
  src.indexOf("const ultFila = limitesRecorridoCatalogo(ultFilaReal).hasta;") !== -1);

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
