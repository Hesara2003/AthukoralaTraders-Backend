// Mock Staff PO API for delivery timeline updates in dashboard

// Simple date formatting function
const formatDate = (dateStr, options = {}) => {
  const date = new Date(dateStr);
  if (options.format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (options.format === 'relative') {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  }
  return date.toLocaleDateString();
};

// Generate mock purchase order data with delivery timeline updates
const mockPurchaseOrders = [
  {
    id: 'PO-2024-001',
    supplierId: 'SUP-001',
    supplierName: 'ABC Hardware Supplies',
    status: 'APPROVED',
    orderDate: '2024-12-15',
    originalDeliveryDate: '2024-12-22',
    expectedDeliveryDate: '2024-12-28',
    lastUpdated: '2024-12-18T10:30:00Z',
    updatedBy: 'Supplier Portal',
    updateReason: 'Supply chain delays due to weather conditions',
    isOverdue: false,
    totalValue: 15000,
    items: [
      { name: 'Premium Steel Screws Pack', quantity: 500, status: 'PENDING' },
      { name: 'Industrial Grade Bolts', quantity: 200, status: 'PENDING' }
    ]
  },
  {
    id: 'PO-2024-002',
    supplierId: 'SUP-002',
    supplierName: 'ElectroMax Solutions',
    status: 'APPROVED',
    orderDate: '2024-12-10',
    originalDeliveryDate: '2024-12-20',
    expectedDeliveryDate: '2024-12-25',
    lastUpdated: '2024-12-19T14:15:00Z',
    updatedBy: 'Supplier Portal',
    updateReason: 'Manufacturing capacity adjustments',
    isOverdue: true,
    totalValue: 28500,
    items: [
      { name: 'LED Light Fixtures', quantity: 150, status: 'IN_PRODUCTION' },
      { name: 'Electrical Wire Bulk', quantity: 1000, status: 'READY' }
    ]
  },
  {
    id: 'PO-2024-003',
    supplierId: 'SUP-003',
    supplierName: 'GreenThumb Garden Center',
    status: 'CREATED',
    orderDate: '2024-12-16',
    originalDeliveryDate: '2024-12-30',
    expectedDeliveryDate: '2024-12-27',
    lastUpdated: '2024-12-19T16:45:00Z',
    updatedBy: 'Supplier Portal',
    updateReason: 'Early completion - ahead of schedule',
    isOverdue: false,
    totalValue: 8200,
    items: [
      { name: 'Garden Tools Set', quantity: 75, status: 'READY' },
      { name: 'Fertilizer Bags', quantity: 200, status: 'READY' }
    ]
  },
  {
    id: 'PO-2024-004',
    supplierId: 'SUP-004',
    supplierName: 'SafetyFirst Equipment',
    status: 'APPROVED',
    orderDate: '2024-12-12',
    originalDeliveryDate: '2024-12-18',
    expectedDeliveryDate: '2024-12-24',
    lastUpdated: '2024-12-17T09:20:00Z',
    updatedBy: 'Supplier Portal',
    updateReason: 'Quality control review taking longer than expected',
    isOverdue: true,
    totalValue: 12800,
    items: [
      { name: 'Safety Helmets', quantity: 100, status: 'QUALITY_CHECK' },
      { name: 'High-Vis Vests', quantity: 200, status: 'PENDING' }
    ]
  },
  {
    id: 'PO-2024-005',
    supplierId: 'SUP-005',
    supplierName: 'PlumbPro Supplies',
    status: 'APPROVED',
    orderDate: '2024-12-14',
    originalDeliveryDate: '2024-12-21',
    expectedDeliveryDate: '2024-12-21',
    lastUpdated: '2024-12-14T08:00:00Z',
    updatedBy: 'System',
    updateReason: 'Initial creation',
    isOverdue: false,
    totalValue: 18900,
    items: [
      { name: 'Copper Pipes Bundle', quantity: 50, status: 'IN_PRODUCTION' },
      { name: 'Plumbing Fittings Kit', quantity: 300, status: 'PENDING' }
    ]
  }
];

// Generate timeline update activities for dashboard
function generateTimelineUpdates() {
  const updates = [];
  const now = new Date();
  
  mockPurchaseOrders.forEach(po => {
    if (po.originalDeliveryDate !== po.expectedDeliveryDate) {
      const originalDate = new Date(po.originalDeliveryDate);
      const newDate = new Date(po.expectedDeliveryDate);
      const isDelay = newDate > originalDate;
      const daysDiff = Math.ceil((newDate - originalDate) / (1000 * 60 * 60 * 24));
      
      updates.push({
        id: `update-${po.id}`,
        poId: po.id,
        type: 'DELIVERY_DATE_CHANGE',
        title: `PO ${po.id} Delivery ${isDelay ? 'Delayed' : 'Advanced'}`,
        message: `${po.supplierName} updated delivery date by ${Math.abs(daysDiff)} days`,
        originalDate: po.originalDeliveryDate,
        newDate: po.expectedDeliveryDate,
        reason: po.updateReason,
        isDelay,
        daysDiff: Math.abs(daysDiff),
        timestamp: po.lastUpdated,
        status: po.isOverdue ? 'OVERDUE' : isDelay ? 'DELAYED' : 'ADVANCED',
        priority: po.isOverdue ? 'HIGH' : isDelay && daysDiff > 3 ? 'MEDIUM' : 'LOW',
        supplier: {
          id: po.supplierId,
          name: po.supplierName
        },
        totalValue: po.totalValue
      });
    }
  });

  return updates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Calculate delivery statistics for dashboard cards
function calculateDeliveryStats() {
  const totalPos = mockPurchaseOrders.length;
  const overduePos = mockPurchaseOrders.filter(po => po.isOverdue).length;
  const updatedPos = mockPurchaseOrders.filter(po => 
    po.originalDeliveryDate !== po.expectedDeliveryDate
  ).length;
  
  const delayedPos = mockPurchaseOrders.filter(po => {
    const originalDate = new Date(po.originalDeliveryDate);
    const newDate = new Date(po.expectedDeliveryDate);
    return newDate > originalDate;
  }).length;
  
  const advancedPos = mockPurchaseOrders.filter(po => {
    const originalDate = new Date(po.originalDeliveryDate);
    const newDate = new Date(po.expectedDeliveryDate);
    return newDate < originalDate;
  }).length;

  return {
    totalPos,
    overduePos,
    updatedPos,
    delayedPos,
    advancedPos,
    onTimePos: totalPos - overduePos,
    updateRate: Math.round((updatedPos / totalPos) * 100)
  };
}

// Mock API delay simulation
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const StaffPoApi = {
  // Get all POs with delivery timeline info for staff dashboard
  async getAllPosWithTimelines() {
    console.log('📦 [StaffPoApi] Fetching all POs with delivery timelines...');
    await delay(300);
    return mockPurchaseOrders;
  },

  // Get recent delivery timeline updates for dashboard
  async getRecentTimelineUpdates(limit = 5) {
    console.log('⏰ [StaffPoApi] Fetching recent timeline updates...');
    await delay(200);
    const updates = generateTimelineUpdates();
    return updates.slice(0, limit);
  },

  // Get delivery statistics for dashboard cards
  async getDeliveryStatistics() {
    console.log('📊 [StaffPoApi] Calculating delivery statistics...');
    await delay(150);
    return calculateDeliveryStats();
  },

  // Get overdue POs for urgent attention
  async getOverduePos() {
    console.log('🚨 [StaffPoApi] Fetching overdue POs...');
    await delay(250);
    return mockPurchaseOrders.filter(po => po.isOverdue);
  },

  // Get POs by status
  async getPosByStatus(status) {
    console.log(`📋 [StaffPoApi] Fetching POs with status: ${status}`);
    await delay(200);
    return mockPurchaseOrders.filter(po => po.status === status);
  },

  // Get POs requiring attention (overdue or significantly delayed)
  async getPosRequiringAttention() {
    console.log('⚠️ [StaffPoApi] Finding POs requiring attention...');
    await delay(200);
    
    return mockPurchaseOrders.filter(po => {
      if (po.isOverdue) return true;
      
      const originalDate = new Date(po.originalDeliveryDate);
      const newDate = new Date(po.expectedDeliveryDate);
      const daysDiff = Math.ceil((newDate - originalDate) / (1000 * 60 * 60 * 24));
      
      return daysDiff > 3; // More than 3 days delay
    });
  },

  // Get upcoming deliveries
  async getUpcomingDeliveries(days = 7) {
    console.log(`📅 [StaffPoApi] Fetching deliveries in next ${days} days...`);
    await delay(200);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return mockPurchaseOrders.filter(po => {
      const deliveryDate = new Date(po.expectedDeliveryDate);
      return deliveryDate <= cutoffDate && deliveryDate >= new Date();
    });
  }
};

export default StaffPoApi;