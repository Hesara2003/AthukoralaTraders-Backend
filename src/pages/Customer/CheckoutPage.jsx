import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Gift,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  Home,
  Wallet,
  ChevronRight,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import CustomerLayout from '../../components/CustomerLayout';
import PublicLayout from '../../components/PublicLayout';
import { logPaymentTransaction } from '../../utils/paymentTransactionsApi';
import { createOrder } from '../../utils/orderApi';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, MasterCard, AMEX',
    icon: CreditCard
  },
  {
    id: 'paypal',
    label: 'PayPal',
    description: 'Checkout with PayPal wallet',
    icon: Wallet
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay with cash or card on delivery',
    icon: ShoppingBag
  }
];

const ORDER_STORAGE_KEY = 'athukorala-last-order';
const PAYMENT_DRAFT_KEY = 'athukorala-payment-draft';
const EMPTY_CARD_DETAILS = { nameOnCard: '', cardNumber: '', expiry: '', cvv: '' };
const EMPTY_PAYPAL_DETAILS = { email: '', notes: '' };
const DEFAULT_PAYMENT_STATE = { state: 'unverified', errorMessage: '', completedAt: null, transactionId: null };

const formatCardPreview = (value) => {
  const digitsOnly = (value ?? '').replace(/[^0-9]/g, '');
  return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const FAQ_ITEMS = [
  {
    title: 'Is my payment information secure?',
    description: 'We use bank-grade encryption and do not store your full card details on our servers.'
  },
  {
    title: 'How soon will my order ship?',
    description: 'Orders placed before 3 PM ship the same day. Delivery takes 2-4 business days depending on your location.'
  }
];

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shipToBilling, setShipToBilling] = useState(true);
  const [submissionState, setSubmissionState] = useState('idle');
  const [cardDetails, setCardDetails] = useState(() => ({ ...EMPTY_CARD_DETAILS }));
  const [paypalDetails, setPaypalDetails] = useState(() => ({ ...EMPTY_PAYPAL_DETAILS }));
  const [cardStatus, setCardStatus] = useState(() => ({ ...DEFAULT_PAYMENT_STATE }));
  const [paypalStatus, setPaypalStatus] = useState(() => ({ ...DEFAULT_PAYMENT_STATE }));
  const [paymentFeedback, setPaymentFeedback] = useState(null);

  const initialBillingState = useMemo(() => ({
    firstName: '',
    lastName: '',
    company: '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
    postal: '',
    country: ''
  }), [user?.email]);

  const createInitialShippingState = useCallback(() => ({
    contact: '',
    phone: '',
    address: '',
    city: '',
    postal: '',
    instructions: ''
  }), []);

  const [billingInfo, setBillingInfo] = useState(() => initialBillingState);
  const [shippingInfo, setShippingInfo] = useState(() => createInitialShippingState());
  const [errors, setErrors] = useState({ billing: {}, shipping: {}, payment: {} });

  useEffect(() => {
    setBillingInfo(prev => ({ ...prev, email: user?.email ?? '' }));
  }, [user?.email]);

  const cardNumberPreview = useMemo(() => formatCardPreview(cardDetails.cardNumber), [cardDetails.cardNumber]);
  const cardLastFourPreview = useMemo(() => {
    const digitsOnly = (cardDetails.cardNumber ?? '').replace(/[^0-9]/g, '');
    return digitsOnly.slice(-4);
  }, [cardDetails.cardNumber]);
  const cardAuthorizedLabel = useMemo(() => formatDateTime(cardStatus.completedAt), [cardStatus.completedAt]);
  const paypalAuthorizedLabel = useMemo(() => formatDateTime(paypalStatus.completedAt), [paypalStatus.completedAt]);

  useEffect(() => {
    const stored = sessionStorage.getItem(PAYMENT_DRAFT_KEY);
    if (!stored) {
      setCardDetails({ ...EMPTY_CARD_DETAILS });
      setPaypalDetails({ ...EMPTY_PAYPAL_DETAILS });
      setCardStatus({ ...DEFAULT_PAYMENT_STATE });
      setPaypalStatus({ ...DEFAULT_PAYMENT_STATE });
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.card) {
        const details = parsed.card.details ?? parsed.card;
        setCardDetails({ ...EMPTY_CARD_DETAILS, ...details });
        setCardStatus({
          state: parsed.card.status ?? 'authorized',
          errorMessage: parsed.card.errorMessage ?? '',
          completedAt: parsed.card.completedAt ?? null,
          transactionId: parsed.card.transactionId ?? null
        });
      } else {
        setCardDetails({ ...EMPTY_CARD_DETAILS });
        setCardStatus({ ...DEFAULT_PAYMENT_STATE });
      }
      if (parsed.paypal) {
        const details = parsed.paypal.details ?? parsed.paypal;
        setPaypalDetails({ ...EMPTY_PAYPAL_DETAILS, ...details });
        setPaypalStatus({
          state: parsed.paypal.status ?? 'authorized',
          errorMessage: parsed.paypal.errorMessage ?? '',
          completedAt: parsed.paypal.completedAt ?? null,
          transactionId: parsed.paypal.transactionId ?? null
        });
      } else {
        setPaypalDetails({ ...EMPTY_PAYPAL_DETAILS });
        setPaypalStatus({ ...DEFAULT_PAYMENT_STATE });
      }
    } catch (error) {
      console.error('[Checkout] Unable to parse stored payment draft', error);
      sessionStorage.removeItem(PAYMENT_DRAFT_KEY);
      setCardDetails({ ...EMPTY_CARD_DETAILS });
      setPaypalDetails({ ...EMPTY_PAYPAL_DETAILS });
      setCardStatus({ ...DEFAULT_PAYMENT_STATE });
      setPaypalStatus({ ...DEFAULT_PAYMENT_STATE });
    }
  }, [location.key]);

  useEffect(() => {
    if (!location.state || !location.state.paymentUpdated) {
      return;
    }
    const { paymentUpdated, paymentFailed, message } = location.state;
    const label = paymentUpdated === 'paypal' ? 'PayPal' : paymentUpdated === 'card' ? 'Card' : 'Payment';
    const feedbackMessage = message || (paymentFailed
      ? `${label} authorization failed. Please try again.`
      : `${label} authorization saved successfully.`);

    setPaymentFeedback({
      type: paymentFailed ? 'error' : 'success',
      message: feedbackMessage
    });

    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: {} });
  }, [location, navigate]);

  const subtotal = getCartTotal();
  const shippingEstimate = cartItems.length > 0 ? 12.5 : 0;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shippingEstimate + tax;

  const Layout = user ? CustomerLayout : PublicLayout;

  const isCartEmpty = cartItems.length === 0;

  const validateBillingField = (field, value) => {
    const trimmed = value.trim();
    switch (field) {
      case 'firstName':
        if (!trimmed) return 'First name is required.';
        break;
      case 'lastName':
        if (!trimmed) return 'Last name is required.';
        break;
      case 'email':
        if (!trimmed) return 'Email is required.';
        if (!/^\S+@\S+\.\S+$/.test(trimmed)) return 'Enter a valid email address.';
        break;
      case 'phone':
        if (!trimmed) return 'Phone number is required.';
        if (!/^[0-9+()\-\s]{7,}$/.test(trimmed)) return 'Enter a valid phone number.';
        break;
      case 'address':
        if (!trimmed) return 'Billing address is required.';
        break;
      case 'city':
        if (!trimmed) return 'City is required.';
        break;
      case 'postal':
        if (!trimmed) return 'Postal code is required.';
        break;
      case 'country':
        if (!trimmed) return 'Country is required.';
        break;
      default:
        break;
    }
    return '';
  };

  const validateShippingField = (field, value) => {
    const trimmed = value.trim();
    switch (field) {
      case 'contact':
        if (!trimmed) return 'Contact person is required.';
        break;
      case 'phone':
        if (!trimmed) return 'Phone number is required.';
        if (!/^[0-9+()\-\s]{7,}$/.test(trimmed)) return 'Enter a valid phone number.';
        break;
      case 'address':
        if (!trimmed) return 'Shipping address is required.';
        break;
      case 'city':
        if (!trimmed) return 'City is required.';
        break;
      case 'postal':
        if (!trimmed) return 'Postal code is required.';
        break;
      default:
        break;
    }
    return '';
  };

  const validateBilling = (data) => {
    const nextErrors = {};
    Object.entries(data).forEach(([field, value]) => {
      const message = validateBillingField(field, value ?? '');
      if (message) {
        nextErrors[field] = message;
      }
    });
    return nextErrors;
  };

  const validateShipping = (data) => {
    const nextErrors = {};
    Object.entries(data).forEach(([field, value]) => {
      const message = validateShippingField(field, value ?? '');
      if (message) {
        nextErrors[field] = message;
      }
    });
    return nextErrors;
  };

  const validateCardDetails = (data) => {
    const nextErrors = {};
    const sanitizedNumber = (data.cardNumber ?? '').replace(/[^0-9]/g, '');

    if (!(data.nameOnCard ?? '').trim()) {
      nextErrors.nameOnCard = 'Name on card is required.';
    }
    if (!sanitizedNumber) {
      nextErrors.cardNumber = 'Card number is required.';
    } else if (!/^\d{13,19}$/.test(sanitizedNumber)) {
      nextErrors.cardNumber = 'Enter a valid card number.';
    }
    const expiryValue = (data.expiry ?? '').trim();
    if (!expiryValue) {
      nextErrors.expiry = 'Expiry date is required.';
    } else if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiryValue)) {
      nextErrors.expiry = 'Use MM/YY format.';
    }
    const cvvValue = (data.cvv ?? '').trim();
    if (!cvvValue) {
      nextErrors.cvv = 'Security code is required.';
    } else if (!/^\d{3,4}$/.test(cvvValue)) {
      nextErrors.cvv = 'Enter a valid CVV.';
    }

    return nextErrors;
  };

  const validatePaypalDetails = (data) => {
    const nextErrors = {};
    const email = (data.email ?? '').trim();
    if (!email) {
      nextErrors.email = 'PayPal email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = 'Enter a valid PayPal email.';
    }
    return nextErrors;
  };

  const handleBillingChange = (field) => (event) => {
    const { value } = event.target;
    setBillingInfo(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({
      ...prev,
      billing: { ...prev.billing, [field]: '' }
    }));
  };

  const handleShippingChange = (field) => (event) => {
    const { value } = event.target;
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: '' }
    }));
  };

  const handleBillingBlur = (field) => () => {
    const message = validateBillingField(field, billingInfo[field] ?? '');
    setErrors(prev => ({
      ...prev,
      billing: { ...prev.billing, [field]: message }
    }));
  };

  const handleShippingBlur = (field) => () => {
    const message = validateShippingField(field, shippingInfo[field] ?? '');
    setErrors(prev => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: message }
    }));
  };

  const handleSelectPayment = (method) => {
    setPaymentMethod(method);
    setErrors(prev => ({ ...prev, payment: {} }));
    setSubmissionState('idle');
    setPaymentFeedback(null);
  };

  const openPaymentGateway = (method) => {
    setErrors(prev => ({ ...prev, payment: {} }));
    setPaymentFeedback(null);
    const baseCurrency = 'USD';
    const nextTransactionId = method === 'card'
      ? cardStatus.transactionId ?? `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      : method === 'paypal'
        ? paypalStatus.transactionId ?? `paypal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
        : `txn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    if (method === 'card' && !cardStatus.transactionId) {
      setCardStatus(prev => ({ ...prev, transactionId: nextTransactionId }));
    }
    if (method === 'paypal' && !paypalStatus.transactionId) {
      setPaypalStatus(prev => ({ ...prev, transactionId: nextTransactionId }));
    }

    const paymentContext = {
      paymentIntentId: nextTransactionId,
      paymentMethod: method,
      amount: Number.isFinite(grandTotal) ? Number(grandTotal.toFixed(2)) : null,
      currency: baseCurrency,
      customerReference: user?.username ?? null,
      customerEmail: billingInfo.email || user?.email || null,
      tax,
      shippingEstimate,
      subtotal,
      createdAt: new Date().toISOString()
    };

    navigate(`/checkout/payment/${method}`, { state: { returnTo: '/checkout', paymentContext } });
  };

  const dismissPaymentFeedback = () => setPaymentFeedback(null);

  const clearPaymentDraft = (method) => {
    const stored = sessionStorage.getItem(PAYMENT_DRAFT_KEY);
    if (!stored) {
      if (method === 'card') setCardDetails({ ...EMPTY_CARD_DETAILS });
      if (method === 'paypal') setPaypalDetails({ ...EMPTY_PAYPAL_DETAILS });
      if (method === 'card') setCardStatus({ ...DEFAULT_PAYMENT_STATE });
      if (method === 'paypal') setPaypalStatus({ ...DEFAULT_PAYMENT_STATE });
      setErrors(prev => ({ ...prev, payment: {} }));
      setPaymentFeedback(null);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (method === 'card' && parsed.card) {
        delete parsed.card;
        setCardDetails({ ...EMPTY_CARD_DETAILS });
        setCardStatus({ ...DEFAULT_PAYMENT_STATE });
      }
      if (method === 'paypal' && parsed.paypal) {
        delete parsed.paypal;
        setPaypalDetails({ ...EMPTY_PAYPAL_DETAILS });
        setPaypalStatus({ ...DEFAULT_PAYMENT_STATE });
      }
      if (!parsed.card && !parsed.paypal) {
        sessionStorage.removeItem(PAYMENT_DRAFT_KEY);
      } else {
        sessionStorage.setItem(PAYMENT_DRAFT_KEY, JSON.stringify(parsed));
      }
      setErrors(prev => ({ ...prev, payment: {} }));
      setPaymentFeedback(null);
    } catch (error) {
      console.error('[Checkout] Failed to clear payment draft', error);
      sessionStorage.removeItem(PAYMENT_DRAFT_KEY);
      if (method === 'card') setCardDetails({ ...EMPTY_CARD_DETAILS });
      if (method === 'paypal') setPaypalDetails({ ...EMPTY_PAYPAL_DETAILS });
      if (method === 'card') setCardStatus({ ...DEFAULT_PAYMENT_STATE });
      if (method === 'paypal') setPaypalStatus({ ...DEFAULT_PAYMENT_STATE });
      setErrors(prev => ({ ...prev, payment: {} }));
      setPaymentFeedback(null);
    }
  };

  const handleToggleShipToBilling = () => {
    setShipToBilling(prev => {
      const next = !prev;
      if (next) {
        setShippingInfo(createInitialShippingState());
        setErrors(prevErrors => ({ ...prevErrors, shipping: {} }));
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmissionState('processing');

    const billingErrors = validateBilling(billingInfo);
    const shippingErrors = shipToBilling ? {} : validateShipping(shippingInfo);

    let paymentErrors = {};
    if (paymentMethod === 'card') {
      const cardValidation = validateCardDetails(cardDetails);
      if (Object.keys(cardValidation).length > 0) {
        paymentErrors = { ...cardValidation, general: 'Complete your card details through the secure gateway before placing the order.' };
      }
      if (cardStatus.state === 'failed') {
        const message = cardStatus.errorMessage || 'Card authorization failed. Open the secure gateway to try again.';
        paymentErrors = { ...paymentErrors, general: message };
        if (!paymentFeedback || paymentFeedback.message !== message) {
          setPaymentFeedback({ type: 'error', message });
        }
      } else if (cardStatus.state !== 'authorized') {
        const message = 'Authorize your card through the secure gateway before placing the order.';
        paymentErrors = { ...paymentErrors, general: paymentErrors.general ?? message };
        if (!paymentFeedback || paymentFeedback.message !== (paymentErrors.general ?? message)) {
          setPaymentFeedback({ type: 'error', message: paymentErrors.general ?? message });
        }
      }
    } else if (paymentMethod === 'paypal') {
      const paypalValidation = validatePaypalDetails(paypalDetails);
      if (Object.keys(paypalValidation).length > 0) {
        paymentErrors = { ...paypalValidation, general: 'Connect a sandbox PayPal email via the PayPal gateway before placing the order.' };
      }
      if (paypalStatus.state === 'failed') {
        const message = paypalStatus.errorMessage || 'PayPal authorization failed. Re-open the PayPal sandbox gateway to try again.';
        paymentErrors = { ...paymentErrors, general: message };
        if (!paymentFeedback || paymentFeedback.message !== message) {
          setPaymentFeedback({ type: 'error', message });
        }
      } else if (paypalStatus.state !== 'authorized') {
        const message = 'Authorize PayPal via the sandbox gateway before placing the order.';
        paymentErrors = { ...paymentErrors, general: paymentErrors.general ?? message };
        if (!paymentFeedback || paymentFeedback.message !== (paymentErrors.general ?? message)) {
          setPaymentFeedback({ type: 'error', message: paymentErrors.general ?? message });
        }
      }
    }

    const hasErrors =
      Object.keys(billingErrors).length > 0 ||
      Object.keys(shippingErrors).length > 0 ||
      Object.keys(paymentErrors).length > 0;
    const cartIssue = isCartEmpty;

    if (hasErrors || cartIssue) {
      setErrors({ billing: billingErrors, shipping: shippingErrors, payment: paymentErrors });
      setSubmissionState(cartIssue ? 'cart-empty' : 'error');
      return;
    }

    setErrors({ billing: {}, shipping: {}, payment: {} });

  const now = new Date();
  const orderId = `AT-${now.getTime().toString(36).toUpperCase()}`;
    const selectedPayment = PAYMENT_METHODS.find(method => method.id === paymentMethod);
    const cartSnapshot = cartItems.map(({ product, quantity }) => ({
      id: product.id,
      name: product.name,
      sku: product.sku ?? product.id,
      quantity,
      unitPrice: product.price,
      total: product.price * quantity,
      category: product.category,
      thumbnail: product.images?.[0] ?? null
    }));

    const derivedShippingInfo = shipToBilling
      ? {
          contact: `${billingInfo.firstName} ${billingInfo.lastName}`.trim(),
          phone: billingInfo.phone,
          address: billingInfo.address,
          city: billingInfo.city,
          postal: billingInfo.postal,
          country: billingInfo.country,
          instructions: ''
        }
      : { ...shippingInfo };

  const sanitizedCardNumber = (cardDetails.cardNumber ?? '').replace(/[^0-9]/g, '');
    const cardLastFour = sanitizedCardNumber.slice(-4);

    const paymentIntentId = paymentMethod === 'card'
      ? cardStatus.transactionId ?? `card-${orderId}`
      : paymentMethod === 'paypal'
        ? paypalStatus.transactionId ?? `paypal-${orderId}`
        : `cod-${orderId}`;

    const orderSummary = {
      id: orderId,
      createdAt: now.toISOString(),
      billingInfo: { ...billingInfo },
      shippingInfo: derivedShippingInfo,
      shippingSameAsBilling: shipToBilling,
      payment: {
        id: paymentMethod,
        label: selectedPayment?.label ?? paymentMethod,
        description: selectedPayment?.description ?? '',
        transactionId: paymentIntentId,
        details:
          paymentMethod === 'card'
            ? {
                type: 'card',
                nameOnCard: cardDetails.nameOnCard,
                lastFour: cardLastFour,
                expiry: cardDetails.expiry,
                transactionId: paymentIntentId
              }
            : paymentMethod === 'paypal'
              ? {
                  type: 'paypal',
                  email: paypalDetails.email,
                  notes: paypalDetails.notes || '',
                  transactionId: paymentIntentId
                }
              : {
                  type: 'cod',
                  notes: 'Pay with cash or card when your order arrives.',
                  transactionId: paymentIntentId
                }
      },
      customerEmail: billingInfo.email,
      items: cartSnapshot,
      totals: {
        subtotal,
        shippingEstimate,
        tax,
        grandTotal
      },
      taxRate: 0.08
    };

    const transactionStatus = paymentMethod === 'cod' ? 'PENDING' : 'COMPLETED';
    const gatewayMessage = transactionStatus === 'COMPLETED'
      ? 'Checkout completed successfully.'
      : 'Payment pending until delivery is fulfilled.';
    const transactionMetadata = {
      items: cartSnapshot.map(({ id, quantity, total }) => ({ id, quantity, total })),
      shippingSameAsBilling: shipToBilling,
      paymentLabel: selectedPayment?.label ?? paymentMethod,
      cartItemCount: cartSnapshot.length,
      tax,
      shippingEstimate,
      subtotal
    };

    if (paymentMethod === 'card') {
      transactionMetadata.lastFour = cardLastFour || null;
      transactionMetadata.authorizedAt = cardStatus.completedAt || null;
    } else if (paymentMethod === 'paypal') {
      transactionMetadata.paypalEmail = paypalDetails.email || null;
      transactionMetadata.authorizedAt = paypalStatus.completedAt || null;
    } else if (paymentMethod === 'cod') {
      transactionMetadata.instructions = derivedShippingInfo.instructions || null;
    }

    try {
      await logPaymentTransaction({
        paymentIntentId,
        orderId: orderSummary.id,
        customerReference: user?.username ?? null,
        customerEmail: billingInfo.email || user?.email || null,
        paymentMethod,
        status: transactionStatus,
        amount: Number.isFinite(grandTotal) ? Number(grandTotal.toFixed(2)) : null,
        currency: 'USD',
        gatewayMessage,
        metadata: transactionMetadata
      });
    } catch (error) {
      console.error('[Checkout] Failed to log payment completion', error);
    }

    // Save order to backend database
    try {
      const orderPayload = {
        customerId: user?.id || null,
        customerEmail: billingInfo.email || user?.email,
        customerReference: user?.username || null,
        items: cartSnapshot.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0
        })),
        totalAmount: parseFloat(grandTotal.toFixed(2)),
        totals: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          shipping: parseFloat(shippingEstimate.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          grandTotal: parseFloat(grandTotal.toFixed(2)),
          currency: 'USD'
        },
        billing: {
          firstName: billingInfo.firstName || '',
          lastName: billingInfo.lastName || '',
          company: billingInfo.company || null,
          email: billingInfo.email || '',
          phone: billingInfo.phone || '',
          address: billingInfo.address || '',
          city: billingInfo.city || '',
          postal: billingInfo.postal || '',
          country: billingInfo.country || ''
        },
        shipping: {
          contact: derivedShippingInfo.contact || '',
          phone: derivedShippingInfo.phone || '',
          address: derivedShippingInfo.address || '',
          city: derivedShippingInfo.city || '',
          postal: derivedShippingInfo.postal || '',
          country: derivedShippingInfo.country || billingInfo.country || '',
          instructions: derivedShippingInfo.instructions || ''
        },
        shippingSameAsBilling: shipToBilling === true,
        payment: {
          method: paymentMethod || 'cod',
          status: transactionStatus === 'COMPLETED' ? 'PAID' : 'PENDING',
          transactionId: paymentIntentId || '',
          amount: parseFloat(grandTotal.toFixed(2)),
          currency: 'USD',
          processedAt: new Date().toISOString(),
          metadata: paymentMethod === 'card' 
            ? { lastFour: cardLastFour || '', nameOnCard: cardDetails.nameOnCard || '' }
            : paymentMethod === 'paypal'
            ? { email: paypalDetails.email || '' }
            : { type: 'cod' }
        },
        paymentStatus: transactionStatus === 'COMPLETED' ? 'PLACED' : 'PROCESSING',
        placedAt: new Date().toISOString()
      };

      console.log('[Checkout] Sending order payload:', JSON.stringify(orderPayload, null, 2));
      
      const savedOrder = await createOrder(orderPayload);
      console.log('[Checkout] Order saved successfully:', savedOrder);
      
      // Update order summary with backend order ID
      orderSummary.backendOrderId = savedOrder.id;
    } catch (error) {
      console.error('[Checkout] Failed to save order to backend:', error);
      console.error('[Checkout] Error details:', error.response?.data || error.message);
      setSubmissionState('error');
      setPaymentFeedback({
        type: 'error',
        message: 'Failed to save your order. Please contact support with your transaction ID: ' + paymentIntentId
      });
      return;
    }

    sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderSummary));

    setSubmissionState('success');
    navigate('/order-confirmation', { state: { orderId: orderSummary.id } });
    setTimeout(() => clearCart(), 0);
  };

  const renderCartItems = () => {
    if (cartItems.length === 0) {
      return (
        <div className="bg-white/80 rounded-2xl border border-gray-200 p-8 text-center shadow-inner">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h4>
          <p className="text-sm text-gray-500 mb-4">Browse products and add them to your cart before checking out.</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            Continue Shopping
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {cartItems.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-500">Qty: {quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {currencyFormatter.format(product.price * quantity)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Ships in 2-3 days</span>
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> 1 year warranty</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <form id="checkoutForm" onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-10 pb-16">
        <header className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-white/70">Checkout</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">Finalize your order</h1>
              <p className="mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
                Complete your purchase by entering your billing & shipping information. You can review your order and choose a preferred payment method below.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl bg-white/10 p-4 text-sm text-blue-50 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Secure checkout</p>
                  <p className="text-xs text-blue-100">256-bit SSL encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Fast dispatch</p>
                  <p className="text-xs text-blue-100">Same-day processing before 3 PM</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="space-y-8">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Billing Information</h2>
                  <p className="text-sm text-gray-500">We&apos;ll use this information for invoices and receipts.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="firstName">First name</label>
                  <div className={`flex items-center gap-3 rounded-xl border ${errors.billing.firstName ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                    <User className="h-4 w-4 text-gray-400" />
                    <input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      className="w-full bg-transparent outline-none"
                      value={billingInfo.firstName}
                      onChange={handleBillingChange('firstName')}
                      onBlur={handleBillingBlur('firstName')}
                      aria-invalid={Boolean(errors.billing.firstName)}
                    />
                  </div>
                  {errors.billing.firstName && <p className="text-xs font-medium text-red-600">{errors.billing.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="lastName">Last name</label>
                  <div className={`flex items-center gap-3 rounded-xl border ${errors.billing.lastName ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                    <User className="h-4 w-4 text-gray-400" />
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      className="w-full bg-transparent outline-none"
                      value={billingInfo.lastName}
                      onChange={handleBillingChange('lastName')}
                      onBlur={handleBillingBlur('lastName')}
                      aria-invalid={Boolean(errors.billing.lastName)}
                    />
                  </div>
                  {errors.billing.lastName && <p className="text-xs font-medium text-red-600">{errors.billing.lastName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="company">Company (optional)</label>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
                    <Building className="h-4 w-4 text-gray-400" />
                    <input
                      id="company"
                      type="text"
                      placeholder="Athukorala Traders Pvt Ltd"
                      className="w-full bg-transparent outline-none"
                      value={billingInfo.company}
                      onChange={handleBillingChange('company')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="email">Email address</label>
                  <div className={`flex items-center gap-3 rounded-xl border ${errors.billing.email ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                    <Mail className="h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="john.doe@email.com"
                      className="w-full bg-transparent outline-none"
                      value={billingInfo.email}
                      onChange={handleBillingChange('email')}
                      onBlur={handleBillingBlur('email')}
                      aria-invalid={Boolean(errors.billing.email)}
                    />
                  </div>
                  {errors.billing.email && <p className="text-xs font-medium text-red-600">{errors.billing.email}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="phone">Phone number</label>
                  <div className={`flex items-center gap-3 rounded-xl border ${errors.billing.phone ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                    <Phone className="h-4 w-4 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="(+94) 71 234 5678"
                      className="w-full bg-transparent outline-none"
                      value={billingInfo.phone}
                      onChange={handleBillingChange('phone')}
                      onBlur={handleBillingBlur('phone')}
                      aria-invalid={Boolean(errors.billing.phone)}
                    />
                  </div>
                  {errors.billing.phone && <p className="text-xs font-medium text-red-600">{errors.billing.phone}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="billingAddress">Billing address</label>
                  <div className={`flex items-center gap-3 rounded-xl border ${errors.billing.address ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <input
                      id="billingAddress"
                      type="text"
                      placeholder="123 Main Street"
                      className="w-full bg-transparent outline-none"
                      value={billingInfo.address}
                      onChange={handleBillingChange('address')}
                      onBlur={handleBillingBlur('address')}
                      aria-invalid={Boolean(errors.billing.address)}
                    />
                  </div>
                  {errors.billing.address && <p className="text-xs font-medium text-red-600">{errors.billing.address}</p>}
                </div>
                <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="billingCity">City</label>
                    <div className={`rounded-xl border ${errors.billing.city ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                      <input
                        id="billingCity"
                        type="text"
                        placeholder="Colombo"
                        className="w-full bg-transparent outline-none"
                        value={billingInfo.city}
                        onChange={handleBillingChange('city')}
                        onBlur={handleBillingBlur('city')}
                        aria-invalid={Boolean(errors.billing.city)}
                      />
                    </div>
                    {errors.billing.city && <p className="text-xs font-medium text-red-600">{errors.billing.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="billingPostal">Postal code</label>
                    <div className={`rounded-xl border ${errors.billing.postal ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                      <input
                        id="billingPostal"
                        type="text"
                        placeholder="00500"
                        className="w-full bg-transparent outline-none"
                        value={billingInfo.postal}
                        onChange={handleBillingChange('postal')}
                        onBlur={handleBillingBlur('postal')}
                        aria-invalid={Boolean(errors.billing.postal)}
                      />
                    </div>
                    {errors.billing.postal && <p className="text-xs font-medium text-red-600">{errors.billing.postal}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="billingCountry">Country</label>
                    <div className={`rounded-xl border ${errors.billing.country ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                      <input
                        id="billingCountry"
                        type="text"
                        placeholder="Sri Lanka"
                        className="w-full bg-transparent outline-none"
                        value={billingInfo.country}
                        onChange={handleBillingChange('country')}
                        onBlur={handleBillingBlur('country')}
                        aria-invalid={Boolean(errors.billing.country)}
                      />
                    </div>
                    {errors.billing.country && <p className="text-xs font-medium text-red-600">{errors.billing.country}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
              <div className="mb-6 flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Home className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                    <p className="text-sm text-gray-500">Choose where your items should be delivered.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleShipToBilling}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    shipToBilling
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Same as billing
                </button>
              </div>

              {!shipToBilling && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="shippingContact">Contact person</label>
                    <div className={`flex items-center gap-3 rounded-xl border ${errors.shipping.contact ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                      <User className="h-4 w-4 text-gray-400" />
                      <input
                        id="shippingContact"
                        type="text"
                        placeholder="Recipient name"
                        className="w-full bg-transparent outline-none"
                        value={shippingInfo.contact}
                        onChange={handleShippingChange('contact')}
                        onBlur={handleShippingBlur('contact')}
                        aria-invalid={Boolean(errors.shipping.contact)}
                      />
                    </div>
                    {errors.shipping.contact && <p className="text-xs font-medium text-red-600">{errors.shipping.contact}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="shippingPhone">Phone number</label>
                    <div className={`flex items-center gap-3 rounded-xl border ${errors.shipping.phone ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                      <Phone className="h-4 w-4 text-gray-400" />
                      <input
                        id="shippingPhone"
                        type="tel"
                        placeholder="Delivery contact"
                        className="w-full bg-transparent outline-none"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange('phone')}
                        onBlur={handleShippingBlur('phone')}
                        aria-invalid={Boolean(errors.shipping.phone)}
                      />
                    </div>
                    {errors.shipping.phone && <p className="text-xs font-medium text-red-600">{errors.shipping.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="shippingAddress">Address</label>
                    <textarea
                      id="shippingAddress"
                      rows={3}
                      placeholder="Apartment, street, district"
                      className={`mt-2 w-full rounded-2xl border ${errors.shipping.address ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 shadow-inner focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                      value={shippingInfo.address}
                      onChange={handleShippingChange('address')}
                      onBlur={handleShippingBlur('address')}
                      aria-invalid={Boolean(errors.shipping.address)}
                    />
                    {errors.shipping.address && <p className="mt-1 text-xs font-medium text-red-600">{errors.shipping.address}</p>}
                  </div>
                  <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700" htmlFor="shippingCity">City</label>
                      <input
                        id="shippingCity"
                        type="text"
                        placeholder="Colombo"
                        className={`w-full rounded-xl border ${errors.shipping.city ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                        value={shippingInfo.city}
                        onChange={handleShippingChange('city')}
                        onBlur={handleShippingBlur('city')}
                        aria-invalid={Boolean(errors.shipping.city)}
                      />
                      {errors.shipping.city && <p className="text-xs font-medium text-red-600">{errors.shipping.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700" htmlFor="shippingPostal">Postal code</label>
                      <input
                        id="shippingPostal"
                        type="text"
                        placeholder="00500"
                        className={`w-full rounded-xl border ${errors.shipping.postal ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                        value={shippingInfo.postal}
                        onChange={handleShippingChange('postal')}
                        onBlur={handleShippingBlur('postal')}
                        aria-invalid={Boolean(errors.shipping.postal)}
                      />
                      {errors.shipping.postal && <p className="text-xs font-medium text-red-600">{errors.shipping.postal}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700" htmlFor="shippingInstructions">Delivery notes</label>
                      <input
                        id="shippingInstructions"
                        type="text"
                        placeholder="Add gate code or instructions"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                        value={shippingInfo.instructions}
                        onChange={handleShippingChange('instructions')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {shipToBilling && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-700 shadow-inner">
                  We will ship to your billing address. You can switch off the toggle above to add a different shipping location.
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment Options</h2>
                  <p className="text-sm text-gray-500">Select a payment method to complete your purchase.</p>
                </div>
              </div>

              {paymentFeedback && (
                <div
                  className={`mb-5 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm ${
                    paymentFeedback.type === 'error'
                      ? 'border-red-200 bg-red-50/80 text-red-700'
                      : 'border-emerald-200 bg-emerald-50/80 text-emerald-700'
                  }`}
                >
                  <span className="leading-relaxed">{paymentFeedback.message}</span>
                  <button
                    type="button"
                    onClick={dismissPaymentFeedback}
                    className="rounded-xl border border-current/40 px-3 py-1 text-xs font-semibold transition hover:border-current hover:bg-white/20"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="grid gap-4">
                {PAYMENT_METHODS.map(({ id, icon: Icon, label, description }) => {
                  const isActive = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectPayment(id)}
                      className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left shadow-sm transition ${
                        isActive
                          ? 'border-purple-200 bg-purple-50/80 text-purple-700 shadow-lg'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50/70'
                      }`}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                        isActive ? 'border-purple-300 bg-white text-purple-600' : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold">{label}</p>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 ${
                        isActive ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                      }`}>
                        {isActive && <span className="block h-full w-full rounded-full border-4 border-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/60 p-6 shadow-inner">
                  <h3 className="text-base font-semibold text-purple-800">Secure card payment</h3>
                  <p className="mt-1 text-xs text-purple-600">You&apos;ll complete card details on a secure mock gateway.</p>
                  {cardDetails.cardNumber ? (
                    <div className="mt-4 rounded-xl border border-purple-200 bg-white/80 p-4 text-sm text-gray-700">
                      <p className="font-medium text-gray-900">Saved sandbox card</p>
                      <p className="mt-1">Card ending in •••• {cardLastFourPreview || '----'}</p>
                      {cardNumberPreview && <p className="text-xs text-gray-500">Card preview: {cardNumberPreview}</p>}
                      {cardDetails.nameOnCard && <p>Name on card: {cardDetails.nameOnCard}</p>}
                      {cardDetails.expiry && <p>Expiry: {cardDetails.expiry}</p>}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-purple-200 bg-white/70 p-4 text-sm text-purple-700">
                      No card captured yet. Click below to launch the mock gateway and provide test card data (e.g. 4242 4242 4242 4242).
                    </div>
                  )}
                  {cardStatus.state === 'authorized' && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-700">
                      Card authorized {cardAuthorizedLabel ? `on ${cardAuthorizedLabel}` : 'and ready to use'}.
                    </div>
                  )}
                  {cardStatus.state === 'failed' && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700">
                      {cardStatus.errorMessage || 'Card authorization failed in the mock gateway. Re-open the secure gateway to retry.'}
                    </div>
                  )}
                  {cardStatus.state === 'unverified' && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-700">
                      Card details have not been authorized yet. Launch the secure gateway to submit sandbox card information.
                    </div>
                  )}
                  {errors.payment.general && paymentMethod === 'card' && (
                    <p className="mt-3 rounded-xl bg-red-50/70 px-3 py-2 text-xs font-medium text-red-600">{errors.payment.general}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openPaymentGateway('card')}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-700"
                    >
                      Open secure card gateway
                    </button>
                    {cardDetails.cardNumber && (
                      <button
                        type="button"
                        onClick={() => clearPaymentDraft('card')}
                        className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-5 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
                      >
                        Clear saved card
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openPaymentGateway('card')}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      Simulate payment failure
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 shadow-inner">
                  <h3 className="text-base font-semibold text-blue-800">PayPal sandbox checkout</h3>
                  <p className="mt-1 text-xs text-blue-600">You&apos;ll be redirected to a mock PayPal screen to confirm your sandbox account.</p>
                  {paypalDetails.email ? (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-white/80 p-4 text-sm text-gray-700">
                      <p className="font-medium text-gray-900">Connected PayPal profile</p>
                      <p className="mt-1">{paypalDetails.email}</p>
                      {paypalDetails.notes && <p className="text-xs text-gray-500">Notes: {paypalDetails.notes}</p>}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-white/70 p-4 text-sm text-blue-700">
                      No PayPal account linked yet. Launch the sandbox gateway to sign in with a test buyer email (e.g. buyer@example.com).
                    </div>
                  )}
                  {paypalStatus.state === 'authorized' && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-700">
                      PayPal authorized {paypalAuthorizedLabel ? `on ${paypalAuthorizedLabel}` : 'and ready to use'}.
                    </div>
                  )}
                  {paypalStatus.state === 'failed' && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700">
                      {paypalStatus.errorMessage || 'PayPal authorization failed in the sandbox gateway. Re-open the PayPal sandbox to try again.'}
                    </div>
                  )}
                  {paypalStatus.state === 'unverified' && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-700">
                      PayPal has not been authorized yet. Launch the sandbox gateway to connect your test buyer account.
                    </div>
                  )}
                  {errors.payment.general && paymentMethod === 'paypal' && (
                    <p className="mt-3 rounded-xl bg-red-50/70 px-3 py-2 text-xs font-medium text-red-600">{errors.payment.general}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openPaymentGateway('paypal')}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#003087] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#00246b]"
                    >
                      Open PayPal sandbox
                    </button>
                    {paypalDetails.email && (
                      <button
                        type="button"
                        onClick={() => clearPaymentDraft('paypal')}
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                      >
                        Disconnect PayPal
                      </button>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-inner text-sm text-emerald-800">
                  <h3 className="text-base font-semibold text-emerald-900">Cash on delivery instructions</h3>
                  <ul className="mt-3 space-y-2 list-disc pl-5">
                    <li>Have the exact amount or a card ready for our courier.</li>
                    <li>Valid ID may be requested for orders above $250.</li>
                    <li>Need to adjust the payment? Contact support within 12 hours.</li>
                  </ul>
                </div>
              )}

              <div className="mt-7 grid gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-5 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <span>All transactions are secure and encrypted. We never store your payment details.</span>
                </div>
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-indigo-500" />
                  <span>Need to split payments or use a purchase order? Contact our sales team after checkout.</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-8">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                <span className="rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700">
                  {cartItems.length} item{cartItems.length === 1 ? '' : 's'}
                </span>
              </div>

              {renderCartItems()}

              {cartItems.length > 0 && (
                <div className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-5 text-sm">
                  {submissionState === 'processing' && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-blue-700">
                      Verifying your details and preparing the confirmation page…
                    </div>
                  )}
                  {submissionState === 'success' && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-700">
                      Billing, shipping, and payment details look great. Redirecting you now…
                    </div>
                  )}
                  {submissionState === 'error' && (
                    <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-red-700">
                      Please fix the highlighted fields before continuing.
                    </div>
                  )}
                  {submissionState === 'cart-empty' && (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50/80 p-3 text-yellow-700">
                      Add items to your cart to complete checkout.
                    </div>
                  )}
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-800">{currencyFormatter.format(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Estimated shipping</span>
                    <span className="font-medium text-gray-800">{currencyFormatter.format(shippingEstimate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span className="font-medium text-gray-800">{currencyFormatter.format(tax)}</span>
                  </div>
                  <div className="border-t border-dashed pt-4 text-base font-semibold text-gray-900">
                    <div className="flex items-center justify-between">
                      <span>Total due</span>
                      <span>{currencyFormatter.format(grandTotal)}</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition ${
                      (isCartEmpty || submissionState === 'processing')
                        ? 'cursor-not-allowed bg-slate-400'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={isCartEmpty || submissionState === 'processing'}
                    aria-disabled={isCartEmpty || submissionState === 'processing'}
                  >
                    Continue to confirmation
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-3xl border border-blue-100 bg-blue-50/80 p-6 text-sm text-blue-900 shadow-inner">
              <h3 className="text-base font-semibold">Need help?</h3>
              <p className="leading-relaxed">
                Our customer support specialists are available 7 days a week to assist with invoice requests, quotation adjustments, and custom delivery arrangements.
              </p>
              <div className="flex gap-2 text-blue-800">
                <Phone className="h-4 w-4" />
                <span>(+94) 11 234 5678</span>
              </div>
              <div className="flex gap-2 text-blue-800">
                <Mail className="h-4 w-4" />
                <span>support@athukoralatraders.com</span>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
              <h3 className="text-base font-semibold text-gray-900">Checkout FAQs</h3>
              <div className="mt-4 space-y-4">
                {FAQ_ITEMS.map(({ title, description }) => (
                  <div key={title} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 text-sm text-gray-600">
                    <p className="font-semibold text-gray-800">{title}</p>
                    <p className="mt-1 leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </form>
    </Layout>
  );
};

export default CheckoutPage;
