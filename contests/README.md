# Competencias

Cada archivo `.md` de esta carpeta es una competencia. La portada muestra las que aún no terminan (según `end`), ordenadas por fecha; la más próxima ocupa la cabecera con la cuenta regresiva. "Aún no terminan" se evalúa al construir el sitio: después de cada competencia hay que volver a construir y publicar.

Para agregar una competencia:

- **Con el asistente (recomendado):** ejecuta `npm run nueva-competencia`. Pregunta el tipo, el año, el lugar, el inicio, el plazo y un resumen; crea `contests/<tipo>-<año>.md` y prueba que el sitio se construya. Después completa el resto del archivo (tarjetas, agenda, sedes, enlaces).
- **A mano:** copia `_plantilla.md` como `<tipo>-<año>.md` y reemplaza cada valor `__ENTRE_GUIONES__`. El sitio no se construye mientras quede alguno, y el error indica cuáles faltan.

Los archivos que empiezan con `_` (como la plantilla) no se publican.

## Campos

| Campo | Obligatorio | Descripción |
|---|---|---|
| `name` | sí | Nombre visible (título de la sección y de la cabecera). |
| `start` | sí | Inicio de la competencia, con zona horaria: `2026-11-07T14:00:00-03:00`. Usado por la cuenta regresiva. |
| `end` | no | Cuándo deja de mostrarse. Por defecto, `start` + 5 horas. |
| `id` | no | Ancla de la sección (`#id`). Por defecto, el nombre del archivo. |
| `kind` | sí | `regional` (se muestra en /icpc/) o `tcp` (se muestra en /tcp/). |
| `navLabel` | no | Texto en la barra de navegación. Por defecto, `name`. |
| `eyebrow` | no | Texto pequeño sobre el título de la cabecera. Por defecto, "ICPC Chile". |
| `summary` | no | Párrafo corto para la cabecera. |
| `dates` | no | Fechas en texto ("6 y 7 de noviembre de 2026"). Por defecto, el día de `start`. |
| `place` | no | Lugar. Se muestra bajo el título, junto a las fechas. |
| `placeLogo` | no | Logo del lugar: nombre de un archivo en `src/img/sedes/` (p. ej. `ucm.png`). Se muestra junto al lugar en la portada y bajo el título de la competencia. |
| `mapUrl` | no | Enlace al mapa del lugar; si existe, `place` se muestra como enlace. |
| `registration.status` | no | `open`, `soon` (aún no abierta) o `closed`. Por defecto, `open` si hay `url` y `soon` si no. |
| `registration.url` | si `open` | Enlace de inscripción. |
| `registration.deadline` | no | Plazo en texto, se muestra junto a "Abierta hasta el…". |
| `registration.dev` | no | Reemplaza los datos de inscripción solo en el servidor de desarrollo (`npm start`) (p. ej. `status: open` con un enlace de prueba), para ver cómo queda la página antes de tener el enlace real. |
| `registration.note` | no | Reemplaza el texto del aviso cuando está `soon` o `closed`. |
| `facts` | no | Tarjetas de datos: `label`, `value`, `text` (admite markdown en línea). |
| `agenda` | no | Días con `title` e `items`: `["hora", "actividad"]`, o `["hora", "actividad", main]` para destacar. |
| `sites` | no | Lista de sedes. |
| `links` | no | Botones extra: `label`, `url`. Con `dev: true`, el botón solo aparece en el servidor de desarrollo (`npm start`), por ejemplo para un placeholder; staging y producción no lo muestran. Con `countdown: true`, se muestra solo en la portada, bajo la cuenta regresiva (con ícono), y no en la fila de botones de la portada ni de la página de la competencia. Con `home: false`, no aparece en la portada, solo en la página de la competencia. |
| `results` | no | Enlaces a resultados (`label`, `url`), p. ej. marcador e informe. Se muestran en la tarjeta de la competencia en "Competencias anteriores". |
| `faqTitle` | no | Título de sus preguntas en la FAQ. Por defecto, `name`. |

## Cuerpo

El texto debajo del front matter es la descripción de la sección. Si después vienen preguntas con el formato de la FAQ (`**¿Pregunta?**` en su propia línea y la respuesta debajo), se agregan a la FAQ en "Próximas competencias". Indica siempre si la respuesta es del TCP o del Regional ICPC.
