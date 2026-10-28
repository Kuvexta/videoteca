const fs=require('node:fs');
const html=fs.readFileSync('Index_5_Supervision.html','utf8');
const render=html.slice(html.indexOf('async function verSupervision('),html.indexOf('async function verNotas('));
fs.mkdirSync('prueba_supervision_local',{recursive:true});
fs.writeFileSync('prueba_supervision_local/index.html',`<!doctype html><meta charset="utf-8"><title>Prueba local de supervisión</title><style>body{font:16px system-ui;margin:32px;max-width:1000px}table{border-collapse:collapse;width:100%}td,th{padding:14px;text-align:left;border-bottom:1px solid #ddd}input,button{font:inherit;padding:10px;margin:8px}.mut{color:#555}</style><p>PRUEBA LOCAL — DATOS FICTICIOS</p><section id="vista"></section><script>
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function cargandoHTML(t){return esc(t)}function avisoHTML(t,h,s){return esc(h+' '+s)}
async function api(a,d){const rows=[{fecha:'2026-09-12',estudiante:'Participante A',correo:'a@example.test',evaluacion:'Evaluación de ejemplo',porcentaje:75,estado:'Aprobado'},{fecha:'2026-09-12',estudiante:'<img src=x onerror=alert(1)>',correo:'b@example.test',evaluacion:'Prueba de texto seguro',porcentaje:90,estado:'Aprobado'}].filter(r=>!d.correo||r.correo===d.correo);return {registros:rows,total:rows.length,pagina:1,paginas:1}}
${render}
verSupervision(document.getElementById('vista'));</script>`);
