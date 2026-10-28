import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';
import { installCatalogAdditions, resolveProductImage } from './catalog-additions.js';

const SUPABASE_URL = 'https://flsfsjtyfrpdbhyauxeg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_B65tKRHEWcEnjZkfb9wvMg_u7YSmsPy';
const TABLE = 'catalog_overrides';
const STORAGE_BUCKET = 'product-images';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const PAGES = [
    { id: 'cakes', file: 'cakes.html', label: 'Cakes page' },
    { id: 'order-cakes', file: 'order-cakes.html', label: 'Order cakes page' }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeName(name) {
    return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function formatPrice(price) {
    return `₹ ${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getProductRecords(root, pageId) {
    const occurrences = new Map();
    return [...root.querySelectorAll('.cake-card')].map(card => {
        const name = card.querySelector('h3')?.textContent.trim();
        const priceText = card.querySelector('.cake-price')?.textContent ?? '';
        const price = Number(priceText.replace(/[^\d.]/g, ''));
        if (!name || !Number.isFinite(price)) throw new Error(`Missing name or price in ${pageId}`);
        const norm = normalizeName(name);
        const occ = occurrences.get(norm) ?? 0;
        occurrences.set(norm, occ + 1);
        return {
            key: `${pageId}:${encodeURIComponent(norm)}:${occ}`,
            name,
            price,
            imageUrl: card.querySelector('img')?.getAttribute('src') ?? '',
            category: card.closest('.gallery-section')?.querySelector('.group-header h2')?.textContent.trim() ?? 'Products'
        };
    });
}

async function fetchCatalog() {
    const { data, error } = await supabase.from(TABLE).select('product_key, name, price, available, image_url, category');
    if (error) throw error;
    return Object.fromEntries(data.map(p => [p.product_key, { name: p.name, price: Number(p.price), available: p.available, imageUrl: p.image_url ?? '', category: p.category ?? '' }]));
}

// ─── Customer page ────────────────────────────────────────────────────────────

async function applyCustomerCatalog() {
    installCatalogAdditions(document);
    const pageId = location.pathname.toLocaleLowerCase().endsWith('/order-cakes.html') ? 'order-cakes' : 'cakes';
    const catalog = await fetchCatalog();
    const cards = [...document.querySelectorAll('.cake-card')];
    const records = getProductRecords(document, pageId);

    records.forEach((record, i) => {
        const override = catalog[record.key];
        const card = cards[i];
        if (!card) return;
        if (override) {
            card.querySelector('h3').textContent = override.name;
            card.querySelector('.cake-price').textContent = formatPrice(override.price);
            if (!override.available) {
                card.style.setProperty('display', 'none', 'important');
            } else {
                card.style.removeProperty('display');
            }
        } else {
            card.style.removeProperty('display');
        }
        const displayName = override?.name ?? record.name;
        const imageSrc = override?.imageUrl || record.imageUrl;
        let image = card.querySelector('img');
        if (!image) {
            const placeholder = card.querySelector('.product-placeholder');
            image = document.createElement('img');
            image.alt = displayName;
            image.loading = 'lazy';
            if (placeholder) placeholder.replaceWith(image);
            else card.prepend(image);
        }
        image.src = imageSrc && !/product-placeholder/i.test(imageSrc)
            ? imageSrc
            : resolveProductImage(displayName);
        image.alt = displayName;
        image.hidden = false;
    });

    const newEntries = Object.entries(catalog).filter(([k, v]) =>
        k.startsWith(`new:${pageId}:`) && v.available !== false
    );
    if (!newEntries.length) return;

    let newSection = document.getElementById('new-products-section');
    if (!newSection) {
        newSection = document.createElement('section');
        newSection.id = 'new-products-section';
        newSection.className = 'gallery-section';
        newSection.style.cssText = 'padding-top:0; background:#e8f5ee;';
        newSection.innerHTML = `
            <div class="container" style="padding-top:clamp(36px,6vw,70px);">
                <div class="group-header" onclick="toggleGroup(this)">
                    <h2>✦ New Products</h2>
                    <span class="group-toggle">▼</span>
                </div>
                <div class="group-body"><div class="gallery-grid" id="new-products-grid"></div></div>
            </div>`;
        document.querySelector('.location-section')?.before(newSection);
    }
    const grid = newSection.querySelector('#new-products-grid');
    grid.innerHTML = '';
    newEntries.forEach(([, p]) => {
        const card = document.createElement('div');
        card.className = 'cake-card';
        const imageSrc = p.imageUrl && !/product-placeholder/i.test(p.imageUrl)
            ? p.imageUrl
            : resolveProductImage(p.name);
        card.innerHTML = `
            <img src="${imageSrc}" alt="${p.name}" loading="lazy">
            <div class="cake-info">
                <h3>${p.name}</h3>
                ${p.category ? `<p style="font-size:0.75rem;color:#718777;">${p.category}</p>` : ''}
                <p class="cake-price">${formatPrice(p.price)}</p>
            </div>
            <div class="cake-cart"><button class="btn-add-cart">Add to Cart</button><div class="qty-controls"><button class="qty-btn qty-minus">&#8722;</button><span class="qty-num">1</span><button class="qty-btn qty-plus">+</button></div></div>`;
        grid.appendChild(card);
    });
}

// ─── Admin panel ──────────────────────────────────────────────────────────────

function createField(labelText, input) {
    const label = document.createElement('label');
    label.className = 'field';
    const span = document.createElement('span');
    span.textContent = labelText;
    label.append(span, input);
    return label;
}

function createProductRow(record, override, canEdit, pendingChanges, updateSaveAllBtn) {
    const row = document.createElement('article');
    row.className = 'product-row';
    row.dataset.key = record.key;

    const heading = document.createElement('div');
    heading.className = 'product-heading';
    const image = document.createElement('img');
    image.className = 'product-image';
    image.alt = '';
    image.loading = 'lazy';
    const imageUrl = override?.imageUrl || record.imageUrl;
    image.src = imageUrl && !/product-placeholder/i.test(imageUrl)
        ? imageUrl
        : resolveProductImage(override?.name || record.name);
    image.alt = override?.name || record.name;
    const productTitle = document.createElement('div');
    const category = document.createElement('span');
    category.className = 'product-category';
    category.textContent = record.category;
    const originalName = document.createElement('strong');
    originalName.textContent = record.name;
    productTitle.append(category, originalName);
    heading.append(image, productTitle);

    const nameInput = document.createElement('input');
    nameInput.className = 'product-name';
    nameInput.type = 'text';
    nameInput.required = true;
    nameInput.maxLength = 120;
    nameInput.value = override?.name ?? record.name;
    nameInput.disabled = !canEdit;

    const priceInput = document.createElement('input');
    priceInput.className = 'product-price';
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '0.01';
    priceInput.required = true;
    priceInput.value = String(override?.price ?? record.price);
    priceInput.disabled = !canEdit;

    const isAvailable = override?.available ?? true;
    const origState = isAvailable ? 'on' : 'off';

    const availabilityBtn = document.createElement('button');
    availabilityBtn.className = 'product-availability toggle-btn';
    availabilityBtn.type = 'button';
    availabilityBtn.dataset.state = origState;
    availabilityBtn.textContent = isAvailable ? '✔ Visible' : '✖ Hidden';
    availabilityBtn.disabled = !canEdit;
    availabilityBtn.addEventListener('click', () => {
        const on = availabilityBtn.dataset.state !== 'on';
        availabilityBtn.dataset.state = on ? 'on' : 'off';
        availabilityBtn.textContent = on ? '✔ Visible' : '✖ Hidden';
        if (availabilityBtn.dataset.state !== origState) {
            pendingChanges.set(record.key, on);
        } else {
            pendingChanges.delete(record.key);
        }
        updateSaveAllBtn();
    });

    row.append(heading, createField('Product name', nameInput), createField('Price (₹)', priceInput), availabilityBtn);
    return row;
}

async function startAdmin() {
    const pageSelect = document.getElementById('catalog-page');
    const searchInput = document.getElementById('product-search');
    const productList = document.getElementById('product-list');
    const status = document.getElementById('catalog-status');
    const count = document.getElementById('product-count');
    const resetAll = document.getElementById('reset-all');
    const toggleNonfood = document.getElementById('toggle-nonfood');
    const loginForm = document.getElementById('admin-login');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const logoutButton = document.getElementById('admin-logout');
    const adminPanel = document.getElementById('admin-panel');
    const saveAllBtn = document.getElementById('save-all-visibility');
    const pageRecords = {};
    const pendingChanges = new Map(); // key -> available (boolean)
    let catalog = {};
    let canEdit = false;
    let pagesLoaded = false;

    function updateSaveAllBtn() {
        saveAllBtn.disabled = !canEdit || pendingChanges.size === 0;
        saveAllBtn.textContent = pendingChanges.size > 0
            ? `Save All Visibility (${pendingChanges.size})`
            : 'Save All Visibility';
    }

    function setStatus(msg, isError = false) {
        status.textContent = msg;
        status.classList.toggle('error', isError);
    }

    async function loadPages() {
        for (const page of PAGES) {
            const pageUrl = new URL(page.file, location.href);
            const res = await fetch(pageUrl);
            if (!res.ok) throw new Error(`Could not load ${page.file} (HTTP ${res.status}).`);
            const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
            installCatalogAdditions(doc);
            pageRecords[page.id] = getProductRecords(doc, page.id);
            if (!pageRecords[page.id].length) throw new Error(`No products found in ${page.file}.`);
        }
    }

    function renderProducts() {
        if (!pagesLoaded) return;
        const page = PAGES.find(p => p.id === pageSelect.value);
        const query = searchInput.value.trim().toLocaleLowerCase();
        const records = pageRecords[page.id].filter(r => {
            const override = catalog[r.key];
            return `${override?.name ?? r.name} ${r.category}`.toLocaleLowerCase().includes(query);
        });
        productList.replaceChildren(...records.map(r => createProductRow(r, catalog[r.key], canEdit, pendingChanges, updateSaveAllBtn)));
        count.textContent = `${records.length} products`;
        resetAll.disabled = !canEdit;
        toggleNonfood.disabled = !canEdit;
        updateSaveAllBtn();
        const nonfoodRecords = (pageRecords[page.id] ?? []).filter(r => r.category.includes('Non-Food Items and Packaging'));
        const allHidden = nonfoodRecords.length > 0 && nonfoodRecords.every(r => (catalog[r.key]?.available ?? true) === false);
        toggleNonfood.textContent = allHidden ? 'Show all non-food' : 'Hide all non-food';
    }

    function updateAuthUI(session) {
        canEdit = Boolean(session?.user && session.user.email?.toLocaleLowerCase() === 'ranojitjyoti@gmail.com');
        loginForm.hidden = canEdit;
        adminPanel.hidden = !canEdit;
        if (canEdit) renderProducts();
        if (session && !canEdit) setStatus('This account is not authorized.', true);
        else if (!canEdit) setStatus('');
    }

    loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        setStatus('Signing in…');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput.value.trim(), password: passwordInput.value });
            if (error) throw error;
            passwordInput.value = '';
            if (!pagesLoaded) {
                setStatus('Loading catalog…');
                await loadPages();
                pagesLoaded = true;
            }
            updateAuthUI(data.session);
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not sign in.', true);
        }
    });

    logoutButton.addEventListener('click', async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            updateAuthUI(null);
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not sign out.', true);
        }
    });

    saveAllBtn.addEventListener('click', async () => {
        if (!canEdit || pendingChanges.size === 0) return;
        saveAllBtn.disabled = true;
        saveAllBtn.textContent = 'Saving…';
        try {
            for (const [key, available] of pendingChanges) {
                const pageId = key.startsWith('new:') ? key.split(':')[1] : key.split(':')[0];
                const record = (pageRecords[pageId] ?? []).find(r => r.key === key);
                if (!record) continue;
                const name = catalog[key]?.name ?? record.name;
                const price = catalog[key]?.price ?? record.price;
                if (available && !catalog[key]) {
                    // was already default visible, no override needed — skip
                } else {
                    const { error } = await supabase.from(TABLE).upsert({ product_key: key, name, price, available, updated_at: new Date().toISOString() });
                    if (error) throw error;
                    catalog[key] = { ...(catalog[key] ?? {}), name, price, available };
                }
            }
            setStatus(`Saved visibility for ${pendingChanges.size} product(s).`);
            pendingChanges.clear();
            renderProducts();
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not save changes.', true);
            updateSaveAllBtn();
        }
    });

    pageSelect.addEventListener('change', () => { pendingChanges.clear(); renderProducts(); });
    searchInput.addEventListener('input', renderProducts);

    // ─── Add New Product ──────────────────────────────────────────────────────
    const addForm = document.getElementById('add-product-form');
    const newNameInput = document.getElementById('new-product-name');
    const newPriceInput = document.getElementById('new-product-price');
    const newCategoryInput = document.getElementById('new-product-category');
    const newPageSelect = document.getElementById('new-product-page');
    const newImageInput = document.getElementById('new-product-image');
    const newImagePreview = document.getElementById('new-image-preview');
    const newImageSize = document.getElementById('new-image-size');

    newImageInput.addEventListener('change', () => {
        const file = newImageInput.files[0];
        if (!file) { newImagePreview.hidden = true; newImageSize.textContent = ''; return; }
        if (file.size > 500 * 1024) {
            newImageSize.textContent = `⚠ File too large (${(file.size / 1024).toFixed(0)} KB). Max 500 KB.`;
            newImageInput.value = '';
            newImagePreview.hidden = true;
            return;
        }
        newImageSize.textContent = `${(file.size / 1024).toFixed(0)} KB`;
        newImagePreview.src = URL.createObjectURL(file);
        newImagePreview.hidden = false;
    });

    addForm.addEventListener('submit', async e => {
        e.preventDefault();
        if (!canEdit) return;
        const name = newNameInput.value.trim();
        const price = Number(newPriceInput.value);
        const category = newCategoryInput.value.trim();
        const targetPage = newPageSelect.value;
        if (!name || !Number.isFinite(price) || price < 0) {
            setStatus('Enter a valid name and price.', true); return;
        }
        const submitBtn = addForm.querySelector('.btn-add-product');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding…';
        try {
            let imageUrl = '';
            const file = newImageInput.files[0];
            if (file) {
                const ext = file.name.split('.').pop();
                const path = `${Date.now()}-${encodeURIComponent(normalizeName(name))}.${ext}`;
                const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: true });
                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
                    imageUrl = urlData.publicUrl;
                }
            }
            if (!imageUrl) imageUrl = resolveProductImage(name);
            const pageIds = targetPage === 'both' ? ['cakes', 'order-cakes'] : [targetPage];
            for (const pageId of pageIds) {
                const norm = normalizeName(name);
                const key = `new:${pageId}:${encodeURIComponent(norm)}:${Date.now()}`;
                const { error } = await supabase.from(TABLE).upsert({
                    product_key: key, name, price, available: true,
                    image_url: imageUrl, category,
                    updated_at: new Date().toISOString()
                });
                if (error) throw error;
                catalog[key] = { name, price, available: true, imageUrl, category };
                if (!pageRecords[pageId]) pageRecords[pageId] = [];
                pageRecords[pageId].push({ key, name, price, imageUrl, category });
            }
            setStatus(`Added "${name}" successfully.`);
            addForm.reset();
            newImagePreview.hidden = true;
            newImageSize.textContent = '';
            renderProducts();
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not add product.', true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '+ Add Product';
        }
    });

    resetAll.addEventListener('click', async () => {
        if (!canEdit || !window.confirm('Reset all changes for both catalogs?')) return;
        try {
            const { error } = await supabase.from(TABLE).delete().not('product_key', 'is', null);
            if (error) throw error;
            catalog = {};
            pendingChanges.clear();
            setStatus('All catalog changes reset.');
            renderProducts();
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not reset.', true);
        }
    });

    toggleNonfood.addEventListener('click', async () => {
        if (!canEdit) return;
        const pageId = pageSelect.value;
        const nonfoodRecords = (pageRecords[pageId] ?? []).filter(r => r.category.includes('Non-Food Items and Packaging'));
        if (!nonfoodRecords.length) { setStatus('No non-food items found.', true); return; }
        const allHidden = nonfoodRecords.every(r => (catalog[r.key]?.available ?? true) === false);
        const newAvailable = allHidden;
        try {
            for (const record of nonfoodRecords) {
                if (newAvailable) {
                    const { error } = await supabase.from(TABLE).delete().eq('product_key', record.key);
                    if (error) throw error;
                    delete catalog[record.key];
                } else {
                    const override = { name: catalog[record.key]?.name ?? record.name, price: catalog[record.key]?.price ?? record.price, available: false };
                    const { error } = await supabase.from(TABLE).upsert({ product_key: record.key, ...override, updated_at: new Date().toISOString() });
                    if (error) throw error;
                    catalog[record.key] = override;
                }
            }
            setStatus(`Non-food items ${newAvailable ? 'shown' : 'hidden'}.`);
            renderProducts();
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not update non-food visibility.', true);
        }
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user && !pagesLoaded) {
            try { await loadPages(); pagesLoaded = true; } catch (_) {}
        }
        updateAuthUI(session);
    });

    try {
        const [{ data: { session }, error: sessionError }, loadedCatalog] = await Promise.all([
            supabase.auth.getSession(),
            fetchCatalog()
        ]);
        if (sessionError) throw sessionError;
        catalog = loadedCatalog;
        if (session?.user) {
            try { await loadPages(); pagesLoaded = true; } catch (err) {
                setStatus(err instanceof Error ? err.message : 'Could not load catalog pages.', true);
            }
        }
        updateAuthUI(session);
    } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Could not connect to Supabase.', true);
    }
}

if (document.getElementById('catalog-manager')) {
    startAdmin();
} else {
    applyCustomerCatalog().catch(err => console.error('Catalog error:', err));
}
