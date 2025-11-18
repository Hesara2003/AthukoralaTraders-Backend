# Mock Backend Server

Lightweight Express server that persists invoice price entries to disk so the frontend can track supplier versus invoice amounts and highlight mismatches.

## Setup

```bash
cd mock-server
npm install
```

## Running the server

```bash
npm run dev
```

This starts the server on `http://localhost:8080` by default. The key endpoints are:

- `GET /health` – health check
- `PUT /api/invoice-prices/:invoiceId` – save supplier/invoice prices
- `GET /api/invoice-prices/:invoiceId` – fetch stored prices for a specific invoice
- `GET /api/price-mismatches` – list invoices where the captured prices do not match

## Smoke test

```bash
npm test
```

The smoke test resets the data file and exercises the primary endpoints using Supertest.
