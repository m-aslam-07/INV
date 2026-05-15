# SaaS Architecture Setup Guide

## Quick Start

### 1. Project Setup

```bash
# Create Next.js project
npx create-next-app@latest invoice-saas --typescript --tailwind

cd invoice-saas

# Install dependencies
npm install @supabase/supabase-js stripe zustand lucide-react
npm install -D @types/stripe
```

### 2. Environment Variables

Create `.env.local`:

```bash
# Copy from .env.example and fill in your credentials
cp .env.example .env.local
```

Get credentials:
- **Supabase**: https://supabase.com → Create project → Copy API URL and keys
- **Stripe**: https://stripe.com → Dashboard → API keys (publishable + secret)

### 3. Supabase Setup

#### Option A: Local Development

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run migrations
supabase db pull  # Fetch existing schema
supabase migration new initial_schema
# (Paste content from supabase/migrations/001_initial_schema.sql)
supabase db push
```

#### Option B: Cloud Supabase

1. Create project at https://app.supabase.com
2. Go to SQL Editor
3. Run the SQL from `supabase/migrations/001_initial_schema.sql`
4. Enable Storage bucket:
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('invoices', 'invoices', true);
   ```

### 4. Stripe Setup

1. Create webhook endpoint:
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

2. Create product & price:
   - Create product "Pro Plan"
   - Create monthly price (e.g., $9.99)
   - Copy price ID to `STRIPE_PRO_PRICE_ID`

### 5. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000

## Architecture Overview

### File Structure

```
src/
├── app/
│   ├── api/               # API routes (server-side)
│   ├── (auth)/            # Auth pages
│   ├── (app)/             # Protected app routes
│   └── page.tsx           # Landing page
├── components/
│   ├── invoice/           # Invoice templates
│   ├── auth/              # Auth components
│   └── ui/                # Reusable UI
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── stripe.ts          # Stripe integration
│   ├── storage.ts         # Storage abstraction
│   └── types.ts           # TypeScript types
└── hooks/
    ├── useAuth.ts         # Auth hooks
    └── useInvoiceStore.ts # Invoice state
```

### Data Flow

#### FREE TIER (No Auth)
```
User → Client-side state → localStorage → PDF export
```

#### PRO TIER (Authenticated)
```
User → Client-side state → Supabase (via API routes) → PDF export
                        → Cloud storage
                        → Company profile
                        → Templates
                        → Share links
```

## Key Features Implementation

### 1. Invoice Storage

Both free and pro tiers use the same `InvoiceData` type, but storage differs:

```typescript
// Free: Stored in browser localStorage
const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');

// Pro: Stored in Supabase
const { data } = await supabase
  .from('invoices')
  .select('*')
  .eq('user_id', userId);
```

### 2. Authentication

```typescript
// Login/signup
import { useAuth } from '@/hooks/useAuth';

const { user, signIn, signUp } = useAuth();

// Protected routes
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

// Plan-gated features
import { ProGated } from '@/components/auth/ProGated';

export default function AdvancedFeature() {
  return (
    <ProGated fallback={<UpgradePrompt />}>
      <AdvancedFeature />
    </ProGated>
  );
}
```

### 3. Stripe Integration

```typescript
// Checkout
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  body: JSON.stringify({ plan: 'pro' })
});
const { url } = await response.json();
window.location.href = url;

// Billing portal
const response = await fetch('/api/stripe/billing-portal', {
  method: 'POST'
});
const { url } = await response.json();
window.location.href = url;
```

### 4. RLS (Row Level Security)

All tables have RLS enabled. Users can only access their own data:

```sql
-- Example policy
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);
```

## Deployment

### Vercel

```bash
# Connect GitHub repo
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all other env vars

# Deploy
vercel deploy --prod
```

### Custom Server

```bash
# Build
npm run build

# Start
npm start
```

## Scaling Considerations

### Performance
- **Image optimization**: Use Next.js Image component
- **API caching**: Use SWR or TanStack Query
- **Database indexes**: Already added on user_id and created_at

### Cost Optimization
- **Supabase**: Pay as you grow model
- **Stripe**: ~2.9% + $0.30 per transaction
- **Vercel**: Free tier up to 100GB bandwidth/month

### Security
- All API routes check user auth via JWT
- RLS policies enforce data isolation
- Webhook signature verification
- CORS configured for production domain

## Testing

### Free Tier
- No login required
- Test localStorage persistence
- Verify PDF export works

### Pro Tier
```bash
# Use Stripe test cards
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123

# Webhook testing
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger customer.subscription.created
```

## Common Issues

### "No subscription found" error
- Ensure webhook endpoint is configured
- Check STRIPE_WEBHOOK_SECRET is correct
- Verify webhook is reaching your server

### RLS policy errors
- Ensure user is authenticated
- Check auth.uid() matches user_id
- Verify policy is enabled on table

### Supabase connection issues
- Check NEXT_PUBLIC_SUPABASE_URL and key
- Verify network isn't blocked
- Try with local Supabase first

## Next Steps

1. ✅ Copy/create invoice components from old Vite project
2. ✅ Set up authentication UI (login, signup, password reset)
3. ✅ Create dashboard and history pages
4. ✅ Build pricing page with Stripe integration
5. ✅ Implement share invoice functionality
6. ✅ Add company profile management
7. ✅ Test thoroughly before launching
8. ✅ Set up monitoring and error tracking

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
