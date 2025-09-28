// Promotion API helper
// Assumes backend base URL set via VITE_API_BASE (e.g., http://localhost:8080)

const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const ADMIN_PROMO_BASE = base + '/api/admin/promotions';

async function handle(res) {
  if (!res.ok) {
    let msg = 'Request failed ' + res.status;
    try { const data = await res.json(); msg = data.message || JSON.stringify(data); } catch (_) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const PromotionApi = {
  list: () => fetch(ADMIN_PROMO_BASE).then(handle),
  get: (id) => fetch(`${ADMIN_PROMO_BASE}/${id}`).then(handle),
  create: (promotion) => fetch(ADMIN_PROMO_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(promotion) }).then(handle),
  update: (id, promotion) => fetch(`${ADMIN_PROMO_BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(promotion) }).then(handle),
  delete: (id) => fetch(`${ADMIN_PROMO_BASE}/${id}`, { method: 'DELETE' }).then(handle),
};

export function emptyPromotion() {
  const now = new Date();
  const inWeek = new Date(now.getTime() + 7*24*60*60*1000);
  return {
    name: '',
    scope: 'GLOBAL',
    productId: '',
    categoryId: '',
    discountPercent: 0,
    startDate: now.toISOString().slice(0,16), // for datetime-local
    endDate: inWeek.toISOString().slice(0,16),
    active: true
  };
}
