# Revisión de recursos externos — 13/09/2026

Revisión de solo lectura del código Codigo_18_Supervision.gs y de la configuración de Apps Script bajo Andrés.

## Comprobado

- CARPETA_RAIZ_ID apunta a BD-VIDEOTECA: https://drive.google.com/drive/u/0/folders/1no72ui8AocYPMvTcIay5fw_CW8l3uEPG . Drive muestra la carpeta vacía, sin filtros aplicados, y Privado para ti.
- No existe la propiedad CERTIFICADO_TEMPLATE_ID en la configuración actual. generarCertificadoAprobado retorna sin crear certificado cuando falta esa plantilla.
- La función generarCertificadoAprobado (línea 15766) contiene setSharing ANYONE_WITH_LINK/VIEW para el PDF. Incluye nombre y nota, por lo que ese comportamiento futuro contradice el aislamiento por participante. Debe corregirse antes de habilitar certificados. No se ejecutó ni se habilitó esa función.
- generarEnlacePublicoJSON (línea 21371) publica explícitamente el catálogo JSON. Es otra operación distinta, no una publicación de notas identificada en esta revisión.

## Límites y pendientes

La carpeta vacía no demuestra que no existan documentos antiguos en otras ubicaciones, ni cubre los enlaces externos de todas las filas del catálogo. No se modificaron permisos, archivos ni producción en esta revisión.

La prueba real de supervisor y su respaldo están cerrados en ROL_SUPERVISOR_IMPLEMENTACION.md. Para completar una prueba real como participante falta identificar una cuenta de prueba autorizada, sin adjudicarle el correo de Alberto que ya tiene supervisor. Las pruebas anteriores con dos participantes fueron locales y ficticias; no equivalen al recorrido real de formación y evaluación.
