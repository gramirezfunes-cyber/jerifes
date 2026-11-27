# jerifunes
Proyectos de Jeri Funes

---

## Spelling Coach

Plataforma tutor de **spelling en inglés** pensada para una estudiante de 12 años con TDAH y TEA nivel 1.
Se ingresa la lista de palabras de la semana (o del día) y la plataforma entrena cuatro habilidades más un ensayo de examen:

| Paso | Actividad | Qué hace |
|---|---|---|
| 1 | **Escuchar** (Listening) | Oye la palabra y elige la forma bien escrita entre 3 opciones. |
| 2 | **Leer** (Reading) | Lee la palabra en voz alta y la compara con el audio; puede deletrearla. |
| 3 | **Escribir** (Writing) | Oye la palabra (y una frase de ejemplo) y la escribe. Si se equivoca, ve qué letras faltaron y la copia. |
| 4 | **Pronunciar** (Speaking) | Escucha el modelo y la dice al micrófono; la plataforma comprueba si se entendió. |
| 5 | **Ensayo de examen** | Dictado de toda la lista, sin pistas, como en clase. |

Además: **Palabras para repasar** (las que costaron), **Progreso** palabra por palabra, **historial** completo de prácticas, **reportes** (WhatsApp, correo y Google Sheets) y **copia de seguridad**.

## Diseño pensado para TDAH y TEA nivel 1

- **Una sola tarea por pantalla**, con la instrucción siempre arriba y en el mismo lugar.
- **Rondas cortas** (5 palabras por defecto, ajustable de 3 a 20) y **pausa corta** opcional entre rondas, con una sugerencia de movimiento.
- **Ruta predecible** de 5 pasos: siempre sabe qué sigue y cuánto falta (puntos de progreso).
- **Sin cronómetros ni presión de tiempo.** Errores con lenguaje amable ("Casi…") y en color naranja, nunca rojo.
- **Repaso inmediato**: la palabra fallada vuelve al final de la ronda.
- Tipografía **Andika** (diseñada para aprender a leer: letras fáciles de distinguir) y **Lexend** (legibilidad).
- **Modo calma** (sin animaciones), **letra grande**, sonidos opcionales, voz lenta y acento EE. UU. o británico.

## Cómo se guardan los datos

- Las listas, ajustes y **cada práctica** (fecha, actividad, palabra por palabra, respuestas) se guardan automáticamente en el navegador (`localStorage`).
- En **Ajustes → Copia de seguridad** puedes descargar todo en un archivo `.json` y restaurarlo en otro dispositivo.
- Si se abre como artifact de Claude, además se guarda en la nube y se sincroniza entre dispositivos.

> Consejo: usa siempre el mismo dispositivo y navegador (Chrome o Edge), o descarga una copia de seguridad cada semana.

## Reportes para papá o mamá

**1. Reporte para enviar (sin configurar nada).** En **Progreso → Reporte para enviar** se arma un resumen del periodo que elijas (7, 14 o 30 días): días con práctica, aciertos por actividad, palabras que ya escribe bien y palabras para repasar. Se envía con un toque por **WhatsApp** o **correo**, o se copia.

**2. Reporte automático en Google Sheets.** Cada práctica se envía sola a una hoja de Google con tres pestañas:
- **Resumen**: últimos 7 días, % de acierto por actividad y palabras que más le cuestan.
- **Prácticas**: una fila por práctica.
- **Detalle por palabra**: qué escribió en cada palabra y si la acertó al primer intento.

Configuración (una sola vez, unos 5 minutos):
1. Abre la hoja de Google para los reportes → **Extensiones → Apps Script**.
2. Borra lo que haya, pega el contenido de [`google-apps-script/Codigo.gs`](google-apps-script/Codigo.gs) y guarda.
3. **Implementar → Nueva implementación →** tipo **Aplicación web**. *Ejecutar como:* Yo. *Quién tiene acceso:* Cualquier usuario. Autoriza los permisos.
4. Copia la **URL de la aplicación web** (termina en `/exec`).
5. Pégala en la plataforma en **Ajustes → Reporte automático a Google Sheets**, o fíjala en `index.html` en la constante `REPORT_URL` para que funcione en cualquier dispositivo sin configurarlo.
6. Pulsa **Enviar fila de prueba** y revisa la hoja.

Las prácticas hechas sin internet se envían solas cuando vuelve la conexión.

## Publicar en GitHub Pages (5 minutos)

1. Crea un repositorio nuevo en GitHub, por ejemplo `spelling-coach` (puede ser público o privado con Pages).
2. Sube estos archivos (`index.html`, `README.md`, `.nojekyll`) — botón **Add file → Upload files**, o con git:
   ```bash
   git remote add origin https://github.com/gramirezfunes-cyber/jerifes.git
   git branch -M main
   git push -u origin main
   ```
3. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. En 1–2 minutos la plataforma queda en `https://gramirezfunes-cyber.github.io/jerifes/`.
5. En la tablet o computadora de tu hija, abre esa dirección y usa **"Agregar a pantalla de inicio"** para tenerla como app.

## Requisitos

- **Chrome o Edge** recomendados: tienen voz en inglés y reconocimiento de voz (para Pronunciar).
- En Safari/Firefox todo funciona menos el micrófono; en ese caso Pronunciar usa autoevaluación ("La dije bien").
- El micrófono requiere `https://` (GitHub Pages ya lo da) y permiso del navegador.

## Estructura

Todo está en un solo archivo `index.html` (HTML + CSS + JavaScript, sin dependencias ni servidor). Para cambiar algo, edítalo y vuelve a subirlo.

## Formato de la lista

Una palabra por línea. Opcional: una frase de ejemplo después de un guion.

```
friend
because - I am happy because it is Friday.
beautiful
library
```
