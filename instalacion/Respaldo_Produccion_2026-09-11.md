# Respaldo de producción — 11 de septiembre de 2026

Estado actualizado a las 18:42: captura del libro, código actual y publicado, inventario y todos los ámbitos de propiedades completada. Recuperación de archivos cifrados verificada. NO acredita una restauración funcional completa de la aplicación con sus integraciones externas ni autoriza por sí sola una publicación.

## Cierre de la captura — autorización completada

Google aceptó la autorización de `sstconsultorescolombia@gmail.com`: ejecución de `esFalloDefinitivo` completada a las 18:38:18. La lectura directa de propiedades se realizó a las 18:39:02; UserProperties de esa cuenta y DocumentProperties estaban vacíos, comprobados expandiendo los objetos en el depurador. Se guardó `UserDocument_SST.dpapi` y se verificó su recuperación exacta. El bloqueo descrito más abajo queda resuelto.

Inventario definitivo de ámbitos: ScriptProperties, 22 propiedades; UserProperties de Andrés, 7; UserProperties de sstconsultorescolombia, 0; DocumentProperties, 0. Se preservaron las ausencias.

El lector temporal volvió a retirarse. Comparación final de Código.gs contra el respaldo inicial: idéntico, SHA-256 `49e4edd4c12a25ac6d340e94115d4045ea3cad69b8098c0b20e7855797b3660b`. Comparación final de las 22 ScriptProperties: mismos nombres y valores. Permanecen los tres activadores originales. No se migró ni publicó.

Se abrió el proyecto vinculado a la copia del libro: `1MTntmy7tL_S3JqQwgWwnIHqJQ0lJ4TRQxoyBrX_fI5FndrF0-MzlX6Hb`. Su Código.gs coincide byte por byte con el archivo descifrado del respaldo. Su pantalla de ScriptProperties no contiene propiedades. No se ejecutaron inicializadores ni se transfirieron las credenciales de producción a ese proyecto. El libro abre en Google y presenta su menú; esto acredita acceso y conservación del código, no funcionamiento completo con credenciales restauradas.

## Ampliación de la captura — 18:24–18:30

Se capturaron y cifraron también las siete UserProperties de `andressuarezcarmona@gmail.com`, todas con valores de texto. DocumentProperties se leyó directamente y estaba vacío. Se verificó la recuperación exacta de este archivo adicional (`UserDocument_Andres.dpapi`).

Para esa lectura se añadió temporalmente un archivo independiente, autenticado, que solo llamaba a los lectores de PropertiesService. El intento de mostrar un diálogo falló por falta de contexto de interfaz; no mostró ni registró valores. La captura efectiva se hizo inspeccionando las variables de una ejecución pausada en el depurador. El archivo temporal fue eliminado después; el contenido completo de Código.gs se comparó con la captura inicial y es idéntico. La fecha de modificación del proyecto cambió por la creación y retirada del temporal; no se afirma que no haya habido cambios de metadatos. No se modificó la implementación publicada.

También se guardaron los tres archivos de la Versión 1 publicada, con prefijo `Version1_`, y se verificó su descifrado exacto. Su servidor es diferente al actual: SHA-256 `76a96b379fa6ec942b0a032b2a4662b60e2b558a7691840bf4962dff5edb3111`. El portal y manifiesto coinciden con los actuales.

Comprobación adicional, local y sin llamadas a proveedores: la HMAC recuperada valida las firmas de las cinco propiedades API_KEY_* guardadas. El mapa de tokens se recupera como JSON y contiene el ADMIN_TOKEN recuperado. Esto no prueba que los proveedores sigan aceptando esas credenciales ni que los tokens no hayan caducado.

Bloqueo observado: la ejecución desde `sstconsultorescolombia@gmail.com` mostró «Se requiere autorización». No se completó esa autorización ni la captura de sus UserProperties; no se consideran vacías. La ejecución pendiente se detuvo. Hace falta completar la autorización de esa cuenta en Google para continuar. No se ampliaron permisos de compartir.

## Origen y destino

- Proyecto original: `1pv0v0_r60zn8rLc614fewTK6qS7BPYgNpr0d5LMvSmIAU_fC4YUEN4tZ`.
- Libro original: https://docs.google.com/spreadsheets/d/1d3H1ZngdEKAacqYG2Ya3W6geY_UrWWThIuwA5Itc57I/edit
- Servidor actual identificado: `v2026.6.19-VIDEOTECA-FACETAS`. No es la candidata 6.37.
- Copia nativa: https://docs.google.com/spreadsheets/d/1mYnqXe65SEezyJqb9H-_YaInzLzYfvTsPX4qqdKB-dw/edit
- Copia privada, acceso general Restringido; única propietaria: `sstconsultorescolombia@gmail.com`. No se compartió con otras cuentas.
- Carpeta local protegida: `C:\Users\Informatica\AppData\Local\CodexBackups\Videoteca\2026-09-11`.

## Captura realizada

Se guardaron cifrados mediante Windows DPAPI CurrentUser: las 22 ScriptProperties existentes (valores incluidos), Código.gs actual, Index.html actual, appsscript.json, evidencia de la implementación, exportación XLSX de la copia y exportación XLSX directa del original. El inventario de los activadores también está en la carpeta.

Las propiedades se leyeron directamente de los campos del editor, sin ejecutar inicializadores ni funciones de credenciales. No se generaron propiedades ausentes, no se limpiaron residuos ni se rotaron claves. Los valores no están en este informe.

La implementación activa se comprobó: Web Videoteca BD, Versión 1 del 9 de septiembre de 2026, 23:04, ejecutada como Andrés y acceso Cualquiera. ID: `AKfycbxP6AxuL-fSF_aMk4U2hXroWMotJM-_Z47ZjNahomwKmt2O-8ldQSoX-RboJEsaLLGRTA`. Se registró; no se editó.

## Verificación

- Descifrado y comparación byte por byte satisfactorios de propiedades, servidor, portal, manifiesto y ambas exportaciones XLSX.
- Manifiesto JSON válido.
- Ambas exportaciones tienen las mismas 32 hojas, 28 ocultas, en el mismo orden y con la misma visibilidad.
- Comparación de valores y fórmulas de las exportaciones: 31 hojas coinciden. `_Log_Actividad` contiene 10.500 celdas con contenido en el original y 10.505 en la copia. No se declara identidad total de la copia. La exportación directa del original se conserva por separado.
- El original exportado contiene 136.873 celdas con contenido. Esta comparación no certifica permisos, comentarios, todas las características nativas ni recursos externos.
- Los temporales XLSX sin cifrar generados por la exportación se retiraron después del cifrado. Esto no constituye un borrado forense del disco.
- Hashes y tamaños: `VERIFICACION.json`, dentro de la carpeta local.

## Cómo recuperar un archivo

Usar la misma cuenta y perfil de Windows `SB-SERVIDOR\Informatica`. El script `Recuperar-Archivo.ps1` recibe `-ArchivoCifrado` y `-Destino`, descifra un archivo y rechaza sobrescribir uno existente. El destino debe ser una carpeta privada fuera de Google Drive; el resultado queda sin cifrar. No ejecutar el código recuperado ni importar propiedades en producción para comprobarlo.

DPAPI depende del perfil de Windows y su material de protección. Copiar estos archivos a otro equipo no garantiza poder recuperarlos. Este respaldo local no sustituye un respaldo portable cifrado ni la preservación del perfil. No reinstalar ni eliminar el perfil confiando únicamente en estos archivos.

## Pendientes reales

1. Captura de propiedades: COMPLETADA para ambas cuentas y el documento; ya no queda pendiente de autorización.
2. Ensayar la restauración funcional completa en un entorno aislado. La recuperación exacta de archivos y la comparación del código de la copia están comprobadas; no se han instalado las credenciales recuperadas en un proyecto de ensayo ni se han probado allí las integraciones externas. Mantener explícita esa diferencia.
3. Los documentos, formularios y carpetas externos enlazados por el catálogo no se copiaron como parte del libro. Delimitar y respaldar esos recursos si forman parte de la recuperación requerida.
4. Mantener separados los archivos actuales y los de la Versión 1: ambos están ahora respaldados localmente y no son intercambiables.

No se instaló la candidata, no se migraron activadores y no se publicó. Mantener esa condición hasta cerrar los pendientes necesarios para el alcance de recuperación acordado.

## Respaldo portable en la nube — 11 de septiembre de 2026

Se creó `Videoteca_2026-09-11_portable.7z`, protegido con contraseña y con los nombres internos cifrados. La contraseña fue introducida por el usuario en una ventana local; no se incluye en este informe ni en el respaldo.

- Archivo local: 3.080.979 bytes.
- SHA-256 del archivo local subido: `10ef4cf89337e0c754e4eceea8366e1cb1df2175a3eb3f42eeb0f889e596f61d`.
- Contenido: 17 archivos, recuperados y comparados satisfactoriamente; la recuperación del archivo portable no depende de DPAPI ni del perfil original de Windows.
- Prueba negativa: una contraseña incorrecta fue rechazada.
- Archivo en Drive: https://drive.google.com/file/d/18egM0yAHpGub0Nrv0yzu2ysc6TmjUWZ3/view
- Carpeta: https://drive.google.com/drive/u/0/folders/1ZXWPbUbLrBA3SzOnPc14K62Km66P2m9w
- Cuenta propietaria: `sstconsultorescolombia@gmail.com`. Drive muestra «Privado, solo para mí» en el propio archivo. No se amplió el acceso.
- Drive confirmó la subida completada. La integridad de una descarga desde Drive NO quedó comprobada: el navegador integrado no proporcionó un archivo descargado accesible para calcular su SHA-256. El hash anterior corresponde al archivo local, no a una descarga.

Para cerrar la comprobación de transporte: descargar el archivo de Drive, comparar su SHA-256 con el anterior y recuperar el contenido con la contraseña en una carpeta privada fuera de carpetas sincronizadas. Conservar la contraseña separada del archivo, en un lugar seguro recuperable. No enviarla por este chat.

Este paso acredita la recuperación local del respaldo portable y su presencia privada en Drive. No sustituye el ensayo funcional completo de restauración. No se instaló la candidata, no se migraron activadores, no se rotaron credenciales ni se publicó producción durante esta operación.

## Cierre de verificación de la descarga desde Drive

Se localizó la descarga realizada por el usuario en `D:\Downloads\Videoteca_2026-09-11_portable.7z`, de 3.080.979 bytes. Su SHA-256, calculado directamente sobre ese archivo, es `10ef4cf89337e0c754e4eceea8366e1cb1df2175a3eb3f42eeb0f889e596f61d`: coincide exactamente con el respaldo portable original subido.

Queda cerrado el pendiente de integridad de la descarga mencionado en la sección anterior. El archivo descargado es idéntico por SHA-256 al archivo cuya recuperación de los 17 archivos ya se comprobó. No se volvió a pedir la contraseña ni a descifrar: no era necesario repetir esa prueba sobre el mismo contenido. Esto verifica el transporte y la conservación del archivo, no una restauración funcional de la aplicación en Google.

## Ensayo funcional — entorno separado preparado

Se creó una copia adicional, sin compartir con los colaboradores del origen, para no utilizar el respaldo nativo como banco de pruebas:
- Libro: https://docs.google.com/spreadsheets/d/1Da2k_D_65XuFAxjVImMfBRdvXfnEXJbeD3Vh3VrSkCQ/edit
- Proyecto: https://script.google.com/u/0/home/projects/1k0XcXsGq2YGYTvR0s4ZprsntufwbhpG9jqw9JaVcBACEhqSUNLIgAVuR/edit
- Nombre del proyecto: ENSAYO RESTAURACIÓN Videoteca 6.19 — NO PUBLICAR.

Se añadió EnsayoRestauracion.gs con una comprobación previa: restringe la ejecución a los identificadores anteriores, exige 32 hojas y cero activadores de la cuenta ejecutora, lee el catálogo y el archivo HTML, escribe y recalcula en una hoja temporal nueva y retira esa hoja en finally. No llama a proveedores, notificaciones, migradores ni inicializadores. Preparar esta prueba no implica que haya pasado: falta registrar su ejecución y continuar con la restauración controlada de propiedades. No se trasladaron credenciales a la copia en esta fase.

## Resultado del ensayo en Google — 19:10 y 19:12

La copia de ensayo se verificó como Restringida y con una única propietaria: sstconsultorescolombia@gmail.com. La comprobación previa terminó con PREVIA_OK: versión v2026.6.19-VIDEOTECA-FACETAS, 32 hojas, catálogo con última fila 4.972 y 32 columnas, HTML legible, escritura/lectura/fórmula correctas, hoja temporal retirada, cero activadores de la cuenta ejecutora y cero ScriptProperties antes de restaurar.

Se recuperaron las 22 ScriptProperties desde el respaldo DPAPI en memoria y se introdujeron en la interfaz de configuración del proyecto de ensayo. Se compararon nombre y valor antes de guardar. No se insertaron secretos en el código, informes ni registros.

La función ensayoCredencialesRestauradas terminó correctamente en Google (inicio 19:12:49; el mensaje informativo muestra 19:12:58 y el aviso de finalización 19:12:57; se conservan los tiempos mostrados sin inferir una duración):
- 22 propiedades idénticas al respaldo, verificadas por SHA-256 de representación canónica antes y después de las operaciones.
- Cinco secretos sellados legibles mediante descifrar y obtenerApiKey originales; sin regeneración ni migración heredada durante esta prueba, pues la huella final coincide.
- ADMIN_TOKEN reconocido como administrador vigente por obtenerDatosToken original.
- obtenerIndiceCatalogo original devolvió 4.880 identificadores. Esa cifra es el tamaño del índice, no el número de filas del libro.
- UserProperties de SST y DocumentProperties vacíos, como en su respaldo.
- Sin llamadas a proveedores, envío de avisos ni creación de activadores.

Alcance: restauración funcional interna de la 6.19 en Google, bajo SST. No acredita la versión publicada anterior, la candidata 6.37, aceptación de claves por proveedores externos, OAuth externo, una publicación web ni trabajos automáticos. Las siete UserProperties de Andrés permanecen recuperadas y verificadas localmente; no se restauraron bajo otra identidad. La copia se mantuvo privada y no se añadieron permisos a otra cuenta para ampliar el ensayo.

Cierre del ensayo: retirarCredencialesDelEnsayo finalizó con LIMPIEZA_OK (registro informativo 19:13:21), verificando cero ScriptProperties en la copia. Los valores originales siguen en producción y en los respaldos; no se rotaron ni revocaron. El archivo auxiliar de pruebas se conserva separado, sin secretos, para reproducibilidad. El Código.gs de la copia se leyó íntegramente mediante el editor y se comparó con el recuperado del respaldo: contenido idéntico normalizando únicamente retornos de carro (1.153.002 caracteres capturados). No se afirma identidad binaria de las representaciones del portapapeles con sus distintos saltos de línea.

Estado final: ensayo funcional interno completado con los límites indicados; producción, sus activadores y su implementación publicada no se modificaron en este ensayo.

## Clasificación de UserProperties de Andrés

Se descifró en memoria el respaldo UserDocument_Andres.dpapi y se revisaron exclusivamente los nombres: FAIL_COUNT_2162, FAIL_COUNT_4777, FAIL_COUNT_2163, FAIL_COUNT_2160, FAIL_COUNT_2157, FAIL_COUNT_2155 y FAIL_COUNT_801. Las siete son contadores de fallos por fila, según el código 6.19 respaldado. Ninguna coincide con el patrón de credencial heredada <proveedor>_API_KEY. Esta captura no añade credenciales a la lista de rotación. Su restauración funcional bajo Andrés sigue sin ensayarse; los contadores son estado operativo por usuario y no deben trasladarse a SST como si fueran equivalentes.

La prueba de credenciales no se apoyó únicamente en igualdad de huellas: exigió que descifrar devolviera un valor no vacío para cada uno de los cinco secretos antes de comparar obtenerApiKey con ese valor. Esto, junto con la huella inicial/final idéntica, acredita la lectura con la HMAC recuperada para esas cinco propiedades en ese ensayo.

Pendiente humano: confirmar custodia recuperable de la contraseña portable fuera del archivo y del perfil de Windows. La apertura correcta acredita que la contraseña usada funciona, no que exista una segunda custodia recuperable. No solicitar ni registrar la contraseña en el informe o chat.

Los recursos externos enlazados siguen fuera del respaldo. Su alcance debe quedar explícito antes de declarar recuperación integral del sistema. Instalar código en el editor no actualiza una implementación web anclada a una versión, pero sí cambia el código que ejecutan los activadores y puede modificar datos compartidos; conservar instalación y migración en la misma ventana, y validar antes de publicar.

Actualización posterior: el usuario confirmó custodia separada de la contraseña. Se instaló la 6.37 y se migraron los tres activadores el 11/9 por la noche; véase INSTALACION_PRODUCCION_6_37_2026-09-11.md. El respaldo conserva deliberadamente los estados anteriores y no fue sobrescrito.
