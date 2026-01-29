function resetAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const keepSheet = 'default';
  ss.getSheets().forEach(sheet => {
    if (sheet.getName() !== keepSheet) {
      ss.deleteSheet(sheet);
    }
  });

  if (!ss.getSheetByName(keepSheet)) {
    ss.insertSheet(keepSheet).getRange(1, 1).setValue('Default sheet');
  }

  const sheets = [
    { name: '1_clients', headers: ['id', 'name', 'email', 'phone', 'address', 'notes'] },
    { name: '2_providers', headers: ['id', 'name', 'email', 'phone', 'address', 'notes'] },
    { name: '3_products', headers: ['id', 'name', 'sku', 'price', 'stock', 'providerId', 'notes'] },
    { name: '4_documents', headers: ['id', 'clientId', 'type', 'date', 'status', 'total', 'docLink', 'notes'] },
    { name: '5_documentItems', headers: ['id', 'documentId', 'productId', 'description', 'quantity', 'unitPrice', 'lineTotal'] },
    { name: '6_documentTypes', headers: ['type', 'reducesStock'] },
    { name: '7_documentStatuses', headers: ['status'] }
  ];

  sheets.forEach(item => {
    const sheet = ss.insertSheet(item.name);
    sheet.getRange(1, 1, 1, item.headers.length).setValues([item.headers]);
    sheet.getRange(1, 1, 1, item.headers.length).setFontWeight('bold');
  });
}
