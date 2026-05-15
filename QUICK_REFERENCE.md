# Quick Reference Guide

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start              # Start production server
npm run lint           # Run linter
npm run type-check     # Check TypeScript

# Database
supabase start         # Start local Supabase
supabase stop          # Stop local Supabase
supabase migration new <name>  # Create migration
supabase db push       # Push migrations

# Deployment
vercel deploy          # Deploy to Vercel
vercel deploy --prod   # Deploy to production
```

## Import Paths

```typescript
// Always use @ alias
import { useAuth } from '@/hooks/useAuth';
import { saveInvoice } from '@/lib/storage';
import { InvoiceData } from '@/lib/types';

// Never use relative paths
// ❌ import { useAuth } from '../../../hooks/useAuth';
```

## API Routes

All API routes are in `src/app/api/`:

```typescript
// src/app/api/invoices/route.ts
export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Your logic
  return NextResponse.json({ data });
}
```

## Component Patterns

### Client Component (with hooks)
```typescript
'use client';

import { useState } from 'react';

export function MyComponent() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}
```

### Server Component (fetches data)
```typescript
// No 'use client' needed

import { getData } from '@/lib/data';

export async function MyComponent() {
  const data = await getData();
  return <div>{data}</div>;
}
```

### Protected Component
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <Content />
    </ProtectedRoute>
  );
}
```

### Plan-Gated Feature
```typescript
import { ProGated } from '@/components/auth/ProGated';

export function Feature() {
  return (
    <ProGated fallback={<UpgradePrompt />}>
      <ProFeature />
    </ProGated>
  );
}
```

## Using Storage API

### Free User
```typescript
const invoices = await getInvoices();  // localStorage
await saveInvoice(data);               // localStorage
```

### Pro User
```typescript
const invoices = await getInvoices(userId);  // Supabase
await saveInvoice(data, userId);             // Supabase
```

The same function signature works for both!

## Using Auth

```typescript
import { useAuth, useUserPlan } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const { plan, isPro } = useUserPlan();

  if (isPro) {
    // Show pro features
  }
}
```

## Database Queries

### From Client Component
```typescript
const { data, error } = await supabase
  .from('invoices')
  .select('*')
  .eq('user_id', userId);
```

### From Server (Safer)
```typescript
// Use API route instead
const response = await fetch('/api/invoices');
const { invoices } = await response.json();
```

## Environment Variables

```bash
# .env.local (never commit this)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## File Organization

```
Feature folder structure:

src/components/invoice/
  ├── ClassicTemplate.tsx      # Component
  ├── ModernTemplate.tsx       # Component
  ├── templateRegistry.ts      # Constants/exports
  └── templateUtils.ts         # Helpers

src/lib/
  ├── stripe.ts                # Stripe functions
  ├── storage.ts               # Storage abstraction
  ├── types.ts                 # Type definitions
  └── auth.ts                  # Auth helpers

src/app/
  ├── page.tsx                 # Landing page
  ├── editor/page.tsx          # Invoice editor
  ├── dashboard/page.tsx       # User dashboard
  └── api/invoices/route.ts    # API endpoint
```

## Error Handling

```typescript
// Try-catch for async operations
try {
  const data = await saveInvoice(invoice, userId);
} catch (error) {
  console.error('Failed to save:', error);
  alert('Failed to save invoice');
}

// On API routes
try {
  // logic
  return NextResponse.json({ data });
} catch (error) {
  console.error('API error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Type Safety

```typescript
import { InvoiceData, CompanyProfile, StoredInvoice } from '@/lib/types';

// Always use types from @/lib/types
function handleInvoice(invoice: InvoiceData) {
  // TypeScript will catch errors
}
```

## Debugging

### Enable Query Logging
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .on('*', payload => {
    console.log('Database change:', payload);
  })
```

### Browser DevTools
- Inspector: Check elements and styles
- Console: View errors and logs
- Network: Check API calls
- Storage: View localStorage/sessionStorage
- Application: View cookies and cache

### VS Code Extensions
- Supabase: Official extension for Supabase queries
- Stripe: Stripe API documentation
- Tailwind IntelliSense: Tailwind CSS autocomplete

## Performance Tips

```typescript
// ✅ Good: Memoize expensive operations
import { useMemo } from 'react';

export function MyComponent({ invoices }) {
  const total = useMemo(() => 
    invoices.reduce((sum, inv) => sum + inv.amount, 0),
    [invoices]
  );
}

// ✅ Good: Use useCallback for handlers
import { useCallback } from 'react';

export function MyComponent() {
  const handleSave = useCallback(async (data) => {
    await saveInvoice(data);
  }, []);
}

// ❌ Avoid: Inline object creation in render
<Component key={invoice.id} />  // ✅ Unique key
<Component key={Math.random()} />  // ❌ Bad

// ✅ Good: Image optimization
import Image from 'next/image';
<Image src={logo} alt="Logo" width={100} height={100} />
```

## Common Patterns

### Loading State
```typescript
const [loading, setLoading] = useState(false);

const handleSave = async () => {
  setLoading(true);
  try {
    await saveInvoice(data);
  } finally {
    setLoading(false);
  }
};

<button disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</button>
```

### Conditional Rendering
```typescript
{isPro ? (
  <ProFeature />
) : (
  <UpgradePrompt />
)}

// Or with optional chaining
{user?.email && <p>Welcome {user.email}</p>}
```

### Form Handling
```typescript
const [formData, setFormData] = useState({
  name: '',
  email: '',
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

<input
  name="email"
  value={formData.email}
  onChange={handleChange}
/>
```

## Testing API Endpoints

```bash
# Using curl
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"data": "..."}'

# Using fetch (in browser console)
fetch('/api/invoices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: '...' })
}).then(r => r.json()).then(console.log)
```

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API](https://stripe.com/docs/api)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks](https://react.dev/reference/react)

## Getting Help

1. Check documentation files first
   - SETUP_GUIDE.md
   - MIGRATION_GUIDE.md
   - README_SAAS.md

2. Search GitHub issues

3. Check error logs
   - Browser console
   - Server logs (vercel/local)
   - Supabase logs

4. Test with simpler code first

5. Ask for help with detailed error message
