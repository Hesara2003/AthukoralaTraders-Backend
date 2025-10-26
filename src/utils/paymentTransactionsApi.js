const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export async function logPaymentTransaction(payload) {
  if (!payload) {
    throw new Error('payload is required');
  }

  const url = `${API_BASE}/api/payments/transactions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    console.error('Payment Transaction Error:', response.status, message);
    throw new Error(`Failed to log payment transaction (${response.status}): ${message}`);
  }

  return response.json();
}

export async function getTransactionsByOrderId(orderId) {
  if (!orderId) {
    throw new Error('orderId is required');
  }
  const url = `${API_BASE}/api/payments/transactions?orderId=${encodeURIComponent(orderId)}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      ...(localStorage.getItem('token') && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    console.error('Get Transactions Error:', response.status, message);
    throw new Error(`Failed to retrieve payment transactions (${response.status}): ${message}`);
  }

  return response.json();
}
