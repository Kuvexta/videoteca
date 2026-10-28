// Revisión local del servidor 6.36; ningún acceso a Google.
const fs = require('fs');
const ck = require('assert/strict');
const { PROPS } = require('./pruebas/mockgas.js');
eval(fs.readFileSync(__dirname+'/Codigo_14.gs','utf8')+`
logInfo=()=>{};logWarn=()=>{};logError=()=>{};
globalThis.rev636={migrar:migrarDisparadoresANombresPrivados,confiar:marcarOrigenConfiable,
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
SpreadsheetApp.openById=id=>({getId:()=>id});
rev636.confiar();
ts=[trg('registrarRespuestaFormularioCentralizado','FORMS','ON_FORM_SUBMIT','form-A')];
rev636.migrar(false);ck.equal(ts.length,1);ck.equal(ts[0].getTriggerSourceId(),'form-A');
console.log('CORREGIDO: formulario conserva su recurso.');
ts=[trg('procesarColaConAntiTimeout')];rev636.migrar(false);
ck.equal(ts[0].getHandlerFunction(),'procesarColaConAntiTimeout_');
console.log('CORREGIDO: la continuación se sustituye.');
ts=[trg('actualizarDashboardPeriodico'),trg('actualizarDashboardPeriodico_')];rev636.migrar(false);
ck.equal(ts.length,1);console.log('CORREGIDO: viejo+nuevo no duplica.');
ts=[trg('actualizarDashboardPeriodico')];failDelete=true;rev636.migrar(false);failDelete=false;
rev636.migrar(false);ck.equal(ts.length,1);console.log('CORREGIDO: reintento tras fallo al borrar.');
const alerts=[];let target='tkn_prueba';
SpreadsheetApp.getUi=()=>({ButtonSet:{OK_CANCEL:1,OK:2},Button:{OK:'OK'},
 prompt:()=>({getSelectedButton:()=>'OK',getResponseText:()=>target}),alert:(...x)=>alerts.push(x),showModalDialog:()=>{}});
function resetTokens(expira){for(const k of Object.keys(PROPS))delete PROPS[k];
 PROPS.ADMIN_TOKEN='adm_prueba';PROPS.API_TOKENS_MAP=JSON.stringify({adm_prueba:{scope:'admin',client:'Admin'},
 tkn_prueba:{scope:'read_only',client:'Prueba',expira}});}
const expiry=Date.now()+456789;resetTokens(expiry);rev636.rotar();
let map=JSON.parse(PROPS.API_TOKENS_MAP);let fresh=Object.keys(map).find(k=>!['adm_prueba','tkn_prueba'].includes(k));
ck.ok(fresh);ck.equal(map[fresh].expira,expiry);ck.ok(PROPS.TOKEN_ROTACION_PENDIENTE);
console.log('CORREGIDO: emisión, registro pendiente y caducidad exacta.');
resetTokens(Date.now()-5000);rev636.rotar();ck.equal(Object.keys(JSON.parse(PROPS.API_TOKENS_MAP)).length,2);
console.log('CORREGIDO: caducado no se rota.');
resetTokens(expiry);
const originalGetProps=PropertiesService.getScriptProperties;
PropertiesService.getScriptProperties=()=>{const p=originalGetProps();const save=p.setProperty;
 p.setProperty=function(k,v){if(k==='TOKEN_ROTACION_PENDIENTE')throw Error('fallo simulado al guardar pendiente');return save.call(this,k,v)};return p};
rev636.rotar();ck.equal(Object.keys(JSON.parse(PROPS.API_TOKENS_MAP)).length,2);
PropertiesService.getScriptProperties=originalGetProps;
console.log('CORREGIDO: revierte emisión al fallar registro pendiente.');
PROPS.TOKEN_ROTACION_PENDIENTE=JSON.stringify({client:'</script><script>window.marca=1</script>'});
let html='';HtmlService.createHtmlOutput=h=>{html=h;return{setWidth(){return this},setHeight(){return this}}};
rev636.panel();ck.equal(html.includes('</script><script>window.marca=1</script>'),false);
ck.ok(rev636.estado().flatMap(s=>s.filas).some(f=>f.fn==='rotarTokenExpuestoUI'));
console.log('CORREGIDO: datos no interpolados y botón inicial presente.');
let acquired=0,released=0,locked=false;
LockService.getScriptLock=()=>({waitLock(){ck.equal(locked,false);locked=true;acquired++},
 releaseLock(){ck.equal(locked,true);locked=false;released++}});
const inventory=ScriptApp.getProjectTriggers;
ScriptApp.getProjectTriggers=()=>{ck.equal(locked,true);return inventory()};
ts=[trg('actualizarDashboardPeriodico'),trg('actualizarDashboardPeriodico')];
const duplicateIds=ts.map(t=>t.getUniqueId());
const duplicateResult=rev636.migrar(false);
ck.deepEqual(ts.map(t=>t.getUniqueId()),duplicateIds);ck.equal(duplicateResult.fallos.length,1);
ck.equal(acquired,released); console.log('APROBADO: dos viejos bloqueados sin modificar; cerrojo liberado.');
ts=[trg('actualizarDashboardPeriodico_'),trg('actualizarDashboardPeriodico_')];
ck.equal(rev636.migrar(false).fallos.length,1);
console.log('APROBADO: dos nuevos bloqueados.');
ts=[trg('onEditControlMovilTrigger','SPREADSHEETS','ON_EDIT','hoja-distinta')];
ck.equal(rev636.migrar(false).fallos.length,0);ck.equal(ts.length,1);
ck.equal(ts[0].getTriggerSourceId(),'hoja-distinta');
console.log('APROBADO: móvil conserva hoja original distinta de la activa.');
ts=[trg('onEditControlMovilTrigger','SPREADSHEETS','ON_EDIT','')];
const missingId=ts[0].getUniqueId();const missing=rev636.migrar(false);
ck.equal(missing.intactos.length,1);ck.equal(ts[0].getUniqueId(),missingId);
console.log('APROBADO: sin recurso no se modifica el activador.');
ts=[trg('registrarRespuestaFormularioCentralizado','FORMS','ON_FORM_SUBMIT','A'),
trg('registrarRespuestaFormularioCentralizado','FORMS','ON_FORM_SUBMIT','B')];
ck.equal(rev636.migrar(false).migrados.length,2);
ck.deepEqual(ts.map(t=>t.getTriggerSourceId()).sort(),['A','B']);
console.log('APROBADO: dos formularios distintos se conservan.');
ScriptApp.getProjectTriggers=()=>{throw Error('fallo de inventario')};
ck.throws(()=>rev636.migrar(false),/fallo de inventario/);ck.equal(acquired,released);ck.equal(locked,false);
console.log('APROBADO: excepción al leer inventario libera cerrojo.');
let reads=0;ScriptApp.getProjectTriggers=()=>{reads++;return ts.slice()};
LockService.getScriptLock=()=>({waitLock(){throw Error('ocupado')},releaseLock(){throw Error('no adquirido')}});
ck.equal(rev636.migrar(false).fallos.length,1);ck.equal(reads,0);
console.log('APROBADO: cerrojo ocupado impide leer/modificar inventario.');
const beforeSim=ts.map(t=>t.getUniqueId());rev636.migrar(true);
ck.deepEqual(ts.map(t=>t.getUniqueId()),beforeSim);
console.log('APROBADO: simulación sin cerrojo no modifica activadores.');
console.log('Revisión local 6.36 completada; no equivale a la suite anunciada de 812 ni a validación en Google.');
