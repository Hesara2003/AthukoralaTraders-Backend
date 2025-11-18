const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { createServer } = require('../server');

const DATA_FILE = path.join(__dirname, '..', 'data', 'invoicePrices.json');

const resetDataFile = () => {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
};

(async () => {
  resetDataFile();
  const app = createServer();
  const api = request(app);

  await api.get('/health').expect(200);

  const invoiceId = 'selftest-invoice';

  await api
    .put(`/api/invoice-prices/${invoiceId}`)
    .send({ supplierPrice: 120.5, invoiceNumber: 'INV-SELFTEST' })
    .expect(200);

  await api
    .put(`/api/invoice-prices/${invoiceId}`)
    .send({ invoicePrice: 140.75 })
    .expect(200);

  const getResponse = await api.get(`/api/invoice-prices/${invoiceId}`).expect(200);
  if (getResponse.body.invoicePrice !== 140.75 || getResponse.body.supplierPrice !== 120.5) {
    throw new Error('Invoice price payload mismatch');
  }

  const mismatchResponse = await api.get('/api/price-mismatches').expect(200);
  if (!mismatchResponse.body || mismatchResponse.body.total < 1) {
    throw new Error('Expected at least one mismatch entry');
  }

  console.log('Mock backend smoke test passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
