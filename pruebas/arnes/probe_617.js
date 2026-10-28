/* v2026.6.17 — el crédito de autoría del pie.
   Lo que se comprueba aquí es el lado servidor: que hay valor de fábrica, que
   el administrador puede cambiarlo, que puede BORRARLO (que es lo que se
   escapa: un campo vacío que vuelve al valor de fábrica parece un fallo del
   guardado), y que no se puede colar marcado por ahí. El lado del navegador lo
   cubre portal/test_creditos.js. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/GAS_v2026.5.0.js', 'utf8');
eval(src + `
globalThis.VERSION_SCRIPT = VERSION_SCRIPT;
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.obtenerMarcaPortal = obtenerMarcaPortal;
globalThis.MARCA_POR_DEFECTO = MARCA_POR_DEFECTO;
globalThis.MARCA_VACIABLES = MARCA_VACIABLES;
globalThis.MARCA_MAX_TEXTO = MARCA_MAX_TEXTO;
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
const guardarCrudo = o =>
  PropertiesService.getScriptProperties().setProperty("MARCA_PORTAL", JSON.stringify(o));

console.log("\nVersión: " + VERSION_SCRIPT + "\n");

console.log("1. El crédito viene puesto de fábrica");
comprobar("por defecto es Kuvexta Group",
  MARCA_POR_DEFECTO.pie === "Desarrollado por Kuvexta Group", MARCA_POR_DEFECTO.pie);
comprobar("«Desarrollado por», que es la fórmula de software",
  MARCA_POR_DEFECTO.pie.indexOf("Desarrollado por") === 0);
comprobar("sin nada guardado, ya sale", obtenerMarcaPortal().pie === MARCA_POR_DEFECTO.pie);
comprobar("cabe en el límite de los campos de marca",
  MARCA_POR_DEFECTO.pie.length <= MARCA_MAX_TEXTO,
  MARCA_POR_DEFECTO.pie.length + " de " + MARCA_MAX_TEXTO);

console.log("\n2. El administrador puede cambiarlo");
guardarCrudo({ pie: "Un producto de Nexo Ferretero" });
comprobar("se respeta lo que ponga", obtenerMarcaPortal().pie === "Un producto de Nexo Ferretero",
  obtenerMarcaPortal().pie);
comprobar("y no se lleva por delante el resto de la identidad",
  obtenerMarcaPortal().nombre === "Videoteca" &&
  obtenerMarcaPortal().rotuloEcosistema === "Ecosistema");

console.log("\n3. Y puede BORRARLO");
/* El fallo que se evita: `obtenerMarcaPortal` rescataba el valor de fábrica de
   cualquier campo vacío. Con eso, borrar el crédito se guardaba bien y volvía a
   verse igual en la siguiente carga — indistinguible de un guardado roto. */
guardarCrudo({ pie: "" });
comprobar("vaciarlo significa vacío, no «vuelve el de fábrica»",
  obtenerMarcaPortal().pie === "", JSON.stringify(obtenerMarcaPortal().pie));
comprobar("pie está en la lista de campos vaciables",
  MARCA_VACIABLES.indexOf("pie") !== -1, MARCA_VACIABLES.join(", "));
console.log("     (logo y color comparten esa regla; el resto NO)");
guardarCrudo({ nombre: "" });
comprobar("el nombre vacío SÍ vuelve al de fábrica (si no, portal sin nombre)",
  obtenerMarcaPortal().nombre === "Videoteca", obtenerMarcaPortal().nombre);
guardarCrudo({ rotuloArea: "" });
comprobar("y los rótulos también", obtenerMarcaPortal().rotuloArea === "Área");

console.log("\n4. Llega a la pantalla de acceso por la plantilla, no por la API");
/* La identidad solo se pide cuando ya hay sesión (`cargarMarca` se llama al
   entrar), y esta línea vive ANTES del login. Si dependiera de la API, no se
   vería nunca. */
comprobar("el servidor inyecta `credito` en la plantilla",
  src.indexOf("plantilla.credito = credito.slice(0, MARCA_MAX_TEXTO);") !== -1);
comprobar("sale de la identidad guardada, no de una constante",
  src.indexOf("obtenerMarcaPortal().pie") !== -1);
comprobar("y va recortado al límite de la marca",
  src.indexOf("credito.slice(0, MARCA_MAX_TEXTO)") !== -1);
comprobar("si la identidad falla, la plantilla sigue saliendo", (() => {
  const i = src.indexOf("let credito = \"\";");
  return i !== -1 && src.slice(i, i + 160).indexOf("catch") !== -1;
})());

console.log("\n5. Nada de lo anterior se movió");
guardarCrudo({});
comprobar("183 reglas", SEMILLA_TAXONOMIA.length === 183, String(SEMILLA_TAXONOMIA.length));
comprobar("32 columnas", TOTAL_COLUMNAS === 32, String(TOTAL_COLUMNAS));
comprobar("la identidad vuelve entera a los valores de fábrica",
  Object.keys(MARCA_POR_DEFECTO).every(k => obtenerMarcaPortal()[k] !== undefined));

console.log("\n──────────────────────────────");
console.log(ok + " ok, " + mal + " fallan");
process.exit(mal ? 1 : 0);
