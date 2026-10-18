# GlassStudio Ecommerce MVP

A starter ecommerce site for GlassStudio with:
- Next.js + TypeScript storefront
- Product catalogue with sample mirror products
- Browser cart
- Checkout form
- Cash on Delivery orders saved to Supabase
- Razorpay order creation and server-side signature verification
- Custom mirror quote form (WhatsApp placeholder must be replaced)
- Supabase SQL schema

## 1. Requirements
- Node.js 20.9+ recommended
- A Supabase project
- Razorpay account/API keys for online payments
- Your existing domain `glassstudio.in`

## 2. Install locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## 3. Configure Supabase
1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy Project URL and anon key from Project Settings -> API.
5. Copy the service-role key to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`.
6. Keep the service-role key server-only. Never prefix it with `NEXT_PUBLIC_`.

## 4. Configure Razorpay
1. Create/activate your Razorpay merchant account and complete required KYC.
2. Start with Test Mode API keys.
3. Put the key ID in `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
4. Put the secret in `RAZORPAY_KEY_SECRET`.
5. Test successful, failed and dismissed payments before using Live Mode.
6. The server verifies the checkout signature. For stronger production reconciliation, configure Razorpay webhooks (payment.captured / payment.failed) and verify webhook signatures with the raw request body before relying on asynchronous events.

## 5. Before launch — REQUIRED
- In `components/CustomQuoteForm.tsx`, replace `91XXXXXXXXXX` with your WhatsApp Business number in international format (digits only).
- Update customer-care phone/email in `components/Footer.tsx`.
- Replace sample products/prices/descriptions in `lib/products.ts` with actual catalogue data.
- Add real product photos and accurate dimensions, glass thickness, LED specs, warranty and installation terms.
- Add shipping charges, fragile-item packaging and return/refund/privacy/terms pages.
- Test mobile checkout and every payment flow.
- Add an authenticated admin dashboard before exposing order management to staff.
- Add Razorpay webhooks for robust asynchronous payment status reconciliation.
- Confirm shipping carrier accepts your mirror's packaged dimensions and glass/fragile goods.
- Review tax, invoicing, consumer-protection and business requirements with a qualified professional.

## 6. Deploy
### Cloudflare
Use a current Cloudflare-supported Next.js deployment workflow (e.g. Cloudflare Workers with the OpenNext adapter). Follow the current official Cloudflare Next.js guide; do not assume every Next.js feature works on static Pages export. Set all environment variables in the hosting dashboard.

### Domain
Connect `glassstudio.in` to your chosen hosting provider using the DNS records it supplies. Do not delete existing DNS records until you understand which ones serve your current website/email.

## Architecture notes
- Product catalogue is currently a static TypeScript array. This makes the MVP easy to run. Move products into a Supabase `products` table when you need admin-managed product editing.
- Cart lives in localStorage; no customer login required.
- Server validates product IDs and quantities and recalculates prices, rather than trusting browser totals.
- COD orders are saved with pending payment status.
- Online orders are saved before Razorpay checkout and only marked paid after signature verification.
- This starter does not include an admin UI, shipping API integration, inventory decrement/reservation, automated emails/SMS, GST invoice generation, or refund workflow.
- Free plans have limits and terms. Payment providers and shipping carriers may charge fees.

## Admin panel
Visit `/admin`. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a random `ADMIN_API_SECRET` (at least 32 characters) on the server. Run the updated `supabase/schema.sql`. Admin features: sign in, dashboard counts, view orders/customer delivery details, update order status, and create/edit/delete product records.

Important current MVP limitations: storefront catalogue still reads `lib/products.ts` sample products; admin catalogue records are stored in Supabase but storefront sync/migration must be implemented before treating admin product edits as customer-visible. This package does not yet include shipping carrier APIs, inventory reservation, refunds, emails/SMS, GST invoices, or webhook-based asynchronous payment reconciliation. Test thoroughly and complete a security review before live sales.
# Led_mirror_website
