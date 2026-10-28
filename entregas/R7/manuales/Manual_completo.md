# Videoteca BD Manual de instalación y uso para el piloto

Edición del 16 de septiembre de 2026. Dirigido a Andrés Alberto Suárez Carmona, administrador de Videoteca, y a los supervisores autorizados de Kuvexta. Uso personal, familiar adulto y capacitación de empleados.

Este manual cubre todas las áreas del sistema, sus funciones y cómo preparar los ensayos del grupo. Incluye una propuesta inicial de tres a cinco adultos; no limita las funciones que el grupo puede evaluar. Explica el trabajo del administrador en Google Sheets y el de los participantes en el portal. El paquete contiene Código 24 e Index 9, revisados localmente en esta entrega a partir del servidor y HTML publicados anteriormente. No instala nada ni cambia el sistema en producción al abrirlo.

El grupo puede recorrer todas las funciones siguiendo sus requisitos. El catálogo, los módulos y los resultados pueden ensayarse sin generar contenido nuevo con IA. La búsqueda semántica necesita migrar el modelo de embeddings, Ollama requiere conectividad segura y las listas familiares tienen APIs de servidor pero no pantalla propia. El manual indica cómo distinguir una función lista para usar, una prueba técnica y un requisito pendiente, sin retirar opciones del código.

Los grupos de interés, su propósito y los usos concretos se explican en el capítulo 26. Esta revisión unifica las mejoras de catálogo, métricas, guardado y orientación del portal en el mismo manual.

## 1 Qué contiene esta entrega

En `instalacion/Codigo.gs` está la copia exacta de `Codigo_24_Recuperacion_Operativa.gs`. En `instalacion/Index.html` está la copia exacta de `Index_9_Recuperacion_Operativa.html`. La versión interna es `v2026.6.37-VIDEOTECA-PILOTO-R7`. Los nombres cortos son los que deben tener los archivos dentro del editor de Apps Script. No se deben mezclar con el antiguo Codigo.gs o Index.html de otras carpetas.

El registro del 13 de septiembre documenta la publicación anterior de Código 19 e Index 5 como versión 8 de Google. Código 24 e Index 9 son una revisión nueva, probada localmente y todavía no publicada por esta entrega. El informe VALIDACION distingue regresiones simuladas y comprobaciones de interfaz de una prueba real en producción.

La carpeta `ejemplo_administrador` contiene el módulo de instrucciones para IA, su revisión y un banco de preguntas para una instalación de ensayo. Incluye respuestas: es material del administrador, no debe entregarse antes del examen a los participantes. La guía breve de participantes sí se puede compartir con ellos. El manifiesto de archivos permite comprobar que el código no cambió durante el empaquetado.

No se incluyen credenciales, claves de participantes, propiedades de producción, copias con datos personales ni contraseñas del respaldo. Este paquete es una distribución de software y documentación; no reemplaza el respaldo completo de la instalación real.

El capítulo 28 describe el nuevo flujo de panel a menú, la recuperación de tareas y los certificados bloqueados. Tras actualizar, recargue la hoja para obtener el menú actual. El capítulo 29 recoge la revisión de código posterior al cierre: qué prometía el sistema y no cumplía, qué quedó conectado y qué cambió en la calificación de las respuestas escritas.

### Correcciones que ya incorpora

La serie entregada incorpora el ajuste del retorno OAuth de TikTok, diagnósticos para revisar esa conexión, el rol de supervisor y la separación de resultados por identidad. El HTML incluye la pantalla Resultados para administradores y supervisores. El último servidor impide generar certificados en una carpeta compartida y retiró la publicación automática de certificados mediante enlace público.

La aprobación de las ocho preguntas del primer módulo fue un cambio de datos posterior al respaldo portable. Index 9 añade correcciones de interfaz y sesión, sin cambiar ese banco. También hubo una rotación posterior del acceso de Albert. Restaurar un respaldo anterior no reproduce automáticamente estos dos cambios. Este manual no contiene esa clave.

## 2 Conceptos que conviene entender

**Libro de Google Sheets.** Es la base de datos y la consola del administrador. Contiene el catálogo y hojas auxiliares de configuración, módulos, progreso y resultados. Una hoja oculta sigue siendo accesible para un editor del libro: ocultar no equivale a proteger datos.

**Servidor Apps Script.** Es Codigo.gs. Se ejecuta en Google, lee y escribe el libro, consulta proveedores, comprueba permisos, registra resultados y atiende al portal. Debe estar vinculado al libro correcto. No se instala como biblioteca independiente para este procedimiento.

**Frontend o portal.** Es Index.html. Presenta pantallas y llama al servidor mediante `google.script.run`. Abrir ese archivo directamente en el computador no reproduce el sistema: necesita ser servido por Apps Script. El Manual.html de esta entrega, en cambio, sí se puede leer localmente.

**Versión e implementación.** Guardar código actualiza el proyecto; publicar una versión actualiza lo que usa la URL terminada en `/exec`. Un despliegue puede seguir ejecutando código anterior aunque el editor muestre lo nuevo. `/dev` es una vista de desarrollo para personas autorizadas, no la dirección que se entrega a participantes ni a TikTok.

**Propiedades del script.** Son ajustes del servidor: claves de proveedores, carpeta raíz, configuración de tokens y otras opciones. No viajan dentro del HTML. Las propiedades por usuario pertenecen a cada cuenta de Google; en la revisión previa se hallaron contadores FAIL_COUNT, no credenciales heredadas.

**Clave API.** Autoriza llamadas de un proyecto a un proveedor, normalmente con consumo y cuotas. **Client ID o client key** identifica una aplicación. **Client secret** acredita a esa aplicación. **OAuth** pide consentimiento al usuario y cambia un código temporal por credenciales de acceso. No se deben intercambiar estos campos.

**Token del portal.** Es una credencial propia de Videoteca. Quien la posee puede actuar con la identidad y el alcance asociados. El correo registrado no es una segunda autenticación de Google. Un token de TikTok, una clave de OpenAI y una clave de participante no sirven para la misma cosa.

**Sesión.** Es el acceso temporal abierto después de autenticarse. Revocar una clave permanente impide nuevos inicios, pero esta versión no garantiza cerrar instantáneamente todas las sesiones que ya estaban abiertas. Cerrar sesión y comprobar la revocación forman parte de la prueba.

**HMAC.** Sirve para comprobar integridad. Aunque algunas funciones se llamen cifrar, el almacenamiento utilizado para las claves combina firma e información codificada; no debe presentarse como cifrado que oculte las claves a los editores del proyecto. La seguridad depende también de restringir quién edita el libro y el script.

**Activador o disparador.** Ejecuta una función en un horario o ante un evento. Pertenece a la cuenta que lo creó. El inventario de una cuenta no muestra necesariamente los activadores creados por otra. Una cola guarda trabajo pendiente; un checkpoint recuerda dónde continuar; la DLQ reúne registros que fallaron repetidamente.

**IA generativa y embeddings.** La primera redacta, clasifica o propone preguntas. Los embeddings convierten texto en vectores para buscar por significado. Son funciones diferentes, con modelos, cuotas y fallos diferentes. Tener una clave de IA válida no garantiza que ambas funcionen.

## 3 Qué funciona sin IA y qué la necesita

| Trabajo | Sin IA generativa | Condición o límite |
|---|---|---|
| Guardar enlaces y organizar el catálogo | Sí | Revisar enlaces y clasificación |
| Consultar metadatos mediante APIs o vías públicas | Sí | Cada plataforma impone permisos y cuotas |
| Clasificación mediante reglas de taxonomía | Sí | La cobertura depende de las reglas |
| Buscar y filtrar por datos del catálogo | Sí | No equivale a búsqueda semántica |
| Entrar al portal, ver módulos y guardar progreso | Sí | Clave válida y recursos accesibles |
| Presentar un examen con banco ya validado | Sí | Contenido requerido y preguntas suficientes |
| Calificación del banco y consulta de resultados | Sí | La interpretación final es humana |
| Generar un PDF con plantilla configurada | Sí | Carpeta privada y plantilla válidas |
| Resúmenes nuevos y preguntas propuestas por un modelo | No | Clave, modelo compatible, cuota y revisión |
| Procesamiento profundo del catálogo | Usa IA | Empezar con una fila, no un lote completo |
| Buscar por significado e indexar fragmentos | Usa embeddings | Pendiente de migración en esta versión |

Un material que trata sobre inteligencia artificial puede estudiarse y evaluarse sin activar IA en Videoteca. El módulo piloto ya tiene preguntas revisadas. Las transcripciones disponibles se pueden recuperar sin un modelo generativo, aunque no todos los videos publican subtítulos ni todas las vías permiten descargarlos.

El interruptor de IA debe comprobarse en Configuración. No suponga que una instalación nueva arranca apagada: el código puede tomar IA activa si no existe la propiedad correspondiente. Además, no use herramientas explícitas de embeddings como prueba del interruptor general: son otra vía de consumo.

## 4 Preparar una instalación desde cero

### Paso 1 Elegir propietario y separar los ensayos

Use una cuenta de Google controlada por el responsable. Abra un perfil de navegador con esa sola cuenta para instalar y administrar. El encabezado de una página no basta para demostrar qué identidad está ejecutando cada llamada. No cree activadores desde una cuenta alternativa durante la prueba.

Cree una carpeta privada de Drive para la nueva instalación y un libro vacío de Google Sheets. Póngales nombres que indiquen que son de ensayo. Mantenga restringido el libro: los participantes accederán al portal, no recibirán permiso de edición del libro. Si va a separar empleados y familia por privacidad, cree dos instalaciones independientes.

Prepare tres identidades de prueba: administrador, supervisor y participante. Reserve una cuarta cuenta para comprobar que un participante no ve los resultados de otro. Utilice personas adultas que hayan aceptado participar, contenidos no sensibles y un canal privado para entregar las claves.

### Paso 2 Instalar los dos archivos

1. Abra el libro nuevo y entre en Extensiones → Apps Script. Así queda vinculado al libro.
2. En el archivo Código del editor, sustituya el contenido por `instalacion/Codigo.gs`. No pegue el código dentro de otra función.
3. Añada un archivo de tipo HTML llamado `Index`. Pegue `instalacion/Index.html` completo. El editor muestra la extensión automáticamente.
4. Guarde. Compruebe que solo hay una copia de las funciones principales: no conserve versiones antiguas del servidor en otros archivos del mismo proyecto.
5. En Configuración del proyecto compruebe el motor V8 y la zona horaria America/Bogota. En el libro ajuste también la zona horaria y la configuración regional apropiadas.
6. Si utiliza el manifiesto base suministrado, hágalo solo en este proyecto nuevo. Es una plantilla, no una copia de los permisos o identificadores de producción.

### Paso 3 Habilitar los servicios de Google necesarios

En Servicios del editor añada YouTube Data API v3 para las funciones que usan el servicio avanzado YouTube. Los servicios avanzados se habilitan desde el proyecto; cuando se usa un proyecto estándar de Google Cloud puede ser necesario habilitar también la API en su consola. La guía oficial explica esa diferencia: https://developers.google.com/apps-script/guides/services/advanced .

DriveApp, SpreadsheetApp, DocumentApp, SlidesApp, FormApp y CalendarApp son servicios integrados. No necesitan una clave API pegada en Configuración; necesitan autorización de Google cuando se ejecuta una función que los usa. No active servicios externos ni cree credenciales de Cloud solo porque el nombre aparece en el manual.

### Paso 4 Autorizar e inicializar

1. Desde el editor seleccione `onOpen` y ejecútela; vuelva al libro y recárguelo para ver el menú Videoteca Certificable.
2. Abra Configuración y establezca la carpeta raíz privada de esta instalación. El ID es el segmento de la URL de Drive que identifica la carpeta, no su nombre.
3. En el editor seleccione `inicializarSistemaCompleto`, ejecútela y atienda la confirmación en la hoja. Esta función crea o repara hojas, carpetas y la clave administrativa. Si una llamada no muestra diálogo, vuelva al libro y revise el registro de ejecución antes de repetir.
4. Google puede pedir autorización del proyecto propio. Revise la cuenta y los permisos solicitados. Si una política de la organización bloquea el proyecto, debe resolverlo el administrador de esa organización; no se corrige pegando otra clave de API.
5. Guarde la clave administrativa en un gestor de contraseñas. No la copie al catálogo ni al HTML.
6. Compruebe que existen el catálogo y las hojas auxiliares. Revise las subcarpetas Textos_RAG, Certificados, Backups, Documentos_Modulo e Informes_Auditoria.

La función de inicialización no debe confundirse con **Reconstruir el libro desde cero**, que borra y reconstruye hojas. No utilice esta última para instalar una copia que ya contiene resultados. Tampoco vuelva a inicializar producción para obtener una clave perdida: use el procedimiento de accesos.

### Paso 5 Configurar el funcionamiento básico

En Configuración compruebe IA desactivada para la primera carga, idioma y zona horaria. Aplique formato y validación de URLs si hace falta. Mantenga las credenciales de proveedores opcionales vacías hasta necesitarlas. Pegue una URL real en la columna de enlaces o use Insertar una fila de ejemplo. En Código 24 esta acción solicita una URL HTTPS real, crea las 32 columnas con sus índices correctos y deja el video pendiente de procesar, sin inventar métricas.

Ejecute Ingesta rápida masiva, fase 1 sin IA. Observe título, ID, fuente y estado. Un dato vacío no siempre es un error: un proveedor puede no ofrecer duración o métricas de contenido ajeno. Si falla, revise una fila y su causa antes de cargar cien enlaces. La ingesta masiva puede recorrer más de la selección visible; para aprender use un libro pequeño.

### Paso 6 Publicar el portal

En Apps Script seleccione Implementar → Nueva implementación → Aplicación web. Asigne una descripción de versión. Para el diseño ensayado se ejecuta como el propietario, y los usuarios llegan al portal mediante el acceso web permitido por la cuenta y sus políticas. La autorización propia de Videoteca comprueba después la clave y el alcance. No haga público el libro de Sheets para conseguir que abra el portal.

Copie la URL de aplicación web terminada en `/exec`. Abra esa dirección en otra sesión del navegador y pruebe la pantalla de acceso. La URL de biblioteca, la del editor y la terminada en `/dev` no son sustitutos. La documentación de publicación está en https://developers.google.com/apps-script/guides/web .

Cuando posteriormente cambie código, use Administrar implementaciones → seleccione la activa → editar → nueva versión → implementar. Conservar el mismo despliegue evita cambiar enlaces de usuarios y retornos OAuth. Si decide crear otro despliegue, habrá que actualizar explícitamente todas esas referencias; archivar uno no reescribe el código ni las propiedades que apuntaban a él.

### Paso 7 Crear accesos y comprobar permisos

Use las herramientas de acceso del panel de Configuración para crear o administrar claves con identidad nominal. Los alcances importantes son admin, supervisor y exam. El administrador configura todo; el supervisor consulta resultados del conjunto; el participante consulta los suyos y realiza su recorrido. El alcance read_only no debe interpretarse como una garantía absoluta de no escritura para todas las APIs auxiliares de esta versión.

No conceda admin a un participante para resolver un problema de entrada. Pruebe cada perfil en una sesión separada, cierre sesión al terminar y compruebe que el supervisor no obtiene las herramientas del administrador. La pantalla Resultados debe estar disponible para admin y supervisor; el participante debe quedar limitado a su información.

Para emitir cada acceso, abra la gestión de tokens (`administrarTokensUI`) y elija generar uno nuevo. Escriba nombre completo, correo del titular, alcance y días de vigencia. Para un piloto puede usar una vigencia corta acordada, por ejemplo 30 días. Escriba `exam` para el participante o `supervisor` para quien solo consulta resultados. Copie la clave cuando se muestre: la lista posterior solo enseña un prefijo. Entregue una clave distinta a cada persona y registre identidad, alcance y vencimiento sin publicar el secreto.

### Paso 8 Preparar el primer módulo

Cree un módulo desde Módulos, indicando un ID estable, título, rol descriptivo, número de preguntas y umbral de visualización. Seleccione las filas de los videos que corresponden y utilice Asignar videos al módulo. Revise el resultado: cambiar las fuentes de un módulo puede reemplazar su conjunto de fuentes, no necesariamente agregar sin quitar.

El campo Rol objetivo describe a quién está dirigido; no es un control que oculte el módulo a otros participantes. Para información que no deba cruzarse entre grupos use instalaciones separadas. Revise título, descripción, estado, fuente y banco antes de habilitar una evaluación.

### Paso 9 Instalar solo las tareas necesarias

Empiece por Ver los disparadores instalados. Si ya existen, compruebe función, cuenta, horario y aviso de fallo antes de ajustar. En el ensayo previo se conservaron tres: actualización de dashboard cada hora, mantenimiento el domingo de 03:00 a 04:00 y respaldo el domingo de 23:00 a 00:00, zona Bogotá. Los avisos de fallo estaban en una vez por día. Los horarios son ventanas de Google, no una promesa de ejecución al segundo exacto.

Para una instalación nueva puede activar esas tres desde Configuración y verificar después en la página Activadores de Apps Script. No active todavía proceso nocturno de IA, cola automática, sincronización de agentes ni formularios si no los usará. Un activador no debe duplicarse para intentar arreglar la falta de visibilidad desde otra cuenta.

### Paso 10 Hacer respaldo y prueba de aceptación

Conserve el libro, el servidor, el HTML, la configuración y los recursos vinculados. Pruebe recuperación en una copia separada. Genere un respaldo actualizado antes de invitar participantes; el portable histórico no contiene los últimos cambios de preguntas y acceso. Documente fecha, versión y qué queda fuera. Complete la lista de aceptación del capítulo 15.

## 5 Menú principal de la hoja

Este menú es la consola del administrador. Las etiquetas pueden abreviarse en pantalla, pero las funciones indicadas permiten identificarlas en el editor. Si una acción solicita confirmación o muestra un resultado, ejecútela desde la hoja con la cuenta correcta. Una ausencia de mensaje no demuestra que no hubo ejecución.

**Ingesta rápida masiva, fase 1 sin IA** (`ejecutarFase1Rapida`) obtiene y organiza información básica. Use primero uno a cinco enlaces. **Continuar desde checkpoint** retoma una ingesta interrumpida; reiniciar el checkpoint vuelve al principio, por lo que no es la primera respuesta a un fallo aislado.

**Procesamiento concurrente, fase 2 con IA** (`ejecutarFase2Profunda`) realiza enriquecimiento que puede llamar modelos. Requiere credenciales compatibles y revisión del costo. **Sincronizar todo** (`actualizarTodo`) combina trabajo más amplio; no debe usarse como prueba mínima de una clave porque puede afectar muchas filas.

**Dashboard** crea o actualiza el resumen operativo. **Buscador** genera la vista de búsqueda del libro. **Importar playlist** incorpora los videos de una lista compatible; revise cantidades y duplicados. **Videos con problemas o DLQ** abre la cola de registros aislados por errores. Corrija la causa antes de reprocesar.

**Configuración** reúne proveedores, IA, tareas, avisos, portal y ajustes del libro. **Mostrar herramientas avanzadas** amplía el conjunto de acciones administrativas. Mostrar el menú no ejecuta todas sus herramientas y no habilita por sí mismo el modo familiar.

### Submenú Módulos

**Crear módulo** establece su ficha. **Asignar videos** relaciona el material. **Generar banco** propone preguntas y requiere IA cuando se generan nuevas; una propuesta no debe darse por aprobada. **Revisar banco** permite el control humano de enunciados, respuestas y referencias antes de validarlo. **Documento maestro** reúne material del módulo. **Panel de módulos** ofrece una vista de gestión. **Certificaciones** crea la vista de seguimiento. **Informe PDF de intento** trabaja sobre un intento concreto. **Exportar certificaciones** permite revisar resultados fuera del portal y exige proteger el archivo exportado.

### Submenú Exportaciones

Excel y CSV sirven para análisis tabular; JSON para integración; PDF para una vista imprimible; Slides para una presentación; ficha en Google Docs para un video; Mermaid para representar un mapa mental. Una exportación no hereda automáticamente todas las restricciones del portal: revise destino, contenido y permisos. El enlace público del JSON, ubicado entre herramientas avanzadas, sí implica publicación y no forma parte del piloto privado.

El anexo de herramientas al final recoge cada acción avanzada incluida en el código con su nombre técnico, propósito y observaciones. Debe leerse junto con las excepciones de este manual: algunas descripciones breves del menú no reflejan completamente sus límites.

## 6 Panel de Configuración explicado

**Cómo se rellena cada fila.** Hay tres comportamientos y conviene distinguirlos antes de pulsar nada. Las filas que solo piden un texto —claves de IA, endpoint de Ollama, tokens de Vimeo, Twitch, Facebook y TikTok, identificadores de GA4 y las URL de los webhooks— abren un campo **debajo de la propia fila**: se escribe, se pulsa Guardar y la fila cambia de estado sin salir del panel. Las que no piden nada —instalar un disparador, vaciar una caché, lanzar un diagnóstico— se **ejecutan en el panel** y devuelven su resultado ahí mismo. Y solo las que abren un cuadro de preguntas encadenadas, que un panel de Apps Script no puede abrir, dejan la acción **elegida** para ejecutarla desde el menú **Videoteca → Ejecutar acción elegida en el panel**. El botón lo dice de antemano: «Guardar», «Instalar» o «Ejecutar» actúan al momento; «Elegir» manda al menú.

De esa selección para el menú solo se guarda la última y vence a los quince minutos. Si elige una y después pulsa otra fila, la primera se descarta; el panel muestra un aviso en amarillo mientras haya una pendiente, con su nombre y los minutos que le quedan.

**Sobre los campos de credenciales.** Aparecen siempre vacíos y eso es deliberado: el valor guardado no se devuelve a la pantalla, de modo que el panel no puede usarse para leer una clave que ya está puesta. Un campo que se deje vacío no borra nada, se ignora; guardar sin escribir nada se rechaza. Para retirar una credencial hay que borrar la propiedad en el proyecto de Apps Script. Las claves se guardan firmadas, no cifradas: quien tenga acceso al editor del script puede recuperarlas.

**Avisos.** Permite configurar un webhook o canales como correo y Telegram, y enviar una prueba. Una confirmación visual no sustituye verificar la recepción. La prueba previa recibió el evento prueba_de_canal. No envíe datos personales en una prueba de conectividad. Un webhook genérico necesita un receptor que entienda su formato.

**Inteligencia artificial.** Contiene interruptor, claves de Gemini, OpenAI y Claude, ajustes de Ollama y elección de proveedor/modelo. La acción ahora se titula Revisar prompts (sin llamada a IA). Llama a `probarPrompts`: muestra los textos configurados, no acredita que el proveedor aceptó la clave. La prueba real es una operación pequeña que devuelve contenido y queda reflejada en el proveedor.

**Plataformas de video.** Vimeo, Twitch, Facebook y TikTok son opcionales según el catálogo. Conectar una cuenta no concede acceso a todos los videos de la plataforma. En Código 24, el indicador de Twitch comprueba Client ID y Client Secret por separado y exige ambos. Aun así, tener los dos campos no acredita cuota o respuesta válida del proveedor.

**Tareas automáticas.** Refrescar panel actualiza el dashboard; respaldo semanal copia el libro; mantenimiento revisa tareas de conservación; proceso nocturno de IA puede consumir APIs; procesar cola ejecuta pendientes; control móvil atiende la hoja de control; agentes exporta datos para una integración; formularios instala manejadores de sus respuestas. Active solo lo que tenga una finalidad definida y compruebe el propietario de cada activador.

**Portal y sistema.** Incluye accesos, rotación, carpeta raíz, medición e integraciones. La contraseña compartida antigua está retirada. Renovar la vigencia de un token extiende su vencimiento y conserva la misma clave. Código 24 corrige esa etiqueta; no equivale a rotar el secreto. La rotación necesita el flujo correspondiente y una comprobación del nuevo acceso antes de retirar el antiguo.

**Libro.** Idioma y zona horaria afectan presentación y horarios. Las opciones de mantenimiento y reconstrucción no son ajustes cotidianos. Para consultas de resultados utilice la pantalla de supervisión en lugar de entregar acceso al libro completo.

## 7 Configurar proveedores de IA

Las suscripciones de chat y el uso por API pueden tener facturación distinta. Genere claves para el proyecto que realmente utilizará Videoteca, revise cuotas y conserve los secretos en el servidor. Nunca los pegue en Index.html, una celda compartida ni una captura. Los siguientes enlaces son los portales oficiales; las pantallas y condiciones pueden cambiar.

### Gemini

1. Entre en https://aistudio.google.com/apikey con la cuenta responsable.
2. Cree o seleccione el proyecto correspondiente y genere una clave según el flujo de AI Studio. Si exige facturación, revise primero el presupuesto y el proyecto seleccionado.
3. Copie la clave y vuelva a la hoja → Configuración → Google Gemini. Guárdela allí.
4. En Elegir proveedor y modelo seleccione GEMINI. Revise `_Config_IA`: B4 contiene el modelo de generación; la base entregada usa gemini-2.5-flash.
5. Pruebe un resumen de una sola fila no sensible y revise respuesta, errores y consumo. No use indexar todo el catálogo como primera prueba.

Referencia oficial de claves: https://ai.google.dev/gemini-api/docs/api-key . La vigencia de modelos se consulta en https://ai.google.dev/gemini-api/docs/deprecations . El modelo text-embedding-004 fijado en el código ya fue retirado. Cambiar B4 no corrige esa ruta; no active búsqueda semántica hasta migrarla y reconstruir el índice completo con un único modelo compatible.

### OpenAI

1. Abra https://platform.openai.com/api-keys y seleccione el proyecto correcto. Cree una clave nueva de API.
2. Guárdela cuando se muestre, revise acceso a modelos, facturación y límites del proyecto. Tener ChatGPT no demuestra que exista saldo de API.
3. En la hoja → Configuración → OpenAI pegue la clave. Seleccione OPENAI como proveedor y revise B5 de `_Config_IA`.
4. La base usa gpt-4o-mini. El adaptador actual llama a Chat Completions y envía max_tokens; no está migrado a Responses. No sustituya el nombre por cualquier modelo reciente sin comprobar que acepta esos parámetros y está disponible para su proyecto.
5. Genere un único resumen y compruebe tanto el contenido como el panel de uso del proveedor.

La autenticación y el manejo de claves se documentan en https://developers.openai.com/api/reference/overview . Una clave válida con cuota agotada, un modelo no permitido o parámetros incompatibles puede fallar igualmente.

### Claude de Anthropic

1. Entre en https://platform.claude.com/ y abra la configuración de claves API de la organización o espacio correspondiente.
2. Cree una clave, registre su vencimiento si aplica y compruebe la facturación.
3. Péguela en Configuración → Claude. Seleccione CLAUDE y revise B6 de `_Config_IA`.
4. El valor antiguo claude-3-5-sonnet-20240620 del código fue retirado. Antes de usar esta opción elija un modelo activo compatible con Messages API y disponible en su cuenta. La documentación consultada propone claude-sonnet-4-6 como sustituto de esa familia; compruebe compatibilidad y costo con una llamada pequeña.
5. Revise el resultado real y el consumo antes de lanzar un lote.

Fuentes: https://platform.claude.com/docs/en/manage-claude/authentication y https://platform.claude.com/docs/en/about-claude/model-deprecations . El cambio de un modelo de configuración no instala una versión nueva del adaptador.

### Ollama

Ollama ejecutado en el computador no queda disponible automáticamente para Apps Script. Desde Google, localhost se refiere a su entorno de ejecución, no al PC de Andrés; una IP doméstica privada tampoco es una dirección alcanzable desde allí. La base utiliza un modelo llama3.2:latest y un adaptador local sin un esquema completo de autenticación para una pasarela remota.

Para ensayar esta opción es necesario resolver primero esa conexión. Para habilitarla hace falta diseñar y probar una pasarela accesible de forma segura y adaptar la autenticación; no se recomienda abrir el puerto de Ollama sin protección. Referencia: https://docs.ollama.com/api/authentication .

### Configuración y control de consumo

La hoja `_Config_IA` usa B2 para proveedor, B3 para límite de tokens de salida y B4 a B7 para modelos. Un límite de tokens no es un presupuesto mensual ni garantiza el costo máximo de un lote. Algunas funciones usan límites propios. Empiece con una fila, después cinco y solo amplíe si el resultado y consumo son aceptables.

El código puede intentar Gemini como alternativa cuando falla otro proveedor y hay una clave de Gemini configurada. Esto importa para la privacidad y el costo: elegir OpenAI o Claude no asegura que ningún texto vaya a Google. Evite transcripciones internas sensibles en la prueba y documente qué proveedores están habilitados.

## 8 Credenciales de video y almacenamiento

### YouTube y Google Drive

YouTube se utiliza mediante el servicio avanzado de Google y sus cuotas. Para el recorrido estándar no hay una clave de YouTube que deba pegarse en el panel. El propietario autoriza el script y habilita el servicio según el capítulo de instalación. Un video privado, eliminado, restringido por región o sin subtítulos puede no estar disponible aunque la API funcione.

Para Drive, el propietario debe tener acceso a la carpeta y a los archivos. Importar una carpeta incorpora referencias; no vuelve públicos los videos ni garantiza que los participantes puedan reproducirlos. Pruebe el acceso desde una identidad participante. Portales: https://drive.google.com/ y https://console.cloud.google.com/apis/library .

### Vimeo

Entre en https://developer.vimeo.com/apps, cree o seleccione una aplicación y abra su apartado de autenticación. Genere un personal access token con los permisos mínimos que necesita. No conceda escritura o borrado para catalogar. Guárdelo en Configuración → Vimeo y pruebe un video que esa cuenta pueda consultar.

Sin clave, Videoteca puede utilizar una vía pública con información limitada. Que aparezca un título no demuestra acceso a métricas privadas. Guía oficial: https://help.vimeo.com/hc/en-us/articles/12427789081745-How-to-generate-a-personal-access-token .

### Twitch

Abra https://dev.twitch.tv/console/apps, registre la aplicación con la cuenta responsable y complete los requisitos que muestre Twitch, incluida la protección de la cuenta cuando la exija. Obtenga Client ID y genere Client Secret. En Configuración → Twitch introduzca cada uno en su campo; no intercambie el secreto con un token de usuario.

El servidor usa esas credenciales para obtener acceso de aplicación. El indicador corregido exige ambas credenciales; compruebe además una respuesta real del proveedor. Guía: https://dev.twitch.tv/docs/authentication/register-app/ .

### Facebook Graph

El punto de entrada es https://developers.facebook.com/apps/ . Cree o seleccione una aplicación adecuada al activo que controla, agregue los productos requeridos y use las herramientas oficiales para obtener y revisar un token con los permisos que correspondan a esa cuenta o página. El explorador está en https://developers.facebook.com/tools/explorer/ y el depurador en https://developers.facebook.com/tools/debug/accesstoken/ .

Guarde la credencial en Configuración → Facebook Graph. Pruebe un recurso propio autorizado y compruebe tipo de token, permisos y vencimiento. No existe un token universal para leer cualquier video de Facebook. Esta integración no quedó validada de extremo a extremo en los ensayos documentados; los pasos exactos dependen del tipo de aplicación y de los permisos aprobados por Meta. Puede ensayarla en su fase específica y registrar los permisos y resultados obtenidos.

### TikTok paso a paso

1. Entre en https://developers.tiktok.com/ y abra la aplicación y el Sandbox que realmente va a probar. Un Sandbox recreado tiene otras credenciales; no mezcle pares de dos aplicaciones.
2. Complete nombre, icono de 1024 × 1024, descripción, plataforma Web y páginas públicas reales de términos y privacidad correspondientes al servicio. Revise que esas páginas abran sin iniciar sesión y que el texto refleje el tratamiento real de datos.
3. Añada Login Kit y los permisos que necesita: user.info.basic y video.list. Incluya como Target User la cuenta adulta que autorizará el ensayo.
4. En Login Kit → Redirect URI → Web registre la URL exacta del despliegue activo de esta instalación, completa y terminada en `/exec`. Guarde los cambios.
5. En Videoteca → Configuración → TikTok credenciales introduzca Client key y Client secret del mismo Sandbox.
6. Compruebe en las propiedades del script `TIKTOK_REDIRECT_URI`. Debe contener exactamente el mismo retorno. No use una URL antigua, la de biblioteca ni una dirección con `?code=`.
7. Abra TikTok conectar cuenta. El texto que muestra debe repetir el retorno actual. Si sigue mostrando otro, deténgase y corrija la configuración o la versión que está sirviendo el portal; recrear el Sandbox no lo resolverá.
8. Genere un enlace de autorización nuevo, ábralo dentro del plazo indicado y copie solo la URL, sin añadir la frase El enlace caduca en 15 minutos. Autorice con la cuenta incluida en Target Users.
9. El retorno debe mostrar TikTok conectado. Cierre esa pestaña y vuelva al libro. No reutilice un código OAuth ya consumido.
10. Pruebe un video público de la propia cuenta autorizada. Después puede ejecutar Completar lo ya cargado y revisar el resumen.

La Web/Desktop URL describe dónde funciona la aplicación; Redirect URI es el destino exacto al terminar OAuth. Pueden coincidir en un diseño concreto, pero no son conceptualmente el mismo dato. La guía oficial de Login Kit está en https://developers.tiktok.com/doc/login-kit-web/ . Los requisitos de revisión están en https://developers.tiktok.com/doc/app-review-guidelines .

En los ensayos se obtuvo TikTok conectado y una operación informó 0 actualizados de 64 porque no correspondían a la cuenta autorizada. Esa integración no entrega por ello métricas de todo TikTok. Una vista previa de Google Sheets que muestra un video ajeno tampoco demuestra que video.list lo permita. Una prueba con cero elementos debe diferenciar falta de contenido propio, permisos y errores de consulta.

La URL documentada de la instalación existente empieza por `AKfycbyWXkkfk8t...` y termina en `/exec`. Está incluida completa en LEEME. Para una instalación nueva use su nueva URL, no copie la de producción. El Sandbox es un entorno de prueba con usuarios autorizados; no equivale a aprobación de la aplicación para público general.

### Dropbox

Abra https://www.dropbox.com/developers/apps y cree una aplicación con alcance limitado a lo necesario. Para consultar archivos use permisos de lectura de metadatos apropiados; restrinja a la carpeta de la aplicación si el caso lo permite. En la consola genere un token de desarrollo y úselo en Importar desde Dropbox junto con la carpeta solicitada.

Los tokens pueden ser de corta duración. La importación de esta versión no debe tratarse como un sistema completo de renovación OAuth. Compruebe caducidad y resultado de una carpeta pequeña; no almacene el secreto en el catálogo. Referencia: https://developers.dropbox.com/oauth-guide .

### OneDrive

Abra https://developer.microsoft.com/graph/graph-explorer e inicie sesión con la cuenta que tiene la carpeta. Pruebe una consulta de lectura como `/me/drive/root/children`, concediendo solo el permiso necesario para sus archivos. En Access token puede obtener la credencial de la sesión de prueba. En Importar desde OneDrive suministre el token y la carpeta que solicite la herramienta.

Esto sirve para un ensayo supervisado; no configura por sí solo una aplicación permanente con renovación de credenciales. Revise el vencimiento. Referencia: https://learn.microsoft.com/en-us/graph/graph-explorer/graph-explorer-features .

## 9 Avisos y conexiones adicionales

**Correo.** Usa la cuenta y las autorizaciones de Google del script. Respete sus cuotas. Enviar una prueba implica enviar un mensaje real; use un destinatario de ensayo conocido. La entrega puede tardar o llegar a spam. No configure envíos masivos antes de comprobar el contenido.

**Telegram.** Abra https://t.me/BotFather, use /newbot y guarde el token que entrega. Inicie una conversación con el bot desde la cuenta de destino; obtenga el chat_id mediante las herramientas oficiales de la Bot API, por ejemplo consultando getUpdates de su propio bot. Introduzca token y chat_id en el canal correspondiente y envíe una prueba. No use páginas ajenas que pidan su token. Guía: https://core.telegram.org/bots/tutorial .

**Webhook de avisos.** Es una URL que recibe un evento. El receptor puede ser una automatización propia, pero debe aceptar el método y el JSON enviados. Una dirección de Slack, un endpoint de ERP o un número de WhatsApp no son intercambiables. Preferir un canal en el portal no instala una integración de WhatsApp.

**WhatsApp.** Apps Script no habla con WhatsApp directamente y esta entrega no incorpora ningún proveedor. Lo que existe es un envío por el mismo webhook de avisos, con `canal: "whatsapp"` y el teléfono en el cuerpo; quien reciba ese webhook decide con qué proveedor lo entrega. Se activa guardando el número en la propiedad `ALERTAS_WHATSAPP_TELEFONO` y solo funciona si además hay webhook configurado. Antes de R7 la función existía sin que nada la llamara; ahora sale con cada evento del sistema, así que compruebe primero con un receptor de ensayo qué volumen de mensajes genera su instalación.

**Agentes, ERP y MCP.** Las herramientas generan esquema, contexto y documentación para integradores. Generar esos archivos no despliega un servidor MCP ni pone un ERP a funcionar. Para ensayarlas, use un receptor de prueba y revise permisos antes de publicar JSON.

**GA4.** Se configura desde https://analytics.google.com/ con una propiedad y flujo web, si se decide medir uso. El identificador de medición no es un token de acceso al portal. Revise la implementación y las obligaciones de información antes de habilitar medición; no envíe claves ni respuestas de evaluaciones como datos analíticos.

La medición está apagada mientras no existan a la vez `GA4_MEASUREMENT_ID` y `GA4_API_SECRET`: sin ambas, la función sale sin llamar a nadie. Con ambas, cada evento del sistema envía el nombre del evento y dos datos técnicos, origen y versión del script; no viajan correos, notas ni respuestas. Hasta R7 esta integración estaba escrita y sin conectar, de modo que no medía nada aunque las propiedades estuvieran puestas. No se ha comprobado contra una propiedad real de Analytics.

## 10 Manual del portal para participantes

### Entrar y salir

Abra la dirección `/exec` que entrega el administrador, preferiblemente desde un marcador. Introduzca la clave personal en el formulario de acceso. Index 9 oculta sus caracteres y deja Recordar desactivado inicialmente. Actívelo únicamente en un dispositivo privado. Los enlaces de invitación no guardan automáticamente la clave de forma permanente. No la comparta: el sistema atribuye las acciones a su identidad. Si no la encuentra o venció, solicite al administrador un acceso nuevo o renovación según corresponda; no utilice el de un compañero.

Espere a que sus apuntes indiquen Guardado. Al terminar use Cerrar sesión, especialmente en un equipo compartido. Index 9 limpia el estado local y distingue si el servidor confirmó el cierre o si no pudo verificarlo. Cerrar una pestaña no debe asumirse equivalente. Si cambió de usuario, cierre la sesión anterior antes de ingresar la nueva clave.

### Inicio y Catálogo

Inicio muestra Tu siguiente paso con una acción recomendada y Otros avisos como información secundaria. Si no puede consultar los pendientes, lo comunica; no significa que haya terminado el trabajo. Consulte el capítulo 27 para las mejoras de esta pantalla. En Index 9, Catálogo permite elegir Por palabras sin IA o Por significado con IA e índice. El primer modo es el inicial y admite el texto en la ruta de catálogo; el segundo llama expresamente a la búsqueda semántica y requiere al menos tres caracteres. Todos los filtros se conservan al cambiar de modo. Abra la ficha, compruebe título y fuente y reproduzca el material. Algunos videos se abren en el proveedor original; su acceso depende también de esa plataforma. Un enlace roto se reporta como incidencia en lugar de marcarlo visto.

Los favoritos y las notas sirven para regresar al material. Una nota personal no modifica el título oficial ni la respuesta correcta del examen. Si un resumen existe, úselo como apoyo; no sustituye estudiar la fuente ni convierte automáticamente una afirmación del video en un hecho comprobado.

### Módulos y progreso

Si hay módulos de más de un ecosistema, arriba aparece una fila de filtros con el número de módulos de cada uno; el botón «Todos» la desactiva. El ecosistema de un módulo se deduce de sus videos, así que no hay nada que configurar. El filtro queda en la dirección: el botón de atrás lo deshace y recargar no lo pierde.

Abra Módulos y elija el asignado para la prueba. Revise las fuentes, el número de preguntas y los intentos disponibles. Un contenido se considera completado cuando se registra al menos el 95 % de su duración. En fuentes externas puede aparecer Confirmar que lo vi completo: úselo solo después de estudiar el material. Es una declaración de progreso, no una verificación independiente de atención.

El umbral de módulo se calcula sobre la cantidad de videos completados y se redondea hacia arriba. Con un video y umbral 80 % hace falta completar ese único video. Con cinco fuentes al 80 % hacen falta cuatro. Tener 80 % de segundos de un video no significa necesariamente que el módulo lo cuente como completado.

### Presentar una evaluación

El examen se habilita cuando cumple el contenido requerido y existe un banco suficiente de preguntas validadas. Lea las instrucciones y el límite de intentos. Abra la evaluación, responda cada pregunta y utilice las opciones de revisión que muestre la pantalla. Si se permite dejar respuestas en blanco, no significa que obtengan puntos.

Antes de entregar compruebe omisiones. Confirme una sola vez y espere la respuesta. Si hay un fallo de conexión, consulte el estado del intento antes de iniciar otro; repetir clics no es una reparación. No use el acceso del administrador para presentar la prueba de un participante.

En las preguntas de escribir la respuesta, la comparación ya no distingue mayúsculas, tildes, signos de puntuación ni espacios repetidos: «configuración», «Configuracion» y «configuracion » cuentan igual. Sigue siendo una comparación exacta de las palabras, no una corrección de significado: un sinónimo, una abreviatura o una palabra de más se califican como error. Quien prepare el banco debe escribir la respuesta esperada tal como espera leerla, y una pregunta cuya respuesta esperada quedó vacía nunca se da por acertada. Este cambio es más indulgente que la versión anterior: si ya calificó exámenes con Código 24 antes de esta revisión, no compare porcentajes entre unos y otros sin advertirlo.

### Notas y refuerzo

Consulte sus resultados, el informe del intento y las recomendaciones de repaso. En la clasificación base, 90 % o más corresponde a Experto; desde 80 % a Competente con brechas; desde 60 % a Aprobado con reservas, sin certificación; por debajo no se certifica. El banco y los pesos determinan el cálculo efectivo. El administrador debe explicar los criterios antes de evaluar.

Una calificación que cumple el criterio no garantiza que ya exista un diploma PDF. La emisión requiere la plantilla y las carpetas configuradas. Las señales denominadas anti IA o forenses no prueban por sí solas fraude ni deben producir una sanción automática.

### Preferencias y problemas

En el menú personal se encuentran Mis notas y refuerzos, Preferencias y Cerrar sesión. El tema de pantalla puede ser claro, oscuro o automático. Elegir un canal de contacto no implica que el servidor ya esté configurado para enviarlo. Reporte al administrador el módulo, la hora y el mensaje de error; no envíe capturas de su clave.

Si el administrador guardó inglés como idioma de una persona, desde R7 los mensajes que redacta el servidor —avisos, errores, títulos de las notificaciones— y sus correos de diploma, refuerzo e informe llegan en ese idioma. Los rótulos fijos de la pantalla siguen en español, y el texto que redacta un modelo de IA sale en el idioma en que fue escrito el prompt. Elegir idioma no traduce los videos, los títulos del catálogo ni las preguntas del examen.

El portal se dibuja entero con JavaScript. Si el navegador lo tiene desactivado por una política de la organización, la página ahora lo explica en lugar de quedarse en blanco; no es una caída del servicio y no se arregla entrando con otra cuenta.

## 11 Portal del supervisor y del administrador

**Supervisor.** En Resultados puede consultar los intentos entregados del conjunto autorizado por el diseño actual. Hay paginación y búsqueda por correo; utilice el correo exacto normalizado cuando quiera una persona concreta. Esta vista no entrega al supervisor la edición general del sistema. No incluye enlaces públicos a certificados ni las claves de participantes.

Debajo de Resultados el supervisor ve además el tiempo dedicado del mes, una fila por persona, y puede abrir el informe completo de cualquiera de ellas. Es la única capacidad que se le añadió, y se le añadió porque justificar horas de formación es precisamente su trabajo; no lleva consigo ningún permiso de escritura, y exportar ese informe al libro sigue siendo cosa del administrador. El capítulo 29 explica qué significa cada cifra y, sobre todo, qué no mide.

La exigencia acordada es que Andrés y los supervisores autorizados vean todos los resultados y cada participante solo los suyos. Antes del piloto pruebe esto con dos participantes. El libro de Sheets debe seguir reservado al administrador: compartir el libro completo con un supervisor elude la separación del portal.

**Administrador.** Además de Resultados, tiene Administración con las pestañas Panel, Actividad, Sugerencias, Incidencias, Añadir video, Armar módulo e Identidad. Panel resume operación; Actividad permite revisar acciones; Sugerencias e Incidencias organizan aportes y problemas; Añadir video incorpora un enlace; Armar módulo prepara la estructura; Identidad ayuda a comprobar el contexto efectivo. La gestión completa de claves y proveedores sigue en la hoja.

El frontend no debe contener Client secret ni claves API. Sus controles visuales no sustituyen las comprobaciones del servidor. Después de cambiar HTML hay que guardar y publicar una nueva versión del mismo despliegue para que `/exec` sirva la modificación.

## 12 Caso práctico de capacitación con empleados

### Preparación por Andrés

Use el módulo **IA práctica de una idea a instrucciones claras**, ID `ia_instrucciones_claras_01`. En la instalación ensayada contiene una fuente, video `60yoGZZHZzI`, ocho preguntas, umbral 80 % y hasta tres intentos. La revisión histórica documenta ocho preguntas CURADA/VALIDADA y ningún examen real presentado durante esa intervención. Compruebe ese estado actual antes de invitar al grupo.

Seleccione tres empleados adultos y un supervisor. Explique que el objetivo es comprobar navegación, aprendizaje, permisos y utilidad, no medir productividad individual mediante la prueba técnica. Entregue una clave exam distinta a cada empleado y una supervisor al supervisor. No envíe el banco con respuestas.

Compruebe que el video sigue disponible y que las preguntas corresponden al tramo revisado 00:00 a 17:35. Revise afirmaciones comerciales del video y no las adopte como hechos del curso. El aprendizaje buscado es formular una tarea, aportar contexto, aclarar dudas, probar una salida y corregirla.

### Recorrido de una participante

Ana es una identidad ficticia de ejemplo. Entra con su clave, abre Módulos, ve 0 de 1 contenido completado y estudia la fuente. Completa realmente el video y vuelve al módulo. Con 1 de 1 y ocho preguntas validadas, el examen debe quedar disponible. Si no ocurre, se revisa el registro; no se modifica su progreso a mano para forzar un aprobado.

Ana responde las ocho preguntas y entrega. Supongamos que obtiene siete respuestas correctas de ocho, todas con el mismo peso: 87,5 %. Es un ejemplo de cálculo, no un resultado real registrado. Correspondería al nivel Competente con brechas; revisa el refuerzo de la pregunta fallada. Si no hay plantilla de certificados, se conserva el resultado sin prometer un PDF.

El supervisor abre Resultados y localiza el intento de Ana. Otro participante inicia sesión y comprueba que no ve ese resultado. Andrés revisa si hubo una sola entrega, si los tiempos son razonables para el recorrido y si apareció alguna incidencia. Al final reúne comentarios del grupo y decide si ampliar a cinco personas o corregir primero.

### Reproducir el módulo en una instalación nueva sin IA

1. Ingrese el enlace `https://www.youtube.com/watch?v=60yoGZZHZzI` en el catálogo nuevo y procese fase 1. Verifique la disponibilidad actual del material.
2. Cree el módulo con el ID indicado, ocho preguntas, umbral 80 %, máximo tres intentos y estado ACTIVO. Asigne ese video como fuente y compruebe que usa el identificador Video 1.
3. El archivo `Banco_piloto_BORRADOR.tsv` contiene las 24 columnas del banco. Muestre `_Claves_Examenes`, compruebe que las cabeceras coinciden y copie únicamente las ocho filas de datos debajo de la cabecera en una instalación vacía. No reemplace ni duplique filas de un banco existente. Conserve Opciones_JSON como texto.
4. El archivo está deliberadamente en BORRADOR. Revise preguntas, opciones, índice correcto, justificación, video y segundo con el documento de revisión. El índice de respuesta empieza en cero: 0 es la primera opción y 1 la segunda.
5. Solo después de la aprobación del responsable utilice Módulos → Revisar banco, indique el ID y confirme la promoción. Esta acción promueve todas las preguntas de ese módulo: compruebe antes que son exactamente las ocho esperadas. El flujo invalida la caché del banco. No edite estados masivamente ni use reemplazar todo para otros módulos.
6. Compruebe 8 de 8 preguntas disponibles, 0 de 1 contenidos al entrar con un participante nuevo y examen bloqueado hasta completar la fuente. No es necesario llamar a un modelo para esta instalación del ejemplo.

El JSON original incluido conserva la descripción histórica de evaluación en revisión. Se aporta como evidencia del contenido aprobado, no como un importador automático ni como una instantánea de producción del día de hoy. La descripción del módulo nuevo debe reflejar su estado real.

## 13 Uso personal y familiar adulto

### Qué está disponible realmente

Los adultos de la familia pueden usar acceso personal, catálogo, módulos, notas, progreso y evaluaciones del mismo portal. El servidor también contiene invitaciones, listas y eventos familiares, pero Index 9 todavía no ofrece una pantalla completa de listas familiares o calendario familiar. Cambiar APP_MODE a family no crea esa interfaz.

La implementación de listas no ofrece aislamiento estricto por propietario para todas sus operaciones. Los nombres member, editor y gestor_eventos no garantizan permisos distintos en cada API. No use esta parte para separar información confidencial entre hogares ni para mezclar datos sensibles de empleados. Para el piloto familiar se recomienda otro libro con contenido apto para todo ese grupo de adultos.

### Invitar a una persona

En herramientas avanzadas → Nube y familia → Invitar a alguien, introduzca el correo, nombre, rol y vigencia solicitados. Use member para el participante normal; admin concede administración completa. La invitación genera una clave y un enlace, pero no envía por sí sola un correo. Entregue la clave por un canal privado y la URL oficial del portal por separado si es posible.

Verifique el correo antes de crearla: la hoja de miembros no admite repetir el mismo correo como si fuera otra persona. Si perdió la clave, no cree identidades confusas con pequeñas variaciones del nombre. Use la gestión de accesos y confirme el inicio con la clave que corresponde.

### Caso familiar completo

Andrés crea una copia familiar independiente y agrega dos videos de herramientas digitales revisados. Crea el módulo Seguridad y organización digital en casa, con contenido apto para adultos y sin datos de la empresa. Invita a dos familiares adultos como member. Cada uno recibe su propia clave, entra, estudia y guarda notas.

Si quiere evaluar, Andrés prepara preguntas y las valida antes de habilitar la prueba. Con dos fuentes y umbral 80 %, ambos contenidos deben completarse por el redondeo. Cada familiar consulta sus resultados; Andrés consulta los del conjunto como administrador. Si el objetivo solo es aprender, puede usar el catálogo sin crear examen ni certificado.

Una reunión familiar puede organizarse manualmente fuera del portal; no se debe indicar al participante que busque un calendario que este HTML no muestra. Las funciones de calendario del servidor requieren integración y autorización de Google; crear un evento puede generar notificaciones reales según su configuración. No son necesarias para este ejemplo.

Al finalizar, Andrés recoge comentarios, cierra accesos que ya no se necesiten y hace una copia de seguridad de la instalación familiar. Las notas y resultados no se copian al libro de empleados.

## 14 Certificados informes y recursos vinculados

Para emitir certificados se necesita una plantilla de Google Slides. Configure su ID mediante Certificados PDF. En la primera diapositiva utilice exactamente los marcadores `{{Nombre}}`, `{{Curso}}`, `{{Fecha}}`, `{{Nota}}` y `{{Nivel}}`. Revise tamaño, texto y que no haya datos de una persona anterior escritos como texto fijo.

La raíz y la subcarpeta Certificados deben pertenecer al propietario efectivo y ser privadas, sin editores ni lectores adicionales. El servidor entregado comprueba estas condiciones antes de copiar la plantilla. Si no se cumplen, debe detenerse; no solucione el error compartiendo la carpeta con cualquiera. La vía existente de entrega utiliza adjunto cuando corresponde, no publicación pública automática.

Haga una prueba controlada con datos ficticios antes de una emisión real. Esta entrega no documenta una emisión final exitosa, porque la plantilla no estaba habilitada en el último ensayo. El resultado de evaluación puede existir aunque el archivo PDF todavía no exista.

Los formularios generados para videos son recursos de práctica distintos del examen nativo de módulos del portal. No necesita instalar un activador de Google Forms para que un participante responda el examen nativo. Si utiliza formularios externos, pruebe sus permisos y la captura de respuestas por separado.

Un libro que contiene enlaces a documentos, formularios, presentaciones o videos de Drive no incluye esos archivos en su copia. Mantenga un inventario de recursos vinculados, propietario, permiso, finalidad y respaldo. El examen del portal y la accesibilidad de una fuente son comprobaciones diferentes.

## 15 Lista de aceptación para iniciar con pocas personas

1. Conserve código y HTML de la misma entrega; registre versión publicada y URL `/exec`.
2. Compruebe administrador, supervisor y dos participantes en sesiones separadas. Cada participante ve solo sus resultados; el supervisor consulta los del conjunto sin controles administrativos.
3. Compruebe un módulo con fuente accesible, banco revisado y examen bloqueado antes de completar el contenido.
4. Una persona realiza un recorrido real: reproducción, progreso, examen, entrega, resultado y refuerzo. Registre el resultado como prueba de piloto, sin simular atención.
5. Verifique que no se duplicó el intento al refrescar la pantalla. Revise errores y datos sin modificar respuestas para hacer pasar la prueba.
6. Confirme si habrá o no certificado PDF. Si no hay plantilla probada, comuníquelo antes de empezar.
7. Inventaríe los activadores con la cuenta propietaria. Compruebe horarios y avisos sin recrear los que ya están bien.
8. Verifique un respaldo reciente y su recuperación. Incluya por separado las propiedades y los recursos vinculados que necesita conservar.
9. Si usa IA, pruebe una sola fila y confirme proveedor, modelo, cuota y calidad. Si no la usa, deje el recorrido de generación fuera del piloto.
10. Invite a tres a cinco adultos y acuerde dónde reportan incidencias. No distribuya el paquete administrativo con respuestas ni claves internas.

En una ficha de prueba anote fecha, versión, perfil usado, acción, resultado esperado, resultado observado y evidencia sin secretos. Separe lo aprobado, lo fallido y lo no probado. Un botón visible o un indicador verde no es evidencia suficiente de extremo a extremo.

## 16 Mantenimiento respaldo y recuperación

El respaldo mínimo de recuperación incluye libro, Codigo.gs, Index.html, propiedades del script con sus claves y HMAC, inventario de activadores y recursos externos necesarios. Los tokens y propiedades deben almacenarse cifrados en un respaldo privado, no dentro de este paquete de distribución.

Un archivo protegido con DPAPI depende del perfil de Windows; no es por sí solo la copia que sobrevivirá a perder el computador. El respaldo portable cifrado necesita una contraseña guardada aparte y recuperable. El usuario confirmó que la conserva y la comprobó. No escriba esa contraseña en el manual.

Antes de restaurar, cree una copia del estado actual. Restaure en un libro de ensayo, compruebe propiedades e integridad sin revelar valores, vuelva a vincular recursos y pruebe permisos. No sobrescriba la producción como primer ensayo. Si cambia de cuenta propietaria, revise también acceso a carpetas y activadores.

Para rotar una clave de proveedor, genere la nueva en su consola, guárdela en Configuración, pruebe una llamada pequeña y retire la anterior cuando se haya confirmado la transición. Para OAuth puede hacer falta reconectar la cuenta. Para una clave de participante utilice el flujo de rotación, no solo renovar vigencia. Compruebe que la nueva entra y que la vieja ya no permite iniciar otra sesión.

El respaldo portable histórico del 13 de septiembre conserva ocho preguntas BORRADOR. La promoción posterior y la rotación de Albert requieren un respaldo actualizado. No restaure ese archivo suponiendo que contiene automáticamente el último estado de accesos.

## 17 Resolver problemas sin empeorarlos

**TikTok dice redirect_uri.** Compare la dirección registrada en Login Kit, TIKTOK_REDIRECT_URI y la que muestra el enlace nuevo. Deben coincidir exactamente. Compruebe el Sandbox y sus claves. No regenere otra aplicación como primera medida.

**Google dice que no puede abrir el archivo al volver de TikTok.** Revise que el retorno sea una aplicación web activa accesible y no una implementación archivada, URL de biblioteca o proyecto distinto. Primero pruebe la URL base sin el código OAuth; después genere una autorización nueva. No pegue un código antiguo en otra dirección.

**El panel no responde o muestra cero activadores.** Un cero no identifica por sí solo la causa. En R7, Ver los disparadores instalados devuelve cuenta efectiva, cuenta activa, proyecto y funciones visibles a la página. Compare ese contexto antes de reinstalar activadores. El diagnóstico con las cuentas reales sigue pendiente; el inventario de una cuenta no muestra necesariamente los de otra.

**Clave de participante perdida.** El administrador comprueba la identidad y gestiona el acceso. No se pide la clave a otro participante ni se publica en la hoja. Renovar vencimiento y rotar secreto son operaciones diferentes.

**El acceso tarda cada vez más al equivocarse de clave.** Es el freno de entrada descrito en el capítulo 29 y no un fallo del portal. Cada canje rechazado retrasa al siguiente, de un cuarto de segundo hasta cinco, con memoria de quince minutos; el contador es común a toda la instalación, así que un barrido automático también ralentiza al siguiente que se equivoque. Nadie queda bloqueado y una clave correcta entra sin espera. Si alguien acumula rechazos, revise que esté usando su clave vigente antes de emitir una nueva.

**Examen bloqueado.** Revise número de contenidos completos, redondeo del umbral, estado del módulo, preguntas validadas e intentos disponibles. En el ejemplo de una fuente hace falta verla completa. No reduzca requisitos solo para ocultar un error de registro.

**Las transcripciones dicen HTTP 429.** YouTube está limitando las peticiones de la dirección desde la que sale el script, que comparte con otros proyectos de Apps Script. No es un fallo de la instalación ni de los videos, y no se arregla con ninguna clave. El lote se detiene solo y deja un reintento programado en la cola de tareas; compruébelo en «Ver la cola de tareas» y deje pasar unas horas. Volver a lanzarlo de inmediato alarga el bloqueo. Si necesita la transcripción de un video concreto ese mismo día, péguela a mano con «Pegar la letra a mano», que acepta cualquier texto.

**IA devuelve error.** Revise clave, cuota, facturación, modelo disponible y compatibilidad del adaptador. Revisar prompts del panel no es una llamada real. Si falla Claude con el nombre antiguo o embeddings con text-embedding-004, cambiar la clave no corrige un modelo retirado.

**Faltan métricas.** Revise permisos del proveedor y propiedad del contenido. La vista previa en Sheets y la API usan vías distintas. No rellene una duración inventada para conseguir progreso o certificado.

**Certificado no sale.** Revise plantilla, marcadores, carpeta raíz y subcarpeta privadas, propietario efectivo y registro. La protección de privacidad puede estar bloqueando correctamente una carpeta compartida.

**Aparecen filtros viejos.** Invalide la caché de filtros después de comprobar los datos. Vaciar una caché no repara credenciales ni migra columnas. Use la herramienta concreta, no reconstrucción total.

**Hay fallos repetidos en la cola.** Corrija la causa de una fila, luego reprocese. Reiniciar contadores sin resolver URL o permisos solo repite fallos y consumo.

## 18 Referencia técnica de archivos y datos

El servidor centraliza validación de origen, permisos, acceso a Sheets, llamadas externas y publicación de respuestas. El HTML es la interfaz; los datos y secretos no deben depender de esconder controles en la pantalla. Las rutas de Inicio, Catálogo, Módulos, Notas, Resultados, Administración, Preferencias, Examen e Informe tienen funciones distintas; no hay una pantalla por cada función del servidor.

El catálogo actual utiliza 32 columnas. No pegue una plantilla vieja de 25 columnas sobre sus encabezados. Las migraciones sirven para esquemas anteriores y deben realizarse con respaldo y simulación cuando la herramienta la ofrece. Las hojas auxiliares se crean mediante la estructura del sistema; no se deben renombrar a gusto porque el código las busca por nombre.

`_Config_IA` conserva selección de proveedor y modelos. `_Claves_Examenes` es el banco reservado de 24 columnas. `_Modulos_Fuentes` relaciona módulos y fuentes. `_Log_Actividad` guarda actividad con contexto de ejecución. `_Sesiones_Video` guarda una fila por tramo continuo de visionado y es el único sitio donde vive el tiempo dedicado: el mantenimiento no la purga nunca y reconstruir el libro avisa de lo que se perdería, porque no se puede recalcular desde ninguna otra hoja. `_Informe_Tiempos` es un volcado que se reescribe entero en cada exportación, así que no conserva nada y se puede borrar sin pérdida; la versión en PDF del mismo informe no vive en el libro sino en la subcarpeta `Informes_Tiempos` de Drive, sujeta a la misma exigencia de carpeta privada que los certificados. El resto de esquemas y acciones se puede consultar en el servidor y en el anexo generado de esta misma versión.

Los campos Procedencia y Estado_Validacion distinguen una propuesta de una pregunta aprobada. `Opciones_JSON` contiene una lista de opciones, no una cadena separada por comas escrita informalmente. `Indice_Correcto` usa base cero. `Video_Segundo` indica la referencia temporal; `Peso_Puntos` debe reflejar el criterio de evaluación. Los campos de trampas o riesgo no son un detector concluyente de uso de IA.

Para mantener el sistema, edite la copia de trabajo, pruebe funciones afectadas en ensayo, guarde y publique una nueva versión del despliegue existente. Anote qué cambió y cómo se comprobó. No copie propiedades de producción a un proyecto público ni distribuya el respaldo de secretos junto al código.

## 19 Alcance de verificación y pendientes

La entrega incorpora las correcciones previas y añade los ajustes acotados de Código 24 e Index 9 documentados en los capítulos 24 a 28. No elimina funciones ni amplía los permisos de participantes o supervisores. Las pruebas locales simulan servicios y revisan regresiones de certificados privados, permisos, supervisión y TikTok. No acreditan disponibilidad de cada proveedor, entrega de todos los canales, emisión real de certificados ni funcionamiento de todos los menús en producción.

Antes de ampliar el piloto quedan como comprobaciones operativas el recorrido real completo de participantes, la plantilla de certificados si se desea emitirlos, el respaldo con los últimos cambios y los permisos de recursos externos. El grupo también puede planear pruebas de embeddings, familia, Ollama e integraciones externas, registrando los requisitos aún pendientes y los resultados reales. La autorización para ensayar todas las funciones no convierte en operativas las dependencias que faltan.

## 20 Diccionario de herramientas avanzadas

Las entradas siguientes se extraen de la tabla de herramientas de Código 24. Indican qué se pretende ejecutar; no certifican que cada integración haya sido ensayada. Las observaciones añadidas corrigen los casos donde la etiqueta del menú puede inducir a error. Las funciones marcadas como cambio amplio requieren especial atención al respaldo, al alcance y a la confirmación de pantalla.

### Ingesta y catálogo

**Continuar desde el punto guardado** — Retoma la ingesta donde se quedó la última pasada. Función: `continuarIngestaDesdeCheckpoint`.

**Reiniciar el punto de ingesta** — La próxima pasada vuelve a empezar por la primera fila. Función: `reiniciarCheckpointIngesta`.

**Fase 2 en paralelo** — Varias llamadas de IA a la vez. Más rápido y más caro. Función: `ejecutarFase2ParalelaUI`.

**Sincronizar desde una fila…** — Rehace metadatos y clasificación a partir de la fila que digas. Función: `actualizarTodoDesdeFilaUI`.

**Aplicar filtro a la fila de títulos** — Deja la cabecera filtrable. Función: `asegurarFiltroCatalogoUI`.

**Actualizar vistas y «me gusta»** — Solo las métricas; no toca títulos ni clasificación. Función: `actualizarSoloMetricas`.

**Detectar el idioma de cada video** — Rellena la columna de idioma donde falte. Función: `detectarIdiomasDelCatalogoUI`.

**Rellenar «Recursos / Enlaces»** — Saca los enlaces útiles de la descripción de cada video. Función: `completarRecursosCatalogo`. Cambio amplio o sensible: revisar alcance antes de confirmar. Requiere el servicio avanzado de YouTube habilitado en el proyecto; si no lo está, avisa y no modifica nada. La Fase 1 ya rellena esa columna en lo que entra nuevo: esta herramienta es la pasada sobre lo que ya estaba cargado. Hasta R7 existía en el código sin ninguna forma de ejecutarla.

**Insertar una fila de ejemplo** — Una fila de muestra para ver el formato esperado. Función: `insertarFilaEjemplo`. Código 24 solicita una URL HTTPS real y crea 32 columnas; procese después la fase 1.

### Limpieza y migración

**Reclasificar taxonomía y tags** — Reescribe la clasificación de TODO el catálogo. Función: `reevaluarClasificacionUI`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Eliminar duplicados** — Enseña antes cuántas filas borraría y pide confirmación. Función: `eliminarVideosDuplicadosUI`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Limpiar filas vacías** — Borra las filas sin URL, sin id y sin título. Función: `limpiarFilasInvalidas`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Reparar Estado y Fecha dañados** — Arregla las columnas que rompió una versión anterior. Función: `repararColumnasDeErrorUI`.

**Expandir listas y canales** — Convierte una lista o un canal pegado por error en sus videos. Función: `expandirContenedoresDelCatalogoUI`.

**Apartar lo que no es un video** — Marca ⚪ Descartado lo que ninguna plataforma puede abrir. Función: `apartarEnlacesNoVideoUI`.

**Migrar el esquema de columnas** — Solo si el libro viene de una versión antigua. Función: `migrarEsquemaCatalogoUI`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Migrar el catálogo a la taxonomía v2** — Simula primero y pide confirmación. Función: `migrarCatalogoAV2UI`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Verificar la migración v2** — Genera la hoja «_Verificacion_V2». No modifica nada. Función: `verificarMigracionV2UI`.

### IA y taxonomía

**Editar los prompts** — El texto con el que se le pregunta al modelo. Función: `abrirConfigPrompts`.

**Editar las reglas de taxonomía** — La hoja de reglas. La semilla de fábrica es la referencia. Función: `abrirConfigTaxonomia`.

**Reponer las reglas de fábrica** — Sustituye la hoja por la semilla del código. Función: `reponerReglasDeFabricaUI`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Diagnosticar la cobertura** — Qué reglas no reconocen nada y qué queda sin clasificar. Función: `diagnosticarCoberturaTaxonomiaUI`.

**Explicar por qué cayó ahí** — Para la fila activa: qué regla ganó y por qué. Función: `explicarClasificacionFilaUI`.

**Sugerir reglas nuevas** — Propone reglas a partir de lo que quedó sin clasificar. Función: `sugerirReglasTaxonomiaUI`.

**Aplicar las sugerencias** — Añade a la hoja las reglas propuestas. Función: `aplicarSugerenciasTaxonomiaUI`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Limpiar claves que no distinguen** — Quita palabras tan comunes que se lo llevan todo. Función: `limpiarClavesNoDiscriminantesUI`.

**Vaciar la caché de taxonomía** — Fuerza a releer las reglas en la próxima pasada. Función: `invalidarCacheTaxonomia`.

### Resúmenes y transcripciones

**Resumen ejecutivo de la fila** — Reescribe el resumen corto de la fila activa y lo guarda en su columna. Función: `generarResumenEjecutivoFilaActiva`. Gasta una llamada de IA y exige el motor de IA encendido. Sirve para corregir un resumen pobre sin repasar el catálogo entero; la Fase 2 seguía siendo la única vía hasta R7.

**Resumen ampliado de la fila** — Gasta una llamada de IA. Función: `generarResumenAmpliadoConIA`.

**Resumen de lo seleccionado** — Una llamada por fila seleccionada. Función: `generarResumenParaFilasSeleccionadas`.

**Resúmenes de los esenciales** — Lote sobre los marcados ⭐. Función: `generarResumenesLoteEsenciales`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Mostrar u ocultar columnas técnicas** — Drive, embedding, formulario y módulo. Función: `alternarVisibilidadColumnaS`.

**Extraer letras de canciones** — Interruptor. Afecta a los videos musicales. Función: `alternarLetrasMusicales`.

**Transcribir la fila activa** — Descarga los subtítulos si el video los tiene. Función: `extraerTranscripcionFilaActiva`.

**Transcribir en lote** — Recorre el catálogo por orden de utilidad: primero lo marcado ⭐ Esencial / Referencia, después lo 🟢 Estudiado / Aplicado y al final el resto. Omite lo ⚪ Descartado. Función: `extraerTranscripcionesMasivasEsenciales`. Cambio amplio o sensible: revisar alcance antes de confirmar. Procesa como máximo 20 videos por pasada; si llega al tope lo dice y basta con volver a ejecutarlo. El orden importa porque lo que caiga en la última ronda espera a la siguiente pasada. Solo se piden subtítulos a videos de YouTube que aún no tengan documento y estén dentro del alcance indexable; los musicales, únicamente con «Extraer letras de canciones» activado.

**Pegar la letra a mano** — Para cuando el video no publica subtítulos. Función: `pegarLetraVideoUI`.

### Búsqueda semántica

**Generar embeddings** — Necesario para buscar por significado. Gasta IA. Función: `generarEmbeddingsParaCatalogo`. Cambio amplio o sensible: revisar alcance antes de confirmar. Pendiente de migrar el modelo retirado y reconstruir el índice; requiere una migración antes de esperar resultados correctos.

**Regenerar el vector de la fila** — Rehace el embedding de un solo video, tras corregir su título o su resumen. Función: `generarEmbeddingVideoFilaActiva`. Necesita la clave administrativa guardada y arrastra la misma dependencia que la herramienta anterior: el modelo de embeddings sigue pendiente de migración, así que hoy sirve para reindexar una fila, no para dar por buena la búsqueda por significado.

**Indexar por fragmentos** — Trocea las transcripciones para buscar dentro. Función: `indexarFragmentosCatalogo`. Cambio amplio o sensible: revisar alcance antes de confirmar. Depende de la migración de embeddings. Puede ensayarse cuando se haya configurado un modelo operativo.

**Buscar por significado** — Busca por idea, no por palabra exacta. Función: `buscarSemanticoUI`. La búsqueda por significado requiere resolver el modelo de embeddings. Use búsqueda por palabras.

**Ajustar los umbrales** — Cuánto parecido hace falta para considerar un resultado. Función: `configurarUmbralesBusqueda`.

### Academia y evaluaciones

**Evaluar la dificultad** — Rellena la columna de nivel. Función: `actualizarDificultadCatalogo`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Importar plan de módulos** — Pega la tabla de módulos y asignaciones y las aplica de una vez. Función: `importarPlanDeModulosUI`, también en el menú Módulos Certificables. Acepta CSV y tablas de Markdown, y los dos bloques —definición de módulos y asignaciones— en el mismo pegado; se reconocen por su línea de cabecera. Comprobar no escribe nada: deja el veredicto de cada línea en la hoja `_Importacion_Plan`. Aplicar escribe los módulos, sus fuentes y la columna de módulo del catálogo en un solo recorrido, e invalida la caché. No da de alta videos que falten, no mueve un video que ya pertenezca a otro módulo y no ajusta el tamaño de ningún examen: las tres cosas se listan para que las decida una persona. Reimportar el mismo archivo no duplica nada.

**Generar exámenes pendientes** — Crea los formularios que falten. Función: `generarExamenesPendientesParaCatalogo`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Generar el siguiente lote** — Continúa donde se quedó. Función: `generarSiguienteLoteExamenes`.

**Certificados PDF** — Plantilla y emisión automática. Función: `mostrarFormularioConfiguracionCertificados`.

**Intentos de reevaluación** — Cuántas veces se puede repetir un examen. Función: `configurarIntentosReevaluacion`.

**Reglas de bonos** — Puntos extra por desempeño. Función: `configurarReglasBonosUI`.

**Caducar intentos abandonados** — Cierra los exámenes empezados y nunca terminados. Función: `caducarIntentosAbandonadosUI`.

**Migrar el banco de preguntas** — Solo si viene de una versión antigua. Función: `migrarBancoPreguntasUI`. Cambio amplio o sensible: revisar alcance antes de confirmar.

### Informes y exportaciones ocasionales

**Informe agregado de la organización** — Resultados de todo el equipo en una hoja. Función: `generarInformeAgregadoOrganizacion`.

**Expediente de una persona** — Todo lo que ha estudiado y certificado. Función: `generarExpedienteColaboradorUI`.

**Exportar el informe de tiempos a una hoja** — Vuelca a la hoja `_Informe_Tiempos` el tiempo efectivo y ocioso por mes, día, video y hueco. Función: `exportarInformeTiemposUI`. Cambio amplio o sensible: revisar alcance antes de confirmar. Pide un correo y, si se deja vacío, confirma antes de exportar a todo el padrón. La hoja se reescribe entera en cada exportación: lo que hubiera de una anterior se pierde. La misma exportación está disponible desde el informe de tiempos del portal para quien tenga permisos de administración; el capítulo 29 explica qué significa cada cifra y qué no mide.

**Informe de tiempos en PDF** — El mismo informe como documento para enviar. Función: `exportarInformeTiemposPDFUI`. Pide un correo para el informe individual y, si se deja vacío, confirma antes de emitir la tabla comparativa del mes en curso. El PDF queda en la subcarpeta `Informes_Tiempos` de la carpeta raíz de Drive, que tiene que ser privada del propietario y sin colaboradores: es la misma exigencia que para los diplomas, se comprueba antes de crear nada y, si no se cumple, no se escribe ni un borrador. No sustituye a la exportación a la hoja: la hoja se filtra y se ordena, el PDF se envía. El documento lleva dentro la fecha de emisión, el periodo que cubre y el límite de la medición.

**Copia histórica en JSON** — Una foto del catálogo con fecha, para comparar después. Función: `exportarCopiaHistoricaJSON`.

**Generar enlace público del JSON** — Publica el catálogo en una URL. Piénsalo dos veces. Función: `generarEnlacePublicoJSON`. Cambio amplio o sensible: revisar alcance antes de confirmar. Publica información fuera del control de acceso del portal. Para probarlo, use solo un catálogo de ensayo sin datos personales.

**Exportar el registro a CSV** — El historial técnico, para revisarlo fuera. Función: `exportarLogACSV`.

### Vistas y analítica

**Ir a la fila del buscador** — Salta del resultado a la fila real. Función: `saltarAFilaDesdeBuscador`.

**Limpiar los filtros** — Deja el buscador como estaba. Función: `limpiarFiltrosBuscador`.

**Estadísticas de uso** — Quién ve qué y cuánto. Función: `generarPestanaEstadisticasUso`.

**Gráfico de efectividad** — Resultados de los exámenes. Función: `crearOActualizarGraficoRendimiento`.

**Informe de la cola** — Qué queda por procesar. Función: `generarReporteColaProcesamiento`.

### Agentes y API

**Generar el esquema JSON** — Describe el catálogo para que lo lea un agente. Función: `generarSchemaJsonDrive`.

**Generar las herramientas** — Definiciones de función para un agente. Función: `generarHerramientasParaAgentes`.

**Generar el prompt de sistema** — El contexto que se le da al agente. Función: `generarPromptSistemaParaAgentes`.

**Generar el contexto MCP** — Para conectar un servidor MCP. Función: `generarContextoMCPServer`.

**Generar la guía** — Un README con todo lo anterior explicado. Función: `generarGuiaReadmeAgentes`.

**Abrir la documentación de la API** — La referencia de los endpoints. Función: `abrirDocumentacionAPI`.

**Generar el README en Drive** — Copia la documentación a una carpeta. Función: `generarReadmeDrive`.

### Nube y familia

**Importar una carpeta de Drive** — Trae los videos alojados ahí. Función: `importarCarpetaDriveUI`.

**Importar desde Dropbox** — Requiere la carpeta configurada. Función: `importarDropboxUI`.

**Importar desde OneDrive** — Requiere la carpeta configurada. Función: `importarOneDriveUI`.

**Invitar a alguien** — Genera una clave de acceso al portal. Función: `invitarMiembroFamiliaUI`. No envía correo automáticamente. Entregue acceso privado; no hay pantalla completa de listas familiares en Index 9.

### Mantenimiento

**Reprocesar la cola de fallos** — Devuelve a 🟡 Pendiente las filas aisladas. Función: `reprocesarRegistrosDLQ`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Depurar duplicados de la cola** — Colapsa las entradas repetidas. Función: `depurarDuplicadosDLQUI`.

**Reiniciar los contadores de error** — Las filas vuelven a tener tres intentos. Función: `reiniciarErroresCola`.

**Mantenimiento ahora** — Lo que hace la tarea semanal, pero ya. Función: `ejecutarMantenimientoManual`.

**Ver la cola de tareas** — Qué hay pendiente de procesar. Función: `verColaTareasUI`.

**Procesar la cola** — Vacía la cola en esta ejecución. Función: `procesarColaTareas`.

**Copia de seguridad ahora** — Una copia del libro en Drive. Función: `dispararBackupManual`.

**Ver los disparadores instalados** — Qué hay puesto, sin tocar nada. Función: `inventariarDisparadoresUI`.

**Migrar disparadores a nombres privados** — Sustituye cada uno por su nombre nuevo, de uno en uno. Función: `migrarDisparadoresUI`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Vaciar la caché** — Fuerza a releerlo todo. Función: `limpiarCacheManual`.

**Vaciar la caché de filtros** — Si el portal muestra filtros viejos. Función: `invalidarCacheFiltros`.

### Sistema y administración

**Reinicializar la estructura** — Recrea las hojas que falten. Función: `forzarInicializacionEstructura`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Reconstruir el libro desde cero** — Borra TODAS las hojas y las rehace. Copia en Drive y el catálogo vuelve. Función: `reconstruirLibroDesdeCeroUI`. Cambio amplio o sensible: revisar alcance antes de confirmar. Operación destructiva: no usar para una reparación rutinaria ni sobre resultados reales.

**Aplicar formato y validaciones** — Colores, desplegables y anchos. Función: `aplicarTodasLasConfiguraciones`.

**Aplicar validación de URLs** — Avisa al pegar algo que no es un enlace. Función: `aplicarValidacionURLs`.

**Renovar la vigencia de un token** — Extiende el vencimiento; conserva la misma clave. Para cambiarla, usa la rotación. Función: `renovarTokenUI`. Corrección de la etiqueta: extiende vigencia; no sustituye el secreto. Para cambiar la clave use rotación.

**Validar el portal** — Comprueba que responde y está bien publicado. Función: `validarPortalWebUI`.

**Crear la hoja de control móvil** — Una hoja reducida para usar desde el teléfono. Función: `crearHojaControlMovil`.

**Mostrar u ocultar el registro** — La hoja con el historial técnico. Función: `alternarVisibilidadLog`.

**Auditar las ediciones a mano** — Registra quién cambia qué en el catálogo. Función: `alternarAuditoriaEdiciones`.

**Generar la hoja de instrucciones** — Un manual dentro del propio libro. Función: `generarHojaInstrucciones`.

**Avisar de los módulos que vencen** — Crea eventos de calendario para quien no ha certificado. Función: `agendarRecordatoriosDeModulosVencidosUI`.

**Diagnóstico del sistema** — Revisa todo y escribe un informe. Función: `diagnosticoIntegralSistema`.

### Pruebas

**Pruebas unitarias** — Comprueba las funciones sueltas. Función: `ejecutarPruebasUnitarias`.

**Pruebas de integración** — Comprueba que las piezas encajan. Función: `ejecutarPruebasIntegracion`.

**Todas las pruebas** — Las dos anteriores seguidas. Función: `ejecutarTodasLasPruebas`.


## 21 Plan para ensayar todas las áreas

Este plan complementa el recorrido inicial. El grupo puede probar todas las capacidades; las funciones que necesitan proveedores, plantillas, un integrador o una migración se registran con ese requisito. No se han eliminado opciones del servidor ni se han relajado los permisos para facilitar los ensayos.

### Cómo registrar cada prueba

Para cada caso registre identificador, fecha, versión, cuenta ejecutora, rol, datos de entrada sin secretos, resultado esperado, resultado real, mensaje completo y enlace al recurso de ensayo. Use cuatro estados: correcto, fallo reproducible, bloqueado por requisito y no probado. No marque correcto un botón que solo abrió una pantalla.

Una incidencia útil dice, por ejemplo: R6, participante, catálogo, búsqueda por palabras factura, esperaba un video cuyo título contiene esa palabra, obtuvo cero, filtros activos ninguno. Para un proveedor añada el tipo de recurso y el código de error, nunca el token. Para un examen indique ID del módulo e intento, sin difundir el solucionario entre participantes.

### Catálogo e ingesta

Caso CAT 01: pegar una URL real, ejecutar fase 1 y verificar título, fuente, ID, estado y métricas disponibles. CAT 02: interrumpir una carga de ensayo y continuar desde checkpoint, comprobando que no duplica filas. CAT 03: importar una playlist pequeña y revisar cantidad y duplicados. CAT 04: usar la fila de ejemplo corregida, cancelar una vez y confirmar otra con una URL real; la cancelación no debe insertar nada.

CAT 05: probar cada filtro del portal por separado y luego combinar ecosistema, área, tema, idioma, fuente, módulo y facetas. CAT 06: cambiar entre búsqueda por palabras y por significado, conservar filtros, navegar atrás y recargar. La búsqueda por significado requiere el modelo de embeddings y el índice válidos; si están pendientes, registre el error como dependencia, no como prueba de que cualquier IA está rota. CAT 07: favoritos, notas y reanudación de video con dos participantes distintos.

### IA resúmenes clasificación y transcripciones

IA 01: con cada proveedor configurado, una sola fila no sensible y un resumen nuevo; cotejar respuesta con la fuente y consumo en la consola oficial. IA 02: lote de filas seleccionadas y esenciales, revisando que el alcance coincide con la selección. IA 03: fase 2 y fase 2 en paralelo sobre una copia reducida, comparando tiempos, errores y costo.

IA 04: editar un prompt de ensayo, revisar su carga y comprobar después una generación real. IA 05: clasificación por reglas con IA apagada, explicar la regla ganadora y probar sugerencias antes de aplicarlas. IA 06: recuperar una transcripción disponible y contrastar unos minutos con el audio; probar también una fuente sin subtítulos y registrar cómo falla. IA 07: evaluar dificultad y comprobar manualmente la justificación. IA 08: embeddings e indexación de fragmentos tras la migración técnica, verificando que todo el índice usa un modelo y dimensiones compatibles.

### Módulos evaluaciones y certificados

ACA 01: crear un módulo nuevo, asignar y reemplazar sus fuentes y revisar la lista resultante. ACA 02: generar preguntas, mantenerlas en borrador, revisar y validar solo después de cotejar fuente y respuestas. ACA 03: comprobar bloqueo por progreso, banco insuficiente, agotamiento de intentos y módulo archivado. ACA 04: responder, revisar, entregar y reabrir el resultado sin duplicar entregas.

ACA 05: guardar una respuesta, interrumpir la conexión y volver al intento; comparar lo que realmente quedó guardado. ACA 06: revisar puntuación con pesos conocidos, omisiones y refuerzo. ACA 07: documento maestro, informe de intento, expediente e informe agregado. ACA 08: certificado con datos ficticios y plantilla válida; después pruebe una carpeta compartida de ensayo y compruebe que la protección lo rechaza antes de copiar datos. ACA 09: formularios de práctica y sus respuestas, separadamente del examen nativo. ACA 10: caducar un intento abandonado de ensayo y revisar que no altera uno ya entregado.

### Accesos supervisión y privacidad

SEG 01: iniciar y cerrar sesión con cada alcance autorizado. SEG 02: dos participantes, favoritos y notas distintos; cerrar uno y abrir el otro en la misma pestaña. No debe reutilizarse el examen, las notas o la memoria de favoritos del anterior. SEG 03: el supervisor consulta todos los resultados y no obtiene Administración. SEG 04: un participante intenta consultar un resultado ajeno; el servidor debe rechazarlo.

SEG 05: renovar vigencia de un token de ensayo y comprobar que la clave no cambia. SEG 06: rotar otro token, probar el sustituto y retirar el anterior mediante el flujo previsto. SEG 07: expiración y sesión ya abierta, diferenciando nuevo inicio de sesión y revocación de una sesión existente. SEG 08: cierre con conexión y cierre sin conexión; el texto debe distinguir confirmación remota de limpieza local. SEG 09: recordar clave solo en un dispositivo privado de ensayo y borrarla mediante Cerrar sesión.

### Proveedores y avisos

EXT 01: YouTube público, privado o no disponible; distinguir los resultados. EXT 02: Vimeo sin clave y con token autorizado. EXT 03: Twitch con ambas credenciales y luego una revocada de ensayo. EXT 04: Facebook con recurso propio y permisos comprobados. EXT 05: TikTok con video de la cuenta autorizada y un video ajeno; no esperar que ambos entreguen las mismas métricas.

EXT 06: Drive, Dropbox y OneDrive, carpeta pequeña y token vigente, verificando permisos de reproducción de un participante. EXT 07: vencimiento de una credencial de prueba y reconexión. EXT 08: correo, Telegram y webhook, cada uno con un destinatario o receptor de ensayo; registrar recepción y contenido. La generación de una clave en un proveedor y la prueba de su llamada son dos pasos diferentes.

### Familia y calendario

FAM 01: invitación desde Nube y familia, correo único, rol member y vencimiento definido. Comprobar que aparece la clave y que no se presume un correo enviado. FAM 02: familia adulta recorre catálogo, módulos y notas en una copia separada del libro empresarial.

FAM 03 es una prueba técnica de las listas del servidor: crearListaFamiliar recibe token, nombre y descripción y devuelve un objeto con id y nombre. Con ese id, añadirVideoALista recibe el ID de un video ya existente. obtenerListasUsuario enumera listas y obtenerVideosDeLista devuelve su contenido. anadirVideoALista es el alias sin ñ de la misma operación. EliminarVideoDeLista y eliminarListaFamiliar se ensayan únicamente sobre la lista creada para esta prueba. Revise además relaciones huérfanas y adiciones repetidas: la implementación actual no garantiza limpieza en cascada ni unicidad de cada relación.

Estas llamadas no tienen pantalla propia ni rutas dedicadas en el puente apiPortal de Index 9. Las debe invocar el responsable técnico desde un contexto interno autorizado, con parámetros explícitos, en el proyecto de ensayo. La referencia completa muestra las firmas y la implementación. No agregue claves a archivos públicos ni transforme un rechazo de permisos en una razón para desactivar la validación.

FAM 04: crearEventoCalendarioFamilia recibe token, idLista, fechaHoraIso, duracionMin y correosInvitados separados por comas. Use una fecha futura con zona horaria explícita y primero una lista de invitados vacía. Compruebe título, inicio, fin y calendario del propietario. Una segunda prueba con invitados reales necesita destinatarios que hayan aceptado el ensayo, porque puede producir notificaciones. Index 9 no muestra un calendario familiar: el resultado se comprueba en Google Calendar y en el registro.

### Exportaciones agentes y mantenimiento

EXP 01: exporte Excel, CSV, JSON, PDF, Slides, ficha Docs y mapa Mermaid de contenido ficticio; abra cada resultado y contraste datos y caracteres. EXP 02: informe de certificaciones, registro CSV y copia histórica; compruebe que no se divulgan a participantes por compartir una carpeta. EXP 03: enlace público JSON sobre una copia sin datos personales, verificando acceso público deliberado y cómo retirarlo al terminar.

INT 01: generar esquema JSON, herramientas, prompt de sistema, contexto MCP y guías; revisar los archivos. INT 02: conectarlos a un integrador de ensayo que respete las rutas, tokens y scopes; generar documentación no equivale a tener un servidor MCP ejecutándose. INT 03: webhook ERP o agentes contra un receptor de prueba y comprobar el formato real.

MAN 01: inventario de activadores y comparación con lo esperado por cuenta. MAN 02: dashboard, respaldo y mantenimiento en sus ventanas. MAN 03: proceso nocturno IA, cola, control móvil, agentes y formularios, habilitando cada tarea cuando tenga un caso de ensayo definido. MAN 04: DLQ, reprocesamiento y contador de fallos con una URL de ensayo. MAN 05: cachés y filtros, cambiando un dato y comprobando cuándo aparece.

MAN 06: migraciones de columnas y taxonomía en una copia, comparando cantidades y datos antes y después. MAN 07: duplicados, filas inválidas, enlaces no video y contenedores; comprobar las filas exactas que se alteran. MAN 08: reconstrucción desde cero solo sobre un libro desechable cuya copia ya se recuperó. La función sigue incluida: su carácter destructivo debe formar parte del caso de prueba, no esconderse bajo una etiqueta de mantenimiento rutinario.

Las pruebas unitarias y de integración incorporadas al menú también están incluidas. Ejecútelas en el entorno de ensayo con sus dependencias preparadas y conserve el resultado completo. Un fallo puede indicar una expectativa antigua de la batería, un servicio no habilitado o un defecto real; se debe investigar, no cambiar el resultado para que parezca aprobado.

## 22 Referencia completa de funciones y rutas

Abra `Referencia_funciones.html`, en esta misma carpeta de manuales. Contiene un buscador de 732 funciones declaradas en el servidor, 154 en el HTML y 56 rutas del puente apiPortal. Puede filtrar por Servidor, Interfaz o API y buscar, por ejemplo, familia, token, TikTok, informe o resumen.

Cada entrada presenta la firma, parámetros declarados, archivo, línea, comentario inmediato disponible, guardas detectadas y referencias de código. El enlace Ver implementación completa abre la fuente con numeración de líneas. Los archivos Fuente_Servidor.html y Fuente_Interfaz.html muestran también métodos de objetos, callbacks, constantes y bloques que no son funciones de primer nivel. El script y el HTML instalables siguen completos, sin funciones recortadas.

Esta referencia técnica es una lectura estática del código, no una simulación de todas sus salidas. Un comentario heredado puede describir una intención; el manual operativo y CAMBIOS aclaran los defectos conocidos. Una función interna sin guarda directa no se presume pública: puede depender de la guarda de quien la llama. No todas las funciones se ejecutan seleccionando su nombre en el editor, porque muchas necesitan parámetros o un evento de Google.

Para una ruta apiPortal, use el nombre exacto y los campos de esquema que aparecen en su entrada. Los alcances se validan en el servidor. Una respuesta exitosa tiene ok y data; una fallida devuelve información de error. El HTML usa un token de sesión y no permite asumir otra identidad enviando un correo o scope diferente. doGet y doPost, documentados en la referencia, son entradas HTTP distintas del puente del HTML; consulte sus ramas y formatos antes de integrar otro sistema.

## 23 Actualizar la instalación existente y volver atrás

1. Conserve una copia del servidor y HTML actuales y un respaldo recuperable del libro y propiedades. Anote la versión publicada y su ID de implementación. Los originales Código 19 e Index 5 permanecen en la carpeta de trabajo como referencia anterior.
2. Abra el proyecto vinculado al libro correcto. Copie `instalacion/Codigo.gs` sobre el servidor y `instalacion/Index.html` sobre el archivo HTML llamado Index. No añada Código 24 como segundo servidor junto al anterior: duplicaría declaraciones.
3. Guarde y compruebe la sintaxis. La versión nueva del servidor es v2026.6.37-VIDEOTECA-PILOTO-R7; el pie de acceso añade Index 9. El puente expone 56 rutas —cuatro más que en el cierre de R7, las del informe de tiempos y su PDF— y no se cambiaron los alcances de las rutas anteriores.
4. En Administrar implementaciones edite la implementación activa y seleccione una nueva versión. Conserve su ID, cuenta ejecutora y permisos. Esto mantiene la URL /exec y evita modificar el retorno de TikTok sin necesidad.
5. Cierre sesiones antiguas y abra el portal actualizado. Compruebe el pie de versión, la búsqueda por palabras y la opción semántica, el cierre y una nueva entrada. Una pestaña que ya cargó el HTML anterior no se actualiza sola al publicar.
6. Ejecute los casos del grupo y registre los errores con versión y contexto. No es necesario volver a generar claves de proveedores por instalar este HTML.
7. Si aparece un fallo que impide el trabajo, edite el mismo despliegue y seleccione la versión previa documentada. Restaure también el código de trabajo anterior si debe seguir editando sobre él. Estos cambios no requieren una migración de esquema, pero una reversión de código no deshace datos que el grupo haya creado durante las pruebas.

La entrega deja los archivos listos para actualizar. No publica automáticamente esta revisión ni afirma que ya se ejecutó en Google. Su validación combina pruebas locales y navegación de una maqueta con respuestas ficticias; el ensayo del grupo comprobará además las cuentas, recursos, cuotas y permisos reales.

## 24 Correcciones de concurrencia y guardado incorporadas

La revisión R7 integra las correcciones de concurrencia y guardado introducidas en R4. La pareja actual es Código 24 e Index 9 y conserva las rutas del portal, que son 56 desde que se añadieron el informe de tiempos y su PDF. Publicar la aplicación exige seguir el capítulo 23; actualizar el manual no publica el código.

### Cola de tareas

La cola reserva un consumidor durante diez minutos con un bloqueo breve, libre durante las llamadas externas. La inserción controla duplicados simultáneos y la purga espera al consumidor. El presupuesto de cuatro minutos no garantiza la duración de una llamada externa.

Antes del efecto externo, la tarea queda EN_PROCESO y se confirma la escritura. Después se registra su resultado por fila, antes de pasar a la siguiente. No se reescribe toda la cola con una copia antigua. Si una ejecución se interrumpe y deja EN_PROCESO, esa tarea no vuelve a ejecutarse automáticamente.

Para una tarea detenida, el responsable técnico verifica ID y resultado en el proveedor y los registros. Sin consumidor activo, tras vencer la reserva y con respaldo, puede marcar COMPLETADA si ocurrió, o PENDIENTE si confirmó que no ocurrió. Si hay dudas, conserva EN_PROCESO. Esta conciliación tiene un flujo de menú en R7, explicado en el capítulo 28; no requiere editar directamente las filas.

Esta reserva no promete ejecución exactamente una vez: una API puede realizar un efecto y después devolver un error. Los fallos capturados conservan la política de reintentos. La idempotencia completa depende del proveedor y queda pendiente por tipo de tarea. Los cambios manuales de filas durante el procesamiento no quedan protegidos por el bloqueo del código.

### Validación de datos

Los campos numéricos exigen un número finito o una cadena decimal completa. Se rechazan sufijos como 12abc, Infinity, NaN y objetos. No se impone un tamaño global arbitrario a todas las operaciones. Las comprobaciones específicas de rangos, recursos y permisos siguen siendo necesarias; esto no convierte el validador en un esquema exhaustivo de seguridad.

### Respuestas del examen

Los avances viajan en orden dentro de la sesión. Guardado solo aparece cuando el servidor confirma exito verdadero y no quedan cambios posteriores. Un rechazo no se presenta como éxito. El servidor comprueba el estado del intento y escribe el avance bajo el mismo bloqueo que utiliza la entrega: un guardado posterior a una entrega no puede reabrir ni modificar el intento entregado.

El texto pendiente se recoge al avanzar de pregunta, saltar por la rejilla o abrir la revisión. Las respuestas tardías de otra sesión no actualizan la pantalla actual. Si un guardado falla o queda sin confirmar, se conservan las respuestas en memoria y se detienen nuevos avances parciales para no competir con una llamada antigua. Mantenga la pestaña abierta, recupere la conexión y entregue para enviar el conjunto de respuestas. La entrega espera la cola local; si devuelve error, conserve la pestaña y revise el mensaje.

El navegador recibe una advertencia de salida mientras haya cambios sin confirmar o una entrega en curso. Puede no mostrarla en todos los dispositivos. No hay persistencia sin conexión: cerrar la pestaña, apagar el equipo o perder la memoria del navegador puede perder lo no confirmado. La reanudación recupera únicamente lo guardado en el servidor. Dos pestañas que editan simultáneamente el mismo intento aún no tienen control de versiones por respuesta.

### Comprobaciones y alcance

Se mantienen 107 comprobaciones locales anteriores y se añaden 15 pruebas R4 de reserva, liberación, escritura por fila, purga, números completos, guardados ordenados, fallos de red y rechazo posterior a la entrega. Total 122, con servicios simulados. No acreditan llamadas reales, una auditoría completa de funciones públicas ni publicación en Google.

HMAC sigue ofreciendo integridad, no cifrado. Quedan pendientes el aislamiento externo de secretos, la medición de documentos RAG y la auditoría completa de las salidas HTML.


## 25 Correcciones de catálogo y métricas incorporadas

La revisión R5 corrigió la entrada de videos por API: la plataforma se guarda en Fuente; Ecosistema y Área quedan SIN_CLASIFICAR hasta clasificarlos. No se confunde el proveedor del enlace con una categoría temática. Esta corrección se conserva en R6. No reclasifica automáticamente filas antiguas: revise una muestra y respalde antes de modificar datos existentes.

Abrir un video desde el portal registra la actividad interna en el historial, pero ya no aumenta el contador de visualizaciones del proveedor. Son mediciones diferentes: una apertura del portal no demuestra reproducción completa ni una vista reconocida por YouTube, Vimeo o TikTok. Los informes de aprendizaje deben interpretarse con esta diferencia.

La revisión externa también propuso sustituir escapes de plantillas. No se aplicó como regla general: las plantillas de Apps Script usan escape contextual. Cambiarlo sin verificar el contexto puede causar doble escape o introducir un riesgo. Tampoco se eliminó una supuesta petición duplicada de marca, porque el flujo revisado retorna antes de ejecutar la otra rama.

## 26 Grupos de interés objetivos y usos prácticos

Videoteca está enfocada principalmente en capacitación y consulta de conocimiento para adultos. El piloto de KUVEXTA combina uso personal y familiar adulto con formación de empleados. Sirve para organizar recursos, orientar el estudio, evaluar y consultar resultados según permisos. El software no reemplaza un sistema académico acreditado ni certifica por sí mismo competencias laborales reglamentadas.

Un grupo de interés describe a quién beneficia un contenido y por qué. Un rol determina qué operaciones puede ejecutar una persona. Un área, industria o etiqueta ayuda a encontrar material. Son conceptos diferentes: escribir Familia, Ventas o KUVEXTA en una categoría no crea una barrera de privacidad entre grupos.

### Empleados y colaboradores adultos

Les sirve para encontrar instrucciones y formación relacionadas con su trabajo sin recorrer una colección desordenada de enlaces. Los usos incluyen inducción, herramientas digitales, atención al cliente, procedimientos internos y actualización de conocimientos. El responsable debe revisar vigencia, pertinencia y derechos de uso de cada recurso antes de asignarlo.

Preparación: el administrador organiza un módulo, asocia sus videos, revisa las preguntas y configura requisitos, intentos, plazo y criterio de aprobación. Entrega un acceso individual con permiso de evaluación cuando corresponda. No entrega la clave de administrador ni comparte la hoja maestra con todos los participantes.

Recorrido: la persona entra al portal, consulta Tu siguiente paso, abre el catálogo, estudia el material y consulta Módulos. Cuando cumple los requisitos presenta o retoma el examen, revisa el guardado antes de entregar y consulta sus notas. Si aparece un bloqueo por plazo o intentos, lo comunica al responsable. La actividad del portal no prueba por sí sola atención continua al video.

Resultado esperado: recursos organizados, avance registrado y un resultado individual de evaluación. Administrador y supervisores autorizados consultan los resultados conforme a sus permisos; cada participante consulta los propios. La generación de certificados requiere además plantilla y carpeta privada configuradas.

### Supervisores y responsables de formación

Les sirve para acompañar a las personas y detectar necesidades de repaso. Pueden usar los resultados para planear acompañamiento, revisar quién necesita completar un módulo y comprobar la evolución de una capacitación. Una calificación aislada debe interpretarse junto con la calidad del banco y el contexto de la persona.

Preparación: el administrador crea un acceso de supervisor y comprueba la pantalla Resultados con una sesión separada. El supervisor consulta resultados autorizados, contrasta módulos y da seguimiento. Cambiar claves de proveedores, administrar accesos o modificar la estructura de la instalación corresponde al administrador, según las operaciones disponibles.

En este piloto, los supervisores autorizados pueden ver todos los resultados. No se debe ofrecer supervisión limitada automáticamente a un departamento o familia: esa separación no se deduce de una etiqueta. Si se necesita aislamiento entre empresas o familias, conviene utilizar instalaciones separadas hasta implementar y verificar una regla de permisos específica.

### Administradores y curadores del catálogo

Les sirve para mantener una biblioteca compartida, reducir duplicados y organizar contenidos que antes estaban dispersos. Pueden incorporar enlaces, revisar metadatos, clasificar videos, mantener módulos, configurar proveedores, administrar accesos y resolver incidencias.

El recorrido recomendado comienza con respaldo y revisión de una muestra. Después se incorporan recursos, se comprueba su Fuente, se asignan categorías y se valida su reproducción. Se prepara el módulo y se ensaya con una cuenta de participante y otra de supervisor. Las herramientas que solicitan confirmación o muestran resultados se ejecutan desde el menú de la hoja cuando así lo requiere la aplicación.

La IA puede proponer clasificaciones o preguntas si el proveedor está configurado; la persona responsable revisa las propuestas antes de usarlas. El mantenimiento de colas y registros no sustituye un respaldo recuperable. Los archivos del banco y solucionario son material administrativo.

### Personas que aprenden por su cuenta

Les sirve para mantener una biblioteca personal con temas, enlaces y rutas de estudio. Los usos incluyen productividad, hojas de cálculo, comunicación, idiomas y actualización profesional. El catálogo y la búsqueda por palabras permiten trabajar sin IA.

Caso: una persona reúne cinco videos de hojas de cálculo, verifica enlaces y fuentes y los organiza en un módulo de práctica. Consulta el catálogo, toma notas por sus propios medios y presenta una evaluación si el administrador preparó el banco. Puede repetir el recorrido según los intentos permitidos. La autoevaluación orienta el estudio y no equivale a una acreditación externa.

### Familias compuestas por participantes adultos

Les sirve para compartir aprendizaje de interés común sin mezclar contraseñas ni resultados individuales. Los temas pueden ser organización digital, uso de videollamadas, prevención de fraudes o manejo básico de herramientas de oficina. El alcance acordado para este piloto excluye menores.

Preparación: el administrador crea un acceso individual por adulto y un módulo con material adecuado al grupo. El código incluye funciones relacionadas con familia, pero esta entrega no incorpora una pantalla familiar completa de listas o calendario. Las funciones de familia se ensayan según la referencia técnica y sus requisitos; no deben presentarse como botones que ya existen en el HTML.

Caso práctico: tres adultos acuerdan aprender a reconocer mensajes fraudulentos. El administrador selecciona tres videos, revisa sus fuentes y prepara preguntas con ejemplos ficticios, sin datos bancarios reales. Cada adulto entra con su propio acceso, estudia y presenta la evaluación. Consulta sus notas y repasa los puntos fallados. El administrador o supervisor autorizado acompaña al grupo sin divulgar resultados a los demás participantes.

Si familia y empresa usan la misma instalación, el administrador y los supervisores autorizados conservan el alcance global de resultados previsto. Para evitar esa mezcla se recomienda una copia independiente para la familia, con sus propios accesos, datos, propiedades y recursos privados; cambiar solo el nombre del grupo no basta.

### Formadores y facilitadores de grupos adultos

Les sirve para organizar talleres, preparación previa y refuerzo posterior. Pueden utilizar el catálogo como material de apoyo y los módulos como una secuencia de aprendizaje. La evaluación necesita preguntas revisadas y un criterio claro de aprobación.

Caso: antes de un taller de herramientas digitales, el formador asigna un módulo corto. Los asistentes estudian; durante el taller practican una tarea real con datos ficticios; después presentan el examen. El formador revisa los resultados con el rol autorizado y ajusta la siguiente sesión. Un certificado interno, cuando se configura, identifica la actividad realizada; no debe describirse como un título oficial.

### Cómo indicar el público y la utilidad de cada módulo

Use la descripción o el texto de presentación disponible para dejar explícitos público, necesidad, resultado y requisitos. No se añadió una nueva columna obligatoria ni se alteró el esquema de 32 columnas. Si desea filtrar por un grupo, utilice únicamente campos existentes cuyo significado encaje, sin sobrescribir Fuente, Área o Industria para simular permisos.

Ejemplo de presentación: Herramientas digitales e inteligencia artificial para colaboradores adultos de KUVEXTA que elaboran comunicaciones y organizan información. Al finalizar podrán preparar instrucciones claras, verificar una respuesta y evitar introducir información confidencial en servicios externos. Requisitos: manejo básico del navegador y acceso individual. Modalidad inicial sin IA; la práctica con un proveedor se activa cuando el administrador configura y prueba la conexión.

Para cada módulo registre además quién revisó el contenido, cuándo se revisó y cómo se comprobará el aprendizaje en el procedimiento de trabajo del administrador. No se afirma que existan campos automáticos para todos estos datos: pueden documentarse en las instrucciones del módulo o en el registro de revisión que utilice el equipo.

### Qué cambia al activar IA

Sin IA se puede consultar el catálogo, buscar por palabras, usar filtros, estudiar, presentar evaluaciones con banco preparado y consultar resultados según permisos. La conexión con proveedores de video tiene requisitos propios y no equivale a activar IA.

Con proveedor y modelo configurados pueden ensayarse las funciones de clasificación, generación o revisión de contenido y otras herramientas descritas en los capítulos 7 y 20. La búsqueda por significado exige además un índice de embeddings compatible; pegar una clave no crea automáticamente ese índice. Las respuestas propuestas requieren revisión humana. Los costos y cuotas dependen del proveedor y del uso real.

Para comparar ambos modos con el grupo, elija un mismo conjunto pequeño de videos. Primero búsquelos por palabras y clasifíquelos manualmente. Después pruebe la función de IA configurada, revise resultados, registre tiempos, errores y utilidad. No introduzca datos personales o internos que el equipo no tenga autorizado enviar al proveedor.

## 27 Mejoras del portal y verificación de la revisión R6

Los ajustes introducidos en R6 se conservan en Código 24 e Index 9. En aquel momento eran 679 funciones del servidor, 138 identificadas en la interfaz y 52 acciones de apiPortal; la revisión del capítulo 29 dejó 705 y 138 sin tocar las 52 acciones, y la medición del tiempo de visionado con su informe en PDF las llevó a 732 y 154 con 56 acciones. Las referencias completas se regeneran desde estos archivos; el inventario incluye funciones internas, no solo botones visibles.

Los dos despachadores del panel resuelven la función autorizada mediante globalThis después de comprobar contexto y lista blanca. Ya no dependen del valor de this. Esta mejora no permite llamar cualquier función desde el navegador ni convierte la lista blanca en una auditoría completa de seguridad.

El rótulo Idioma se incluye en los valores de marca del servidor y en el formulario de identidad del administrador. Al guardarlo y recargar el portal debe conservarse. Cambiar ese rótulo no traduce los videos ni toda la aplicación.

Inicio consulta el siguiente paso y los avisos por separado. Muestra una acción principal y conserva los avisos secundarios. Si falla una consulta, mantiene la otra cuando está disponible; si fallan ambas, informa que no pudo comprobar los pendientes. No presenta un fallo de conexión como si todo estuviera completo. Los módulos sin una recomendación automática no se anuncian falsamente como aprobados.

Al saltar directamente entre preguntas mediante la rejilla, el portal recoge primero el texto escrito y cancela el temporizador pendiente del campo anterior. Las confirmaciones de guardado se muestran en la pregunta correspondiente. Se mantienen la cola de guardado, la verificación de éxito y las medidas frente a respuestas tardías de otra sesión.

En R6 se aprobaron 139 comprobaciones locales con servicios simulados: 129 regresiones previas y 10 nuevas para despacho, permisos, marca, navegación de preguntas y orientación de Inicio. No equivalen a una auditoría integral ni acreditan llamadas reales a cada proveedor. La publicación de esta versión en Apps Script sigue pendiente de realizarse mediante el capítulo 23.

Prueba de aceptación tras actualizar: confirme versión R7 e Index 9; entre como participante y revise Inicio; escriba una respuesta y salte por la rejilla; vuelva y compruebe el contenido; entregue un intento de ensayo y consulte su resultado. Después entre como administrador, cambie Idioma en Identidad, guarde y recargue. Compruebe con supervisor la consulta autorizada y con participante el acceso únicamente a sus resultados. Registre cualquier diferencia con versión, rol, pasos y mensaje, sin claves ni solucionarios.


## 28 Revisión operativa de exámenes certificados cola y paneles

La revisión R7 corresponde a Código 24 e Index 9. Integra las correcciones previas, conserva las acciones de apiPortal anteriores —hoy 56, con las cuatro del informe de tiempos— y mantiene las funciones existentes. La referencia regenerada contiene 732 funciones de servidor y 154 de interfaz, ya con la revisión y la medición del capítulo 29. Las pruebas locales suman 321 comprobaciones con servicios simulados. Esta entrega no publica el código en Apps Script ni sustituye el ensayo de las cuentas y recursos reales.

### Inicio del examen y reloj

Iniciar un intento ahora toma el mismo bloqueo de script que protege guardado y entrega. La lectura de intentos anteriores y la escritura de uno nuevo ocurren dentro del bloqueo; se confirma la escritura antes de liberarlo, incluso al salir por una excepción. Una llamada que no obtiene el bloqueo informa que el sistema está ocupado. Al volver a intentarlo, debe reanudar el intento abierto y no crear otro por una carrera entre solicitudes.

No se reparan ni borran automáticamente intentos duplicados creados con versiones anteriores. Si encuentra dos abiertos para la misma persona y módulo, revise su actividad y respuestas antes de decidir qué hacer; no elimine filas para simular una corrección.

El servidor devuelve inicioMs, servidorAhoraMs y vigenciaMs tanto al iniciar como al reanudar. El portal utiliza la diferencia entre las horas del servidor para mostrar el tiempo transcurrido, de modo que reanudar no vuelve el reloj a cero. Un desfase fijo del reloj del equipo no se interpreta como tiempo consumido. La visualización sigue siendo orientativa: la latencia o cambiar el reloj durante la sesión pueden introducir diferencias. La entrega valida el vencimiento en el servidor.

### Certificados bloqueados por la privacidad de la carpeta

Se conserva la política de carpeta raíz y carpeta Certificados privadas, del propietario ejecutor y sin lectores ni editores adicionales. Que una carpeta compartida sea habitual no la hace compatible con esta política; no se relajan los permisos para conseguir que salga el diploma.

El incumplimiento comprobado recibe el código CERT_DESTINO_PRIVADO y se trata como un error permanente de configuración. La emisión inicial no lo reencola; registra una advertencia de bloqueo y el panel de administración muestra que los certificados están detenidos. El mismo bloqueo no genera una nueva línea de aviso por cada alumno. Un error al consultar Drive, en cambio, no demuestra que la carpeta incumpla la política y sigue la vía de reintentos.

Si una tarea de certificado ya estaba en la cola, ese error permanente la deja AGOTADA en el primer fallo, sin esperar a consumir todos los reintentos. El estado conserva el error para revisión. Corregir las carpetas no reemite automáticamente los certificados pendientes ni recupera los de aprobaciones anteriores: hay que identificar los resultados sin certificado y comprobar si el archivo o el envío ya existen antes de emitir de nuevo. Las emisiones inicialmente bloqueadas no crean una tarea de cola; el resultado académico conserva su valor aunque no exista diploma.

Al volver a emitir con ambos destinos válidos, se retira el aviso de bloqueo. Un PDF creado no acredita por sí solo que el correo llegó; consulte los registros y confirme la recepción en el ensayo. Esta revisión no incorpora garantía de envío exactamente una vez.

### Revisar una tarea retenida o agotada

EN_PROCESO forma parte del vocabulario de estados. El panel cuenta las tareas en proceso o retenidas y muestra una advertencia. Ver la cola de tareas incluye sus identificadores y detalles. Un proceso activo también puede aparecer con ese estado: el contador no afirma por sí solo que todas estén atascadas.

La reserva del consumidor dura diez minutos. Su vencimiento permite revisar, pero no vuelve una tarea a PENDIENTE automáticamente: una interrupción puede haber ocurrido después de enviar un correo o crear un archivo y antes de registrar el resultado. Repetirla por tiempo transcurrido podría duplicar el efecto.

1. Abra Ver la cola de tareas, localice el ID y revise tipo, estado, mensaje, hora y recurso correspondiente. Consulte el archivo, destinatario o sistema externo para conocer el resultado real.
2. Espere a que el consumidor termine o venza la reserva. Desde el menú de la hoja elija Revisar tarea retenida o agotada. Introduzca el ID exacto.
3. Escriba COMPLETADA si verificó que el efecto ya ocurrió; CANCELADA si decide detener la tarea; o PENDIENTE únicamente si verificó que no ocurrió y corrigió la causa. Si no puede determinarlo, cancele el diálogo y mantenga la tarea retenida.
4. Confirme la decisión. Las preguntas se hacen antes de tomar el bloqueo; el servidor vuelve a comprobar el estado y exige exclusividad con el consumidor antes de modificar la fila.
5. Si quedó PENDIENTE, se reinicia el contador de intentos y queda disponible desde ese momento. Ejecute Procesar la cola desde el menú o el flujo del panel descrito abajo. Compruebe después el estado final y el efecto real.

La revisión modifica una fila por ID, conserva su tipo y payload y registra la decisión. Rechaza tareas ya resueltas, IDs inexistentes y estados arbitrarios. No cambie manualmente EN_PROCESO en bloque ni borre la reserva para forzar una ejecución concurrente.

### Acciones de los paneles y diagnóstico de identidad

La revisión no presupone que obtener SpreadsheetApp.getUi implique que todos los diálogos se puedan abrir correctamente desde una llamada del panel. Tampoco atribuye el resultado histórico de cero disparadores al cambio de this: aquel cambio era una mejora del despacho, no una explicación de la identidad ejecutora.

El flujo de Configuración y Herramientas avanzadas cambia: seleccione la acción en el panel, lea el mensaje que confirma que todavía no se ejecutó, cierre el panel y elija Videoteca → Ejecutar acción elegida en el panel. La selección se guarda para esa cuenta durante quince minutos; seleccionar otra acción reemplaza la anterior. El menú consume la selección y vuelve a comprobar la lista de acciones permitidas. Si caducó o ya se consumió, seleccione de nuevo. Al ejecutar desde el menú aparecen allí las solicitudes de texto, confirmaciones y resultados de la función original.

Tras instalar R7, recargue la hoja para renovar el menú y cierre los paneles abiertos con la versión anterior. No interprete Acción seleccionada como Completada. Esta ruta también se aplica a Insertar una fila de ejemplo, que pide una URL, y a la configuración de claves. Las funciones permanecen disponibles; no se desactivaron para el piloto.

La excepción es Ver los disparadores instalados: desde el panel devuelve directamente a la página la cuenta efectiva, cuenta activa si Google la expone, ID del proyecto, cantidad y funciones de los disparadores visibles para esa cuenta. Un cero significa cero en ese contexto, no ausencia universal de activadores. Compare cuenta y proyecto antes de reinstalar nada. El resultado no depende de alertarUsuario para mostrarse en el cliente. No se ha verificado todavía este diagnóstico con las cuentas reales del usuario.

Los avisos y preguntas nativos conservan su comportamiento para menú y ejecuciones sin interfaz; R7 evita usarlos como transporte de respuestas del panel. La documentación de Google distingue diálogos que suspenden el servidor de los diálogos HTML, que requieren llamadas asíncronas: https://developers.google.com/apps-script/reference/base/ui . Por ello las preguntas de recuperación se hacen antes de adquirir la reserva y el bloqueo.

### Supervisores y futuras migraciones de TikTok

Un token supervisor permite consultar el historial de resultados del conjunto, incluidos nombres, correos, evaluaciones y notas. Sin un filtro por correo, devuelve resultados del conjunto por páginas. El filtro facilita la búsqueda y no restringe por sí mismo el permiso del token. Entregue estos accesos solo a supervisores autorizados, revise su vigencia y rótelos cuando cambie el responsable. Cada participante conserva la consulta de sus propios resultados.

validarRetornoTikTok_ conserva el formato admitido en esta instalación: https://script.google.com/macros/s/ID/exec, sin parámetros. Esta revisión no amplía esa validación ni cambia el retorno existente. Si migra a Workspace y Google entrega una URL con /a/macros/dominio/s/ID/exec, habrá que adaptar y probar la validación con la URL real y registrarla exactamente en TikTok. No es necesario cambiarla solo por pertenecer a Workspace. Referencia del retorno OAuth: https://developers.tiktok.com/docs/en/login-kit-web .

### Ensayo específico antes de ampliar el grupo

Pruebe dos solicitudes casi simultáneas de inicio con una identidad de ensayo y compruebe una sola fila EN_CURSO. Reanude y compruebe el reloj y respuestas. Ensaye una carpeta de certificados compartida únicamente con datos ficticios: debe bloquear sin generar reintentos continuos. En una copia de prueba prepare una tarea retenida cuyo efecto conozca, revise el contador y complete la recuperación por ID. Finalmente seleccione una acción interactiva, compruebe que no se ejecuta desde el panel y ejecútela desde el menú. Registre resultado, versión, rol y evidencia; las 321 pruebas locales no sustituyen estos recorridos reales.

## 29 Revisión de código posterior al cierre de R7 y medición del tiempo de visionado

Cerrada la revisión R7 se hizo una auditoría estática del archivo entregado: lectura del árbol de sintaxis, comparación de los dos diccionarios de idioma, cruce entre lo que pide el portal y lo que expone el servidor, y búsqueda de funciones declaradas sin ninguna llamada. El resultado no fueron errores que impidieran ejecutar el script —la sintaxis era válida y las pruebas pasaban—, sino nueve defectos de otro tipo: funciones que el encabezado anunciaba y que nadie invocaba, y afirmaciones que el sistema hacía sobre sí mismo y habían dejado de ser ciertas.

Las correcciones se aplicaron sobre Código 24 e Index 9, sin tocar las 52 rutas del portal de entonces, los esquemas de hoja ni la jerarquía de alcances. Las pruebas siguen aprobando —y son veintiocho más, las del formulario de credenciales del panel, las de la frontera de confianza las de las transcripciones y las del plan de módulos, hasta 219—, el acta de validación se volvió a generar y la referencia de funciones se regeneró con los nuevos totales. La medición del tiempo de visionado, descrita al final de este capítulo, añadió después cuatro rutas, dos hojas y ciento dos pruebas más, hasta 321.

### Lo que el sistema prometía y no cumplía

**El control antifuerza bruta del login era código muerto.** Existían las tres funciones que contaban fallos, aplicaban un retardo creciente y bloqueaban a los cinco intentos, pero desde que se retiró el acceso por contraseña compartida ninguna se llamaba: el contador nunca subía, de modo que jamás bloqueaba. Mientras tanto, la página de documentación de la API que genera el propio script seguía informando de que cinco fallos bloqueaban quince minutos.

Recuperar el bloqueo tal cual no era posible ni deseable. La única entrada es ahora el canje de clave personal, donde no hay identidad a la que contarle los fallos: quien prueba mil claves envía mil claves distintas y el correo ya no viaja en la petición. Un contador común habría dejado el portal cerrado para todos en cuanto alguien fallara cinco veces, que es una forma cómoda de tumbar el servicio desde fuera. La solución fue encarecer cada intento en lugar de prohibirlo: cada canje rechazado retrasa al siguiente, de 250 milisegundos hasta cinco segundos, con memoria de quince minutos. Un barrido pasa de miles de pruebas por hora a unas pocas por minuto; un canje correcto no espera nada. La página de la API y el encabezado del código describen exactamente ese comportamiento, y el capítulo 17 explica qué ve el administrador cuando alguien se equivoca repetidamente.

**El idioma por persona no se activaba nunca.** El sistema guarda una preferencia de idioma por correo y tiene una función para escribir un bloque en el idioma de un destinatario concreto, pensada para el caso real: un disparador nocturno que avisa a diez personas corre en una sola ejecución y sin eso las diez reciben el idioma del libro. Esa función no tenía una sola llamada. Ahora el puente del portal responde en el idioma de quien pregunta, y el diploma, el plan de refuerzo, el mensaje pedagógico, el informe en PDF y el aviso al tutor se escriben en el de su destinatario. Lo que sigue en español son los rótulos fijos de la pantalla y el texto que redacta un modelo de IA, porque el prompt está escrito en español.

**La regla `HOJAS_CONFIDENCIALES` era una lista que nadie consultaba.** Declaraba las tres hojas que no deben exponerse por ningún endpoint —claves de examen, datos privados y tokens de invitación— y ninguna función la miraba. Hoy ninguna ruta del portal acepta el nombre de una hoja, así que no había agujero; la guarda se escribió igualmente y se aplica en el único lector genérico que recibe ese nombre por parámetro, para que la regla viva en el código y no en un comentario.

### Calificación de las respuestas escritas

Las preguntas de completar se calificaban comparando el texto tal cual, salvando solo las mayúsculas y los espacios de los extremos. Una tilde, un espacio doble o un guion contaban como error en un examen que decide una certificación. Ahora se comparan sin acentos, sin signos y con los espacios juntos, con la misma normalización que ya usaba la búsqueda del catálogo, y una pregunta cuya respuesta esperada quedó vacía nunca se da por acertada.

Sigue siendo una comparación de palabras, no de significado: un sinónimo o una abreviatura se califican como error. El cambio es más indulgente que la versión anterior, de modo que un intento calificado antes de esta revisión y otro posterior no son estrictamente comparables; adviértalo si presenta series de resultados.

### Funciones que existían sin forma de ejecutarlas

El envío por WhatsApp y el evento de Google Analytics 4 estaban escritos y sin conectar. Ambos cuelgan ahora del concentrador de eventos del sistema y ambos salen solos si no hay nada configurado: WhatsApp necesita el webhook de avisos y un número en `ALERTAS_WHATSAPP_TELEFONO`; GA4 necesita identificador de medición y secreto de API. El capítulo 9 detalla las dos configuraciones y advierte del volumen de mensajes que puede generar un webhook conectado a todos los eventos. Ninguno se ha probado contra un proveedor real.

El panel de Herramientas avanzadas incorpora tres acciones que antes solo podían lanzarse abriendo el editor de Apps Script: rellenar la columna «Recursos / Enlaces» del catálogo ya cargado, regenerar el vector de la fila activa y reescribir su resumen ejecutivo. Están descritas en el capítulo 20 con sus dependencias.

Al generar el banco de preguntas de un módulo, las preguntas que el modelo devuelve sin segundo citado se intentan ubicar en la transcripción guardada, buscando el dato más literal de la pregunta. Es un mejor esfuerzo y no siempre acierta: el contador «sin segundo citado» de la revisión del banco sigue informando de las que quedaron sin ubicar. De eso depende que el informe de auditoría pueda llevar al minuto exacto del fallo en lugar de al principio del video.

### La frontera de confianza estaba a medio cerrar

Una auditoría externa señaló siete funciones que cualquiera podía invocar desde la consola del navegador. Al medirlo sobre el árbol de sintaxis, eran muchas más.

Conviene entender el mecanismo antes que la lista. En Apps Script, `google.script.run` alcanza **toda** función global cuyo nombre no termine en guion bajo; no hace falta más que abrir la dirección `/exec` del portal, que está publicada para cualquiera porque los participantes entran con clave personal y no con cuenta de Google. La defensa del proyecto es `exigirOrigenInterno()`, que deja pasar la llamada cuando viene del menú de la hoja —hay interfaz— o de una entrada que ya se declaró legítima: `doGet`, `doPost`, `apiPortal` y los disparadores marcan su origen en la primera línea. Donde falta esa guarda no hay nada.

De las 705 funciones que el archivo tenía entonces, 635 eran alcanzables así y 165 de ellas no tenían guarda y hacían algo. Cuarenta y una actuaban directamente en su propio cuerpo. Las más graves no estaban en la lista de la auditoría: `llamarGeminiGenerativo`, `llamarOpenAIAPI`, `llamarClaudeAPI` y `llamarOllamaLocal` reciben el texto del llamador, de modo que el script era un proveedor de inteligencia artificial gratuito facturado al propietario del libro; `obtenerTokenTwitch` devolvía el token de aplicación a quien lo pidiera; los nueve `obtenerMetadatos*` y `resolverEnlaceCortoTikTok` hacían peticiones salientes desde las direcciones de Google; `crearFormularioParaVideo` creaba formularios en el Drive del propietario. Y las que sí señalaba: borrar los disparadores de mantenimiento, copia de seguridad y cola dejaba la automatización apagada en silencio.

Se añadió la guarda a las 41 que actúan directamente, y `obtenerCatalogoPublico` —que devolvía el catálogo entero sin token, porque el token solo servía para añadir el progreso a cada tarjeta— ahora exige credencial de lectura. Tras el cambio no queda ninguna función alcanzable con efecto directo sin guarda, y las que conservan efecto indirecto lo alcanzan a través de una que sí la tiene. Siete pruebas nuevas lo comprueban leyendo el archivo entregado, de modo que la regresión se detecta sola: si mañana alguien añade una función que borre disparadores o llame a un proveedor de pago sin guarda, la prueba falla.

Nada de esto cambia el comportamiento legítimo. El portal, la API REST, los menús y los disparadores pasan por entradas que declaran su origen, y las 321 pruebas lo confirman.

**Medida inmediata, antes que cualquier actualización de código:** revise en Implementar → Administrar implementaciones quién tiene acceso a la aplicación web. Si está como «Cualquier usuario, incluso anónimo», todo lo anterior era alcanzable desde internet. Restringir el acceso es la mitigación más rápida que existe y no depende de instalar nada.

### «Transcribir los esenciales» no guardaba ninguna

El lote de transcripciones terminaba diciendo que ningún video tenía subtítulos. No era cierto: el fallo estaba en cómo se recortaba la respuesta de YouTube.

La página del video trae la lista de pistas de subtítulos dentro de un bloque de datos, y el código la recortaba con una expresión regular que se detiene en el primer corchete de cierre. Cada pista incluye uno anidado —el nombre del idioma viaja como `"name":{"runs":[{"text":"Español"}]}`—, así que el recorte salía partido por la mitad, la lectura del JSON fallaba, y el video se contaba como «sin subtítulos» aunque los publicara. El resultado era el mismo para todo el catálogo, y no había nada en el aviso que permitiera distinguirlo de un catálogo realmente mudo.

Ahora el recorte cuenta corchetes en lugar de confiar en un patrón, saltando los que aparezcan dentro de un texto entrecomillado, de modo que sobrevive a que YouTube añada campos anidados. Quince pruebas nuevas cubren esta parte con la forma real de esa respuesta, e incluyen una que comprueba que el patrón anterior sí encontraba algo pero ese algo no era JSON válido: era exactamente el modo de fallar que no dejaba rastro.

Queda una causa que el arreglo no puede tocar. Esta extracción lee la página pública de YouTube, y esa petición sale desde una dirección de Google que comparten muchísimos proyectos de Apps Script. Cuando YouTube responde **HTTP 429** está diciendo que esa dirección pidió demasiado en poco tiempo: no habla de tus videos ni de tu instalación. Reintentar en el momento alarga el bloqueo. Por eso el lote ahora se **detiene en el primer 429** en lugar de gastar las veinte plazas recibiendo el mismo rechazo, deja un reintento en la cola de tareas —que espera cada vez más: media hora, una, dos, cuatro— y lo dice con todas sus letras, incluida la advertencia de que volver a pulsar el botón empeora la situación. La pausa entre videos subió de 0,8 a 2,5 segundos, que no garantiza nada pero reduce las probabilidades de llegar al límite. Si el 429 aparece al transcribir una fila suelta, el aviso lo distingue con un reloj de arena en vez de una cruz, porque no hay nada que arreglar: hay que esperar.

Se corrigió también a quién mira el lote y en qué orden. La etiqueta decía «Lote sobre los marcados ⭐» y no era verdad: recorría el catálogo entero en dos rondas, la de los esenciales y la de todo lo demás junto. Ahora son tres, por orden de utilidad —⭐ Esencial / Referencia, 🟢 Estudiado / Aplicado y el resto—, y lo ⚪ Descartado no entra en ninguna: alguien decidió que ese video no cuenta, y gastar en él red y tope de la pasada es quitárselo a los otros. Como cada pasada procesa veinte videos, ese orden decide qué se transcribe hoy y qué espera. La etiqueta y el rótulo del menú dicen ahora lo que la función hace.

Se separó además lo que antes se confundía. Un video sin subtítulos y una extracción fallida se contaban juntos; ahora el informe dice cuántas guardó, cuántas no tenían y cuántas fallaron, y si fallaron todas explica el motivo de la última y advierte de que eso apunta a que YouTube no está sirviendo la página a este proyecto, no a que los videos no tengan subtítulos. Conviene saberlo porque esa extracción depende de leer la página pública: si Google responde con una pantalla de consentimiento o de verificación, no hay nada que el script pueda hacer, y el registro ahora lo dice con esas palabras.

### El rodeo por el menú quedó para las pocas que preguntan

El primer arreglo llevó las credenciales al propio panel, pero todo lo demás seguía dando el rodeo: elegir la acción, cerrar el panel, abrir el menú. Con ciento treinta y dos acciones en los dos paneles, eso es lo que hacía el panel más incómodo que el menú viejo que vino a sustituir.

Al medirlo, la razón del rodeo solo alcanzaba a una parte. Setenta y una de las ciento treinta y dos acciones no preguntan nada: hacen su trabajo y al final tienen algo que contar. Lo único que necesitaban era que ese «algo que contar» viajara de vuelta al panel en lugar de intentar abrir un cuadro de aviso que, dentro de un diálogo, no se abre. Los dos avisos del sistema recogen ahora su texto cuando la acción corre lanzada desde un panel, y el panel lo muestra al terminar.

Las sesenta y una restantes sí abren un cuadro de preguntas —piden una fila, un identificador, una confirmación— y esas siguen eligiéndose para el menú. El botón lo dice de antemano: «Ejecutar» hace la acción ahí mismo, «Elegir» la deja preparada para el menú, y en el panel de herramientas la línea de ayuda añade «pregunta algo: se ejecuta desde el menú».

La lista de cuáles son no se mantiene a mano. Una prueba la recalcula desde el código siguiendo las llamadas de cada acción, y falla en las dos direcciones: si alguien añade una pregunta a una acción que hoy se ejecuta en el panel —que dejaría el panel esperando un cuadro que nunca aparece— y también si se la quita y la lista sigue mandando al usuario al menú sin motivo. Por si la lista se quedara corta de todas formas, el servidor tiene una última red: cuando una acción lanzada desde el panel pide algo, se corta ahí y se responde con la ruta del menú en vez de contestar por el usuario con un valor por defecto.

### Poner una clave dejó de ser un rodeo

Desde R7 ninguna fila del panel ejecutaba: elegía una acción para que la lanzara el menú. Para pegar un token eso significaba pulsar el botón, leer un aviso, cerrar el panel, abrir el menú y solo entonces encontrar el cuadro donde escribir. Y había una trampa silenciosa: como solo se guarda la última selección, quien pulsaba Vimeo y después TikTok perdía la primera sin que nada se lo dijera.

El rodeo existe por una limitación real —Apps Script no abre un diálogo encima de otro—, pero solo afecta a las acciones que **preguntan**. Pegar una clave no pregunta nada: necesita un campo, y el campo cabe en el propio panel. Ahora las filas de credenciales y URL despliegan su formulario debajo de la fila, se guardan con un botón y la fila cambia de estado sin salir de la pantalla. Las acciones con asistente siguen pasando por el menú, y el panel avisa en amarillo mientras haya una selección pendiente, con su nombre y los minutos que le quedan.

El formulario nace vacío porque el valor guardado no viaja al cliente: el panel no sirve para leer una clave ya puesta. Un campo vacío se ignora en lugar de borrar lo anterior, que era el accidente fácil, y guardar sin escribir nada se rechaza. Las URL se validan antes de escribirse —https para los webhooks, http o https para Ollama, que vive en la red local— y cambiar las credenciales de Twitch o TikTok invalida el token que el sistema tuviera cacheado de ese proveedor. Diez pruebas nuevas cubren este camino, incluidas las que comprueban que un nombre fuera de la lista blanca no escribe nada y que el valor guardado no aparece en la respuesta.

### Los paneles decían lo que ya no hacían

Desde R7 los paneles no ejecutan: eligen una acción para que la lance el menú. El texto del pie no se había actualizado. El de Configuración seguía prometiendo que «cada botón abre el mismo asistente que antes estaba en el menú» y el de Herramientas que «cada botón ejecuta la misma acción», justo encima de un aviso que responde «no se ha ejecutado». Quien lee el pie antes de pulsar concluye que el sistema falló. Ambos pies explican ahora los dos pasos, que la selección vence en quince minutos y que solo se guarda la última.

En el panel de Herramientas el botón decía «Ejecutar» y no ejecutaba; ahora dice «Elegir». La excepción es «Ver los disparadores instalados», que sí responde en el sitio porque devuelve datos y no abre ningún diálogo: ese botón dice «Ver ahora».

El aviso de selección mostraba el nombre interno de la función —«Acción seleccionada: configurarVimeoKey»— a quien acababa de pulsar un botón rotulado «Vimeo». Ahora dice el rótulo de la fila, buscándolo en las mismas tablas que pintan los paneles para no mantener una segunda lista de nombres; el nombre técnico queda en el registro de actividad, que es donde sirve.

En Tareas automáticas el botón decía «Configurar», igual que en las filas donde se pega una clave, cuando lo que hace es instalar un disparador en el proyecto. Cada fila puede declarar ahora dos verbos, el de cuando falta y el de cuando ya está puesto: esas ocho filas dicen «Instalar» y «Reinstalar», el interruptor de IA dice «Encender» y «Apagar», la conexión de TikTok «Conectar» y «Reconectar», y «TikTok: completar lo ya cargado», que recorre el catálogo, dice «Ejecutar».

Por último, el botón que se acaba de usar podía quedarse apagado. Al pulsar se deshabilita y se confiaba en que el repintado posterior creara botones nuevos; pero el fallo de ese repintado se ignora a propósito, así que cuando no llegaba, el botón quedaba gris hasta cerrar y reabrir el panel. Ahora se rehabilita explícitamente al terminar la acción.

### Limpieza y detalles del portal

Se eliminaron siete claves del diccionario inglés que estaban escritas en español y quedaban tapadas por su versión correcta; dos palabras repetidas en la lista de términos que no distinguen nada; y dos lecturas en la apertura del libro cuyo resultado no usaba nadie, una de las cuales descifraba la clave de Gemini en cada apertura. El interruptor de auditoría de ediciones se lee ahora en un solo sitio.

En Index 9, el reproductor de Vimeo recibía un argumento que su función no declara: la reanudación viaja por la dirección del marco y no cambió. Se retiró una pantalla de relleno que ya no usaba ninguna ruta. Se añadió un aviso para quien tenga JavaScript desactivado —el portal se dibuja entero en el navegador y antes quedaba en blanco sin explicación, que es indistinguible de un servicio caído— y el color de la barra del navegador móvil sigue ahora al tema claro u oscuro.

### Tres detalles del portal que sí eran defectos

Una tercera revisión externa del portal señaló nueve puntos. Tres eran ciertos y quedaron corregidos.

**El color de la marca se colaba en el modo oscuro.** Se aplicaba con un estilo en línea sobre la raíz del documento, y un estilo en línea gana a cualquier selector: el color elegido pensando en fondo blanco se usaba también sobre fondo casi negro, donde la paleta tiene un acento aclarado a propósito. Ahora se inyecta como regla con los mismos selectores del tema, así que en oscuro manda la paleta y en claro manda la marca. El valor se valida antes de entrar en la hoja de estilos, porque lo escribe quien administra y un valor con llaves podría cerrar la regla y abrir otra.

**Saltar de un video a otro perdía hasta quince segundos de avance.** Abrir un video cierra el anterior en modo silencioso, y ese modo no guarda; el guardado automático va por ciclos de quince segundos. Ahora se fuerza el guardado antes de cerrar.

**Si el apunte del video no cargaba, el campo quedaba bloqueado sin salida.** Se veía el error y no se podía ni leer el apunte ni escribir otro. El campo sigue bloqueado a propósito —habilitarlo invitaría a escribir encima de un apunte que sigue en el servidor y que aquí no se pudo leer, y el guardado lo reemplazaría— pero ahora hay un botón para reintentar la carga.

De los otros seis, dos ya estaban resueltos —el token en el historial se corrigió y documentó en esta misma revisión, y el número de rutas del portal lo comprueba una prueba en cada cierre—, dos son decisiones de diseño con su motivo escrito en el código, y uno estaba al revés: cuando el catálogo tiene cero videos, decir «el catálogo está vacío» es más útil que «ningún video coincide con estos filtros», que mandaría a tocar filtros cuando el problema es que no hay nada cargado.

### «Ver el contenido» no abría, y el motivo llevaba tiempo ahí

Dentro de una tarjeta de módulo, el botón que despliega la lista de videos no hacía nada. La causa no estaba en el botón: el oyente de clics de la pantalla de Módulos se instalaba **en cada carga de la vista**, sobre un contenedor que no se destruye entre cargas —solo se le reemplaza el contenido—. A la segunda visita había dos oyentes, y el mismo clic se atendía dos veces: abría el desplegable y lo volvía a cerrar en el mismo gesto. Con tres oyentes funcionaba otra vez, y con cuatro no. Un fallo que aparece y desaparece según cuántas veces hayas entrado es de los más difíciles de reportar, porque quien lo sufre no encuentra la manera de repetirlo.

El filtro por ecosistema lo dejó a la vista de inmediato, porque cada chip repinta la pantalla y añadía un oyente más. Ahora el oyente se pone una sola vez y lee el mapa de módulos del último repintado, en lugar de quedarse con el de la primera carga. Se añadió además una guarda para que un clic sobre un módulo desconocido no lance una excepción dentro del oyente: una excepción ahí deja la pantalla quieta y sin mensaje, que es exactamente lo que se ve desde fuera.

Una revisión de todo el portal buscando el mismo patrón encontró otros dos sitios con oyentes sobre contenedores, pero ambos son correctos: esos elementos se vuelven a crear en cada repintado, así que el oyente se va con el elemento viejo.

### Mis Módulos se filtra por ecosistema

Con dos catálogos de formación conviviendo en el mismo portal, la pantalla de Módulos obligaba a leer la lista entera para encontrar lo propio. Ahora hay una fila de filtros arriba, uno por ecosistema, con el número de módulos de cada uno y un «Todos» para quitarlo.

El ecosistema de un módulo **no se guarda en ninguna columna**: se deduce de los videos que lo componen. Un módulo es sus fuentes, así que si todas viven en el ecosistema de Odoo, el módulo es de Odoo sin que nadie tenga que escribirlo otra vez. Guardarlo aparte habría creado un segundo sitio donde la verdad envejece: se reasigna un video y la etiqueta del módulo sigue diciendo lo de antes. El cálculo no cuesta una lectura extra porque el índice del catálogo, que ya se recorre una vez por ejecución, trae ahora también esa columna.

Un módulo con videos de varios ecosistemas devuelve todos, ordenados por cuántos videos aporta cada uno, y se agrupa por el primero. Eso es deliberado: una mezcla suele ser una señal de que la asignación no quedó fina, y esconderla tras un único valor la haría invisible. La fila de filtros solo aparece cuando hay más de un ecosistema; con uno solo, un filtro que no filtra nada es ruido.

El filtro viaja en la dirección —`#/modulos?eco=...`—, de modo que el botón de atrás lo deshace, recargar no lo pierde y el enlace se puede pasar a otra persona.

### Un plan de módulos se pega, no se transcribe

Montar un plan de capacitación exigía responder cinco preguntas por módulo y después seleccionar a mano, en un catálogo de miles de filas, los videos de cada uno. Para veinticuatro módulos y cuatrocientas asignaciones eso no es configurar: es transcribir, y transcribir a mano es donde se pierden las asignaciones sin que nadie se entere.

**Módulos Certificables → Importar plan de módulos** acepta la tabla tal como venga: CSV o Markdown, con las dos partes —la definición de los módulos y la lista de asignaciones— en el mismo pegado si se tienen. Cada bloque se reconoce por su línea de cabecera, así que da igual el orden.

Comprobar no toca nada y deja el veredicto de cada línea en la hoja `_Importacion_Plan`: qué módulos son nuevos y qué campos cambiarían en los que ya existen, qué identificadores no están en el catálogo, cuáles vienen repetidos en el propio archivo, cuáles ya pertenecen a otro módulo y cuáles rechaza el catálogo por no ser certificables. Aplicar escribe los módulos, sus fuentes y la columna de módulo del catálogo, y termina invalidando la caché, que es lo que hacía que el portal siguiera mostrando los filtros de módulo viejos durante horas.

Tres decisiones del diseño merecen estar escritas, porque son deliberadas. **No da de alta videos que falten**: un identificador mal tecleado crearía una fila basura en el catálogo, y dar de alta es otra operación. **No mueve un video que ya pertenezca a otro módulo**: lo lista y espera, porque el catálogo guarda un solo módulo por video y moverlo en silencio vacía el módulo anterior sin avisar. **No ajusta el tamaño de ningún examen**: si las fuentes reparten menos preguntas de las que pide el examen, ese módulo no se aplica y los demás sí, con el motivo escrito en el informe. Repartir de más no bloquea nada, porque el banco puede ser mayor que el examen.

Por dentro hay una decisión que importa en un catálogo grande: las asignaciones se escriben en **un solo recorrido** del catálogo. Etiquetar módulo a módulo serían veinticuatro recorridos de una hoja de miles de filas, que es la forma de agotar los seis minutos de ejecución a media faena. Y volver a importar el mismo archivo deja exactamente el mismo resultado, de modo que corregir el CSV y relanzarlo es el flujo normal, no una reparación.

### Segunda auditoría, esta vez del portal

Una revisión externa de Index 9 señaló tres defectos críticos. Comprobados contra el archivo, ninguno de los tres se sostiene, y conviene dejar dicho por qué para que nadie los vuelva a «arreglar».

El primero sostenía que el crédito del pie, inyectado por la plantilla del servidor, permitía romper el bloque de código o inyectar marcado. No es así: la etiqueta de impresión contextual de Apps Script escapa el valor a entidades HTML, y el navegador no descodifica entidades dentro de un bloque de código, de modo que un `</script>` escrito en el pie llega como texto inerte. Lo que sí había era un defecto de presentación: un pie con comillas se leía en pantalla como `Di &quot;hola&quot;`. Ahora el servidor envía ese texto como literal de JavaScript ya construido, con los caracteres peligrosos escapados, y el pie se lee como se escribió.

El segundo describía que la pantalla de Inicio conservaba un marcador de «ya montada» al cambiar de sesión y quedaba en blanco. Esa pantalla no usa ningún marcador: su estructura es fija en el marcado y solo se vacía su contenido. El mecanismo descrito no existe en el archivo.

El tercero afirmaba que el control de «sin guardar» del examen es un único booleano que se apaga antes de tiempo cuando hay varias respuestas en vuelo. Los guardados no van en paralelo: se encadenan en una cola de promesas, de manera que solo la última respuesta encolada —que es también la última en ejecutarse— apaga el aviso. Es justamente lo que comprueban dos de las pruebas de regresión de R4.

Sí eran ciertos dos hallazgos menores, y quedaron corregidos. Si la carga del reproductor de YouTube o de Vimeo fallaba una vez —un corte de red de un segundo—, la promesa rechazada quedaba en memoria y todos los videos siguientes caían al modo manual hasta recargar la página; ahora el fallo suelta esa memoria y el siguiente intento vuelve a pedirlo de verdad.

Y una advertencia operativa que estaba mal documentada: el portal intenta borrar el token de la dirección después de canjearlo, pero ese código corre dentro del recuadro de Apps Script, cuya dirección no es la de la barra del navegador. **El enlace de acceso con el token sigue en el historial de quien lo abrió**, aunque el token ya esté canjeado. Quitarlo de verdad exige una pantalla intermedia en el servidor; mientras tanto, la instrucción a los participantes es no reenviar su enlace de acceso a nadie.

### Cuánto tiempo ha dedicado cada persona

Hasta aquí el sistema sabía **dónde** se había quedado cada persona en cada video y no **cuánto** había tardado en llegar. La hoja de progreso guarda un solo estado por persona y video —el último segundo alcanzado—, de modo que quien llegó al minuto veinte viéndolo veinte minutos y quien llegó arrastrando la barra dos segundos son, para el sistema anterior, exactamente la misma fila. Cuando alguien tiene que justificar horas de formación, esa es justo la pregunta que no se podía responder.

La medición vive en una hoja nueva, `_Sesiones_Video`, y la unidad que guarda no es la señal sino el **tramo**: un periodo continuo de visionado. El portal manda una señal cada quince segundos mientras un video reproduce, así que una fila por señal serían casi cuatro mil filas por persona y jornada y la hoja dejaría de poder abrirse en un mes. La fila se actualiza mientras la señal siga llegando y se considera cerrada cuando deja de llegar; no hay ningún proceso que cierre tramos, porque un proceso así habría que instalarlo, vigilarlo y explicarlo para no ganar nada que no diga ya el reloj.

Cada señal se reparte entre tres cifras distintas, y conviene entender las tres porque el informe las muestra juntas a propósito. El **tiempo efectivo** suma, de cada intervalo entre dos señales, el menor de dos números: lo que avanzó la posición del video y lo que avanzó el reloj. Tomar el menor es lo único que impide que arrastrar la barra sume tiempo: mover la barra media hora hacia delante gana mil ochocientos segundos de posición en los quince que tarda en llegar la señal siguiente, y sin ese mínimo esa media hora entraría como media hora vista. La **pausa** suma el reloj cuando la posición no se movió, que es el video detenido o la pestaña que el navegador congeló al pasar a otra cosa: tiempo delante del portal sin ver nada. Y la **posición ganada** suma el avance entero, sin acotar, precisamente para poder compararla con el efectivo: un video con tres mil segundos de posición y mil doscientos de tiempo efectivo está contando un salto de barra, y esa comparación es la que lo dice.

Un retroceso se cuenta como tiempo efectivo acotado por el reloj y no como pausa. Repasar un trozo que no se entendió es estudiar, y contarlo como tiempo ocioso castigaría exactamente la conducta que interesa; lo que no vuelve a sumar es posición ganada, porque esa ya se cobró la primera vez.

El informe se abre desde la tarjeta de una persona en la pestaña Actividad y desde el listado por persona de la pestaña Panel, y lo ven administración y supervisión. La cabecera dice el tiempo efectivo desde el inicio, cuántos videos distintos ha tocado y cuánto tiempo ha pasado en exámenes. Debajo, un bloque por mes natural: el mes en curso desplegado y los anteriores plegados, porque a un informe de tiempos se entra por «qué va de este mes» y lo de marzo es una consulta distinta que no tiene por qué ocupar la pantalla. Dentro de cada mes está el desglose por video —efectivo, posición ganada, número de tramos y última vez—, el desglose por día del mes y la lista de huecos.

El corte mensual es por mes natural, del día uno. Es el periodo en el que se cierran las nóminas y se justifican las horas, y cualquier otra ventana obligaría a explicar de dónde sale cada vez que alguien mire el informe.

Un **hueco** es un parón de más de cinco minutos entre dos cosas del mismo día, y los exámenes cuentan como una de esas cosas: si alguien estuvo examinándose entre dos videos no estaba ausente, y el informe no abre hueco ahí. Los huecos de un día para otro no se listan, porque un parón de las seis de la tarde a las nueve de la mañana no es tiempo ocioso —es haberse ido a casa— y listarlo llenaría el informe de un ruido que taparía los huecos de verdad.

Los tres umbrales se ajustan en el panel de Configuración, en la sección «Tiempo de visionado», y funcionan con valores de fábrica sin configurar nada: dos minutos de silencio cierran un tramo, cinco minutos de parón se destacan como hueco y sesenta minutos de pausa acumulada en un día disparan un aviso automático. El corte son dos minutos y no menos porque la señal llega cada quince segundos: por debajo de eso, un navegador que congela una pestaña de fondo un rato partiría el tramo cada pocas señales y el informe contaría veinte tramos donde hubo uno.

El aviso automático sale por el mismo concentrador de eventos que el resto de las alertas del sistema, de modo que llega por webhook, Telegram, correo y analítica según lo que esté configurado, y no llega a ninguna parte si no hay nada configurado. Avisa como mucho una vez por persona y día: sin ese tope, un reproductor olvidado abierto toda la tarde dispararía un aviso cada quince segundos por cada canal, y el aviso dejaría de leerse el primer día. Lo que dispara el aviso es la **pausa** acumulada, no los huecos. Un rato sin señal es una ausencia, y avisar por eso sería avisar por no estar; la pausa es otra cosa, el reproductor abierto con la película quieta, que es lo que se parece a dejarlo puesto. Poner el umbral en cero apaga el aviso.

La pestaña Actividad dice además quién está conectado ahora y desde cuándo. El «desde cuándo» sale del inicio del tramo abierto, que es la única hora de la que consta que la persona estaba delante; y el «ahora» significa que su última señal llegó hace menos que el umbral de corte. No es presencia garantizada, y por eso la tarjeta muestra la hora en vez de un adjetivo: Apps Script no tiene conexión permanente y nunca va a poder afirmar más que eso. En esa misma tarjeta el título del video enlaza a **su plataforma, en una pestaña nueva**, no al reproductor del portal. Abrir el reproductor desde ahí haría que el sistema registrara avance y tiempo a nombre de quien supervisa, y ensuciaría sus propios datos por el solo hecho de mirar los de otra persona.

Para comparar a varias personas hay una tabla con el efectivo y el ocioso del mes, una fila por persona, ordenada por tiempo efectivo; cada fila abre el informe completo de esa persona. Y el informe se puede volcar a la hoja `_Informe_Tiempos`, que se reescribe entera en cada exportación igual que `_Importacion_Plan`: dos exportaciones apiladas serían dos verdades sobre el mismo mes. Cada fila lleva una columna que dice si es el total de un mes, el de un día, el de un video o un hueco. Desde el portal la exportación es cosa de administración, aunque el informe en pantalla lo pueda leer también quien supervisa: leer no es escribir en el libro. Desde el menú de la hoja está en Herramientas avanzadas, en el grupo de informes y exportaciones ocasionales.

### El mismo informe como documento para enviar

La hoja y el PDF no compiten y por eso están los dos. La hoja se filtra, se ordena y se cruza con otras cifras, y eso no se puede hacer sobre un documento; el PDF se envía a alguien, y a nadie se le manda un libro de cálculo entero para justificar unas horas. Los dos salen del mismo cálculo, de modo que no pueden contradecirse: si la hoja dice cincuenta y cinco minutos, el PDF dice cincuenta y cinco minutos.

El documento se produce por la misma vía que el informe de auditoría de un examen: se construye un Google Doc, se exporta a PDF y el documento intermedio se tira, incluso cuando la emisión falla a mitad de camino, porque un borrador con nombres y correos no puede quedarse suelto en Drive. El proyecto ya tenía dos formas de producir documentos —la plantilla de diapositivas para el diploma y el documento para los informes largos con tablas variables— y este es un informe largo con tablas variables, así que no se ha inventado una tercera.

El PDF queda en la subcarpeta **`Informes_Tiempos`** de la carpeta raíz de Drive, y esa carpeta tiene que cumplir **la misma exigencia que los certificados**: ser privada del propietario del libro, sin editores ni lectores añadidos. La comprobación se hace sobre la raíz y sobre la subcarpeta, y se hace **antes de crear nada**: si alguna de las dos no cumple, no se escribe ni el documento temporal y el aviso dice exactamente qué revisar. La razón es la misma que con los diplomas, y aquí pesa más: un diploma dice que alguien aprobó, mientras que un informe de tiempos lleva nombre, correo y una descripción de la conducta de una persona a lo largo de meses. Un documento así en una carpeta compartida es peor que una nota publicada.

Se piden dos: con un correo sale el informe individual —los mismos totales, meses, desglose por video, desglose por día y huecos que la ventana emergente—, y sin correo sale la tabla comparativa del mes con una fila por persona. En la pantalla del informe hay ahora dos botones juntos, «Exportar a la hoja» y «Descargar en PDF», los dos solo para administración; en el menú de la hoja son dos entradas seguidas de Herramientas avanzadas. Emitir un PDF tarda unos segundos, así que el botón se apaga y lo dice mientras trabaja: sin eso, quien no ve respuesta vuelve a pulsar y acaba con tres documentos idénticos en Drive. El enlace al PDF se ofrece para pulsarlo en vez de abrirse solo, porque un navegador bloquea las ventanas que abre por su cuenta un recuadro de Apps Script.

Hay una diferencia deliberada con la pantalla: **en el PDF todos los meses van completos**. En pantalla los meses anteriores se pliegan para no tapar el mes en curso, pero en un papel no hay nada que desplegar, y plegar un mes equivaldría a quitarlo del documento. El mes en curso va primero y rotulado como tal, con un salto de página antes de cada mes anterior, que es el equivalente honesto de aquel comportamiento.

Y el documento dice de sí mismo todo lo que hace falta para no leerlo fuera de contexto: la fecha de emisión y el periodo que cubre están en la primera tabla, antes de cualquier cifra, y la advertencia sobre lo que la medición recoge y lo que no aparece dos veces, arriba y al pie, porque un PDF se reenvía y no siempre se lee entero. Si la persona no tiene tiempo registrado se emite igualmente el documento diciéndolo, en lugar de negarse: negarse dejaría a quien lo pidió sin saber si falló la emisión o simplemente no hay datos.

A los participantes no se les dice nada de esto por defecto. Hay un interruptor en el panel de Configuración, apagado de fábrica, que cuando se enciende hace que el reproductor del portal avise de que se registra el tiempo de reproducción. El aviso se pone pegado a la barra de avance y no en una pantalla de preferencias, porque es donde alguien está mirando cuánto lleva visto; decidir si se informa o no es de quien administra, que es quien conoce lo que tiene que comunicar a su equipo, y el sistema no puede tomar esa decisión por él en ningún sentido.

Conviene ser claro sobre los límites, porque estas cifras se usan para hablar con personas. **Esto mide lo que ocurre dentro del portal y nada más.** Quien abra el mismo video en YouTube, en otra pestaña, aparecerá en el informe como un hueco y no como tiempo dedicado, y de las plataformas que no publican el segundo actual —las que en el reproductor piden confirmar a mano que se vio— no hay nada que medir. Comparar dos personas con esta tabla solo es justo si las dos estudian dentro del portal. La medición tampoco distingue mirar de entender: un tramo con la posición avanzando es un video reproduciéndose, no necesariamente alguien delante. Y **empieza de cero el día en que se instala**: no se reconstruye historial desde la hoja de progreso, porque ese dato nunca contuvo tiempo y cualquier cifra deducida de él sería inventada.

### Qué comprobar en el ensayo

Reproduzca un video en el portal durante dos o tres minutos con una identidad de ensayo y compruebe que en `_Sesiones_Video` aparece **una** fila que va creciendo, no una por señal. Arrastre después la barra hasta el final y confirme que la posición ganada sube mucho y el tiempo efectivo apenas unos segundos. Ponga el video en pausa unos minutos sin cerrar el reproductor y compruebe que crece la columna de pausa y no la de efectivo. Cierre el reproductor, espere más de dos minutos y vuelva a reproducir: debe abrirse una fila nueva y la anterior quedarse como estaba. Abra luego el informe de esa persona desde la pestaña Actividad y contraste lo que dice con lo que acaba de hacer; es la única forma de verificar la medición, porque las pruebas locales simulan la hoja y el reloj.

Para el PDF, empiece por lo que tiene que fallar: comparta con cualquier otra cuenta la carpeta raíz de Drive o la subcarpeta `Informes_Tiempos` y pulse «Descargar en PDF». Debe negarse con un aviso que nombre las dos carpetas, y en Drive no debe aparecer ningún documento nuevo, ni PDF ni borrador. Quite después ese permiso y repítalo: ahora debe emitir, y el documento tiene que abrirse desde el enlace que aparece en la pantalla. Compruebe en el propio PDF la fecha de emisión, el periodo, la advertencia sobre lo que no se mide y que los meses anteriores están completos y no resumidos. Emita también la comparativa dejando el correo vacío, y confirme que la hoja `_Informe_Tiempos` sigue funcionando por su lado: las dos cifras tienen que coincidir.

Pegue una clave de ensayo desde el panel: pulse Configurar en Vimeo, compruebe que el campo se abre debajo de la fila, guarde y confirme que la fila queda en ✅ sin cerrar el panel. Pruebe después a guardar con el campo vacío: debe rechazarlo y no borrar lo anterior. Elija una acción con asistente, pulse otra fila y compruebe que el aviso amarillo refleja siempre la última.

Abra los dos paneles y lea el pie antes de pulsar: debe distinguir las filas que se guardan ahí mismo de las que se ejecutan desde el menú. Elija una acción cualquiera, compruebe que el aviso la nombra como la fila y no con el nombre de la función, y ejecútela desde el menú. En Tareas automáticas confirme que los botones dicen Instalar o Reinstalar según el estado de cada disparador.

Entre con una clave equivocada tres o cuatro veces seguidas y confirme que la respuesta tarda cada vez más sin llegar a bloquear, y que a continuación la clave correcta entra sin espera. Guarde inglés como idioma de una identidad de ensayo y compruebe el idioma de un aviso del portal y de un correo dirigido a esa persona. Califique una pregunta de completar respondiendo con tilde y sin ella, y con un espacio de más. Si va a usar WhatsApp o GA4, conéctelos primero a un receptor de ensayo y mida cuántos mensajes genera un día normal antes de apuntarlos al canal definitivo. Ninguna de estas comprobaciones está cubierta por las pruebas locales, que simulan los servicios y no envían nada.
