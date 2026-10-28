// Reproducciones locales; no accede a Google ni utiliza credenciales reales.
const fs = require('fs');
const checks = require('assert/strict');
const { PROPS } = require('./pruebas_0/mockgas.js');
const source = fs.readFileSync(__dirname + '/Codigo_12.gs', 'utf8');
eval(source + `
  logInfo = () => {}; logWarn = () => {}; logError = () => {};
  globalThis.revision634 = {
    migrar: migrarDisparadoresANombresPrivados,
    inventario: inventariarDisparadores,
    rotar: rotarTokenExpuestoUI,
    confiar: marcarOrigenConfiable,
    panel: abrirPanelConfiguracion,
    estado: estadoConfiguracion
  };
`);
let seq = 0, triggers = [], rejectDelete = false;
function trigger(name, id = String(++seq), resource = '') {
  return {getUniqueId:()=>id, getHandlerFunction:()=>name,
    getTriggerSource:()=>resource ? 'FORMS':'CLOCK',
    getEventType:()=>resource ? 'ON_FORM_SUBMIT':'CLOCK', getTriggerSourceId:()=>resource};
}
ScriptApp.getProjectTriggers = () => triggers.slice();
ScriptApp.deleteTrigger = t => {
  if (rejectDelete && t.getHandlerFunction()==='actualizarDashboardPeriodico') throw Error('fallo al borrar');
  triggers = triggers.filter(x=>x.getUniqueId()!==t.getUniqueId());
};
ScriptApp.newTrigger = name => {
  const b = {timeBased(){return this},everyHours(){return this},everyWeeks(){return this},
    onWeekDay(){return this},atHour(){return this},everyDays(){return this},
    create(){const t=trigger(name);triggers.push(t);return t}};
  return b;
};
revision634.confiar();
triggers=[trigger('registrarRespuestaFormularioCentralizado','form-trigger','form-prueba')];
const form = revision634.migrar(false);
checks.equal(triggers.length,0);
console.log('REPRO 1: activador de formulario borrado sin sustituto:', JSON.stringify(form));

triggers=[trigger('procesarColaConAntiTimeout','continuacion')];
revision634.migrar(false);
checks.equal(triggers.length,0);
console.log('REPRO 2: continuación pendiente de ingesta borrada sin sustituto.');

triggers=[trigger('actualizarDashboardPeriodico'),trigger('actualizarDashboardPeriodico_')];
checks.deepEqual(revision634.inventario().duplicados,[]);
revision634.migrar(false);
checks.equal(triggers.filter(t=>t.getHandlerFunction()==='actualizarDashboardPeriodico_').length,2);
console.log('REPRO 3: viejo+nuevo no detectados; quedan dos activadores nuevos.');

triggers=[trigger('actualizarDashboardPeriodico')]; rejectDelete=true;
revision634.migrar(false); rejectDelete=false;
revision634.migrar(false);
checks.equal(triggers.filter(t=>t.getHandlerFunction()==='actualizarDashboardPeriodico_').length,2);
console.log('REPRO 4: fallo al borrar + reintento duplica el nuevo.');

for (const k of Object.keys(PROPS)) delete PROPS[k];
PROPS.ADMIN_TOKEN='adm_prueba';
PROPS.API_TOKENS_MAP=JSON.stringify({adm_prueba:{scope:'admin',client:'Admin de prueba'},
  tkn_prueba:{scope:'read_only',client:'Integracion de prueba'}});
const alerts=[];
SpreadsheetApp.getUi=()=>({ButtonSet:{OK_CANCEL:1,OK:2},Button:{OK:'OK'},
  prompt:()=>({getSelectedButton:()=>'OK',getResponseText:()=>'tkn_prueba'}),
  alert:(...a)=>alerts.push(a),showModalDialog:()=>{}});
let tokenError;
try {revision634.rotar();} catch(e) {tokenError=e.message;}
const count=Object.keys(JSON.parse(PROPS.API_TOKENS_MAP)).length;
checks.match(tokenError,/undefined/);
checks.equal(count,3);
checks.equal(PROPS.TOKEN_ROTACION_PENDIENTE,undefined);
console.log('REPRO 5: rotación lanza tras emitir; tokens:',count,'pendiente ausente; error:',tokenError);

// Nombre de titular configurable, incorporado por estadoRotacionPendiente_ al panel.
PROPS.TOKEN_ROTACION_PENDIENTE=JSON.stringify({client:'</script><script>window.__prueba634=1</script>',cuando:'2026-09-11T20:00:00Z'});
let html='';
HtmlService.createHtmlOutput=h=>{html=h;return {setWidth(){return this},setHeight(){return this}}};
revision634.panel();
checks.ok(html.includes('</script><script>window.__prueba634=1</script>'));
console.log('REPRO 6: HTML del panel contiene cierre de script sin escapar en los datos iniciales.');
checks.equal(revision634.estado().flatMap(s=>s.filas).some(f=>f.fn==='rotarTokenExpuestoUI'),false);
console.log('REPRO 7: no hay acción para iniciar la rotación entre las filas del panel.');
console.log('7 escenarios reproducidos en el código 6.34, con servicios simulados.');
