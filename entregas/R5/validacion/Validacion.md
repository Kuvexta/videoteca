Esta entrega es R5. Consulte pruebas_R5_completas.txt: 129 pruebas sobre Código 22 e Index 7. Los párrafos siguientes conservan el historial de R4 y su alcance.

# Comprobación de la entrega

Fecha: 16 de septiembre de 2026. Ámbito: archivos locales y pruebas con servicios simulados.

Se prepararon Codigo_21_Seguridad_Cola.gs e Index_7_Guardado_Seguro.html a partir de los originales 19 y 5. Las correcciones se describen en CAMBIOS. Esos nuevos archivos se copian exactamente a instalacion/Codigo.gs e instalacion/Index.html; sus hashes se cotejan al cerrar el paquete.

Se ejecutaron cinco suites existentes, adaptando únicamente las rutas de lectura para que todas utilizaran la misma pareja entregada:

- Certificados privados: 17 pruebas.
- Supervisión: 22 pruebas.
- Aislamiento de resultados: 18 pruebas.
- Retorno OAuth TikTok: 15 pruebas.
- Diagnóstico TikTok: 11 pruebas.

Resultado: 83 regresiones aprobadas sobre Código 21 e Index 7. Se añadieron 18 comprobaciones de interfaz y 6 de panel y fila de prueba, más 15 específicas de R4: total 122. También se analiza la sintaxis del servidor completo y de los scripts del HTML. El detalle está en pruebas_locales.txt y pruebas_revision_R4.txt.

La suite antigua de aislamiento conserva una prueba cuyo nombre dice que supervisor no existe en la jerarquía. Esa comprobación usa una jerarquía simulada anterior; no afirma que el rol falte en Codigo 19. Su aislamiento y capacidades actuales se prueban en la suite específica de supervisión. No se cambió la lógica de las suites para hacerlas pasar.

No se realizaron llamadas reales a proveedores, publicaciones, emisiones de certificados, envíos, creación de usuarios ni cambios de datos en producción. No se ejecutó toda la batería histórica del proyecto. Las pruebas no son una auditoría exhaustiva de seguridad.

Los hechos históricos se apoyan en los cierres locales del 11 al 13 de septiembre. La aprobación del banco y la rotación posterior de Albert son datos que no están incluidos en el portable anterior. Las instrucciones del manual distinguen esos hechos de las comprobaciones pendientes del piloto.

La interfaz se probó en un navegador con un servidor de respuestas ficticias: acceso de participante, catálogo, selector de búsqueda, cierre, acceso de supervisor con su menú, cierre y reconstrucción del catálogo para otra sesión. No aparecieron errores de consola en ese recorrido. En un ancho de 390 píxeles, el documento no presentó desbordamiento horizontal. Esto no prueba las respuestas de Google ni proveedores reales.

El manual Word se convierte a PDF de revisión mediante Microsoft Word y se inspeccionan las imágenes. El conversor habitual del entorno no pudo ejecutarse porque LibreOffice no estaba disponible. Las imágenes y el PDF de revisión son material de control interno, no archivos del paquete.

R4 añade 15 pruebas específicas (pruebas_R4.txt), además de las 107 regresiones ejecutadas sobre Código 21 e Index 7. No se realizó otra prueba de navegador en esta revisión; el recorrido visual descrito antes corresponde a R3. La revisión R4 comprueba su JavaScript con servicios simulados.
