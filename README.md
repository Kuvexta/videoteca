# Videoteca

**Portal de capacitación por video sobre Google Sheets + Apps Script** — sin servidores propios.

- **Versión:** 01.00.00 (ver `CHANGELOG.md` y `docs/VERSIONADO.md`)
- **Estado:** pública para la comunidad — primera versión
- **Despliegue:** manual en el editor de Apps Script (sin clasp)

## Qué es

Videoteca permite cargar catálogos de videos por enlace, organizarlos en módulos de capacitación, generar evaluaciones y certificados, y administrar accesos por rol (admin / supervisor / participante). Los datos de participantes viven **solo en la hoja de Google Sheets del propietario**.

## Instalación

Sigue **`MANUAL_INSTALACION.md`** (10 pasos, desde cero hasta respaldo y aceptación). Resumen:
1. Cuenta de Google dedicada + carpeta privada de Drive + libro de Sheets vacío.
2. Pega `codigo/Codigo.gs` en el archivo Código y `codigo/Index.html` en un HTML llamado `Index`.
3. Habilita YouTube Data API v3; V8 y zona horaria America/Bogota.
4. Ejecuta `onOpen`, configura la carpeta raíz y ejecuta `inicializarSistemaCompleto`.
5. Publica como Aplicación web (ejecutada como el propietario) y usa la URL `/exec`.

## Estructura

| Carpeta | Contenido |
|---|---|
| `codigo/` | Pareja vigente: `Codigo.gs` (Código 24) + `Index.html` (Index 9) |
| `documentos/` | Pendientes, revisiones, validaciones, informes, términos de privacidad |
| `entregas/` | R1 · R5 · R6 · R7 (manuales completos, actas de cierre, cambios) |
| `paquetes/` | Zips de entrega con sus SHA-256 |
| `historico/instantaneas_codigo/` | Instantáneas acumulativas previas (C01–C23, I01–I08) — histórico, no usar |
| `instalacion/` | Instalaciones de producción, respaldos, inventarios |
| `pruebas/` | Arnés local (321 pruebas simuladas) y verificadores |
| `recursos/` | Iconos, instrucciones del módulo IA, scripts auxiliares |
| `sitio-legal/` | Sitio web legal del proyecto |

## Versionado

`MM.mm.pp` — Mayor.menor.parche, sin año en el número (la fecha vive en el changelog y en los tags). Detalle en `docs/VERSIONADO.md`.

## Datos y privacidad

- Los **datos de participantes viven SOLO en la hoja de Google Sheets (Drive)** — nunca en este repositorio.
- Certificados, tiempos e informes exigen carpetas privadas de Drive.
- Las claves de acceso son secretos (gestor de contraseñas), nunca en código.

## Licencia

**MIT** © 2026 Kuvexta — ver `LICENSE`. Uso libre para la comunidad.
