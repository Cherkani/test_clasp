const SHEETS = {
  clients: 'Clients',
  providers: 'Providers',
  products: 'Products',
  documents: 'Documents',
  documentItems: 'DocumentItems'
};

const DOCUMENT_TYPES = [
  'bande_commande',
  'facture',
  'devis',
  'bp'
];

const TAX_RATE = 0.2;
const STOCK_IMPACT_TYPES = new Set(['bande_commande', 'facture', 'bp']);
const SPREADSHEET_ID = '1YnY0ZQFWanUxoZGpQ9Y4bTS4QOmgMTbjLdPNKxP6mW0';

function doGet() {
  const template = HtmlService.createTemplateFromFile('index');
  return template
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getAppData() {
  const clients = getEntities(SHEETS.clients, clientHeaders());
  const providers = getEntities(SHEETS.providers, providerHeaders());
  const products = getEntities(SHEETS.products, productHeaders());
  const documents = getEntities(SHEETS.documents, documentHeaders());
  const documentItems = getEntities(SHEETS.documentItems, documentItemHeaders());
  const inventory = buildInventory(products);

  return {
    clients,
    providers,
    products,
    documents,
    documentItems,
    inventory,
    taxRate: TAX_RATE,
    documentTypes: DOCUMENT_TYPES
  };
}

function saveClient(client) {
  return saveEntity(SHEETS.clients, clientHeaders(), client);
}

function saveProvider(provider) {
  return saveEntity(SHEETS.providers, providerHeaders(), provider);
}

function saveProduct(product) {
  return saveEntity(SHEETS.products, productHeaders(), product);
}

function deleteClient(clientId) {
  return deleteEntity(SHEETS.clients, clientId, clientHeaders());
}

function deleteProvider(providerId) {
  return deleteEntity(SHEETS.providers, providerId, providerHeaders());
}

function deleteProduct(productId) {
  return deleteEntity(SHEETS.products, productId, productHeaders());
}

function deleteDocument(documentId) {
  const ss = getSpreadsheet();
  const docSheet = ensureSheet(ss, SHEETS.documents, documentHeaders());
  const itemSheet = ensureSheet(ss, SHEETS.documentItems, documentItemHeaders());
  const productSheet = ensureSheet(ss, SHEETS.products, productHeaders());

  const documents = getSheetData(docSheet);
  const items = getSheetData(itemSheet);

  const docRowIndex = documents.findIndex(row => String(row[0]) === String(documentId));
  if (docRowIndex === -1) return false;

  const document = mapRowToObject(documents[docRowIndex], documentHeaders());
  const existingItems = items.filter(row => String(row[1]) === String(documentId));

  if (STOCK_IMPACT_TYPES.has(document.type)) {
    applyStockAdjustment(productSheet, existingItems, 1);
  }

  docSheet.deleteRow(docRowIndex + 2);
  deleteItemsByDocument(itemSheet, documentId);
  return true;
}

function saveDocument(payload) {
  const ss = getSpreadsheet();
  const docSheet = ensureSheet(ss, SHEETS.documents, documentHeaders());
  const itemSheet = ensureSheet(ss, SHEETS.documentItems, documentItemHeaders());
  const productSheet = ensureSheet(ss, SHEETS.products, productHeaders());

  const documents = getSheetData(docSheet);
  const items = getSheetData(itemSheet);

  const document = payload.document;
  const docId = document.id ? String(document.id) : String(getNextId(documents));
  const existingDocIndex = documents.findIndex(row => String(row[0]) === docId);
  const existingDoc = existingDocIndex >= 0
    ? mapRowToObject(documents[existingDocIndex], documentHeaders())
    : null;
  const existingItems = items.filter(row => String(row[1]) === docId);

  const normalizedItems = (payload.items || []).map((item, index) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const lineTotal = Math.max(0, (quantity * unitPrice) - discount);
    return {
      id: item.id || `${docId}-${index + 1}`,
      documentId: docId,
      productId: item.productId || '',
      description: item.description || '',
      quantity,
      unitPrice,
      discount,
      lineTotal
    };
  });

  const totals = normalizedItems.reduce((acc, item) => {
    acc.subtotal += item.lineTotal;
    return acc;
  }, { subtotal: 0 });
  const taxAmount = totals.subtotal * TAX_RATE;
  const grandTotal = totals.subtotal + taxAmount;

  const documentRecord = {
    id: docId,
    type: document.type || 'facture',
    number: document.number || generateDocumentNumber(document.type || 'facture'),
    date: document.date || new Date(),
    clientId: document.clientId || '',
    providerId: document.providerId || '',
    status: document.status || 'open',
    notes: document.notes || '',
    subtotal: totals.subtotal,
    taxRate: TAX_RATE,
    taxAmount,
    total: grandTotal
  };

  if (existingDoc && STOCK_IMPACT_TYPES.has(existingDoc.type)) {
    applyStockAdjustment(productSheet, existingItems, 1);
  }

  if (STOCK_IMPACT_TYPES.has(documentRecord.type)) {
    applyStockAdjustment(productSheet, normalizedItems, -1);
  }

  upsertRow(docSheet, documentHeaders(), documentRecord, existingDocIndex);
  deleteItemsByDocument(itemSheet, docId);
  if (normalizedItems.length > 0) {
    const rows = normalizedItems.map(item => mapObjectToRow(item, documentItemHeaders()));
    itemSheet.getRange(itemSheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }

  return { id: docId };
}

function clientHeaders() {
  return ['id', 'name', 'phone', 'email', 'address', 'city', 'notes'];
}

function providerHeaders() {
  return ['id', 'name', 'phone', 'email', 'address', 'city', 'notes'];
}

function productHeaders() {
  return ['id', 'sku', 'name', 'unit', 'purchasePrice', 'salePrice', 'stock', 'providerId'];
}

function documentHeaders() {
  return ['id', 'type', 'number', 'date', 'clientId', 'providerId', 'status', 'notes', 'subtotal', 'taxRate', 'taxAmount', 'total'];
}

function documentItemHeaders() {
  return ['id', 'documentId', 'productId', 'description', 'quantity', 'unitPrice', 'discount', 'lineTotal'];
}

function getEntities(sheetName, headers) {
  const ss = getSpreadsheet();
  const sheet = ensureSheet(ss, sheetName, headers);
  return getSheetData(sheet).map(row => mapRowToObject(row, headers));
}

function saveEntity(sheetName, headers, entity) {
  const ss = getSpreadsheet();
  const sheet = ensureSheet(ss, sheetName, headers);
  const data = getSheetData(sheet);
  const id = entity.id ? String(entity.id) : String(getNextId(data));
  const rowIndex = data.findIndex(row => String(row[0]) === id);
  const record = { ...entity, id };
  upsertRow(sheet, headers, record, rowIndex);
  return { id };
}

function deleteEntity(sheetName, entityId, headers = []) {
  const ss = getSpreadsheet();
  const sheet = ensureSheet(ss, sheetName, headers);
  const data = getSheetData(sheet);
  const rowIndex = data.findIndex(row => String(row[0]) === String(entityId));
  if (rowIndex === -1) return false;
  sheet.deleteRow(rowIndex + 2);
  return true;
}

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (headers.length > 0) {
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
      const matches = headers.every((header, index) => String(existing[index] || '').trim() === header);
      const rowEmpty = existing.every(value => String(value || '').trim() === '');
      if (!matches) {
        if (rowEmpty) {
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        } else {
          sheet.insertRowBefore(1);
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        }
      }
    }
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function getSheetData(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  return values.slice(1).filter(row => row.join('') !== '');
}

function mapRowToObject(row, headers) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
}

function mapObjectToRow(obj, headers) {
  return headers.map(header => obj[header] !== undefined ? obj[header] : '');
}

function upsertRow(sheet, headers, record, rowIndex) {
  const row = mapObjectToRow(record, headers);
  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 2, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function getNextId(rows) {
  if (!rows || rows.length === 0) return 1;
  const ids = rows.map(row => Number(row[0])).filter(Number.isFinite);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

function deleteItemsByDocument(sheet, documentId) {
  const values = getSheetData(sheet);
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][1]) === String(documentId)) {
      sheet.deleteRow(i + 2);
    }
  }
}

function applyStockAdjustment(productSheet, items, multiplier) {
  if (!items || items.length === 0) return;
  const productData = getSheetData(productSheet);
  const headers = productHeaders();

  items.forEach(itemRow => {
    const item = Array.isArray(itemRow) ? mapRowToObject(itemRow, documentItemHeaders()) : itemRow;
    const productId = String(item.productId || '');
    if (!productId) return;
    const rowIndex = productData.findIndex(row => String(row[0]) === productId);
    if (rowIndex === -1) return;
    const product = mapRowToObject(productData[rowIndex], headers);
    const quantity = Number(item.quantity) || 0;
    const currentStock = Number(product.stock) || 0;
    product.stock = currentStock + (quantity * multiplier);
    productSheet.getRange(rowIndex + 2, 1, 1, headers.length).setValues([mapObjectToRow(product, headers)]);
  });
}

function buildInventory(products) {
  return (products || []).map(product => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    unit: product.unit,
    stock: Number(product.stock) || 0,
    salePrice: Number(product.salePrice) || 0,
    providerId: product.providerId || ''
  }));
}

function generateDocumentNumber(type) {
  const prefix = type ? type.substring(0, 2).toUpperCase() : 'DOC';
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  return `${prefix}-${timestamp}`;
}
