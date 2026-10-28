# Videoteca — Manual de instalación e instructivo

**Versión: 01.00.00 · 2026-10-28**

Videoteca es un portal de capacitación por video sobre **Google Sheets + Apps Script** (sin servidores propios). Los datos de participantes viven **solo en la hoja de Google Sheets** del propietario; el código se despliega a mano en el editor de Apps Script.

---

## 1. Requisitos

- Una cuenta de Google controlada por el responsable del proyecto (úsala sola en un perfil de navegador dedicado).
- Una carpeta privada de Drive para la instalación.
- Un libro vacío de Google Sheets (nombres que indiquen que es de ensayo para la primera instalación).
- Navegador con acceso a `script.google.com` y a `drive.google.com`.

## 2. Instalación desde cero

### Paso 1 — Propietario y separación de ensayos
Usa una sola cuenta de Google para instalar y administrar. Crea la carpeta privada de Drive y el libro vacío de Sheets. Mantén el libro restringido: los participantes entran al portal, **no** reciben permiso de edición del libro. Si necesitas separar empleados y familia por privacidad, crea dos instalaciones independientes.

Prepara tres identidades de prueba: **administrador**, **supervisor** y **participante** (y una cuarta cuenta para comprobar que un participante no ve resultados de otro).

### Paso 2 — Instalar los dos archivos
1. Abre el libro nuevo → **Extensiones → Apps Script** (queda vinculado al libro).
2. En el archivo `Código` del editor, sustituye el contenido completo por `codigo/Codigo.gs` (no lo pegues dentro de otra función).
3. Añade un archivo de tipo **HTML** llamado `Index` y pega `codigo/Index.html` completo.
4. Guarda. Debe haber una sola copia de las funciones principales (no conserves versiones antiguas en otros archivos del proyecto).
5. En **Configuración del proyecto**: motor **V8** y zona horaria **America/Bogota**. Ajusta también la zona horaria y configuración regional del libro.
6. Si usas el manifiesto base suministrado, hazlo **solo** en este proyecto nuevo (es plantilla, no copia de permisos de producción).

### Paso 3 — Servicios de Google
En **Servicios** del editor añade **YouTube Data API v3** (para funciones del servicio avanzado YouTube). DriveApp, SpreadsheetApp, DocumentApp, SlidesApp, FormApp y CalendarApp son servicios integrados: no necesitan clave de API, piden autorización al ejecutarse. No actives servicios externos ni credenciales de Cloud solo porque aparecen en el manual.

### Paso 4 — Autorizar e inicializar
1. Desde el editor ejecuta `onOpen`; recarga el libro para ver el menú **Videoteca Certificable**.
2. En **Configuración** establece la carpeta raíz privada (usa el **ID** de la URL de Drive, no el nombre).
3. Ejecuta `inicializarSistemaCompleto` y atiende la confirmación en la hoja. Crea o repara hojas, carpetas y la clave administrativa.
4. Autoriza el proyecto cuando Google lo pida, revisando cuenta y permisos.
5. Guarda la **clave administrativa en un gestor de contraseñas** (no la copies al catálogo ni al HTML).
6. Comprueba que existen el catálogo, las hojas auxiliares y las subcarpetas `Textos_RAG`, `Certificados`, `Backups`, `Documentos_Modulo`, `Informes_Auditoria`.

> ⚠️ No confundas inicializar con **«Reconstruir el libro desde cero»** (borra y reconstruye hojas). No la uses sobre una copia con resultados. Tampoco reinicialices producción para recuperar una clave perdida: usa el procedimiento de accesos.

### Paso 5 — Configuración básica
En Configuración: **IA desactivada** para la primera carga, idioma y zona horaria correctos. Credenciales de proveedores vacías hasta necesitarlas. Usa una URL HTTPS real en la columna de enlaces o «Insertar una fila de ejemplo». Ejecuta **Ingesta rápida masiva, fase 1 sin IA** y observa título, ID, fuente y estado (un dato vacío no siempre es un error).

### Paso 6 — Publicar el portal
Apps Script → **Implementar → Nueva implementación → Aplicación web**. Ejecuta como **el propietario**. Copia la URL terminada en `/exec` (la de biblioteca, la del editor o la `/dev` no sirven). Prueba la pantalla de acceso en otra sesión del navegador. No hagas público el libro de Sheets para abrir el portal.

Para cambios posteriores: **Administrar implementaciones → editar → nueva versión → implementar**, conservando el mismo despliegue.

### Paso 7 — Accesos y permisos
Desde Configuración, gestión de tokens (`administrarTokensUI`): genera un token por persona con nombre completo, correo, **alcance** (`admin`, `supervisor` o `exam`) y días de vigencia (p. ej. 30 días para un piloto). Copia la clave al mostrarse (después solo se ve un prefijo). Registra identidad, alcance y vencimiento sin publicar el secreto. Prueba cada perfil en sesiones separadas.

### Paso 8 — Primer módulo
Crea el módulo (ID estable, título, rol, número de preguntas, umbral), selecciona filas de videos y usa **Asignar videos al módulo**. Revisa el banco antes de habilitar evaluación.

### Paso 9 — Tareas necesarias
Activa solo las tres tareas del ensayo: **dashboard cada hora**, **mantenimiento domingo 03:00–04:00** y **respaldo domingo 23:00–00:00** (zona Bogotá; son ventanas, no segundos exactos). No actives todavía proceso nocturno de IA, cola automática ni formularios.

### Paso 10 — Respaldo y prueba de aceptación
Conserva libro, servidor, HTML, configuración y recursos vinculados. Prueba recuperación en una copia separada. Genera respaldo antes de invitar participantes. Completa la lista de aceptación (capítulo 15 del manual completo en `entregas/R7/manuales/`).

## 3. Actualizar una instalación existente y volver atrás

Ver capítulos 23–24 del manual completo (`entregas/R7/manuales/Manual_completo.md`): reglas de actualización, conservación del mismo despliegue y correcciones de concurrencia/guardado incorporadas.

## 4. Reglas de datos y privacidad

- Los **datos de participantes viven SOLO en la hoja de Google Sheets (Drive)** — nunca en un repositorio.
- Certificados, tiempos e informes exigen carpetas privadas de Drive.
- Las claves de acceso son secretos: gestor de contraseñas, nunca en código ni en el catálogo.

## 5. Versiones

Este proyecto usa versionado `MM.mm.pp` (ver `docs/VERSIONADO.md`). Versión actual: **01.00.00**.
