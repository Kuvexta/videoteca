# Inventario de activadores — hoja de captura

**Proyecto:** Videoteca Certificable — Kuvexta
**Para qué:** reunir, antes de instalar la 6.37, todos los activadores instalados del
proyecto, vengan de la cuenta que vengan.

**Por qué hace falta consultar las cuentas creadoras:** no hay que confundir el
inventario que devuelve el código para la cuenta actual con la pantalla de Google.
El 11/9/2026, esta última mostró tres activadores de producción como **«Otro usuario»**
desde `sstconsultorescolombia@gmail.com`, sin ofrecer edición de sus horarios ni revelar
el correo creador. Esto corrige la afirmación anterior de que nunca aparecen.
Para cerrar el inventario hay que reunir las respuestas de las cuentas creadoras y
resolver los propietarios que la pantalla no identifica.

## Datos generales de cada captura

Anotar en `INVENTARIO_Activadores_DATOS_GENERALES.csv` el ID y nombre del proyecto,
entorno (producción o copia), fecha y hora de captura, zona horaria del proyecto,
cuenta consultada y estado de revisión. Entregar ese archivo junto con las filas de
`INVENTARIO_Activadores_PLANTILLA.csv`; usar una carpeta por proyecto y cuenta.

Un error de acceso o una lista que no carga se registra como «PENDIENTE», nunca como
«NINGUNO». La fila «NINGUNO» solo se utiliza después de consultar correctamente el
proyecto indicado con esa cuenta y comprobar que no tiene activadores visibles.

---

## Cómo llenarlo

1. Comprueba el ID del proyecto y la cuenta abierta. Abre **Activadores** (el reloj,
   en la barra izquierda).
2. Una fila de la hoja por cada activador que veas. Si no ves ninguno, escribe una fila
   con tu cuenta y «ninguno»: un «no tengo» explícito vale, un silencio no.
3. Copia el horario **tal como lo muestra la pantalla**, sin interpretarlo ni prometer
   un minuto exacto. Anota la zona horaria en los datos generales. Las recetas con
   `atHour(2)` programan dentro de la hora 02:00–03:00, no garantizan las 02:00 exactas.
4. En **Avisos de fallo**, la opción que esté seleccionada: *inmediatamente*, *a diario*,
   *cada semana*. Es un dato que no se recupera después.
5. Puedes abrir la edición de un activador para consultar sus valores; termina con
   **Cancelar**, sin guardar. No borres, no modifiques y no crees activadores.

## Las siete columnas: seis campos y Notas

| Columna | Qué poner |
|---|---|
| Cuenta creadora | Tu correo. Sin esto, al juntar las listas un activador huérfano no se puede devolver a nadie |
| Función | El nombre exacto, como aparece. Respeta mayúsculas y guiones bajos |
| Tipo de evento | Temporizador, Al editar, Al enviarse el formulario, Al abrir… |
| Horario | Literal, copiado de la pantalla |
| Recurso asociado | Para los de hoja o formulario, el ID del recurso. Para los de tiempo, vacío |
| Avisos de fallo | La periodicidad seleccionada |
| Notas | Dudas, diferencias con las recetas, duplicados aparentes o datos pendientes |

La columna **Notas** es para lo que no encaje: un activador que no reconozcas, uno
duplicado, uno cuyo nombre no esté en la lista de referencia.

---

## Lista de referencia

Los diez manejadores que la 6.37 renombra. **No es una lista de lo que debe haber**: sirve
para reconocer nombres y para detectar lo que sobra o falta. Que haya diez nombres no
significa que haya diez activadores instalados.

| Nombre antiguo (lo que verás hoy) | Nombre nuevo (6.37) | Tipo | Lo que espera el migrador | Recurso |
|---|---|---|---|---|
| `actualizarDashboardPeriodico` | `actualizarDashboardPeriodico_` | Temporizador | cada hora | |
| `ejecutarMantenimientoSemanal` | `ejecutarMantenimientoSemanal_` | Temporizador | domingos 03:00–04:00 | |
| `crearBackupAutomatico` | `crearBackupAutomatico_` | Temporizador | domingos 23:00–00:00 | |
| `exportarCatalogoAJsonSilencioso` | `exportarCatalogoAJsonSilencioso_` | Temporizador | cada 6 horas | |
| `disparadorNocturnoFase2` | `disparadorNocturnoFase2_` | Temporizador | diario 02:00–03:00 | |
| `procesarColaTareasSilencioso` | `procesarColaTareasSilencioso_` | Temporizador | cada hora | |
| `onEditControlMovilTrigger` | `onEditControlMovilTrigger_` | Al editar | evento | ID de la hoja de origen |
| `registrarRespuestaFormularioCentralizado` | `registrarRespuestaFormularioCentralizado_` | Al enviarse el formulario | evento | ID del formulario |
| `procesarColaConAntiTimeout` | `procesarColaConAntiTimeout_` | Temporizador | continuación, mínimo 1 minuto | |
| `continuarEmbeddingsCatalogo` | `continuarEmbeddingsCatalogo_` | Temporizador | continuación, mínimo 1 minuto | |

Las franjas se interpretan en la zona horaria del proyecto. `after(60000)` indica una
espera mínima, no una ejecución puntual a los 60 segundos. Referencia:
[ClockTriggerBuilder de Google](https://developers.google.com/apps-script/reference/script/clock-trigger-builder).

`onOpen` **no** está en esta lista y no se toca: es un disparador simple y su nombre es
reservado.

Si un horario real no coincide con el de la columna «lo que espera el migrador», anótalo
en Notas: el migrador recrea según su receta, no según lo que había, así que esa
diferencia hay que decidirla a mano **antes** de migrar, no descubrirla después.

---

## Al consolidar

- Una sola hoja con las filas de todas las cuentas, sin fusionar ni deduplicar nada
  todavía.
- Dos filas con la misma función y distinta cuenta **no son un duplicado a borrar**: son
  dos activadores reales, y hay que decidir cuál se conserva.
- El inventario está completo cuando **todos** los administradores han respondido,
  incluidos los que respondieron «ninguno». Hasta entonces no se instala ni se migra.
