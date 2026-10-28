const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const src = fs.readFileSync('Codigo_17_TikTok_diagnostico.gs','utf8');
new vm.Script(src);
const batch = src.slice(src.indexOf('function obtenerMetadatosTikTokAvanzadoLote('),src.indexOf('/** Metadatos por API de un solo video.'));
const catalog = src.slice(src.indexOf('function completarMetadatosTikTokDelCatalogo('),src.indexOf('/** Estado de la integración'));
let passed=0;
function test(name,fn){fn();passed++;console.log('OK '+name);}
function setup(responses=[],token='token',quota=Infinity){
 let calls=0; const alerts=[], writes=[];
 const c={obtenerTokenTikTok_:()=>token,TIKTOK_MAX_IDS_POR_LOTE:20,TIKTOK_CAMPOS:'id,duration',URL_TIKTOK_API_BASE:'https://open.tiktokapis.com/v2/',
 verificarCuotaDisponible:()=>{if(calls>=quota)throw Error('quota');}, ejecutarFetchSeguro:()=>responses[calls++],
 logWarn:()=>{},logInfo:()=>{},CacheService:{getScriptCache:()=>({remove:()=>{}})}, Utilities:{formatDate:()=>''},obtenerZonaHoraria:()=>'',
 exigirOrigenInterno:()=>{},obtenerApiKey_:()=>true,alertarUsuario:s=>alerts.push(s),notificarUsuario:()=>{},
 IDX:{FUENTE:0,URL:1,DURACION:2,ID:3,VISTAS:4,LIKES:5,FECHA_PUB:6},
 iterarCatalogoPorBloques:fn=>fn([['TikTok','',0,'1'],['TikTok','',0,'2']],2),
 obtenerHojaDatos:()=>({getRange:(...a)=>({setValue:v=>writes.push([a,v])})}),invalidarCacheAPI:()=>{}};
 vm.createContext(c);vm.runInContext(batch+'\n'+catalog,c);return {c,alerts,writes,calls:()=>calls};
}
const response = videos=>({ok:true,codigo:200,cuerpo:JSON.stringify({data:{videos},error:{code:'ok'}})});
test('Respuesta vacía válida no acusa propiedad',()=>{const t=setup([response([])]);const r=t.c.completarMetadatosTikTokDelCatalogo();assert.equal(r.sinDatos,2);assert.equal(r.consultados,2);assert.equal(r.errores.length,0);assert.equal(t.writes.length,0);assert.ok(!t.alerts[0].includes('no pertenecen'));});
for(const [name,r] of [['HTTP401',{ok:false,codigo:401}],['HTTP500',{ok:false,codigo:500}],['error HTTP200',{ok:true,cuerpo:'{"error":{"code":"scope_not_authorized"}}'}],['JSON roto',{ok:true,cuerpo:'{' }],['sin videos',{ok:true,cuerpo:'{"error":{"code":"ok"},"data":{}}'}]]){
 test(name+' conserva catálogo y declara fallo',()=>{const t=setup([r]);const d=t.c.completarMetadatosTikTokDelCatalogo();assert.equal(d.errores.length,1);assert.equal(d.consultados,0);assert.equal(t.writes.length,0);assert.ok(t.alerts[0].includes('Consulta incompleta'));});
}
test('Sin token no consulta ni altera',()=>{const t=setup([],'');const d=t.c.completarMetadatosTikTokDelCatalogo();assert.equal(d.errores.length,1);assert.equal(t.calls(),0);assert.equal(t.writes.length,0);});
test('Cuota agotada no acusa propiedad',()=>{const t=setup([],'token',0);const d=t.c.completarMetadatosTikTokDelCatalogo();assert.equal(d.errores.length,1);assert.equal(t.calls(),0);});
test('Resultado parcial preserva datos válidos',()=>{const t=setup([response([{id:'1',duration:120}]),{ok:false,codigo:500}]);const d={};const m=t.c.obtenerMetadatosTikTokAvanzadoLote(Array.from({length:21},(_,i)=>String(i+1)),d);assert.equal(m['1'].duracion,2);assert.equal(d.consultados,20);assert.equal(d.errores.length,1);});
test('Actualiza solo filas devueltas',()=>{const t=setup([response([{id:'1',duration:120,view_count:50,like_count:3}])]);const d=t.c.completarMetadatosTikTokDelCatalogo();assert.equal(d.actualizados,1);assert.equal(d.sinDatos,1);assert.equal(t.writes.length,3);assert.ok(t.writes.every(w=>w[0][0]===2));});
test('Indicador exige ambas credenciales',()=>{const match=src.match(/et: "TikTok \(credenciales\)", ok: (.*?), opcional/);assert.ok(match);for(const [k,s]of [[false,false],[true,false],[false,true],[true,true]])assert.equal(vm.runInNewContext(match[1],{clave:n=>n==='TIKTOK_CLIENT_KEY'?k:s}),k&&s);});
console.log(passed+' pruebas correctas. Servicios simulados.');
