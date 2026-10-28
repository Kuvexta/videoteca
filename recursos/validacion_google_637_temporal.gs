function codexValidacion637() {
  const fase = "preparar";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss || ss.getId() !== "1NLEEPZLHtTlieIQGx62V73kYGYmtAv4_rTHQpDvg6jE") throw new Error("Solo copia autorizada");
  if (VERSION_SCRIPT !== "v2026.6.37-VIDEOTECA-ETAPA2") throw new Error("Version incorrecta");
  marcarOrigenConfiable();
  const p = PropertiesService.getScriptProperties();
  const key = "CODEX_637_VALIDACION";
  const h = ss.getSheetByName("Videos - Capacitación");
  const tokenPrueba = "tkn_codex_validacion_637_temporal";
  const salida = x => console.log(JSON.stringify(x));
  if (fase === "preparar") {
    if (p.getProperty(key) || ScriptApp.getProjectTriggers().length || p.getProperty("INGESTA_CHECKPOINT") || p.getProperty("TOKEN_ROTACION_PENDIENTE")) throw new Error("Hay trabajo o prueba pendiente");
    const nombres = ["API_TOKENS_MAP", "ADMIN_TOKEN", "TOKEN_ROTACION_PENDIENTE", "INGESTA_CHECKPOINT", "INGESTA_FALLOS_ESCRITURA", "INGESTA_DETENIDA", "INGESTA_TRIGGER_ID", "ALERTAS_EMAIL_ACTIVO", "ALERTAS_EMAIL_DESTINO", "ALERTAS_TELEGRAM_ACTIVO", "WEBHOOK_NOTIFICACIONES_URL", "WEBHOOK_AGENTES_URL"];
    const previo = {}; nombres.forEach(k => previo[k] = p.getProperty(k));
    const inicio = h.getLastRow() + 1;
    const urls = h.getRange(2, 1, Math.min(500, inicio - 2), TOTAL_COLUMNAS).getValues().filter(f => f[IDX.ID] && f[IDX.TITULO] && /youtu/.test(String(f[IDX.URL]))).slice(0, 5).map(f => f[IDX.URL]);
    if (urls.length !== 5) throw new Error("Faltan cinco referencias de prueba");
    p.setProperty(key, JSON.stringify({ previo: previo, inicio: inicio }));
    if(h.getMaxRows()<inicio+4) h.insertRowsAfter(h.getMaxRows(),inicio+4-h.getMaxRows());
    h.getRange(inicio,1,5,TOTAL_COLUMNAS).setValues(urls.map(u=>{const f=new Array(TOTAL_COLUMNAS).fill("");f[IDX.URL]=u;return f}));
    SpreadsheetApp.flush();
    p.setProperty("INGESTA_CHECKPOINT",String(inicio));
    p.setProperty("ALERTAS_EMAIL_ACTIVO","true");p.setProperty("ALERTAS_EMAIL_DESTINO","andressuarezcarmona@gmail.com");
    p.setProperty("ALERTAS_TELEGRAM_ACTIVO","false");p.deleteProperty("WEBHOOK_NOTIFICACIONES_URL");p.deleteProperty("WEBHOOK_AGENTES_URL");
    ScriptApp.newTrigger("procesarColaConAntiTimeout").timeBased().after(30*60*1000).create();
    ScriptApp.newTrigger("onEditControlMovilTrigger").forSpreadsheet(ss).onEdit().create();
    salida({fase,version:VERSION_SCRIPT,inicio,filas:5,activadores:inventariarDisparadores()});
  } else if(fase === "migrar") {
    if(!p.getProperty(key))throw new Error("Falta preparar");
    const primera=migrarDisparadoresANombresPrivados(false);
    const ids1=ScriptApp.getProjectTriggers().map(t=>t.getUniqueId()).sort();
    const segunda=migrarDisparadoresANombresPrivados(false);
    const ids2=ScriptApp.getProjectTriggers().map(t=>t.getUniqueId()).sort();
    salida({primera,segunda,idsIguales:JSON.stringify(ids1)===JSON.stringify(ids2),inventario:inventariarDisparadores()});
  } else if(fase === "estado") {
    const cfg=JSON.parse(p.getProperty(key));
    const filas=h.getRange(cfg.inicio,1,5,TOTAL_COLUMNAS).getValues();
    salida({version:VERSION_SCRIPT,checkpoint:p.getProperty("INGESTA_CHECKPOINT"),fallos:p.getProperty("INGESTA_FALLOS_ESCRITURA"),detenida:p.getProperty("INGESTA_DETENIDA"),filasConId:filas.filter(f=>f[IDX.ID]).length,filasConTitulo:filas.filter(f=>f[IDX.TITULO]).length,activadores:inventariarDisparadores()});
  } else if(fase === "prepararToken") {
    if(!p.getProperty(key))throw new Error("Falta respaldo");
    obtenerTokenAdministrador_();
    const mapa=obtenerMapaTokens_();
    if(mapa[tokenPrueba])throw new Error("Token de prueba ya existe");
    mapa[tokenPrueba]={scope:"read_only",client:"CODEX VALIDACION 6.37 - TEMPORAL",email:"",expira:Date.now()+3600000};
    guardarMapaTokens_(mapa);
    salida({tokenTemporalPreparado:true,vigente:validarTokenConScope(tokenPrueba,"read_only")});
    abrirPanelConfiguracion();
  } else if(fase === "verificarRotacion") {
    const pending=JSON.parse(p.getProperty("TOKEN_ROTACION_PENDIENTE")||"null");
    const mapa=obtenerMapaTokens_();
    const nuevos=Object.keys(mapa).filter(t=>t!==tokenPrueba && mapa[t].client==="CODEX VALIDACION 6.37 - TEMPORAL");
    if(nuevos.length!==1)throw new Error("Cantidad inesperada de sustitutos");
    const viejoValido=(()=>{try{return validarTokenConScope(tokenPrueba,"read_only")}catch(e){return false}})();
    salida({rotacionPendiente:!!pending,viejoValido,nuevoValido:validarTokenConScope(nuevos[0],"read_only"),caducidadExacta:mapa[tokenPrueba]?mapa[tokenPrueba].expira===mapa[nuevos[0]].expira:null,scopeNuevo:mapa[nuevos[0]].scope});
  } else if(fase === "panel") {
    abrirPanelConfiguracion();
  } else if(fase === "restaurar") {
    const cfg=JSON.parse(p.getProperty(key));
    if(ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==="procesarColaConAntiTimeout_"))throw new Error("Ingesta sigue activa");
    ScriptApp.getProjectTriggers().filter(t=>["onEditControlMovilTrigger_","onEditControlMovilTrigger","procesarColaConAntiTimeout"].includes(t.getHandlerFunction())).forEach(t=>ScriptApp.deleteTrigger(t));
    h.getRange(cfg.inicio,1,5,TOTAL_COLUMNAS).clearContent();SpreadsheetApp.flush();
    Object.keys(cfg.previo).forEach(k=>{if(cfg.previo[k]===null)p.deleteProperty(k);else p.setProperty(k,cfg.previo[k])});
    const coinciden=Object.keys(cfg.previo).every(k=>p.getProperty(k)===cfg.previo[k]);
    p.deleteProperty(key);
    salida({restaurado:coinciden,ultimaFila:h.getLastRow(),sinRespaldoTemporal:p.getProperty(key)===null,activadores:ScriptApp.getProjectTriggers().length,version:VERSION_SCRIPT});
  }
}
