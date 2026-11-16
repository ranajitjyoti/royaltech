const SUPABASE_URL = 'https://flsfsjtyfrpdbhyauxeg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_B65tKRHEWcEnjZkfb9wvMg_u7YSmsPy';

export async function savePendingCakesOrder(items) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/cakes-orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SUPABASE_PUBLISHABLE_KEY
            },
            body: JSON.stringify({ action: 'create-order', items }),
            signal: controller.signal
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `Order request failed (HTTP ${response.status}).`);
        if (typeof result.orderId !== 'string') throw new Error('The server did not confirm the saved order.');
        return result.orderId;
    } finally {
        window.clearTimeout(timeout);
    }
}
