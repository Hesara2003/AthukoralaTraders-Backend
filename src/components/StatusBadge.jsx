import React from 'react';

export default function StatusBadge({ promotion }) {
  const now = new Date();
  const start = promotion.startDate ? new Date(promotion.startDate) : null;
  const end = promotion.endDate ? new Date(promotion.endDate) : null;
  let label = '—';
  let style = 'bg-gray-200 text-gray-700';
  if (!promotion.active) { label = 'Disabled'; style='bg-gray-300 text-gray-600'; }
  else if (start && end) {
    if (now < start) { label='Scheduled'; style='bg-amber-100 text-amber-700'; }
    else if (now > end) { label='Expired'; style='bg-red-100 text-red-700'; }
    else { label='Active'; style='bg-green-100 text-green-700'; }
  } else if (promotion.active) { label='Active'; style='bg-green-100 text-green-700'; }
  return <span className={`px-2 py-0.5 rounded text-xs font-medium inline-block ${style}`}>{label}</span>;
}
