const STREAMPAY_BASE = "https://stream-app-service.streampay.sa";

function getApiKey() {
  const key = process.env.STREAM_API_KEY;
  if (!key) throw new Error("STREAM_API_KEY is not set");
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
    throw new Error(
      data.message || `StreamPay API error: ${res.status}`
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
  return streamFetch("/v2/products", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function listProducts(params?: {
  type?: string;
  status?: string;
  currency?: string;
}) {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v)
  ).toString();
  return streamFetch(`/v2/products${query ? `?${query}` : ""}`);
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
  customer_id?: string;
  success_url?: string;
  cancel_url?: string;
  metadata?: Record<string, string>;
}) {
  return streamFetch("/v2/payment_links", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getPaymentLink(id: string) {
  return streamFetch(`/v2/payment_links/${id}`);
}

// ─── Customers ───

export async function createCustomer(params: {
  name: string;
  email?: string;
  phone?: string;
  language?: string;
}) {
  return streamFetch("/v2/customers", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getCustomer(id: string) {
  return streamFetch(`/v2/customers/${id}`);
}

export async function listCustomers() {
  return streamFetch("/v2/customers");
}

// ─── Subscriptions ───

export async function getSubscription(id: string) {
  return streamFetch(`/v2/subscriptions/${id}`);
}

export async function listSubscriptions(params?: {
  customer_id?: string;
  status?: string;
}) {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v)
  ).toString();
  return streamFetch(`/v2/subscriptions${query ? `?${query}` : ""}`);
}

// ─── Payments ───

export async function getPayment(id: string) {
  return streamFetch(`/v2/payments/${id}`);
}

export async function listPayments(params?: {
  status?: string;
  invoice_id?: string;
}) {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v)
  ).toString();
  return streamFetch(`/v2/payments${query ? `?${query}` : ""}`);
}

export async function refundPayment(
  id: string,
  params: { amount?: number; reason?: string }
) {
  return streamFetch(`/v2/payments/${id}/refund`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ─── Invoices ───

export async function getInvoice(id: string) {
  return streamFetch(`/v2/invoices/${id}`);
}

// ─── Account ───

export async function getMe() {
  return streamFetch("/v2/me");
}
