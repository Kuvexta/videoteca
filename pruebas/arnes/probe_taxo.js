/* Sonda de diagnóstico (no es una suite): dice QUÉ regla y QUÉ palabra clave
   gana en cada título, para poder ver el sobre-emparejamiento con evidencia. */
const { LIBRO, Hoja } = require('./mockgas.js');
const fs = require('fs');
eval(fs.readFileSync('GAS_v2026.5.0.js', 'utf8') + `
globalThis.NOMBRE_HOJA_DATOS = NOMBRE_HOJA_DATOS;
globalThis.CABECERAS_CATALOGO = CABECERAS_CATALOGO;
globalThis.IDX = IDX; globalThis.TOTAL_COLUMNAS = TOTAL_COLUMNAS;
globalThis.marcarOrigenConfiable = marcarOrigenConfiable;
globalThis.verificarYEstructurarHojasConfig = verificarYEstructurarHojasConfig;
globalThis.motorClasificacionUniversal = motorClasificacionUniversal;
globalThis.obtenerTaxonomiaConfig = obtenerTaxonomiaConfig;
globalThis.palabraClaveCoincide = palabraClaveCoincide;
globalThis.normalizarBusqueda = normalizarBusqueda;
`);
const cat = new Hoja(NOMBRE_HOJA_DATOS, TOTAL_COLUMNAS);
cat.datos.push(CABECERAS_CATALOGO.slice());
LIBRO.hojas.push(cat);
marcarOrigenConfiable();
verificarYEstructurarHojasConfig();

/* Descripción típica de YouTube: casi siempre lleva enlaces. */
const DESC_TIPICA = "Suscríbete aquí https://www.youtube.com/@canal y visita nuestra web https://midominio.com/curso #tutorial";

const CASOS = [
  ["Curso completo de Prompt Engineering 2025", DESC_TIPICA],
  ["Cómo tocar guitarra: acordes básicos para principiantes", DESC_TIPICA],
  ["Morgan Wallen - Last Night (Official Music Video)", DESC_TIPICA],
  ["Fiesta de las Naciones en Lake Geneva 2024", DESC_TIPICA],
  ["Limpieza de habitación paso a paso | Housekeeping hotel", DESC_TIPICA],
  ["DeepSeek R1 explicado en 10 minutos", DESC_TIPICA],
  ["AutoCAD 2D desde cero clase 1", DESC_TIPICA],
  ["Piano lesson: left hand independence", DESC_TIPICA],
  ["Marketing digital: embudo de ventas en 2025", DESC_TIPICA],
  ["Noticias de IA de la semana", DESC_TIPICA],
  ["Curso completo de Prompt Engineering 2025", ""],
  ["Cómo tocar guitarra: acordes básicos para principiantes", ""],
  ["Instalar Odoo con Nginx y certbot", "Proxy inverso con SSL."]
];

function diagnostico(titulo, descripcion) {
  const texto = normalizarBusqueda(titulo + " " + descripcion);
  const golpes = [];
  obtenerTaxonomiaConfig().forEach((r, i) => {
    (r.keywords || []).forEach(k => {
      if (palabraClaveCoincide(texto, k)) {
        golpes.push({ i: i, clave: k, ruta: r.ecosistema + " / " + r.area + " / " + (r.tema || "—") });
      }
    });
  });
  return golpes;
}

CASOS.forEach(([t, d]) => {
  const c = motorClasificacionUniversal(t, d, "");
  console.log("\n· " + t + (d ? "   [con descripción]" : "   [sin descripción]"));
  console.log("   → " + c.ecosistema + " / " + c.area + " / " + (c.tema || "—"));
  const g = diagnostico(t, d);
  if (g.length === 0) console.log("   (ninguna palabra clave coincide)");
  else g.forEach(x => console.log("     coincide «" + x.clave + "»  ⇒ " + x.ruta));
});
