const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'invoicePrices.json');

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
};

const loadInvoicePrices = () => {
  ensureDataFile();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read invoice prices file', error);
    return [];
  }
};

const saveInvoicePrices = (records) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
};

const upsertInvoiceRecord = (invoiceId, payload) => {
  const records = loadInvoicePrices();
  const existingIndex = records.findIndex((record) => record.invoiceId === invoiceId);
  const timestamp = new Date().toISOString();
  const existingRecord = existingIndex >= 0 ? records[existingIndex] : {};

  const nextRecord = {
    ...existingRecord,
    ...payload,
    invoiceId,
    invoiceNumber: payload.invoiceNumber || existingRecord.invoiceNumber || invoiceId,
    updatedAt: timestamp,
  };

  if (!existingRecord.createdAt) {
    nextRecord.createdAt = timestamp;
  } else {
    nextRecord.createdAt = existingRecord.createdAt;
  }

  if (existingIndex >= 0) {
    records[existingIndex] = nextRecord;
  } else {
    records.push(nextRecord);
  }

  saveInvoicePrices(records);
  return nextRecord;
};

const getMismatchEntries = () => {
  const records = loadInvoicePrices();
  return records
    .filter(
      (record) =>
        typeof record.invoicePrice === 'number' &&
        typeof record.supplierPrice === 'number' &&
        Math.abs(record.invoicePrice - record.supplierPrice) > 0.01
    )
    .map((record) => ({
      ...record,
      difference: +(record.invoicePrice - record.supplierPrice).toFixed(2),
    }));
};

const createServer = () => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/invoice-prices', (req, res) => {
    res.json({ entries: loadInvoicePrices() });
  });

  app.get('/api/invoice-prices/:invoiceId', (req, res) => {
    const { invoiceId } = req.params;
    const entry = loadInvoicePrices().find((record) => record.invoiceId === invoiceId);
    if (!entry) {
      return res.status(404).json({ message: 'Invoice price data not found' });
    }
    return res.json(entry);
  });

  app.put('/api/invoice-prices/:invoiceId', (req, res) => {
    const { invoiceId } = req.params;
    const { supplierPrice, invoicePrice, invoiceNumber } = req.body || {};

    if (supplierPrice == null && invoicePrice == null) {
      return res.status(400).json({ message: 'Please provide supplierPrice or invoicePrice' });
    }

    const updatedPayload = {};
    if (supplierPrice != null) {
      const parsed = Number(supplierPrice);
      if (Number.isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ message: 'supplierPrice must be a positive number' });
      }
      updatedPayload.supplierPrice = parsed;
    }

    if (invoicePrice != null) {
      const parsed = Number(invoicePrice);
      if (Number.isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ message: 'invoicePrice must be a positive number' });
      }
      updatedPayload.invoicePrice = parsed;
    }

    if (invoiceNumber) {
      updatedPayload.invoiceNumber = invoiceNumber;
    }

    const nextRecord = upsertInvoiceRecord(invoiceId, updatedPayload);
    return res.json(nextRecord);
  });

  app.delete('/api/invoice-prices/:invoiceId', (req, res) => {
    const { invoiceId } = req.params;
    const records = loadInvoicePrices();
    const nextRecords = records.filter((record) => record.invoiceId !== invoiceId);
    saveInvoicePrices(nextRecords);
    res.status(204).send();
  });

  app.get('/api/price-mismatches', (req, res) => {
    const mismatches = getMismatchEntries();
    res.json({ entries: mismatches, total: mismatches.length });
  });

  return app;
};

if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`Mock backend listening on port ${PORT}`);
  });
}

module.exports = { createServer };
