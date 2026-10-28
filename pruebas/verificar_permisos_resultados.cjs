const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('Codigo_17_TikTok_diagnostico.gs','utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0);const end=source.indexOf('\nfunction ',start+10);return source.slice(start,end<0?undefined:end);}
let count=0;
function test(n,f){f();count++;console.log('OK '+n);}
function setup(){
 const identities={a:{email:'a@example.test',scope:'exam'},b:{email:'b@example.test',scope:'exam'},admin:{email:'admin@example.test',scope:'admin'}};
 const attempts={A:{datos:['A','a@example.test','entregado']},B:{datos:['B','b@example.test','entregado']},open:{datos:['open','a@example.test','en_curso']}};
 const records=[['','A','a@example.test','Examen A','','',1,.9,'','','','A'],['','B','b@example.test','Examen B','','',1,.8,'','','','B']];
 let reads=0,pdf=0;
 const c={INT:{ID:0,EMAIL:1,ESTADO:2},ESTADO_INTENTO:{ENTREGADO:'entregado'},NIVEL_SCOPE:{read_only:1,exam:2,append:3,admin:9},SCOPES_VALIDOS:['read_only','exam','admin'],
 t:k=>k,exigirOrigenInterno:()=>{},marcarOrigenConfiable:()=>{},logWarn:()=>{},logError:()=>{},verificarRateLimit:()=>true,validarPayload:()=>{},
 obtenerDatosToken_:tk=>identities[tk],leerIntento:id=>attempts[id],obtenerInformeIntento:(id,forense)=>({id,forense}),resumirInformeParaColaborador:()=>'',
 generarInformePDFIntento:()=>{pdf++;return {exito:true,url:'test'};},obtenerEstadoModuloUsuario:(email,id)=>({email,id}),
 SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>({getLastRow:()=>3,getRange:()=>({getValues:()=>{reads++;return records;}})})})},
 obtenerZonaHoraria:()=>'',resolverNivelDesempeno:()=>({nivel:'test'}),resumirCalificaciones:r=>({cantidad:r.length})};
 vm.createContext(c);
 for(const n of ['scopeAlcanza','obtenerRutasPortal','apiPortal','informeIntentoDeSesion','exigirIntentoEntregado_','buscarCalificacionesEstudiante']) vm.runInContext(fn(n),c);
 c.validarTokenConScope=(tk,scope)=>{if(!identities[tk])throw Error('401');if(!c.scopeAlcanza(identities[tk].scope,scope))throw Error('403');};
 return {c,call:(action,token,rest={})=>c.apiPortal(action,{token,...rest}),reads:()=>reads,pdfs:()=>pdf};
}
test('Participante consulta informe propio sin anexo forense',()=>{const t=setup(),r=t.call('informe_intento','a',{intentoId:'A'});assert.equal(r.ok,true);assert.equal(r.data.forense,false);});
test('Participante no consulta informe ajeno',()=>assert.equal(setup().call('informe_intento','a',{intentoId:'B'}).ok,false));
test('Correo y scope falsificados no cambian identidad',()=>assert.equal(setup().call('informe_intento','a',{intentoId:'B',email:'b@example.test',scope:'admin',sesion:{scope:'admin'}}).ok,false));
test('Administrador consulta informe ajeno entregado',()=>{const r=setup().call('informe_intento','admin',{intentoId:'B'});assert.equal(r.ok,true);assert.equal(r.data.forense,true);});
for(const tk of ['a','admin'])test(tk+' no obtiene solucionario de examen abierto',()=>assert.equal(setup().call('informe_intento',tk,{intentoId:'open'}).ok,false));
test('PDF ajeno bloqueado antes de generar archivo',()=>{const t=setup();assert.equal(t.call('informe_pdf','a',{intentoId:'B'}).ok,false);assert.equal(t.pdfs(),0);});
test('PDF propio permitido',()=>{const t=setup();assert.equal(t.call('informe_pdf','a',{intentoId:'A'}).ok,true);assert.equal(t.pdfs(),1);});
test('Calificaciones solo contienen las propias',()=>{const r=setup().call('notas','a',{correo:'b@example.test'});assert.equal(r.ok,true);assert.equal(r.data.registros.length,1);assert.equal(r.data.registros[0].intentoId,'A');});
test('Consulta directa de notas ajenas bloqueada antes de leer hoja',()=>{const t=setup();assert.equal(t.c.buscarCalificacionesEstudiante('a','b@example.test').exito,false);assert.equal(t.reads(),0);});
test('Admin puede seleccionar correo en función de calificaciones',()=>{const t=setup();assert.equal(t.c.buscarCalificacionesEstudiante('admin','b@example.test').registros[0].intentoId,'B');});
test('Estado del módulo ignora correo declarado',()=>assert.equal(setup().call('modulo_estado','a',{moduloId:'M',email:'b@example.test'}).data.email,'a@example.test'));
for(const action of ['stats','panel_admin','actividad','informe_auditoria'])test('Participante bloqueado en '+action,()=>{const r=setup().call(action,'a',{moduloId:'M'});assert.equal(r.ok,false);assert.equal(r.codigo,403);});
test('Sin token no obtiene resultados',()=>assert.equal(setup().call('informe_intento','invalido',{intentoId:'A'}).codigo,401));
test('No existe scope supervisor en jerarquía actual',()=>assert.equal(setup().c.scopeAlcanza('supervisor','read_only'),false));
console.log(count+' pruebas correctas; datos ficticios y servicios simulados. No se verifica sesión real ni permisos Drive.');

