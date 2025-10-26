import React from 'react';

const DeliveryStatusBadge = ({ deliveryDate, status }) => {
  if (!deliveryDate) {
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
        Not scheduled
      </span>
    );
  }

  const today = new Date();
  const delivery = new Date(deliveryDate);
  const diffTime = delivery.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let badgeClass = '';
  let statusText = '';

  if (status === 'RECEIVED') {
    badgeClass = 'bg-green-100 text-green-700';
    statusText = 'Delivered';
  } else if (status === 'CANCELED') {
    badgeClass = 'bg-red-100 text-red-700';
    statusText = 'Canceled';
  } else if (diffDays < 0) {
    badgeClass = 'bg-red-100 text-red-700';
    statusText = `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    badgeClass = 'bg-amber-100 text-amber-700';
    statusText = 'Due today';
  } else if (diffDays === 1) {
    badgeClass = 'bg-amber-100 text-amber-700';
    statusText = 'Due tomorrow';
  } else if (diffDays <= 3) {
    badgeClass = 'bg-yellow-100 text-yellow-700';
    statusText = `${diffDays} days remaining`;
  } else if (diffDays <= 7) {
    badgeClass = 'bg-blue-100 text-blue-700';
    statusText = `${diffDays} days remaining`;
  } else {
    badgeClass = 'bg-gray-100 text-gray-700';
    statusText = `${diffDays} days remaining`;
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-gray-600">
        {deliveryDate ? new Date(deliveryDate).toLocaleDateString() : '—'}
      </span>
      <span className={`px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>
        {statusText}
      </span>
    </div>
  );
};

export default DeliveryStatusBadge;