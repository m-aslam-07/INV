# Deployment Checklist

Complete this checklist before deploying to production.

## 🔐 Security

- [ ] All sensitive keys in `.env.local` (not committed)
- [ ] `NEXT_PUBLIC_*` vars only contain public data
- [ ] Stripe webhook secret is strong (32+ chars)
- [ ] Database RLS policies are enabled on all tables
- [ ] CORS is configured for production domain only
- [ ] JWT secret for auth is strong and random
- [ ] SSL/TLS certificate is valid
- [ ] Security headers are set in next.config.js

## 🗄️ Database

- [ ] Database migrations have been run
- [ ] All RLS policies are in place
- [ ] Database indexes are created
- [ ] Connection string uses strong password
- [ ] Backup strategy is in place
- [ ] Database is not exposed to public internet
- [ ] Row level security is enforced on all tables

## 💳 Stripe

- [ ] Stripe account is in production mode
- [ ] All API keys are production keys (not test)
- [ ] Webhook endpoint is configured
- [ ] Webhook secret is set in `.env`
- [ ] All webhook events are tested
- [ ] Pricing tier is created and published
- [ ] Tax settings are configured (if applicable)
- [ ] Subscription plan is active

## 📧 Supabase

- [ ] Supabase project is not in development mode
- [ ] Auth email templates are customized
- [ ] Auth redirect URLs include production domain
- [ ] Storage bucket permissions are correct
- [ ] Database connection is using service role key (server-side only)
- [ ] Anonymous key is for public access only
- [ ] JWT expiration is set appropriately

## 🌐 Frontend

- [ ] All environment variables are set in production
- [ ] Error boundaries are in place
- [ ] 404 and error pages are customized
- [ ] Analytics/monitoring is configured
- [ ] Sentry or similar error tracking is set up
- [ ] Performance monitoring is in place
- [ ] SEO meta tags are correct
- [ ] Favicon and brand assets are updated

## 🚀 Deployment

- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes all checks
- [ ] No `any` types in TypeScript
- [ ] All unit tests pass (if applicable)
- [ ] Bundle size is acceptable
- [ ] No console errors in production build
- [ ] Vercel environment variables are set
- [ ] Custom domain is pointing to Vercel

## 📋 Verification

### Free User Flow
- [ ] Visit /editor without login
- [ ] Create invoice
- [ ] localStorage contains data
- [ ] Refresh page - data persists
- [ ] Generate PDF works
- [ ] Works offline

### Pro User Flow
- [ ] Sign up with email/password
- [ ] Email verification works
- [ ] Login works
- [ ] Create invoice
- [ ] Save to cloud works
- [ ] Invoice appears in dashboard
- [ ] Can edit and delete
- [ ] Can download PDF

### Stripe Flow
- [ ] Click "Upgrade to Pro" button
- [ ] Stripe checkout opens
- [ ] Checkout accepts test card
- [ ] After payment, user plan updates
- [ ] Can see "Pro" status in settings
- [ ] Can access Pro features
- [ ] Invoice is created in Stripe

### Share Links
- [ ] Generate share link works
- [ ] Copy to clipboard works
- [ ] Share link is unique
- [ ] Access link without login works
- [ ] Expired links don't work
- [ ] Revoke link works

## 📊 Monitoring

- [ ] Application is being monitored for errors
- [ ] Database performance is being tracked
- [ ] API response times are acceptable
- [ ] Uptime monitoring is configured
- [ ] Alerts are set up for critical errors
- [ ] Log aggregation is in place
- [ ] Payment processing is logged

## 📱 Cross-Browser & Device

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Mobile responsive on iOS
- [ ] Mobile responsive on Android
- [ ] Tablet view works

## 📝 Documentation

- [ ] README is updated
- [ ] Setup guide is accurate
- [ ] API documentation is complete
- [ ] Database schema is documented
- [ ] Deployment process is documented
- [ ] Troubleshooting guide is included
- [ ] Support email is listed

## 💰 Billing & Legal

- [ ] Payment processing is PCI compliant
- [ ] Privacy policy is published
- [ ] Terms of service are published
- [ ] Refund policy is defined
- [ ] Tax compliance is addressed
- [ ] Data retention policy is defined
- [ ] GDPR compliance is implemented

## 🎯 Performance

- [ ] Lighthouse score > 80
- [ ] Core Web Vitals are green
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.8s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle size is optimized
- [ ] Images are optimized
- [ ] Database queries are optimized

## 📈 Analytics

- [ ] Google Analytics is configured
- [ ] Conversion tracking is set up
- [ ] User registration tracking works
- [ ] Subscription events are tracked
- [ ] Error tracking is in place
- [ ] Performance metrics are logged

## 🎉 Launch

- [ ] Create launch announcement
- [ ] Notify early users
- [ ] Share on social media
- [ ] Update website/portfolio
- [ ] Set up support email
- [ ] Prepare FAQ/Help center
- [ ] Configure autoresponders

## 🔄 Post-Launch

- [ ] Monitor error logs daily
- [ ] Check user feedback
- [ ] Monitor database performance
- [ ] Review Stripe transactions
- [ ] Check payment success rates
- [ ] Monitor costs vs revenue
- [ ] Plan next features
- [ ] Schedule security audit

---

**Sign off by:**
- [ ] Developer reviewed
- [ ] QA approved
- [ ] Product owner approved
- [ ] Security review passed

**Date deployed:** ___________

**Deployed by:** ___________

**Deployment notes:**

