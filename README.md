# Videoteca — Portal de capacitación por video (Google Sheets + Apps Script)

Proyecto aparte de KUVEXTA. Consolidado por R8 el 27/10/2026.

## Mapa
- `codigo/` → **pareja vigente**: `Codigo.gs` (Código 24) + `Index.html` (Index 9). Se despliega **manualmente** en el editor de Apps Script (sin clasp; checklist en `../entregas/R7/manuales/Manual_completo.md` cap. 4).
- `entregas/` → R1 · R5 · R6 · R7 (manuales, actas de cierre, cambios).
- `paquetes/` → zips de entrega + sus sha256.
- `historico/instantaneas_codigo/` → las 30 instantáneas acumulativas previas (C01-C23, I01-I08) (historial, NO usar).
- `historico/trabajo_manual_piloto/` → área de trabajo del piloto (archivada tras R7).
- `pruebas/` → arnés local (321 pruebas simuladas) + verificadores .cjs.
- `documentos/` → pendientes, revisiones, validaciones, informes, términos de privacidad.
- `instalacion/` → instalaciones de producción, respaldos, inventarios.
- `sitio-legal/` → sitio web legal del proyecto.
- `recursos/` → iconos, instrucciones del módulo IA, scripts auxiliares.
- `backups/` → serie semanal de respaldo de la hoja (unificada).

## Reglas
- Los **datos de participantes viven SOLO en la hoja de Google Sheets (Drive)** — nunca en un repositorio.
- Política de privacidad: certificados, tiempos e informes exigen carpetas privadas de Drive.
- `%SystemDrive%` (artefacto de bug) quedó en `PARA_ELIMINAR_20261027\_CUARENTENA_KUVEXTA_20261027\`.

## Pendiente de decisión
- Repositorio git para el historial de versiones (se propuso; falta la ruta del repo KUVEXTA).
- Cáscaras vacías tras la consolidación: `Base de Conocimiento/` y `BD-VIDEOTECA/` (decisión de Andrés).
