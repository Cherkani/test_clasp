function testDataRetrieval() {
  const results = {
    clients: getClients().length,
    providers: getProviders().length,
    products: getProducts().length,
    documents: getDocuments().length,
    documentItems: getDocumentItems().length
  };
  Logger.log(results);
  return results;
}
