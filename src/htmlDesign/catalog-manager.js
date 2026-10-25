import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

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
    });

    // Inject new products (keys starting with "new:" for this pageId)
    const newEntries = Object.entries(catalog).filter(([k, v]) =>
        k.startsWith(`new:${pageId}:`) && v.available !== false
    );
    if (!newEntries.length) return;

    // Find or create a section to append new products
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
        card.innerHTML = `
            ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" loading="lazy">` : `<div class="product-placeholder">🎂</div>`}
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

function createProductRow(record, override, canEdit) {
    const row = document.createElement('article');
    row.className = 'product-row';
    row.dataset.key = record.key;

    const heading = document.createElement('div');
    heading.className = 'product-heading';
    const image = document.createElement('img');
    image.className = 'product-image';
    image.alt = '';
    image.loading = 'lazy';
    if (record.imageUrl) image.src = record.imageUrl;
    else image.hidden = true;
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
    const availabilityBtn = document.createElement('button');
    availabilityBtn.className = 'product-availability toggle-btn';
    availabilityBtn.type = 'button';
    availabilityBtn.dataset.state = isAvailable ? 'on' : 'off';
    availabilityBtn.textContent = isAvailable ? '✔ Visible' : '✖ Hidden';
    availabilityBtn.disabled = !canEdit;
    availabilityBtn.addEventListener('click', () => {
        const on = availabilityBtn.dataset.state !== 'on';
        availabilityBtn.dataset.state = on ? 'on' : 'off';
        availabilityBtn.textContent = on ? '✔ Visible' : '✖ Hidden';
        markDirty();
    });

    const controls = document.createElement('div');
    controls.className = 'row-actions';
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'save-product';
    saveButton.textContent = 'Save';
    saveButton.disabled = !canEdit;
    saveButton.style.background = '#64756a';
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'reset-product';
    resetButton.textContent = 'Reset';
    resetButton.disabled = !canEdit;
    controls.append(saveButton, resetButton);

    const origName = override?.name ?? record.name;
    const origPrice = String(override?.price ?? record.price);
    const origState = isAvailable ? 'on' : 'off';

    function markDirty() {
        const changed = nameInput.value.trim() !== origName ||
            priceInput.value !== origPrice ||
            availabilityBtn.dataset.state !== origState;
        saveButton.style.background = changed ? '#c47c00' : '#64756a';
        saveButton.textContent = changed ? 'Save ●' : 'Save';
    }

    nameInput.addEventListener('input', markDirty);
    priceInput.addEventListener('input', markDirty);

    row.append(heading, createField('Product name', nameInput), createField('Price (₹)', priceInput), availabilityBtn, controls);
    return row;
}

function flashSaved(btn) {
    if (!btn) return;
    btn.textContent = '✔ Saved';
    btn.style.background = '#2e8b57';
    setTimeout(() => { btn.textContent = 'Save'; btn.style.background = '#64756a'; }, 2000);
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
    const pageRecords = {};
    let catalog = {};
    let canEdit = false;
    let pagesLoaded = false;

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
        productList.replaceChildren(...records.map(r => createProductRow(r, catalog[r.key], canEdit)));
        count.textContent = `${records.length} products`;
        resetAll.disabled = !canEdit;
        toggleNonfood.disabled = !canEdit;
        const nonfoodRecords = (pageRecords[page.id] ?? []).filter(r => r.category.includes('Non-Food Items and Packaging'));
        const allHidden = nonfoodRecords.length > 0 && nonfoodRecords.every(r => (catalog[r.key]?.available ?? true) === false);
        toggleNonfood.textContent = allHidden ? 'Show all non-food' : 'Hide all non-food';
    }

    async function saveRow(row) {
        const key = row.dataset.key;
        const nameInput = row.querySelector('.product-name');
        const priceInput = row.querySelector('.product-price');
        const availBtn = row.querySelector('.product-availability');
        if (!nameInput.reportValidity() || !priceInput.reportValidity()) return;
        const name = nameInput.value.trim();
        const price = Number(priceInput.value);
        if (!name || name.length > 120 || !Number.isFinite(price) || price < 0) {
            setStatus('Enter a valid name and non-negative price.', true); return;
        }
        const record = pageRecords[pageSelect.value].find(r => r.key === key);
        if (!record) throw new Error('Product not found.');
        const available = availBtn.dataset.state === 'on';
        if (name === record.name && price === record.price && available) {
            const { error } = await supabase.from(TABLE).delete().eq('product_key', key);
            if (error) throw error;
            delete catalog[key];
        } else {
            const { error } = await supabase.from(TABLE).upsert({ product_key: key, name, price, available, updated_at: new Date().toISOString() });
            if (error) throw error;
            catalog[key] = { name, price, available };
        }
        setStatus(`Saved "${name}".`);
        renderProducts();
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

    productList.addEventListener('click', async e => {
        const button = e.target.closest('button');
        const row = button?.closest('.product-row');
        if (!row || !canEdit) return;
        try {
            if (button.classList.contains('save-product')) {
                await saveRow(row);
                flashSaved(row.querySelector('.save-product'));
            } else if (button.classList.contains('reset-product')) {
                const { error } = await supabase.from(TABLE).delete().eq('product_key', row.dataset.key);
                if (error) throw error;
                delete catalog[row.dataset.key];
                setStatus('Product restored to original.');
                renderProducts();
            }
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not save changes.', true);
        }
    });

    pageSelect.addEventListener('change', renderProducts);
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
        const targetPage = newPageSelect.value; // 'both', 'cakes', 'order-cakes'
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
