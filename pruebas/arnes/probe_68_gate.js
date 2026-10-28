/* El gate de la migración v2, ejecutado de verdad contra el mock.
   La pregunta no es «¿está escrita la comprobación?» sino «¿escribe o no
   escribe?», y eso solo lo contesta llamando a la función. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
eval(fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8') + `
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.verificarYEstructurarHojasConfig = verificarYEstructurarHojasConfig;
globalThis.migrarCatalogoAV2 = migrarCatalogoAV2;
globalThis.ALCANCE_PENDIENTE = ALCANCE_PENDIENTE;
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

/* Una fila con una ruta que la taxonomía v2 no puede producir: es exactamente
   lo que el gate existe para detener. */
const filaMala = new Array(TOTAL_COLUMNAS).fill("");
filaMala[IDX.URL] = "https://youtu.be/xxxx";
filaMala[IDX.ID] = "xxxx";
filaMala[IDX.TITULO] = "Video con un área que ya no existe";
filaMala[IDX.ECOSISTEMA] = "Odoo ERP";
filaMala[IDX.AREA] = "Área que la v2 nunca tuvo";
cat.datos.push(filaMala);

/* El mock no implementa copyTo (no lo necesitaba ninguna prueba anterior). Se
   añade aquí lo justo para poder comprobar el ORDEN: respaldo primero, escritura
   después. */
cat.copyTo = function () {
  const copia = new Hoja("__copia__", TOTAL_COLUMNAS);
  copia.datos = JSON.parse(JSON.stringify(cat.datos));
  LIBRO.hojas.push(copia);
  return {
    setName: function (n) { copia.nombre = n; copia.name = n;
                            copia.getName = function () { return n; };
                            return this; },
    hideSheet: function () { return this; }
  };
};

const props = PropertiesService.getScriptProperties();

console.log("\n1. Sin excepción activa");
const antes = JSON.stringify(cat.datos[1]);
const r1 = migrarCatalogoAV2(false);
comprobar("devuelve bloqueada", r1.bloqueada === true, JSON.stringify(r1.bloqueada));
comprobar("señala la ruta", Object.keys(r1.sinMapa).length === 1, JSON.stringify(r1.sinMapa));
comprobar("NO ha escrito nada en la hoja", JSON.stringify(cat.datos[1]) === antes);
comprobar("no ha creado respaldo", r1.respaldo === "" &&
  !LIBRO.hojas.some(h => h.getName().indexOf("_Respaldo_v1_") === 0));

console.log("\n2. La simulación nunca se bloquea (es de solo lectura)");
const rSim = migrarCatalogoAV2(true);
comprobar("simular sigue devolviendo el informe", !rSim.bloqueada &&
  Object.keys(rSim.sinMapa).length === 1);
comprobar("y tampoco escribe", JSON.stringify(cat.datos[1]) === antes);

console.log("\n3. Con la excepción activa: escribe UNA vez y la gasta");
props.setProperty("MIGRACION_V2_ACEPTAR_RUTAS", "true");
const r2 = migrarCatalogoAV2(false);
comprobar("ya no bloquea", r2.bloqueada === false);
comprobar("esta vez SÍ escribió", JSON.stringify(cat.datos[1]) !== antes,
  JSON.stringify(cat.datos[1][IDX.ALCANCE]));
comprobar("creó respaldo antes de escribir", !!r2.respaldo, r2.respaldo);
comprobar("la excepción se ha CONSUMIDO",
  props.getProperty("MIGRACION_V2_ACEPTAR_RUTAS") === null ||
  props.getProperty("MIGRACION_V2_ACEPTAR_RUTAS") === undefined,
  String(props.getProperty("MIGRACION_V2_ACEPTAR_RUTAS")));

console.log("\n4. La siguiente vez vuelve a hacer falta una decisión nueva");
filaMala[IDX.ALCANCE] = "";               // vuelve a haber algo que tocar
const antes2 = JSON.stringify(cat.datos[1]);
const r3 = migrarCatalogoAV2(false);
comprobar("bloquea otra vez", r3.bloqueada === true);
comprobar("y no ha tocado nada", JSON.stringify(cat.datos[1]) === antes2);

console.log("\n5. Un catálogo limpio migra sin estorbos");
cat.datos.length = 1;
const filaBuena = new Array(TOTAL_COLUMNAS).fill("");
filaBuena[IDX.URL] = "https://youtu.be/yyyy";
filaBuena[IDX.ID] = "yyyy";
filaBuena[IDX.TITULO] = "Conteo cíclico en Odoo";
filaBuena[IDX.ECOSISTEMA] = "Odoo ERP";
filaBuena[IDX.AREA] = "Inventario y Logística";
cat.datos.push(filaBuena);
const r4 = migrarCatalogoAV2(false);
comprobar("no bloquea", r4.bloqueada === false);
comprobar("sin rutas pendientes", Object.keys(r4.sinMapa).length === 0, JSON.stringify(r4.sinMapa));
comprobar("rellenó el alcance", !!cat.datos[1][IDX.ALCANCE], cat.datos[1][IDX.ALCANCE]);

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
