function verificarTikTokTemporal() {
  if (ScriptApp.getScriptId() !== '1pv0v0_r60zn8rLc614fewTK6qS7BPYgNpr0d5LMvSmIAU_fC4YUEN4tZ' ||
      Session.getEffectiveUser().getEmail() !== 'andressuarezcarmona@gmail.com' ||
      Session.getActiveUser().getEmail() !== 'andressuarezcarmona@gmail.com') throw new Error('Contexto incorrecto');
  marcarOrigenConfiable();
  const antes = PropertiesService.getScriptProperties().getProperties();
  const token = obtenerTokenTikTok_();
  if (!token) { console.log('DIAG_TIKTOK: sin token disponible'); return; }
  const resumen = [];
  function consultar(ruta, payload) {
    verificarCuotaDisponible(1, 'TIKTOK');
    const r = ejecutarFetchSeguro(URL_TIKTOK_API_BASE + ruta + '/?fields=' + encodeURIComponent(TIKTOK_CAMPOS), {
      method:'POST',contentType:'application/json',headers:{Authorization:'Bearer '+token},payload:JSON.stringify(payload)
    }, 'TikTok diagnóstico');
    let j; try { j=JSON.parse(r.cuerpo); } catch(e) { j={}; }
    const code = j.error && /^[a-zA-Z0-9_.-]{1,80}$/.test(j.error.code) ? j.error.code : 'sin_codigo_valido';
    resumen.push({ruta:ruta,http:r.codigo,codigo:code,solicitados:payload.filters ? payload.filters.video_ids.length : payload.max_count,
      devueltos:j.data && Array.isArray(j.data.videos) ? j.data.videos.length : null,
      mas:j.data && typeof j.data.has_more === 'boolean' ? j.data.has_more : null});
    return r.ok && code === 'ok';
  }
  consultar('video/list',{max_count:1});
  const ids=[];
  iterarCatalogoPorBloques(function(datos) {
    datos.forEach(function(f) {
      if(String(f[IDX.FUENTE] || deducirFuenteDesdeUrl(f[IDX.URL])).indexOf('TikTok') !== -1 && !(parseFloat(f[IDX.DURACION]) > 0) && f[IDX.ID]) ids.push(String(f[IDX.ID]).trim());
    });
    return false;
  });
  for(let i=0;i<Math.min(ids.length,100);i+=20) {
    if(!consultar('video/query',{filters:{video_ids:ids.slice(i,i+20)}}))break;
  }
  const despues=PropertiesService.getScriptProperties().getProperties();
  console.log('DIAG_TIKTOK '+JSON.stringify({pendientes:ids.length,respuestas:resumen,
    propiedadesSinCambios:JSON.stringify(Object.keys(antes).sort().map(k=>[k,antes[k]]))===JSON.stringify(Object.keys(despues).sort().map(k=>[k,despues[k]]))}));
}
