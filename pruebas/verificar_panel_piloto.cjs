const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=fs.readFileSync('Codigo_20_Piloto_Completo.gs','utf8');new vm.Script(src);
function fn(n){const a=src.indexOf('function '+n+'('),b=src.indexOf('\nfunction ',a+10);assert(a>=0);return src.slice(a,b<0?undefined:b)}
let total=0;function test(n,f){f();total++;console.log('OK '+n)}
function row(url){let result=null,inserted=0,notice='';const c={exigirOrigenInterno(){},solicitarTexto:()=>url,obtenerHojaDatos:()=>({insertRowAfter(){inserted++},getRange:(r,col,n,w)=>({setValues(v){assert.equal(w,32);assert.equal(v[0].length,w);result=v[0]}})}),asegurarColumnas(){},TOTAL_COLUMNAS:32,IDX:{URL:0,TITULO:2,ESTADO:19},alertarUsuario:t=>notice=t,notificarUsuario(){}};vm.createContext(c);vm.runInContext(fn('insertarFilaEjemplo'),c);c.insertarFilaEjemplo();return {result,inserted,notice}}
test('Fila de ejemplo usa 32 columnas sin inventar duración o métricas',()=>{const r=row('https://www.youtube.com/watch?v=60yoGZZHZzI');assert.equal(r.inserted,1);assert.equal(r.result[0],'https://www.youtube.com/watch?v=60yoGZZHZzI');assert.equal(r.result[15],'');assert.equal(r.result[16],'');assert.equal(r.result[19],'🟡 Pendiente')});
test('Cancelar ejemplo no modifica el libro',()=>assert.equal(row('').inserted,0));
test('URL inválida no inserta fila',()=>{const r=row('not-a-video');assert.equal(r.inserted,0);assert.match(r.notice,/HTTPS/)});
test('Indicador Twitch exige las dos credenciales almacenadas',()=>assert.match(src,/ok: clave\("TWITCH_CLIENT_ID"\) && clave\("TWITCH_CLIENT_SECRET"\)/));
test('Etiqueta de prompts no promete una llamada al proveedor',()=>{assert.match(src,/et: "Revisar prompts \(sin llamada a IA\)"/);assert(!src.includes('et: "Probar que responde"'))});
test('Renovación distingue vigencia y rotación',()=>assert.match(src,/Extiende el vencimiento; conserva la misma clave/));
console.log(total+' pruebas del panel y fila de ensayo aprobadas; servicios simulados.');
