const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'Codigo_16_TikTok_redirect.gs'), 'utf8');
new vm.Script(source); // Sintaxis del servidor completo.
const slice = source.slice(source.indexOf('function validarRetornoTikTok_('), source.indexOf('function obtenerTokenTikTok_('));
const uri = 'https://script.google.com/macros/s/AKfycbyWXkkfk8tTizluP1lCOtIMcGtXUjQJIlPnlTrZ2KEw26svHSdQcKLoDz50SJrtw4LLDQ/exec';
let passed = 0;
function setup() {
  const props = { TIKTOK_REDIRECT_URI: uri };
  const data = new Map(); const calls = []; const alerts = [];
  const keys = { TIKTOK_CLIENT_KEY: 'test-client', TIKTOK_CLIENT_SECRET: 'test-secret' };
  const ctx = {
    PropertiesService: {getScriptProperties: () => ({getProperty:k=>props[k], setProperty:(k,v)=>{props[k]=v;}})},
    CacheService: {getScriptCache: () => ({get:k=>data.get(k),put:(k,v)=>data.set(k,v),remove:k=>data.delete(k)})},
    SpreadsheetApp: {getUi:()=>({alert:(...a)=>alerts.push(a),ButtonSet:{OK:1}})},
    ScriptApp: {getService:()=>{throw Error('No debe consultar la URL automática');}},
    Utilities: {getUuid:()=> '0123456789abcdef0123456789abcdef'},
    exigirOrigenInterno:()=>{}, proveedorApiKey:k=>keys[k], compararEnTiempoConstante:(a,b)=>a===b,
    URL_TIKTOK_AUTORIZAR:'https://www.tiktok.com/v2/auth/authorize/',TIKTOK_SCOPE:'video.list',
    URL_TIKTOK_OAUTH_TOKEN:'https://open.tiktokapis.com/v2/oauth/token/',
    ejecutarFetchSeguro:(url,opts)=>{calls.push(opts);return {ok:true,cuerpo:JSON.stringify({access_token:'test-access',refresh_token:'test-refresh',open_id:'test-id',expires_in:86400})};},
    guardarApiKey_:()=>{},logWarn:()=>{},logError:()=>{},logInfo:()=>{}
  };
  vm.createContext(ctx); vm.runInContext(slice,ctx);
  return {ctx,props,data,calls,alerts,keys,start:()=>ctx.iniciarAutorizacionTikTok(),finish:state=>ctx.completarAutorizacionTikTok('test-code',state),state:()=>JSON.parse(data.get('TIKTOK_OAUTH_CONTEXT_V2')).estado};
}
function test(name,fn){fn();passed++;console.log('OK '+name);}
test('Sintaxis del servidor completo',()=>assert.ok(source.length>100000));
test('La autorización lleva la URL configurada',()=>{const t=setup();t.start();const url=t.alerts[0][1].match(/https:\/\/www.tiktok.com\S+/)[0];assert.equal(new URL(url).searchParams.get('redirect_uri'),uri);});
test('Sin propiedad no genera autorización',()=>{const t=setup();delete t.props.TIKTOK_REDIRECT_URI;t.start();assert.equal(t.data.size,0);assert.equal(t.calls.length,0);});
for(const bad of [uri+'?x=1',uri.replace('/exec','/dev'),'https://example.com/exec',uri+' texto']){
  test('Rechaza URL inválida '+bad.slice(-12),()=>{const t=setup();t.props.TIKTOK_REDIRECT_URI=bad;t.start();assert.equal(t.data.size,0);assert.equal(t.calls.length,0);});
}
test('El canje conserva la URL aunque cambie la propiedad',()=>{const t=setup();t.start();const s=t.state();t.props.TIKTOK_REDIRECT_URI='https://script.google.com/macros/s/otro/exec';assert.equal(t.finish(s).exito,true);assert.equal(t.calls[0].payload.redirect_uri,uri);});
test('El canje conserva la URL aunque se borre la propiedad',()=>{const t=setup();t.start();const s=t.state();delete t.props.TIKTOK_REDIRECT_URI;assert.equal(t.finish(s).exito,true);assert.equal(t.calls[0].payload.redirect_uri,uri);});
test('Estado erróneo no llama a TikTok',()=>{const t=setup();t.start();assert.equal(t.finish('incorrecto').exito,false);assert.equal(t.calls.length,0);});
test('Estado caducado no llama a TikTok',()=>{const t=setup();assert.equal(t.finish('caducado').exito,false);assert.equal(t.calls.length,0);});
test('No acepta autorización antigua sin contexto',()=>{const t=setup();t.data.set('TIKTOK_OAUTH_STATE','antiguo');assert.equal(t.finish('antiguo').exito,false);assert.equal(t.calls.length,0);});
test('No reutiliza estado después del canje',()=>{const t=setup();t.start();const s=t.state();assert.equal(t.finish(s).exito,true);assert.equal(t.finish(s).exito,false);assert.equal(t.calls.length,1);});
test('Cambio de Client Key exige nueva autorización',()=>{const t=setup();t.start();const s=t.state();t.keys.TIKTOK_CLIENT_KEY='otro';assert.equal(t.finish(s).exito,false);assert.equal(t.calls.length,0);});
test('Contexto ilegible no llama a TikTok',()=>{const t=setup();t.data.set('TIKTOK_OAUTH_CONTEXT_V2','{');assert.equal(t.finish('x').exito,false);assert.equal(t.calls.length,0);});
console.log(passed+' pruebas correctas; servicios simulados, sin llamadas a Google o TikTok.');
