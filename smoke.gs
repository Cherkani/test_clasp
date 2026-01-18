function seedSalesSmokeData() {
  const ss = getSpreadsheet();
  resetSalesSheets();

  const clientsSheet = ss.getSheetByName('Clients');
  const providersSheet = ss.getSheetByName('Providers');
  const productsSheet = ss.getSheetByName('Products');
  const documentsSheet = ss.getSheetByName('Documents');
  const itemsSheet = ss.getSheetByName('DocumentItems');

  const clients = [
    [1, 'Atlas Retail', '0612345678', 'atlas@example.com', 'Rue Atlas 12', 'Casablanca', 'VIP client'],
    [2, 'Marrakesh Studio', '0698765432', 'studio@example.com', 'Avenue Palmier 5', 'Marrakesh', 'Monthly invoices'],
    [3, 'Rabat Office', '0600112233', 'rabat@example.com', 'Quartier Hassan', 'Rabat', '']
  ];

  const providers = [
    [1, 'Nova Supplies', '0622334455', 'nova@example.com', 'Zone Industrielle', 'Kenitra', ''],
    [2, 'Atlas Import', '0633445566', 'import@example.com', 'Port City', 'Tangier', ''],
    [3, 'Tech Market', '0644556677', 'tech@example.com', 'Rue Tech 9', 'Casablanca', '']
  ];

  const products = [
    [1, 'PRD-001', 'Laptop Pro 14', 'pcs', 7000, 9200, 15, 3],
    [2, 'PRD-002', 'Office Desk', 'pcs', 600, 1100, 40, 1],
    [3, 'PRD-003', 'LED Monitor 24', 'pcs', 900, 1400, 25, 2],
    [4, 'PRD-004', 'Ergo Chair', 'pcs', 500, 850, 30, 1]
  ];

  const documents = [
    [1, 'facture', 'FA-2025-0001', '2025-01-05', 1, '', 'open', 'January invoice', 0, 0.2, 0, 0],
    [2, 'devis', 'DV-2025-0001', '2025-01-06', 2, '', 'draft', 'Quote for office setup', 0, 0.2, 0, 0],
    [3, 'bp', 'BP-2025-0001', '2025-01-08', 3, '', 'delivered', 'Delivery note', 0, 0.2, 0, 0]
  ];

  const items = [
    [1, 1, 1, 'Laptop Pro 14', 2, 9200, 0, 18400],
    [2, 1, 4, 'Ergo Chair', 4, 850, 0, 3400],
    [3, 2, 2, 'Office Desk', 10, 1100, 200, 10800],
    [4, 2, 4, 'Ergo Chair', 10, 850, 0, 8500],
    [5, 3, 3, 'LED Monitor 24', 6, 1400, 0, 8400]
  ];

  clientsSheet.getRange(2, 1, clients.length, clients[0].length).setValues(clients);
  providersSheet.getRange(2, 1, providers.length, providers[0].length).setValues(providers);
  productsSheet.getRange(2, 1, products.length, products[0].length).setValues(products);
  documentsSheet.getRange(2, 1, documents.length, documents[0].length).setValues(documents);
  itemsSheet.getRange(2, 1, items.length, items[0].length).setValues(items);
}
