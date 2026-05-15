# Migration Guide: Vite → Next.js SaaS

This guide helps you migrate your existing invoice generator to the new Next.js SaaS architecture.

## Overview

Your current app uses:
- ✅ Vite + React
- ✅ Zustand for state management
- ✅ localStorage for persistence
- ✅ Tailwind CSS

The new app will:
- ✅ Use Next.js 14+ (App Router)
- ✅ Keep Zustand for client-side state
- ✅ Add Supabase for cloud storage
- ✅ Support both free and pro tiers

## Step-by-Step Migration

### 1. Copy Core Invoice Logic

```bash
# Copy invoice utilities
cp src/utils/amountToWords.ts → new/src/utils/
cp src/utils/calculations.ts → new/src/utils/
cp src/utils/professions.ts → new/src/utils/
cp src/utils/gstinValidator.ts → new/src/utils/
```

### 2. Migrate Store (Zustand)

Keep your existing `useInvoiceStore.ts` but update it:

```typescript
// OLD: Using localStorage directly
localStorage.setItem('invoice', JSON.stringify(state));

// NEW: Using storage abstraction
import { saveInvoice } from '@/lib/storage';

// Storage layer handles both localStorage and Supabase
await saveInvoice(state, user?.id);
```

### 3. Migrate Components

#### Template Components
```bash
# Copy all invoice templates (they render the same way)
cp src/components/invoice/* → new/src/components/invoice/

# Update imports if needed:
# - Change paths to use @ aliases
# - Check that no Vite-specific imports are used
```

#### Key Changes for Components:
```typescript
// OLD (Vite)
import styles from './Template.module.css';
import { useState } from 'react';

// NEW (Next.js - no changes needed!)
import { useState } from 'react';  // Works exactly the same

// Styling: Tailwind classes work identically
// Imports: All dependencies are the same
```

#### Client vs Server Components
```typescript
// Add 'use client' to interactive components
'use client';

import { useState, useEffect } from 'react';

export function MyComponent() {
  // ... client-side logic
}

// Server components (default) are great for:
// - Fetching data from Supabase
// - Database operations
// - API calls with secrets
```

### 4. Update API Calls

#### Migrate from Direct Supabase to API Routes

```typescript
// OLD (Browser)
const { data } = await supabase
  .from('invoices')
  .select('*');

// NEW (Safer - through API)
const response = await fetch('/api/invoices');
const { invoices } = await response.json();
```

### 5. Router Migration

```typescript
// OLD (React Router)
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/editor');

// NEW (Next.js)
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/editor');
```

### 6. Type Definitions

Update all invoice-related types to use the new schema:

```typescript
// src/lib/types.ts already has all types
// Just import and use:

import { InvoiceData, CompanyProfile } from '@/lib/types';

interface MyComponent {
  invoice: InvoiceData;
}
```

## File Mapping

```
OLD Vite Structure          →    NEW Next.js Structure
───────────────────             ──────────────────────

src/components/invoice/     →    src/components/invoice/
src/utils/                  →    src/utils/
src/hooks/useInvoiceStore   →    src/hooks/useInvoiceStore
src/assets/                 →    public/
public/                     →    public/

NEW additions:
                            →    src/app/
                            →    src/lib/supabase/
                            →    src/lib/stripe.ts
                            →    src/lib/storage.ts
                            →    middleware.ts
```

## Authentication Integration

### Old: No Auth Needed
```typescript
// Users didn't need to log in
// Everything was localStorage

export default function App() {
  return <InvoiceEditor />;
}
```

### New: Optional Auth
```typescript
// Free: No auth required
// Pro: Auth required

import { ProGated } from '@/components/auth/ProGated';

export default function App() {
  return (
    <>
      <InvoiceEditor />
      <ProGated>
        <CloudSync />
      </ProGated>
    </>
  );
}
```

## Data Persistence

### Migration Path

```typescript
// 1. Users with localStorage data can continue
//    Free tier uses localStorage indefinitely

// 2. When users sign up for PRO:
//    Their existing invoices stay in localStorage
//    New invoices go to Supabase

// 3. Optional: Add migration UI
//    "Sync your invoices to the cloud"
//    Moves old localStorage invoices to Supabase

const migrateToCloud = async (userId: string) => {
  const localInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
  
  for (const invoice of localInvoices) {
    await saveInvoice(invoice, userId);
  }
  
  localStorage.removeItem('invoices');
};
```

## Testing During Migration

### Test Checklist

```
[] Free tier (no login)
  - Create invoice
  - Edit invoice
  - Generate PDF
  - Refresh page (data persists)
  - localStorage contains data

[] Pro tier (signed in)
  - Create invoice
  - Save to cloud (API called)
  - Refresh page (loads from Supabase)
  - Edit invoice (updates in Supabase)
  - Delete invoice (removed from Supabase)
  - View history

[] Stripe integration
  - Click "Upgrade"
  - Stripe checkout works
  - Webhook updates user plan
  - Settings shows Pro status

[] Sharing
  - Generate share link
  - Visit shared link without auth
  - Can view invoice
  - Link expires correctly
```

## Common Migration Issues

### Issue: "Cannot find module"
```typescript
// Check import paths use @ alias
import { saveInvoice } from '@/lib/storage';  // ✅
import { saveInvoice } from '../../../lib/storage';  // ❌
```

### Issue: Component not rendering
```typescript
// Add 'use client' if using hooks
'use client';  // ← Add this line

import { useState } from 'react';

export function MyComponent() {
  const [state, setState] = useState(0);  // Now works
}
```

### Issue: localStorage undefined
```typescript
// localStorage only works in browser (client component)
'use client';  // ← Required

if (typeof window !== 'undefined') {
  localStorage.getItem('invoices');  // ✅ Safe
}
```

## Performance Considerations

### Next.js Optimizations
- ✅ Automatic code splitting
- ✅ Image optimization (use next/image)
- ✅ Font optimization
- ✅ Built-in compression

### Before Deploying
```bash
npm run build  # Check for warnings/errors
npm run start  # Test production build locally

# Check bundle size
npm install -D @next/bundle-analyzer
# Add to next.config.js
```

## Deployment

### From Vite (Vercel)
```bash
# Current: Vite → Vercel
# New: Next.js → Vercel (native support!)

vercel deploy
# Vercel auto-detects Next.js
```

### Environment Variables
```bash
# Copy from .env.local to Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... all other vars
```

## Rollback Plan

If you need to rollback:

1. The old Vite app still exists on GitHub
2. Keep a stable branch before migration
3. Data in Supabase is independent
4. Users' localStorage is unaffected

```bash
git checkout vite-stable
npm install
npm run dev
```

## Success Criteria

✅ All invoice templates render identically
✅ PDF generation works the same
✅ Free users: No auth required, localStorage persists
✅ Pro users: Auth works, data syncs to Supabase
✅ Stripe: Checkout and webhooks work
✅ Performance: No noticeable slowdown
✅ Mobile: Responsive design maintained

## Next.js Learning Resources

- [App Router Documentation](https://nextjs.org/docs/app)
- [Data Fetching Patterns](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Security Best Practices](https://nextjs.org/docs/architecture/security)
- [Deployment Guide](https://nextjs.org/docs/deployment)
