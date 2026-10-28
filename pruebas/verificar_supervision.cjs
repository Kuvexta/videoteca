const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('Codigo_18_Supervision.gs','utf8'),html=fs.readFileSync('Index_5_Supervision.html','utf8');new vm.Script(src);
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1].replace(/<\?[\s\S]*?\?>/g,'test'));
function extract(n){const a=src.indexOf('function '+n+'(');assert.ok(a>=0);const b=src.indexOf('\nfunction ',a+10);return src.slice(a,b<0?undefined:b);}
let passed=0;function test(n,f){f();passed++;console.log('OK '+n);}
function setup(){let reads=0;const scopes=['read_only','exam','append','admin','supervisor'];
 const c={SCOPES_VALIDOS:scopes,NIVEL_SCOPE:{read_only:1,exam:2,append:3,admin:9},t:k=>k,exigirOrigenInterno:()=>{},marcarOrigenConfiable:()=>{},logWarn:()=>{},logError:()=>{},logInfo:()=>{},
 verificarRateLimit:()=>true,validarPayload:()=>{},obtenerDatosToken_:tk=>scopes.includes(tk)?{scope:tk,email:tk+'@example.test'}:null,
 validarTokenInvitacion:()=>({aplica:false}),obtenerZonaHoraria:()=>'',
 SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>({getLastRow:()=>121,getRange:()=>({getValues:()=>{reads++;return Array.from({length:120},(_,i)=>['','Nombre',i%2?'b@example.test':'a@example.test','Examen','','',10,.75,'Aprobado','secretoURL','modulo','intento']);}})})})},
 emitirSesionInterna_:(email,duracion,scope)=>({email,scope}),SESION_DURACION_MIN_DEFAULT:180,registrarUsoTokenPersonal:()=>{},resolverNombreVisible:e=>e};
 vm.createContext(c);for(const n of ['scopeAlcanza','validarTokenConScope','obtenerRutasPortal','apiPortal','consultarResultadosSupervision','canjearTokenPorSesion'])vm.runInContext(extract(n),c);
 return {c,reads:()=>reads,call:(tk,action,d={})=>c.apiPortal(action,{...d,token:tk})};}
test('Supervisor obtiene 50 de 120 resultados sin enlaces ni identificadores internos',()=>{const t=setup(),r=t.call('supervisor','supervision_resultados');assert.equal(r.ok,true);assert.equal(r.data.total,120);assert.equal(r.data.registros.length,50);assert.equal(r.data.paginas,3);assert.ok(!JSON.stringify(r).includes('secretoURL'));});
test('Filtra correo normalizado',()=>{const r=setup().call('supervisor','supervision_resultados',{correo:' A@example.test '});assert.equal(r.data.total,60);assert.ok(r.data.registros.every(f=>f.correo==='a@example.test'));});
test('Última página limita rango',()=>{const r=setup().call('supervisor','supervision_resultados',{pagina:999});assert.equal(r.data.pagina,3);assert.equal(r.data.registros.length,20);});
for(const scope of ['read_only','exam','append','invalido'])test(scope+' no lee resultados globales',()=>{const t=setup();assert.equal(t.call(scope,'supervision_resultados',{scope:'admin'}).ok,false);assert.equal(t.reads(),0);});
test('Admin conserva acceso global',()=>assert.equal(setup().call('admin','supervision_resultados').ok,true));
for(const action of ['panel_admin','marca_set','agregar_video','incidencia_cerrar','intento_iniciar','intento_guardar','save_progress','preferences_set','informe_pdf','stats'])test('Supervisor bloqueado en '+action,()=>assert.equal(setup().call('supervisor',action).ok,false));
test('Todas las rutas salvo acceso y supervisión quedan bloqueadas',()=>{const t=setup();for(const [name,r]of Object.entries(t.c.obtenerRutasPortal())){if(['canjear_token','sesion_actual','logout','marca','supervision_resultados'].includes(name))continue;assert.equal(t.c.scopeAlcanza('supervisor',r.scope),false,name);}});
test('Canje mantiene scope supervisor sin elevarlo',()=>{const r=setup().c.canjearTokenPorSesion('supervisor');assert.equal(r.scope,'supervisor');assert.equal(r.token.scope,'supervisor');});
test('Jerarquía anterior sin cambios',()=>{const t=setup();assert.equal(t.c.scopeAlcanza('exam','read_only'),true);assert.equal(t.c.scopeAlcanza('append','admin'),false);assert.equal(t.c.scopeAlcanza('admin','append'),true);});
test('Número de rutas frontend coincide',()=>assert.equal(Object.keys(setup().c.obtenerRutasPortal()).length,Number(html.match(/RUTAS_ESPERADAS = (\d+)/)[1])));
console.log(passed+' pruebas correctas. Autorización y rutas reales; almacenamiento ficticio.');
