import { IOrderStore, PromecOrder } from "./orderStore";
import { getSupabase } from "./supabase";

export class SupabaseOrderStore implements IOrderStore {
  private fallbackStore: IOrderStore;

  constructor(fallbackStore: IOrderStore) {
    this.fallbackStore = fallbackStore;
  }

  private mapRowToOrder(row: any): PromecOrder {
    if (row.raw_order) {
      return {
        ...row.raw_order,
        orderStatus: row.order_status || row.raw_order.orderStatus,
        updatedAt: row.updated_at || row.raw_order.updatedAt,
      };
    }
    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      idempotencyKey: row.idempotency_key,
      orderStatus: row.order_status,
      customer: row.customer || {},
      items: row.items || [],
      pricing: row.pricing || {},
      payment: row.payment || {},
      fulfillment: row.fulfillment || {},
      cancellation: row.cancellation,
      refund: row.refund,
      processedWebhookEvents: row.processed_webhook_events || [],
    };
  }

  private mapOrderToRow(order: PromecOrder) {
    const cleanPhone = (order.customer.phone || "").replace(/\D/g, "").slice(-10);
    return {
      id: order.id,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
      order_status: order.orderStatus,
      customer_phone: cleanPhone,
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
      cancellation: order.cancellation || null,
      refund: order.refund || null,
      idempotency_key: order.idempotencyKey || null,
      processed_webhook_events: order.processedWebhookEvents || [],
      raw_order: order,
    };
  }

  async createOrder(order: PromecOrder): Promise<PromecOrder> {
    const supabase = getSupabase();
    if (!supabase) return this.fallbackStore.createOrder(order);

    try {
      const row = this.mapOrderToRow(order);
      const { data, error } = await supabase
        .from("promec_orders")
        .upsert(row, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        console.error("[SupabaseOrderStore] createOrder error:", error);
        return this.fallbackStore.createOrder(order);
      }
      return this.mapRowToOrder(data);
    } catch (err) {
      console.error("[SupabaseOrderStore] createOrder exception:", err);
      return this.fallbackStore.createOrder(order);
    }
  }

  async getOrderById(orderId: string): Promise<PromecOrder | null> {
    const supabase = getSupabase();
    if (!supabase) return this.fallbackStore.getOrderById(orderId);

    try {
      const { data, error } = await supabase
        .from("promec_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (error || !data) {
        return this.fallbackStore.getOrderById(orderId);
      }
      return this.mapRowToOrder(data);
    } catch (err) {
      console.error("[SupabaseOrderStore] getOrderById exception:", err);
      return this.fallbackStore.getOrderById(orderId);
    }
  }

  async getOrderByRazorpayOrderId(rzpOrderId: string): Promise<PromecOrder | null> {
    const supabase = getSupabase();
    if (!supabase) return this.fallbackStore.getOrderByRazorpayOrderId(rzpOrderId);

    try {
      const { data, error } = await supabase
        .from("promec_orders")
        .select("*")
        .eq("payment->>razorpayOrderId", rzpOrderId)
        .maybeSingle();

      if (error || !data) {
        return this.fallbackStore.getOrderByRazorpayOrderId(rzpOrderId);
      }
      return this.mapRowToOrder(data);
    } catch (err) {
      console.error("[SupabaseOrderStore] getOrderByRazorpayOrderId exception:", err);
      return this.fallbackStore.getOrderByRazorpayOrderId(rzpOrderId);
    }
  }

  async getByIdempotencyKey(key: string): Promise<PromecOrder | null> {
    const supabase = getSupabase();
    if (!supabase) return this.fallbackStore.getByIdempotencyKey(key);

    try {
      const { data, error } = await supabase
        .from("promec_orders")
        .select("*")
        .eq("idempotency_key", key)
        .maybeSingle();

      if (error || !data) {
        return this.fallbackStore.getByIdempotencyKey(key);
      }
      return this.mapRowToOrder(data);
    } catch (err) {
      console.error("[SupabaseOrderStore] getByIdempotencyKey exception:", err);
      return this.fallbackStore.getByIdempotencyKey(key);
    }
  }

  async updateOrder(orderId: string, patch: Partial<PromecOrder>): Promise<PromecOrder | null> {
    const supabase = getSupabase();
    if (!supabase) return this.fallbackStore.updateOrder(orderId, patch);

    try {
      const current = await this.getOrderById(orderId);
      if (!current) {
        return this.fallbackStore.updateOrder(orderId, patch);
      }

      const merged: PromecOrder = {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      };

      const row = this.mapOrderToRow(merged);
      const { data, error } = await supabase
        .from("promec_orders")
        .update(row)
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error("[SupabaseOrderStore] updateOrder error:", error);
        return this.fallbackStore.updateOrder(orderId, patch);
      }

      // Also mirror to fallback for consistency
      this.fallbackStore.updateOrder(orderId, patch).catch(() => {});

      return this.mapRowToOrder(data);
    } catch (err) {
      console.error("[SupabaseOrderStore] updateOrder exception:", err);
      return this.fallbackStore.updateOrder(orderId, patch);
    }
  }

  async claimFulfillmentLock(orderId: string, force?: boolean): Promise<boolean> {
    const order = await this.getOrderById(orderId);
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
        return false;
      }
      console.warn(
        `[SupabaseOrderStore] Stale lock detected for order ${orderId} (>60s). Re-claiming lock...`
      );
    }

    await this.updateOrder(orderId, {
      fulfillment: {
        ...order.fulfillment,
        status: "processing",
        fulfillmentStartedAt: new Date().toISOString(),
      },
    });
    return true;
  }

  async completeFulfillment(
    orderId: string,
    details: Partial<PromecOrder["fulfillment"]>
  ): Promise<void> {
    const order = await this.getOrderById(orderId);
    if (!order) return;

    await this.updateOrder(orderId, {
      orderStatus: "confirmed",
      fulfillment: {
        ...order.fulfillment,
        ...details,
        status: details.status || "completed",
        fulfillmentCompletedAt: new Date().toISOString(),
      },
    });
  }

  async failFulfillment(orderId: string, error: string): Promise<void> {
    const order = await this.getOrderById(orderId);
    if (!order) return;

    await this.updateOrder(orderId, {
      fulfillment: {
        ...order.fulfillment,
        status: "failed",
        error,
      },
    });
  }

  async recordWebhookEvent(orderId: string, eventId: string): Promise<boolean> {
    const order = await this.getOrderById(orderId);
    if (!order) return false;

    if (order.processedWebhookEvents?.includes(eventId)) {
      return false;
    }

    const updatedEvents = [...(order.processedWebhookEvents || []), eventId];
    await this.updateOrder(orderId, {
      processedWebhookEvents: updatedEvents,
    });
    return true;
  }

  async getOrdersByPhone(phone: string): Promise<PromecOrder[]> {
    const supabase = getSupabase();
    if (!supabase) return this.fallbackStore.getOrdersByPhone(phone);

    try {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      const { data, error } = await supabase
        .from("promec_orders")
        .select("*")
        .or(`customer_phone.eq.${cleanPhone},customer->>altPhone.eq.${cleanPhone},customer->>phone.eq.${cleanPhone}`)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return this.fallbackStore.getOrdersByPhone(phone);
      }
      return data.map((row) => this.mapRowToOrder(row));
    } catch (err) {
      console.error("[SupabaseOrderStore] getOrdersByPhone exception:", err);
      return this.fallbackStore.getOrdersByPhone(phone);
    }
  }

  async getAllOrders(): Promise<PromecOrder[]> {
    const supabase = getSupabase();
    if (!supabase) return this.fallbackStore.getAllOrders();

    try {
      const { data, error } = await supabase
        .from("promec_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return this.fallbackStore.getAllOrders();
      }
      return data.map((row) => this.mapRowToOrder(row));
    } catch (err) {
      console.error("[SupabaseOrderStore] getAllOrders exception:", err);
      return this.fallbackStore.getAllOrders();
    }
  }
}
