# Vercel Deployment Guide

Deploy the NextJS AI Starter Kit to production on Vercel.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
- [GitHub](https://github.com) account (for OAuth)
- [Stripe](https://stripe.com) account
- [OpenAI](https://platform.openai.com) API key
- PostgreSQL database (use [Neon](https://neon.tech), [Railway](https://railway.app), or [Supabase](https://supabase.com))
- Redis instance (use [Upstash](https://upstash.com) for serverless Redis)

## Step 1: Database Setup

### Option A: Neon (Recommended - Free)
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)
4. It will be your `DATABASE_URL` and `DIRECT_URL`

### Option B: Railway
1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project → Provision PostgreSQL
3. Copy the connection string from the dashboard

### Option C: Supabase
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Project Settings → Database → Connection string
4. Use the URI format with `?pgbouncer=true` for `DATABASE_URL` and without for `DIRECT_URL`

## Step 2: Redis Setup (Upstash)

1. Go to [upstash.com](https://upstash.com) and sign up
2. Create a new Redis database
3. Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. Construct your `REDIS_URL` as `redis://:<token>@<endpoint>:6379`

## Step 3: OAuth Providers

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set:
   - **Application name**: `AI Starter Kit`
   - **Homepage URL**: `https://your-app.vercel.app`
   - **Authorization callback URL**: `https://your-app.vercel.app/api/auth/callback/github`
4. Copy `Client ID` and generate a `Client Secret`

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to APIs & Services → Credentials
4. Click "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set:
   - **Application type**: Web application
   - **Authorized redirect URIs**: `https://your-app.vercel.app/api/auth/callback/google`
6. Copy `Client ID` and `Client Secret`

## Step 4: Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create products and prices:
   - Monthly Pro: $29/month → `price_monthly`
   - Yearly Pro: $249/year → `price_yearly`
3. Get your keys:
   - Publishable key: `pk_test_...` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key: `sk_test_...` → `STRIPE_SECRET_KEY`
4. Set up webhook:
   - Endpoint: `https://your-app.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the signing secret (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

## Step 5: Vercel Deployment

### Using Vercel Dashboard
1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add environment variables (see table below)
6. Click "Deploy"

### Using Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g., `https://your-app.vercel.app`) | Yes |
| `AUTH_SECRET` | Random 32+ char string for session encryption | Yes |
| `AUTH_GITHUB_ID` | GitHub OAuth Client ID | Yes |
| `AUTH_GITHUB_SECRET` | GitHub OAuth Client Secret | Yes |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | No |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | No |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `OPENAI_ORG_ID` | OpenAI Organization ID (optional) | No |
| `OPENAI_ENABLED_MODELS` | Comma-separated models to enable | No |
| `DATABASE_URL` | PostgreSQL connection string (with PgBouncer) | Yes |
| `DIRECT_URL` | PostgreSQL direct connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `STRIPE_PRICE_MONTHLY` | Stripe price ID for monthly plan | Yes |
| `STRIPE_PRICE_YEARLY` | Stripe price ID for yearly plan | Yes |

## Step 6: Post-Deployment

### Run Database Migrations
After deploying, run migrations via the Vercel dashboard or CLI:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

Or add a `postinstall` script in package.json:
```json
"postinstall": "prisma generate && prisma db push"
```

### Set Up Custom Domain (Optional)
1. Go to your project on Vercel
2. Navigate to Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

### Configure Stripe Webhook
1. Update the webhook endpoint URL in Stripe Dashboard
2. Test the webhook with Stripe's test events

## Production Checklist

- [ ] Environment variables configured correctly
- [ ] PostgreSQL connection working (test with Prisma)
- [ ] OAuth providers returning valid tokens
- [ ] Stripe checkout flow working end-to-end
- [ ] Stripe webhook receiving events
- [ ] Rate limiting enabled
- [ ] Security headers configured (done in `next.config.ts`)
- [ ] SSL/HTTPS enforced (automatic on Vercel)
- [ ] Error monitoring set up (Sentry recommended)
- [ ] Analytics configured (optional)

## Monitoring Recommendations

- **Error Tracking**: [Sentry](https://sentry.io) — free tier available
- **Uptime Monitoring**: [Better Uptime](https://betteruptime.com) or [Pingdom](https://pingdom.com)
- **Performance**: Vercel Analytics (built-in)
- **Logs**: [Logtail](https://logtail.com) or [Axiom](https://axiom.co)

## Common Issues

### "PrismaClientInitializationError: Can't reach database server"
- Ensure `DATABASE_URL` uses connection pooling (with `?pgbouncer=true`)
- Ensure `DIRECT_URL` is the direct connection (no pooler)
- Check Vercel IP is allowed in your database provider's firewall

### "OAuthCallbackError"
- Verify callback URLs in GitHub/Google OAuth app settings
- Ensure `AUTH_URL` is set to your production URL
- Check `AUTH_SECRET` is consistent across deployments

### "Stripe Signature Verification Failed"
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Verify the webhook endpoint URL matches exactly

## Scaling

For high-traffic production deployments:

1. **Database**: Upgrade to a dedicated PostgreSQL instance
2. **Redis**: Use Upstash serverless Redis (auto-scaling)
3. **Rate Limiting**: Move from in-memory to Redis-based rate limiting
4. **Caching**: Add response caching for common queries
5. **Background Jobs**: Use Vercel Cron Jobs or Inngest for async tasks
6. **Edge Functions**: Move non-LLM API routes to Edge Runtime

## Support

For issues and feature requests:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: Refer to the project README
