import { createClient } from "npm:@supabase/supabase-js@2";
import webPush from "npm:web-push@3.6.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service environment is not configured.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});
const adminEmails = new Set(["ranojitjyoti@gmail.com", "connect@deeplinkdata.com"]);
const allowedOrigins = new Set([
    "https://www.deeplinkdata.com",
    "https://deeplinkdata.com",
    "http://localhost:8765",
    "http://127.0.0.1:8765",
]);
const encoder = new TextEncoder();

function corsHeaders(origin: string | null): Record<string, string> {
    return {
        ...(origin && allowedOrigins.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
        "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Vary": "Origin",
    };
}

function respond(request: Request, status: number, body: Record<string, unknown>): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders(request.headers.get("origin")), "Content-Type": "application/json" },
    });
}

function roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeItems(value: unknown): Array<{
    name: string;
    quantity: number;
    unit: string | null;
    unit_price: number | null;
}> | null {
    if (!Array.isArray(value) || value.length < 1 || value.length > 200) return null;

    const items = [];
    for (const rawItem of value) {
        if (typeof rawItem !== "object" || rawItem === null) return null;
        const item = rawItem as Record<string, unknown>;
        const name = typeof item.name === "string" ? item.name.trim() : "";
        const quantity = item.quantity;
        const unit = item.unit === null || item.unit === undefined
            ? null
            : typeof item.unit === "string" ? item.unit.trim() : "";
        const unitPrice = item.unitPrice;

        if (!name || name.length > 120 || !Number.isInteger(quantity) || Number(quantity) < 1 || Number(quantity) > 5) {
            return null;
        }
        if (unit !== null && unit.length > 40) return null;
        if (unitPrice !== null
            && (typeof unitPrice !== "number" || !Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 1000000)) {
            return null;
        }

        items.push({
            name,
            quantity: Number(quantity),
            unit,
            unit_price: unitPrice,
        });
    }
    return items;
}

async function getRateLimitHash(request: Request): Promise<string | null> {
    const ip = request.headers.get("cf-connecting-ip")
        ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (!ip) return null;

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(serviceRoleKey),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(ip));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function isAllowedOrderRate(request: Request): Promise<boolean> {
    const ipHash = await getRateLimitHash(request);
    if (!ipHash) return true;

    const { data, error } = await supabaseAdmin.rpc("consume_cakes_order_rate_limit", {
        p_ip_hash: ipHash,
    });
    if (error) throw error;
    return data === true;
}

async function getAdminUser(request: Request) {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return null;

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user?.email || !adminEmails.has(data.user.email.toLocaleLowerCase())) return null;
    return data.user;
}

function pushConfigured(): boolean {
    return Boolean(
        Deno.env.get("VAPID_PUBLIC_KEY")
        && Deno.env.get("VAPID_PRIVATE_KEY")
        && Deno.env.get("VAPID_SUBJECT"),
    );
}

async function sendOrderNotifications(order: {
    id: string;
    items: Array<{ quantity: number }>;
    total: number;
}): Promise<void> {
    if (!pushConfigured()) {
        console.warn("Cakes order was saved, but Web Push VAPID secrets are not configured.");
        return;
    }

    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const privateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const subject = Deno.env.get("VAPID_SUBJECT")!;
    try {
        webPush.setVapidDetails(subject, publicKey, privateKey);
    } catch (error) {
        console.error("Cakes order VAPID settings are invalid:", error);
        return;
    }

    const { data: subscriptions, error } = await supabaseAdmin
        .from("cakes_order_push_subscriptions")
        .select("endpoint, p256dh, auth_key");
    if (error) {
        console.error("Could not load Cakes order push subscriptions:", error.message);
        return;
    }

    const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const payload = JSON.stringify({
        title: "New Cakes order",
        body: `${quantity} item${quantity === 1 ? "" : "s"} · ₹${Number(order.total).toLocaleString("en-IN")}`,
        orderId: order.id,
    });

    await Promise.all((subscriptions ?? []).map(async subscription => {
        try {
            await webPush.sendNotification({
                endpoint: subscription.endpoint,
                keys: { p256dh: subscription.p256dh, auth: subscription.auth_key },
            }, payload, { TTL: 60 });
        } catch (error) {
            const statusCode = typeof error === "object" && error !== null && "statusCode" in error
                ? (error as { statusCode?: unknown }).statusCode
                : undefined;
            if (statusCode === 404 || statusCode === 410) {
                const { error: deleteError } = await supabaseAdmin
                    .from("cakes_order_push_subscriptions")
                    .delete()
                    .eq("endpoint", subscription.endpoint);
                if (deleteError) console.error("Could not remove expired push subscription:", deleteError.message);
            } else {
                console.error("Could not deliver a Cakes order push notification:", error);
            }
        }
    }));
}

Deno.serve(async request => {
    const origin = request.headers.get("origin");
    if (request.method === "OPTIONS") {
        if (origin && !allowedOrigins.has(origin)) return new Response(null, { status: 403 });
        return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") return respond(request, 405, { error: "Method not allowed." });
    if (origin && !allowedOrigins.has(origin)) return respond(request, 403, { error: "Origin is not allowed." });

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 50000) return respond(request, 413, { error: "Request is too large." });

    let body: Record<string, unknown>;
    try {
        const parsed: unknown = await request.json();
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            return respond(request, 400, { error: "Invalid request body." });
        }
        body = parsed as Record<string, unknown>;
    } catch {
        return respond(request, 400, { error: "Invalid JSON request body." });
    }

    if (body.action === "create-order") {
        const items = normalizeItems(body.items);
        if (!items) return respond(request, 400, { error: "The order items are invalid." });

        try {
            if (!await isAllowedOrderRate(request)) {
                return respond(request, 429, { error: "Too many orders were submitted. Please try again shortly." });
            }

            const subtotal = roundMoney(items.reduce(
                (sum, item) => sum + (item.unit_price === null ? 0 : item.quantity * item.unit_price),
                0,
            ));
            const deliveryCharge = subtotal > 0 && subtotal < 100 ? 10 : 0;
            const total = roundMoney(subtotal + deliveryCharge);
            const hasUnpricedItems = items.some(item => item.unit_price === null);
            const { data: order, error } = await supabaseAdmin
                .from("cakes_orders")
                .insert({
                    items,
                    subtotal,
                    delivery_charge: deliveryCharge,
                    total,
                    has_unpriced_items: hasUnpricedItems,
                })
                .select("id, items, total")
                .single();
            if (error) throw error;

            await sendOrderNotifications(order);
            return respond(request, 201, { orderId: order.id });
        } catch (error) {
            console.error("Could not create Cakes order:", error);
            return respond(request, 500, { error: "The order could not be saved to the management inbox." });
        }
    }

    if (body.action === "push-key") {
        if (!Deno.env.get("VAPID_PUBLIC_KEY")) {
            return respond(request, 503, { error: "Web Push is not configured on the server." });
        }
        return respond(request, 200, { publicKey: Deno.env.get("VAPID_PUBLIC_KEY") });
    }

    if (body.action === "subscribe" || body.action === "unsubscribe") {
        const user = await getAdminUser(request);
        if (!user) return respond(request, 403, { error: "An authorized Cakes administrator must sign in." });

        if (body.action === "subscribe") {
            const subscription = body.subscription;
            if (typeof subscription !== "object" || subscription === null || Array.isArray(subscription)) {
                return respond(request, 400, { error: "The push subscription is invalid." });
            }
            const value = subscription as Record<string, unknown>;
            const keys = typeof value.keys === "object" && value.keys !== null
                ? value.keys as Record<string, unknown>
                : {};
            if (typeof value.endpoint !== "string"
                || !value.endpoint.startsWith("https://")
                || typeof keys.p256dh !== "string"
                || typeof keys.auth !== "string") {
                return respond(request, 400, { error: "The push subscription is incomplete." });
            }

            const { error } = await supabaseAdmin
                .from("cakes_order_push_subscriptions")
                .upsert({
                    user_id: user.id,
                    endpoint: value.endpoint,
                    p256dh: keys.p256dh,
                    auth_key: keys.auth,
                }, { onConflict: "endpoint" });
            if (error) {
                console.error("Could not save Cakes order push subscription:", error.message);
                return respond(request, 500, { error: "The push subscription could not be saved." });
            }
            return respond(request, 200, { subscribed: true });
        }

        if (typeof body.endpoint !== "string" || !body.endpoint.startsWith("https://")) {
            return respond(request, 400, { error: "The push endpoint is invalid." });
        }
        const { error } = await supabaseAdmin
            .from("cakes_order_push_subscriptions")
            .delete()
            .eq("endpoint", body.endpoint)
            .eq("user_id", user.id);
        if (error) {
            console.error("Could not remove Cakes order push subscription:", error.message);
            return respond(request, 500, { error: "The push subscription could not be removed." });
        }
        return respond(request, 200, { subscribed: false });
    }

    return respond(request, 400, { error: "Unknown action." });
});
