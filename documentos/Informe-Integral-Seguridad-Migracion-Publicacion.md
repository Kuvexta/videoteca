# Informe integral de correcciones, seguridad, migración y publicación

**Proyecto:** Proyecto Videoteca BD — Kuvexta.  
**Fecha:** 11 de septiembre de 2026.  
**Base de código:** `Codigo_2.gs` e `Index_2.html`, versión `v2026.6.24-VIDEOTECA-SEGURIDAD`.  
**Alcance:** revisión de archivos locales, inventario de etapa 2 y capturas aportadas de Apps Script.  
**Entrega:** instrucciones y código propuesto. No se modificaron los archivos de la aplicación, propiedades, activadores ni implementaciones.

## 1. Conclusión y decisiones recomendadas

La primera etapa corrigió fallos importantes, pero aún no constituye un cierre completo de seguridad. Deben cerrarse los lectores RAG, migrarse las funciones que se usan como activadores y sustituirse las credenciales expuestas. Después debe publicarse la versión corregida: modificar archivos locales o guardar el editor no actualiza por sí solo la versión que utiliza el portal.

Orden recomendado:

1. Preparar respaldo privado y una copia de prueba aislada.
2. Cerrar lectores RAG y la función de recordatorios.
3. Migrar nombres de funciones internas y activadores, incluyendo los temporales.
4. Probar las operaciones autorizadas y los rechazos sin efectos secundarios.
5. Realizar una ventana de mantenimiento: limitar el portal vulnerable y controlar trabajos automáticos en curso.
6. Sustituir credenciales y sesiones con un procedimiento validado.
7. Actualizar código de producción, activadores e implementación web de forma coordinada.
8. Verificar tanto resultados reales como ejecuciones automáticas posteriores.

El informe anterior sigue siendo útil para explicar R1–R5 y sus pruebas. Este documento actualiza el estado y añade el procedimiento operativo confirmado mediante las capturas. No se deben repetir a ciegas los parches que ya aparecen aplicados en la 6.24.

## 2. Evidencias y límites

### 2.1. Archivos presentes

| Archivo | Papel |
|---|---|
| `Codigo.gs` e `Index.html` | Copias locales anteriores, versión de servidor 6.23 |
| `Codigo_2.gs` e `Index_2.html` | Base actual revisada, versión de servidor 6.24 |
| `PENDIENTE_Disparadores_Etapa2.md` | Inventario estático de diez funciones y referencias; migración pendiente |
| `INFORME_CORRECCIONES_Y_RECOMENDACIONES.md` | Informe previo de correcciones |

Huellas SHA-256 de la base de esta revisión:

| Archivo | SHA-256 |
|---|---|
| `Codigo_2.gs` | `3A388A91CEA69BF2E786C01296CA1522C50F6CD27B5BE8B172D4522991B4FC3E` |
| `Index_2.html` | `0CD4D6F2E2DE7C6A97346C9ACBA46A62F86A1B4EB2832293EDBC48303B9198EC` |

No hay un `appsscript.json` local en la carpeta revisada. Su configuración se observó en la captura; debe exportarse o respaldarse desde el proyecto al preparar la migración.

### 2.2. Tres estados diferentes

| Estado | Evidencia | Consecuencia |
|---|---|---|
| Archivos locales | Servidor 6.24 en `Codigo_2.gs` | Son la propuesta local; no prueban qué código está en Google |
| Encabezado del proyecto | Los tres activadores muestran «Encabezado» | Trabajan sobre el código guardado del proyecto |
| Portal publicado | «Web Videoteca BD», Versión 1, 9 de septiembre de 2026, 11:04 p. m. | Utiliza esa versión publicada, no automáticamente los cambios posteriores |

No se descargó el contenido de la Versión 1. Su número y fecha no permiten identificar todas sus diferencias con los archivos locales. Fuente sobre versiones y despliegues: [gestión de implementaciones](https://developers.google.com/apps-script/concepts/deployments).

### 2.3. Configuración observada

- Zona horaria del proyecto: `America/Bogota`, GMT−05:00.
- Motor V8 habilitado; registro de excepciones habilitado.
- Servicios avanzados mostrados: Drive v3, Calendar v3, Docs v1, Slides v1 y YouTube v3.
- Implementación activa: se ejecuta como la cuenta publicadora y permite acceso a «Cualquiera».
- En la captura no aparecen implementaciones archivadas. Esto es evidencia de esa pantalla y momento, no una auditoría de todos los proyectos o cuentas.

Ejecutar como la cuenta publicadora implica que las operaciones usan su autoridad. Mantener acceso público exige que cada acción de datos tenga autorización propia. No cambiar a ejecución como visitante sin analizar compatibilidad: puede cambiar los permisos y romper el acceso al libro compartido. Fuente: [permisos de aplicaciones web](https://developers.google.com/apps-script/guides/web#permissions).

## 3. Correcciones verificadas en la primera etapa

| Tema | Estado local observado |
|---|---|
| Secretos y sesiones | Quince funciones cambiaron a nombres con `_` final; no quedaron llamadas con sus nombres antiguos en la comprobación realizada |
| Paneles administrativos | Comprueban contexto de hoja antes de marcar confianza |
| Publicación de JSON | `generarEnlacePublicoJSON` exige origen interno |
| Informes | La comprobación de estado está en el controlador y en el generador; rechaza intentos no entregados |
| Login compartido | Rechazado de forma explícita |
| Sesiones antiguas | Se comprueba `revisionAuth` |
| Asistente | POST valida token y la implementación tiene guarda |
| Respuestas de texto | «Dejar en blanco» vacía también el campo visible |

Ambos archivos pasaron sintaxis y las llamadas literales del cliente coincidieron con las 51 rutas del servidor. La revisión de esta versión incluyó 17 comprobaciones locales: verificaron correcciones y reprodujeron pendientes. No equivalen a una prueba completa en Google ni a confirmar las 612 comprobaciones mencionadas anteriormente, cuyos archivos no están disponibles aquí.

## 4. Corrección A — Cerrar todas las lecturas RAG

### Problema

Estas funciones son globales y no tienen guarda en la base revisada:

| Función | Línea de referencia | Qué devuelve |
|---|---:|---|
| `recuperarDocumentoRAG` | 5543 | JSON completo del archivo |
| `recuperarTextoPesado` | 5623 | Campo `contenido` |
| `recuperarSegmentosRAG` | 5636 | Segmentos de transcripción |
| `consultarTextoDesacopladoDeDrive` | 5647 | Envoltura del lector de texto |

Conocer un ID no debe autorizar una lectura. El riesgo está limitado por los archivos a los que la cuenta ejecutora tiene acceso y por los formatos que cada función procesa; no se afirma que estas funciones lean cualquier archivo de cualquier cuenta.

### Cambios concretos

1. Renombrar las cuatro funciones agregando `_` al final.
2. Actualizar sus llamadas internas, pruebas y referencias por nombre.
3. Añadir `exigirOrigenInterno(...)` como primera instrucción, antes de cualquier lectura de Drive y fuera del bloque que captura errores de lectura.
4. No dejar envolturas públicas con los nombres antiguos que simplemente llamen al nuevo nombre.
5. Revisar todas las rutas públicas que acepten IDs, especialmente GET `fetch_drive_id`: validar sesión y pertenencia del documento al catálogo permitido antes de llamar al lector.
6. Si hay restricciones por usuario o módulo, aplicarlas además de la pertenencia al catálogo. Un archivo existente en el catálogo no implica necesariamente que todos puedan leerlo.

Ejemplo de sustitución completa para el lector del JSON:

```javascript
function recuperarDocumentoRAG_(archivoId) {
  exigirOrigenInterno("recuperarDocumentoRAG_");
  const id = String(archivoId || "").trim();
  if (!id) return null;
  try {
    const archivo = DriveApp.getFileById(id);
    return JSON.parse(archivo.getBlob().getDataAsString());
  } catch (e) {
    logWarn("Drive RAG", "No se pudo recuperar el documento solicitado.");
    return null;
  }
}
```

Para los otros lectores, mantener sus tipos de retorno actuales (`""` o `[]`) para no romper llamadores. El sufijo privado cierra la llamada directa desde `google.script.run`; no elimina la necesidad de autorizar rutas públicas que los utilicen. Fuente: [funciones privadas en Apps Script](https://developers.google.com/apps-script/guides/html/communication#private_functions).

### Autorización del ID

En esta versión, la referencia RAG está en `IDX.DRIVE_RAG`. La implementación de una ruta debe seguir este orden:

1. Validar forma y token.
2. Resolver identidad en el servidor.
3. Buscar una fila del catálogo cuya referencia RAG coincida con el ID pedido.
4. Comprobar acceso del usuario a esa fila según la política del portal.
5. Rechazar si no existe una coincidencia autorizada; no hacer una lectura de Drive para «ver si existe».
6. Leer y devolver solo los campos necesarios. No publicar automáticamente el JSON completo porque contiene datos adicionales.

No se aporta un supuesto filtro universal de permisos porque esa política debe fijarse explícitamente. Si el catálogo completo es compartido por todos los usuarios autenticados, documentarlo y probarlo. Si no, reutilizar el filtro real del catálogo visible al usuario.

### Aceptación

- Llamada directa del navegador: inaccesible o rechazada, cero lecturas de Drive.
- Petición anónima por GET/POST: rechazada.
- Token válido e ID ajeno al catálogo permitido: rechazada sin leer Drive.
- Token válido e ID autorizado: contenido esperado, sin secretos ni campos internos innecesarios.
- Documento inexistente o malformado: error controlado, sin exponer detalles internos de Drive.

## 5. Corrección B — Resolver la función de recordatorios omitida

`agendarRecordatoriosDeModulosVencidos`, en torno a la línea 17992, se marca confiable y crea eventos sin autenticar al llamador. No aparece entre las diez funciones del inventario de etapa 2 ni entre los tres activadores de la captura.

No tener un activador visible no hace inocua la función: sigue siendo una entrada global. Añadirla al inventario con estado «sin activador observado; confirmar otros propietarios o uso manual».

**Recomendación para este proyecto:** hacer privada su implementación y no instalar un nuevo activador para ella, salvo que exista una necesidad funcional confirmada. Eso cierra la exposición sin introducir envíos nuevos.

Si se necesita desde la hoja, añadir una entrada de menú que compruebe `exigirContextoHoja_` antes de ejecutar la implementación privada. Si se necesita automática, registrar el horario deseado y migrarla como cualquier manejador instalable. No confiar en un parámetro del cliente que diga que la llamada proviene de un activador.

Evitar recordatorios duplicados: antes de programarla recurrentemente, añadir deduplicación por módulo, persona y fecha de cierre. Actualmente repetir la función puede crear nuevos eventos para el mismo cierre.

## 6. Corrección C — Migrar los activadores

### 6.1. Configuración confirmada para la cuenta mostrada

| Función actual | Nombre propuesto | Programación observada |
|---|---|---|
| `actualizarDashboardPeriodico` | `actualizarDashboardPeriodico_` | Cada 1 hora |
| `ejecutarMantenimientoSemanal` | `ejecutarMantenimientoSemanal_` | Domingos, entre 03:00 y 04:00, GMT−05:00 |
| `crearBackupAutomatico` | `crearBackupAutomatico_` | Domingos, entre 23:00 y 00:00, GMT−05:00 |

Los tres muestran «Encabezado», propietario «Yo» y notificación de fallos una vez por día. Conservar esas preferencias. El intervalo horario no garantiza un minuto exacto; una recreación puede cambiar el minuto efectivo dentro del intervalo. Un activador horario tampoco debe prometer conservar el minuto :44 que se observa en las ejecuciones anteriores.

La lista corresponde a la cuenta que abrió Apps Script. Los activadores creados por otras cuentas no necesariamente son visibles desde esa cuenta; confirmar si existen otros administradores. Fuente: [restricciones y horarios de activadores instalables](https://developers.google.com/apps-script/guides/triggers/installable).

### 6.2. Activadores temporales y otros manejadores

Además de los tres visibles, actualizar las referencias de estas funciones ya presentes en el inventario:

- `exportarCatalogoAJsonSilencioso`.
- `disparadorNocturnoFase2`.
- `onEditControlMovilTrigger`.
- `procesarColaTareasSilencioso`.
- `procesarColaConAntiTimeout`.
- `continuarEmbeddingsCatalogo`.
- `registrarRespuestaFormularioCentralizado`.

No instalar todos estos activadores por el hecho de existir en el código. Actualizar su código creador para que, cuando sean necesarios, use el nombre privado correcto.

La captura de ejecuciones demuestra que `procesarColaConAntiTimeout` se ejecutó como tarea basada en el tiempo el 10 de septiembre. Debe incluirse aunque hoy no aparezca en la lista. `continuarEmbeddingsCatalogo` también tiene creación temporal por código; es un caso a probar, no un activador instalado confirmado por la captura.

### 6.3. Lugares que deben cambiar junto al nombre

- Declaración y llamadas directas de la función.
- Cadenas de `ScriptApp.newTrigger(...)`.
- Comparaciones con `getHandlerFunction()` y limpieza por nombre.
- Tablas de estado, menús, listas de acciones y control móvil.
- Código que reprograma una continuación después de agotar el presupuesto de ejecución.
- Pruebas y documentación.

Conservar `onOpen` como nombre reservado del disparador simple y revisar sus efectos. No cambiarlo indiscriminadamente a `onOpen_`.

### 6.4. Inventario de solo lectura antes de migrar

Este auxiliar es opcional. Se ejecuta en el editor del proyecto con la cuenta administradora. No crea, borra ni modifica activadores y no imprime propiedades ni credenciales.

```javascript
function inventariarActivadoresMigracion_() {
  const filas = ScriptApp.getProjectTriggers().map(function (trg) {
    let recurso = "";
    try { recurso = trg.getTriggerSourceId() || ""; } catch (e) {}
    return {
      id: trg.getUniqueId(),
      funcion: trg.getHandlerFunction(),
      evento: String(trg.getEventType()),
      origen: String(trg.getTriggerSource()),
      recurso: recurso
    };
  });
  console.log(JSON.stringify(filas, null, 2));
  return filas;
}
```

Este inventario no recupera todas las preferencias de la pantalla, como horarios detallados y notificaciones. Las capturas son la referencia para esos valores. Tampoco identifica por sí solo los activadores de otras cuentas.

### 6.5. Procedimiento manual recomendado

1. Preparar y probar la versión con los nombres nuevos en una copia.
2. Registrar la lista real justo antes del cambio: pueden aparecer activadores temporales después de la captura.
3. Elegir una ventana de mantenimiento y comprobar que no hay trabajos largos en ejecución.
4. Controlar que no queden simultáneamente activos dos activadores para una misma tarea durante la sustitución.
5. Guardar el código corregido del proyecto de producción y actualizar inmediatamente los activadores afectados dentro de esa ventana.
6. En la edición de cada activador, seleccionar la función nueva si la interfaz la ofrece, conservar evento, horario y avisos, y guardar. Si no puede hacerse desde esa pantalla, recrear el activador con los mismos parámetros. Verificar después la lista efectiva; no asumir que editar el código cambió la referencia guardada.
7. Si el nombre privado no aparece en el selector, usar un instalador privado probado desde el editor o un menú autorizado; no crear un alias público para hacerlo aparecer.
8. Revisar que estén los tres nombres nuevos y que no haya referencias antiguas o duplicados.
9. Probar cada trabajo y luego observar su ejecución automática real.

No borrar indiscriminadamente todos los activadores del proyecto. No reinstalar tareas que no estaban activas. La programación desde código puede ayudar, pero debe manejar duplicados y fallos parciales y revisar manualmente las preferencias de notificación.

### 6.6. Expresiones de programación para un instalador controlado

Estos tres fragmentos crean activadores y NO deben ejecutarse mientras los equivalentes antiguos sigan activos. Son piezas para integrar en una función privada de instalación con comprobación previa de duplicados. Primero comprobar que las tres funciones privadas ya existen. No constituyen por sí solos un migrador seguro.

```javascript
ScriptApp.newTrigger("actualizarDashboardPeriodico_")
  .timeBased().everyHours(1).inTimezone("America/Bogota").create();
```

```javascript
ScriptApp.newTrigger("ejecutarMantenimientoSemanal_")
  .timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.SUNDAY)
  .atHour(3).inTimezone("America/Bogota").create();
```

```javascript
ScriptApp.newTrigger("crearBackupAutomatico_")
  .timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.SUNDAY)
  .atHour(23).inTimezone("America/Bogota").create();
```

Si una instalación parcial falla, detenerse, inventariar lo que efectivamente quedó creado y completar solo lo faltante. No reejecutar ciegamente los tres fragmentos.

Referencia de los métodos de programación utilizados: [ClockTriggerBuilder](https://developers.google.com/apps-script/reference/script/clock-trigger-builder).

## 7. Corrección D — Sustituir credenciales expuestas

### 7.1. Qué se observó y qué no

Las capturas muestran un token administrativo y la propiedad `MASTER_SECRET_HMAC`, además de propiedades de integraciones. Sus valores no se reproducen en este informe. Algunas cadenas se ven cortadas por el ancho de los campos; no se afirma haber recuperado todos sus valores completos.

Como medida operativa, tratar como expuestos los secretos que se mostraron completos y evaluar el alcance de los demás. Esto no demuestra acceso de un tercero ni uso malicioso. No compartir capturas adicionales de valores, ni incluirlos en pruebas, comentarios o archivos de la carpeta sincronizada.

### 7.2. El formato v2 no cifra el contenido

En `Codigo_2.gs:2640`, `cifrar_` construye una firma HMAC y concatena el texto codificado en Base64. La firma permite detectar alteraciones; Base64 permite recuperar el texto sin una clave. Por tanto, el nombre `cifrar_` y algunos comentarios sobre cifrado son engañosos respecto de la confidencialidad.

Correcciones recomendadas:

- Documentar el formato como «sellado con HMAC», no como cifrado.
- No crear un cifrado artesanal para corregirlo.
- Mantener cerrado el acceso a propiedades y reducir editores autorizados.
- Evaluar un almacén de secretos con permisos y auditoría separados si el nivel de seguridad del proyecto lo requiere. Esto es una mejora de arquitectura, no una migración incluida automáticamente en esta entrega.

Las propiedades de script son datos compartidos dentro del proyecto; no son una separación de secretos frente a quienes pueden editar su código. Fuente: [servicio de propiedades](https://developers.google.com/apps-script/guides/properties).

### 7.3. Token administrativo: no cambiar solo el atajo

`ADMIN_TOKEN` es un atajo; `API_TOKENS_MAP` contiene los registros autorizados. Si se sustituye únicamente `ADMIN_TOKEN`, el token anterior puede seguir siendo válido en el mapa. Si se borra el mapa completo, pueden perderse accesos válidos de otras personas.

Procedimiento:

1. Confirmar quién utiliza el token antiguo: administrador, agentes e integraciones.
2. Crear un token nuevo con scope y correo correctos, mediante una herramienta administrativa protegida.
3. Actualizar las integraciones autorizadas por un canal seguro.
4. Actualizar coherentemente el mapa y el atajo administrativo; conservar el resto de registros.
5. Revocar el token antiguo del mapa y revisar cualquier registro de invitación vinculado que corresponda.
6. Confirmar que el nuevo permite las acciones requeridas y que el anterior se rechaza por todas las rutas.
7. No imprimir ninguno de los dos en registros ni guardarlos en el informe.

No considerar segura una migración que genera un nuevo token pero deja indefinidamente vigente el antiguo.

### 7.4. Clave HMAC y credenciales de proveedores

Cambiar `MASTER_SECRET_HMAC` de forma aislada invalida las firmas actuales. La aplicación puede dejar de reconocer sus claves aunque los valores permanezcan guardados.

Preparar la sustitución así:

1. Limitar el acceso del portal vulnerable y detener las tareas que lean o escriban credenciales durante la ventana.
2. Preparar recuperación en un medio privado y de acceso restringido. Evitar exportar todas las propiedades a la carpeta compartida o sincronizada de trabajo.
3. Inventariar las propiedades con secretos y su proveedor, sin listar valores. Buscar todos los llamadores de `cifrar_`, `descifrar_`, `guardarApiKey_` y `obtenerApiKey_`.
4. Determinar cuáles requieren renovación en el proveedor. Para OAuth, identificar tokens de acceso, tokens de actualización y autorizaciones que deban revocarse o renovarse; no basta con cambiar una propiedad local si el proveedor sigue aceptando el secreto antiguo.
5. Preparar la nueva clave HMAC y los nuevos valores sellados en memoria. Validar los existentes con la clave anterior y los nuevos con la nueva, sin publicar valores.
6. Aplicar la nueva clave y sus valores dependientes de forma coordinada. No asumir que varias escrituras de propiedades constituyen una transacción: diseñar recuperación ante fallo parcial y mantener la ventana de mantenimiento.
7. Limpiar únicamente las cachés de credenciales afectadas. Para TikTok, revisar también su token de acceso cacheado y la rotación del refresh token.
8. Probar cada integración con una operación inocua y confirmar que ningún secreto aparece en errores o registros.
9. Retirar las credenciales antiguas en el proveedor según la política de transición y eliminar los respaldos temporales cuando deje de ser necesario conservarlos.

No se incluye un script que sobrescriba automáticamente todos los secretos: no se dispone del inventario completo de propiedades ni de las credenciales nuevas. Un migrador debe revisarse y probarse específicamente para esos formatos y proveedores.

### 7.5. Sesiones

La 6.24 ya contiene `revisionAuth`. Cambiar `AUTH_REVISION` a un valor nuevo, no vacío, al efectuar el cierre. Las sesiones con revisión antigua deben ser rechazadas; las claves personales legítimas podrán canjearse nuevamente.

No reutilizar un valor histórico de revisión. Confirmar que no queden implementaciones antiguas expuestas que ignoren ese control. Cambiar la propiedad no agrega una comprobación a versiones de código que no la contienen.

## 8. Corrección E — Actualizar la implementación web

### Estado confirmado

La implementación activa «Web Videoteca BD» apunta a la Versión 1 del 9 de septiembre. Permite acceso a cualquiera y ejecuta como la cuenta publicadora. La fecha es anterior a las capturas de cambios recientes del editor.

### Procedimiento

1. Preparar los archivos definitivos desde la base 6.24, incorporando las correcciones adicionales.
2. En el proyecto, sustituir el contenido del archivo de servidor existente y de `Index.html`. No añadir junto a ellos `Codigo_2.gs` con las mismas declaraciones.
3. Conservar la plantilla llamada `Index`: el servidor utiliza `createTemplateFromFile("Index")`.
4. Conservar o revisar conscientemente `appsscript.json`: zona horaria, V8 y servicios avanzados. No reemplazarlo por un manifiesto incompleto.
5. Guardar y verificar el código del proyecto. Coordinar este paso con los activadores que usan Encabezado.
6. Probar una implementación de desarrollo o una copia. Esa prueba no demuestra por sí sola el comportamiento de un visitante anónimo en la URL pública.
7. Ir a **Implementar → Administrar implementaciones → Web Videoteca BD → lápiz → Versión → Nueva versión**.
8. Escribir una descripción de cambios sin secretos y actualizar esa implementación para conservar su URL.
9. Verificar la URL publicada con alumno y administrador, y con una ventana sin sesión para comprobar los rechazos.
10. Confirmar visualmente que la implementación ya no apunta a la Versión 1 anterior. Registrar la nueva versión.

Fuente: [implementaciones versionadas](https://developers.google.com/apps-script/concepts/deployments).

Para la ventana de mantenimiento, valorar limitar temporalmente el acceso a la cuenta publicadora o retirar la implementación vulnerable, según las opciones disponibles. No cambiar a «ejecutar como visitante» como sustituto improvisado de las correcciones de código. Si se mantiene acceso público, confirmar expresamente que es una necesidad del portal y que el control de acceso propio pasa las pruebas.

## 9. Incidencia de duración observada en la cola

La captura muestra `procesarColaConAntiTimeout` con una duración de 360,865 segundos y estado «En tiempo de espera». Es una evidencia de ejecución que no terminó dentro del tiempo disponible. No permite determinar por sí sola en qué línea ocurrió ni si se guardó el último checkpoint.

Acciones:

1. Abrir esa ejecución y leer el registro y error detallados; ocultar valores sensibles antes de compartirlos.
2. Verificar el último checkpoint y las filas realmente procesadas antes de relanzar.
3. Dar a la cola un presupuesto propio inferior al límite, incluyendo margen para guardar estado y reprogramar.
4. Comprobar el tiempo antes de cada bloque costoso, no solo al terminarlo.
5. Actualizar el nombre de su activador temporal al nombre privado durante la migración.
6. Probar la continuación y verificar que no duplica trabajo, cargos de IA ni activadores.

Como punto de partida de diseño, reservar aproximadamente 90 segundos para cierre cuando el presupuesto disponible sea de seis minutos; ajustar según mediciones reales de llamadas externas. Una llamada externa bloqueada puede consumir el margen completo: el simple cambio de nombre no resuelve el problema de duración.

No relanzar automáticamente toda la ingesta a partir de esta captura. Primero confirmar qué quedó persistido.

## 10. Pruebas obligatorias antes de cerrar

| Área | Caso rechazado | Caso permitido y resultado verificable |
|---|---|---|
| Paneles | Navegador sin contexto autorizado | Menú de hoja autorizado ejecuta la acción |
| Secretos | Llamada directa a nombres antiguos y nuevos privados | Uso interno autorizado funciona sin filtraciones |
| RAG | Sin token o ID no autorizado, cero lecturas de Drive | Documento autorizado devuelve solo los campos necesarios |
| Login | Contraseña compartida no emite sesión | Clave personal válida obtiene identidad del servidor |
| Sesiones | Revisión antigua o token vencido | Revisión vigente y token válido funcionan |
| Informes | Intento en curso, vencido o anulado; informe ajeno | Dueño de intento entregado; administrador según política |
| PDF | Rechazo antes de crear archivos | PDF de intento entregado correcto |
| Respuestas | Borrar texto y perder foco no lo restaura | Guardar, recargar, reanudar y entregar conservan estado |
| Activadores | No quedan nombres antiguos ni duplicados | Tres trabajos recurrentes y continuaciones necesarias funcionan |
| Credenciales | Token revocado falla en todas las entradas | Credenciales nuevas pasan pruebas inocuas de integración |
| Publicación | No quedan rutas vulnerables por versiones antiguas accesibles | URL usada por usuarios apunta a la nueva versión |

Ejecutar primero con servicios simulados y después en la copia de Apps Script. Para rechazos, comprobar que no se leyó ni escribió información sensible antes del error. Para accesos permitidos, comprobar resultados concretos, no solo «no lanzó excepción».

Una prueba manual que ejecuta directamente un manejador no prueba que su activador quedó bien instalado: hace falta observar al menos una ejecución automática. Para semanales, validar antes en una copia con un activador de prueba y confirmar posteriormente la ejecución semanal de producción; retirar los activadores de prueba.

## 11. Qué es automático y qué requiere intervención

| Trabajo | Preparación local posible | Requiere acceso autorizado a Google |
|---|---|---|
| Revisar y editar código | Sí | Publicarlo y comprobar su entorno |
| Actualizar nombres y referencias | Sí | Migrar activadores ya instalados |
| Probar sintaxis y lógica simulada | Sí | Probar permisos, recursos y eventos reales |
| Inventariar nombres en archivos | Sí | Confirmar activadores de cada cuenta |
| Preparar migración de secretos | Diseño y pruebas ficticias | Renovar credenciales reales y almacenarlas |
| Configurar despliegue | Preparar instrucciones | Guardar cambios, autorizar y actualizar versión |

No es obligatorio hacer cada operación una por una: un instalador controlado puede reducir trabajo. Sí es obligatorio verificar la configuración real y los resultados. En esta revisión no se dispone de control autenticado del proyecto ni se ha ejecutado la migración remota.

## 12. Recuperación ante fallos

- Conservar una copia verificable del código y el libro antes de cambiar producción.
- Si falla un activador nuevo, no dejar también el antiguo ejecutándose sin control: revisar la lista y conservar una sola programación deliberada.
- Si falla una integración, revisar la coherencia entre clave maestra, secretos sellados, caché y proveedor. No sobrescribir propiedades al azar.
- Si falla la publicación, mantener acceso restringido mientras se repara. Volver a publicar la versión vulnerable no es una recuperación segura por defecto.
- Una reversión de código puede ser incompatible con las credenciales migradas. Probar el procedimiento de recuperación de datos y secretos por separado.
- No recuperar un token expuesto como credencial permanente por comodidad.

## 13. Lista de cierre para el responsable

- [ ] Base definitiva identificada y respaldada; solo un servidor y una plantilla `Index` en el proyecto.
- [ ] Cuatro lectores RAG privados, sin alias públicos inseguros, y rutas autorizan recursos.
- [ ] Función de recordatorios resuelta y añadida al inventario.
- [ ] Diez manejadores del inventario y sus referencias revisados; temporales incluidos.
- [ ] Tres activadores observados conservan sus intervalos y avisos, con nombres nuevos y sin duplicados.
- [ ] Propietarios adicionales consultados si existen.
- [ ] Token administrativo anterior revocado en el mapa y sus consumidores actualizados.
- [ ] Secretos expuestos tratados y nueva firma HMAC aplicada de manera coherente.
- [ ] Sesiones anteriores invalidadas; credenciales personales legítimas funcionan.
- [ ] Cola con ejecución agotada revisada antes de reintentar.
- [ ] Pruebas de rechazo y de funcionamiento completadas en la copia.
- [ ] Nueva versión publicada en «Web Videoteca BD» y URL comprobada.
- [ ] Activadores automáticos observados después del cambio; semanales pendientes de seguimiento hasta su ejecución.
- [ ] No se archivaron ni registraron valores secretos en el informe, código o capturas compartidas.

## 14. Limitaciones y uso de este documento

Este informe no certifica ausencia de otros fallos. Consolida los hallazgos revisados y las evidencias disponibles. La cuenta ejecutora, los permisos de Drive, los disparadores de otras cuentas, los registros completos y la versión publicada no se inspeccionaron mediante acceso autenticado directo.

Los fragmentos de JavaScript son propuestas para integrar en sus lugares indicados. El ejemplo de inventario es de lectura; los tres fragmentos de activadores producen cambios si se ejecutan. Ninguno se ejecutó contra Google al preparar el documento.

El informe evita incluir una migración destructiva de credenciales o una eliminación masiva de activadores. Esas operaciones requieren inventario y pruebas específicos. La prioridad inmediata es preparar la versión corregida y una ventana de mantenimiento coordinada, no cambiar propiedades o activadores de forma aislada.

Validación de esta entrega: los cinco bloques de JavaScript pasan sintaxis. Se comprobaron con simulaciones el rechazo previo a leer Drive, una lectura interna permitida y el inventario de un activador horario. Los fragmentos de creación de activadores no se ejecutaron. Las huellas de los archivos de la aplicación permanecieron iguales después de preparar el informe.
