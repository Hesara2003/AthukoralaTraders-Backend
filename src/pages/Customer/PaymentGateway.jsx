import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CustomerLayout from '../../components/CustomerLayout';
import PublicLayout from '../../components/PublicLayout';
import { ShieldCheck, Lock, CreditCard, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { logPaymentTransaction } from '../../utils/paymentTransactionsApi';

const PAYMENT_DRAFT_KEY = 'athukorala-payment-draft';
const EMPTY_CARD_DETAILS = { nameOnCard: '', cardNumber: '', expiry: '', cvv: '' };
const EMPTY_PAYPAL_DETAILS = { email: '', notes: '' };

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

const validateCardDetails = (data) => {
  const errors = {};
  const sanitizedNumber = (data.cardNumber ?? '').replace(/[\s-]/g, '');

  if (!(data.nameOnCard ?? '').trim()) {
    errors.nameOnCard = 'Name on card is required.';
  }
  if (!sanitizedNumber) {
    errors.cardNumber = 'Card number is required.';
  } else if (!/^\d{13,19}$/.test(sanitizedNumber)) {
    errors.cardNumber = 'Enter a valid card number.';
  }

  const expiryValue = (data.expiry ?? '').trim();
  if (!expiryValue) {
    errors.expiry = 'Expiry date is required.';
  } else if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiryValue)) {
    errors.expiry = 'Use MM/YY format.';
  }

  const cvvValue = (data.cvv ?? '').trim();
  if (!cvvValue) {
    errors.cvv = 'Security code is required.';
  } else if (!/^\d{3,4}$/.test(cvvValue)) {
    errors.cvv = 'Enter a valid CVV.';
  }

  return errors;
};

const validatePaypalDetails = (data) => {
  const errors = {};
  const email = (data.email ?? '').trim();
  if (!email) {
    errors.email = 'PayPal email is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Enter a valid PayPal email.';
  }
  return errors;
};

const PaymentGateway = () => {
  const { user } = useAuth();
  const { method } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const paymentContext = location.state?.paymentContext ?? {};
  const returnTo = location.state?.returnTo ?? '/checkout';
  const [transactionId, setTransactionId] = useState(() => {
    if (typeof paymentContext.paymentIntentId === 'string' && paymentContext.paymentIntentId.trim().length > 0) {
      return paymentContext.paymentIntentId.trim();
    }
    return `txn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  });

  const normalizedMethod = (method ?? '').toLowerCase();

  const [cardDetails, setCardDetails] = useState(() => ({ ...EMPTY_CARD_DETAILS }));
  const [paypalDetails, setPaypalDetails] = useState(() => ({ ...EMPTY_PAYPAL_DETAILS }));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [gatewayStatus, setGatewayStatus] = useState(() => ({ state: 'unverified', errorMessage: '', completedAt: null }));

  const Layout = user ? CustomerLayout : PublicLayout;

  const methodConfig = useMemo(() => {
    if (normalizedMethod === 'card') {
      return {
        title: 'Secure Card Gateway',
        description: 'Enter sandbox card details to simulate a successful payment.',
        accent: 'from-purple-500 to-indigo-500'
      };
    }
    if (normalizedMethod === 'paypal') {
      return {
        title: 'PayPal Sandbox Gateway',
        description: 'Sign in with a sandbox PayPal email to authorise the payment.',
        accent: 'from-blue-500 to-sky-600'
      };
    }
    return null;
  }, [normalizedMethod]);

  useEffect(() => {
    if (!methodConfig) {
      navigate('/checkout', { replace: true });
      return;
    }
    const stored = sessionStorage.getItem(PAYMENT_DRAFT_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (normalizedMethod === 'card') {
        if (parsed.card) {
          const details = parsed.card.details ?? parsed.card;
          setCardDetails({ ...EMPTY_CARD_DETAILS, ...details });
          setGatewayStatus({
            state: parsed.card.status ?? 'authorized',
            errorMessage: parsed.card.errorMessage ?? '',
            completedAt: parsed.card.completedAt ?? null
          });
          if (parsed.card.transactionId) {
            setTransactionId(parsed.card.transactionId);
          }
        } else {
          setCardDetails({ ...EMPTY_CARD_DETAILS });
          setGatewayStatus({ state: 'unverified', errorMessage: '', completedAt: null });
        }
      }
      if (normalizedMethod === 'paypal') {
        if (parsed.paypal) {
          const details = parsed.paypal.details ?? parsed.paypal;
          setPaypalDetails({ ...EMPTY_PAYPAL_DETAILS, ...details });
          setGatewayStatus({
            state: parsed.paypal.status ?? 'authorized',
            errorMessage: parsed.paypal.errorMessage ?? '',
            completedAt: parsed.paypal.completedAt ?? null
          });
          if (parsed.paypal.transactionId) {
            setTransactionId(parsed.paypal.transactionId);
          }
        } else {
          setPaypalDetails({ ...EMPTY_PAYPAL_DETAILS });
          setGatewayStatus({ state: 'unverified', errorMessage: '', completedAt: null });
        }
      }
    } catch (error) {
      console.error('[PaymentGateway] Failed to parse payment draft', error);
      sessionStorage.removeItem(PAYMENT_DRAFT_KEY);
      setCardDetails({ ...EMPTY_CARD_DETAILS });
      setPaypalDetails({ ...EMPTY_PAYPAL_DETAILS });
      setGatewayStatus({ state: 'unverified', errorMessage: '', completedAt: null });
    }
  }, [normalizedMethod, methodConfig, navigate]);

  const handleCancel = () => {
    navigate(returnTo, { replace: false });
  };

  const navigateBack = (payload) => {
    navigate(returnTo, { replace: false, state: payload });
  };

  const persistDraft = (payload) => {
    let existing = {};
    const stored = sessionStorage.getItem(PAYMENT_DRAFT_KEY);
    if (stored) {
      try {
        existing = JSON.parse(stored) || {};
      } catch (error) {
        console.error('[PaymentGateway] Unable to parse existing draft, rebuilding', error);
      }
    }
    const updated = { ...existing, ...payload };
    Object.keys(updated).forEach((key) => {
      if (!updated[key] || (typeof updated[key] === 'object' && Object.keys(updated[key]).length === 0)) {
        delete updated[key];
      }
    });
    if (Object.keys(updated).length === 0) {
      sessionStorage.removeItem(PAYMENT_DRAFT_KEY);
    } else {
      sessionStorage.setItem(PAYMENT_DRAFT_KEY, JSON.stringify(updated));
    }
  };

  const logTransactionResult = async (statusValue, message, metadata = {}, failureReason = undefined) => {
    const mergedMetadata = {
      ...(paymentContext?.metadata ?? {}),
      ...metadata,
      simulated: true,
      gatewayMethod: normalizedMethod
    };
    Object.keys(mergedMetadata).forEach((key) => {
      if (mergedMetadata[key] === undefined) {
        delete mergedMetadata[key];
      }
    });

    try {
      await logPaymentTransaction({
        paymentIntentId: transactionId,
        paymentMethod: normalizedMethod,
        status: statusValue,
        amount: typeof paymentContext.amount === 'number' ? paymentContext.amount : null,
        currency: paymentContext.currency || 'USD',
        customerReference: paymentContext.customerReference || (user?.username ?? null),
        customerEmail: paymentContext.customerEmail || (user?.email ?? null),
        orderId: paymentContext.orderId || null,
        gatewayMessage: message,
        failureReason: failureReason ?? null,
        metadata: mergedMetadata
      });
    } catch (error) {
      console.error('[PaymentGateway] Failed to log transaction', error);
    }
  };

  const authorizePayment = async () => {
    setStatus('processing');

    if (normalizedMethod === 'card') {
      const validation = validateCardDetails(cardDetails);
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        setStatus('error');
        return;
      }
      setErrors({});
      const sanitizedNumber = (cardDetails.cardNumber ?? '').replace(/[^0-9]/g, '');
      const normalizedDetails = {
        ...cardDetails,
        cardNumber: sanitizedNumber
      };
      const completedAt = new Date().toISOString();
      persistDraft({
        card: {
          details: normalizedDetails,
          status: 'authorized',
          errorMessage: '',
          completedAt,
          transactionId
        }
      });
      setGatewayStatus({ state: 'authorized', errorMessage: '', completedAt });
      setStatus('success');
      const message = 'Card authorization saved successfully.';
      await logTransactionResult('AUTHORIZED', message, {
        lastFour: sanitizedNumber.slice(-4) || null,
        expiry: cardDetails.expiry || null,
        completedAt
      });
      navigateBack({ paymentUpdated: 'card', paymentFailed: false, message });
      return;
    }

    if (normalizedMethod === 'paypal') {
      const validation = validatePaypalDetails(paypalDetails);
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        setStatus('error');
        return;
      }
      setErrors({});
      const normalizedPaypal = {
        email: (paypalDetails.email ?? '').trim(),
        notes: paypalDetails.notes ?? ''
      };
      const completedAt = new Date().toISOString();
      persistDraft({
        paypal: {
          details: normalizedPaypal,
          status: 'authorized',
          errorMessage: '',
          completedAt,
          transactionId
        }
      });
      setGatewayStatus({ state: 'authorized', errorMessage: '', completedAt });
      setStatus('success');
      const message = 'PayPal authorization saved successfully.';
      await logTransactionResult('AUTHORIZED', message, {
        paypalEmail: normalizedPaypal.email,
        completedAt
      });
      navigateBack({ paymentUpdated: 'paypal', paymentFailed: false, message });
    }
  };

  const simulateFailure = async () => {
    setStatus('processing');

    if (normalizedMethod === 'card') {
      const validation = validateCardDetails(cardDetails);
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        setStatus('error');
        return;
      }
      setErrors({});
      const sanitizedNumber = (cardDetails.cardNumber ?? '').replace(/[^0-9]/g, '');
      const normalizedDetails = {
        ...cardDetails,
        cardNumber: sanitizedNumber
      };
      const completedAt = new Date().toISOString();
      const errorMessage = 'Card authorization was declined (mock).';
      persistDraft({
        card: {
          details: normalizedDetails,
          status: 'failed',
          errorMessage,
          completedAt,
          transactionId
        }
      });
      setGatewayStatus({ state: 'failed', errorMessage, completedAt });
      setStatus('failure');
      await logTransactionResult('DECLINED', errorMessage, {
        lastFour: sanitizedNumber.slice(-4) || null,
        expiry: cardDetails.expiry || null,
        completedAt
      }, errorMessage);
      navigateBack({ paymentUpdated: 'card', paymentFailed: true, message: errorMessage });
      return;
    }

    if (normalizedMethod === 'paypal') {
      const validation = validatePaypalDetails(paypalDetails);
      if (Object.keys(validation).length > 0) {
        setErrors(validation);
        setStatus('error');
        return;
      }
      setErrors({});
      const normalizedPaypal = {
        email: (paypalDetails.email ?? '').trim(),
        notes: paypalDetails.notes ?? ''
      };
      const completedAt = new Date().toISOString();
      const errorMessage = 'PayPal authorization was declined (mock).';
      persistDraft({
        paypal: {
          details: normalizedPaypal,
          status: 'failed',
          errorMessage,
          completedAt,
          transactionId
        }
      });
      setGatewayStatus({ state: 'failed', errorMessage, completedAt });
      setStatus('failure');
      await logTransactionResult('DECLINED', errorMessage, {
        paypalEmail: normalizedPaypal.email,
        completedAt
      }, errorMessage);
      navigateBack({ paymentUpdated: 'paypal', paymentFailed: true, message: errorMessage });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    authorizePayment();
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className={`rounded-3xl bg-gradient-to-br ${methodConfig?.accent ?? 'from-gray-500 to-gray-600'} p-8 text-white shadow-xl`}>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{methodConfig?.title ?? 'Payment Gateway'}</h1>
              <p className="mt-2 text-sm text-white/80">{methodConfig?.description}</p>
              <p className="mt-3 text-xs text-white/70">This is a mock experience for development only. No real transactions are processed.</p>
            </div>
          </div>
        </div>

        {gatewayStatus.state === 'authorized' && (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-700">
            Payment authorized {formatDateTime(gatewayStatus.completedAt) ? `on ${formatDateTime(gatewayStatus.completedAt)}` : 'and ready to use'}.
          </div>
        )}
        {gatewayStatus.state === 'failed' && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
            {gatewayStatus.errorMessage || 'The last authorization attempt failed. Submit the form again to retry.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to checkout
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="h-4 w-4" />
              Mock secure session
            </div>
          </div>

          {normalizedMethod === 'card' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5 text-sm text-purple-800">
                <p className="font-medium text-purple-900">Test card data</p>
                <p className="mt-1">Use <span className="font-semibold">4242 4242 4242 4242</span> with any future expiry (MM/YY) and a 3-digit CVV to simulate approval.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="cardName">Name on card</label>
                  <div className={`flex items-center gap-3 rounded-xl border ${errors.nameOnCard ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100`}>
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <input
                      id="cardName"
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-transparent outline-none"
                      value={cardDetails.nameOnCard}
                      onChange={(event) => setCardDetails(prev => ({ ...prev, nameOnCard: event.target.value }))}
                    />
                  </div>
                  {errors.nameOnCard && <p className="text-xs font-medium text-red-600">{errors.nameOnCard}</p>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="cardNumber">Card number</label>
                  <div className={`flex items-center gap-3 rounded-xl border ${errors.cardNumber ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100`}>
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <input
                      id="cardNumber"
                      type="text"
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-transparent outline-none"
                      value={cardDetails.cardNumber}
                      onChange={(event) => setCardDetails(prev => ({ ...prev, cardNumber: event.target.value }))}
                    />
                  </div>
                  {errors.cardNumber && <p className="text-xs font-medium text-red-600">{errors.cardNumber}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="cardExpiry">Expiry (MM/YY)</label>
                  <input
                    id="cardExpiry"
                    type="text"
                    placeholder="12/34"
                    className={`w-full rounded-xl border ${errors.expiry ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100`}
                    value={cardDetails.expiry}
                    onChange={(event) => setCardDetails(prev => ({ ...prev, expiry: event.target.value }))}
                  />
                  {errors.expiry && <p className="text-xs font-medium text-red-600">{errors.expiry}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="cardCvv">Security code</label>
                  <input
                    id="cardCvv"
                    type="password"
                    inputMode="numeric"
                    placeholder="123"
                    className={`w-full rounded-xl border ${errors.cvv ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100`}
                    value={cardDetails.cvv}
                    onChange={(event) => setCardDetails(prev => ({ ...prev, cvv: event.target.value }))}
                  />
                  {errors.cvv && <p className="text-xs font-medium text-red-600">{errors.cvv}</p>}
                </div>
              </div>
            </div>
          )}

          {normalizedMethod === 'paypal' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-blue-800">
                <p className="font-medium text-blue-900">Sandbox sign-in</p>
                <p className="mt-1">Use a sandbox buyer email such as <span className="font-semibold">buyer@example.com</span> to simulate consent. No external redirects occur in this mock.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="paypalEmail">PayPal email</label>
                <div className={`flex items-center gap-3 rounded-xl border ${errors.email ? 'border-red-400 bg-red-50/50 ring-2 ring-red-100' : 'border-gray-200 bg-gray-50'} px-3 py-3 text-sm text-gray-700 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100`}>
                  <Mail className="h-4 w-4 text-gray-400" />
                  <input
                    id="paypalEmail"
                    type="email"
                    placeholder="buyer@example.com"
                    className="w-full bg-transparent outline-none"
                    value={paypalDetails.email}
                    onChange={(event) => setPaypalDetails(prev => ({ ...prev, email: event.target.value }))}
                  />
                </div>
                {errors.email && <p className="text-xs font-medium text-red-600">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="paypalNotes">Notes to seller (optional)</label>
                <textarea
                  id="paypalNotes"
                  rows={3}
                  placeholder="Add any PO reference or delivery note"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={paypalDetails.notes}
                  onChange={(event) => setPaypalDetails(prev => ({ ...prev, notes: event.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-5 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>This is a simulated experience. Submitted details are only stored in session storage for checkout review.</span>
            </div>
            {status === 'error' && (
              <p className="mt-3 rounded-xl bg-red-50/80 px-3 py-2 text-xs font-medium text-red-600">Fix the highlighted fields before continuing.</p>
            )}
            {status === 'success' && (
              <p className="mt-3 rounded-xl bg-emerald-50/80 px-3 py-2 text-xs font-medium text-emerald-700">Payment details saved. Returning you to checkout…</p>
            )}
            {status === 'failure' && (
              <p className="mt-3 rounded-xl bg-red-50/80 px-3 py-2 text-xs font-medium text-red-600">Payment marked as failed. We&apos;re sending you back to checkout so you can try again.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Ready when all fields are complete
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              {(normalizedMethod === 'card' || normalizedMethod === 'paypal') && (
                <button
                  type="button"
                  onClick={simulateFailure}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Simulate payment failure
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Save and return to checkout
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PaymentGateway;
