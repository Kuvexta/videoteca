# Suite de pruebas locales — Videoteca Certificable

Son las comprobaciones que se citan en cada entrega. Están aquí para que se
puedan ejecutar y contar, en vez de tener que creerse el número.

## Cómo se ejecutan

Hace falta Node (cualquier versión reciente). Desde esta carpeta:

```
node probe_624.js          # la más completa: las tres revisiones de seguridad
node probe_615.js          # duplicados y URLs que no son videos
for f in probe_*.js; do node "$f"; done
```

Cada una imprime sus comprobaciones y termina con `N ok, M fallan`. El código de
salida es 0 si no falla ninguna, así que sirven para un `if` en un script.

Para contarlas todas:

```
total=0
for f in probe_*.js; do
  n=$(node "$f" | grep -E '^[0-9]+ ok' | tail -1 | cut -d' ' -f1)
  total=$((total + ${n:-0}))
done
echo "$total comprobaciones"
```

Con la 6.33 salen **761**. `probe_taxo.js` no suma: es un diagnóstico que imprime
cómo clasifica la taxonomía unos títulos de ejemplo, sin comprobaciones.

## Qué hay aquí

| Archivo | Papel |
|---|---|
| `mockgas.js` | Simulador de Apps Script: hojas, propiedades, caché, Drive, YouTube, UrlFetch. Es la pieza que permite ejecutar el servidor real fuera de Google |
| `GAS_v2026.5.0.js` | El servidor, con el nombre que esperan las pruebas. Es el mismo archivo que se pega en Apps Script |
| `Index.html` | El portal; dos pruebas comprueban cosas sobre él |
| `catalogo_real.tsv` | 4.997 filas reales, reconstruidas del export del 11/9. Solo URL, ID y título |
| `lote_sst.tsv` | Un lote real de seguridad y salud en el trabajo, para las pruebas de clasificación |
| `menu_funciones_v612.txt` | Las 145 funciones que tenía el menú en la 6.12; sirve para exigir que ninguna se perdió |
| `probe_6NN.js` | Una por versión. El número dice en qué versión se escribió, no en cuál corre: todas corren contra el servidor actual |

Todas las rutas son relativas a esta carpeta. Si alguna prueba busca un archivo
en otro sitio, es un error: ya pasó una vez con `probe_623.js`.

## Lo que estas pruebas NO son

Corren contra servicios simulados. **No prueban Apps Script**: ni permisos, ni
disparadores, ni cuotas, ni el despliegue. Un simulador que se comporte más
amablemente que Google haría pasar una prueba que allí fallaría — por eso imita
también lo que Google prohíbe: no deja borrar la última hoja, `getSheets()`
devuelve una instantánea y no la lista viva, `getUi()` lanza cuando no hay hoja
delante, y el lote de YouTube cuenta las consultas.

Ese último detalle es el que hace útiles las pruebas de seguridad:
`__conInterfaz(false)` deja el entorno exactamente en el de una llamada desde el
portal, que es el del atacante. Y contar llamadas permite exigir «cero
consultas» en vez de conformarse con «no devolvió datos», que es una diferencia
que ha importado dos veces.

## Si una prueba falla después de tocar el código

El nombre dice qué se rompió. Tres avisos por experiencia propia:

- Varias comprobaciones leen el TEXTO del servidor para verificar el ORDEN de
  las cosas: que la guarda va antes de la lectura, que el volcado va antes del
  corte, que la comprobación de tiempo va antes de la llamada a la API. Si se
  reordena el código a propósito, hay que actualizarlas.
- Ninguna debería fallar por haber escrito un comentario. Si pasa, la prueba
  está mal escrita: mide posiciones dentro de una ventana fija de caracteres en
  vez de dentro de la función. Ya ocurrió y se corrigió.
- Cuidado con los valores por defecto en las comprobaciones. Un
  `parseInt(PROPS.X || "0") <= 151` acepta que la propiedad no exista, porque
  la convierte en cero: el valor ausente y el correcto dan el mismo veredicto.
  Si se espera un valor concreto, hay que exigirlo exacto. Ya coló una vez.
- Las que comprueban una firma literal (`volcarSiToca(true, filaSheet)`, la
  forma del retorno del enriquecedor) se rompen al cambiar un parámetro. Es
  intencionado: obligan a mirar si el cambio afecta a la garantía que defienden.

## Un detalle del simulador que cuesta descubrir solo

La red simulada es instantánea, así que un corte por tiempo a mitad de bloque
nunca se dispara por sí solo: el bloque termina antes de que venza el plazo. La
prueba del corte con la hoja caída sustituye `UrlFetchApp.fetch` por una versión
que tarda 30 ms, para que la primera fila pase y la segunda encuentre el plazo
vencido —que es el único escenario donde hay algo hecho y sin guardar—. Si se
escribe una prueba de tiempo y sale «no cortó», casi siempre es esto.
