const express = require("express");
const Razorpay = require("razorpay");
const path = require("path");
const crypto = require("crypto");
const fetch = require("node-fetch");
require("dotenv").config();

let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch (error) {
  console.warn(
    "Warning: nodemailer is not installed. Invoice email sending is disabled.",
  );
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "";
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || "";

/* ═══ EMAIL CONFIGURATION ═══ */
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "gmail";
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASSWORD =
  process.env.EMAIL_PASSWORD || ""; /* Use App Password for Gmail */
const SEND_INVOICES = process.env.SEND_INVOICES === "true" || false;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn(
    "Warning: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required for payment order creation.",
  );
}

const razorpay =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })
    : null;

/* ═══ EMAIL TRANSPORTER SETUP ═══ */
let emailTransporter = null;

if (SEND_INVOICES && EMAIL_USER && EMAIL_PASSWORD && nodemailer) {
  emailTransporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  /* Test email connection */
  emailTransporter.verify(function (error) {
    if (error) {
      console.warn(
        "⚠️  Email configuration error (invoices won't be sent):",
        error.message,
      );
      emailTransporter = null;
    } else {
      console.log("✓ Email service ready — invoices will be sent");
    }
  });
}

const PLAN_PRICES = {
  full: 12000,
  planner: 499,
  consult: 499,
  webinar: 299,
};

const PLAN_NAMES = {
  full: "8-Week Full Program",
  planner: "LumiNest Planner PDF",
  consult: "Online Consultation (1x)",
  webinar: "Webinar Ticket",
};

app.post("/create-order", async (req, res) => {
  try {
    const { plan, woman, man, email, phone, area } = sanitizeCustomer(req.body);
    const selectedPlan = plan || "full";
    const amount = PLAN_PRICES[selectedPlan] || 0;
    if (!amount) {
      return res.status(400).json({ error: "Invalid plan selected." });
    }
    if (!woman || !man || !email || !phone || !area) {
      return res
        .status(400)
        .json({ error: "Missing required customer details." });
    }
    if (!isValidEmail(email) || !isValidPhone(phone)) {
      return res.status(400).json({
        error: "Please enter a valid email address and WhatsApp number.",
      });
    }
    if (!razorpay) {
      return res.status(503).json({
        error: "Payment gateway is not configured on the server.",
      });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `LUMINEST_${Date.now()}`,
      payment_capture: 1,
      notes: {
        plan: PLAN_NAMES[selectedPlan],
        couple: `${woman} & ${man}`,
        email,
        phone,
        area,
      },
    });

    return res.json({
      key_id: RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      name: "LumiNest",
      description: PLAN_NAMES[selectedPlan],
      prefill: {
        name: `${woman} & ${man}`,
        email,
        contact: phone,
      },
      notes: {
        plan: PLAN_NAMES[selectedPlan],
        couple: `${woman} & ${man}`,
        area,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ error: "Unable to create Razorpay order." });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      woman,
      man,
      email,
      phone,
      area,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Incomplete payment details." });
    }
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        error: "Payment gateway is not configured on the server.",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed." });
    }

    const selectedPlan = plan || "full";
    if (!PLAN_PRICES[selectedPlan]) {
      return res.status(400).json({ error: "Invalid plan selected." });
    }

    await sendWhatsAppNotification({
      woman: cleanText(woman),
      man: cleanText(man),
      email: cleanText(email),
      phone: cleanText(phone),
      area: cleanText(area),
      plan: PLAN_NAMES[selectedPlan] || selectedPlan,
      amount: PLAN_PRICES[selectedPlan] || 0,
      plan: PLAN_NAMES[selectedPlan] || selectedPlan,
      amount: PLAN_PRICES[selectedPlan] || 0,
      razorpay_payment_id,
      razorpay_order_id,
    });

    return res.json({ success: true, message: "Payment verified." });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ error: "Unable to verify payment." });
  }
});

function cleanText(value) {
  return String(value || "").trim();
}

function sanitizeCustomer(body = {}) {
  return {
    plan: cleanText(body.plan),
    woman: cleanText(body.woman),
    man: cleanText(body.man),
    email: cleanText(body.email).toLowerCase(),
    phone: cleanText(body.phone).replace(/[^\d+]/g, ""),
    area: cleanText(body.area),
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+?\d{10,15}$/.test(phone);
}

async function sendWhatsAppNotification(payload) {
  const message = `Hi ${payload.woman} & ${payload.man},\n\nThanks for enrolling in ${payload.plan}.\nYour payment of ₹${payload.amount.toLocaleString("en-IN")} is confirmed.\n\nWe will connect with you on WhatsApp at ${payload.phone} shortly to complete the next onboarding steps.`;

  if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
    console.log(
      "WhatsApp notification skipped — API settings are not configured.",
    );
    console.log("WhatsApp payload:", { to: payload.phone, message });
    return;
  }

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_API_KEY}`,
      },
      body: JSON.stringify({
        to: payload.phone,
        message,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`WhatsApp API failed: ${response.status} ${body}`);
    }

    console.log("WhatsApp notification sent successfully.");
  } catch (error) {
    console.error("WhatsApp notification error:", error);
  }
}

/* ═══ SEND INVOICE EMAIL ═══ */
app.post("/send-invoice", async (req, res) => {
  try {
    const { customer, invoice } = req.body;

    if (!emailTransporter) {
      console.warn("Email service not configured. Invoice email skipped.");
      return res.status(400).json({
        error: "Email service not configured on server.",
        note: "Set SEND_INVOICES=true, EMAIL_USER, and EMAIL_PASSWORD in .env",
      });
    }

    if (!customer || !customer.email || !invoice) {
      return res.status(400).json({ error: "Missing invoice data." });
    }

    const mailOptions = {
      from: EMAIL_USER,
      to: customer.email,
      subject: `Invoice for LumiNest Enrollment - Order ${invoice.orderId}`,
      html: invoice.html,
      text: `LumiNest Invoice - Order: ${invoice.orderId}, Amount: ₹${invoice.amount}`,
    };

    await emailTransporter.sendMail(mailOptions);

    console.log(`✓ Invoice email sent to ${customer.email}`);
    return res.json({ success: true, message: "Invoice email sent." });
  } catch (error) {
    console.error("Send invoice error:", error);
    return res.status(500).json({ error: "Unable to send invoice email." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
