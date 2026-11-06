import fs from "fs";
import path from "path";

export interface PromecOrder {
  id: string; // e.g. "PROMEC-ORD-1727000000000-AB12"
  createdAt: string;
  updatedAt: string;
  idempotencyKey?: string;

  orderStatus:
    | "pending_payment"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";

  customer: {
    fullName: string;
    phone: string;
    email: string;
    shippingAddress: string;
    city: string;
    state: string;
    pincode: string;
    altPhone?: string;
    gstNumber?: string;
    customerType?: "retail" | "commercial";
    companyName?: string;
  };

  items: Array<{
    productId: string;
    productName: string;
    variantId: string;
    variantName: string;
    color: string;
    quantity: number;
    unitPriceInINR: number;
    unitMrpInINR: number;
    totalAmountInINR: number;
  }>;

  pricing: {
    subtotalInINR: number;
    discountInINR: number;
    shippingFeeInINR: number;
    handlingFeeInINR: number;
    codFeeInINR: number;
    finalTotalInINR: number;
    currency: "INR";
  };

  payment: {
    method: "FULL_ONLINE" | "COD_ADVANCE" | "EMI";
    provider: "RAZORPAY";
    mode?: "UPI" | "CARD" | "NETBANKING" | "WALLET" | "EMI";
    status: "pending" | "processing" | "captured" | "failed" | "refunded";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    qrCodeId?: string;
    amountRequiredInPaise: number;
    amountPaidInPaise: number;
    amountDueInPaise: number;
    capturedAt?: string;
    failureReason?: string;
    razorpayInvoiceId?: string;
    razorpayInvoiceUrl?: string;
    subventionDiscountInINR?: number;
    netSettlementInINR?: number;
    isNoCostEmi?: boolean;
    emiDetails?: {
      bank: string;
      bankCode: string;
      tenure: number;
      monthlyAmount: number;
    };
  };

  fulfillment: {
    status: "pending" | "processing" | "completed" | "failed" | "cancelled";
    fulfillmentStartedAt?: string;
    fulfillmentCompletedAt?: string;
    waybill?: string;
    shipmentId?: string;
    error?: string;
    googleSheetSynced?: boolean;
    emailSent?: boolean;
    smsSent?: boolean;
    whatsappSent?: boolean;
    invoiceGenerated?: boolean;
  };

  refund?: {
    refundId: string;
    amountInPaise: number;
    status: string;
    refundedAt: string;
    reason?: string;
  };

  cancellation?: {
    cancelledAt?: string;
    reason?: string;
    cancelledBy?: string;
  };

  processedWebhookEvents: string[];
}

export interface IOrderStore {
  createOrder(order: PromecOrder): Promise<PromecOrder>;
  getOrderById(orderId: string): Promise<PromecOrder | null>;
  getOrderByRazorpayOrderId(rzpOrderId: string): Promise<PromecOrder | null>;
  getByIdempotencyKey(key: string): Promise<PromecOrder | null>;
  updateOrder(orderId: string, patch: Partial<PromecOrder>): Promise<PromecOrder | null>;
  claimFulfillmentLock(orderId: string, force?: boolean): Promise<boolean>;
  completeFulfillment(
    orderId: string,
    details: Partial<PromecOrder["fulfillment"]>
  ): Promise<void>;
  failFulfillment(orderId: string, error: string): Promise<void>;
  recordWebhookEvent(orderId: string, eventId: string): Promise<boolean>;
  getOrdersByPhone(phone: string): Promise<PromecOrder[]>;
  getAllOrders(): Promise<PromecOrder[]>;
}

/**
 * File-backed order store adapter for local/standalone environments.
 * Stores state in data/orders.json with atomic writes and memory caching.
 * Can be cleanly swapped with PostgreSQL, MongoDB, or Supabase by implementing IOrderStore.
 */
class LocalFileOrderStore implements IOrderStore {
  private filePath: string;
  private memoryCache: Map<string, PromecOrder> = new Map();
  private isLoaded: boolean = false;
  private writeLock: Promise<void> = Promise.resolve();

  constructor() {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        console.warn("Could not create data/ directory:", e);
      }
    }
    this.filePath = path.join(dataDir, "orders.json");
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const list: PromecOrder[] = JSON.parse(raw);
        for (const order of list) {
          this.memoryCache.set(order.id, order);
        }
      }
    } catch (err) {
      console.error("Failed to load orders from data/orders.json:", err);
    }
    this.isLoaded = true;
  }

  private async persist(): Promise<void> {
    this.writeLock = this.writeLock.then(async () => {
      try {
        const list = Array.from(this.memoryCache.values());
        const tempPath = `${this.filePath}.tmp.${Date.now()}`;
        await fs.promises.writeFile(tempPath, JSON.stringify(list, null, 2), "utf-8");
        await fs.promises.rename(tempPath, this.filePath);
      } catch (err) {
        console.error("Failed to persist data/orders.json:", err);
      }
    });
    return this.writeLock;
  }

  async createOrder(order: PromecOrder): Promise<PromecOrder> {
    this.memoryCache.set(order.id, order);
    await this.persist();
    return order;
  }

  async getOrderById(orderId: string): Promise<PromecOrder | null> {
    if (!orderId) return null;
    return this.memoryCache.get(orderId) || null;
  }

  async getOrderByRazorpayOrderId(rzpOrderId: string): Promise<PromecOrder | null> {
    if (!rzpOrderId) return null;
    for (const order of this.memoryCache.values()) {
      if (order.payment.razorpayOrderId === rzpOrderId) {
        return order;
      }
    }
    return null;
  }

  async getByIdempotencyKey(key: string): Promise<PromecOrder | null> {
    if (!key) return null;
    for (const order of this.memoryCache.values()) {
      if (order.idempotencyKey === key) {
        return order;
      }
    }
    return null;
  }

  async updateOrder(orderId: string, patch: Partial<PromecOrder>): Promise<PromecOrder | null> {
    const existing = this.memoryCache.get(orderId);
    if (!existing) return null;

    const updated: PromecOrder = {
      ...existing,
      ...patch,
      payment: {
        ...existing.payment,
        ...(patch.payment || {}),
      },
      fulfillment: {
        ...existing.fulfillment,
        ...(patch.fulfillment || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    this.memoryCache.set(orderId, updated);
    await this.persist();
    return updated;
  }

  /**
   * Atomic fulfillment lock:
   * Only transitions to "processing" if current status is "pending".
   * Returns true if lock was claimed, false if already claimed or completed.
   */
  async claimFulfillmentLock(orderId: string, force?: boolean): Promise<boolean> {
    const order = this.memoryCache.get(orderId);
    if (!order) return false;

    if (!force && order.fulfillment.status === "completed") {
      return false;
    }

    if (!force && order.fulfillment.status === "processing") {
      const startedAt = order.fulfillment.fulfillmentStartedAt
        ? new Date(order.fulfillment.fulfillmentStartedAt).getTime()
        : 0;
      const now = Date.now();
      const isStale = !startedAt || now - startedAt > 60000;
      if (!isStale) {
        console.log(
          `Fulfillment lock skipped for order ${orderId}. Current status: ${order.fulfillment.status} (active lock)`
        );
        return false;
      }
      console.warn(
        `[Fulfillment Lock] Stale lock detected for order ${orderId} (>60s). Re-claiming lock...`
      );
    }

    order.fulfillment.status = "processing";
    order.fulfillment.fulfillmentStartedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    await this.persist();
    return true;
  }

  async completeFulfillment(
    orderId: string,
    details: Partial<PromecOrder["fulfillment"]>
  ): Promise<void> {
    const order = this.memoryCache.get(orderId);
    if (!order) return;

    order.fulfillment = {
      ...order.fulfillment,
      ...details,
      status: "completed",
      fulfillmentCompletedAt: new Date().toISOString(),
    };
    order.orderStatus = "confirmed";
    order.updatedAt = new Date().toISOString();
    await this.persist();
  }

  async failFulfillment(orderId: string, error: string): Promise<void> {
    const order = this.memoryCache.get(orderId);
    if (!order) return;

    order.fulfillment.status = "failed";
    order.fulfillment.error = error;
    order.updatedAt = new Date().toISOString();
    await this.persist();
  }

  /**
   * Records a webhook event ID for idempotency.
   * Returns true if event is newly recorded, false if duplicate.
   */
  async recordWebhookEvent(orderId: string, eventId: string): Promise<boolean> {
    const order = this.memoryCache.get(orderId);
    if (!order) return false;

    if (!order.processedWebhookEvents) {
      order.processedWebhookEvents = [];
    }

    if (order.processedWebhookEvents.includes(eventId)) {
      return false; // Duplicate event
    }

    order.processedWebhookEvents.push(eventId);
    order.updatedAt = new Date().toISOString();
    await this.persist();
    return true;
  }

  async getOrdersByPhone(phone: string): Promise<PromecOrder[]> {
    if (!phone) return [];
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone) return [];

    const matches: PromecOrder[] = [];
    for (const order of this.memoryCache.values()) {
      const orderPhone = (order.customer?.phone || "").replace(/\D/g, "").slice(-10);
      const orderAltPhone = (order.customer?.altPhone || "").replace(/\D/g, "").slice(-10);
      if (orderPhone === cleanPhone || (orderAltPhone && orderAltPhone === cleanPhone)) {
        matches.push(order);
      }
    }

    return matches.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAllOrders(): Promise<PromecOrder[]> {
    return Array.from(this.memoryCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

// Export singleton instance backed by Supabase with local file fallback
import { SupabaseOrderStore } from "./supabaseOrderStore";
const localFileStore = new LocalFileOrderStore();
export const orderStore: IOrderStore = new SupabaseOrderStore(localFileStore);
