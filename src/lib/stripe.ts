// Payment plan configuration (client-side)
// Replaces the old Stripe server-side module

export const PLANS = {
  free: {
    name: 'Free',
    priceINR: 0,
    priceUSD: 0,
    features: [
      'Generate PDF invoices',
      'All templates',
      'Full GST calculation',
      'No watermark',
      'PDF download',
    ],
  },
  pro: {
    name: 'Pro',
    priceINR: 199, // ₹199/month
    priceUSD: 5, // $5/month
    annualPriceINR: 1499, // ₹1,499/year
    annualPriceUSD: 49, // $49/year
    features: [
      'Everything in Free',
      'Invoice history',
      'Save templates',
      'Save company profile',
      'Logo upload',
      'Cloud sync',
      'Shareable invoice links',
      'UPI QR code on invoice',
      'Priority support',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
