/**
 * Razorpay payment integration (client-side)
 * 
 * Flow:
 * 1. Client calls /api/payment/razorpay-create-order to get order_id
 * 2. Client opens Razorpay checkout with order_id
 * 3. On success, client calls /api/payment/razorpay-verify with payment details
 * 4. Server verifies signature and updates user plan to 'pro'
 */

import { env } from '../lib/env';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  amount: number; // in paise (₹199 = 19900)
  currency: string;
  userId: string;
  userEmail: string;
  planType: 'monthly' | 'annual';
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onError: (error: any) => void;
  onDismiss?: () => void;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Load the Razorpay SDK script dynamically
 */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

/**
 * Create an order on the backend and get order_id
 */
async function createOrder(amount: number, currency: string, userId: string, planType: string): Promise<{ orderId: string }> {
  const response = await fetch('/api/payment/razorpay-create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, userId, planType }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create Razorpay order');
  }

  return response.json();
}

/**
 * Verify payment on the backend
 */
export async function verifyRazorpayPayment(
  paymentData: RazorpaySuccessResponse,
  userId: string
): Promise<{ success: boolean }> {
  const response = await fetch('/api/payment/razorpay-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...paymentData, userId }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Payment verification failed');
  }

  return response.json();
}

/**
 * Open the Razorpay checkout modal
 */
export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  const { amount, currency, userId, userEmail, planType, onSuccess, onError, onDismiss } = options;

  try {
    // Load SDK
    await loadRazorpayScript();

    // Create order
    const { orderId } = await createOrder(amount, currency, userId, planType);

    const razorpayKeyId = env.RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      throw new Error('Razorpay Key ID is not configured');
    }

    // Open checkout
    const rzp = new window.Razorpay({
      key: razorpayKeyId,
      amount,
      currency,
      name: 'Strikin',
      description: `Pro Plan (${planType === 'annual' ? 'Annual' : 'Monthly'})`,
      order_id: orderId,
      prefill: {
        email: userEmail,
      },
      theme: {
        color: '#2563EB',
      },
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          await verifyRazorpayPayment(response, userId);
          onSuccess(response);
        } catch (err) {
          onError(err);
        }
      },
      modal: {
        ondismiss: () => {
          onDismiss?.();
        },
      },
    });

    rzp.on('payment.failed', (response: any) => {
      onError(new Error(response.error?.description || 'Payment failed'));
    });

    rzp.open();
  } catch (err) {
    onError(err);
  }
}
