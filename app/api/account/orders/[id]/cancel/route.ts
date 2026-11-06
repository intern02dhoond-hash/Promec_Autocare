import { NextResponse } from "next/server";
import { orderStore } from "@/lib/orderStore";
import { disputeStore, PromecDispute } from "@/lib/disputeStore";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { phone, reason = "Cancelled by customer", notes = "" } = body;

    const order = await orderStore.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Verify customer phone matches order
    if (phone) {
      const cleanReqPhone = phone.replace(/\D/g, "").slice(-10);
      const cleanOrderPhone = (order.customer?.phone || "").replace(/\D/g, "").slice(-10);
      if (cleanReqPhone && cleanOrderPhone && cleanReqPhone !== cleanOrderPhone) {
        return NextResponse.json(
          { success: false, error: "Phone number does not match this order" },
          { status: 403 }
        );
      }
    }

    // Disallow cancelling if already delivered or already cancelled
    if (order.orderStatus === "delivered") {
      return NextResponse.json(
        {
          success: false,
          error: "This order has already been delivered. Please use the Return / Replacement option instead.",
        },
        { status: 400 }
      );
    }

    if (order.orderStatus === "cancelled") {
      return NextResponse.json({
        success: true,
        order,
        message: "This order is already cancelled.",
      });
    }

    const now = new Date().toISOString();
    const isShipped = order.orderStatus === "shipped" || Boolean(order.fulfillment?.waybill);
    const waybill = order.fulfillment?.waybill || "";

    const updatedOrder = await orderStore.updateOrder(orderId, {
      orderStatus: "cancelled",
      cancellation: {
        cancelledAt: now,
        reason: reason.trim(),
        cancelledBy: "customer",
      },
    });

    // Create automated dispute/case record so Operations & Delhivery are flagged for RTO
    const caseId = `PROMEC-CNC-${Date.now().toString().slice(-6)}`;
    const newDispute: PromecDispute = {
      id: caseId,
      createdAt: now,
      updatedAt: now,
      orderId,
      customer: {
        fullName: order.customer?.fullName || "Valued Customer",
        phone: (order.customer?.phone || "").replace(/\D/g, "").slice(-10),
        email: order.customer?.email,
        shippingAddress: order.customer?.shippingAddress || "",
        city: order.customer?.city || "",
        state: order.customer?.state || "",
        pincode: order.customer?.pincode || "",
      },
      type: "dispute",
      reason: "OTHER",
      reasonLabel: isShipped
        ? "In-Transit Cancellation (Delhivery RTO Required)"
        : "Order Cancellation (Pre-Dispatch)",
      description: `Customer requested cancellation from account portal. Reason: ${reason}.${notes ? ` Notes: ${notes}.` : ""}${waybill ? ` Delhivery AWB: ${waybill}. Please halt forward transit and initiate RTO.` : " Order halted before courier dispatch."}`,
      preferredResolution: "refund",
      itemDetails: {
        productName: order.items?.[0]?.productName || "Aquaforce® 1400 PSI Tech",
        variantName: order.items?.[0]?.variantName,
        color: order.items?.[0]?.color,
      },
      status: "submitted",
      timeline: [
        {
          timestamp: now,
          status: "submitted",
          note: isShipped
            ? `Cancellation requested while in transit (AWB: ${waybill}). Return to Origin (RTO) flagged.`
            : "Cancellation processed before dispatch. Refund scheduled.",
          author: "Customer Account Portal",
        },
      ],
      resolutionDetails: {
        notes: isShipped
          ? `Delhivery AWB ${waybill} flagged for RTO. Customer advised to refuse delivery if rider attempts delivery.`
          : "Pre-dispatch cancellation confirmed.",
      },
    };

    await disputeStore.createDispute(newDispute).catch((e) => {
      console.warn("Could not save cancellation dispute record:", e);
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder || order,
      message: isShipped
        ? "Your order has been cancelled. An RTO instruction has been issued to Delhivery Express to turn the shipment back to our warehouse. If the delivery rider calls or arrives, please refuse delivery."
        : "Your order has been successfully cancelled.",
    });
  } catch (error: any) {
    console.error("Error in /api/account/orders/[id]/cancel:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
