# RAHIZ Store — Stripe Setup Guide

Step-by-step guide to get payments working on iamrahiz.com.

---

## 1. Create a Stripe account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Enter your email, full name, and a password
3. Verify your email
4. Fill in your business details:
   - **Business type**: Individual / Sole proprietor (or Company if B.O.B is registered)
   - **Country**: Portugal or France (whichever the business is registered in)
   - **Currency**: EUR
5. Add your bank account for payouts (IBAN)

---

## 2. Get your test API keys

1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Make sure the toggle at the top says **"Test mode"** (orange badge)
3. Copy the **Secret key** — it starts with `sk_test_`
4. Keep this key private. Never share it or put it in your code

---

## 3. Deploy to Netlify

### Option A: Connect GitHub (recommended)

1. Go to [https://app.netlify.com/signup](https://app.netlify.com/signup) and sign up with GitHub
2. Click **"Add new site"** > **"Import an existing project"**
3. Select GitHub, then find the **rahiz** repository
4. Settings:
   - **Branch**: `main`
   - **Build command**: leave empty
   - **Publish directory**: `.`
5. Click **"Deploy site"**

### Option B: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init    # select "Link to existing site" or create new
netlify deploy --prod
```

---

## 4. Add environment variables

1. In Netlify, go to **Site settings** > **Environment variables**
   - Direct link: `https://app.netlify.com/sites/YOUR-SITE-NAME/settings/env`
2. Add these two variables:

| Key | Value |
|-----|-------|
| `STRIPE_SECRET_KEY` | `sk_test_XXXX...` (paste your test key from step 2) |
| `SITE_URL` | `https://iamrahiz.com` (your custom domain, no trailing slash) |

3. Click **Save**
4. Go to **Deploys** > **Trigger deploy** > **Deploy site** to rebuild with the new variables

---

## 5. Set up your custom domain on Netlify (optional)

If you want to use Netlify hosting instead of GitHub Pages:
1. Go to **Domain settings** > **Add custom domain**
2. Enter `iamrahiz.com`
3. Update your IONOS DNS to point to Netlify instead of GitHub Pages

**Or** keep GitHub Pages for the main site and only use Netlify for the checkout function. Both work.

---

## 6. Test the full flow

1. Go to your site and add a product to cart
2. Click **"Checkout"**
3. On the Stripe checkout page, use this test card:

| Field | Value |
|-------|-------|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g., `12/30`) |
| CVC | Any 3 digits (e.g., `123`) |
| Name | Any name |
| Address | Any valid address |

4. Click **Pay**
5. You should be redirected to the success page with an order reference

---

## 7. View test orders

Go to [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments) to see all test payments.

---

## 8. Go live (real payments)

When you're ready to accept real money:

1. Go to [https://dashboard.stripe.com/settings/account](https://dashboard.stripe.com/settings/account)
2. Complete your account verification (ID, business details, bank account)
3. Switch the dashboard toggle from **"Test mode"** to **"Live mode"**
4. Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) (no `/test/` in the URL)
5. Copy the **live Secret key** — it starts with `sk_live_`
6. In Netlify, update the `STRIPE_SECRET_KEY` environment variable with the live key
7. Redeploy the site
8. Make one real purchase with your own card to verify everything works
9. Refund yourself from the Stripe dashboard if needed

**Important**: Test keys start with `sk_test_`, live keys start with `sk_live_`. Double-check which one you're using.

---

## 9. How payouts work

- Stripe collects payments and holds them temporarily
- After your first payout (usually 7-14 days), Stripe transfers money to your bank account on a **rolling 2-day schedule** (standard for EU)
- You can see payout schedule at [https://dashboard.stripe.com/settings/payouts](https://dashboard.stripe.com/settings/payouts)
- Stripe takes a fee per transaction: **1.5% + €0.25** for EU cards, **3.25% + €0.25** for non-EU cards

---

## Gotchas

- The checkout function lives at `/.netlify/functions/create-checkout` — this only works when deployed on Netlify
- If you see "Error — try again" when clicking checkout, check that your `STRIPE_SECRET_KEY` is set correctly in Netlify
- VAT is currently a flat 20% added as a line item. When your volume grows, consider enabling [Stripe Tax](https://stripe.com/tax) for automatic tax calculation
- PayPal can be added later by enabling it in your Stripe dashboard under Payment Methods

---

## Need help?

- Stripe docs: [https://stripe.com/docs](https://stripe.com/docs)
- Stripe support: [https://support.stripe.com](https://support.stripe.com)
- Netlify docs: [https://docs.netlify.com](https://docs.netlify.com)
