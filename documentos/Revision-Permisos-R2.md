# Permisos de resultados — revisión inicial R2

12 de septiembre de 2026. Fuente: Codigo_17_TikTok_diagnostico.gs, sin modificar producción.

## Pruebas efectuadas

18 pruebas locales aprobadas sobre funciones extraídas del servidor real. Dos participantes ficticios y un administrador; resolución de tokens, almacenamiento y generación de PDF simulados. La pasarela apiPortal, tabla de rutas, comprobación de propiedad del intento y filtro de calificaciones son código real.

- Participante lee su informe entregado sin anexo forense.
- No lee informe ni genera PDF de otro participante.
- Alterar email, scope o un objeto sesion en la petición no suplanta al propietario.
- Ni participante ni administrador obtienen el solucionario de un examen abierto por la ruta de informes.
- Calificaciones filtra por el correo de la identidad resuelta; objetivo ajeno se rechaza antes de leer la hoja.
- Administrador puede pedir calificaciones ajenas mediante la función que admite correo objetivo.
- Estado del módulo usa correo de sesión; ignora correo declarado.
- Rutas administrativas bloquean al participante.
- Token desconocido rechazado por la pasarela usando validador simulado.

No acredita autenticación real, vigencia/revocación de tokens, todas las rutas, permisos de archivos Drive, respuestas Forms ni sesiones reales de dos usuarios. No se crearon usuarios ni se emitieron credenciales durante estas pruebas.

## Diferencia con el modelo solicitado

No existe scope supervisor separado. La jerarquía actual es read_only, exam, append y admin. Los roles familiares no equivalen a un permiso de lectura global de resultados. No asignar admin a supervisores como solución automática: también concede administración.

Además, la ruta `notas` no transmite un correo objetivo, incluso para admin; consultar calificaciones ajenas está soportado por la función interna, pero no por ese recorrido del portal. `informe_auditoria` exige admin y obtiene intentos del correo del propio token. Por tanto, no se ha acreditado una pantalla de consulta global de resultados para supervisores.

Pendiente: definir si los supervisores solo consultan o también administran. Pregunta enviada al usuario. Esa decisión condiciona el permiso y la interfaz a implementar, no las pruebas de aislamiento anteriores.

## Hallazgo en Google Sheets

La revisión real del cuadro Compartir mostró un único usuario explícito (Andrés, propietario), pero acceso general «Cualquier persona con el enlace», permiso Lector. Ese acceso directo al libro no aplica la identidad ni los filtros del portal. Se cambió a Restringido dentro del objetivo autorizado de separar los resultados por usuario. No se añadieron usuarios ni se cambiaron permisos de la implementación web.

No se afirma acceso indebido ocurrido: se verificó la configuración, no un historial de consultas. Los enlaces de certificados, formularios y otros documentos necesitan una revisión separada. El código de producción no se modificó.
