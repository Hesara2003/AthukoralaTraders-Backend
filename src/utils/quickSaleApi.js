// Quick Sale API client
const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';

/**
 * Create a Quick Sale order
 * @param {{items: Array<{productId: string, quantity: number}>, staffId?: string}} data
 * @returns {Promise<object>} created quick sale order
 */
export async function createQuickSale(data) {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Quick sale requires at least one item');
  }

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/staff/quick-sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    console.error('Quick Sale Error:', res.status, msg);
    throw new Error(`Quick sale failed (${res.status}): ${msg}`);
  }

  return res.json();
}
