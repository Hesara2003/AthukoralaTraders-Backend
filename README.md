# Athukorala Traders Frontend

## Production Deployment
- **Frontend**: https://athukorala-traders-frontend.vercel.app
- **Backend**: https://athukorala-traders-backend.onrender.com

## Supplier Portal (SCRUM-14, SCRUM-34)

Purchase Orders were moved from the Admin area to the Supplier portal.

- List POs: `/supplier/purchase-orders`
- Create PO: `/supplier/purchase-orders/new`
- Edit PO: `/supplier/purchase-orders/:id/edit`

Access is restricted via roles. Default allowed roles: `ADMIN`, `STAFF`, `SUPPLIER`.

POs can be created with supplier, products, quantities and delivery date. A PO can be edited or canceled while in `CREATED` status. Status transitions are handled by the backend.

Backend endpoints currently used (supplier namespace):

- `GET /api/supplier/purchase-orders` (list)
- `GET /api/supplier/purchase-orders/{id}` (get)
- `POST /api/supplier/purchase-orders` (create)
- `PUT /api/supplier/purchase-orders/{id}` (update)
- `POST /api/supplier/purchase-orders/{id}/cancel` (cancel)

Suppliers and product references are fetched from:

- `GET /api/admin/suppliers`
- `GET /api/admin/products`

Note: Suppliers and products still come from admin endpoints; if needed these can be mirrored under `/api/supplier` similar to POs.

## Dev

This app uses React + Vite with Tailwind CSS.
