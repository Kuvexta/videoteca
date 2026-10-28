// Revisión local del servidor 6.35; ningún acceso a Google.
const fs = require('fs');
const ck = require('assert/strict');
const { PROPS } = require('./pruebas_0/mockgas.js');
eval(fs.readFileSync(__dirname+'/Codigo_13.gs','utf8')+`
logInfo=()=>{};logWarn=()=>{};logError=()=>{};
globalThis.rev635={migrar:migrarDisparadoresANombresPrivados,confiar:marcarOrigenConfiable,
rotar:rotarTokenExpuestoUI,estado:estadoConfiguracion,panel:abrirPanelConfiguracion};
`);
let ts=[],seq=0,failDelete=false,formResource='';
function trg(name,origin='CLOCK',event='CLOCK',resource='') {
 const id=String(++seq);
 return {getUniqueId:()=>id,getHandlerFunction:()=>name,getTriggerSource:()=>origin,
 getEventType:()=>event,getTriggerSourceId:()=>resource};
}
ScriptApp.getProjectTriggers=()=>ts.slice();
ScriptApp.deleteTrigger=t=>{if(failDelete)throw Error('fallo de borrado');ts=ts.filter(x=>x!==t)};
global.FormApp={openById:id=>({getId:()=>id})};
ScriptApp.newTrigger=name=>{
 let origin='CLOCK',event='CLOCK',resource='';
 const b={timeBased(){return this},everyHours(){return this},everyWeeks(){return this},
 onWeekDay(){return this},atHour(){return this},everyDays(){return this},after(){return this},
 forForm(f){origin='FORMS';resource=f.getId();return this},onFormSubmit(){event='ON_FORM_SUBMIT';return this},
 forSpreadsheet(s){origin='SPREADSHEETS';resource=typeof s==='string'?s:s.getId();return this},onEdit(){event='ON_EDIT';return this},
 create(){const t=trg(name,origin,event,resource);ts.push(t);return t}}; return b;
};
rev635.confiar();
ts=[trg('registrarRespuestaFormularioCentralizado','FORMS','ON_FORM_SUBMIT','form-A')];
rev635.migrar(false);ck.equal(ts.length,1);ck.equal(ts[0].getTriggerSourceId(),'form-A');
console.log('CORREGIDO: formulario conserva su recurso.');
ts=[trg('procesarColaConAntiTimeout')];rev635.migrar(false);
ck.equal(ts[0].getHandlerFunction(),'procesarColaConAntiTimeout_');
console.log('CORREGIDO: la continuación se sustituye.');
ts=[trg('actualizarDashboardPeriodico'),trg('actualizarDashboardPeriodico_')];rev635.migrar(false);
ck.equal(ts.length,1);console.log('CORREGIDO: viejo+nuevo no duplica.');
ts=[trg('actualizarDashboardPeriodico')];failDelete=true;rev635.migrar(false);failDelete=false;
rev635.migrar(false);ck.equal(ts.length,1);console.log('CORREGIDO: reintento tras fallo al borrar.');
const alerts=[];let target='tkn_prueba';
SpreadsheetApp.getUi=()=>({ButtonSet:{OK_CANCEL:1,OK:2},Button:{OK:'OK'},
 prompt:()=>({getSelectedButton:()=>'OK',getResponseText:()=>target}),alert:(...x)=>alerts.push(x),showModalDialog:()=>{}});
function resetTokens(expira){for(const k of Object.keys(PROPS))delete PROPS[k];
 PROPS.ADMIN_TOKEN='adm_prueba';PROPS.API_TOKENS_MAP=JSON.stringify({adm_prueba:{scope:'admin',client:'Admin'},
 tkn_prueba:{scope:'read_only',client:'Prueba',expira}});}
const expiry=Date.now()+456789;resetTokens(expiry);rev635.rotar();
let map=JSON.parse(PROPS.API_TOKENS_MAP);let fresh=Object.keys(map).find(k=>!['adm_prueba','tkn_prueba'].includes(k));
ck.ok(fresh);ck.equal(map[fresh].expira,expiry);ck.ok(PROPS.TOKEN_ROTACION_PENDIENTE);
console.log('CORREGIDO: emisión, registro pendiente y caducidad exacta.');
resetTokens(Date.now()-5000);rev635.rotar();ck.equal(Object.keys(JSON.parse(PROPS.API_TOKENS_MAP)).length,2);
console.log('CORREGIDO: caducado no se rota.');
resetTokens(expiry);
const originalGetProps=PropertiesService.getScriptProperties;
PropertiesService.getScriptProperties=()=>{const p=originalGetProps();const save=p.setProperty;
 p.setProperty=function(k,v){if(k==='TOKEN_ROTACION_PENDIENTE')throw Error('fallo simulado al guardar pendiente');return save.call(this,k,v)};return p};
rev635.rotar();ck.equal(Object.keys(JSON.parse(PROPS.API_TOKENS_MAP)).length,2);
PropertiesService.getScriptProperties=originalGetProps;
console.log('CORREGIDO: revierte emisión al fallar registro pendiente.');
PROPS.TOKEN_ROTACION_PENDIENTE=JSON.stringify({client:'</script><script>window.marca=1</script>'});
let html='';HtmlService.createHtmlOutput=h=>{html=h;return{setWidth(){return this},setHeight(){return this}}};
rev635.panel();ck.equal(html.includes('</script><script>window.marca=1</script>'),false);
ck.ok(rev635.estado().flatMap(s=>s.filas).some(f=>f.fn==='rotarTokenExpuestoUI'));
console.log('CORREGIDO: datos no interpolados y botón inicial presente.');
ts=[trg('actualizarDashboardPeriodico'),trg('actualizarDashboardPeriodico')];
const dup=rev635.migrar(false);ck.equal(ts.length,2);
ck.ok(ts.every(t=>t.getHandlerFunction()==='actualizarDashboardPeriodico_'));
ck.equal(dup.fallos.length,0);
console.log('DEFECTO REPRODUCIDO: dos viejos idénticos generan dos nuevos, sin advertencia.');
ts=[trg('onEditControlMovilTrigger','SPREADSHEETS','ON_EDIT','hoja-distinta')];
const mobile=rev635.migrar(false);ck.equal(ts.length,1);ck.equal(ts[0].getTriggerSourceId(),'id');
ck.notEqual(ts[0].getTriggerSourceId(),'hoja-distinta');ck.equal(mobile.fallos.length,0);
console.log('DEFECTO REPRODUCIDO: activador móvil cambia de hoja-distinta a la hoja activa id.');
