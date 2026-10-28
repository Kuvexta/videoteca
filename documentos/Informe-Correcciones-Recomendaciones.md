# Informe de correcciones y recomendaciones

**Proyecto:** Videoteca Certificable — Kuvexta.  
**Fecha:** 11 de septiembre de 2026.  
**Versión revisada:** `v2026.6.23-VIDEOTECA-SEGURIDAD`.  
**Archivos analizados:** `Codigo.gs` e `Index.html` de esta carpeta.  
**Naturaleza de esta entrega:** propuesta técnica de cambios; no se han aplicado a los archivos de la aplicación.

Huellas SHA-256 de los originales, para identificar exactamente la base de la revisión:

| Archivo | SHA-256 |
|---|---|
| `Codigo.gs` | `A60B283E8E5536335CE15871D033E8217E0E73E7038B996284995372C84185E1` |
| `Index.html` | `15F7C8DD798C20B355B44873C7FFDBAB752230818F6C666F94855C963EC9836C` |

## 1. Dictamen y alcance

La actualización corrigió las llamadas directas a las funciones de emisión de sesiones y lectura de secretos identificadas en la revisión anterior. También corrigió la caducidad de tokens permanentes, restringió `audit_exam`, limitó el login compartido a `exam` y añadió controles de estado y vigencia a la entrega de exámenes.

Sin embargo, todavía existen caminos alternativos que permiten ejecutar acciones administrativas y consultar respuestas correctas antes de entregar un examen. La recomendación es cerrar esos caminos antes de considerar esta versión apta para certificaciones cuya identidad y resultado deban ser confiables.

La revisión previa incluyó 21 comprobaciones locales con servicios simulados: unas verificaron correcciones y otras reprodujeron defectos pendientes. No fueron 21 pruebas de que el sistema estuviera libre de fallos. No se ejecutaron operaciones sobre Google Sheets, Drive, Calendar ni el despliegue real. En esta carpeta no están `probe_623` ni los archivos de la suite de 612 comprobaciones; esa suite no pudo verificarse.

Las líneas indicadas corresponden a los archivos revisados. Después de editar, buscar por nombre de función porque las líneas cambiarán.

## 2. Orden recomendado de implementación

| Orden | Corrección | Prioridad | Criterio para cerrarla |
|---|---|---|---|
| 1 | R1. Cerrar paneles y funciones administrativas alcanzables desde el navegador | Alta | Una llamada sin autorización no produce escrituras, publicaciones ni tareas |
| 2 | R2. Prohibir informes de intentos no entregados | Alta | Portal, GET, POST y PDF rechazan `EN_CURSO`, `VENCIDO` y `ANULADO` |
| 3 | R3. Retirar login compartido e invalidar sesiones anteriores | Alta | El correo y los permisos provienen de una credencial personal verificada |
| 4 | R4. Autenticar comandos del asistente | Media | No hay consultas ni llamadas de IA sin sesión válida |
| 5 | R5. Corregir «Dejar en blanco» en preguntas de texto | Media funcional | Campo, memoria, servidor y reanudación mantienen la respuesta vacía |
| 6 | Completar pruebas de integración y publicar la versión corregida | Obligatoria para el cierre | La URL publicada reproduce los resultados de la copia de prueba |

R1 requiere tanto el parche de los paneles como el inventario de las otras funciones públicas. Corregir únicamente los dos puentes no elimina las llamadas directas a las operaciones que esos puentes ejecutan.

## 3. R1 — Cerrar la ejecución administrativa desde el portal

### Evidencia e impacto

Ubicaciones:

- `Codigo.gs:23329`, `lanzarAccionConfig(nombre)`.
- `Codigo.gs:23540`, `lanzarAccionHerramienta(nombre)`.
- `Codigo.gs:20066`, `generarEnlacePublicoJSON()`.

Los puentes verifican que el nombre esté en una lista y luego ejecutan `marcarOrigenConfiable()`. No verifican que la llamada proceda de la hoja de cálculo ni que el usuario tenga permiso administrativo. La operación `generarEnlacePublicoJSON` cambia la visibilidad del archivo a cualquiera con el enlace. La publicación ocurre antes del aviso de interfaz.

La reproducción local confirmó que el puente llega a `setSharing()` sin token. No se publicó ningún archivo real.

**Distinción esencial:** `marcarOrigenConfiable()` es una variable de ejecución, no una autenticación. Que una función esté destinada a un disparador tampoco demuestra que la llamada realmente venga de un disparador.

Apps Script permite llamar desde `google.script.run` a funciones globales aunque la página no tenga un botón para ellas. Las funciones cuyo nombre termina en `_` son privadas para ese mecanismo. Fuente: [comunicación cliente-servidor y funciones privadas](https://developers.google.com/apps-script/guides/html/communication#private_functions).

### R1.1. Parche inmediato de los paneles

Esta propuesta mantiene los paneles disponibles desde la hoja de cálculo. Asume que las personas que pueden editar el libro están autorizadas a utilizar sus herramientas administrativas. Si esa política no es válida para tu organización, la mera disponibilidad de interfaz no basta: debes separar la administración o añadir una autorización individual.

Añadir esta función auxiliar privada:

```javascript
function exigirContextoHoja_() {
  try {
    SpreadsheetApp.getUi();
  } catch (e) {
    throw new Error("403 Esta operación solo está disponible desde la hoja de cálculo.");
  }
}
```

Reemplazar las dos funciones completas por estas versiones:

```javascript
function lanzarAccionConfig(nombre) {
  exigirContextoHoja_();

  if (typeof nombre !== "string" ||
      ACCIONES_PANEL_CONFIG.indexOf(nombre) === -1) {
    throw new Error("403 Acción de configuración no permitida.");
  }
  if (typeof this[nombre] !== "function") {
    throw new Error("La acción configurada no existe en esta versión.");
  }

  marcarOrigenConfiable();
  return this[nombre]();
}

function lanzarAccionHerramienta(nombre) {
  exigirContextoHoja_();

  if (typeof nombre !== "string" ||
      ACCIONES_PANEL_HERRAMIENTAS.indexOf(nombre) === -1) {
    throw new Error("403 Herramienta no permitida.");
  }
  if (typeof this[nombre] !== "function") {
    throw new Error("La herramienta configurada no existe en esta versión.");
  }

  marcarOrigenConfiable();
  return this[nombre]();
}
```

El orden es deliberado: comprobar el contexto ANTES de marcar confianza y ANTES de ejecutar la operación. No basta con invocar `exigirOrigenInterno()` después de `marcarOrigenConfiable()`.

Añadir también `exigirContextoHoja_();` al principio de `estadoConfiguracion`, `abrirPanelConfiguracion` y `abrirPanelHerramientas`, antes de que marquen el origen. Son entradas pensadas para la hoja, no para el portal público. Revisar con el mismo criterio `reconstruirLibroDesdeCeroUI`, `repararColumnasDeErrorUI`, `apartarEnlacesNoVideoUI` y `expandirContenedoresDelCatalogoUI`.

### R1.2. Eliminar accesos directos a las implementaciones

Aplicar primero los parches funcionales de este informe con los nombres actuales. Después realizar un cambio separado de nombres y actualizar todas sus referencias. Esto evita mezclar nombres nuevos y antiguos en los fragmentos siguientes.

Para cada función global, registrar: quién la llama, si lee datos sensibles, si escribe, cómo autoriza, y si debe ser pública.

| Tipo de función | Tratamiento recomendado |
|---|---|
| `doGet`, `doPost`, `apiPortal` | Mantener nombres públicos; cada ruta debe autenticar y autorizar antes de trabajar |
| Puentes de paneles | Mantener públicos solo con comprobación de contexto de hoja previa a la confianza |
| Funciones exclusivamente internas | Renombrar con `_` final y actualizar llamadas |
| Operaciones administrativas del menú | Implementación privada; actualizar nombres en menús y listas; el puente permanece protegido |
| Manejadores de disparadores instalables | Hacer privados y actualizar instalación y disparadores existentes; probar cada tipo |
| Disparadores simples como `onOpen` | Conservar el nombre reservado; limitar sus efectos a lo que realmente requiere ese disparador |

Ejemplos prioritarios de implementación privada:

| Nombre actual | Nombre recomendado |
|---|---|
| `marcarOrigenConfiable` | `marcarOrigenConfiable_` |
| `emitirSesionInterna` | `emitirSesionInterna_` |
| `obtenerTokenAdministrador` | `obtenerTokenAdministrador_` |
| `obtenerClaveMaestraSegura` | `obtenerClaveMaestraSegura_` |
| `obtenerClaveMaestra` | `obtenerClaveMaestra_` |
| `obtenerSalDerivada` | `obtenerSalDerivada_` |
| `obtenerTokenTikTok` | `obtenerTokenTikTok_` |
| `reconstruirLibroDesdeCero` | `reconstruirLibroDesdeCero_` |
| `migrarCatalogoAV2` | `migrarCatalogoAV2_` |
| `migrarBancoPreguntas` | `migrarBancoPreguntas_` |
| `generarEnlacePublicoJSON` | `generarEnlacePublicoJSON_` |
| `procesarComandoVoz` | `procesarComandoVoz_` |

Esta tabla es un punto de partida, no una auditoría completa de todas las funciones globales. Revisar también lectores de Drive, exportadores, envío de mensajes, creación de certificados y funciones que escriben en hojas. Por ejemplo, proteger el puente no impide llamar directamente a `generarEnlacePublicoJSON` mientras su implementación permanezca pública y sin guarda.

**No dejar alias públicos sin autorización** del tipo `funcionAntigua() { return funcionNueva_(); }`: volverían a abrir el acceso. Mantener las guardas existentes como segunda defensa, incluso después del cambio de nombres.

Para los disparadores, revisar al menos estas funciones que actualmente se marcan confiables:

- `ejecutarMantenimientoSemanal`, `disparadorNocturnoFase2`.
- `procesarColaTareasSilencioso`, `procesarColaConAntiTimeout`.
- `continuarEmbeddingsCatalogo`, `registrarRespuestaFormularioCentralizado`.
- `agendarRecordatoriosDeModulosVencidos`, `actualizarDashboardPeriodico`.
- `exportarCatalogoAJsonSilencioso`, `onEditControlMovilTrigger`, `crearBackupAutomatico`.

Actualizar tanto las referencias directas como los nombres escritos dentro de cadenas: `ScriptApp.newTrigger(...)`, opciones de menú, tablas de herramientas y verificadores de disparadores. Cambiar el código de instalación no modifica por sí solo los disparadores que ya existen. Registrar primero su evento, horario, recurso asociado y cuenta creadora; recrear los afectados conservando esas características. Probarlo en una copia antes de sustituir los de producción. Fuente: [disparadores instalables](https://developers.google.com/apps-script/guides/triggers/installable).

### Pruebas de aceptación R1

1. En una copia, llamar al puente sin contexto de hoja: debe fallar antes de ejecutar el destino.
2. Usar espías sobre escrituras, `setSharing`, correo y Calendar: deben registrar cero llamadas al rechazar el acceso.
3. Probar también la llamada directa a cada implementación sensible; no limitarse a probar el puente.
4. Desde la hoja autorizada, comprobar una acción inocua del panel y el manejo de un nombre inexistente.
5. Comprobar las nuevas funciones privadas desde un portal de prueba: deben resultar inaccesibles por `google.script.run`.
6. Ejecutar cada disparador en la copia y verificar su trabajo y sus permisos. No ejecutar tareas de correo o publicación contra datos reales para comprobar el rechazo.

## 4. R2 — No mostrar soluciones antes de entregar el examen

### Evidencia e impacto

`informeIntentoDeSesion`, en `Codigo.gs:3679`, verifica quién es el dueño, pero no el estado. `obtenerInformeIntento`, en `Codigo.gs:16261`, construye hallazgos con `respuestaCorrecta` a partir de respuestas parciales. Las rutas GET y POST también omiten el estado. El PDF utiliza el mismo generador.

Con un intento `EN_CURSO` y una respuesta parcial guardada se puede obtener la solución sin cerrar el examen. Subir `audit_exam` a `admin` fue correcto, pero no cubrió estas otras rutas.

### R2.1. Regla única en la función que genera el informe

Política recomendada: los informes académicos, incluidos PDF y solicitudes de administradores, solo se generan para intentos `ENTREGADO`. Si un administrador necesita observar intentos abiertos, crear una vista de seguimiento distinta que no devuelva soluciones. No conceder una excepción silenciosa dentro de este generador.

Añadir:

```javascript
function exigirIntentoEntregado_(registro) {
  if (!registro || !Array.isArray(registro.datos)) {
    throw new Error("404 El intento no existe.");
  }
  if (registro.datos[INT.ESTADO] !== ESTADO_INTENTO.ENTREGADO) {
    throw new Error("403 El informe solo está disponible después de entregar el examen.");
  }
}
```

En `obtenerInformeIntento`, insertar la llamada inmediatamente después de `leerIntento` y de la comprobación de existencia. Conservar el resto de la función:

```javascript
// Insertar dentro de obtenerInformeIntento, después de comprobar registro:
exigirIntentoEntregado_(registro);
```

Debe ejecutarse ANTES de leer el banco, las respuestas, las recomendaciones o los archivos. Así se bloquea la consulta sin construir previamente el solucionario.

### R2.2. Mantener la autorización por propietario en una sola función

Reemplazar `informeIntentoDeSesion` por:

```javascript
function informeIntentoDeSesion(intentoId, sesion) {
  exigirOrigenInterno("informeIntentoDeSesion");
  if (!sesion || !sesion.email) {
    throw new Error("401 Se requiere una sesión válida.");
  }

  const reg = leerIntento(intentoId);
  if (!reg) throw new Error("404 El intento no existe.");

  const correo = String(sesion.email).toLowerCase().trim();
  const duenio = String(reg.datos[INT.EMAIL] || "").toLowerCase().trim();
  const esAdmin = sesion.scope === "admin";

  if (!esAdmin && correo !== duenio) {
    throw new Error("403 No puedes consultar el informe de otra persona.");
  }

  exigirIntentoEntregado_(reg);
  return obtenerInformeIntento(intentoId, esAdmin);
}
```

La sesión debe salir de `obtenerDatosToken` después de validar el token; nunca aceptar `{email, scope}` enviado por el navegador como prueba de identidad. Esta función debe convertirse en privada durante R1.2, actualizando las referencias.

En la rama POST `informe_intento`, reemplazar el bloque completo por:

```javascript
if (action === "informe_intento") {
  validarPayload(payload, action, { token: "string", intentoId: "string" });
  validarTokenConScope(payload.token, "read_only");
  const sesion = obtenerDatosToken(payload.token);
  return respuestaJson({
    status: "success",
    data: informeIntentoDeSesion(payload.intentoId, sesion)
  });
}
```

En GET, sustituir el contenido de la rama `if (params.informe_intento)` por la misma delegación, usando `params.token` y `params.informe_intento`. La validación inicial de GET debe conservarse.

En POST `informe_pdf`, después de validar el token y resolver la sesión, llamar a `informeIntentoDeSesion(payload.intentoId, sesion)` ANTES de crear documentos. Mantener el formato de respuesta actual del PDF. La ruta PDF de `apiPortal` ya hace esa llamada: conservarla.

La doble comprobación de estado es intencional: la autorización de la ruta y la invariante del generador protegen responsabilidades distintas. `obtenerInformeAuditoria` ya filtra por `ENTREGADO`; conservar ese filtro.

### Matriz de pruebas R2

| Solicitante y estado | Portal | GET | POST | PDF |
|---|---|---|---|---|
| Sin token | Rechazar | Rechazar | Rechazar | Rechazar |
| Dueño, `EN_CURSO`, con respuesta parcial | Rechazar | Rechazar | Rechazar | Rechazar |
| Dueño, `VENCIDO` o `ANULADO` | Rechazar | Rechazar | Rechazar | Rechazar |
| Dueño, `ENTREGADO` | Permitir sin anexo forense | Igual | Igual | Igual |
| Otro alumno, `ENTREGADO` | Rechazar | Rechazar | Rechazar | Rechazar |
| Administrador, `EN_CURSO` | Rechazar | Rechazar | Rechazar | Rechazar |
| Administrador, `ENTREGADO` | Permitir con forense | Igual | Igual | Igual |

Al rechazar, comprobar que la respuesta no contiene soluciones ni justificaciones y que no se crearon archivos. Los códigos numéricos presentes en JSON no equivalen por sí solos a un estado HTTP: probar la estructura que realmente devuelve Apps Script y lo que interpreta el cliente.

## 5. R3 — Retirar la contraseña compartida

### Evidencia e impacto

La rama `login` de `doPost`, alrededor de `Codigo.gs:24037`, todavía acepta un correo declarado por el cliente. La contraseña común solo demuestra conocimiento de esa contraseña; no demuestra ser el titular del correo. Emitir `exam` evita la escalada administrativa, pero permite suplantación académica y consultar datos personales accesibles a ese correo.

### Cambio recomendado

Usar exclusivamente el canje de claves personales ya existente. Antes de retirar el acceso común, verificar que cada usuario activo tenga una clave personal válida, con el correo y permiso correctos. Gestionar su distribución mediante el procedimiento autorizado de la organización; no incrustar claves en código ni en este informe.

Reemplazar TODA la rama `if (action === "login")` por:

```javascript
if (action === "login") {
  return respuestaJson({
    exito: false,
    error: true,
    codigo: 403,
    mensaje: "El acceso por contraseña compartida fue retirado. Usa tu clave personal."
  });
}
```

No dejar el bloque antiguo debajo ni ofrecer una bandera que lo reactive accidentalmente. Retirar del panel la opción de configurar la contraseña común y actualizar la documentación de integración. Borrar `PORTAL_PASSWORD_ENC` una vez confirmada la migración, como limpieza adicional; el rechazo del endpoint no debe depender de que esa propiedad exista o no.

### Invalidar sesiones emitidas antes del arreglo

Deshabilitar login no invalida por sí mismo las sesiones ya creadas. Una forma controlable de hacerlo es introducir una revisión de autenticación. Este cambio obliga a todos a entrar nuevamente con su clave personal; no elimina las claves personales.

Añadir:

```javascript
function obtenerRevisionAuth_() {
  return PropertiesService.getScriptProperties()
    .getProperty("AUTH_REVISION") || "revision-seguridad-1";
}
```

En `emitirSesionInterna`, después de construir `payload` y ANTES de guardarlo en caché, insertar:

```javascript
payload.revisionAuth = obtenerRevisionAuth_();
```

En `obtenerDatosToken`, dentro de la rama de sesiones, inmediatamente después de `const ses = JSON.parse(raw);`, insertar:

```javascript
if (ses.revisionAuth !== obtenerRevisionAuth_()) return null;
```

Las sesiones antiguas no contienen ese campo y quedan rechazadas. Las nuevas contienen la revisión actual. Para invalidar todas las sesiones en un incidente futuro, cambiar `AUTH_REVISION` en las propiedades del proyecto a un valor nuevo, no vacío. Ninguna ruta pública debe permitir cambiar esa propiedad. No usar una revisión que vuelva a un valor anterior.

Auditar que todos los validadores de sesiones utilicen `obtenerDatosToken`. El canje personal vigente ya depende de esa función y del validador común.

### Pruebas de aceptación R3

1. La contraseña compartida, correcta o incorrecta, no emite ninguna sesión.
2. Una sesión antigua sin revisión o con revisión anterior se rechaza.
3. Una clave personal válida emite una sesión con el correo y scope del registro del servidor.
4. Una clave vencida o revocada no puede canjearse.
5. Cambiar el correo o scope en el cuerpo de la petición no cambia la identidad concedida.
6. Un administrador conserva acceso mediante su clave personal administrativa.

## 6. R4 — Autenticar los comandos del asistente

### Evidencia e impacto

La rama `assistant_command`, alrededor de `Codigo.gs:24109`, no valida token. `procesarComandoVoz` puede contar pendientes y buscar contenidos. Se confirmó localmente una respuesta de pendientes sin credencial. Las búsquedas también pueden consumir recursos de IA según su implementación y configuración.

Reemplazar la rama completa por:

```javascript
if (action === "assistant_command") {
  validarPayload(payload, action, { token: "string", command: "string" });
  validarTokenConScope(payload.token, "read_only");
  const sesion = obtenerDatosToken(payload.token);
  if (!sesion || !sesion.email) {
    throw new Error("401 Se requiere una sesión válida.");
  }

  const comando = payload.command.trim();
  if (comando.length > 1000) {
    throw new Error("El comando no puede superar 1000 caracteres.");
  }

  return respuestaJson(procesarComandoVoz(comando, sesion.email));
}
```

El límite de 1000 caracteres es una propuesta operativa, no un límite de Google. Ajustarlo si hay un caso de uso documentado que necesite más.

Añadir `exigirOrigenInterno("procesarComandoVoz");` como primera instrucción de la implementación y hacerla privada en R1.2. Si solo se protege `doPost`, la función global directa seguiría siendo una ruta alternativa. Mantener el límite de peticiones existente.

Pruebas: sin token, token vencido y comando vacío deben fallar sin leer catálogo ni llamar a IA. Una sesión válida puede consultar. El correo que envíe el cliente se ignora; se utiliza el resuelto por el servidor.

## 7. R5 — Vaciar correctamente las respuestas de texto

### Evidencia e impacto

En `Index.html:3413`, el manejador de `ex-limpiar` llama a `escribirRespuesta(p, "")`, pero no cambia el valor visible de `ex-texto`. El siguiente evento `blur` lee el texto antiguo y vuelve a guardarlo.

Dentro de `pintarPregunta`, reemplazar el bloque que obtiene `ex-limpiar` y registra su evento por:

```javascript
const lim = document.getElementById("ex-limpiar");
if (lim) lim.addEventListener("click", function () {
  if (p.tipo === "completar") {
    const campoActual = document.getElementById("ex-texto");
    if (campoActual) campoActual.value = "";
    escribirRespuesta(p, "");
  } else {
    elegirOpcion(p, -1);
  }
});
```

Primero se vacía el campo y después se guarda. Así, tanto el siguiente `blur` como el temporizador pendiente leen una cadena vacía. No es necesario repintar toda la pregunta, lo que conserva la solución al problema del cursor.

Pruebas manuales en una copia:

1. Escribir una respuesta, esperar a «Guardado» y pulsar «Dejar en blanco».
2. Confirmar que el campo queda visualmente vacío y que la rejilla marca la pregunta sin responder.
3. Volver a enfocar el campo y salir sin escribir: la respuesta no debe reaparecer.
4. Repetir pulsando el botón antes de que termine el retardo de 800 ms.
5. Cambiar de pregunta, regresar, recargar y reanudar: debe seguir vacía una vez confirmado el guardado.
6. Entregar el examen y comprobar que la respuesta se califica como omisión.
7. Comprobar que las preguntas de opción múltiple conservan su funcionamiento.

**Límite de este parche:** corrige el texto que reaparece por el campo sin vaciar. No resuelve por sí solo el orden de peticiones que ya estaban en vuelo. La concurrencia del guardado se trata como mejora separada a continuación.

## 8. Recomendaciones adicionales

Estas recomendaciones no deben confundirse con nuevos ataques demostrados en producción.

### 8.1. Guardar respuestas de forma ordenada

`google.script.run` es asíncrono; no garantiza que llamadas simultáneas terminen en el orden en que se enviaron. Fuente: [comunicación asíncrona](https://developers.google.com/apps-script/guides/html/communication).

Serializar los guardados por pregunta o añadir una revisión de respuesta que el servidor compare antes de escribir. La comparación y escritura deben ser atómicas si se usa revisión. Para múltiples pestañas, una cola solo en el navegador no basta: definir además la política de concurrencia del servidor. Antes de entregar, esperar a los guardados pendientes o impedir que una escritura parcial modifique el intento ya cerrado.

Prueba necesaria: retrasar artificialmente el guardado A, enviar B y comprobar que A no reemplaza a B cuando llega tarde. Añadir una prueba de guardado simultáneo a la entrega.

### 8.2. No confiar en el orden de opciones devuelto por el navegador

La entrega actual usa `r.orden`, enviado por el cliente, para convertir el índice presentado al índice original. Es mejor reconstruir ese orden con la semilla del intento y la función de barajado del servidor. Validar que la pregunta pertenece al intento y que el índice está dentro de sus opciones. Este cambio refuerza la integridad; no se afirma aquí que manipular el orden permita adivinar una solución desconocida.

### 8.3. Versionar el banco de preguntas de cada intento

El informe y la entrega vuelven a leer el banco vigente. Si una pregunta cambia durante un intento, podría calificarse o explicarse con una versión distinta a la presentada. Guardar una versión inmutable del banco o una instantánea de las preguntas utilizadas. La calificación y el informe histórico deben usar esa misma versión.

### 8.4. Resolver efectos pendientes después de una entrega

El código marca el intento como entregado antes de terminar todos los efectos posteriores: certificado, historial, refuerzo y notificaciones. Si uno falla, una nueva entrega devuelve el informe existente. Diseñar tareas idempotentes por `intentoId` para completar efectos pendientes sin duplicar certificados, bonos ni mensajes. Probar un fallo después de cerrar el intento y antes de registrar el historial.

### 8.5. Revisar credenciales y datos potencialmente expuestos

Si una versión vulnerable estuvo publicada, revisar sus permisos de acceso y los registros disponibles; el hallazgo no demuestra que alguien lo haya explotado. Considerar rotar tokens administrativos y credenciales que pudieron quedar expuestos, según el alcance real del despliegue.

No cambiar `MASTER_SECRET_HMAC`, `MASTER_KEY` o la sal sin un procedimiento de migración: los secretos existentes pueden depender de ellos. Preparar respaldo y recuperación, volver a guardar o migrar las credenciales necesarias y probar el descifrado antes de retirar las claves anteriores. Nunca incluir secretos en registros de pruebas.

### 8.6. Consolidar contratos y pruebas

La aplicación tiene decisiones repetidas en `apiPortal`, GET y POST. La autorización por recurso y las reglas del examen deben vivir en funciones comunes. Los controladores deberían validar la entrada, resolver identidad y delegar. Una corrección no está completa si una de esas entradas conserva la versión anterior de la regla.

Mantener separados los permisos `read_only`, `exam`, `append` y `admin`. Revisar si iniciar y entregar exámenes debe exigir `exam`: hoy varias funciones aceptan `read_only`. Adoptar esa modificación después de inventariar las integraciones afectadas y ajustar sus credenciales.

## 9. Cómo ejecutar la corrección y publicarla

1. Crear una copia de prueba del proyecto y del libro. Inventariar despliegues, propiedades y disparadores sin exportar secretos a archivos inseguros.
2. Aplicar R1.1 y los parches R2–R5 con los nombres actuales.
3. Ejecutar pruebas locales con servicios simulados y pruebas de integración sobre la copia. No ejecutar la suite que crea o elimina datos contra producción por defecto.
4. Aplicar R1.2 como cambio separado: renombrar implementaciones, actualizar llamadas, cadenas de menús, listas y creadores de disparadores. Comprobar que no haya alias públicos que reabran el acceso.
5. Repetir las pruebas de las entradas afectadas y verificar los disparadores de la copia.
6. Confirmar la distribución de claves personales y activar la revisión de autenticación para rechazar sesiones anteriores.
7. Crear una versión del proyecto y actualizar el despliegue que utilizan los usuarios. Guardar los archivos en el editor no actualiza automáticamente una implementación versionada. Fuente: [gestión de despliegues](https://developers.google.com/apps-script/concepts/deployments).
8. Verificar la URL publicada con una cuenta de alumno y otra administrativa. Comprobar login personal, catálogo, examen, informe y paneles de hoja.
9. Revisar y retirar implementaciones antiguas que todavía expongan rutas vulnerables; confirmar antes qué integraciones usan cada URL.
10. Registrar versión, resultados y cambios de contratos. Si hay que revertir, no volver a exponer sin restricciones una versión vulnerable: limitar temporalmente el acceso mientras se corrige.

## 10. Qué deben demostrar las pruebas

La prueba debe ejecutar el controlador real y observar los efectos. Es válido simular Sheets, Drive o Calendar; no es válido reemplazar por un rechazo ficticio la función cuya autorización se pretende verificar y concluir que el controlador está protegido.

Conservar las pruebas de regresión de las correcciones anteriores: emisión directa de sesiones, lectura de secretos, caducidad del token y entrega de intentos cerrados. Añadir las matrices R1–R5, con al menos un caso permitido por cada caso de rechazo para detectar arreglos que simplemente bloqueen todo.

Para afirmar que una acción fue rechazada correctamente, verificar ambos resultados:

- El usuario recibe un error comprensible y no recibe datos sensibles.
- No hubo escrituras, publicación de archivos, envío de mensajes, creación de eventos ni consumo de IA antes del error.

**Criterio final:** las rutas alternativas están cerradas, las operaciones autorizadas funcionan y las comprobaciones pasan también en el despliegue de prueba de Apps Script. El número de comprobaciones por sí solo no sustituye esa cobertura.

## 11. Estado de los fragmentos de código

Los fragmentos son propuestas de sustitución o inserción para esta versión concreta. No forman un archivo `.gs` completo y no deben pegarse todos juntos al final del original. Cada sección indica dónde reemplazar o insertar.

Los mensajes explícitos en español con prefijos `401`, `403` o `404` facilitan su incorporación sin depender de claves de traducción inexistentes. Como mejora posterior, trasladarlos a los diccionarios ES/EN y unificar la normalización de errores; actualmente `apiPortal` distingue especialmente 401 y 403, pero no todos los códigos mencionados.

Validación realizada al preparar este informe:

- Los 12 bloques de JavaScript pasan la comprobación sintáctica.
- Se ejecutaron 14 comprobaciones locales de la propuesta: rechazo y acceso permitido en puentes de paneles, nombres no autorizados, estados permitidos y rechazados para informes, revisiones de sesión y vaciado de respuestas.
- Una copia del servidor construida solo en memoria con las sustituciones de funciones y las inserciones de control de estado y revisión de autenticación pasó sintaxis. No se ejecutó como aplicación completa.
- Los servicios externos fueron simulados. Las propuestas de migración de disparadores, cambio de nombres y publicación requieren la validación en Apps Script descrita en el informe.

Estas comprobaciones no sustituyen la prueba de funcionamiento en Apps Script. La entrega del informe no implica que los cambios estén aplicados ni publicados.
