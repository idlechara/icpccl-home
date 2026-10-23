# Ediciones

Cada carpeta es una edición de una competencia, con nombre `AAAA_MM_tipo`: el año y el mes en que se juega, y el tipo, `tcp` o `icpc`. Por ejemplo, `2026_10_tcp` y `2026_11_icpc`. El sitio no se construye si el nombre no coincide con la fecha de `start`.

```
ediciones/
  2026_11_icpc/
    competencia.md      ← datos, descripción y preguntas de la edición
    mapa-ucm.pdf        ← archivos de la edición (PDF, logos de la sede y de auspiciadores)
    logo-ucm.png
```

- Cada edición tiene su propia página permanente: `/icpc/2026/`, `/tcp/2026/`. Ahí quedan sus resultados y auspiciadores aunque pasen los años.
- `/icpc/` y `/tcp/` muestran la próxima edición o, si no hay, la más reciente, y debajo enlazan a las anteriores.
- La portada muestra las que aún no terminan (según `end`), ordenadas por fecha; la más próxima ocupa la cabecera con la cuenta regresiva. "Aún no terminan" se evalúa al construir el sitio: después de cada competencia hay que volver a construir y publicar.
- Los archivos de la carpeta (`pdf`, `png`, `jpg`, `jpeg`, `svg`, `webp`) se publican junto a la página: `ediciones/2026_11_icpc/mapa-ucm.pdf` queda en `/icpc/2026/mapa-ucm.pdf`. En `competencia.md` basta con el nombre del archivo (`url: mapa-ucm.pdf`).

Para agregar una edición:

- **Con el asistente (recomendado):** ejecuta `npm run nueva-competencia`. Pregunta el tipo, el inicio, el lugar, el plazo y un resumen; crea la carpeta con su `competencia.md` y prueba que el sitio se construya. Después completa el resto del archivo (tarjetas, agenda, sedes, enlaces) y deja los archivos en la carpeta.
- **A mano:** crea la carpeta, copia `_plantilla.md` dentro como `competencia.md` y reemplaza cada valor `__ENTRE_GUIONES__`. El sitio no se construye mientras quede alguno, y el error indica cuáles faltan.

Las carpetas y archivos que empiezan con `_` (como la plantilla) no se publican. Con `npm start` corriendo, reinícialo después de crear una carpeta nueva para que se publiquen sus archivos.

## Campos

| Campo | Obligatorio | Descripción |
|---|---|---|
| `name` | sí | Nombre visible (título de la sección y de la cabecera). |
| `start` | sí | Inicio de la competencia, con zona horaria: `2026-11-07T14:00:00-03:00`. Usado por la cuenta regresiva. |
| `end` | no | Cuándo deja de mostrarse. Por defecto, `start` + 5 horas. |
| `eyebrow` | no | Texto pequeño sobre el título de la cabecera. Por defecto, "ICPC Chile". |
| `summary` | no | Párrafo corto para la cabecera. |
| `dates` | no | Fechas en texto ("6 y 7 de noviembre de 2026"). Por defecto, el día de `start`. |
| `place` | no | Lugar. Se muestra bajo el título, junto a las fechas. |
| `placeLogo` | no | Logo del lugar: un archivo de la carpeta (p. ej. `logo-ucm.png`). Se muestra en la portada, bajo la cuenta regresiva y junto a los enlaces `countdown`, sobre fondo blanco. |
| `placeLogoWhite` | no | `true` si el logo es blanco: se muestra sin el fondo blanco, directo sobre el fondo azul. |
| `mapUrl` | no | Enlace al mapa del lugar; si existe, `place` se muestra como enlace. |
| `registration.status` | no | `open`, `soon` (aún no abierta) o `closed`. Por defecto, `open` si hay `url` y `soon` si no. |
| `registration.url` | si `open` | Enlace de inscripción. |
| `registration.deadline` | no | Plazo en texto, se muestra junto a "Abierta hasta el…". |
| `registration.dev` | no | Reemplaza los datos de inscripción solo en el servidor de desarrollo (`npm start`) (p. ej. `status: open` con un enlace de prueba), para ver cómo queda la página antes de tener el enlace real. |
| `registration.note` | no | Reemplaza el texto del aviso cuando está `soon` o `closed`. |
| `facts` | no | Tarjetas de datos: `label`, `value`, `text` (admite markdown en línea). |
| `agenda` | no | Días con `title` e `items`: `["hora", "actividad"]`, o `["hora", "actividad", main]` para destacar. |
| `sites` | no | Lista de sedes. |
| `links` | no | Botones extra: `label`, `url` (un nombre de archivo sin `/` apunta a la carpeta de la edición). Con `dev: true`, el botón solo aparece en el servidor de desarrollo (`npm start`), por ejemplo para un placeholder; staging y producción no lo muestran. Con `countdown: true`, se muestra solo en la portada, bajo la cuenta regresiva (con ícono), y no en la fila de botones de la portada ni de la página de la competencia. Con `home: false`, no aparece en la portada, solo en la página de la competencia. |
| `results` | no | Enlaces a resultados (`label`, `url`), p. ej. marcador e informe. Se muestran cuando la competencia termina, en su página y en "Competencias anteriores". |
| `sponsors` | no | Auspiciadores de la edición: `name`, `id`, `url` (opcional), `row` (línea en que aparece, 1 = arriba) y `logo` (archivo de la carpeta; por defecto, uno nombrado como el `id`). Solo se ven en `npm start` mientras `PUBLIC` sea `false` en `src/_data/sponsors.js`. |
| `faqTitle` | no | Título de sus preguntas en la FAQ. Por defecto, `name`. |

## Cuerpo

El texto debajo del front matter es la descripción de la sección. Si después vienen preguntas con el formato de la FAQ (`**¿Pregunta?**` en su propia línea y la respuesta debajo), se agregan a la FAQ en "Próximas competencias". Indica siempre si la respuesta es del TCP o del Regional ICPC.
