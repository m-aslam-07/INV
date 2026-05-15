# Invoice Generator SaaS - Production Ready

A scalable, enterprise-ready SaaS platform for generating, managing, and sharing professional invoices. Built with Next.js, Supabase, Stripe, and Tailwind CSS.

## 🚀 Features

### 🆓 Free Tier
- **No authentication required** - Works immediately
- **Client-side only** - 100% privacy on local storage
- **5 professional templates** - Ready to use
- **PDF generation** - Download invoices instantly
- **Offline support** - Works without internet

### ⭐ Pro Tier ($9.99/month)
- **User authentication** - Secure Supabase login
- **Cloud storage** - Access invoices from any device
- **Invoice history** - Unlimited invoices stored
- **Custom templates** - Save and reuse your designs
- **Company profile** - Store business details
- **Logo upload** - Brand your invoices
- **Share links** - Send invoices with custom URLs
- **Real-time sync** - Automatic cloud synchronization
- **Priority support** - Email support included

## 🏗️ Architecture

### Two-Tier System

```
┌─────────────────┐
│   User Visit    │
└────────┬────────┘
         │
    ┌────┴────────────────────┐
    │                         │
    ▼                         ▼
┌─────────────┐        ┌────────────────┐
│  Free User  │        │    Pro User    │
│  (No Auth)  │        │  (Authenticated)
└─────────────┘        └────────────────┘
    │                         │
    ▼                         ▼
┌─────────────┐        ┌────────────────┐
│localStorage │        │    Supabase    │
│  (Browser)  │        │  (Cloud DB)    │
└─────────────┘        └────────────────┘
    │                         │
    ▼                         ▼
┌──────────────────────────────────────┐
│       PDF Generation (Client)        │
│    (jsPDF + html2canvas)             │
└──────────────────────────────────────┘
```

### Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Subscriptions
- **Storage**: Supabase Storage (for logos)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **PDF Generation**: jsPDF + html2canvas
- **Hosting**: Vercel
- **Type Safety**: TypeScript

## 📋 Project Structure

```
invoice-saas/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Auth pages
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (app)/                  # Protected app routes
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── invoices/
│   │   │   └── settings/page.tsx
│   │   ├── api/                    # API routes
│   │   │   ├── invoices/route.ts
│   │   │   ├── templates/route.ts
│   │   │   ├── company/route.ts
│   │   │   └── stripe/
│   │   ├── editor/page.tsx         # Main editor
│   │   ├── pricing/page.tsx        # Pricing page
│   │   ├── share/[token]/page.tsx  # Share link
│   │   ├── layout.tsx
│   │   └── page.tsx                # Landing page
│   ├── components/
│   │   ├── invoice/                # Invoice templates
│   │   │   ├── ClassicTemplate.tsx
│   │   │   ├── ModernTemplate.tsx
│   │   │   └── ... other templates
│   │   ├── auth/
│   │   │   ├── ProGated.tsx        # Pro features guard
│   │   │   └── ProtectedRoute.tsx
│   │   └── ui/
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── queries.ts
│   │   ├── stripe.ts               # Stripe config
│   │   ├── storage.ts              # Storage abstraction
│   │   ├── helpers.ts              # Utilities
│   │   ├── types.ts                # TypeScript types
│   │   ├── auth.ts                 # Auth utilities
│   │   └── env.ts                  # Environment config
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth hooks
│   │   ├── useUserPlan.ts          # Plan management
│   │   └── useInvoiceStore.ts      # Invoice state
│   ├── middleware.ts               # Auth middleware
│   └── utils/
│       ├── calculations.ts
│       ├── professions.ts
│       └── ... other utilities
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Database schema
│   └── config.toml
├── public/                         # Static assets
├── .env.example
├── .env.local                      # (local only, not in git)
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── SETUP_GUIDE.md
├── MIGRATION_GUIDE.md
├── REFACTOR_PLAN.md
└── README.md (this file)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation

```bash
# 1. Clone and install
git clone <repo>
cd invoice-saas
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase and Stripe credentials

# 3. Start local Supabase (optional)
npm install -g supabase
supabase start

# 4. Run migrations (if using cloud Supabase)
# Copy SQL from supabase/migrations/001_initial_schema.sql
# and run in Supabase SQL Editor

# 5. Start dev server
npm run dev
```

Visit http://localhost:3000

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Migration Guide](./MIGRATION_GUIDE.md) - Migrate from Vite to Next.js
- [Refactor Plan](./REFACTOR_PLAN.md) - Architecture overview

## 🔧 Key Files

### Configuration
- `next.config.js` - Next.js settings
- `tailwind.config.js` - Tailwind CSS
- `tsconfig.json` - TypeScript
- `.env.example` - Environment template

### Core Library Files
- `src/lib/storage.ts` - Storage abstraction (localStorage/Supabase)
- `src/lib/stripe.ts` - Stripe integration
- `src/lib/types.ts` - Type definitions
- `src/lib/auth.ts` - Auth helpers
- `src/lib/env.ts` - Environment validation

### Authentication
- `src/hooks/useAuth.ts` - Auth hooks
- `src/components/auth/ProGated.tsx` - Pro feature wrapper
- `src/components/auth/ProtectedRoute.tsx` - Route protection

### Database
- `supabase/migrations/001_initial_schema.sql` - Schema with RLS

## 💾 Data Model

### Users Table
```
id              UUID (from auth)
email           TEXT
plan            TEXT ('free' | 'pro')
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Company Profiles Table
```
id              UUID
user_id         UUID (FK → users)
company_name    TEXT
email           TEXT
phone           TEXT
address         TEXT
gstin           TEXT
pan             TEXT
logo_url        TEXT
```

### Invoices Table
```
id              UUID
user_id         UUID (FK → users)
invoice_json    JSONB (full invoice data)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Saved Templates Table
```
id              UUID
user_id         UUID (FK → users)
template_name   TEXT
settings_json   JSONB (partial invoice settings)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Shared Invoices Table
```
id              UUID
user_id         UUID (FK → users)
invoice_id      UUID (FK → invoices)
token           TEXT (unique)
expires_at      TIMESTAMP (nullable)
created_at      TIMESTAMP
```

## 🔐 Security

### Row Level Security (RLS)
All tables have RLS enabled. Users can only access their own data.

```sql
-- Example policy
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);
```

### API Security
- All routes verify user authentication
- Type-safe with TypeScript
- Environment variables validated with Zod
- CORS properly configured

### Stripe Security
- Webhook signature verification
- No sensitive keys exposed to client
- PCI compliance handled by Stripe

## 💰 Pricing & Monetization

### Free Plan
- $0/month
- Unlimited invoices (local)
- localStorage based
- No cloud sync

### Pro Plan
- $9.99/month (recurring)
- Unlimited cloud invoices
- Cloud storage & sync
- All features

### Margins
- Stripe fee: ~2.9% + $0.30
- Supabase: Pay as you grow (~$5-100/month)
- Vercel: Free tier covers most usage
- **Net profit per subscription: ~$7.50/month at scale**

## 📊 Usage

### For Free Users
```typescript
// No login required
const invoices = await getInvoices(); // localStorage
await saveInvoice(data); // localStorage
```

### For Pro Users
```typescript
// Login first
const { user } = useAuth();

// Automatic cloud sync
const invoices = await getInvoices(user.id); // Supabase
await saveInvoice(data, user.id); // Supabase
```

### Plan Gating
```typescript
<ProGated fallback={<UpgradePrompt />}>
  <CloudFeature />
</ProGated>
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Free tier: Create & download invoice
- [ ] Free tier: localStorage persists
- [ ] Pro: Login works
- [ ] Pro: Cloud save works
- [ ] Pro: Invoice history loads
- [ ] Stripe: Checkout works
- [ ] Stripe: Webhook updates plan
- [ ] Share: Link generates and works
- [ ] Mobile: Responsive design

### Stripe Test Mode
```
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Connect GitHub
vercel link

# Set env vars
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all env vars

# Deploy
vercel deploy --prod
```

### Custom Server
```bash
npm run build
npm start
```

## 📈 Scaling Considerations

### Performance
- ✅ Image optimization with Next.js Image
- ✅ Automatic code splitting
- ✅ Database indexes on user_id and created_at
- ✅ API caching with SWR

### Cost Optimization
- ✅ Supabase: Pay as you grow (~$5-100/month)
- ✅ Vercel: Free tier up to 100GB bandwidth
- ✅ Stripe: 2.9% + $0.30 per transaction

### Database
- ✅ RLS ensures data isolation
- ✅ Indexes on common queries
- ✅ Auto-scaling with Supabase

## 🐛 Troubleshooting

### "Subscription not found" error
- Check webhook is configured in Stripe
- Verify webhook secret in `.env`
- Check webhook is reaching your server

### "Can't save invoice" error
- Check user is authenticated
- Verify RLS policies are correct
- Check Supabase connection in `.env`

### localStorage data lost
- Check browser storage isn't cleared
- Verify localStorage access permission
- Try incognito mode to test

## 📝 License

MIT - Feel free to use this for commercial projects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review SETUP_GUIDE.md for common problems

## 🎯 Roadmap

- [ ] Template marketplace
- [ ] Team collaboration
- [ ] Multi-currency support
- [ ] Recurring invoices
- [ ] Invoice reminders
- [ ] Integration with payment processors
- [ ] Mobile app
- [ ] Dark mode
- [ ] Localization (i18n)

## 📄 Legal

- Terms of Service (TODO)
- Privacy Policy (TODO)
- GDPR compliance (TODO)

---

**Built with ❤️ for freelancers, agencies, and businesses**
