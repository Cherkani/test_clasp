function doGet() {
  const template = HtmlService.createTemplateFromFile('index');
  return template
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function ensureSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function getNextId(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 1;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const numericIds = ids.filter(id => id !== '' && id != null).map(Number);
  return numericIds.length ? Math.max(...numericIds) + 1 : 1;
}

function getClients() {
  const sheet = ensureSheet('1_clients', ['id', 'name', 'email', 'phone', 'address', 'notes']);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  return values.slice(1)
    .filter(row => row.join('') !== '')
    .map(row => ({
      id: row[0],
      name: row[1] || '',
      email: row[2] || '',
      phone: row[3] || '',
      address: row[4] || '',
      notes: row[5] || ''
    }));
}

function addClient(client) {
  const sheet = ensureSheet('1_clients', ['id', 'name', 'email', 'phone', 'address', 'notes']);
  const newId = getNextId(sheet);
  sheet.appendRow([
    newId,
    client.name,
    client.email || '',
    client.phone || '',
    client.address || '',
    client.notes || ''
  ]);
  return newId;
}

function updateClient(client) {
  const sheet = ensureSheet('1_clients', ['id', 'name', 'email', 'phone', 'address', 'notes']);
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === client.id);
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 2, 1, 5).setValues([[
      client.name,
      client.email || '',
      client.phone || '',
      client.address || '',
      client.notes || ''
    ]]);
    return true;
  }
  return false;
}

function deleteClient(clientId) {
  const sheet = ensureSheet('1_clients', ['id', 'name', 'email', 'phone', 'address', 'notes']);
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === clientId);
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return true;
  }
  return false;
}

function getProviders() {
  const sheet = ensureSheet('2_providers', ['id', 'name', 'email', 'phone', 'address', 'notes']);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  return values.slice(1)
    .filter(row => row.join('') !== '')
    .map(row => ({
      id: row[0],
      name: row[1] || '',
      email: row[2] || '',
      phone: row[3] || '',
      address: row[4] || '',
      notes: row[5] || ''
    }));
}

function addProvider(provider) {
  const sheet = ensureSheet('2_providers', ['id', 'name', 'email', 'phone', 'address', 'notes']);
  const newId = getNextId(sheet);
  sheet.appendRow([
    newId,
    provider.name,
    provider.email || '',
    provider.phone || '',
    provider.address || '',
    provider.notes || ''
  ]);
  return newId;
}

function updateProvider(provider) {
  const sheet = ensureSheet('2_providers', ['id', 'name', 'email', 'phone', 'address', 'notes']);
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === provider.id);
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 2, 1, 5).setValues([[
      provider.name,
      provider.email || '',
      provider.phone || '',
      provider.address || '',
      provider.notes || ''
    ]]);
    return true;
  }
  return false;
}

function deleteProvider(providerId) {
  const sheet = ensureSheet('2_providers', ['id', 'name', 'email', 'phone', 'address', 'notes']);
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === providerId);
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return true;
  }
  return false;
}

function getProducts() {
  const sheet = ensureSheet('3_products', ['id', 'name', 'sku', 'price', 'stock', 'providerId', 'notes']);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  return values.slice(1)
    .filter(row => row.join('') !== '')
    .map(row => ({
      id: row[0],
      name: row[1] || '',
      sku: row[2] || '',
      price: Number(row[3]) || 0,
      stock: Number(row[4]) || 0,
      providerId: row[5] || '',
      notes: row[6] || ''
    }));
}

function addProduct(product) {
  const sheet = ensureSheet('3_products', ['id', 'name', 'sku', 'price', 'stock', 'providerId', 'notes']);
  const newId = getNextId(sheet);
  sheet.appendRow([
    newId,
    product.name,
    product.sku || '',
    product.price || 0,
    product.stock || 0,
    product.providerId || '',
    product.notes || ''
  ]);
  return newId;
}

function updateProduct(product) {
  const sheet = ensureSheet('3_products', ['id', 'name', 'sku', 'price', 'stock', 'providerId', 'notes']);
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === product.id);
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 2, 1, 6).setValues([[
      product.name,
      product.sku || '',
      product.price || 0,
      product.stock || 0,
      product.providerId || '',
      product.notes || ''
    ]]);
    return true;
  }
  return false;
}

function deleteProduct(productId) {
  const sheet = ensureSheet('3_products', ['id', 'name', 'sku', 'price', 'stock', 'providerId', 'notes']);
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === productId);
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return true;
  }
  return false;
}

function getDocuments() {
  const sheet = ensureSheet('4_documents', ['id', 'clientId', 'type', 'date', 'status', 'total', 'docLink', 'notes']);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const tz = Session.getScriptTimeZone();
  const formatDate = (value) => {
    if (!value) return '';
    if (Object.prototype.toString.call(value) === '[object Date]') {
      return Utilities.formatDate(value, tz, 'yyyy-MM-dd');
    }
    return String(value);
  };
  return values.slice(1)
    .filter(row => row.join('') !== '')
    .map(row => ({
      id: row[0],
      clientId: row[1] || '',
      type: row[2] || '',
      date: formatDate(row[3] || ''),
      status: row[4] || '',
      total: Number(row[5]) || 0,
      docLink: row[6] || '',
      notes: row[7] || ''
    }));
}

function getDocumentTypes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('6_documentTypes');
  if (!sheet) {
    return [
      { type: 'bon de commande', reducesStock: true },
      { type: 'tax', reducesStock: true },
      { type: 'devis', reducesStock: false },
      { type: 'bt', reducesStock: true }
    ];
  }
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return [
      { type: 'bon de commande', reducesStock: true },
      { type: 'tax', reducesStock: true },
      { type: 'devis', reducesStock: false },
      { type: 'bt', reducesStock: true }
    ];
  }
  return values.slice(1)
    .filter(row => row[0] !== '' && row[0] != null)
    .map(row => ({
      type: String(row[0]),
      reducesStock: parseBoolean(row[1])
    }));
}

function getDocumentStatuses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('7_documentStatuses');
  if (!sheet) return ['draft', 'sent', 'paid', 'cancelled'];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return ['draft', 'sent', 'paid', 'cancelled'];
  return values.slice(1)
    .map(row => row[0])
    .filter(value => value !== '' && value != null)
    .map(String);
}

function parseBoolean(value) {
  if (value === true) return true;
  if (typeof value === 'string') {
    return ['true', 'yes', '1'].includes(value.toLowerCase());
  }
  return Number(value) === 1;
}

function getDocumentItems() {
  const sheet = ensureSheet('5_documentItems', ['id', 'documentId', 'productId', 'description', 'quantity', 'unitPrice', 'lineTotal']);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  return values.slice(1)
    .filter(row => row.join('') !== '')
    .map(row => ({
      id: row[0],
      documentId: row[1] || '',
      productId: row[2] || '',
      description: row[3] || '',
      quantity: Number(row[4]) || 0,
      unitPrice: Number(row[5]) || 0,
      lineTotal: Number(row[6]) || 0
    }));
}

function addDocument(document, items) {
  const documentSheet = ensureSheet('4_documents', ['id', 'clientId', 'type', 'date', 'status', 'total', 'docLink', 'notes']);
  const itemsSheet = ensureSheet('5_documentItems', ['id', 'documentId', 'productId', 'description', 'quantity', 'unitPrice', 'lineTotal']);
  const newId = getNextId(documentSheet);
  const total = (items || []).reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);

  documentSheet.appendRow([
    newId,
    document.clientId,
    document.type,
    document.date || '',
    document.status || '',
    total,
    document.docLink || '',
    document.notes || ''
  ]);

  if (items && items.length) {
    const itemRows = items.map((item) => [
      getNextId(itemsSheet),
      newId,
      item.productId || '',
      item.description || '',
      item.quantity || 0,
      item.unitPrice || 0,
      item.lineTotal || 0
    ]);
    itemsSheet.getRange(itemsSheet.getLastRow() + 1, 1, itemRows.length, itemRows[0].length)
      .setValues(itemRows);
  }

  return newId;
}

function updateDocument(document, items) {
  const documentSheet = ensureSheet('4_documents', ['id', 'clientId', 'type', 'date', 'status', 'total', 'docLink', 'notes']);
  const itemsSheet = ensureSheet('5_documentItems', ['id', 'documentId', 'productId', 'description', 'quantity', 'unitPrice', 'lineTotal']);
  const values = documentSheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === document.id);
  if (rowIndex <= 0) return false;

  const total = (items || []).reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);

  documentSheet.getRange(rowIndex + 1, 2, 1, 7).setValues([[
    document.clientId,
    document.type,
    document.date || '',
    document.status || '',
    total,
    document.docLink || '',
    document.notes || ''
  ]]);

  const itemValues = itemsSheet.getDataRange().getValues();
  for (let i = itemValues.length - 1; i >= 1; i--) {
    if (itemValues[i][1] === document.id) {
      itemsSheet.deleteRow(i + 1);
    }
  }

  if (items && items.length) {
    const itemRows = items.map((item) => [
      getNextId(itemsSheet),
      document.id,
      item.productId || '',
      item.description || '',
      item.quantity || 0,
      item.unitPrice || 0,
      item.lineTotal || 0
    ]);
    itemsSheet.getRange(itemsSheet.getLastRow() + 1, 1, itemRows.length, itemRows[0].length)
      .setValues(itemRows);
  }

  return true;
}

function deleteDocument(documentId) {
  const documentSheet = ensureSheet('4_documents', ['id', 'clientId', 'type', 'date', 'status', 'total', 'docLink', 'notes']);
  const itemsSheet = ensureSheet('5_documentItems', ['id', 'documentId', 'productId', 'description', 'quantity', 'unitPrice', 'lineTotal']);
  const values = documentSheet.getDataRange().getValues();
  const rowIndex = values.findIndex(row => row[0] === documentId);
  if (rowIndex <= 0) return false;
  documentSheet.deleteRow(rowIndex + 1);

  const itemValues = itemsSheet.getDataRange().getValues();
  for (let i = itemValues.length - 1; i >= 1; i--) {
    if (itemValues[i][1] === documentId) {
      itemsSheet.deleteRow(i + 1);
    }
  }
  return true;
}

function getAppData() {
  return {
    clients: getClients(),
    providers: getProviders(),
    products: getProducts(),
    documents: getDocuments(),
    documentItems: getDocumentItems(),
    documentTypes: getDocumentTypes(),
    documentStatuses: getDocumentStatuses()
  };
}
