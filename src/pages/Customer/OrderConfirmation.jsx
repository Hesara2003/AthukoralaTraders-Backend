import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  ShoppingBag,
  Calendar,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Package,
  Truck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CustomerLayout from '../../components/CustomerLayout';
import PublicLayout from '../../components/PublicLayout';
import { ORDER_STORAGE_KEY, useOrderSummary } from '../../utils/useOrderSummary';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

const OrderConfirmation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { order, refresh, clear } = useOrderSummary();
  const Layout = user ? CustomerLayout : PublicLayout;

  useEffect(() => {
    if (!order) {
      const latest = refresh();
      if (!latest) {
        navigate('/checkout', { replace: true });
      }
    }
  }, [order, navigate, refresh]);

  const requestedOrderId = location.state?.orderId;

  const placedDate = useMemo(() => {
    if (!order?.createdAt) return null;
    const parsed = new Date(order.createdAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [order?.createdAt]);

  const estimatedDelivery = useMemo(() => {
    if (!placedDate) return null;
    const estimate = new Date(placedDate);
    estimate.setDate(estimate.getDate() + 4);
    return estimate;
  }, [placedDate]);

  const totalItems = useMemo(() => {
    if (!Array.isArray(order?.items)) return 0;
    return order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [order?.items]);

  const totals = order?.totals ?? {};
  const taxLabel = order?.taxRate != null ? `${(order.taxRate * 100).toFixed(0)}%` : 'Tax';

  const handleDownloadReceipt = () => {
    window.print();
  };

  const handleViewOrders = () => {
    clear();
    navigate('/customer/orders');
  };

  const handleContinueShopping = () => {
    clear();
    navigate('/products');
  };

  if (!order) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">We need a recent order to show this page</h1>
          <p className="mt-3 text-sm text-gray-600">You&apos;ll be redirected to checkout to place or review your order.</p>
        </div>
      </Layout>
    );
  }

  const shippingInfo = order.shippingInfo ?? {};
  const billingInfo = order.billingInfo ?? {};

  const placedDateLabel = placedDate
    ? placedDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : 'Just now';

  const estimatedDeliveryLabel = estimatedDelivery
    ? estimatedDelivery.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '2-4 business days';

  const paymentLabel = order.payment?.label ?? 'Selected payment method';
  const paymentDescription = order.payment?.description ?? '';
  const paymentDetails = order.payment?.details;

  const showOrderMismatchWarning = requestedOrderId && order.id !== requestedOrderId;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-white/70">Order confirmed</p>
                <h1 className="mt-1 text-3xl font-bold md:text-4xl">Thank you for your purchase!</h1>
                <p className="mt-3 text-sm text-emerald-100 md:text-base">
                  A confirmation email with your receipt has been sent to {order.customerEmail || billingInfo.email || 'your inbox'}.
                </p>
              </div>
            </div>
            <div className="grid gap-3 rounded-2xl bg-white/10 p-4 text-sm text-emerald-50 shadow-inner">
              <div className="flex items-center justify-between gap-6">
                <span className="text-emerald-100">Order ID</span>
                <span className="font-semibold">{order.id}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-emerald-100">Placed on</span>
                <span className="font-medium">{placedDateLabel}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
            >
              <Download className="h-4 w-4" />
              Download receipt
            </button>
            <button
              type="button"
              onClick={handleViewOrders}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              <Truck className="h-4 w-4" />
              Track &amp; view orders
            </button>
          </div>
        </div>

        {showOrderMismatchWarning && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800 shadow-inner">
            The confirmation shown below belongs to your most recent order ({order.id}). If you expected to view {requestedOrderId}, please check your order history.
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="space-y-8">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Items in your order</h2>
                  <p className="text-sm text-gray-500">{totalItems} item{totalItems === 1 ? '' : 's'} scheduled for delivery</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={`${item.id}-${item.sku}`}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-blue-500 shadow-inner">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.category && <span>Category: {item.category}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-10">
                      <div className="text-sm text-gray-600">
                        Qty <span className="font-semibold text-gray-900">{item.quantity}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Unit <span className="font-semibold text-gray-900">{currencyFormatter.format(item.unitPrice ?? 0)}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {currencyFormatter.format(item.total ?? 0)}
                      </div>
                    </div>
                  </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-8 text-center text-sm text-gray-500">
                    No items were captured for this order.
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/80 p-6 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{currencyFormatter.format(totals.subtotal ?? 0)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span>Estimated shipping</span>
                  <span className="font-medium text-gray-900">{currencyFormatter.format(totals.shippingEstimate ?? 0)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span>Tax ({taxLabel})</span>
                  <span className="font-medium text-gray-900">{currencyFormatter.format(totals.tax ?? 0)}</span>
                </div>
                <div className="mt-4 border-t border-dashed pt-4 text-base font-semibold text-gray-900">
                  <div className="flex items-center justify-between">
                    <span>Total paid</span>
                    <span>{currencyFormatter.format(totals.grandTotal ?? 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Delivery details</h3>
                  <p className="mt-1 text-sm text-gray-500">Estimated delivery by {estimatedDeliveryLabel}</p>
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    {shippingInfo.contact && <p className="font-medium">{shippingInfo.contact}</p>}
                    {shippingInfo.address && (
                      <p className="leading-relaxed">
                        {shippingInfo.address}
                        {shippingInfo.city ? `, ${shippingInfo.city}` : ''}
                        {shippingInfo.postal ? ` ${shippingInfo.postal}` : ''}
                      </p>
                    )}
                    {shippingInfo.country && <p>{shippingInfo.country}</p>}
                    {shippingInfo.phone && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {shippingInfo.phone}
                      </p>
                    )}
                    {shippingInfo.instructions && (
                      <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
                        Note: {shippingInfo.instructions}
                      </p>
                    )}
                    {order.shippingSameAsBilling && (
                      <p className="rounded-xl bg-emerald-50/70 px-3 py-2 text-xs font-medium text-emerald-700">
                        Shipping to billing address
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Billing information</h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <p className="font-medium">
                      {[billingInfo.firstName, billingInfo.lastName].filter(Boolean).join(' ') || 'Billing contact'}
                    </p>
                    {billingInfo.company && <p>{billingInfo.company}</p>}
                    {billingInfo.address && (
                      <p className="leading-relaxed">
                        {billingInfo.address}
                        {billingInfo.city ? `, ${billingInfo.city}` : ''}
                        {billingInfo.postal ? ` ${billingInfo.postal}` : ''}
                      </p>
                    )}
                    {billingInfo.country && <p>{billingInfo.country}</p>}
                    {billingInfo.email && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {billingInfo.email}
                      </p>
                    )}
                    {billingInfo.phone && (
                      <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {billingInfo.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Payment summary</h3>
                  <p className="mt-1 text-sm text-gray-500">{paymentLabel}</p>
                  {paymentDescription && <p className="mt-3 text-xs text-gray-500">{paymentDescription}</p>}
                  {paymentDetails && (
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      {paymentDetails.type === 'card' && (
                        <>
                          <p>Card ending in •••• {paymentDetails.lastFour}</p>
                          {paymentDetails.nameOnCard && <p>Cardholder: {paymentDetails.nameOnCard}</p>}
                          {paymentDetails.expiry && <p>Expires: {paymentDetails.expiry}</p>}
                        </>
                      )}
                      {paymentDetails.type === 'paypal' && (
                        <>
                          <p>PayPal account: {paymentDetails.email}</p>
                          {paymentDetails.notes && <p className="text-xs text-gray-500">Notes: {paymentDetails.notes}</p>}
                        </>
                      )}
                      {paymentDetails.type === 'cod' && (
                        <p>{paymentDetails.notes}</p>
                      )}
                    </div>
                  )}
                  <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    Total charged: {currencyFormatter.format(totals.grandTotal ?? 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
              <h3 className="text-base font-semibold text-gray-900">Next steps</h3>
              <ul className="mt-3 space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <Calendar className="mt-1 h-4 w-4 text-gray-400" />
                  <span>We&apos;ll notify you by email as soon as your items ship.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="mt-1 h-4 w-4 text-gray-400" />
                  <span>Track delivery progress anytime from your order history.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShoppingBag className="mt-1 h-4 w-4 text-gray-400" />
                  <span>Need changes? Contact support within 24 hours for adjustments.</span>
                </li>
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleViewOrders}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  View order history
                </button>
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
