const SHEET_ID = "";

const SHEET_CONFIG = {
  feedback: {
    name: "Feedback",
    headers: [
      "Fecha recepción",
      "Fecha usuario",
      "ID",
      "Entendió la plataforma",
      "La usaría",
      "Función más útil",
      "Confía en el anonimato",
      "Formato preferido",
      "Comentarios",
      "Página",
      "Vista",
      "Navegador"
    ],
    row: (data) => [
      new Date(),
      data.createdAt || "",
      data.id || "",
      data.understood || "",
      data.wouldUse || "",
      data.mostUseful || "",
      data.trust || "",
      data.format || "",
      data.comments || "",
      data.page || "",
      data.view || "",
      data.userAgent || ""
    ]
  },
  vent: {
    name: "Desahogos",
    headers: [
      "Fecha recepción",
      "Fecha usuario",
      "ID",
      "Alias",
      "Categoría",
      "Mensaje",
      "Página",
      "Vista",
      "Navegador"
    ],
    row: (data) => [
      new Date(),
      data.createdAt || "",
      data.id || "",
      data.aliasNumber || "",
      data.category || "",
      data.message || "",
      data.page || "",
      data.view || "",
      data.userAgent || ""
    ]
  },
  academic: {
    name: "Consultas",
    headers: [
      "Fecha recepción",
      "Fecha usuario",
      "ID",
      "Alias",
      "Consulta",
      "Página",
      "Vista",
      "Navegador"
    ],
    row: (data) => [
      new Date(),
      data.createdAt || "",
      data.id || "",
      data.aliasNumber || "",
      data.question || "",
      data.page || "",
      data.view || "",
      data.userAgent || ""
    ]
  },
  support: {
    name: "Apoyos",
    headers: [
      "Fecha recepción",
      "Fecha usuario",
      "ID",
      "Publicación",
      "Página",
      "Vista",
      "Navegador"
    ],
    row: (data) => [
      new Date(),
      data.createdAt || "",
      data.id || "",
      data.postIndex || "",
      data.page || "",
      data.view || "",
      data.userAgent || ""
    ]
  }
};

function doGet() {
  return createJsonResponse({
    ok: true,
    message: "Endpoint activo para Plataforma de Apoyo Estudiantil Anónima."
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  let hasLock = false;

  try {
    lock.waitLock(10000);
    hasLock = true;

    const data = parsePayload(event);
    const type = String(data.type || "feedback").trim();
    const config = SHEET_CONFIG[type];

    if (!config) {
      throw new Error("Tipo de registro no reconocido: " + type);
    }

    const spreadsheet = getSpreadsheet();
    const sheet = getOrCreateSheet(spreadsheet, config.name, config.headers);
    sheet.appendRow(config.row(data));

    return createJsonResponse({
      ok: true,
      type,
      sheet: config.name
    });
  } catch (error) {
    return createJsonResponse({
      ok: false,
      error: error.message
    });
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function parsePayload(event) {
  if (!event || !event.postData || !event.postData.contents) {
    throw new Error("No se recibió contenido.");
  }

  return JSON.parse(event.postData.contents);
}

function getSpreadsheet() {
  if (SHEET_ID) {
    return SpreadsheetApp.openById(SHEET_ID);
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("No hay hoja activa. Pega este script desde Extensiones > Apps Script dentro de una Google Sheet o completa SHEET_ID.");
  }

  return spreadsheet;
}

function getOrCreateSheet(spreadsheet, sheetName, headers) {
  const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = firstRow.some((cell) => String(cell).trim() !== "");

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }

  return sheet;
}

function createJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
