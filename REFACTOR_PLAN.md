# Invoice Generator SaaS - Refactor Plan

## Architecture Overview

### Two-Tier System
- **FREE**: No auth, client-side only, localStorage persistence
- **PRO**: Supabase auth, cloud sync, company profile, templates, sharing

### Tech Stack
- Next.js 14+ (App Router)
- Tailwind CSS
- Supabase (Auth + PostgreSQL + Storage)
- Stripe (Subscriptions)
- TypeScript
- Vercel deployment

## Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── dashboard/page.tsx
│   │   ├── invoices/page.tsx
│   │   ├── invoices/[id]/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── invoices/route.ts
│   │   ├── invoices/[id]/route.ts
│   │   ├── templates/route.ts
│   │   ├── company/route.ts
│   │   ├── stripe/webhook/route.ts
│   │   └── logo/upload/route.ts
│   ├── editor/page.tsx
│   ├── share/[token]/page.tsx
│   ├── layout.tsx
│   ├── page.tsx (landing)
│   └── pricing/page.tsx
├── components/
│   ├── invoice/ (rendering templates)
│   ├── ui/ (reusable components)
│   ├── auth/ (auth flows)
│   └── app/ (app-specific)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── queries.ts
│   ├── stripe.ts
│   ├── storage.ts (abstraction layer)
│   └── types.ts
├── middleware.ts (auth middleware)
├── hooks/ (client hooks)
├── utils/ (helpers)
└── env.ts (environment validation)
```

## Implementation Steps

1. ✅ Set up Next.js project with TypeScript
2. ✅ Create type definitions and database schema
3. ✅ Set up Supabase client (client & server)
4. ✅ Implement storage abstraction layer
5. ✅ Create authentication middleware
6. ✅ Build protected routes
7. ✅ Migrate invoice components
8. ✅ Set up Stripe integration
9. ✅ Create API routes
10. ✅ Deploy and test

## Key Features

### Free Tier
- Client-side PDF generation
- localStorage for persistence
- No login required
- Template selection

### Pro Tier
- User authentication (Supabase)
- Cloud invoice storage
- Saved templates
- Company profile management
- Logo upload to Supabase Storage
- Share links with tokens
- Invoice history
- Cloud sync across devices
- Stripe subscription

## Database Schema

### Tables with RLS
1. `users` - Authenticated users
2. `company_profiles` - Business details per user
3. `invoices` - Stored invoice data
4. `saved_templates` - User-created templates
5. `shared_invoices` - Public share links

### Storage
- `company-logos/{user_id}/` - Logo files
