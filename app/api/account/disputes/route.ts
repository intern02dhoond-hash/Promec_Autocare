import { NextResponse } from "next/server";
import { disputeStore, PromecDispute, DisputeReason, DisputeType, PreferredResolution } from "@/lib/disputeStore";
import { orderStore } from "@/lib/orderStore";

const REASON_LABELS: Record<DisputeReason, string> = {
  DAMAGED_IN_TRANSIT: "Damaged / Broken in Transit",
  PRESSURE_PUMP_ISSUE: "Low Pressure / Pump Priming Issue",
  MISSING_ACCESSORIES: "Missing Accessories (Foam Cannon, Lance, etc.)",
  WRONG_ITEM_COLOR: "Wrong Color or Variant Delivered",
  BATTERY_CHARGER_ISSUE: "Battery Pack or Charger Malfunction",
  COURIER_DELAY_DELIVERY: "Courier Delay / Undelivered Package",
  PERFORMANCE_DEFECT: "Motor Performance or Leakage Issue",
  OTHER: "Other Issue or Question",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const orderId = searchParams.get("orderId");

    if (orderId) {
      const disputes = await disputeStore.getDisputesByOrderId(orderId);
      return NextResponse.json({ success: true, disputes });
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number or Order ID is required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const disputes = await disputeStore.getDisputesByPhone(cleanPhone);

    return NextResponse.json({
      success: true,
      disputes,
      count: disputes.length,
    });
  } catch (error: any) {
    console.error("Error in GET /api/account/disputes:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderId,
      phone,
      fullName,
      type = "replacement",
      reason = "DAMAGED_IN_TRANSIT",
      description,
      preferredResolution = "express_replacement",
      attachmentNames = [],
    } = body;

    if (!orderId || !phone || !description?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide the Order ID, Phone number, and Description" },
        { status: 400 }
      );
    }

    const unboxingVideo = (body.unboxingVideo || body.verificationProof?.unboxingVideo || "").trim();
    const testingVideo = (body.testingVideo || body.verificationProof?.testingVideo || "").trim();
    const customerReview = (body.customerReview || body.verificationProof?.customerReview || "").trim();

    if (!unboxingVideo || !testingVideo) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Warranty claims & replacements strictly require: 1. Unboxing video of the washer system, and 2. Testing video of washer system along with vacuum.",
        },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const order = await orderStore.getOrderById(orderId);

    const customerName = fullName?.trim() || order?.customer?.fullName || "Valued Customer";
    const shippingAddress = order?.customer?.shippingAddress || "Customer Address on File";
    const city = order?.customer?.city || "";
    const state = order?.customer?.state || "";
    const pincode = order?.customer?.pincode || "";

    const primaryItem = order?.items?.[0] || {
      productName: "Aquaforce® 1400 PSI Tech",
      variantName: "Standard",
      color: "Yellow",
    };

    const caseId = `PROMEC-CARE-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const now = new Date().toISOString();

    const resolvedReason = (reason in REASON_LABELS ? reason : "OTHER") as DisputeReason;
    const reasonLabel = REASON_LABELS[resolvedReason];

    const newDispute: PromecDispute = {
      id: caseId,
      createdAt: now,
      updatedAt: now,
      orderId,
      customer: {
        fullName: customerName,
        phone: cleanPhone,
        email: order?.customer?.email || "",
        shippingAddress,
        city,
        state,
        pincode,
      },
      type: type as DisputeType,
      reason: resolvedReason,
      reasonLabel,
      description: description.trim(),
      preferredResolution: preferredResolution as PreferredResolution,
      itemDetails: {
        productName: primaryItem.productName,
        variantName: primaryItem.variantName,
        color: primaryItem.color,
      },
      attachmentNames: Array.isArray(attachmentNames) ? attachmentNames : [],
      verificationProof: {
        unboxingVideo,
        testingVideo,
        customerReview,
      },
      status: "submitted",
      timeline: [
        {
          timestamp: now,
          status: "submitted",
          note: "Your claim has been registered. PROMEC Quality Engineering team will review details within 24 business hours.",
          author: "PROMEC Automated Care System",
        },
      ],
      resolutionDetails: {
        notes: "Pending initial technical review.",
      },
    };

    await disputeStore.createDispute(newDispute);

    // Also update order status if needed (e.g. tag order with dispute note)
    if (order) {
      await orderStore.updateOrder(order.id, {
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      caseId,
      dispute: newDispute,
      message: `Your claim (${caseId}) has been successfully submitted! Our team will prioritize your resolution.`,
    });
  } catch (error: any) {
    console.error("Error in POST /api/account/disputes:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit dispute" },
      { status: 500 }
    );
  }
}
