import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { orderStore } from "@/lib/orderStore";
import { executeOrderFulfillment } from "@/lib/fulfillment";
import { generateAndSendRazorpayInvoice } from "@/lib/razorpayInvoiceService";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const {
      orderId, // Promec internal order ID
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    const rzpOrderId = razorpayOrderId;

    if (!orderId && !rzpOrderId) {
      return NextResponse.json(
        {
          error: "Missing required order identifier: orderId or razorpayOrderId",
        },
        { status: 400 }
      );
    }

    const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const key_id = (
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ""
    ).trim();

    if (!key_secret || !key_id) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured on server" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    // 1. Locate Promec internal order
    let order = orderId ? await orderStore.getOrderById(orderId) : null;
    if (!order && rzpOrderId) {
      order = await orderStore.getOrderByRazorpayOrderId(rzpOrderId);
    }

    // Enrich existing order with customer details from body if provided
    if (order && body.customer) {
      const bc = body.customer;
      const addr = bc.deliveryAddress || bc.shippingAddress;
      let customerChanged = false;
      if (addr && (!order.customer.shippingAddress || order.customer.shippingAddress === "Main Address")) {
        order.customer.shippingAddress = addr;
        customerChanged = true;
      }
      if (bc.city && (!order.customer.city || order.customer.city === "Nagpur")) {
        order.customer.city = bc.city;
        customerChanged = true;
      }
      if (bc.state && (!order.customer.state || order.customer.state === "Maharashtra")) {
        order.customer.state = bc.state;
        customerChanged = true;
      }
      if (bc.pincode && (!order.customer.pincode || order.customer.pincode === "440016")) {
        order.customer.pincode = bc.pincode;
        customerChanged = true;
      }
      if (bc.fullName && (!order.customer.fullName || order.customer.fullName === "Valued Customer")) {
        order.customer.fullName = bc.fullName;
        customerChanged = true;
      }
      if (bc.phone && !order.customer.phone) {
        order.customer.phone = bc.phone;
        customerChanged = true;
      }
      if (bc.email && !order.customer.email) {
        order.customer.email = bc.email;
        customerChanged = true;
      }
      if (customerChanged) {
        await orderStore.updateOrder(order.id, { customer: order.customer });
      }
    }

    // Auto-recovery: If order is missing in DB (e.g. database unreachable or serverless ephemeral loss),
    // reconstruct order from Razorpay's authoritative order & payment records!
    if (!order && (rzpOrderId || orderId)) {
      try {
        console.warn(`[Payment Verify] Order ${orderId || rzpOrderId} not found in store. Attempting auto-reconstruction from Razorpay...`);
        const rzpOrderToFetch = rzpOrderId || (orderId && orderId.startsWith("order_") ? orderId : null);
        let fetchedRzpOrder: any = null;
        if (rzpOrderToFetch) {
          try {
            fetchedRzpOrder = await razorpay.orders.fetch(rzpOrderToFetch);
          } catch (fetchOrderErr: any) {
            console.warn("[Payment Verify] Failed fetching Razorpay order:", fetchOrderErr?.message);
          }
        }

        let fetchedPayment: any = null;
        if (razorpayPaymentId) {
          try {
            fetchedPayment = await razorpay.payments.fetch(razorpayPaymentId);
          } catch (fetchPayErr: any) {
            console.warn("[Payment Verify] Failed fetching Razorpay payment:", fetchPayErr?.message);
          }
        }

        const notes = fetchedRzpOrder?.notes || fetchedPayment?.notes || {};
        const fallbackName = body.customer?.fullName || notes.customerName || "";
        const fallbackPhone = body.customer?.phone || notes.customerPhone || (fetchedPayment?.contact ? fetchedPayment.contact.replace(/\D/g, "").slice(-10) : "");
        const fallbackEmail = body.customer?.email || notes.customerEmail || fetchedPayment?.email || "";
        const fallbackAddress = body.customer?.deliveryAddress || body.customer?.shippingAddress || notes.customerAddress || notes.deliveryAddress || "";
        const fallbackCity = body.customer?.city || notes.customerCity || notes.city || "";
        const fallbackState = body.customer?.state || notes.customerState || notes.state || "";
        const fallbackPincode = body.customer?.pincode || notes.customerPincode || notes.pincode || "";
        const fallbackId = notes.promecOrderId || orderId || (rzpOrderId ? `PROMEC-ORD-${rzpOrderId}` : `PROMEC-ORD-${Date.now()}`);

        const amountPaise = Number(fetchedRzpOrder?.amount || fetchedPayment?.amount || 0);
        const amountINR = Math.round(amountPaise / 100);
        const orderTotalINR = Number(notes.orderTotalInINR) || amountINR;
        const recoveredQuantity = Math.max(1, Number(notes.quantity) || 1);

        order = {
          id: fallbackId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          orderStatus: "pending_payment",
          customer: {
            fullName: fallbackName,
            phone: fallbackPhone,
            email: fallbackEmail,
            shippingAddress: fallbackAddress,
            city: fallbackCity,
            state: fallbackState,
            pincode: fallbackPincode,
          },
          items: [
            {
              productId: "aquaforce-1400",
              productName: notes.variantName ? `Cordless AquaForce® 1400 (${notes.variantName})` : "Cordless AquaForce® 1400 High-pressure Washer System",
              variantId: "with-vacuum",
              variantName: notes.variantName || "With Vacuum",
              color: notes.color || "Yellow",
              quantity: recoveredQuantity,
              unitPriceInINR: Math.round(orderTotalINR / recoveredQuantity),
              unitMrpInINR: 44990,
              totalAmountInINR: orderTotalINR,
            },
          ],
          pricing: {
            subtotalInINR: orderTotalINR,
            discountInINR: 0,
            shippingFeeInINR: 0,
            handlingFeeInINR: 0,
            codFeeInINR: 0,
            finalTotalInINR: orderTotalINR,
            currency: "INR",
          },
          payment: {
            method: (notes.paymentMethod as any) || (amountINR < 10000 ? "COD_ADVANCE" : "FULL_ONLINE"),
            provider: "RAZORPAY",
            status: "pending",
            razorpayOrderId: fetchedRzpOrder?.id || rzpOrderId,
            amountRequiredInPaise: amountPaise,
            amountPaidInPaise: 0,
            amountDueInPaise: (notes.paymentMethod === "COD_ADVANCE" || amountINR < 10000) ? Math.max(0, orderTotalINR * 100 - amountPaise) : 0,
          },
          fulfillment: {
            status: "pending",
          },
          processedWebhookEvents: [],
        };

        await orderStore.createOrder(order);
        console.log(`[Payment Verify] Successfully auto-reconstructed order ${order.id} from Razorpay.`);
      } catch (recoveryErr: any) {
        console.error("[Payment Verify] Order recovery failed:", recoveryErr);
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: `Order record not found for Order ID: ${orderId || rzpOrderId}` },
        { status: 404 }
      );
    }

    const activeRzpOrderId = rzpOrderId || order.payment.razorpayOrderId;

    // Check if order was already confirmed (e.g. by Webhook)
    if (order.orderStatus === "confirmed" && order.payment.status === "captured") {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentId: order.payment.razorpayPaymentId || "",
        waybill: order.fulfillment?.waybill || "",
        shipmentId: order.fulfillment?.shipmentId || "",
      });
    }

    // BRANCH A: Direct UPI Intent / Dynamic QR verification (polling via Razorpay API)
    if (!razorpaySignature || !razorpayPaymentId) {
      if (!activeRzpOrderId) {
        return NextResponse.json(
          { error: "Missing Razorpay order ID for status check" },
          { status: 400 }
        );
      }

      try {
        let capturedOrAuthPayment: any = null;
        let failedPayment: any = null;
        const targetPaymentId = razorpayPaymentId || order.payment.razorpayPaymentId;

        if (targetPaymentId) {
          try {
            const directP: any = await razorpay.payments.fetch(targetPaymentId);
            if (directP && directP.order_id === activeRzpOrderId) {
              if (directP.status === "captured" || directP.status === "authorized") {
                capturedOrAuthPayment = directP;
              } else if (directP.status === "failed") {
                failedPayment = directP;
              }
            }
          } catch (e: any) {
            console.warn("[Payment Verify] Direct payment fetch warning:", e?.message);
          }
        }

        if (!capturedOrAuthPayment) {
          const paymentsResponse: any = await razorpay.orders.fetchPayments(activeRzpOrderId);
          const paymentsList = paymentsResponse?.items || [];
          capturedOrAuthPayment = paymentsList.find(
            (p: any) => p.status === "captured" || p.status === "authorized"
          );
          if (!capturedOrAuthPayment && !failedPayment && !targetPaymentId) {
            const hasPendingAttempt = paymentsList.some((p: any) => p.status === "created");
            if (!hasPendingAttempt) {
              failedPayment = paymentsList.find((p: any) => p.status === "failed");
            }
          }
        }

        if (!capturedOrAuthPayment && order.payment.qrCodeId) {
          try {
            const qrPayments: any = await (razorpay as any).qrCode.fetchAllPayments(order.payment.qrCodeId);
            const qrList = qrPayments?.items || [];
            capturedOrAuthPayment = qrList.find(
              (p: any) => p.status === "captured" || p.status === "authorized"
            );
          } catch (qrErr: any) {
            console.warn("[Payment Verify] qrCode fetchAllPayments warning:", qrErr?.message || qrErr);
          }
        }

        if (capturedOrAuthPayment) {
          let paymentDetails = capturedOrAuthPayment;

          // Verify expected payment amount
          if (paymentDetails.amount && Number(paymentDetails.amount) < order.payment.amountRequiredInPaise) {
            console.error("[Payment Verify] UPI payment amount mismatch:", {
              expected: order.payment.amountRequiredInPaise,
              received: paymentDetails.amount,
            });
            return NextResponse.json(
              { error: "Payment amount does not match expected order amount" },
              { status: 400 }
            );
          }

          if (paymentDetails.status === "authorized") {
            try {
              paymentDetails = await razorpay.payments.capture(
                paymentDetails.id,
                order.payment.amountRequiredInPaise,
                "INR"
              );
            } catch (capErr: any) {
              console.error("[Payment Verify] UPI Auto-capture error:", capErr);
            }
          }

          if (paymentDetails.status === "captured") {
            await orderStore.updateOrder(order.id, {
              orderStatus: "confirmed",
              payment: {
                ...order.payment,
                status: "captured",
                mode: paymentDetails.method?.toUpperCase() || "UPI",
                razorpayPaymentId: paymentDetails.id,
                amountPaidInPaise: order.payment.amountRequiredInPaise,
                capturedAt: new Date().toISOString(),
              },
            });

            const fulfillmentResult = await executeOrderFulfillment(order.id);
            return NextResponse.json({
              success: true,
              orderId: order.id,
              paymentId: paymentDetails.id,
              waybill: fulfillmentResult.waybill || order.fulfillment.waybill || "",
              shipmentId: fulfillmentResult.shipmentId || order.fulfillment.shipmentId || "",
            });
          }
        }
        if (failedPayment) {
          const failReason =
            failedPayment.error_description ||
            failedPayment.error_reason ||
            "UPI payment failed or was cancelled. Please generate a fresh QR and try again.";
          await orderStore.updateOrder(order.id, {
            payment: {
              ...order.payment,
              status: "failed",
              razorpayPaymentId: failedPayment.id,
              failureReason: failReason,
            },
          });
          return NextResponse.json({
            success: false,
            status: "failed",
            paymentId: failedPayment.id,
            error: failReason,
          });
        }
      } catch (fetchOrderErr: any) {
        console.warn("[Payment Verify] Polling Razorpay orders error:", fetchOrderErr.message);
      }

      return NextResponse.json({
        success: false,
        status: "pending",
        message: "Payment is pending completion in customer UPI app",
      });
    }

    // BRANCH B: Cryptographic HMAC SHA-256 Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${activeRzpOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const isAuthentic =
      expectedSignature.length === razorpaySignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf-8"),
        Buffer.from(razorpaySignature, "utf-8")
      );

    if (!isAuthentic) {
      console.error("[Payment Verify] Signature mismatch:", {
        expected: expectedSignature,
        received: razorpaySignature,
      });

      await orderStore.updateOrder(order.id, {
        payment: {
          ...order.payment,
          status: "failed",
          failureReason: "HMAC signature verification failed",
        },
      });

      return NextResponse.json(
        { success: false, error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    // 3. Double-check with Razorpay API (Contract Requirement)
    let paymentDetails: any;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);
    } catch (fetchErr: any) {
      console.error("[Payment Verify] Failed to fetch payment from Razorpay API:", fetchErr);
      return NextResponse.json(
        { error: `Failed to retrieve payment from Razorpay: ${fetchErr.message}` },
        { status: 502 }
      );
    }

    if (paymentDetails.order_id !== activeRzpOrderId) {
      console.error("[Payment Verify] Payment order ID mismatch:", {
        expected: activeRzpOrderId,
        received: paymentDetails.order_id,
      });
      return NextResponse.json(
        { error: "Payment record does not match the referenced order" },
        { status: 400 }
      );
    }

    // Verify expected payment amount
    if (paymentDetails.amount && Number(paymentDetails.amount) < order.payment.amountRequiredInPaise) {
      console.error("[Payment Verify] Payment amount mismatch:", {
        expected: order.payment.amountRequiredInPaise,
        received: paymentDetails.amount,
      });
      return NextResponse.json(
        { error: "Payment amount does not match expected order amount" },
        { status: 400 }
      );
    }

    // Handle authorization vs captured
    if (paymentDetails.status === "authorized") {
      try {
        console.log(`[Payment Verify] Payment ${razorpayPaymentId} is authorized. Capturing...`);
        paymentDetails = await razorpay.payments.capture(
          razorpayPaymentId,
          order.payment.amountRequiredInPaise,
          "INR"
        );
      } catch (captureErr: any) {
        console.error("[Payment Verify] Capture failed:", captureErr);
        return NextResponse.json(
          { error: `Payment capture failed: ${captureErr.message}` },
          { status: 500 }
        );
      }
    }

    if (paymentDetails.status !== "captured") {
      return NextResponse.json(
        {
          error: `Payment is not in captured state. Current status: ${paymentDetails.status}`,
        },
        { status: 400 }
      );
    }

    // 4. Update Promec Order State (including subvention metrics if No-Cost EMI offer was applied)
    const discountInPaise = Number(paymentDetails?.discount || 0);
    const discountInINR = Math.round(discountInPaise / 100);
    const grossAmountInINR = Math.round(order.payment.amountRequiredInPaise / 100);
    const netSettlementInINR = grossAmountInINR - discountInINR;

    // Auto-create & dispatch Paid Razorpay Invoice directly via Razorpay Email & SMS
    let invoiceResult: { invoiceId: string; invoiceUrl: string } | null = null;
    if (!order.payment?.razorpayInvoiceId) {
      invoiceResult = await generateAndSendRazorpayInvoice({
        order,
        paymentId: razorpayPaymentId,
      });
    }

    await orderStore.updateOrder(order.id, {
      orderStatus: "confirmed",
      payment: {
        ...order.payment,
        status: "captured",
        mode: paymentDetails.method?.toUpperCase() || order.payment.mode,
        razorpayPaymentId,
        razorpaySignature,
        amountPaidInPaise: order.payment.amountRequiredInPaise,
        capturedAt: new Date().toISOString(),
        ...(invoiceResult
          ? {
              razorpayInvoiceId: invoiceResult.invoiceId,
              razorpayInvoiceUrl: invoiceResult.invoiceUrl,
            }
          : {}),
        ...(discountInINR > 0
          ? {
              subventionDiscountInINR: discountInINR,
              netSettlementInINR: netSettlementInINR,
              isNoCostEmi: true,
            }
          : {}),
      },
    });

    // 5. Run Idempotent Fulfillment Pipeline
    const fulfillmentResult = await executeOrderFulfillment(order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentId: razorpayPaymentId,
      waybill: fulfillmentResult.waybill || order.fulfillment.waybill || "",
      shipmentId: fulfillmentResult.shipmentId || order.fulfillment.shipmentId || "",
    });
  } catch (err: any) {
    console.error("[Payment Verify] Server error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during verification" },
      { status: 500 }
    );
  }
}
