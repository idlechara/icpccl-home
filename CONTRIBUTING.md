# Cómo contribuir

¿Falta información, hay un error o se te ocurre algo útil para el sitio de ICPC Chile? Toda ayuda es bienvenida.

## Sugerir un cambio

La forma más simple es [abrir un issue](https://github.com/idlechara/icpccl-home/issues/new/choose) contando qué falta o qué está mal, en qué página y, si puedes, cómo debería decir. No necesitas saber programar.

## Hacer el cambio tú mismo

La mayor parte del contenido está en archivos de texto (markdown) fáciles de editar, incluso desde la web de GitHub:

- **Preguntas frecuentes:** `faq-tcp-icpc.md` (generales) y `faq-tecnico.md` (para sedes).
- **Competencias** (fechas, inscripción, programa): `contests/`. Los campos están explicados en `contests/README.md`.
- **Equipo:** `src/_data/team.js`.

Para proponer el cambio, haz un fork, edita en una rama nueva y abre un pull request hacia la rama `staging`. Una vez revisado, se publica primero en https://staging.icpc.cl y después en https://icpc.cl.

Algunas reglas del contenido:

- Indica siempre si una respuesta aplica al **TCP**, al **Regional ICPC** o a ambos.
- Escribe en un tono simple y neutral.
- Si quieres probar el sitio en tu computador, abre el proyecto en el devcontainer y ejecuta `npm start`.

Los cambios al ambiente, la construcción y la publicación del sitio (`Dockerfile`, `.github/`, `scripts/`, etc.) requieren la revisión de @idlechara. Si tienes una idea en esa línea, mejor abre un issue primero.
