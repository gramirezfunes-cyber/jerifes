/**
 * Spelling Coach — receptor de reportes para Google Sheets.
 *
 * Instalación (una sola vez):
 * 1. Abre la hoja de Google donde quieres los reportes.
 * 2. Menú Extensiones → Apps Script. Borra lo que haya y pega TODO este archivo.
 *    Cambia CLAVE_PAPA (más abajo) por tu propia clave y guarda.
 * 3. Botón Implementar → Nueva implementación → tipo "Aplicación web".
 *      Ejecutar como: Yo.   Quién tiene acceso: Cualquier usuario.
 * 4. Autoriza los permisos y copia la "URL de la aplicación web" (termina en /exec).
 * 5. Pega esa URL en Spelling Coach → Ajustes → Reporte automático a Google Sheets.
 *
 * Cada práctica crea o actualiza una fila en "Prácticas" y una fila por palabra en
 * "Detalle por palabra". La pestaña "Resumen" se calcula sola (últimos 7 días).
 */

/**
 * CLAVE DEL PANEL DE PAPÁ: cámbiala por una clave tuya (mínimo 8 caracteres) antes de implementar.
 * La usarás en Spelling Coach → Panel de papá. Sin ella nadie puede leer los resultados.
 */
const CLAVE_PAPA = 'cambia-esta-clave';

const HOJA_PRACTICAS = 'Prácticas';
const HOJA_DETALLE = 'Detalle por palabra';
const HOJA_RESUMEN = 'Resumen';
const ACTIVIDADES = ['Escuchar', 'Leer', 'Escribir', 'Pronunciar', 'Ensayo de examen', 'Repaso'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d && d.accion === 'datos') return leerDatos(d.clave);
    if (!d || !d.id) return salida('sin datos');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const practicas = hoja(ss, HOJA_PRACTICAS, ['ID', 'Fecha', 'Alumna', 'Lista', 'Actividad', 'Bien al primer intento', 'Total de palabras', '% de acierto', 'Minutos', 'Completa', 'Palabras para repasar']);
    const detalle = hoja(ss, HOJA_DETALLE, ['ID', 'Fecha', 'Alumna', 'Lista', 'Actividad', 'Palabra', 'Bien al primer intento', 'Intentos', 'Lo que escribió', 'Usó pista']);
    asegurarResumen(ss);

    const fecha = new Date(d.fecha || Date.now());
    const palabras = Array.isArray(d.palabras) ? d.palabras : [];
    const total = Number(d.total) || 0, bien = Number(d.puntaje) || 0;
    reemplazar(practicas, d.id, [[
      d.id, fecha, texto(d.alumna), texto(d.lista), texto(d.actividad), bien, total,
      total ? bien / total : 0, Number(d.minutos) || 0, d.completa ? 'Sí' : 'No',
      palabras.filter(p => !p.ok).map(p => texto(p.w)).join(', ')
    ]]);
    practicas.getRange('H2:H').setNumberFormat('0%');
    practicas.getRange('B2:B').setNumberFormat('dd/mm/yyyy HH:mm');
    reemplazar(detalle, d.id, palabras.map(p => [
      d.id, fecha, texto(d.alumna), texto(d.lista), texto(d.actividad), texto(p.w),
      p.ok ? 'Sí' : 'No', Number(p.tries) || 1, texto(p.ans), p.hint ? 'Sí' : 'No'
    ]));
    detalle.getRange('B2:B').setNumberFormat('dd/mm/yyyy HH:mm');
    return salida('ok');
  } catch (err) {
    return salida('error: ' + err);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return salida('Spelling Coach: el reporte automático está activo.');
}

/** Devuelve las prácticas al Panel de papá, solo con la clave correcta. */
function leerDatos(clave) {
  if (CLAVE_PAPA === 'cambia-esta-clave' || CLAVE_PAPA.length < 8) return json({ error: 'config' });
  if (String(clave || '') !== CLAVE_PAPA) { Utilities.sleep(1500); return json({ error: 'clave' }); }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const P = ss.getSheetByName(HOJA_PRACTICAS), D = ss.getSheetByName(HOJA_DETALLE);
  const filas = P && P.getLastRow() > 1 ? P.getRange(2, 1, P.getLastRow() - 1, 11).getValues().slice(-1500) : [];
  const practicas = filas.filter(r => r[0]).map(r => ({
    id: r[0], fecha: r[1], alumna: r[2], lista: r[3], actividad: r[4],
    bien: r[5], total: r[6], minutos: r[8], completa: r[9] === 'Sí'
  }));
  const ids = new Set(practicas.map(p => p.id));
  const det = D && D.getLastRow() > 1 ? D.getRange(2, 1, D.getLastRow() - 1, 10).getValues() : [];
  const detalle = det.filter(r => ids.has(r[0])).map(r => ({
    id: r[0], palabra: r[5], ok: r[6] === 'Sí', intentos: r[7], respuesta: r[8], pista: r[9] === 'Sí'
  }));
  return json({ practicas: practicas, detalle: detalle, generado: new Date() });
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function salida(t) {
  return ContentService.createTextOutput(t);
}

/** Evita que un texto se interprete como fórmula. */
function texto(v) {
  const s = String(v == null ? '' : v).slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function hoja(ss, nombre, encabezados) {
  let h = ss.getSheetByName(nombre);
  if (!h) {
    h = ss.insertSheet(nombre);
    h.getRange(1, 1, 1, encabezados.length).setValues([encabezados]).setFontWeight('bold').setBackground('#2847d4').setFontColor('#ffffff');
    h.setFrozenRows(1);
    const hoja1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
    if (hoja1 && hoja1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(hoja1);
  }
  return h;
}

/** Borra las filas anteriores de la misma práctica y escribe las nuevas (una práctica se envía al final de cada ronda). */
function reemplazar(h, id, filas) {
  const n = h.getLastRow();
  if (n > 1) {
    const ids = h.getRange(2, 1, n - 1, 1).getValues();
    for (let i = ids.length - 1; i >= 0; i--) if (ids[i][0] === id) h.deleteRow(i + 2);
  }
  if (filas.length) h.getRange(h.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
}

function asegurarResumen(ss) {
  if (ss.getSheetByName(HOJA_RESUMEN)) return;
  const r = ss.insertSheet(HOJA_RESUMEN, 0);
  const P = "'" + HOJA_PRACTICAS + "'", D = "'" + HOJA_DETALLE + "'";
  const desde = 'TODAY()-6';
  r.getRange('A1').setValue('Resumen de Spelling Coach — últimos 7 días').setFontWeight('bold').setFontSize(14);
  r.getRange('A3:B7').setValues([
    ['Días con práctica', ''],
    ['Prácticas', ''],
    ['Minutos practicados', ''],
    ['Palabras bien al primer intento', ''],
    ['Última práctica', '']
  ]);
  r.getRange('B3').setFormula('=IFERROR(COUNTUNIQUE(FILTER(INT(' + P + '!B2:B),' + P + '!B2:B>=' + desde + ',' + P + '!B2:B<>"")),0)');
  r.getRange('B4').setFormula('=COUNTIF(' + P + '!B2:B,">="&' + desde + ')');
  r.getRange('B5').setFormula('=SUMIFS(' + P + '!I2:I,' + P + '!B2:B,">="&' + desde + ')');
  r.getRange('B6').setFormula('=SUMIFS(' + P + '!F2:F,' + P + '!B2:B,">="&' + desde + ')&" de "&SUMIFS(' + P + '!G2:G,' + P + '!B2:B,">="&' + desde + ')');
  r.getRange('B7').setFormula('=IFERROR(MAX(' + P + '!B2:B),"—")').setNumberFormat('dd/mm/yyyy HH:mm');
  r.getRange('A9:C9').setValues([['Actividad', '% de acierto', 'Prácticas']]).setFontWeight('bold');
  ACTIVIDADES.forEach((a, i) => {
    const row = 10 + i;
    r.getRange(row, 1).setValue(a);
    r.getRange(row, 2).setFormula('=IFERROR(SUMIFS(' + P + '!F2:F,' + P + '!E2:E,A' + row + ',' + P + '!B2:B,">="&' + desde + ')/SUMIFS(' + P + '!G2:G,' + P + '!E2:E,A' + row + ',' + P + '!B2:B,">="&' + desde + '),"—")').setNumberFormat('0%');
    r.getRange(row, 3).setFormula('=COUNTIFS(' + P + '!E2:E,A' + row + ',' + P + '!B2:B,">="&' + desde + ')');
  });
  r.getRange('A17').setValue('Palabras que más le cuestan (últimos 7 días)').setFontWeight('bold');
  r.getRange('A18').setFormula('=IFERROR(TEXTJOIN(", ",TRUE,UNIQUE(FILTER(' + D + '!F2:F,' + D + '!G2:G="No",' + D + '!B2:B>=' + desde + '))),"Ninguna")');
  r.setColumnWidth(1, 300);
  r.setColumnWidth(2, 160);
}
