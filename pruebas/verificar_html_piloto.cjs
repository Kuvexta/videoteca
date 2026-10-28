const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('Index_6_Piloto_Completo.html','utf8');
for(const m of src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1].replace(/<\?[\s\S]*?\?>/g,'test'));
function fn(name){const re=new RegExp('(?:async )?function '+name+'\\('),m=re.exec(src);assert(m);const tail=src.slice(m.index),end=/\n(?:async )?function /.exec(tail.slice(1));return end?tail.slice(0,end.index+1):tail;}
let passed=0;async function test(name,body){await body();passed++;console.log('OK '+name);}
function setup(){const nodes=new Map(),timers=new Map();let id=0,success,failure;const node=key=>{if(!nodes.has(key))nodes.set(key,{hidden:false,innerHTML:'old',value:'secret',checked:true,style:{},textContent:'',addEventListener(){},focus(){},setAttribute(){}});return nodes.get(key)};
const c={console,Promise,Error,Date,Math,Number,Object,String,Boolean,JSON,decodeURIComponent,encodeURIComponent,ESPERA_MAX_MS:45000,
 App:{generacionSesion:0,token:'session-a',sesion:{scope:'exam',email:'a@example.test'},cargando:0,params:{},relojSesion:null},
 document:{getElementById:node,querySelectorAll:()=>[node('private-section')],body:{style:{}}},
 setTimeout:f=>{timers.set(++id,f);return id},clearTimeout:i=>timers.delete(i),setInterval:f=>{timers.set(++id,f);return id},clearInterval:i=>timers.delete(i),
 google:{script:{run:{withSuccessHandler(f){success=f;return this},withFailureHandler(f){failure=f;return this},apiPortal(a,b){c.lastRequest={a,b}}}}},
 localStorage:{},sessionStorage:{},K_SESION:'session',K_PERSONAL:'personal',Guardar:{get:()=>null,set(){},del(){}},
 FAV:{ids:{old:true},cargando:Promise.resolve({})},CAT:{filtrosCargados:{private:true},ultimaBusqueda:'old'},
 cerrarVideo(){c.videoClosed=true},cerrarPanelLateral(){},limpiarExamen(){c.examCleared=true},limpiarAdmin(){c.adminCleared=true},
 brindar:()=>{},brindis:()=>{},marcarCargando:()=>{},sesionCaducada(){c.expired=true},mostrarAcceso(...x){c.access=x},location:{hash:''},
 avisoHTML:(a,b,t)=>b+': '+t,cargandoHTML:t=>t,esc:s=>s,ocultarTodo:()=>{},cerrarMenu:()=>{},iniciales:()=>'',registrarDispositivo:()=>{},cargarMarca:()=>{},
 irA:h=>{c.nav=h},RUTAS:{'#/catalogo':{},'#/inicio':{}},pintarEstructuraCatalogo(){},pintarFiltros:async()=>{},pintarResultadosBusqueda(){c.paint='semantic'},pintarCatalogo(){c.paint='literal'},pintarFavoritos(){},mostrarDiagnostico(){}};
vm.createContext(c);for(const n of ['ErrorApi','invocar','api','partirHash','armarHash','filtrosDelHash','hashDeFiltros','actualizarMenuSesion','limpiarSesion','salir','vigilarCaducidad','aplicarSesion'])vm.runInContext(fn(n),c);
return {c,node,timers,success:x=>success(x),failure:x=>failure(x)};}
(async()=>{
await test('Clave oculta y recordar desactivado inicialmente',()=>{assert.match(src,/<input type="password" id="in-token"/);assert.match(src,/<input type="checkbox" id="in-recordar">/);assert.match(src,/aplicarSesion\(d, TOKEN_URL, false\)/)});
await test('Viewport móvil sin bloquear zoom',()=>assert.match(src,/name="viewport" content="width=device-width, initial-scale=1"/));
await test('Parámetros mal codificados no rompen navegación',()=>{const {c}=setup();assert.equal(c.partirHash('#/catalogo?q=%ZZ&idi=ES').params.idi,'ES')});
await test('Valores con igual se conservan y claves peligrosas se ignoran',()=>{const {c}=setup(),r=c.partirHash('#/catalogo?q=a=b&__proto__=bad');assert.equal(r.params.q,'a=b');assert.equal(Object.hasOwn(r.params,'__proto__'),false)});
await test('Búsqueda inicial sin IA y modo semántico persiste en enlace',()=>{const {c}=setup();assert.equal(c.filtrosDelHash().modoBusqueda,'palabras');c.App.params={q:'factura',bus:'semantica'};assert.match(c.hashDeFiltros(c.filtrosDelHash(),1),/bus=semantica/)});
await test('Supervisor solo recibe su enlace de resultados en menú personal',()=>{const {c,node}=setup();c.App.sesion.scope='supervisor';c.actualizarMenuSesion();assert(node('m-notas').hidden);assert(node('m-preferencias').hidden);assert(node('m-admin').hidden);assert.equal(node('m-resultados').hidden,false)});
await test('Administrador conserva todos sus enlaces',()=>{const {c,node}=setup();c.App.sesion.scope='admin';c.actualizarMenuSesion();assert.equal(node('m-notas').hidden,false);assert.equal(node('m-admin').hidden,false);assert.equal(node('m-resultados').hidden,false)});
await test('Una sola vigilancia de caducidad tras renovar',()=>{const {c,timers}=setup();c.vigilarCaducidad();c.vigilarCaducidad();c.vigilarCaducidad();assert.equal(timers.size,1)});
await test('Cierre purga examen favoritos vistas y temporizadores',()=>{const {c,node,timers}=setup();c.vigilarCaducidad();c.App.cancelarNota=()=>{c.noteCancelled=true};c.limpiarSesion();assert.equal(c.App.token,null);assert.equal(c.FAV.ids,null);assert.equal(c.CAT.filtrosCargados,null);assert.equal(node('private-section').innerHTML,'');assert(c.examCleared&&c.adminCleared&&c.videoClosed&&c.noteCancelled);assert.equal(timers.size,0)});
await test('Respuesta de sesión anterior no expone datos a la nueva',async()=>{const t=setup(),p=t.c.invocar('notas',{});t.c.App.generacionSesion++;t.success({ok:true,data:{secret:'old'}});await assert.rejects(p,e=>e.codigo===499)});
await test('Un 401 tardío no expulsa a la sesión nueva',async()=>{const t=setup(),p=t.c.api('notas',{});t.c.App.generacionSesion++;t.success({ok:false,codigo:401,error:'old session'});await assert.rejects(p,e=>e.codigo===499);assert.equal(t.c.expired,undefined)});
await test('Timeout advierte resultado incierto sin recomendar repetir escritura',async()=>{const t=setup(),p=t.c.invocar('intento_entregar',{});[...t.timers.values()][0]();await assert.rejects(p,e=>e.codigo===408&&e.message.includes('podría seguir ejecutándose'))});
await test('Logout cierra local inmediatamente y reconoce fallo remoto',async()=>{const t=setup(),p=t.c.salir();assert.equal(t.c.App.token,null);t.failure({message:'network'});await p;assert.equal(t.c.access[0],'warn');assert.match(t.c.access[2],/No se pudo confirmar/)});
await test('Logout confirmado no exige mantener la sesión local',async()=>{const t=setup(),p=t.c.salir();t.success({ok:true,data:{}});await p;assert.equal(t.c.access[0],'ok')});
await test('Logout tardío no tapa el acceso de otra persona',async()=>{const t=setup(),p=t.c.salir();t.c.App.sesion={email:'b@example.test'};t.success({ok:true,data:{}});await p;assert.equal(t.c.access[0],'info')});
for(const mode of ['palabras','semantica'])await test('Catálogo elige ruta '+mode,async()=>{const t=setup();t.c.App.params={q:'factura',bus:mode};t.c.FAV.cargar=async()=>({});t.c.api=async(a)=>{t.c.route=a;return {}};vm.runInContext(fn('verCatalogo'),t.c);await t.c.verCatalogo({dataset:{armado:'1'}});assert.equal(t.c.route,mode==='semantica'?'search':'catalogo')});
await test('Notas diferidas pertenecen a su sesión y cancelan su temporizador',()=>{const n=fn('montarNotaVideo');assert.match(n,/const generacion = App.generacionSesion/);assert.match(n,/generacion !== App.generacionSesion \|\| cancelada/);assert.match(n,/cancelada = true; clearTimeout\(reloj\)/)});
console.log(passed+' pruebas de interfaz aprobadas; navegador y servidor simulados.');
})().catch(e=>{console.error(e);process.exitCode=1});
