# Política de versionado — Videoteca

## Formato

`MM.mm.pp` — tres segmentos de **dos dígitos cada uno** (Mayor . menor . parche).

Ejemplos: `01.00.00`, `01.03.02`, `02.00.00`.

## Regla de etapa (decisión de Andrés, 2026-10-28)

| Primer segmento | Significado |
|---|---|
| **00** | **En construcción**: mientras se crea/desarrolla el producto (pre-definitivo). |
| **01** | **Primer definitivo**: primera versión completa y publicada. |
| **02, 03…** | Definitivos posteriores con cambios incompatibles (MAJOR). |

La versión actual `01.00.00` es el primer definitivo de Videoteca.

## Reglas de incremento

| Cambio | Segmento | Ejemplo |
|---|---|---|
| Cambio incompatible (rompe instalaciones, migración obligatoria, cambios de esquema de la hoja) | **Mayor** `MM+1`, menor y parche a 00 | `01.05.02` → `02.00.00` |
| Funcionalidad nueva compatible (nueva pantalla, nueva función del menú, mejora sustancial) | **menor** `mm+1`, parche a 00 | `01.05.02` → `01.06.00` |
| Correcciones, documentación, ajustes internos | **parche** `pp+1` | `01.05.02` → `01.05.03` |

## Sobre el año en la versión

**El número de versión NO lleva año.** Decisión (2026-10-28): el número es una *secuencia*, no un calendario; el año cambia solo sin alterar el contenido.

- La **fecha** de cada versión vive en el `CHANGELOG.md` y en el tag de git (`01.00.00` → commit con fecha).
- Si algún día se quiere localizar una versión por año: consultar el changelog o los tags (`git tag`), no el número.

## Etiquetas en git

Cada versión publicada lleva un tag con el número exacto, sin prefijo: `01.00.00`, `01.01.00`, etc. La rama principal (`main`) es la versión publicable más reciente.

## Regla de publicación

- Solo se publica una versión con el tag correspondiente tras pasar las comprobaciones propias de la entrega (ver `entregas/`).
- Los datos de participantes nunca viajan en el repositorio ni en los tags.
