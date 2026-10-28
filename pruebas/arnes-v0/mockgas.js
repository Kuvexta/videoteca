// Simulador mínimo pero fiel de Apps Script para ejecutar rutas reales del script.
function Rango(hoja, f, c, nf, nc) {
  this.h = hoja; this.f = f; this.c = c; this.nf = nf; this.nc = nc;
  if (f + nf - 1 > hoja.maxFilas || c + nc - 1 > hoja.maxCols) {
    throw new Error("The coordinates or dimensions of the range are invalid.");
  }
}
Rango.prototype.getValues = function () {
  const out = [];
  for (let i = 0; i < this.nf; i++) {
    const fila = [];
    for (let j = 0; j < this.nc; j++) {
      const r = this.h.datos[this.f - 1 + i] || [];
      fila.push(r[this.c - 1 + j] === undefined ? "" : r[this.c - 1 + j]);
    }
    out.push(fila);
  }
  return out;
};
Rango.prototype.getValue = function () { return this.getValues()[0][0]; };
Rango.prototype.setValues = function (v) {
  for (let i = 0; i < v.length; i++) {
    if (!this.h.datos[this.f - 1 + i]) this.h.datos[this.f - 1 + i] = [];
    for (let j = 0; j < v[i].length; j++) this.h.datos[this.f - 1 + i][this.c - 1 + j] = v[i][j];
  }
  return this;
};
Rango.prototype.setValue = function (v) { return this.setValues([[v]]); };
Rango.prototype.setFormula = function (f) { this.h.formulas = this.h.formulas || {};
  this.h.formulas[this.f + ":" + this.c] = f; return this; };
Rango.prototype.getFormula = function () { return (this.h.formulas || {})[this.f + ":" + this.c] || ""; };
Rango.prototype.setFormulas = function (v) { return this; };
/* clearContent vacía las celdas del rango, como en Sheets: deja la fila
   existiendo pero sin valores. No borra filas — eso es deleteRow. */
Rango.prototype.clearContent = function () {
  for (let i = 0; i < this.nf; i++) {
    const fila = this.h.datos[this.f - 1 + i];
    if (!fila) continue;
    for (let j = 0; j < this.nc; j++) fila[this.c - 1 + j] = "";
  }
  return this;
};
["setFontWeight","setBackground","setFontColor","setHorizontalAlignment","setNumberFormat",
 "setWrap","setFontSize","merge","setDataValidation","insertCheckboxes","setBorderWidth","setItalic"]
 .forEach(m => { Rango.prototype[m] = function(){ return this; }; });

let __proximoId = 1;
function Hoja(nombre, cols) {
  this.nombre = nombre; this.datos = []; this.maxCols = cols || 26; this.maxFilas = 1000; this.oculta = false;
  this.id = __proximoId++;
}
Hoja.prototype.getSheetId = function () { return this.id; };
Hoja.prototype.getFrozenRows = function () { return this.congeladas || 0; };
Hoja.prototype.getFilter = function () { return this.filtro || null; };
Hoja.prototype.getName = function () { return this.nombre; };
Hoja.prototype.setName = function (n) { this.nombre = n; return this; };
Hoja.prototype.getLastRow = function () {
  for (let i = this.datos.length - 1; i >= 0; i--) {
    if ((this.datos[i] || []).some(c => c !== "" && c !== null && c !== undefined)) return i + 1;
  }
  return 0;
};
Hoja.prototype.getLastColumn = function () {
  // En Sheets getLastColumn() jamás supera getMaxColumns(); el mock tiene que
  // respetarlo o deja pasar rangos que en la hoja real fallarían.
  let m = 0; this.datos.forEach(r => { if (r && r.length > m) m = r.length; });
  return Math.min(m, this.maxCols);
};
Hoja.prototype.getMaxColumns = function () { return this.maxCols; };
Hoja.prototype.getMaxRows = function () { return this.maxFilas; };
Hoja.prototype.getRange = function (f, c, nf, nc) { return new Rango(this, f, c, nf === undefined ? 1 : nf, nc === undefined ? 1 : nc); };
Hoja.prototype.appendRow = function (v) { this.datos[this.getLastRow()] = v.slice(); return this; };
Hoja.prototype.insertRowBefore = function (n) { this.datos.splice(n - 1, 0, []); return this; };
Hoja.prototype.deleteRow = function (n) { this.datos.splice(n - 1, 1); return this; };
Hoja.prototype.deleteRows = function (n, c) { this.datos.splice(n - 1, c); return this; };
Hoja.prototype.insertColumnsAfter = function (d, n) { this.maxCols += n; return this; };
Hoja.prototype.insertRowsAfter = function (d, n) { this.maxFilas += n; return this; };
/* Como en Sheets: duplica la hoja dentro del libro, con sus datos, y la deja
   al final llamada «Copia de …». Quien la llama suele renombrarla acto seguido. */
Hoja.prototype.copyTo = function () {
  const c = new Hoja("Copia de " + this.nombre, this.maxCols);
  c.maxFilas = this.maxFilas;
  c.datos = this.datos.map(f => (f ? f.slice() : []));
  LIBRO.hojas.push(c);
  return c;
};
Hoja.prototype.getDataRange = function () { return this.getRange(1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); };
["setFrozenColumns","hideSheet","showSheet","activate","clear","setTabColor",
 "setColumnWidth","autoResizeColumn","autoResizeColumns","hideColumns","showColumns",
 "setConditionalFormatRules","getCharts","removeChart","isColumnHiddenByUser","isSheetHidden"]
 .forEach(m => { Hoja.prototype[m] = function(){ return m === "getCharts" ? [] : (m.indexOf("is") === 0 ? false : this); }; });

Hoja.prototype.setFrozenRows = function (n) { this.congeladas = n; return this; };

const LIBRO = { hojas: [] };
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => ({
    getSheetByName: n => LIBRO.hojas.find(h => h.nombre === n) || null,
    /* Apps Script devuelve una instantánea, no la colección viva: quien borra
       mientras recorre no debe notar que la lista se encoge bajo los pies. */
    getSheets: () => LIBRO.hojas.slice(),
    insertSheet: (n, i) => {
      const h = new Hoja(n);
      if (typeof i === "number") LIBRO.hojas.splice(i, 0, h); else LIBRO.hojas.push(h);
      return h;
    },
    /* Sheets no deja quedarse sin hojas: borrar la última lanza. El mock lo
       respeta porque justamente ahí es donde se rompen los reconstructores. */
    deleteSheet: h => {
      const i = LIBRO.hojas.indexOf(h);
      if (i === -1) throw new Error("Sheet not found in this spreadsheet.");
      if (LIBRO.hojas.length === 1) throw new Error("You can't remove all the sheets in a document.");
      LIBRO.hojas.splice(i, 1);
    },
    getName: () => "Libro", getId: () => "id", getUrl: () => "https://x/edit",
    getSpreadsheetTimeZone: () => "America/Bogota",
    toast: () => {}
  }),
  /* En Apps Script `getUi()` funciona desde la hoja y lanza desde una app web o
     desde `google.script.run` del portal. El mock arranca SIN interfaz —que es
     el contexto del atacante— y `__conInterfaz(true)` simula tener la hoja
     delante, para poder probar los dos lados de esa frontera. */
  getUi: () => {
    if (!global.__HAY_INTERFAZ) throw new Error("Cannot call SpreadsheetApp.getUi() from this context.");
    return {
      alert: () => "YES", prompt: () => ({ getSelectedButton: () => "OK", getResponseText: () => "" }),
      createMenu: function () { return this; }, addItem: function () { return this; },
      addSeparator: function () { return this; }, addSubMenu: function () { return this; },
      addToUi: function () { return this; }, showSidebar: () => {}, showModalDialog: () => {},
      ButtonSet: { YES_NO: 1, OK_CANCEL: 2 }, Button: { YES: "YES", OK: "OK" }
    };
  },
  newDataValidation: () => ({ requireValueInList(){return this}, requireTextIsUrl(){return this},
                              setAllowInvalid(){return this}, setHelpText(){return this}, build(){return {}} }),
  newConditionalFormatRule: () => ({ whenTextEqualTo(){return this}, whenTextContains(){return this},
                                     whenFormulaSatisfied(){return this}, whenNumberGreaterThan(){return this},
                                     setBackground(){return this}, setFontColor(){return this},
                                     setBold(){return this}, setItalic(){return this},
                                     setRanges(){return this}, build(){return {}} }),
  flush: () => {}
};
global.__LIBRO = LIBRO; global.__Hoja = Hoja;
global.__HAY_INTERFAZ = false;
global.__conInterfaz = v => { global.__HAY_INTERFAZ = Boolean(v); };

const PROPS = {};
const CACHE = {};
global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: k => (PROPS[k] === undefined ? null : PROPS[k]),
    setProperty: (k, v) => { PROPS[k] = String(v); },
    deleteProperty: k => { delete PROPS[k]; },
    getProperties: () => Object.assign({}, PROPS)
  }),
  getUserProperties: function () { return this.getScriptProperties(); }
};
global.CacheService = {
  getScriptCache: () => ({
    get: k => (CACHE[k] === undefined ? null : CACHE[k]),
    put: (k, v) => { CACHE[k] = v; },
    remove: k => { delete CACHE[k]; },
    removeAll: ks => ks.forEach(k => delete CACHE[k])
  })
};
global.__PROPS = PROPS; global.__CACHE = CACHE;

global.Session = {
  getScriptTimeZone: () => "America/Bogota",
  getActiveUser: () => ({ getEmail: () => "" }),
  getTemporaryActiveUserKey: () => "clave-temporal"
};
const crypto = require("crypto");
global.Utilities = {
  getUuid: () => crypto.randomUUID(),
  formatDate: (d, tz, pat) => {
    const p = n => String(n).padStart(2, "0");
    return pat.replace("yyyy", d.getFullYear()).replace("MM", p(d.getMonth() + 1))
      .replace("dd", p(d.getDate())).replace("HH", p(d.getHours()))
      .replace("mm", p(d.getMinutes())).replace("ss", p(d.getSeconds()));
  },
  base64Encode: s => Buffer.from(String(s)).toString("base64"),
  base64Decode: s => Array.from(Buffer.from(String(s), "base64")),
  base64EncodeWebSafe: s => Buffer.from(typeof s === "string" ? s : Buffer.from(s)).toString("base64url"),
  computeHmacSha256Signature: (a, b) => Array.from(crypto.createHmac("sha256", String(b)).update(String(a)).digest()),
  // El sellado de API Keys pide SHA-256 y el juego de caracteres; sin esto la
  // simulación no podía ni guardar una clave de prueba.
  computeDigest: (alg, s) => {
    const algoritmo = String(alg || "MD5").toLowerCase().replace("_", "");
    const nodeAlg = algoritmo.indexOf("sha256") !== -1 ? "sha256"
                  : algoritmo.indexOf("sha1") !== -1 ? "sha1" : "md5";
    return Array.from(crypto.createHash(nodeAlg).update(String(s)).digest());
  },
  DigestAlgorithm: { MD5: "MD5", SHA_1: "SHA_1", SHA_256: "SHA_256" },
  Charset: { UTF_8: "UTF_8", US_ASCII: "US_ASCII" },
  // base64Decode devuelve bytes; newBlob tiene que reconstruir el texto a partir
  // de ellos, no hacer String(array), o descifrar() nunca recupera el original.
  newBlob: s => ({
    getDataAsString: () => Array.isArray(s) ? Buffer.from(s).toString("utf8") : String(s),
    setName() { return this; }
  }),
  sleep: () => {}
};
global.LockService = { getScriptLock: () => ({ waitLock(){}, releaseLock(){} }) };
/* Los disparadores creados quedan anotados: hay garantías —«la cadena de la
   ingesta no se rompe»— que solo se pueden comprobar viendo si se programó la
   continuación, y para eso hay que saber qué se creó. */
global.__triggersCreados = [];
global.ScriptApp = {
  getProjectTriggers: () => [],
  newTrigger: (nombre) => { global.__triggersCreados.push(nombre);
    return { timeBased: () => ({ everyHours(){return this}, everyDays(){return this},
    atHour(){return this}, after(){return this}, onWeekDay(){return this},
    inTimezone(){return this}, everyWeeks(){return this}, create(){return {getUniqueId:()=>"t"}} }),
    forSpreadsheet: () => ({ onEdit: () => ({ create: () => ({getUniqueId:()=>"t"}) }) }) }; },
  deleteTrigger: () => {}, getOAuthToken: () => "tok",
  getService: () => ({ getUrl: () => "https://script.google.com/macros/s/AKfy/exec" }),
  WeekDay: { SUNDAY: 0 }
};
global.UrlFetchApp = { fetch: () => ({ getResponseCode: () => 200, getContentText: () => "{}" }), fetchAll: () => [] };
global.DriveApp = { getFileById: () => ({ getBlob: () => ({}), setContent(){}, getUrl: () => "u", setTrashed(){}, getAs(){return {}}, setName(){return this}, setSharing(){return this},
    makeCopy: (nombre) => ({ getUrl: () => "https://drive/copia/" + encodeURIComponent(nombre || "copia"), getId: () => "copia" }) }),
  getFoldersByName: () => ({ hasNext: () => false }), getRootFolder: () => ({ removeFile(){} }),
  createFolder: n => ({ getId: () => "f", getFilesByName: () => ({hasNext:()=>false}), createFile: () => ({getId:()=>"drv_"+Math.random().toString(36).slice(2,10),getUrl:()=>"u",setName(){return this},setSharing(){return this}}), getFoldersByName: () => ({hasNext:()=>false}), createFolder(){return this} }),
  Access: { ANYONE_WITH_LINK: 1 }, Permission: { VIEW: 1 } };
/* El servicio avanzado YouTube Data API v3 está habilitado en el proyecto real,
   así que el mock también lo tiene: sin él, `obtenerMetadatosYouTubeLote50` se
   iba por la rama de «servicio no habilitado» y ninguna prueba llegaba nunca al
   camino que de verdad se usa. `__ytLlamadas` cuenta las consultas, que es lo
   que permite exigir «cero llamadas» y no solo «no devolvió datos». */
global.__ytLlamadas = 0;
global.__ytReset = () => { global.__ytLlamadas = 0; };
global.YouTube = {
  Videos: {
    list: (partes, opciones) => {
      global.__ytLlamadas++;
      const ids = String((opciones && opciones.id) || "").split(",").filter(Boolean);
      return { items: ids.map(id => ({
        id: id,
        snippet: { title: "Video " + id, description: "", channelTitle: "Canal",
                   publishedAt: "2026-01-01T00:00:00Z", categoryId: "28",
                   defaultAudioLanguage: "es" },
        contentDetails: { duration: "PT10M" },
        statistics: { viewCount: "10", likeCount: "1" }
      })) };
    }
  },
  PlaylistItems: { list: () => ({ items: [] }) },
  Channels: { list: () => ({ items: [] }) }
};
global.MailApp = { sendEmail: () => {} };
global.HtmlService = { createHtmlOutput: h => ({ setTitle(){return this}, setXFrameOptionsMode(){return this}, getContent:()=>h }),
  createTemplateFromFile: () => ({ evaluate: () => ({ setTitle(){return this}, setSandboxMode(){return this},
    addMetaTag(){return this}, setXFrameOptionsMode(){return this}, getContent:()=>"<html>" }) }),
  SandboxMode: { IFRAME: 1 }, XFrameOptionsMode: { ALLOWALL: 1 } };
global.ContentService = { createTextOutput: t => ({ setMimeType(){return this}, getContent: () => t }), MimeType: { JSON: 1 } };
global.MimeType = { PDF: "pdf", PLAIN_TEXT: "txt", CSV: "csv" };
global.CalendarApp = { getDefaultCalendar: () => ({ createEvent: () => ({ getId: () => "e", addEmailReminder(){}, addPopupReminder(){} }) }) };
global.DocumentApp = { create: () => ({ getBody: () => ({ appendParagraph: () => ({ setHeading(){return this}, setItalic(){return this}, setFontSize(){return this} }),
  appendTable: () => ({ setBorderWidth(){return this} }), appendListItem: () => ({ setGlyphType(){return this} }),
  appendHorizontalRule(){}, appendPageBreak(){} }), saveAndClose(){}, getId: () => "d" }),
  ParagraphHeading: {}, GlyphType: {} };
global.SlidesApp = { openById: () => ({ getSlides: () => [{ replaceAllText(){} }], saveAndClose(){} }) };
global.FormApp = {};
global.Logger = { log: () => {} };
module.exports = { LIBRO, Hoja, PROPS, CACHE };
