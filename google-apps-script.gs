var SHEET_ID = "";

function doGet() {
  return createJsonResponse({
    ok: true,
    message: "Endpoint activo para Plataforma de Apoyo Estudiantil Anónima."
  });
}

function doPost(event) {
  var lock = LockService.getScriptLock();
  var hasLock = false;

  try {
    lock.waitLock(10000);
    hasLock = true;

    var data = parsePayload(event);
    var type = String(data.type || "feedback").trim();
    var spreadsheet = getSpreadsheet();
    var sheetName = getSheetName(type);
    var headers = getHeaders(type);
    var row = getRow(type, data);
    var sheet = getOrCreateSheet(spreadsheet, sheetName, headers);

    sheet.appendRow(row);

    return createJsonResponse({
      ok: true,
      type: type,
      sheet: sheetName
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

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("No hay hoja activa. Pega este script desde Extensiones > Apps Script dentro de una Google Sheet o completa SHEET_ID.");
  }

  return spreadsheet;
}

function getSheetName(type) {
  if (type === "feedback") return "Feedback";
  if (type === "vent") return "Desahogos";
  if (type === "academic") return "Consultas";
  if (type === "support") return "Apoyos";

  throw new Error("Tipo de registro no reconocido: " + type);
}

function getHeaders(type) {
  if (type === "feedback") {
    return [
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
    ];
  }

  if (type === "vent") {
    return [
      "Fecha recepción",
      "Fecha usuario",
      "ID",
      "Alias",
      "Categoría",
      "Mensaje",
      "Página",
      "Vista",
      "Navegador"
    ];
  }

  if (type === "academic") {
    return [
      "Fecha recepción",
      "Fecha usuario",
      "ID",
      "Alias",
      "Consulta",
      "Página",
      "Vista",
      "Navegador"
    ];
  }

  if (type === "support") {
    return [
      "Fecha recepción",
      "Fecha usuario",
      "ID",
      "Publicación",
      "Página",
      "Vista",
      "Navegador"
    ];
  }

  throw new Error("Tipo de registro no reconocido: " + type);
}

function getRow(type, data) {
  if (type === "feedback") {
    return [
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
    ];
  }

  if (type === "vent") {
    return [
      new Date(),
      data.createdAt || "",
      data.id || "",
      data.aliasNumber || "",
      data.category || "",
      data.message || "",
      data.page || "",
      data.view || "",
      data.userAgent || ""
    ];
  }

  if (type === "academic") {
    return [
      new Date(),
      data.createdAt || "",
      data.id || "",
      data.aliasNumber || "",
      data.question || "",
      data.page || "",
      data.view || "",
      data.userAgent || ""
    ];
  }

  if (type === "support") {
    return [
      new Date(),
      data.createdAt || "",
      data.id || "",
      data.postIndex || "",
      data.page || "",
      data.view || "",
      data.userAgent || ""
    ];
  }

  throw new Error("Tipo de registro no reconocido: " + type);
}

function getOrCreateSheet(spreadsheet, sheetName, headers) {
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  var firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var hasHeaders = false;

  for (var i = 0; i < firstRow.length; i++) {
    if (String(firstRow[i]).trim() !== "") {
      hasHeaders = true;
      break;
    }
  }

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
