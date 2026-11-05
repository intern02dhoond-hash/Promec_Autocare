const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?\s*$/);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const order = {
  id: "PROMEC-ORD-1793870580621-S97U",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  orderStatus: "confirmed",
  customer: {
    fullName: "Abhishek Mehra",
    phone: "8910682526",
    altPhone: "8697822526",
    email: "abhishekkrmehra222@gmail.com",
    shippingAddress: "70B, SN Roy Road, Gitanjali Kuthi, 2nd Building, 3rd Floor",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700038",
    gstNumber: "19DDEPM1619D1ZQ",
    customerType: "commercial"
  },
  items: [
    {
      productId: "aquaforce-1400",
      productName: "Aquaforce® 1400 PSI Tech (With Vacuum, Yellow)",
      variantId: "with-vacuum",
      variantName: "With Vacuum",
      color: "Yellow",
      quantity: 1,
      unitPriceInINR: 37999,
      unitMrpInINR: 49999,
      totalAmountInINR: 37999
    }
  ],
  pricing: {
    subtotalInINR: 37999,
    discountInINR: 0,
    shippingFeeInINR: 0,
    handlingFeeInINR: 0,
    codFeeInINR: 0,
    finalTotalInINR: 37999,
    currency: "INR"
  },
  payment: {
    method: "FULL_ONLINE",
    provider: "RAZORPAY",
    mode: "UPI",
    status: "captured",
    razorpayOrderId: "order_TwRrLY5kuZkgWr",
    razorpayPaymentId: "pay_TwS6ih9UuW0lOO",
    amountRequiredInPaise: 3799900,
    amountPaidInPaise: 3799900,
    amountDueInPaise: 0,
    razorpayInvoiceId: "inv_TwSTFMk8aCR0kM",
    razorpayInvoiceUrl: "https://rzp.io/rzp/p6Y6B0Q"
  },
  fulfillment: {
    status: "completed",
    waybill: "64729710000523",
    shipmentId: "64729710000523",
    whatsappSent: true,
    emailSent: true
  }
};

const row = {
  id: order.id,
  created_at: order.createdAt,
  updated_at: order.updatedAt,
  order_status: order.orderStatus,
  customer_phone: "8910682526",
  customer_name: order.customer.fullName,
  customer_email: order.customer.email,
  customer_city: order.customer.city,
  customer_state: order.customer.state,
  customer_pincode: order.customer.pincode,
  customer: order.customer,
  items: order.items,
  pricing: order.pricing,
  payment: order.payment,
  fulfillment: order.fulfillment,
  cancellation: null,
  refund: null,
  raw_order: order
};

supabase.from("promec_orders").upsert(row, { onConflict: "id" })
  .then(({ error }) => {
    if (error) console.error("Supabase error:", error);
    else console.log("✅ Order saved to Supabase promec_orders successfully!");
  });
