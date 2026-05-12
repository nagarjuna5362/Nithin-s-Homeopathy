# LumiNest Razorpay Integration

## Setup

1. Install dependencies:

```bash
npm install
npm install nodemailer
```

2. Create a `.env` file in the project root with:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
WHATSAPP_API_URL=https://example.com/whatsapp/send
WHATSAPP_API_KEY=your_whatsapp_api_token

# Email Invoice System (Optional but recommended)
SEND_INVOICES=true
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

3. Start the server:

```bash
npm start
```

4. Open the page in your browser:

```text
http://localhost:3000
```

## Updated Pricing (2024)

| Product                  | Price Range     | Purpose                    |
| ------------------------ | --------------- | -------------------------- |
| LumiNest Planner PDF     | ₹299 – 499      | Entry-level lead magnet    |
| Webinar Ticket           | ₹99 – 299       | Warm audience funnel entry |
| 8-Week Full Program      | ₹8,000 – 12,000 | Core revenue product       |
| Online Consultation (1x) | ₹499            | Standalone consult         |

## Features

- **Payment Processing**: Razorpay integration for secure payments
- **Payment Verification**: Server-side signature verification
- **Invoice Email System**: Automatic invoice generation and email delivery to customers
- **WhatsApp Notification**: Instant notification after successful payment (if configured)
- **Multiple Payment Plans**: Support for different pricing tiers

## Email Invoice Setup (Gmail)

To enable automatic invoice email sending:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Generate an [App Password](https://myaccount.google.com/apppasswords)
4. Use the App Password in your `.env` file as `EMAIL_PASSWORD`
5. Set `SEND_INVOICES=true`

The system will now automatically send HTML-formatted invoices to customer email addresses after successful payment.

## What changed

- `server.js` creates Razorpay orders using `/create-order`
- Payment is verified via `/verify-payment`
- New `/send-invoice` endpoint sends HTML invoices via email
- WhatsApp notification is sent after successful verification if `WHATSAPP_API_URL` and `WHATSAPP_API_KEY` are configured
- Frontend generates beautiful invoice HTML and sends to backend
- The frontend now uses server-side order creation and signature verification

## Notes

- Keep Razorpay secret keys on the server only
- Email service is optional but recommended for customer experience
- The current WhatsApp integration is generic; update `sendWhatsAppNotification` with your provider's payload shape if needed
- Invoice emails include payment details, customer info, and next steps
