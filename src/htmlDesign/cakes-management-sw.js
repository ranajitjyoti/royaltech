self.addEventListener('push', event => {
    let payload = {};
    if (event.data) {
        try {
            payload = event.data.json();
        } catch (error) {
            console.error('Could not read the Cakes order notification payload.', error);
        }
    }

    const title = typeof payload.title === 'string' ? payload.title : 'New Cakes order';
    const body = typeof payload.body === 'string' ? payload.body : 'Open Cakes Management to view the order.';
    event.waitUntil(self.registration.showNotification(title, {
        body,
        icon: '/image/icon1.png',
        badge: '/image/icon1.png',
        tag: typeof payload.orderId === 'string' ? `cakes-order-${payload.orderId}` : 'cakes-order',
        data: { url: new URL('./cakes-management.html?orders=1', self.registration.scope).href },
    }));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = new URL('./cakes-management.html?orders=1', self.registration.scope).href;
    event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        const existingClient = windowClients.find(client => client.url.startsWith(self.registration.scope));
        if (existingClient) {
            return existingClient.navigate(url).then(() => existingClient.focus());
        }
        return self.clients.openWindow(url);
    }));
});
