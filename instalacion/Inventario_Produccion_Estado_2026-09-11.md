# Inventario de producción: tres activadores confirmados con su creador

## Actualización de las 17:58 — estado actual

El usuario habilitó la sesión de `andressuarezcarmona@gmail.com`. Se seleccionó esa
cuenta en Google y se abrió el mismo proyecto original. Los tres activadores aparecen
con propietario **«Yo»**, lo que confirma su cuenta creadora. Se consultó cada diálogo
de edición y se cerró con **Cancelar**, sin guardar cambios.

| Función | Horario actual confirmado | Avisos de fallo |
|---|---|---|
| actualizarDashboardPeriodico | Cada 1 hora | Notifícame una vez por día |
| ejecutarMantenimientoSemanal | Todos los domingos; 3:00 a.m. a 4:00 a.m. | Notifícame una vez por día |
| crearBackupAutomatico | Todos los domingos; Desde las 11:00 p.m. hasta la medianoche | Notifícame una vez por día |

Todos son «Basado en el tiempo», usan «Encabezado» y no tienen recurso de evento
de hoja o formulario. La zona observada es GMT-05:00, Bogotá. Sus horarios coinciden
con las recetas del migrador de la 6.37. No se observaron duplicados entre estos tres.

Se actualizó el CSV de inventario: los horarios ya son lecturas actuales y el correo
creador ya está confirmado, no inferido de las capturas anteriores.

**Estado: inventario global cerrado para las dos cuentas declaradas.** El usuario
confirmó expresamente: «No, solo esas dos cuentas». Andrés tiene los tres activadores
propios registrados. En la consulta de `sstconsultorescolombia@gmail.com` los tres
figuraban como «Otro usuario», sin activadores propios visibles. No se suman otra vez
como si fueran tres activadores adicionales. Total consolidado: **tres**.
El respaldo de producción sigue pendiente y no se ha iniciado la migración.

No se instalaron ni modificaron código, propiedades, activadores o implementaciones.

---

## Registro histórico: primera consulta parcial

Los apartados siguientes conservan lo observado antes de habilitar la cuenta creadora;
las limitaciones de acceso a esos tres horarios quedaron resueltas en la actualización
anterior. No representan el estado actual del CSV.

Consulta del 11 de septiembre de 2026, aproximadamente 17:44–17:47, hora de Bogotá.

## Lo comprobado directamente

- Proyecto original: `1pv0v0_r60zn8rLc614fewTK6qS7BPYgNpr0d5LMvSmIAU_fC4YUEN4tZ`, «Proyecto Videoteca BD».
- Cuenta abierta: `sstconsultorescolombia@gmail.com`.
- Zona horaria visible: «(GMT-05:00) hora estándar de Colombia – Bogotá».
- La pantalla del proyecto muestra **tres activadores**, todos de tiempo y con propietario **«Otro usuario»**.
- Funciones: `actualizarDashboardPeriodico`, `ejecutarMantenimientoSemanal` y `crearBackupAutomatico`.
- El primero muestra última ejecución el 11/9/2026 a las 17:44:08 y porcentaje de errores 0 %. Los otros dos muestran «-» en última ejecución; esto no demuestra que nunca se hayan ejecutado.
- Al abrir las opciones del primer activador, solo se ofrecen datos del proyecto, ejecuciones y ejecuciones fallidas; no se ofrece edición para leer horario y avisos.
- El selector de Google solo presenta la cuenta actual y la opción de añadir otra cuenta. No se dispone de una sesión de la cuenta creadora en ese selector.

La lista general de proyectos no mostraba el original, pero el enlace directo sí permitió consultar su pantalla de activadores. No se usó aquella lista incompleta para concluir que no había acceso.

## Corrección importante a las instrucciones anteriores

La afirmación «la pantalla nunca muestra activadores de otras cuentas» es falsa para la pantalla observada: estos tres aparecen como «Otro usuario». No se debe extrapolar la limitación del inventario por API a toda la interfaz. Las instrucciones de captura ya se corrigieron.

Esto no identifica el correo creador ni garantiza que se vean todos los activadores de todas las cuentas. Sigue siendo necesario consultar a sus creadores y consolidar las respuestas, incluido el «ninguno» explícito cuando proceda.

## Datos históricos separados de los actuales

Las capturas anteriores aportadas por el usuario mostraban:

| Función | Horario histórico | Avisos históricos |
|---|---|---|
| actualizarDashboardPeriodico | Cada 1 hora | Notifícame una vez por día |
| ejecutarMantenimientoSemanal | Todos los domingos, 3:00 a.m. a 4:00 a.m. | Notifícame una vez por día |
| crearBackupAutomatico | Todos los domingos, desde las 11:00 p.m. hasta la medianoche | Notifícame una vez por día |

Esos horarios coinciden con las recetas conocidas del migrador, pero no se han vuelto a consultar desde la cuenta creadora. Por ello aparecen en Notas del CSV, no como horarios actuales confirmados. No se asigna un correo creador a partir de quién posee el proyecto: propietario del proyecto y creador del activador no son equivalentes.

## Qué falta para cerrar

1. Abrir este proyecto original en el navegador con la cuenta creadora de los activadores.
2. Consultar cada activador y completar correo creador, horario literal y avisos de fallo; cerrar con Cancelar sin guardar.
3. Recoger las respuestas de las demás cuentas que puedan haber creado activadores.
4. Consolidar sin eliminar duplicados automáticamente y confirmar el respaldo antes de instalar o migrar.

No se ha enviado ningún mensaje a administradores. No se han modificado código, propiedades, activadores ni implementaciones de producción. Tampoco se ha realizado todavía el respaldo de producción.

## Archivos

- `INVENTARIO_PRODUCCION_2026-09-11.csv`: tres registros observados, con campos pendientes explícitos.
- `INVENTARIO_PRODUCCION_DATOS_GENERALES_2026-09-11.csv`: identificación y alcance de esta captura.
- `INVENTARIO_Activadores_INSTRUCCIONES.md`: instrucciones corregidas, siete columnas y tiempos sin prometer un minuto exacto.
- `INVENTARIO_Activadores_DATOS_GENERALES.csv`: plantilla general para otras cuentas.
- `INVENTARIO_Activadores_PLANTILLA.csv`: plantilla de siete columnas, conservada porque su estructura ya era correcta.

Fuente directa: [activadores del proyecto original](https://script.google.com/u/0/home/projects/1pv0v0_r60zn8rLc614fewTK6qS7BPYgNpr0d5LMvSmIAU_fC4YUEN4tZ/triggers).
