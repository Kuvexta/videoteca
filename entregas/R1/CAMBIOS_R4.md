# Revisión R4

## 24 Correcciones de concurrencia y guardado de la revisión R4

La revisión R4 contiene Código 21 e Index 7. Conserva las funciones y las 52 rutas del portal. Está preparada localmente; publicar exige seguir el capítulo 23. No cambia automáticamente la copia del manual que se haya importado a Google Docs.

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
