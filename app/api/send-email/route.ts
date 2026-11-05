import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName, orderId, paymentId, product, amount, deliveryAddress, city, state, pincode, altPhone, paymentMethod, advanceAmount, codBalance, waybill } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER || "promec.india@gmail.com";
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          success: false,
          message: "SMTP_USER or SMTP_PASS not set in .env.local",
        },
        { status: 200 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const imagePath = path.join(process.cwd(), "public", "images", "email sticker.png");
    const hasSticker = fs.existsSync(imagePath);

    const fbIconPath = path.join(process.cwd(), "public", "images", "Email icons", "FB.png");
    const instaIconPath = path.join(process.cwd(), "public", "images", "Email icons", "insta.png");
    const youtubeIconPath = path.join(process.cwd(), "public", "images", "Email icons", "Youtube.png");

    const logoPath = path.join(process.cwd(), "public", "images", "promec-badge-logo.png");
    const hasLogo = fs.existsSync(logoPath);

    const attachments: any[] = [];
    if (hasLogo) {
      attachments.push({
        filename: "promec-logo.png",
        path: logoPath,
        cid: "promecLogo",
        contentType: "image/png",
        contentDisposition: "inline",
      });
    }
    if (hasSticker) {
      attachments.push({
        filename: "email-sticker.png",
        path: imagePath,
        cid: "emailSticker",
        contentType: "image/png",
        contentDisposition: "inline",
      });
    }

    const hasFb = fs.existsSync(fbIconPath);
    const hasInsta = fs.existsSync(instaIconPath);
    const hasYoutube = fs.existsSync(youtubeIconPath);

    if (hasFb) {
      attachments.push({
        filename: "fb.png",
        path: fbIconPath,
        cid: "fbIcon",
        contentType: "image/png",
        contentDisposition: "inline",
      });
    }
    if (hasInsta) {
      attachments.push({
        filename: "insta.png",
        path: instaIconPath,
        cid: "instaIcon",
        contentType: "image/png",
        contentDisposition: "inline",
      });
    }
    if (hasYoutube) {
      attachments.push({
        filename: "youtube.png",
        path: youtubeIconPath,
        cid: "youtubeIcon",
        contentType: "image/png",
        contentDisposition: "inline",
      });
    }

    const now = new Date();
    const formattedAmount = Number(amount || 37999).toLocaleString("en-IN");
    const formattedOrderId = orderId || `ORD_TEST_${Date.now().toString().slice(-5)}`;

    const dateOnlyStr = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });

    const timeOnlyStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });

    const orderDateShort = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      timeZone: "Asia/Kolkata",
    });

    const isCod = paymentMethod === "10_PERCENT_COD" || Number(codBalance) > 0;
    const resolvedAdvance = isCod ? Number(advanceAmount || Math.round(Number(amount || 37999) * 0.1)).toLocaleString("en-IN") : formattedAmount;
    const resolvedBalance = isCod ? Number(codBalance || Math.round(Number(amount || 37999) * 0.9)).toLocaleString("en-IN") : "0";
    const paymentStatusBadge = isCod ? "10% Advance Paid ✓" : paymentMethod === "SNAPMINT_EMI" ? "Snapmint EMI ✓" : "Paid ✓";

    const mapsQuery = encodeURIComponent(
      `${deliveryAddress || ""}, ${city || ""}, ${state || ""} - ${pincode || ""}`.trim()
    );
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
    const invoiceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://promectools.in/aquaforceforautocare"}/invoices/${encodeURIComponent(formattedOrderId)}`;

    const mailOptions = {
      from: `"Promec India" <${smtpUser}>`,
      to: email,
      subject: `Order Confirmed: ${product || "Aquaforce 1400 PSI Tech"} [#${formattedOrderId}]`,
      attachments,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmed</title>
          <style>
            @media only screen and (max-width: 630px) {
              body, .email-wrapper, .email-container {
                background-color: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .email-container {
                max-width: 100% !important;
                width: 100% !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                padding: 16px 12px !important;
              }
              
              /* Mobile Header */
              .header-table { display: block !important; width: 100% !important; text-align: center !important; }
              .header-table tr { display: block !important; width: 100% !important; text-align: center !important; }
              .header-icon-td { display: block !important; width: 100% !important; text-align: center !important; margin: 0 auto 12px auto !important; }
              .header-icon-circle { margin: 0 auto !important; }
              .header-text-td { display: block !important; width: 100% !important; text-align: center !important; padding-left: 0 !important; }
              .header-sticker-td { display: none !important; }
              .header-title { font-size: 22px !important; text-align: center !important; }
              .header-subtitle { text-align: center !important; font-size: 13px !important; }

              /* Stat KPI Cards: 2x2 Grid on Mobile */
              .stat-col {
                display: inline-block !important;
                width: 47% !important;
                margin: 1.5% 1.5% !important;
                padding: 0 !important;
                border-right: none !important;
                border-bottom: none !important;
                box-sizing: border-box !important;
                vertical-align: top !important;
              }
              .stat-box {
                background-color: #f8fafc !important;
                border: 1px solid #e2e8f0 !important;
                border-radius: 12px !important;
                padding: 10px !important;
                height: 76px !important;
                box-sizing: border-box !important;
              }

              /* Details Cards: Stacked Vertically on Mobile */
              .card-col {
                display: block !important;
                width: 100% !important;
                padding: 0 !important;
                margin-bottom: 14px !important;
                box-sizing: border-box !important;
              }
              .card-box { height: auto !important; min-height: auto !important; }

              /* Stepper Mobile Styling */
              .stepper-header-left { display: block !important; width: 100% !important; text-align: left !important; margin-bottom: 4px !important; }
              .stepper-header-right { display: block !important; width: 100% !important; text-align: left !important; }
              .stepper-step-text {
                font-size: 9.5px !important;
                line-height: 1.2 !important;
                white-space: nowrap !important;
              }
              .stepper-sub-text {
                font-size: 8.5px !important;
                white-space: nowrap !important;
              }

              /* Trust Banner Mobile */
              .trust-table td { display: block !important; width: 100% !important; text-align: center !important; }
              .trust-left-td { text-align: center !important; margin-bottom: 10px !important; }
              .trust-right-td { text-align: center !important; margin-top: 10px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

          <!-- Main Container (Pure White Background) -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" class="email-wrapper" style="background-color: #ffffff;">
            <tr>
              <td align="center" style="padding: 16px 0; background-color: #ffffff;">
                
                <div class="email-container" style="max-width: 680px; width: 100%; background-color: #ffffff; border-radius: 0px; padding: 24px 20px; text-align: left; box-sizing: border-box;">

                  <!-- Brand Logo Row -->
                  ${hasLogo ? `
                  <div style="text-align: left; padding-bottom: 20px; margin-bottom: 24px; border-bottom: 2px solid #0066cc;">
                    <img src="cid:promecLogo" alt="PROMEC" style="height: 38px; width: auto; max-width: 220px; display: inline-block; border: 0;" />
                  </div>
                  ` : ""}

                  <!-- Top Header Row -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="header-table" style="margin-bottom: 28px;">
                    <tr>
                      <td width="72" valign="top" class="header-icon-td">
                        <div class="header-icon-circle" style="width: 60px; height: 60px; border-radius: 50%; background-color: #10b981; text-align: center; line-height: 60px; color: #ffffff; font-size: 28px; font-weight: bold; box-shadow: 0 4px 14px rgba(16,185,129,0.3);">
                          ✓
                        </div>
                      </td>
                      <td valign="top" class="header-text-td" style="padding-left: 8px;">
                        <h1 class="header-title" style="margin: 0 0 6px 0; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                          Order Confirmed! 🎉
                        </h1>
                        <p class="header-subtitle" style="margin: 0 0 4px 0; font-size: 14px; color: #475569; font-weight: 500;">
                          Hi <strong>${fullName}</strong>, your payment is verified and your order is confirmed.
                        </p>
                        <p class="header-subtitle" style="margin: 0; font-size: 13px; color: #64748b;">
                          We'll notify you once your order is shipped.
                        </p>
                      </td>
                      <td width="130" align="right" valign="top" class="header-sticker-td">
                        ${hasSticker ? `<img src="cid:emailSticker" class="hero-sticker" alt="Aquaforce 1400" style="width: 120px; max-width: 120px; height: auto; display: block;" />` : ""}
                      </td>
                    </tr>
                  </table>

                  <!-- 4 Stat KPI Cards (Desktop 4-col row, Mobile 2x2 grid) -->
                  <div style="margin-bottom: 24px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
                      <tr>
                        <!-- Stat 1: Order ID -->
                        <td class="stat-col" width="25%" valign="top" style="padding-right: 4px;">
                          <div class="stat-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; height: 76px; box-sizing: border-box;">
                            <table border="0" cellspacing="0" cellpadding="0" width="100%">
                              <tr>
                                <td style="padding-right: 6px;" valign="top" width="28">
                                  <div style="width: 28px; height: 28px; border-radius: 6px; background-color: #eff6ff; text-align: center; line-height: 28px; font-size: 13px;">📄</div>
                                </td>
                                <td valign="top">
                                  <div style="font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2px;">Order ID</div>
                                  <div style="font-size: 9.5px; color: #0f172a; font-weight: 700; white-space: nowrap; margin-top: 2px; line-height: 1.2;">${formattedOrderId}</div>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>

                        <!-- Stat 2: Order Date -->
                        <td class="stat-col" width="25%" valign="top" style="padding: 0 2px;">
                          <div class="stat-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; height: 76px; box-sizing: border-box;">
                            <table border="0" cellspacing="0" cellpadding="0" width="100%">
                              <tr>
                                <td style="padding-right: 6px;" valign="top" width="28">
                                  <div style="width: 28px; height: 28px; border-radius: 6px; background-color: #faf5ff; text-align: center; line-height: 28px; font-size: 13px;">📅</div>
                                </td>
                                <td valign="top">
                                  <div style="font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2px;">Order Date</div>
                                  <div style="font-size: 10.5px; color: #0f172a; font-weight: 700; margin-top: 2px; line-height: 1.2;">${dateOnlyStr}</div>
                                  <div style="font-size: 9.5px; color: #64748b; font-weight: 500; margin-top: 2px;">${timeOnlyStr}</div>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>

                        <!-- Stat 3: Payment Status -->
                        <td class="stat-col" width="25%" valign="top" style="padding: 0 2px;">
                          <div class="stat-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; height: 76px; box-sizing: border-box;">
                            <table border="0" cellspacing="0" cellpadding="0" width="100%">
                              <tr>
                                <td style="padding-right: 6px;" valign="top" width="28">
                                  <div style="width: 28px; height: 28px; border-radius: 6px; background-color: #ecfdf5; text-align: center; line-height: 28px; font-size: 13px;">💳</div>
                                </td>
                                <td valign="top">
                                  <div style="font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2px;">${isCod ? "Advance Paid" : "Payment Status"}</div>
                                  <div style="font-size: 10.5px; color: #0f172a; font-weight: 700; margin-top: 2px; line-height: 1.2;">₹${resolvedAdvance}</div>
                                  <div style="margin-top: 2px;">
                                    <span style="background-color: #d1fae5; color: #065f46; font-size: 8px; font-weight: 800; padding: 1px 5px; border-radius: 99px; display: inline-block;">${paymentStatusBadge}</span>
                                  </div>
                                  ${isCod ? `<div style="font-size: 8px; color: #b45309; font-weight: 700; margin-top: 2px;">COD Due: ₹${resolvedBalance}</div>` : ""}
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>

                        <!-- Stat 4: Delivery -->
                        <td class="stat-col" width="25%" valign="top" style="padding-left: 4px;">
                          <div class="stat-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; height: 76px; box-sizing: border-box;">
                            <table border="0" cellspacing="0" cellpadding="0" width="100%">
                              <tr>
                                <td style="padding-right: 6px;" valign="top" width="28">
                                  <div style="width: 28px; height: 28px; border-radius: 6px; background-color: #fff7ed; text-align: center; line-height: 28px; font-size: 13px;">🚚</div>
                                </td>
                                <td valign="top">
                                  <div style="font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2px;">Delivery</div>
                                  <div style="font-size: 10.5px; color: #0f172a; font-weight: 700; margin-top: 2px; line-height: 1.2;">Expected</div>
                                  <div style="font-size: 9.5px; color: #16a34a; font-weight: 700; margin-top: 2px;">4-6 Days</div>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Order Tracking Stepper Card -->
                  <div style="background-color: #f8fafc; border: 1px solid #e0f2fe; border-radius: 18px; padding: 20px 10px; margin-bottom: 24px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                      <tr>
                        <td align="left" class="stepper-header-left">
                          <strong style="font-size: 15px; color: #0284c7; font-weight: 700;">Order Tracking</strong>
                        </td>
                        <td align="right" class="stepper-header-right">
                          <span style="font-size: 12px; color: #16a34a; font-weight: 700;">Expected Delivery: 4-6 Days 📅</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Stepper Dots & Connecting Lines Table -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
                      <!-- Row 1: Circles and Connecting Lines -->
                      <tr>
                        <!-- Step 1 Dot -->
                        <td width="12%" align="center" valign="middle">
                          <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #10b981; color: #ffffff; text-align: center; line-height: 26px; font-size: 13px; font-weight: bold; margin: 0 auto;">✓</div>
                        </td>
                        <!-- Line 1-2 (Active Green Line) -->
                        <td width="10%" valign="middle" style="padding: 0;">
                          <div style="height: 3px; background-color: #10b981; border-radius: 2px; width: 100%;"></div>
                        </td>
                        <!-- Step 2 Dot -->
                        <td width="12%" align="center" valign="middle">
                          <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #10b981; color: #ffffff; text-align: center; line-height: 26px; font-size: 13px; font-weight: bold; margin: 0 auto;">✓</div>
                        </td>
                        <!-- Line 2-3 (Active Green Line) -->
                        <td width="10%" valign="middle" style="padding: 0;">
                          <div style="height: 3px; background-color: #10b981; border-radius: 2px; width: 100%;"></div>
                        </td>
                        <!-- Step 3 Dot -->
                        <td width="12%" align="center" valign="middle">
                          <div style="width: 26px; height: 26px; border-radius: 50%; border: 2px solid #0284c7; background-color: #ffffff; color: #0284c7; text-align: center; line-height: 22px; font-size: 12px; font-weight: bold; margin: 0 auto;">📦</div>
                        </td>
                        <!-- Line 3-4 (Dashed Grey Line) -->
                        <td width="10%" valign="middle" style="padding: 0;">
                          <div style="height: 0px; border-top: 2px dashed #cbd5e1; width: 100%;"></div>
                        </td>
                        <!-- Step 4 Dot -->
                        <td width="12%" align="center" valign="middle">
                          <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid #cbd5e1; background-color: #ffffff; margin: 0 auto;"></div>
                        </td>
                        <!-- Line 4-5 (Dashed Grey Line) -->
                        <td width="10%" valign="middle" style="padding: 0;">
                          <div style="height: 0px; border-top: 2px dashed #cbd5e1; width: 100%;"></div>
                        </td>
                        <!-- Step 5 Dot -->
                        <td width="12%" align="center" valign="middle">
                          <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid #cbd5e1; background-color: #ffffff; margin: 0 auto;"></div>
                        </td>
                      </tr>

                      <!-- Row 2: Step Labels and Dates -->
                      <tr>
                        <!-- Step 1 Text -->
                        <td width="12%" align="center" valign="top" style="padding-top: 8px;">
                          <div class="stepper-step-text" style="font-size: 10px; font-weight: 700; color: #0f172a; text-align: center; line-height: 1.2;">Confirmed</div>
                          <div class="stepper-sub-text" style="font-size: 9px; color: #64748b; text-align: center; margin-top: 3px;">${orderDateShort}</div>
                        </td>
                        <td width="10%"></td>
                        <!-- Step 2 Text -->
                        <td width="12%" align="center" valign="top" style="padding-top: 8px;">
                          <div class="stepper-step-text" style="font-size: 10px; font-weight: 700; color: #0f172a; text-align: center; line-height: 1.2;">Verified</div>
                          <div class="stepper-sub-text" style="font-size: 9px; color: #64748b; text-align: center; margin-top: 3px;">${orderDateShort}</div>
                        </td>
                        <td width="10%"></td>
                        <!-- Step 3 Text -->
                        <td width="12%" align="center" valign="top" style="padding-top: 8px;">
                          <div class="stepper-step-text" style="font-size: 10px; font-weight: 700; color: #0284c7; text-align: center; line-height: 1.2;">Processing</div>
                          <div class="stepper-sub-text" style="font-size: 9px; color: #0284c7; font-weight: 700; text-align: center; margin-top: 3px;">Active</div>
                        </td>
                        <td width="10%"></td>
                        <!-- Step 4 Text -->
                        <td width="12%" align="center" valign="top" style="padding-top: 8px;">
                          <div class="stepper-step-text" style="font-size: 10px; font-weight: 600; color: #64748b; text-align: center; line-height: 1.2;">Shipped</div>
                          <div class="stepper-sub-text" style="font-size: 9px; color: #94a3b8; text-align: center; margin-top: 3px;">Pending</div>
                        </td>
                        <td width="10%"></td>
                        <!-- Step 5 Text -->
                        <td width="12%" align="center" valign="top" style="padding-top: 8px;">
                          <div class="stepper-step-text" style="font-size: 10px; font-weight: 600; color: #64748b; text-align: center; line-height: 1.2;">Delivered</div>
                          <div class="stepper-sub-text" style="font-size: 9px; color: #94a3b8; text-align: center; margin-top: 3px;">Pending</div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- 3 Details Cards Row (Desktop 3 Equal Columns, Mobile 3 Stacked Cards) -->
                  <div style="margin-bottom: 24px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
                      <tr>
                        <!-- Card 1: Product Details -->
                        <td class="card-col" width="33.33%" valign="top" style="padding-right: 4px;">
                          <div class="card-box" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; box-sizing: border-box;">
                            <div style="font-size: 12px; font-weight: 700; color: #0284c7; margin-bottom: 10px;">
                              📦 Product Details
                            </div>
                            <table border="0" cellspacing="0" cellpadding="0" width="100%">
                              <tr>
                                <td valign="top" style="padding-right: 8px;" width="44">
                                  ${hasSticker ? `<img src="cid:emailSticker" width="44" height="44" alt="Aquaforce 1400" style="width: 44px; height: 44px; border-radius: 8px; object-fit: contain; background: #f8fafc; border: 1px solid #e2e8f0; display: block;" />` : ""}
                                </td>
                                <td valign="top">
                                  <div style="font-size: 11.5px; font-weight: 700; color: #0f172a; line-height: 1.25;">${product || "Aquaforce 1400 PSI Tech (Yellow)"}</div>
                                  <div style="font-size: 10.5px; color: #64748b; margin-top: 3px;">
                                    Qty: 1 <span style="font-weight: 700; color: #0f172a; margin-left: 4px;">₹${formattedAmount}</span>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 10px;">
                              <a href="${invoiceUrl}" target="_blank" style="font-size: 11.5px; font-weight: 700; color: #0284c7; text-decoration: none;">📄 View Invoice &rsaquo;</a>
                            </div>
                          </div>
                        </td>

                        <!-- Card 2: Delivery Address -->
                        <td class="card-col" width="33.33%" valign="top" style="padding: 0 2px;">
                          <div class="card-box" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; box-sizing: border-box;">
                            <div style="font-size: 12px; font-weight: 700; color: #7c3aed; margin-bottom: 10px;">
                              📍 Delivery Address
                            </div>
                            <div style="font-size: 11px; color: #334155; line-height: 1.35; font-weight: 500;">
                              ${deliveryAddress || "456 Test Boulevard"},<br/>
                              ${city || "Bengaluru"}, ${state || "Karnataka"} - ${pincode || "560001"}<br/>
                              India ${altPhone && altPhone !== "N/A" ? `<span style="color: #64748b; font-size: 10px;">(Alt: ${altPhone})</span>` : ""}
                            </div>
                            <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 10px;">
                              <a href="${googleMapsUrl}" target="_blank" style="font-size: 11.5px; font-weight: 700; color: #7c3aed; text-decoration: none;">🗺️ View on Map &rsaquo;</a>
                            </div>
                          </div>
                        </td>

                        <!-- Card 3: Need Help? -->
                        <td class="card-col" width="33.33%" valign="top" style="padding-left: 4px;">
                          <div class="card-box" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; box-sizing: border-box;">
                            <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 6px;">
                              🎧 Need Help?
                            </div>
                            <div style="font-size: 10.5px; color: #64748b; margin-bottom: 6px;">Our support team is here to help.</div>
                            <div style="font-size: 11px; color: #0f172a; font-weight: 600; margin-bottom: 2px;">📞 9876543210</div>
                            <div style="font-size: 11px; color: #0f172a; font-weight: 600;">✉️ promec.india@gmail.com</div>
                            <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 10px;">
                              <a href="mailto:promec.india@gmail.com" style="font-size: 11.5px; font-weight: 700; color: #059669; text-decoration: none;">Contact Support &rsaquo;</a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Bottom Yellow/Cream Trust Banner -->
                  <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; padding: 14px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="trust-table">
                      <tr>
                        <td class="trust-left-td">
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding-right: 10px;">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #fef08a; text-align: center; line-height: 32px; font-size: 16px;">🛡️</div>
                              </td>
                              <td>
                                <div style="font-size: 13px; font-weight: 800; color: #78350f;">Thank you for choosing Promec India!</div>
                                <div style="font-size: 11px; color: #92400e;">We appreciate your trust in us.</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td class="trust-right-td" align="right" style="font-size: 12px; color: #78350f; font-weight: 600;">
                          Follow us &nbsp;
                          ${hasFb ? `<a href="https://www.facebook.com/promecindia" target="_blank" style="text-decoration: none; margin-left: 6px; display: inline-block; vertical-align: middle;"><img src="cid:fbIcon" alt="Facebook" style="width: 22px; height: 22px; display: inline-block; vertical-align: middle; border: 0;" /></a>` : ""}
                          ${hasInsta ? `<a href="https://www.instagram.com/promec.india" target="_blank" style="text-decoration: none; margin-left: 6px; display: inline-block; vertical-align: middle;"><img src="cid:instaIcon" alt="Instagram" style="width: 22px; height: 22px; display: inline-block; vertical-align: middle; border: 0;" /></a>` : ""}
                          ${hasYoutube ? `<a href="https://www.youtube.com/@PROMECIndia" target="_blank" style="text-decoration: none; margin-left: 6px; display: inline-block; vertical-align: middle;"><img src="cid:youtubeIcon" alt="YouTube" style="width: 22px; height: 22px; display: inline-block; vertical-align: middle; border: 0;" /></a>` : ""}
                        </td>
                      </tr>
                    </table>
                  </div>

                </div>

              </td>
            </tr>
          </table>

        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
