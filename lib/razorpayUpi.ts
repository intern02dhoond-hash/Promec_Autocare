export interface CreateRazorpayUpiIntentInput {
  keyId: string;
  razorpayOrderId: string;
  amountInPaise: number;
  email?: string;
  contact?: string;
  upiApp?: string;
}

export interface CreateRazorpayUpiIntentResult {
  success: boolean;
  intentUrl?: string;
  paymentId?: string;
  statusUrl?: string;
  error?: string;
}

const APP_SHORTCODE_MAP: Record<string, string> = {
  gpay: "google_pay",
  google_pay: "google_pay",
  phonepe: "phonepe",
  paytm: "paytm",
  amazonpay: "amazon",
  amazon: "amazon",
  bhim: "bhim",
  cred: "cred",
};

/**
 * Registers a real Razorpay UPI Intent / QR payment against an existing Razorpay order
 * via Razorpay's checkout ajax endpoint so the returned `upi://pay?...&tr=<pay_ref>`
 * is actively tracked by Razorpay's UPI switch (`rxairtel`).
 */
export async function createRazorpayUpiIntent(
  input: CreateRazorpayUpiIntentInput
): Promise<CreateRazorpayUpiIntentResult> {
  try {
    const keyId = (input.keyId || "").trim();
    const razorpayOrderId = (input.razorpayOrderId || "").trim();
    const amountInPaise = Math.round(Number(input.amountInPaise) || 0);

    if (!keyId || !razorpayOrderId || amountInPaise <= 0) {
      return {
        success: false,
        error: "Missing keyId, razorpayOrderId, or valid amountInPaise",
      };
    }

    const digits = String(input.contact || "").replace(/\D/g, "").slice(-10);
    const contact = digits.length === 10 ? digits : "9999999999";
    const email = (input.email || "").trim() || "customer@promectools.in";

    const params = new URLSearchParams();
    params.append("key_id", keyId);
    params.append("amount", String(amountInPaise));
    params.append("currency", "INR");
    params.append("order_id", razorpayOrderId);
    params.append("method", "upi");
    params.append("_[flow]", "intent");
    params.append("_[upiqr]", "1");
    params.append("_[library]", "razorpayjs");
    params.append("email", email);
    params.append("contact", contact);

    const mappedApp = input.upiApp ? APP_SHORTCODE_MAP[input.upiApp.toLowerCase()] : undefined;
    if (mappedApp) {
      params.append("_[app]", mappedApp);
    }

    const res = await fetch(
      `https://api.razorpay.com/v1/payments/create/ajax?key_id=${encodeURIComponent(keyId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
        signal: AbortSignal.timeout(10000),
      }
    );

    const data: any = await res.json().catch(() => null);

    if (!res.ok || data?.error || !data?.data?.intent_url) {
      const errMsg =
        data?.error?.description ||
        data?.error?.reason ||
        `Razorpay UPI intent creation failed (HTTP ${res.status})`;
      console.error("[Razorpay UPI Intent] Failed:", errMsg, data);
      return { success: false, error: errMsg };
    }

    return {
      success: true,
      intentUrl: String(data.data.intent_url),
      paymentId: data.payment_id ? String(data.payment_id) : undefined,
      statusUrl: data.request?.url ? String(data.request.url) : undefined,
    };
  } catch (err: any) {
    console.error("[Razorpay UPI Intent] Exception:", err?.message || err);
    return {
      success: false,
      error: err?.message || "Failed to generate Razorpay UPI intent",
    };
  }
}
