# Rotación del administrador de producción

## Cierre verificado — 20:16 de Bogotá

El usuario completó la revocación en el panel. Se observó «Token anterior revocado. La rotación está completa» y se realizaron las comprobaciones posteriores en el portal de ensayo:

- Intento de acceso nuevo con el token anterior: rechazado como no válido, revocado o caducado.
- Intento de acceso nuevo con el sustituto: correcto, Master Administrator con rol Administración.
- Panel actualizado: sin el aviso «Token sin revocar» ni el botón «Revocar el anterior».

Queda cerrada la rotación de este token administrador. No equivale a rotar todos los tokens del mapa ni las claves de proveedores. No se ensayó la invalidación de sesiones antiguas que hubieran permanecido abiertas: las verificaciones fueron inicios de sesión nuevos. La implementación pública todavía no se actualizó. El relato anterior que sigue se conserva como historial de la operación.

El usuario confirmó que las credenciales solo se utilizan en Videoteca y que pueden regenerarse. Tras su confirmación en la interfaz, el panel mostró «Token sustituto emitido» y el estado «Token sin revocar de Master Administrator», fechado 11/09/2026 20:13.

Se comprobó el acceso del sustituto en el portal de ensayo `/dev`, con «Recordar en este dispositivo» desactivado. Se abrió correctamente como Master Administrator, rol Administración. No se escribieron valores de tokens en este informe ni en archivos de texto.

Se solicitó cerrar la sesión de ensayo. La revocación del anterior sigue pendiente: el botón está visible en la sección Atención del panel, pero la herramienta de navegador rechazó interactuar con él por su comprobación de coordenadas del marco. No se envió la confirmación de revocación.

Próximos pasos: el usuario pulsa «Revocar el anterior» y confirma tras haber guardado el sustituto; comprobar después rechazo del token anterior, acceso del nuevo y desaparición del estado pendiente. No declarar la rotación cerrada antes de esas comprobaciones.

Las credenciales de proveedores y la publicación continúan pendientes. No se modificó MASTER_SECRET_HMAC. El respaldo original conserva el estado anterior por diseño; tras completar la rotación deberá conservarse también el estado actual en un respaldo seguro diferenciado.
