const STREAMPAY_BASE = "https://stream-app-service.streampay.sa";

function getApiKey() {
  const key = process.env.STREAM_X_API_KEY;
  if (!key) throw new Error("STREAM_X_API_KEY is not set");
  return key;
}

async function streamFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${STREAMPAY_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`StreamPay ${res.status} on ${path}:`, JSON.stringify(data));
    throw new Error(
      data.message || data.detail || `StreamPay API error: ${res.status}`
    );
  }

  return data as T;
}

// ─── Products ───

export async function createProduct(params: {
  name: string;
  description?: string;
  price: number;
  currency: string;
  type: "ONE_OFF" | "RECURRING" | "METERED";
  interval?: "day" | "week" | "month" | "year";
}) {
  return streamFetch("/api/v2/products", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function listProducts(params?: {
  type?: string;
  active?: boolean;
  currency?: string;
}) {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();
  return streamFetch(`/api/v2/products${query ? `?${query}` : ""}`);
}

export async function getProduct(id: string) {
  return streamFetch(`/api/v2/products/${id}`);
}

// ─── Payment Links (Checkout) ───

export async function createPaymentLink(params: {
  name: string;
  description?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    coupons?: string[];
  }>;
  consumer_id?: string;
  success_url?: string;
  cancel_url?: string;
  metadata?: Record<string, string>;
}) {
  return streamFetch("/api/v2/payment_links", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getPaymentLink(id: string) {
  return streamFetch(`/api/v2/payment_links/${id}`);
}

export async function listPaymentLinks() {
  return streamFetch("/api/v2/payment_links");
}

// ─── Consumers ───

export async function createConsumer(params: {
  name: string;
  email?: string;
  phone?: string;
  language?: string;
}) {
  return streamFetch("/api/v2/consumers", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getConsumer(id: string) {
  return streamFetch(`/api/v2/consumers/${id}`);
}

export async function listConsumers() {
  return streamFetch("/api/v2/consumers");
}

export async function updateConsumer(
  id: string,
  params: { name?: string; email?: string; phone?: string }
) {
  return streamFetch(`/api/v2/consumers/${id}`, {
    method: "PUT",
    body: JSON.stringify(params),
  });
}

// ─── Subscriptions ───

export async function createSubscription(params: {
  items: Array<{ product_id: string; quantity: number }>;
  consumer_id: string;
  description?: string;
  coupons?: string[];
}) {
  return streamFetch("/api/v2/subscriptions", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getSubscription(id: string) {
  return streamFetch(`/api/v2/subscriptions/${id}`);
}

export async function listSubscriptions(params?: {
  organization_consumer_id?: string;
  statuses?: string[];
  product_ids?: string[];
}) {
  const query = new URLSearchParams();
  if (params?.organization_consumer_id) query.set("organization_consumer_id", params.organization_consumer_id);
  if (params?.statuses) params.statuses.forEach((s) => query.append("statuses", s));
  if (params?.product_ids) params.product_ids.forEach((p) => query.append("product_ids", p));
  const qs = query.toString();
  return streamFetch(`/api/v2/subscriptions${qs ? `?${qs}` : ""}`);
}

export async function cancelSubscription(
  id: string,
  params?: { cancel_ongoing_invoices?: boolean }
) {
  return streamFetch(`/api/v2/subscriptions/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify(params || {}),
  });
}

// ─── Payments ───

export async function getPayment(id: string) {
  return streamFetch(`/api/v2/payments/${id}`);
}

export async function listPayments(params?: {
  statuses?: string[];
  invoice_id?: string[];
}) {
  const query = new URLSearchParams();
  if (params?.statuses) params.statuses.forEach((s) => query.append("statuses", s));
  if (params?.invoice_id) params.invoice_id.forEach((i) => query.append("invoice_id", i));
  const qs = query.toString();
  return streamFetch(`/api/v2/payments${qs ? `?${qs}` : ""}`);
}

export async function refundPayment(
  id: string,
  params: { reason?: string; allow_refund_multiple_related_payments?: boolean }
) {
  return streamFetch(`/api/v2/payments/${id}/refund`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ─── Invoices ───

export async function getInvoice(id: string) {
  return streamFetch(`/api/v2/invoices/${id}`);
}

export async function listInvoices(params?: {
  statuses?: string[];
  subscription_id?: string;
  organization_consumer_id?: string;
}) {
  const query = new URLSearchParams();
  if (params?.statuses) params.statuses.forEach((s) => query.append("statuses", s));
  if (params?.subscription_id) query.set("subscription_id", params.subscription_id);
  if (params?.organization_consumer_id) query.set("organization_consumer_id", params.organization_consumer_id);
  const qs = query.toString();
  return streamFetch(`/api/v2/invoices${qs ? `?${qs}` : ""}`);
}

// ─── Account ───

export async function getMe() {
  return streamFetch("/api/v2/me");
}
