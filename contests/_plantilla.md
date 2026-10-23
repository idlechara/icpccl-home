---
# ─────────────────────────────────────────────────────────────────────────────
# PLANTILLA DE COMPETENCIA
#
# Forma fácil: ejecuta `npm run nueva-competencia` y responde las preguntas.
#
# A mano: copia este archivo como contests/<tipo>-<año>.md (por ejemplo
# contests/tcp-2027.md) y reemplaza cada valor __ENTRE_GUIONES__. El sitio no se
# construye mientras quede alguno. Los archivos que empiezan con "_" (como este)
# no se publican. Todos los campos están explicados en contests/README.md.
#
# Reglas de YAML que suelen romper el archivo:
#   - Respeta la indentación (2 espacios, nunca tabulaciones).
#   - Si un texto tiene ":" o empieza con "[", "{", "#" o "*", ponlo entre comillas.
#   - Las horas van entre comillas en la agenda: ["10:00", "Recepción"].
# ─────────────────────────────────────────────────────────────────────────────

name: __NOMBRE__                    # p. ej. TCP 2027 o ICPC South America/South Finals 2027
kind: __TIPO__                      # tcp o regional (decide si aparece en /tcp/ o /icpc/)
navLabel: __ETIQUETA__              # texto corto: TCP o Regional
summary: __RESUMEN__                # una o dos frases para la portada
place: __LUGAR__                    # p. ej. Universidad Católica del Maule, Talca
# mapUrl: https://maps.app.goo.gl/...   # opcional: enlace al mapa del lugar
# placeLogo: sede.png                   # opcional: logo en src/img/sedes/
# placeLogoWhite: true                  # opcional: si el logo es blanco
dates: __FECHAS__                   # en texto, p. ej. 6 y 7 de noviembre de 2027

# Inicio y término de la competencia, con zona horaria de Chile.
# Marzo-septiembre suele ser -04:00 y septiembre-abril -03:00: revisa la fecha.
start: __INICIO__                   # p. ej. 2027-11-06T14:00:00-03:00
end: __TERMINO__                    # cuándo deja de mostrarse como próxima

registration:
  status: soon                      # soon (aún no abierta), open (abierta) o closed (cerrada)
  url:                              # obligatorio si status es open
  deadline: __PLAZO__               # en texto, p. ej. 20 de octubre

# Tarjetas de datos (opcional). Borra las que no apliquen.
facts:
  - label: Plazo
    value: __PLAZO__
    text: Fecha límite para inscribir equipos.

# Programa (opcional). Agrega `main` como tercer valor para destacar una fila.
# Programa base del Regional ICPC (día anterior + día de competencia). Para el TCP,
# basta con el día de la competencia: recepción, warmup, competencia y cierre.
agenda:
  # - title: Viernes 6 de noviembre   # día anterior (Regional ICPC)
  #   items:
  #     - ["15:00", "Registro, entrega de materiales y ceremonia de bienvenida"]
  #     - ["18:00", "Warmup"]
  - title: __DIA__                  # p. ej. Sábado 7 de noviembre
    items:
      # - ["10:00", "Llegada de equipos y coaches"]
      # - ["11:00", "Fotos oficiales"]
      # - ["12:30", "Colación"]
      - ["__HORA__", "Competencia", main]
      # - ["20:00", "Cena y premiación"]

# Sedes (opcional, sobre todo para el TCP):
# sites:
#   - Arica (UTA)
#   - Talca (UCM)

# Botones extra (opcional):
# links:
#   - label: Reglas (PDF)
#     url: /archivo.pdf

# Resultados, se muestran cuando la competencia termina (opcional):
# results:
#   - label: Marcador
#     url: https://...
---
__DESCRIPCION__

<!--
Preguntas frecuentes de esta edición (opcional): una pregunta en negrita en su
propia línea y la respuesta debajo. Indica siempre si aplica al TCP o al Regional.

**¿Cuándo es el __NOMBRE__?**
Respuesta.
-->
