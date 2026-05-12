# LumiNest 2024 Pricing Reference

## Standard Prices (Used for Payment)

These are the **actual amounts charged** when customers purchase:

```javascript
// From server.js and HTML JavaScript
const PRICES = {
  full: 12000, // 8-Week Full Program
  planner: 499, // Fertility Planner PDF
  consult: 499, // Online Consultation (1x)
  webinar: 299, // Webinar Ticket
};
```

---

## Display Prices (Shown to Customers)

These are **ranges shown** on the pricing cards (allows for discounts/variations):

| Plan Key  | Display Price   | Payment Amount |
| --------- | --------------- | -------------- |
| `full`    | ₹8,000 – 12,000 | **₹12,000**    |
| `planner` | ₹299 – 499      | **₹499**       |
| `webinar` | ₹99 – 299       | **₹299**       |
| `consult` | ₹499            | **₹499**       |

---

## Plan Names

```javascript
const PLAN_NAMES = {
  full: "8-Week Full Program",
  planner: "LumiNest Planner PDF",
  consult: "Online Consultation (1x)",
  webinar: "Webinar Ticket",
};
```

---

## Where Prices Are Used

| Location                 | Price Used    | Format            |
| ------------------------ | ------------- | ----------------- |
| Pricing cards (frontend) | Display range | "₹8,000 – 12,000" |
| Payment form             | PRICES amount | "₹12,000"         |
| Invoice                  | PRICES amount | "₹12,000"         |
| Receipts                 | PRICES amount | "₹12,000"         |
| Analytics                | PRICES amount | 12000 (numeric)   |
| WhatsApp messages        | PRICES amount | "₹12,000"         |

---

## Razorpay Integration

**Important:** Razorpay amounts are in **paise** (not rupees):

```javascript
// In server.js
const order = await razorpay.orders.create({
  amount: amount * 100, // Convert to paise
  currency: "INR",
  // ...
});

// Example:
// ₹12,000 = 1200000 paise
```

---

## Revenue Calculations

### Individual Product Revenue

- **Planner Sales:** ₹499 per sale
- **Webinar Sales:** ₹299 per sale
- **Consultation Sales:** ₹499 per sale
- **Full Program Sales:** ₹12,000 per sale

### Example Funnel

```
100 website visitors
↓
10 planner downloads (₹499 × 10 = ₹4,990)
↓
5 webinar attendees (₹299 × 5 = ₹1,495)
↓
2 full programs enrolled (₹12,000 × 2 = ₹24,000)
↓
Total Revenue = ₹30,485
```

---

## Monthly Projections (Example)

Assuming these conversion rates:

| Month | Visitors | Planners | Webinars | Programs | Revenue  |
| ----- | -------- | -------- | -------- | -------- | -------- |
| Apr   | 1,000    | 100      | 50       | 5        | ₹65,485  |
| May   | 1,500    | 150      | 75       | 8        | ₹101,625 |
| Jun   | 2,000    | 200      | 100      | 12       | ₹149,770 |

---

## Price Change History

### April 2024 (Previous)

- Full Program: ₹12,999
- Planner: ₹499
- Consultation: ₹799
- Webinar: Free

### May 2024 (Current) ✅

- Full Program: ₹12,000 (↓ ₹999)
- Planner: ₹499 (→ same)
- Consultation: ₹499 (↓ ₹300)
- Webinar: ₹299 (↑ new paid)

**Net Effect:**

- Lower barrier to entry (more conversions)
- Webinar as paid tier (revenue from awareness)
- Simplified consultation pricing

---

## How to Update Prices

### If you need to change prices:

**1. Update backend prices** (`server.js`):

```javascript
const PLAN_PRICES = {
  full: 10000, // Changed from 12000
  // ... rest
};
```

**2. Update frontend display** (`luminest (1).html`):

```html
<span class="p-fig">₹8,000 – 10,000</span>
```

**3. Update JavaScript PRICES** (in HTML):

```javascript
var PRICES = { full: 10000, ... };
```

**4. Rebuild and test:**

```bash
npm install
npm start
# Test payment at http://localhost:3000
```

---

## Important Notes

⚠️ **Keep display prices >= payment prices**

Good: Display "₹8,000 – 12,000", charge ₹12,000 ✅
Bad: Display "₹10,000 – 12,000", charge ₹12,000 ❌

---

## Support

Need to change prices? Follow the steps above or contact the development team.

**Current Pricing is:** Effective May 2024 ✓
