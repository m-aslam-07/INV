import { createSupabaseServiceClient, getAuthenticatedUser, setCorsHeaders } from './_auth.js';

export default async function handler(req, res) {
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

    const supabase = createSupabaseServiceClient();

    // 1. Fetch current subscription details using admin client
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('plan, subscription_status, subscription_start, subscription_end')
      .eq('id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('[subscription] Failed to fetch user subscription details:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch subscription details' });
    }

    let plan = userData?.plan || 'free';
    let subscription_status = userData?.subscription_status || null;
    let subscription_start = userData?.subscription_start || null;
    let subscription_end = userData?.subscription_end || null;

    console.log('[subscription] Server-side check for user:', user.id);
    console.log('[subscription] Current plan:', plan);
    console.log('[subscription] Current subscription_status:', subscription_status);
    console.log('[subscription] subscription_start:', subscription_start);
    console.log('[subscription] subscription_end:', subscription_end);

    // 2. Expiration check
    if (subscription_end && plan === 'pro') {
      const endTime = new Date(subscription_end).getTime();
      const nowTime = Date.now();
      const isExpired = nowTime > endTime;

      console.log('[subscription] Expiration check result: isExpired =', isExpired);

      if (isExpired) {
        console.log('[subscription] Subscription expired! Downgrading user on server...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            plan: 'free',
            subscription_status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('[subscription] Failed to update user to expired plan:', updateError);
        } else {
          console.log('[subscription] User downgraded successfully to free.');
          plan = 'free';
          subscription_status = 'expired';
        }
      }
    }

    return res.status(200).json({
      plan,
      subscription_status,
      subscription_start,
      subscription_end,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
