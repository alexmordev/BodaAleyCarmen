# Imágenes pendientes de reemplazar

El sitio se reimplementó fielmente a partir del diseño de Claude Design
("Alejandro & Carmen"). La API de Claude Design limita la descarga de
archivos a 256 KB, y las fotos originales (JPEG de cámara, ~6000×4000 px)
pesan mucho más, así que se descargarían truncadas/corruptas. Por eso las
imágenes actuales en `src/assets/images/` son **placeholders** (rectángulo
con etiqueta), no las fotos reales.

## Cómo reemplazarlas

Sustituye cada archivo por la foto definitiva usando **exactamente el mismo
nombre y extensión** — el sitio los recoge automáticamente en el próximo
`npm run build` (no hace falta tocar `App.jsx`).

| Sección                       | Archivo a reemplazar (en `src/assets/images/`) |
|--------------------------------|-------------------------------------------------|
| Hero / portada (silla)          | `nosotros-sillon.jpg`                            |
| Cena, primera cita              | `nosotros-cena.jpg`                              |
| Pedida — foto 1                 | `propuesta.jpg`                                  |
| Pedida — foto 2 (anillo)        | `anillo-flores.jpg`                              |
| El lugar (hacienda)             | `hacienda.webp`                                  |

## Notas

- **Versión web (responsive):** el sitio ya no es solo la columna móvil de
  440 px. En escritorio (≥1200 px) el hero se muestra a dos columnas y la
  hacienda a lado del texto, así que esas fotos se ven **mucho más grandes**
  que en el teléfono. Conviene que `nosotros-sillon.jpg` (hero) y
  `hacienda.webp` (lugar) sean nítidas a ~1200 px de ancho para que no se
  vean borrosas en pantallas grandes. Mismo nombre de archivo, solo mayor
  resolución.
- El gato animado (`CatWalker`) ya no usa una imagen (`gato.png`); ahora es
  un SVG inline estilo "El Cadáver de la Novia", tal cual viene del diseño.
- El pipeline `scripts/process-assets.mjs` quedó del diseño anterior y ya
  no coincide con estos nombres de archivo — no ejecutarlo hasta
  actualizarlo. Por ahora, coloca las fotos a mano con el nombre exacto de
  la tabla de arriba.
