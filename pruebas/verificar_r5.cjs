const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const s=fs.readFileSync('Codigo_22_Catalogo_Metricas.gs','utf8');new vm.Script(s);
const helper=fs.readFileSync('verificar_r4.cjs','utf8');const fn=new Function('assert',helper.slice(helper.indexOf('function fn('),helper.indexOf('let count=0;'))+'return fn;')(assert);
let rows=[],history=[],allowed=true,rate=true,parsed={plataforma:'YouTube',id:'abc'};
const c={Date,JSON,Array,marcarOrigenConfiable(){},exigirOrigenInterno(){},verificarRateLimit:()=>rate,respuestaJson:x=>x,validarPayload(){},validarTokenConScope:(token,scope)=>{assert.equal(scope,'append');if(!allowed)throw Error('403 denied')},obtenerHojaDatos:()=>({appendRow:x=>rows.push(x),getLastRow:()=>rows.length+1}),asegurarColumnas(){},parsearVideoUniversal:()=>parsed,invalidarCacheAPI(){},logInfo(){},logWarn(){},t:()=> 'invalid',TOTAL_COLUMNAS:32,SIN_CLASIFICAR:'Sin clasificar',obtenerDatosToken_:()=>({email:'a@test',client:'Persona'}),asegurarHojaSistema:()=>({appendRow:x=>history.push(x)})};
vm.createContext(c);let a=s.indexOf('const IDX ='),b=s.indexOf('\n};',a)+3;assert(a>=0);vm.runInContext(s.slice(a,b)+'\nglobalThis.IDX=IDX;',c);vm.runInContext(fn(s,'doPost'),c);vm.runInContext(fn(s,'registrarVisualizacionVideo'),c);
let count=0;function test(n,f){f();console.log('OK '+n);count++}const send=()=>c.doPost({postData:{contents:JSON.stringify({action:'append',token:'test',url:'https://example.test/video',titulo:'Prueba'})}});
test('Append coloca plataforma en Fuente y deja taxonomía por clasificar',()=>{const r=send(),x=rows[0];assert.equal(r.status,'success');assert.equal(x.length,32);assert.equal(x[c.IDX.FUENTE],'YouTube');assert.equal(x[c.IDX.ECOSISTEMA],'Sin clasificar');assert.equal(x[c.IDX.AREA],'Sin clasificar');assert.equal(r.plataforma,'YouTube')});
test('Append Vimeo conserva ID y respuesta de plataforma',()=>{parsed={plataforma:'Vimeo',id:'vimeo123'};const r=send();assert.equal(rows.at(-1)[c.IDX.ID],'vimeo123');assert.equal(r.plataforma,'Vimeo')});
test('Append no reconocido no inventa clasificación ni plataforma',()=>{parsed=null;assert.equal(send().plataforma,'');assert.equal(rows.at(-1)[c.IDX.ECOSISTEMA],'Sin clasificar')});
test('Append mantiene rechazo de permisos sin insertar',()=>{allowed=false;const n=rows.length;assert.equal(send().status,'error');assert.equal(rows.length,n);allowed=true});
test('Append conserva límite de peticiones',()=>{rate=false;const n=rows.length;assert.equal(send().codigo,429);assert.equal(rows.length,n);rate=true});
test('Apertura guarda identidad e ID sin modificar métricas externas',()=>{c.obtenerHojaDatos=()=>{throw Error('No mezclar métricas')};assert.equal(c.registrarVisualizacionVideo('t','abc','Título').exito,true);assert.equal(history.length,1);assert.equal(history[0][1],'a@test');assert.equal(history[0][3],'abc')});
test('Fallo del historial se comunica y no inventa registro',()=>{c.asegurarHojaSistema=()=>{throw Error('Sheets unavailable')};assert.equal(c.registrarVisualizacionVideo('t','abc','Título').exito,false);assert.equal(history.length,1)});
console.log(count+' pruebas R5 aprobadas. Servicios simulados.');

