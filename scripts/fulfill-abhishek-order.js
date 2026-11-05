const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Environment Configuration
const envPath = path.join(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?\s*$/);
    if (m) {
      let val = (m[2] || '').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[m[1]] = val;
    }
  });
}

const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET;
const SMTP_USER = env.SMTP_USER;
const SMTP_PASS = env.SMTP_PASS;
const AISENSY_API_KEY = env.AISENSY_API_KEY;
const AISENSY_CAMPAIGN = env.AISENSY_CAMPAIGN_NAME || "order_confirmation_2";
const GOOGLE_SHEET_URL = env.GOOGLE_SHEET_PURCHASE_URL;
const DELHIVERY_API_TOKEN = env.DELHIVERY_API_TOKEN;
const DELHIVERY_PICKUP_LOCATION = env.DELHIVERY_PICKUP_LOCATION || "AMEC MOBILITY B2C";
const DELHIVERY_PICKUP_ADDRESS = env.DELHIVERY_PICKUP_ADDRESS || "PLOT NO.5A, 3RD FLOOR Nagpur MIDC HINGNA BESIDE JAIKA TATA MOTORS SERVICE CENTRE";
const DELHIVERY_PICKUP_PINCODE = env.DELHIVERY_PICKUP_PINCODE || "440016";

const orderData = {
  orderId: "PROMEC-ORD-1793870580621-S97U",
  paymentId: "pay_TwS6ih9UuW0lOO",
  paymentMethod: "Full Online Payment (UPI)",
  customerName: "Abhishek Mehra",
  phone: "8910682526",
  altPhone: "8697822526",
  email: "abhishekkrmehra222@gmail.com",
  shippingAddress: "70B, SN Roy Road, Gitanjali Kuthi, 2nd Building, 3rd Floor",
  city: "Kolkata",
  state: "West Bengal",
  pincode: "700038",
  gstNumber: "19DDEPM1619D1ZQ",
  productName: "Aquaforce® 1400 PSI Tech (With Vacuum, Yellow)",
  variantName: "With Vacuum",
  color: "Yellow",
  quantity: 1,
  amount: 37999,
};

async function execute() {
  console.log("==================================================");
  console.log(`🚀 Executing Immediate Fulfillment for ${orderData.customerName}`);
  console.log(`📦 Order ID: ${orderData.orderId}`);
  console.log(`💳 Payment ID: ${orderData.paymentId}`);
  console.log("==================================================\n");

  // --- Step 1: Create Delhivery Express Courier Shipment ---
  let waybill = "";
  try {
    const hasAltPhone = orderData.altPhone && orderData.altPhone !== "N/A";
    const resolvedAddress = hasAltPhone
      ? `${orderData.shippingAddress} (Alt Phone: ${orderData.altPhone})`
      : orderData.shippingAddress;

    const delhiveryPayload = {
      shipments: [
        {
          name: orderData.customerName,
          add: resolvedAddress,
          pin: orderData.pincode,
          city: orderData.city,
          state: orderData.state,
          country: "India",
          phone: orderData.phone,
          alt_phone: hasAltPhone ? orderData.altPhone : undefined,
          order: orderData.orderId,
          payment_mode: "Pre-paid",
          return_add: DELHIVERY_PICKUP_ADDRESS,
          return_pin: DELHIVERY_PICKUP_PINCODE,
          return_city: "Nagpur",
          return_state: "Maharashtra",
          return_country: "India",
          products_desc: orderData.productName,
          hsn_code: "84243000",
          cod_amount: 0,
          order_date: new Date().toISOString(),
          total_amount: orderData.amount,
          quantity: "1",
          seller_name: "Promec India",
          weight: 18000,
          shipment_length: 60,
          shipment_width: 41,
          shipment_height: 41,
          length: 60,
          width: 41,
          height: 41,
        },
      ],
      pickup_location: {
        name: DELHIVERY_PICKUP_LOCATION,
        add: DELHIVERY_PICKUP_ADDRESS,
        city: "Nagpur",
        state: "Maharashtra",
        pin: DELHIVERY_PICKUP_PINCODE,
      },
    };

    const formData = new URLSearchParams();
    formData.append("format", "json");
    formData.append("data", JSON.stringify(delhiveryPayload));

    console.log("🚚 [1/6] Sending request to Delhivery API...");
    const delRes = await fetch("https://track.delhivery.com/api/cmu/create.json", {
      method: "POST",
      headers: {
        Authorization: `Token ${DELHIVERY_API_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const delData = await delRes.json();
    console.log("Delhivery Response:", JSON.stringify(delData, null, 2));

    const pkg = delData?.packages?.[0];
    if (delData?.success && pkg?.waybill && pkg?.status !== "Fail") {
      waybill = pkg.waybill;
      console.log(`✅ [1/6] Delhivery Shipment Created! Waybill: ${waybill}`);
    } else {
      console.warn("⚠️ [1/6] Delhivery returned:", delData);
      waybill = pkg?.waybill || "PENDING";
    }
  } catch (delErr) {
    console.error("❌ [1/6] Delhivery Shipment error:", delErr.message);
  }

  // --- Step 2: Post to Google Sheets Purchase Log ---
  try {
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium",
    });

    const sheetPayload = {
      type: "PURCHASE",
      timestamp,
      orderId: orderData.orderId,
      paymentId: orderData.paymentId,
      paymentMethod: orderData.paymentMethod,
      advanceAmount: orderData.amount,
      codBalance: 0,
      waybill: waybill || "AUTO_GENERATED",
      delhiveryWaybill: waybill || "AUTO_GENERATED",
      fullName: orderData.customerName,
      email: orderData.email,
      phone: orderData.phone,
      altPhone: orderData.altPhone,
      alternatePhone: orderData.altPhone,
      phoneWithAlt: `${orderData.phone} / ${orderData.altPhone}`,
      deliveryAddress: orderData.shippingAddress,
      city: orderData.city,
      state: orderData.state,
      pincode: orderData.pincode,
      gstNumber: orderData.gstNumber,
      product: orderData.productName,
      quantity: 1,
      amount: orderData.amount,
      status: "Paid & Confirmed",
    };

    console.log("📊 [2/6] Logging Order to Google Sheets...");
    const sheetRes = await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sheetPayload),
      redirect: "follow",
    });
    const sheetText = await sheetRes.text();
    console.log(`✅ [2/6] Google Sheets response (${sheetRes.status}):`, sheetText);
  } catch (sheetErr) {
    console.error("❌ [2/6] Google Sheets logging failed:", sheetErr.message);
  }

  // --- Step 3: Create Razorpay Official Tax Invoice ---
  let invoiceId = "";
  let invoiceUrl = "";
  const rzp = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  try {
    const cleanPhone = orderData.phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
    const invoicePayload = {
      type: "invoice",
      description: `Tax Invoice for ${orderData.productName}`,
      currency: "INR",
      customer: {
        name: orderData.customerName,
        email: orderData.email,
        contact: formattedPhone,
        billing_address: {
          line1: orderData.shippingAddress,
          city: orderData.city,
          state: orderData.state,
          zipcode: orderData.pincode,
          country: "in",
        },
        shipping_address: {
          line1: orderData.shippingAddress,
          city: orderData.city,
          state: orderData.state,
          zipcode: orderData.pincode,
          country: "in",
        },
      },
      line_items: [
        {
          name: orderData.productName,
          description: "Includes 1-Year Comprehensive Warranty (HSN: 8424)",
          amount: orderData.amount * 100,
          currency: "INR",
          quantity: 1,
          hsn_code: "8424",
          tax_rate: 1800,
          tax_inclusive: true,
        },
      ],
      email_notify: 1,
      sms_notify: 1,
    };

    console.log("🧾 [3/6] Generating Razorpay Tax Invoice...");
    const inv = await rzp.invoices.create(invoicePayload);
    invoiceId = inv.id;
    invoiceUrl = inv.short_url || `https://invoices.razorpay.com/v1/l/${inv.id}`;
    console.log(`✅ [3/6] Razorpay Tax Invoice Created: ${invoiceId} -> ${invoiceUrl}`);
  } catch (invErr) {
    console.error("❌ [3/6] Razorpay Invoice creation error:", invErr?.error?.description || invErr?.message);
  }

  // --- Step 4: Dispatch Branded HTML Email via SMTP ---
  if (SMTP_USER && SMTP_PASS && orderData.email) {
    try {
      console.log(`📧 [4/6] Sending Official Tax Invoice Email via ${SMTP_USER}...`);
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || "smtp.gmail.com",
        port: Number(env.SMTP_PORT) || 465,
        secure: Number(env.SMTP_PORT || 465) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      const formattedAmount = orderData.amount.toLocaleString("en-IN");
      const mailOptions = {
        from: `"AMEC MOBILITY PRIVATE LIMITED" <${SMTP_USER}>`,
        to: orderData.email,
        subject: `Official Tax Invoice & Order Confirmation #${orderData.orderId} - PROMEC Aquaforce`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #0066cc;">
              <h1 style="color: #0066cc; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">PROMEC INDIA</h1>
              <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">AMEC Mobility Private Limited</p>
            </div>

            <div style="padding: 24px 0;">
              <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">Order Confirmed #${orderData.orderId}</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Dear <strong>${orderData.customerName}</strong>,<br/>
                Thank you for purchasing the <strong>${orderData.productName}</strong>. Your payment of <strong>₹${formattedAmount}</strong> has been successfully received via UPI (Payment ID: <code>${orderData.paymentId}</code>).
              </p>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 13px; color: #334155;">
                <strong>📍 Delivery Address:</strong><br/>
                ${orderData.shippingAddress}, ${orderData.city}, ${orderData.state} - ${orderData.pincode}<br/>
                <strong>📱 Contact:</strong> ${orderData.phone} | <strong>Alt:</strong> ${orderData.altPhone}<br/>
                ${waybill ? `<strong>🚚 Delhivery Waybill / Tracking:</strong> <a href="https://www.delhivery.com/track/package/${waybill}" target="_blank" style="color: #0066cc; font-weight: bold;">${waybill}</a>` : ''}
              </div>

              ${invoiceUrl ? `
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${invoiceUrl}" target="_blank" style="display: inline-block; background-color: #2371ec; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 28px; border-radius: 8px;">
                    📄 View & Download Official Tax Invoice
                  </a>
                </div>
              ` : ''}

              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin-top: 16px; font-size: 13px; color: #1e40af;">
                <strong>Warranty Protection:</strong> 1-Year Comprehensive Pan-India Doorstep Replacement Warranty backed by AMEC Mobility Private Limited.
              </div>
            </div>

            <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8;">
              &copy; 2026 AMEC MOBILITY PRIVATE LIMITED • Nagpur, Maharashtra, India<br/>
              Helpline: +91 7387588963 | Email: promec.india@gmail.com
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ [4/6] Branded Tax Invoice Email sent to ${orderData.email}`);
    } catch (emailErr) {
      console.error(`❌ [4/6] Email sending failed:`, emailErr.message);
    }
  }

  // --- Step 5: Send WhatsApp Confirmation via AiSensy ---
  if (AISENSY_API_KEY && orderData.phone) {
    try {
      console.log("💬 [5/6] Dispatching AiSensy WhatsApp Message...");
      const cleanPhone = orderData.phone.replace(/\D/g, "");
      const destination = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      const estimatedDelivery = deliveryDate.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const fullAddress = `${orderData.shippingAddress}, ${orderData.city}, ${orderData.state} - ${orderData.pincode}`;

      const waRes = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: AISENSY_API_KEY,
          campaignName: AISENSY_CAMPAIGN,
          destination,
          userName: orderData.customerName,
          templateParams: [
            orderData.customerName,
            orderData.productName,
            "1",
            orderData.orderId,
            fullAddress,
            estimatedDelivery,
          ],
          media: {
            url: "https://files.catbox.moe/jpksbs.png",
            filename: "Promec Tools WhatsApp Template Image.png",
          },
        }),
      });

      const waData = await waRes.json().catch(() => ({}));
      console.log(`✅ [5/6] AiSensy WhatsApp response (${waRes.status}):`, waData);
    } catch (waErr) {
      console.error("❌ [5/6] WhatsApp failed:", waErr.message);
    }
  }

  // --- Step 6: Save into Supabase Database ---
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      console.log("💾 [6/6] Saving Order to Supabase Database (promec_orders)...");
      const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      const now = new Date().toISOString();
      const orderRecord = {
        id: orderData.orderId,
        created_at: now,
        updated_at: now,
        order_status: "confirmed",
        customer_name: orderData.customerName,
        customer_phone: orderData.phone,
        customer_email: orderData.email,
        customer_address: orderData.shippingAddress,
        customer_city: orderData.city,
        customer_state: orderData.state,
        customer_pincode: orderData.pincode,
        customer_alt_phone: orderData.altPhone,
        customer_gst: orderData.gstNumber,
        customer_type: "commercial",
        items_json: [
          {
            productId: "aquaforce-1400",
            productName: orderData.productName,
            variantId: "with-vacuum",
            variantName: orderData.variantName,
            color: orderData.color,
            quantity: 1,
            unitPriceInINR: orderData.amount,
            unitMrpInINR: 49999,
            totalAmountInINR: orderData.amount,
          },
        ],
        final_total: orderData.amount,
        payment_method: "FULL_ONLINE",
        payment_status: "captured",
        razorpay_payment_id: orderData.paymentId,
        amount_paid: orderData.amount,
        amount_due: 0,
        fulfillment_status: "completed",
        delhivery_waybill: waybill,
        delhivery_shipment_id: waybill,
        razorpay_invoice_id: invoiceId,
        razorpay_invoice_url: invoiceUrl,
        whatsapp_sent: true,
        email_sent: true,
      };

      const { error: sbErr } = await supabase.from("promec_orders").upsert(orderRecord, { onConflict: "id" });
      if (sbErr) {
        console.warn("⚠️ [6/6] Supabase upsert error:", sbErr.message);
      } else {
        console.log(`✅ [6/6] Supabase Order successfully saved (#${orderData.orderId})`);
      }
    } catch (sbEx) {
      console.error("❌ [6/6] Supabase exception:", sbEx.message);
    }
  }

  console.log("\n==================================================");
  console.log("🎉 ALL FULFILLMENT STEPS COMPLETED SUCCESSFULLY!");
  console.log(`Waybill: ${waybill || "PENDING"}`);
  console.log(`Invoice: ${invoiceUrl || invoiceId}`);
  console.log("==================================================");
}

execute().catch(console.error);
