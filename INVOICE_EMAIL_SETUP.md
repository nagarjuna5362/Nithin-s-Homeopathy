# LumiNest Invoice Email System Setup

## Overview

This system automatically generates and sends professional HTML invoices to customers' email addresses immediately after successful payment. The invoice includes payment details, customer information, and next steps.

## Quick Start

### 1. Install Dependencies

```bash
npm install
npm install nodemailer
```

### 2. Enable Email Service in `.env`

Copy from `.env.example` and update with your email credentials:

```env
SEND_INVOICES=true
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

### 3. Start the Server

```bash
npm start
```

When the server starts, you'll see:

- ✅ "✓ Email service ready — invoices will be sent" (if configured correctly)
- ⚠️ "Email configuration error" (if there's an issue)

---

## Email Setup by Provider

### Gmail (Recommended)

**Why Gmail?** Free, reliable, easy to set up with App Passwords.

#### Steps:

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password to `EMAIL_PASSWORD` in `.env`

3. **Update `.env`**

   ```env
   SEND_INVOICES=true
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```

4. **Test**
   ```bash
   npm start
   # Should log: "✓ Email service ready — invoices will be sent"
   ```

---

### Outlook / Microsoft 365

```env
SEND_INVOICES=true
EMAIL_SERVICE=outlook
EMAIL_USER=your_email@outlook.com
EMAIL_PASSWORD=your_password
```

---

### Custom SMTP Server

```env
SEND_INVOICES=true
EMAIL_SERVICE=custom
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=your_email@yourdomain.com
EMAIL_PASSWORD=your_password
```

Then update `server.js` transporter config:

```javascript
emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});
```

---

## How It Works

### Payment Flow

1. Customer fills form and clicks "Pay Securely"
2. Razorpay payment gateway opens
3. Customer completes payment
4. Server verifies payment signature
5. **Invoice HTML is generated** (frontend-side)
6. **Invoice is sent via email** (backend)
7. Success message shown to customer

### Invoice Generation

The invoice includes:

- **Header** with LumiNest branding
- **Invoice Details** (Invoice #, Order ID, Date)
- **Customer Information** (Names, Location)
- **Service Details** (Product, Quantity, Amount)
- **Next Steps** (WhatsApp contact, what to expect)

All formatted as professional HTML email.

### Email Sending

When payment is verified, the frontend calls:

```javascript
fetch("/send-invoice", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    customer: { email, name, phone },
    invoice: { orderId, paymentId, plan, amount, html },
  }),
});
```

The backend receives the HTML and sends via email.

---

## Updated Pricing (2024)

Invoices will show the new pricing:

| Product              | Price   | Used For     |
| -------------------- | ------- | ------------ |
| LumiNest Planner PDF | ₹499    | Lead magnet  |
| Webinar Ticket       | ₹299    | Warm funnel  |
| 8-Week Full Program  | ₹12,000 | Core product |
| Online Consultation  | ₹499    | Standalone   |

---

## Testing

### Test Email Sending Without Payment

Create a test script (`test-invoice.js`):

```javascript
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const testHTML = `
  <h1>Test Invoice</h1>
  <p>If you received this, email is working!</p>
  <p>Amount: ₹12,000</p>
`;

transporter.sendMail(
  {
    from: process.env.EMAIL_USER,
    to: "test@example.com",
    subject: "LumiNest Test Invoice",
    html: testHTML,
  },
  (err, info) => {
    if (err) {
      console.error("❌ Email failed:", err);
    } else {
      console.log("✅ Test email sent:", info.response);
    }
  },
);
```

Run:

```bash
node test-invoice.js
```

---

## Troubleshooting

### "Email service not configured"

**Problem:** Server logs say email isn't ready

**Solutions:**

1. Check `.env` has `SEND_INVOICES=true`
2. Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set
3. For Gmail: Make sure you used **App Password**, not regular password
4. For Gmail: Check 2-Factor Authentication is enabled

### "Unable to send invoice email"

**Problem:** Invoice endpoint returns error

**Solutions:**

1. Check email credentials are correct
2. For Gmail: Verify App Password (not your account password)
3. Check SMTP port is accessible (usually 587 or 465)
4. Look for error message in server logs

### Email not received

**Problem:** Email sent but not in inbox

**Solutions:**

1. Check spam/junk folder
2. Verify recipient email is correct
3. Check email logs in Gmail/Outlook settings
4. Try sending to a different email address

### "nodemailer is not defined"

**Problem:** Module not installed

**Solution:**

```bash
npm install nodemailer
```

---

## Invoice Customization

To change invoice HTML, edit the `generateInvoiceHTML()` function in [luminest (1).html](<luminest%20(1).html#L4050>):

```javascript
function generateInvoiceHTML(data) {
  // ... customize the HTML here
  var html = `
    <div class="container">
      <!-- Your custom invoice HTML -->
    </div>
  `;
  return html;
}
```

Common customizations:

- Add company logo
- Change colors to match brand
- Add custom terms & conditions
- Include refund policy
- Add payment method details

---

## Security Notes

- **Never** commit `.env` with real credentials to version control
- Use `.gitignore` to exclude `.env`
- For production, use environment variables in hosting platform (AWS, Heroku, etc.)
- Keep `RAZORPAY_KEY_SECRET` and email password secure
- Don't log sensitive information

---

## Monitoring

Check server logs for invoice status:

```
✓ Invoice email sent to customer@example.com
✓ Email service ready — invoices will be sent
⚠️  Email configuration error: Invalid credentials
```

---

## Support

If invoices aren't sending:

1. Check server console for error messages
2. Verify email credentials in `.env`
3. Test with `test-invoice.js` script above
4. Check email provider's security settings
5. Review `.env` file doesn't have extra spaces/quotes

---

## Next Steps

- [ ] Set up email credentials in `.env`
- [ ] Start server and verify "Email service ready" message
- [ ] Make a test payment to verify invoice sending
- [ ] Customize invoice HTML with your branding
- [ ] Update email in footer with support contact

---

**Version:** 2024 | **Provider:** Nodemailer with Razorpay
