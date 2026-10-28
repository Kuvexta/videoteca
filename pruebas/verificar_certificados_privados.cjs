const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('Codigo_19_Certificados_Privados.gs','utf8');new vm.Script(src);
function fn(n){const start=src.indexOf('function '+n+'(');assert(start>=0);const end=src.indexOf('\nfunction ',start+10);return src.slice(start,end<0?undefined:end);}
let count=0;function test(n,f){f();count++;console.log('OK '+n);}
function setup(options={}){
 const state={copies:0,pdfs:0,sent:0,publications:0,trashed:0,queued:0};
 const folder=(changes={})=>({getOwner:()=>({getEmail:()=> 'owner@example.test'}),getSharingAccess:()=> 'PRIVATE',getEditors:()=>[],getViewers:()=>[],...changes});
 const root=folder(options.root),certs=folder(options.certs);
 const pdf={setName(){return this;},getUrl:()=> 'private-file',setSharing(){state.publications++;throw Error('No publicar');}};
 certs.createFile=()=>{state.pdfs++;return pdf;};
 const copy={getId:()=> 'copy',getAs:()=> 'blob',setTrashed:()=>{state.trashed++;}};
 const c={exigirOrigenInterno:()=>{},Session:{getEffectiveUser:()=>({getEmail:()=>options.ejecutor===undefined?'owner@example.test':options.ejecutor})},
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='CERTIFICADO_TEMPLATE_ID'?(options.noTemplate?'':'template'):null})},
 DriveApp:{Access:{PRIVATE:'PRIVATE'},getFileById:()=>({makeCopy:()=>{state.copies++;return copy;}})},
 obtenerCarpetaRaiz:()=>root,obtenerSubcarpeta:()=>certs,formatearFecha:()=>'',MimeType:{PDF:'pdf'},
 SlidesApp:{openById:()=>({getSlides:()=>[{replaceAllText:()=>{}}],saveAndClose:()=>{}})},
 enviarEmailDiplomaEstudiante:()=>{state.sent++;},logInfo:()=>{},logError:()=>{},encolarTareaDiferida:()=>{state.queued++;}};
 vm.createContext(c);vm.runInContext(fn('exigirDestinoCertificadosPrivado_')+'\n'+fn('generarCertificadoAprobado'),c);
 return {state,run:()=>c.generarCertificadoAprobado({estudiante:'Prueba',correo:'student@example.test',notaPorcentaje:80})};
}
test('Destino privado emite PDF y adjunto sin publicación',()=>{const t=setup();assert.equal(t.run(),'private-file');assert.equal(t.state.pdfs,1);assert.equal(t.state.sent,1);assert.equal(t.state.publications,0);assert.equal(t.state.trashed,1);});
for(const [name,change] of Object.entries({publica:{getSharingAccess:()=> 'ANYONE_WITH_LINK'},dominio:{getSharingAccess:()=> 'DOMAIN'},editor:{getEditors:()=>[{}]},lector:{getViewers:()=>[{}]},sinPropietario:{getOwner:()=>null},otroPropietario:{getOwner:()=>({getEmail:()=> 'other@example.test'})},falloPermisos:{getSharingAccess:()=>{throw Error('Drive no disponible');}}})){
 for(const location of ['root','certs'])test(location+' '+name+' bloquea antes de copiar datos',()=>{const t=setup({[location]:change});assert.equal(t.run(),'');assert.equal(t.state.copies,0);assert.equal(t.state.pdfs,0);assert.equal(t.state.sent,0);});
}
test('Identidad no disponible bloquea emisión',()=>{const t=setup({ejecutor:''});assert.equal(t.run(),'');assert.equal(t.state.copies,0);});
test('Sin plantilla mantiene emisión desactivada',()=>{const t=setup({noTemplate:true});assert.equal(t.run(),'');assert.equal(t.state.copies,0);assert.equal(t.state.queued,0);});
console.log(count+' pruebas de privacidad aprobadas; Drive y correo simulados, sin envíos reales.');
