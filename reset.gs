function resetSalesSheets() {
  const ss = getSpreadsheet();
  const names = ['Clients', 'Providers', 'Products', 'Documents', 'DocumentItems'];
  names.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) ss.deleteSheet(sheet);
  });

  ss.insertSheet('Clients').getRange(1, 1, 1, 7)
    .setValues([['id', 'name', 'phone', 'email', 'address', 'city', 'notes']]);
  ss.insertSheet('Providers').getRange(1, 1, 1, 7)
    .setValues([['id', 'name', 'phone', 'email', 'address', 'city', 'notes']]);
  ss.insertSheet('Products').getRange(1, 1, 1, 8)
    .setValues([['id', 'sku', 'name', 'unit', 'purchasePrice', 'salePrice', 'stock', 'providerId']]);
  ss.insertSheet('Documents').getRange(1, 1, 1, 12)
    .setValues([['id', 'type', 'number', 'date', 'clientId', 'providerId', 'status', 'notes', 'subtotal', 'taxRate', 'taxAmount', 'total']]);
  ss.insertSheet('DocumentItems').getRange(1, 1, 1, 8)
    .setValues([['id', 'documentId', 'productId', 'description', 'quantity', 'unitPrice', 'discount', 'lineTotal']]);

  ['Clients', 'Providers', 'Products', 'Documents', 'DocumentItems'].forEach(name => {
    const sheet = ss.getSheetByName(name);
    const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    range.setFontWeight('bold');
  });
}
