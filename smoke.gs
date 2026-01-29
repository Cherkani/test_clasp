function seedSmokeData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const clients = ensureSheet('1_clients', ['id', 'name', 'email', 'phone', 'address', 'notes']);
  const providers = ensureSheet('2_providers', ['id', 'name', 'email', 'phone', 'address', 'notes']);
  const products = ensureSheet('3_products', ['id', 'name', 'sku', 'price', 'stock', 'providerId', 'notes']);
  const documents = ensureSheet('4_documents', ['id', 'clientId', 'type', 'date', 'status', 'total', 'docLink', 'notes']);
  const documentItems = ensureSheet('5_documentItems', ['id', 'documentId', 'productId', 'description', 'quantity', 'unitPrice', 'lineTotal']);
  const documentTypes = ensureSheet('6_documentTypes', ['type', 'reducesStock']);
  const documentStatuses = ensureSheet('7_documentStatuses', ['status']);

  [clients, providers, products, documents, documentItems, documentTypes, documentStatuses].forEach(sheet => {
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
  });

  clients.getRange(2, 1, 2, 6).setValues([
    [1, 'Acme Corp', 'hello@acme.com', '+212 600 000 000', 'Casablanca', 'Preferred client'],
    [2, 'Atlas SARL', 'contact@atlas.ma', '+212 611 111 111', 'Rabat', 'Pays within 15 days']
  ]);

  providers.getRange(2, 1, 2, 6).setValues([
    [1, 'Supplier One', 'sales@supplierone.com', '+212 622 222 222', 'Tangier', 'Main supplier'],
    [2, 'Provider Plus', 'info@providerplus.com', '+212 633 333 333', 'Marrakesh', 'Backup provider']
  ]);

  products.getRange(2, 1, 3, 7).setValues([
    [1, 'Laptop Pro', 'LP-001', 1200, 8, 1, 'High margin'],
    [2, 'Service Package', 'SV-010', 350, 15, 2, 'Monthly service'],
    [3, 'Router AX', 'RT-100', 180, 20, 1, 'Fast moving']
  ]);

  documents.getRange(2, 1, 2, 8).setValues([
    [1, 1, 'devis', '2024-10-01', 'draft', 1550, '', 'Initial quote'],
    [2, 2, 'bon de commande', '2024-10-02', 'sent', 360, '', 'Order confirmed']
  ]);

  documentItems.getRange(2, 1, 3, 7).setValues([
    [1, 1, 1, 'Laptop Pro', 1, 1200, 1200],
    [2, 1, 2, 'Service Package', 1, 350, 350],
    [3, 2, 3, 'Router AX', 2, 180, 360]
  ]);

  documentTypes.getRange(2, 1, 4, 2).setValues([
    ['bon de commande', true],
    ['tax', true],
    ['devis', false],
    ['bt', true]
  ]);

  documentStatuses.getRange(2, 1, 4, 1).setValues([
    ['draft'],
    ['sent'],
    ['paid'],
    ['cancelled']
  ]);
}
