import { NextResponse } from "next/server";
import { orderStore } from "@/lib/orderStore";
import { createRazorpayUpiIntent } from "@/lib/razorpayUpi";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { orderId, razorpayOrderId, upiApp } = body;

    if (!orderId && !razorpayOrderId) {
      return NextResponse.json(
        { error: "Missing orderId or razorpayOrderId" },
        { status: 400 }
      );
    }

    let order = orderId ? await orderStore.getOrderById(orderId) : null;
    if (!order && razorpayOrderId) {
      order = await orderStore.getOrderByRazorpayOrderId(razorpayOrderId);
    }

    if (!order) {
      return NextResponse.json(
        { error: `Order not found for ${orderId || razorpayOrderId}` },
        { status: 404 }
      );
    }

    if (order.orderStatus === "confirmed" && order.payment.status === "captured") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        orderId: order.id,
        razorpayOrderId: order.payment.razorpayOrderId,
        razorpayPaymentId: order.payment.razorpayPaymentId,
      });
    }

    const activeRzpOrderId = razorpayOrderId || order.payment.razorpayOrderId;
    if (!activeRzpOrderId) {
      return NextResponse.json(
        { error: "Missing Razorpay order ID on order record" },
        { status: 400 }
      );
    }

    const keyId = (
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      ""
    ).trim();

    if (!keyId) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    const upiResult = await createRazorpayUpiIntent({
      keyId,
      razorpayOrderId: activeRzpOrderId,
      amountInPaise: order.payment.amountRequiredInPaise,
      email: order.customer?.email,
      contact: order.customer?.phone,
      upiApp,
    });

    if (!upiResult.success || !upiResult.intentUrl) {
      return NextResponse.json(
        {
          success: false,
          error: upiResult.error || "Unable to generate UPI payment link from Razorpay",
        },
        { status: 502 }
      );
    }

    if (upiResult.paymentId) {
      await orderStore.updateOrder(order.id, {
        payment: {
          ...order.payment,
          razorpayPaymentId: upiResult.paymentId,
          status: order.payment.status === "failed" ? "pending" : order.payment.status,
          failureReason: undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      razorpayOrderId: activeRzpOrderId,
      razorpayPaymentId: upiResult.paymentId || "",
      upiIntentUrl: upiResult.intentUrl,
      keyId,
      amount: order.payment.amountRequiredInPaise,
    });
  } catch (err: any) {
    console.error("[UPI Intent API] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate UPI intent" },
      { status: 500 }
    );
  }
}
