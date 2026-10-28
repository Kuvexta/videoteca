# Canal definitivo y ensayo del portal — 11/09/2026

## Canal

Se configuró desde el panel original de producción, bajo la sesión única de Andrés:

- Correo activo y destino `andressuarezcarmona@gmail.com`.
- Telegram desactivado; sus campos estaban vacíos.
- Se conservó la opción de apoyo al alumno que mostraba el formulario.

El formulario original guarda seis propiedades de configuración de alertas, incluidos valores vacíos y booleanos por defecto; no es una captura de respaldo. El panel reabierto mostró «Canal configurado» y «Correo y Telegram de alertas» activos. La configuración permanece en producción: no es temporal. El correo comparte configuración con las alertas académicas al tutor.

Se ejecutó «Enviar prueba» y se confirmó el destino en el diálogo original. Aproximadamente a las 19:58 la interfaz informó «Aviso de prueba enviado» al correo indicado. **Recepción confirmada por el usuario**: aportó el mensaje recibido del evento `prueba_de_canal`, versión `v2026.6.37-VIDEOTECA-ETAPA2`, fecha del cuerpo `2026-09-11 19:58`. El canal permanente de producción queda comprobado para este envío.

## Bloqueo del portal detectado y corregido

La implementación de ensayo HEAD mostró «Portal en mantenimiento». El registro de `doGet` de las 19:58:09, completado en 2,848 s, informó a las 19:58:12: `Fallo renderizando Index.html: Unexpected token ';'`.

El archivo existía. En la línea 1142 del HTML anterior, un comentario JavaScript contenía una etiqueta de impresión de Apps Script vacía (`<?= ?>`). El motor de plantillas la interpretaba antes de entregar el JavaScript al navegador. La pantalla de mantenimiento atribuía el fallo a un archivo ausente, aunque aquí la causa era otra.

Corrección mínima: sustituir solamente esa mención dentro del comentario por «la etiqueta de impresión contextual». Archivo corregido: `Index_4.html`. SHA-256: `d9072a0803296ef1d90b2ea579bf9588328993307271870ccfdf39256d6b9138`.

Antes de cambiarlo se leyó todo el HTML del editor y coincidía con `pruebas/Index.html`, normalizando retornos de carro. Después de guardar, la lectura íntegra coincidió con `Index_4.html` del mismo modo. Los archivos anteriores y el paquete original de pruebas se conservan sin alteración.

## Validación real del HTML corregido

En la URL de ensayo `/dev`, sin actualizar la implementación pública:

1. El portal renderiza la pantalla de acceso y muestra `v2026.6.37-VIDEOTECA-ETAPA2`.
2. Una clave deliberadamente inválida es rechazada.
3. Se desactivó «Recordar en este dispositivo» antes de introducir la credencial existente autorizada.
4. El acceso válido abrió sesión con el rol de administrador.
5. El catálogo cargó filtros, tarjetas y **4880 videos, página 1 de 543**.
6. Se cerró la sesión de prueba y se verificó el regreso a la pantalla de acceso, con el campo vacío y «Recordar» desactivado.

No se emitieron ni revocaron tokens permanentes, ni se modificaron videos o exámenes. El login puede crear la sesión efímera y los registros operativos propios del producto. Esta prueba no acredita proveedores externos, exámenes, roles distintos de administrador ni el portal público.

Servidor sin cambios: `Codigo_15.gs`, SHA-256 `4e76e36efa3dcdb825532a7ac193b6f4d2e6450154daa321a594f4c8eb94170f`. La combinación final incluye un HTML nuevo: no se afirma que las 818 comprobaciones previas del paquete hayan validado este HTML ni se modifica retroactivamente su hash.

## Pendientes para cerrar

- Canal de producción: cerrado; recepción del aviso de prueba confirmada por el usuario.
- Identificar consumidores de tokens y claves de proveedores antes de retirar valores anteriores. Se preguntó al usuario; no se presupone que no existen integraciones.
- Completar la rotación autorizada sin modificar `MASTER_SECRET_HMAC` y probar las integraciones afectadas.
- Actualizar y verificar la implementación pública una vez completadas las condiciones previas. No se publicó durante esta validación.
