# Videoteca BD Manual de instalación y uso para el piloto

Edición del 16 de septiembre de 2026. Dirigido a Andrés Alberto Suárez Carmona, administrador de Videoteca, y a los supervisores autorizados de Kuvexta. Uso personal, familiar adulto y capacitación de empleados.

Este manual cubre todas las áreas del sistema, sus funciones y cómo preparar los ensayos del grupo. Incluye una propuesta inicial de tres a cinco adultos; no limita las funciones que el grupo puede evaluar. Explica el trabajo del administrador en Google Sheets y el de los participantes en el portal. El paquete contiene Código 23 e Index 8, revisados localmente en esta entrega a partir del servidor y HTML publicados anteriormente. No instala nada ni cambia el sistema en producción al abrirlo.

El grupo puede recorrer todas las funciones siguiendo sus requisitos. El catálogo, los módulos y los resultados pueden ensayarse sin generar contenido nuevo con IA. La búsqueda semántica necesita migrar el modelo de embeddings, Ollama requiere conectividad segura y las listas familiares tienen APIs de servidor pero no pantalla propia. El manual indica cómo distinguir una función lista para usar, una prueba técnica y un requisito pendiente, sin retirar opciones del código.

Los grupos de interés, su propósito y los usos concretos se explican en el capítulo 26. Esta revisión unifica las mejoras de catálogo, métricas, guardado y orientación del portal en el mismo manual.

## 1 Qué contiene esta entrega

En `instalacion/Codigo.gs` está la copia exacta de `Codigo_23_Orientacion_Portal.gs`. En `instalacion/Index.html` está la copia exacta de `Index_8_Orientacion_Portal.html`. La versión interna es `v2026.6.37-VIDEOTECA-PILOTO-R6`. Los nombres cortos son los que deben tener los archivos dentro del editor de Apps Script. No se deben mezclar con el antiguo Codigo.gs o Index.html de otras carpetas.

El registro del 13 de septiembre documenta la publicación anterior de Código 19 e Index 5 como versión 8 de Google. Código 23 e Index 8 son una revisión nueva, probada localmente y todavía no publicada por esta entrega. El informe VALIDACION distingue regresiones simuladas y comprobaciones de interfaz de una prueba real en producción.

La carpeta `ejemplo_administrador` contiene el módulo de instrucciones para IA, su revisión y un banco de preguntas para una instalación de ensayo. Incluye respuestas: es material del administrador, no debe entregarse antes del examen a los participantes. La guía breve de participantes sí se puede compartir con ellos. El manifiesto de archivos permite comprobar que el código no cambió durante el empaquetado.

No se incluyen credenciales, claves de participantes, propiedades de producción, copias con datos personales ni contraseñas del respaldo. Este paquete es una distribución de software y documentación; no reemplaza el respaldo completo de la instalación real.

### Correcciones que ya incorpora

La serie entregada incorpora el ajuste del retorno OAuth de TikTok, diagnósticos para revisar esa conexión, el rol de supervisor y la separación de resultados por identidad. El HTML incluye la pantalla Resultados para administradores y supervisores. El último servidor impide generar certificados en una carpeta compartida y retiró la publicación automática de certificados mediante enlace público.

La aprobación de las ocho preguntas del primer módulo fue un cambio de datos posterior al respaldo portable. Index 8 añade correcciones de interfaz y sesión, sin cambiar ese banco. También hubo una rotación posterior del acceso de Albert. Restaurar un respaldo anterior no reproduce automáticamente estos dos cambios. Este manual no contiene esa clave.

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

En Configuración compruebe IA desactivada para la primera carga, idioma y zona horaria. Aplique formato y validación de URLs si hace falta. Mantenga las credenciales de proveedores opcionales vacías hasta necesitarlas. Pegue una URL real en la columna de enlaces o use Insertar una fila de ejemplo. En Código 23 esta acción solicita una URL HTTPS real, crea las 32 columnas con sus índices correctos y deja el video pendiente de procesar, sin inventar métricas.

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

**Avisos.** Permite configurar un webhook o canales como correo y Telegram, y enviar una prueba. Una confirmación visual no sustituye verificar la recepción. La prueba previa recibió el evento prueba_de_canal. No envíe datos personales en una prueba de conectividad. Un webhook genérico necesita un receptor que entienda su formato.

**Inteligencia artificial.** Contiene interruptor, claves de Gemini, OpenAI y Claude, ajustes de Ollama y elección de proveedor/modelo. La acción ahora se titula Revisar prompts (sin llamada a IA). Llama a `probarPrompts`: muestra los textos configurados, no acredita que el proveedor aceptó la clave. La prueba real es una operación pequeña que devuelve contenido y queda reflejada en el proveedor.

**Plataformas de video.** Vimeo, Twitch, Facebook y TikTok son opcionales según el catálogo. Conectar una cuenta no concede acceso a todos los videos de la plataforma. En Código 23, el indicador de Twitch comprueba Client ID y Client Secret por separado y exige ambos. Aun así, tener los dos campos no acredita cuota o respuesta válida del proveedor.

**Tareas automáticas.** Refrescar panel actualiza el dashboard; respaldo semanal copia el libro; mantenimiento revisa tareas de conservación; proceso nocturno de IA puede consumir APIs; procesar cola ejecuta pendientes; control móvil atiende la hoja de control; agentes exporta datos para una integración; formularios instala manejadores de sus respuestas. Active solo lo que tenga una finalidad definida y compruebe el propietario de cada activador.

**Portal y sistema.** Incluye accesos, rotación, carpeta raíz, medición e integraciones. La contraseña compartida antigua está retirada. Renovar la vigencia de un token extiende su vencimiento y conserva la misma clave. Código 23 corrige esa etiqueta; no equivale a rotar el secreto. La rotación necesita el flujo correspondiente y una comprobación del nuevo acceso antes de retirar el antiguo.

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

**Agentes, ERP y MCP.** Las herramientas generan esquema, contexto y documentación para integradores. Generar esos archivos no despliega un servidor MCP ni pone un ERP a funcionar. Para ensayarlas, use un receptor de prueba y revise permisos antes de publicar JSON.

**GA4.** Se configura desde https://analytics.google.com/ con una propiedad y flujo web, si se decide medir uso. El identificador de medición no es un token de acceso al portal. Revise la implementación y las obligaciones de información antes de habilitar medición; no envíe claves ni respuestas de evaluaciones como datos analíticos.

## 10 Manual del portal para participantes

### Entrar y salir

Abra la dirección `/exec` que entrega el administrador, preferiblemente desde un marcador. Introduzca la clave personal en el formulario de acceso. Index 8 oculta sus caracteres y deja Recordar desactivado inicialmente. Actívelo únicamente en un dispositivo privado. Los enlaces de invitación no guardan automáticamente la clave de forma permanente. No la comparta: el sistema atribuye las acciones a su identidad. Si no la encuentra o venció, solicite al administrador un acceso nuevo o renovación según corresponda; no utilice el de un compañero.

Espere a que sus apuntes indiquen Guardado. Al terminar use Cerrar sesión, especialmente en un equipo compartido. Index 8 limpia el estado local y distingue si el servidor confirmó el cierre o si no pudo verificarlo. Cerrar una pestaña no debe asumirse equivalente. Si cambió de usuario, cierre la sesión anterior antes de ingresar la nueva clave.

### Inicio y Catálogo

Inicio muestra Tu siguiente paso con una acción recomendada y Otros avisos como información secundaria. Si no puede consultar los pendientes, lo comunica; no significa que haya terminado el trabajo. Consulte el capítulo 27 para las mejoras de esta pantalla. En Index 8, Catálogo permite elegir Por palabras sin IA o Por significado con IA e índice. El primer modo es el inicial y admite el texto en la ruta de catálogo; el segundo llama expresamente a la búsqueda semántica y requiere al menos tres caracteres. Todos los filtros se conservan al cambiar de modo. Abra la ficha, compruebe título y fuente y reproduzca el material. Algunos videos se abren en el proveedor original; su acceso depende también de esa plataforma. Un enlace roto se reporta como incidencia en lugar de marcarlo visto.

Los favoritos y las notas sirven para regresar al material. Una nota personal no modifica el título oficial ni la respuesta correcta del examen. Si un resumen existe, úselo como apoyo; no sustituye estudiar la fuente ni convierte automáticamente una afirmación del video en un hecho comprobado.

### Módulos y progreso

Abra Módulos y elija el asignado para la prueba. Revise las fuentes, el número de preguntas y los intentos disponibles. Un contenido se considera completado cuando se registra al menos el 95 % de su duración. En fuentes externas puede aparecer Confirmar que lo vi completo: úselo solo después de estudiar el material. Es una declaración de progreso, no una verificación independiente de atención.

El umbral de módulo se calcula sobre la cantidad de videos completados y se redondea hacia arriba. Con un video y umbral 80 % hace falta completar ese único video. Con cinco fuentes al 80 % hacen falta cuatro. Tener 80 % de segundos de un video no significa necesariamente que el módulo lo cuente como completado.

### Presentar una evaluación

El examen se habilita cuando cumple el contenido requerido y existe un banco suficiente de preguntas validadas. Lea las instrucciones y el límite de intentos. Abra la evaluación, responda cada pregunta y utilice las opciones de revisión que muestre la pantalla. Si se permite dejar respuestas en blanco, no significa que obtengan puntos.

Antes de entregar compruebe omisiones. Confirme una sola vez y espere la respuesta. Si hay un fallo de conexión, consulte el estado del intento antes de iniciar otro; repetir clics no es una reparación. No use el acceso del administrador para presentar la prueba de un participante.

### Notas y refuerzo

Consulte sus resultados, el informe del intento y las recomendaciones de repaso. En la clasificación base, 90 % o más corresponde a Experto; desde 80 % a Competente con brechas; desde 60 % a Aprobado con reservas, sin certificación; por debajo no se certifica. El banco y los pesos determinan el cálculo efectivo. El administrador debe explicar los criterios antes de evaluar.

Una calificación que cumple el criterio no garantiza que ya exista un diploma PDF. La emisión requiere la plantilla y las carpetas configuradas. Las señales denominadas anti IA o forenses no prueban por sí solas fraude ni deben producir una sanción automática.

### Preferencias y problemas

En el menú personal se encuentran Mis notas y refuerzos, Preferencias y Cerrar sesión. El tema de pantalla puede ser claro, oscuro o automático. Elegir un canal de contacto no implica que el servidor ya esté configurado para enviarlo. Reporte al administrador el módulo, la hora y el mensaje de error; no envíe capturas de su clave.

## 11 Portal del supervisor y del administrador

**Supervisor.** En Resultados puede consultar los intentos entregados del conjunto autorizado por el diseño actual. Hay paginación y búsqueda por correo; utilice el correo exacto normalizado cuando quiera una persona concreta. Esta vista no entrega al supervisor la edición general del sistema. No incluye enlaces públicos a certificados ni las claves de participantes.

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

Los adultos de la familia pueden usar acceso personal, catálogo, módulos, notas, progreso y evaluaciones del mismo portal. El servidor también contiene invitaciones, listas y eventos familiares, pero Index 8 todavía no ofrece una pantalla completa de listas familiares o calendario familiar. Cambiar APP_MODE a family no crea esa interfaz.

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

**El panel no responde o muestra cero activadores.** Revise cuenta efectiva, ejecución y log. En los ensayos el aislamiento a una sola cuenta resolvió el contexto del panel; la hipótesis inicial de que todos los diálogos fallaban permanentemente no quedó como diagnóstico final. Cero activadores de una cuenta no demuestra que no existan en otra.

**Clave de participante perdida.** El administrador comprueba la identidad y gestiona el acceso. No se pide la clave a otro participante ni se publica en la hoja. Renovar vencimiento y rotar secreto son operaciones diferentes.

**Examen bloqueado.** Revise número de contenidos completos, redondeo del umbral, estado del módulo, preguntas validadas e intentos disponibles. En el ejemplo de una fuente hace falta verla completa. No reduzca requisitos solo para ocultar un error de registro.

**IA devuelve error.** Revise clave, cuota, facturación, modelo disponible y compatibilidad del adaptador. Revisar prompts del panel no es una llamada real. Si falla Claude con el nombre antiguo o embeddings con text-embedding-004, cambiar la clave no corrige un modelo retirado.

**Faltan métricas.** Revise permisos del proveedor y propiedad del contenido. La vista previa en Sheets y la API usan vías distintas. No rellene una duración inventada para conseguir progreso o certificado.

**Certificado no sale.** Revise plantilla, marcadores, carpeta raíz y subcarpeta privadas, propietario efectivo y registro. La protección de privacidad puede estar bloqueando correctamente una carpeta compartida.

**Aparecen filtros viejos.** Invalide la caché de filtros después de comprobar los datos. Vaciar una caché no repara credenciales ni migra columnas. Use la herramienta concreta, no reconstrucción total.

**Hay fallos repetidos en la cola.** Corrija la causa de una fila, luego reprocese. Reiniciar contadores sin resolver URL o permisos solo repite fallos y consumo.

## 18 Referencia técnica de archivos y datos

El servidor centraliza validación de origen, permisos, acceso a Sheets, llamadas externas y publicación de respuestas. El HTML es la interfaz; los datos y secretos no deben depender de esconder controles en la pantalla. Las rutas de Inicio, Catálogo, Módulos, Notas, Resultados, Administración, Preferencias, Examen e Informe tienen funciones distintas; no hay una pantalla por cada función del servidor.

El catálogo actual utiliza 32 columnas. No pegue una plantilla vieja de 25 columnas sobre sus encabezados. Las migraciones sirven para esquemas anteriores y deben realizarse con respaldo y simulación cuando la herramienta la ofrece. Las hojas auxiliares se crean mediante la estructura del sistema; no se deben renombrar a gusto porque el código las busca por nombre.

`_Config_IA` conserva selección de proveedor y modelos. `_Claves_Examenes` es el banco reservado de 24 columnas. `_Modulos_Fuentes` relaciona módulos y fuentes. `_Log_Actividad` guarda actividad con contexto de ejecución. El resto de esquemas y acciones se puede consultar en el servidor y en el anexo generado de esta misma versión.

Los campos Procedencia y Estado_Validacion distinguen una propuesta de una pregunta aprobada. `Opciones_JSON` contiene una lista de opciones, no una cadena separada por comas escrita informalmente. `Indice_Correcto` usa base cero. `Video_Segundo` indica la referencia temporal; `Peso_Puntos` debe reflejar el criterio de evaluación. Los campos de trampas o riesgo no son un detector concluyente de uso de IA.

Para mantener el sistema, edite la copia de trabajo, pruebe funciones afectadas en ensayo, guarde y publique una nueva versión del despliegue existente. Anote qué cambió y cómo se comprobó. No copie propiedades de producción a un proyecto público ni distribuya el respaldo de secretos junto al código.

## 19 Alcance de verificación y pendientes

La entrega incorpora las correcciones previas y añade los ajustes acotados de Código 23 e Index 8 documentados en los capítulos 24 a 27. No elimina funciones ni amplía los permisos de participantes o supervisores. Las pruebas locales simulan servicios y revisan regresiones de certificados privados, permisos, supervisión y TikTok. No acreditan disponibilidad de cada proveedor, entrega de todos los canales, emisión real de certificados ni funcionamiento de todos los menús en producción.

Antes de ampliar el piloto quedan como comprobaciones operativas el recorrido real completo de participantes, la plantilla de certificados si se desea emitirlos, el respaldo con los últimos cambios y los permisos de recursos externos. El grupo también puede planear pruebas de embeddings, familia, Ollama e integraciones externas, registrando los requisitos aún pendientes y los resultados reales. La autorización para ensayar todas las funciones no convierte en operativas las dependencias que faltan.

## 20 Diccionario de herramientas avanzadas

Las entradas siguientes se extraen de la tabla de herramientas de Código 23. Indican qué se pretende ejecutar; no certifican que cada integración haya sido ensayada. Las observaciones añadidas corrigen los casos donde la etiqueta del menú puede inducir a error. Las funciones marcadas como cambio amplio requieren especial atención al respaldo, al alcance y a la confirmación de pantalla.

### Ingesta y catálogo

**Continuar desde el punto guardado** — Retoma la ingesta donde se quedó la última pasada. Función: `continuarIngestaDesdeCheckpoint`.

**Reiniciar el punto de ingesta** — La próxima pasada vuelve a empezar por la primera fila. Función: `reiniciarCheckpointIngesta`.

**Fase 2 en paralelo** — Varias llamadas de IA a la vez. Más rápido y más caro. Función: `ejecutarFase2ParalelaUI`.

**Sincronizar desde una fila…** — Rehace metadatos y clasificación a partir de la fila que digas. Función: `actualizarTodoDesdeFilaUI`.

**Aplicar filtro a la fila de títulos** — Deja la cabecera filtrable. Función: `asegurarFiltroCatalogoUI`.

**Actualizar vistas y «me gusta»** — Solo las métricas; no toca títulos ni clasificación. Función: `actualizarSoloMetricas`.

**Detectar el idioma de cada video** — Rellena la columna de idioma donde falte. Función: `detectarIdiomasDelCatalogoUI`.

**Insertar una fila de ejemplo** — Una fila de muestra para ver el formato esperado. Función: `insertarFilaEjemplo`. Código 23 solicita una URL HTTPS real y crea 32 columnas; procese después la fase 1.

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

**Resumen ampliado de la fila** — Gasta una llamada de IA. Función: `generarResumenAmpliadoConIA`.

**Resumen de lo seleccionado** — Una llamada por fila seleccionada. Función: `generarResumenParaFilasSeleccionadas`.

**Resúmenes de los esenciales** — Lote sobre los marcados ⭐. Función: `generarResumenesLoteEsenciales`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Mostrar u ocultar columnas técnicas** — Drive, embedding, formulario y módulo. Función: `alternarVisibilidadColumnaS`.

**Extraer letras de canciones** — Interruptor. Afecta a los videos musicales. Función: `alternarLetrasMusicales`.

**Transcribir la fila activa** — Descarga los subtítulos si el video los tiene. Función: `extraerTranscripcionFilaActiva`.

**Transcribir los esenciales** — Lote sobre los marcados ⭐. Función: `extraerTranscripcionesMasivasEsenciales`. Cambio amplio o sensible: revisar alcance antes de confirmar.

**Pegar la letra a mano** — Para cuando el video no publica subtítulos. Función: `pegarLetraVideoUI`.

### Búsqueda semántica

**Generar embeddings** — Necesario para buscar por significado. Gasta IA. Función: `generarEmbeddingsParaCatalogo`. Cambio amplio o sensible: revisar alcance antes de confirmar. Pendiente de migrar el modelo retirado y reconstruir el índice; requiere una migración antes de esperar resultados correctos.

**Indexar por fragmentos** — Trocea las transcripciones para buscar dentro. Función: `indexarFragmentosCatalogo`. Cambio amplio o sensible: revisar alcance antes de confirmar. Depende de la migración de embeddings. Puede ensayarse cuando se haya configurado un modelo operativo.

**Buscar por significado** — Busca por idea, no por palabra exacta. Función: `buscarSemanticoUI`. La búsqueda por significado requiere resolver el modelo de embeddings. Use búsqueda por palabras.

**Ajustar los umbrales** — Cuánto parecido hace falta para considerar un resultado. Función: `configurarUmbralesBusqueda`.

### Academia y evaluaciones

**Evaluar la dificultad** — Rellena la columna de nivel. Función: `actualizarDificultadCatalogo`. Cambio amplio o sensible: revisar alcance antes de confirmar.

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

**Invitar a alguien** — Genera una clave de acceso al portal. Función: `invitarMiembroFamiliaUI`. No envía correo automáticamente. Entregue acceso privado; no hay pantalla completa de listas familiares en Index 8.

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

Estas llamadas no tienen pantalla propia ni rutas dedicadas en el puente apiPortal de Index 8. Las debe invocar el responsable técnico desde un contexto interno autorizado, con parámetros explícitos, en el proyecto de ensayo. La referencia completa muestra las firmas y la implementación. No agregue claves a archivos públicos ni transforme un rechazo de permisos en una razón para desactivar la validación.

FAM 04: crearEventoCalendarioFamilia recibe token, idLista, fechaHoraIso, duracionMin y correosInvitados separados por comas. Use una fecha futura con zona horaria explícita y primero una lista de invitados vacía. Compruebe título, inicio, fin y calendario del propietario. Una segunda prueba con invitados reales necesita destinatarios que hayan aceptado el ensayo, porque puede producir notificaciones. Index 8 no muestra un calendario familiar: el resultado se comprueba en Google Calendar y en el registro.

### Exportaciones agentes y mantenimiento

EXP 01: exporte Excel, CSV, JSON, PDF, Slides, ficha Docs y mapa Mermaid de contenido ficticio; abra cada resultado y contraste datos y caracteres. EXP 02: informe de certificaciones, registro CSV y copia histórica; compruebe que no se divulgan a participantes por compartir una carpeta. EXP 03: enlace público JSON sobre una copia sin datos personales, verificando acceso público deliberado y cómo retirarlo al terminar.

INT 01: generar esquema JSON, herramientas, prompt de sistema, contexto MCP y guías; revisar los archivos. INT 02: conectarlos a un integrador de ensayo que respete las rutas, tokens y scopes; generar documentación no equivale a tener un servidor MCP ejecutándose. INT 03: webhook ERP o agentes contra un receptor de prueba y comprobar el formato real.

MAN 01: inventario de activadores y comparación con lo esperado por cuenta. MAN 02: dashboard, respaldo y mantenimiento en sus ventanas. MAN 03: proceso nocturno IA, cola, control móvil, agentes y formularios, habilitando cada tarea cuando tenga un caso de ensayo definido. MAN 04: DLQ, reprocesamiento y contador de fallos con una URL de ensayo. MAN 05: cachés y filtros, cambiando un dato y comprobando cuándo aparece.

MAN 06: migraciones de columnas y taxonomía en una copia, comparando cantidades y datos antes y después. MAN 07: duplicados, filas inválidas, enlaces no video y contenedores; comprobar las filas exactas que se alteran. MAN 08: reconstrucción desde cero solo sobre un libro desechable cuya copia ya se recuperó. La función sigue incluida: su carácter destructivo debe formar parte del caso de prueba, no esconderse bajo una etiqueta de mantenimiento rutinario.

Las pruebas unitarias y de integración incorporadas al menú también están incluidas. Ejecútelas en el entorno de ensayo con sus dependencias preparadas y conserve el resultado completo. Un fallo puede indicar una expectativa antigua de la batería, un servicio no habilitado o un defecto real; se debe investigar, no cambiar el resultado para que parezca aprobado.

## 22 Referencia completa de funciones y rutas

Abra `Referencia_funciones.html`, en esta misma carpeta de manuales. Contiene un buscador de 675 funciones declaradas en el servidor, 138 en el HTML y 52 rutas del puente apiPortal. Puede filtrar por Servidor, Interfaz o API y buscar, por ejemplo, familia, token, TikTok, informe o resumen.

Cada entrada presenta la firma, parámetros declarados, archivo, línea, comentario inmediato disponible, guardas detectadas y referencias de código. El enlace Ver implementación completa abre la fuente con numeración de líneas. Los archivos Fuente_Servidor.html y Fuente_Interfaz.html muestran también métodos de objetos, callbacks, constantes y bloques que no son funciones de primer nivel. El script y el HTML instalables siguen completos, sin funciones recortadas.

Esta referencia técnica es una lectura estática del código, no una simulación de todas sus salidas. Un comentario heredado puede describir una intención; el manual operativo y CAMBIOS aclaran los defectos conocidos. Una función interna sin guarda directa no se presume pública: puede depender de la guarda de quien la llama. No todas las funciones se ejecutan seleccionando su nombre en el editor, porque muchas necesitan parámetros o un evento de Google.

Para una ruta apiPortal, use el nombre exacto y los campos de esquema que aparecen en su entrada. Los alcances se validan en el servidor. Una respuesta exitosa tiene ok y data; una fallida devuelve información de error. El HTML usa un token de sesión y no permite asumir otra identidad enviando un correo o scope diferente. doGet y doPost, documentados en la referencia, son entradas HTTP distintas del puente del HTML; consulte sus ramas y formatos antes de integrar otro sistema.

## 23 Actualizar la instalación existente y volver atrás

1. Conserve una copia del servidor y HTML actuales y un respaldo recuperable del libro y propiedades. Anote la versión publicada y su ID de implementación. Los originales Código 19 e Index 5 permanecen en la carpeta de trabajo como referencia anterior.
2. Abra el proyecto vinculado al libro correcto. Copie `instalacion/Codigo.gs` sobre el servidor y `instalacion/Index.html` sobre el archivo HTML llamado Index. No añada Código 23 como segundo servidor junto al anterior: duplicaría declaraciones.
3. Guarde y compruebe la sintaxis. La versión nueva del servidor es v2026.6.37-VIDEOTECA-PILOTO-R6; el pie de acceso añade Index 8. Las 52 rutas del puente permanecen disponibles y no se cambiaron los scopes del servidor.
4. En Administrar implementaciones edite la implementación activa y seleccione una nueva versión. Conserve su ID, cuenta ejecutora y permisos. Esto mantiene la URL /exec y evita modificar el retorno de TikTok sin necesidad.
5. Cierre sesiones antiguas y abra el portal actualizado. Compruebe el pie de versión, la búsqueda por palabras y la opción semántica, el cierre y una nueva entrada. Una pestaña que ya cargó el HTML anterior no se actualiza sola al publicar.
6. Ejecute los casos del grupo y registre los errores con versión y contexto. No es necesario volver a generar claves de proveedores por instalar este HTML.
7. Si aparece un fallo que impide el trabajo, edite el mismo despliegue y seleccione la versión previa documentada. Restaure también el código de trabajo anterior si debe seguir editando sobre él. Estos cambios no requieren una migración de esquema, pero una reversión de código no deshace datos que el grupo haya creado durante las pruebas.

La entrega deja los archivos listos para actualizar. No publica automáticamente esta revisión ni afirma que ya se ejecutó en Google. Su validación combina pruebas locales y navegación de una maqueta con respuestas ficticias; el ensayo del grupo comprobará además las cuentas, recursos, cuotas y permisos reales.

## 24 Correcciones de concurrencia y guardado incorporadas

La revisión R6 integra las correcciones de concurrencia y guardado introducidas en R4. La pareja actual es Código 23 e Index 8 y conserva las 52 rutas del portal. Publicar la aplicación exige seguir el capítulo 23; actualizar el manual no publica el código.

### Cola de tareas

La cola reserva un consumidor durante diez minutos con un bloqueo breve, libre durante las llamadas externas. La inserción controla duplicados simultáneos y la purga espera al consumidor. El presupuesto de cuatro minutos no garantiza la duración de una llamada externa.

Antes del efecto externo, la tarea queda EN_PROCESO y se confirma la escritura. Después se registra su resultado por fila, antes de pasar a la siguiente. No se reescribe toda la cola con una copia antigua. Si una ejecución se interrumpe y deja EN_PROCESO, esa tarea no vuelve a ejecutarse automáticamente.

Para una tarea detenida, el responsable técnico verifica ID y resultado en el proveedor y los registros. Sin consumidor activo, tras vencer la reserva y con respaldo, puede marcar COMPLETADA si ocurrió, o PENDIENTE si confirmó que no ocurrió. Si hay dudas, conserva EN_PROCESO. Esta conciliación aún no tiene pantalla propia.

Esta reserva no promete ejecución exactamente una vez: una API puede realizar un efecto y después devolver un error. Los fallos capturados conservan la política de reintentos. La idempotencia completa depende del proveedor y queda pendiente por tipo de tarea. Los cambios manuales de filas durante el procesamiento no quedan protegidos por el bloqueo del código.

### Validación de datos

Los campos numéricos exigen un número finito o una cadena decimal completa. Se rechazan sufijos como 12abc, Infinity, NaN y objetos. No se impone un tamaño global arbitrario a todas las operaciones. Las comprobaciones específicas de rangos, recursos y permisos siguen siendo necesarias; esto no convierte el validador en un esquema exhaustivo de seguridad.

### Respuestas del examen

Los avances viajan en orden dentro de la sesión. Guardado solo aparece cuando el servidor confirma exito verdadero y no quedan cambios posteriores. Un rechazo no se presenta como éxito. El servidor comprueba el estado del intento y escribe el avance bajo el mismo bloqueo que utiliza la entrega: un guardado posterior a una entrega no puede reabrir ni modificar el intento entregado.

El texto pendiente se recoge al avanzar de pregunta o abrir la revisión. Las respuestas tardías de otra sesión no actualizan la pantalla actual. Si un guardado falla o queda sin confirmar, se conservan las respuestas en memoria y se detienen nuevos avances parciales para no competir con una llamada antigua. Mantenga la pestaña abierta, recupere la conexión y entregue para enviar el conjunto de respuestas. La entrega espera la cola local; si devuelve error, conserve la pestaña y revise el mensaje.

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

Código 23 e Index 8 integran las revisiones previas y los ajustes confirmados del nuevo análisis. Se conservan 675 funciones del servidor, 138 funciones identificadas en la interfaz y 52 acciones de apiPortal. Las referencias completas se regeneran desde estos archivos; el inventario incluye funciones internas, no solo botones visibles.

Los dos despachadores del panel resuelven la función autorizada mediante globalThis después de comprobar contexto y lista blanca. Ya no dependen del valor de this. Esta mejora no permite llamar cualquier función desde el navegador ni convierte la lista blanca en una auditoría completa de seguridad.

El rótulo Idioma se incluye en los valores de marca del servidor y en el formulario de identidad del administrador. Al guardarlo y recargar el portal debe conservarse. Cambiar ese rótulo no traduce los videos ni toda la aplicación.

Inicio consulta el siguiente paso y los avisos por separado. Muestra una acción principal y conserva los avisos secundarios. Si falla una consulta, mantiene la otra cuando está disponible; si fallan ambas, informa que no pudo comprobar los pendientes. No presenta un fallo de conexión como si todo estuviera completo. Los módulos sin una recomendación automática no se anuncian falsamente como aprobados.

Al saltar directamente entre preguntas mediante la rejilla, el portal recoge primero el texto escrito y cancela el temporizador pendiente del campo anterior. Las confirmaciones de guardado se muestran en la pregunta correspondiente. Se mantienen la cola de guardado, la verificación de éxito y las medidas frente a respuestas tardías de otra sesión.

Se aprobaron 139 comprobaciones locales con servicios simulados: 129 regresiones previas y 10 nuevas para despacho, permisos, marca, navegación de preguntas y orientación de Inicio. No equivalen a una auditoría integral ni acreditan llamadas reales a cada proveedor. La publicación de esta versión en Apps Script sigue pendiente de realizarse mediante el capítulo 23.

Prueba de aceptación tras actualizar: confirme versión R6 e Index 8; entre como participante y revise Inicio; escriba una respuesta y salte por la rejilla; vuelva y compruebe el contenido; entregue un intento de ensayo y consulte su resultado. Después entre como administrador, cambie Idioma en Identidad, guarde y recargue. Compruebe con supervisor la consulta autorizada y con participante el acceso únicamente a sus resultados. Registre cualquier diferencia con versión, rol, pasos y mensaje, sin claves ni solucionarios.
