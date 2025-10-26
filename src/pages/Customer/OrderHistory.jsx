import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getOrdersByUsername, getOrdersByCustomerId } from '../../utils/orderApi';
import { CustomerProductApi } from '../../utils/customerProductApi';
import { RotateCcw, Package, Bell, Truck, CheckCircle, XCircle, AlertCircle, MapPin, Calendar } from 'lucide-react';
import { formatDate, getRelativeTimeString } from '../../utils/dateUtils';
import CustomerLayout from '../../components/CustomerLayout';

// Status icon mapping
const StatusIcon = ({ status }) => {
	const icon = {
		PROCESSING: AlertCircle,
		SHIPPED: Truck,
		DELIVERED: CheckCircle,
		CANCELLED: XCircle,
	}[status] || Bell;

	const Icon = icon;
	return <Icon className="w-5 h-5" />;
};

const StatusPill = ({ status = 'PENDING' }) => {
	const color = {
		PENDING: 'bg-gray-100 text-gray-700',
		PROCESSING: 'bg-blue-100 text-blue-700',
		SHIPPED: 'bg-indigo-100 text-indigo-700',
		DELIVERED: 'bg-green-100 text-green-700',
		CANCELLED: 'bg-red-100 text-red-700',
	}[status] || 'bg-gray-100 text-gray-700';
	return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>;
};

export default function OrderHistory() {
	const { user, loading: authLoading } = useAuth();
	const { addToCart } = useCart();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [reordering, setReordering] = useState({}); // { [orderId]: boolean }
	const [notice, setNotice] = useState(null);
	const [lastRefresh, setLastRefresh] = useState(new Date());
	const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

	// Function to check if an order needs real-time updates
	const needsRealTimeUpdates = (order) => {
		const activeStatuses = ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'];
		return activeStatuses.includes(order.status);
	};

	// Auto-refresh interval (30 seconds)
	const REFRESH_INTERVAL = 30000;

	// Load orders function
	const loadOrders = async (isAutoRefresh = false) => {
		console.log('[loadOrders] Called with isAutoRefresh:', isAutoRefresh, 'authLoading:', authLoading, 'loading:', loading);
		
		if (authLoading || (!isAutoRefresh && loading)) {
			console.log('[loadOrders] Skipped due to loading state');
			return;
		}
		
		// Check if user is logged in
		if (!user) {
			console.log('[loadOrders] No user found');
			setError('Please log in to view your orders');
			setLoading(false);
			return;
		}

		if (!user.username) {
			console.error('[loadOrders] User object:', user);
			setError('User information incomplete. Please try logging in again.');
			setLoading(false);
			return;
		}
		
		if (!isAutoRefresh) {
			setError(null);
			setLoading(true);
		}

		try {
			console.log('[loadOrders] Fetching orders for username:', user.username);
			let data;
			
			// Try fetching by username first
			try {
				data = await getOrdersByUsername(user.username);
				console.log('[loadOrders] Fetched by username, data:', data);
			} catch (usernameError) {
				console.warn('[loadOrders] Failed to fetch by username, trying customerId:', usernameError);
				
				// If username fails and we have customerId, try that
				if (user.customerId || user.id) {
					data = await getOrdersByCustomerId(user.customerId || user.id);
					console.log('[loadOrders] Fetched by customerId, data:', data);
				} else {
					throw usernameError;
				}
			}
			
			console.log('[loadOrders] Orders fetched successfully:', data);
			setOrders(Array.isArray(data) ? data : []);
			setLastRefresh(new Date());
		} catch (e) {
			console.error('[loadOrders] Error loading orders:', e);
			if (!isAutoRefresh) {
				setError(e.message || 'Failed to load orders');
			}
		} finally {
			if (!isAutoRefresh) {
				setLoading(false);
			}
		}
	};

	// Initial load
	useEffect(() => {
		console.log('OrderHistory mounted. User:', user, 'Auth Loading:', authLoading);
		if (!authLoading) {
			if (user?.username) {
				console.log('[OrderHistory] Calling loadOrders()');
				loadOrders();
			} else if (user && !user.username) {
				setError('User information incomplete. Username not found.');
				setLoading(false);
			} else if (!user) {
				setError('Please log in to view your orders');
				setLoading(false);
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.username, authLoading]);

	// Auto-refresh effect
	useEffect(() => {
		if (!autoRefreshEnabled || !user?.username) return;

		// Check if any orders need real-time updates
		const hasActiveOrders = orders.some(needsRealTimeUpdates);
		if (!hasActiveOrders) return;

		const intervalId = setInterval(() => {
			loadOrders(true);
		}, REFRESH_INTERVAL);

		return () => clearInterval(intervalId);
	}, [orders, autoRefreshEnabled, user?.username]);

	const handleReorder = async (order) => {
		if (!order || !Array.isArray(order.items) || order.items.length === 0) return;
		setNotice(null);
		setReordering((s) => ({ ...s, [order.id]: true }));
		try {
			// Fetch fresh product details to respect current stock and pricing
			const products = await Promise.all(
				order.items.map(async (it) => {
					try {
						const p = await CustomerProductApi.getById(it.productId);
						return { ok: true, item: it, product: p };
					} catch (e) {
						return { ok: false, item: it, error: e };
					}
				})
			);

			let added = 0;
			let partials = 0;
			let skipped = 0;
			for (const r of products) {
				if (!r.ok || !r.product) { skipped++; continue; }
				const prod = r.product;
				const stock = Number(prod.stock ?? 0);
				if (stock <= 0) { skipped++; continue; }
				const qty = Math.max(1, Math.min(r.item.quantity || 1, stock));
				// Ensure we use discountedPrice if present
				const effectivePrice = (prod.discountPercent != null && prod.discountedPrice != null)
					? prod.discountedPrice
					: prod.price;
				const productForCart = { ...prod, price: effectivePrice };
				const result = addToCart(productForCart, qty);
				if (result?.success) {
					added += result.actualQuantity ?? qty;
					if ((result.actualQuantity ?? qty) < qty) partials++;
				} else {
					skipped++;
				}
			}

			if (added > 0) {
				setNotice({ type: partials > 0 || skipped > 0 ? 'warning' : 'success', message: `Added ${added} item(s) to cart${partials>0? ' (some limited by stock)': ''}${skipped>0? ' (some unavailable)': ''}.` });
			} else {
				setNotice({ type: 'error', message: 'No items could be reordered (out of stock or unavailable).' });
			}
		} catch (e) {
			setNotice({ type: 'error', message: e.message || 'Failed to reorder.' });
		} finally {
			setReordering((s) => ({ ...s, [order.id]: false }));
		}
	};

	return (
		<CustomerLayout>
			<div className="min-h-screen bg-gray-50 py-10">
			<div className="max-w-5xl mx-auto px-4">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-gray-900">Order History</h1>
					
					<div className="flex items-center gap-4">
						{/* Auto-refresh toggle */}
						<div className="flex items-center gap-2">
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="sr-only peer"
									checked={autoRefreshEnabled}
									onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
							</label>
							<span className="text-sm text-gray-600">Auto-refresh</span>
						</div>

						{/* Manual refresh button */}
						<button
							onClick={() => loadOrders()}
							disabled={loading}
							className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
							Refresh
						</button>

						{/* Last refresh time */}
						{lastRefresh && (
							<span className="text-sm text-gray-500">
								Last updated: {getRelativeTimeString(lastRefresh)}
							</span>
						)}
					</div>
				</div>

				{notice && (
					<div className={`mb-4 rounded-xl p-4 border text-sm ${
						notice.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
						notice.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
						'bg-green-50 text-emerald-800 border-emerald-200'
					}`}>{notice.message}</div>
				)}

				{loading && (
					<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">Loading orders…</div>
				)}

				{error && (
					<div className="bg-red-50 text-red-700 rounded-xl p-4 border border-red-200 mb-4">{error}</div>
				)}

				{!loading && !error && orders.length === 0 && (
					<div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-600">
						You have no orders yet.
					</div>
				)}

				{!loading && !error && orders.length > 0 && (
					<div className="space-y-4">
						{orders.map((o) => (
							<div key={o.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
								<div className="flex items-center justify-between gap-4">
									<div>
										<div className="text-sm text-gray-500">Order ID</div>
										<div className="font-semibold text-gray-900">{o.id}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Placed</div>
										<div className="font-medium text-gray-800">{o.placedAt ? new Date(o.placedAt).toLocaleString() : '-'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Total</div>
										<div className="font-semibold text-gray-900">Rs {Number(o.totalAmount || 0).toFixed(2)}</div>
									</div>
									<div>
										<StatusPill status={o.status} />
									</div>
									<div className="ml-auto">
										<button
											onClick={() => handleReorder(o)}
											disabled={!!reordering[o.id]}
											className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition ${reordering[o.id] ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'}`}
										>
											<RotateCcw className="w-4 h-4" />
											{reordering[o.id] ? 'Reordering…' : 'Reorder'}
										</button>
									</div>
								</div>

								{/* Delivery Status Section */}
								{o.status !== 'CANCELLED' && (
									<div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
										<div className="flex items-start gap-4">
											<div className="flex-1">
												<h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery Status</h3>
												{o.estimatedDeliveryDate && (
													<div className="text-sm text-gray-700 mb-2">
														<span className="font-medium">Estimated Delivery:</span>{' '}
														{new Date(o.estimatedDeliveryDate).toLocaleDateString('en-US', {
															weekday: 'long',
															year: 'numeric',
															month: 'long',
															day: 'numeric'
														})}
													</div>
												)}
												{o.trackingNumber && (
													<div className="text-sm text-gray-700 mb-2">
														<span className="font-medium">Tracking Number:</span>{' '}
														{o.trackingNumber}
													</div>
												)}
												{o.currentLocation && (
													<div className="text-sm text-gray-700">
														<span className="font-medium">Current Location:</span>{' '}
														{o.currentLocation}
													</div>
												)}
											</div>
											{o.deliveryInstructions && (
												<div className="flex-1">
													<h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery Instructions</h3>
													<p className="text-sm text-gray-700">{o.deliveryInstructions}</p>
												</div>
											)}
										</div>

										{/* Delivery Timeline */}
										{o.deliveryAttempts && o.deliveryAttempts.length > 0 && (
											<div className="mt-4">
												<h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Timeline</h3>
												<div className="border-l-2 border-blue-200 pl-4 space-y-4">
													{o.deliveryAttempts.map((attempt, idx) => (
														<div key={idx} className="relative">
															<div className="absolute -left-[21px] w-3 h-3 rounded-full bg-blue-500"></div>
															<div className="text-sm">
																<div className="font-medium text-gray-900">
																	{new Date(attempt.date).toLocaleString()}
																</div>
																<div className="text-gray-600">{attempt.status}</div>
																{attempt.notes && (
																	<div className="text-gray-500 italic mt-1">{attempt.notes}</div>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{/* Next Delivery Attempt */}
										{o.nextDeliveryAttempt && o.status === 'DELIVERY_ATTEMPTED' && (
											<div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded text-sm">
												<span className="font-medium text-yellow-800">Next Delivery Attempt:</span>{' '}
												<span className="text-yellow-700">
													{new Date(o.nextDeliveryAttempt).toLocaleDateString('en-US', {
														weekday: 'long',
														year: 'numeric',
														month: 'long',
														day: 'numeric'
													})}
												</span>
											</div>
										)}
									</div>
								)}

								{/* Items list */}
								{/* Status Update Section */}
								<div className="mt-4 border-t pt-4">
									<div className="flex items-center gap-2 mb-4">
										<StatusIcon status={o.status} />
										<div>
											<div className="font-medium text-gray-900">
												{o.status === 'PROCESSING' && 'Your order is being processed'}
												{o.status === 'SHIPPED' && 'Your order has been shipped'}
												{o.status === 'DELIVERED' && 'Your order has been delivered'}
												{o.status === 'CANCELLED' && 'Your order has been cancelled'}
											</div>
											{o.trackingNumber && o.status === 'SHIPPED' && (
												<div className="text-sm text-gray-600">
													Tracking Number: <span className="font-medium">{o.trackingNumber}</span>
												</div>
											)}
											{o.statusUpdatedAt && (
												<div className="text-xs text-gray-500">
													Updated: {new Date(o.statusUpdatedAt).toLocaleString()}
												</div>
											)}
										</div>
									</div>

									{/* Items List Section */}
									<div className="border-t pt-4">
										<div className="text-sm font-medium text-gray-700 mb-3">Order Items</div>
										{Array.isArray(o.items) && o.items.length > 0 ? (
											<ul className="divide-y">
												{o.items.map((it, idx) => (
													<li key={`${o.id}-${idx}`} className="py-3 flex items-center justify-between">
														<div className="flex items-center gap-3">
															<div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
																<Package className="w-4 h-4 text-gray-400" />
															</div>
															<div>
																<div className="font-medium text-gray-900">{it.name}</div>
																<div className="text-xs text-gray-500">Product ID: {it.productId}</div>
															</div>
														</div>
														<div className="text-sm text-gray-700">Qty: <span className="font-semibold">{it.quantity}</span></div>
														<div className="text-sm text-gray-700">Unit: Rs {Number(it.unitPrice || 0).toFixed(2)}</div>
														<div className="text-sm font-semibold text-gray-900">Subtotal: Rs {(Number(it.unitPrice || 0) * Number(it.quantity || 0)).toFixed(2)}</div>
													</li>
												))}
											</ul>
										) : (
											<div className="text-sm text-gray-500">No items found for this order.</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
			</div>
		</CustomerLayout>
	);
}
