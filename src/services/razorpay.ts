/**
 * Razorpay payment integration (client-side)
 * 
 * Flow:
 * 1. Client calls /api/payment/razorpay-create-order to get order_id
 * 2. Client opens Razorpay checkout with order_id
 * 3. On success, client calls /api/payment/razorpay-verify with payment details
 * 4. Server verifies signature; entitlement is finalized via webhook
 */

import { env } from '../lib/env';
import { useAuthStore } from '../hooks/useAuthStore';
import { supabase } from '../lib/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  amount: number; // in paise
  currency: string;
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

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error('Session expired. Please sign in again.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Create an order on the backend and get order_id
 */
async function createOrder(planType: string): Promise<{ orderId: string }> {
  const headers = await getAuthHeaders();

  const response = await fetch('/api/payment/razorpay-create-order', {
    method: 'POST',
    headers,
    body: JSON.stringify({ planType }),
  });

  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    let errData: any = {};
    try {
      errData = raw ? JSON.parse(raw) : {};
    } catch {
      errData = { error: raw };
    }

    if (import.meta.env.DEV) {
      console.error('Razorpay create-order failed', {
        status: response.status,
        statusText: response.statusText,
        response: errData,
      });
    }

    if (response.status === 404) {
      throw new Error('Payment API route not found. For localhost, run the backend/serverless runtime that serves /api routes.');
    }

    throw new Error(errData.error || errData.details || 'Failed to create Razorpay order');
  }

  const result = await response.json().catch(() => ({}));
  if (!result?.orderId) {
    throw new Error('Order ID was not returned by payment API');
  }
  return result;
}

/**
 * Verify payment on the backend
 */
export async function verifyRazorpayPayment(
  paymentData: RazorpaySuccessResponse
): Promise<{ success: boolean }> {
  const headers = await getAuthHeaders();

  const response = await fetch('/api/payment/razorpay-verify', {
    method: 'POST',
    headers,
    body: JSON.stringify(paymentData),
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
  const { amount, currency, planType, onSuccess, onError, onDismiss } = options;

  const { data } = await supabase.auth.getSession();
  const userEmail = data.session?.user?.email || '';

  try {
    // Load SDK
    await loadRazorpayScript();
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK did not initialize correctly');
    }

    // Create order
    const { orderId } = await createOrder(planType);

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
          await verifyRazorpayPayment(response);
          await useAuthStore.getState().refreshPlan();
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
    if (import.meta.env.DEV) {
      console.error('openRazorpayCheckout failed', err);
    }
    onError(err);
  }
}
