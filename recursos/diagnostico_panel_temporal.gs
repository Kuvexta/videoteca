
// Diagnóstico temporal: solo lecturas; retirar al finalizar.
function diagnosticarContextoPanelTemporal() {
  exigirContextoHoja_("diagnosticarContextoPanelTemporal");
  const proyecto = ScriptApp.getScriptId();
  if (proyecto !== "1pv0v0_r60zn8rLc614fewTK6qS7BPYgNpr0d5LMvSmIAU_fC4YUEN4tZ") throw new Error("Proyecto inesperado");
  const leer = f => { try { return {ok:true, valor:f()}; } catch(e) { return {ok:false, error:String(e.message || e)}; } };
  const r = {
    fecha: new Date().toISOString(), proyecto: proyecto,
    usuarioActivo: leer(() => Session.getActiveUser().getEmail()),
    usuarioEfectivo: leer(() => Session.getEffectiveUser().getEmail()),
    libro: leer(() => { const s=SpreadsheetApp.getActiveSpreadsheet(); return s?s.getId():null; }),
    activadores: leer(() => ScriptApp.getProjectTriggers().map(t => t.getHandlerFunction())),
    obtenerUi: leer(() => !!SpreadsheetApp.getUi())
  };
  r.alerta = leer(() => { const ui=SpreadsheetApp.getUi(); ui.alert("Diagnóstico de panel", "Prueba de diálogo: cierre este aviso para ver el resultado en el panel.", ui.ButtonSet.OK); return "dialogo cerrado"; });
  return r;
}
