import { getAuthenticatedUser, setCorsHeaders } from './_auth.js';

// Vercel serverless function to create LemonSqueezy checkout
export default async function handler(req, res) {
  // CORS headers
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planType } = req.body;

    if (!planType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    if (!apiKey || !storeId) {
      return res.status(500).json({ error: 'LemonSqueezy is not configured' });
    }

    // You need to set these variant IDs in your environment
    // They come from your LemonSqueezy product setup
    const variantId = planType === 'annual'
      ? process.env.LEMONSQUEEZY_ANNUAL_VARIANT_ID
      : process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID;

    if (!variantId) {
      return res.status(500).json({ error: 'LemonSqueezy variant not configured' });
    }

    const appUrl = process.env.APP_URL || 'http://localhost:5173';

    // Create checkout via LemonSqueezy API
    const checkoutRes = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: user.email,
              custom: {
                user_id: user.id,
              },
            },
            checkout_options: {
              dark: false,
              success_url: `${appUrl}/payment-success?provider=lemonsqueezy`,
              cancel_url: `${appUrl}/payment-cancel`,
            },
            product_options: {
              redirect_url: `${appUrl}/payment-success?provider=lemonsqueezy`,
            },
          },
          relationships: {
            store: {
              data: { type: 'stores', id: storeId },
            },
            variant: {
              data: { type: 'variants', id: variantId },
            },
          },
        },
      }),
    });

    if (!checkoutRes.ok) {
      const errBody = await checkoutRes.text();
      console.error('LemonSqueezy checkout creation failed:', errBody);
      return res.status(500).json({ error: 'Failed to create checkout' });
    }

    const checkoutData = await checkoutRes.json();
    const checkoutUrl = checkoutData.data.attributes.url;

    return res.status(200).json({ checkoutUrl });
  } catch (error) {
    console.error('LemonSqueezy checkout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
