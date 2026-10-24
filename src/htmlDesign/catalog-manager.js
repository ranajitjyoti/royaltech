import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

const SUPABASE_URL = 'https://flsfsjtyfrpdbhyauxeg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_B65tKRHEWcEnjZkfb9wvMg_u7YSmsPy';
const TABLE = 'catalog_overrides';
const PRODUCTS_TABLE = 'catalog_products';
const BUCKET = 'product-images';
const MAX_IMAGE_BYTES = 500 * 1024; // 500 KB
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const PAGES = [
    { id: 'cakes', file: 'cakes.html', label: 'Cakes page' },
    { id: 'order-cakes', file: 'order-cakes.html', label: 'Order cakes page' }
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function normalizeName(name) {
    return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function formatPrice(price) {
    return `₹ ${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getProductRecords(root, pageId, pageUrl) {
    const occurrences = new Map();
    return [...root.querySelectorAll('.cake-card')].map((card) => {
        const name = card.querySelector('h3')?.textContent.trim();
        const priceText = card.querySelector('.cake-price')?.textContent ?? '';
        const price = Number(priceText.replace(/[^\d.]/g, ''));
        if (!name || !Number.isFinite(price)) {
            throw new Error(`A product on ${pageUrl} is missing its name or a valid price.`);
        }
        const normalizedName = normalizeName(name);
        const occurrence = occurrences.get(normalizedName) ?? 0;
        occurrences.set(normalizedName, occurrence + 1);
        const key = `${pageId}:${encodeURIComponent(normalizedName)}:${occurrence}`;
        const image = card.querySelector('img')?.getAttribute('src');
        const sectionName = card.closest('.gallery-section')?.querySelector('.group-header h2')?.textContent.trim();
        // Keep image src as-is (relative) — resolved at display time by the browser
        return {
            key, name, price,
            imageUrl: image ?? '',
            category: sectionName || 'Products'
        };
    });
}

async function fetchCatalog() {
    const { data, error } = await supabase.from(TABLE).select('product_key, name, price, available');
    if (error) throw error;
    return Object.fromEntries(data.map((p) => [p.product_key, { name: p.name, price: Number(p.price), available: p.available }]));
}

async function fetchAdminProducts() {
    const { data, error } = await supabase.from(PRODUCTS_TABLE).select('*').order('sort_order').order('created_at');
    if (error) {
        // Table may not exist yet — return empty gracefully
        console.warn('catalog_products table not ready:', error.message);
        return [];
    }
    return data;
}

// ─── Customer / Shopkeeper page ───────────────────────────────────────────────

function buildCakeCard(product, isCustomer) {
    const card = document.createElement('div');
    card.className = 'cake-card';
    if (isCustomer && !product.available) { card.hidden = true; }

    const imgHtml = product.image_url
        ? `<img src="${product.image_url}" alt="${product.name}" loading="lazy">`
        : `<div class="product-placeholder">🎂</div>`;

    card.innerHTML = `
        ${imgHtml}
        <div class="cake-info">
            <h3>${product.name}</h3>
            <p>${product.description || ''}</p>
            <p class="cake-price">${formatPrice(product.price)}</p>
        </div>
        <div class="cake-cart">
            <button class="btn-add-cart">Add to Cart</button>
            <div class="qty-controls">
                <button class="qty-btn qty-minus">&#8722;</button>
                <span class="qty-num">1</span>
                <button class="qty-btn qty-plus">+</button>
            </div>
        </div>`;
    return card;
}

function injectAdminProducts(products, pageId, isCustomer) {
    // Group by category, inject into matching gallery-section or create new one
    const byCategory = {};
    for (const p of products) {
        if (p.page !== 'both' && p.page !== pageId) continue;
        (byCategory[p.category] = byCategory[p.category] || []).push(p);
    }

    for (const [category, items] of Object.entries(byCategory)) {
        // Find existing section by matching h2 text
        let section = [...document.querySelectorAll('.gallery-section')].find(
            s => s.querySelector('.group-header h2')?.textContent.trim() === category
        );

        if (section) {
            const grid = section.querySelector('.gallery-grid');
            if (grid) items.forEach(p => grid.appendChild(buildCakeCard(p, isCustomer)));
        } else {
            // Create a new section for this category
            const newSection = document.createElement('section');
            newSection.className = 'gallery-section';
            newSection.dataset.adminSection = 'true';
            newSection.style.cssText = 'padding-top:0;';
            newSection.innerHTML = `
                <div class="container">
                    <div class="group-header" onclick="toggleGroup(this)">
                        <h2>${category}</h2>
                        <span class="group-toggle">▼</span>
                    </div>
                    <div class="group-body"><div class="gallery-grid"></div></div>
                </div>`;
            const grid = newSection.querySelector('.gallery-grid');
            items.forEach(p => grid.appendChild(buildCakeCard(p, isCustomer)));
            // Insert before location section or at end of main content
            const locationSection = document.querySelector('.location-section');
            if (locationSection) locationSection.before(newSection);
            else document.querySelector('.gallery-section')?.parentNode?.appendChild(newSection);
        }
    }
}

async function applyCustomerCatalog() {
    const isOrderPage = location.pathname.toLocaleLowerCase().endsWith('/order-cakes.html');
    const pageId = isOrderPage ? 'order-cakes' : 'cakes';
    const isCustomer = true;

    const [catalog, adminProducts] = await Promise.all([fetchCatalog(), fetchAdminProducts()]);

    // Apply overrides to existing HTML products
    const allCards = [...document.querySelectorAll('.cake-card')];
    const records = getProductRecords(document, pageId, location.href);

    console.log('[catalog-debug] pageId:', pageId);
    console.log('[catalog-debug] DB keys:', Object.keys(catalog));
    console.log('[catalog-debug] Page keys:', records.map(r => r.key));

    records.forEach((record, index) => {
        const override = catalog[record.key];
        const card = allCards[index];
        if (!card) return;
        if (override) {
            card.querySelector('h3').textContent = override.name;
            card.querySelector('.cake-price').textContent = formatPrice(override.price);
        }
        if (isCustomer) card.hidden = override ? !override.available : false;
    });

    // Inject admin-added products
    injectAdminProducts(adminProducts, pageId, isCustomer);
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
    nameInput.setAttribute('aria-label', `Name for ${record.name}`);

    const priceInput = document.createElement('input');
    priceInput.className = 'product-price';
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '0.01';
    priceInput.required = true;
    priceInput.value = String(override?.price ?? record.price);
    priceInput.disabled = !canEdit;
    priceInput.setAttribute('aria-label', `Price for ${record.name}`);

    const isAvailable = override?.available ?? true;
    const availabilityBtn = document.createElement('button');
    availabilityBtn.className = 'product-availability toggle-btn';
    availabilityBtn.type = 'button';
    availabilityBtn.dataset.state = isAvailable ? 'on' : 'off';
    availabilityBtn.textContent = isAvailable ? '✔ Visible' : '✖ Hidden';
    availabilityBtn.disabled = !canEdit;
    availabilityBtn.setAttribute('aria-label', `Show ${record.name} to customers`);
    availabilityBtn.addEventListener('click', () => {
        const on = availabilityBtn.dataset.state !== 'on';
        availabilityBtn.dataset.state = on ? 'on' : 'off';
        availabilityBtn.textContent = on ? '✔ Visible' : '✖ Hidden';
    });

    const controls = document.createElement('div');
    controls.className = 'row-actions';
    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'save-product';
    saveButton.textContent = 'Save';
    saveButton.disabled = !canEdit;
    saveButton.style.background = '#64756a'; // neutral grey — no changes yet
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'reset-product';
    resetButton.textContent = 'Reset';
    resetButton.disabled = !canEdit;
    controls.append(saveButton, resetButton);

    // Track original values to detect changes
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
    availabilityBtn.addEventListener('click', () => setTimeout(markDirty, 0));

    row.append(heading, createField('Product name', nameInput), createField('Price (₹)', priceInput), availabilityBtn, controls);
    return row;
}

function createAdminProductRow(product, canEdit, onDelete) {
    const row = document.createElement('article');
    row.className = 'product-row admin-product-row';
    row.dataset.id = product.id;
    row.style.borderLeft = '3px solid #7b5ea7';

    const heading = document.createElement('div');
    heading.className = 'product-heading';
    const image = document.createElement('img');
    image.className = 'product-image';
    image.alt = '';
    image.loading = 'lazy';
    if (product.image_url) image.src = product.image_url;
    else image.hidden = true;
    const productTitle = document.createElement('div');
    const category = document.createElement('span');
    category.className = 'product-category';
    category.textContent = `✦ ${product.category} · ${product.page === 'both' ? 'All pages' : product.page}`;
    const originalName = document.createElement('strong');
    originalName.textContent = product.name;
    productTitle.append(category, originalName);
    heading.append(image, productTitle);

    const nameInput = document.createElement('input');
    nameInput.className = 'product-name';
    nameInput.type = 'text';
    nameInput.required = true;
    nameInput.maxLength = 120;
    nameInput.value = product.name;
    nameInput.disabled = !canEdit;

    const priceInput = document.createElement('input');
    priceInput.className = 'product-price';
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '0.01';
    priceInput.required = true;
    priceInput.value = String(product.price);
    priceInput.disabled = !canEdit;

    const availabilityBtn = document.createElement('button');
    availabilityBtn.className = 'product-availability toggle-btn';
    availabilityBtn.type = 'button';
    availabilityBtn.dataset.state = product.available ? 'on' : 'off';
    availabilityBtn.textContent = product.available ? '✔ Visible' : '✖ Hidden';
    availabilityBtn.disabled = !canEdit;
    availabilityBtn.addEventListener('click', () => {
        const on = availabilityBtn.dataset.state !== 'on';
        availabilityBtn.dataset.state = on ? 'on' : 'off';
        availabilityBtn.textContent = on ? '✔ Visible' : '✖ Hidden';
    });

    const controls = document.createElement('div');
    controls.className = 'row-actions';
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'save-admin-product';
    saveBtn.textContent = 'Save';
    saveBtn.disabled = !canEdit;
    saveBtn.style.background = '#64756a';
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-admin-product';
    deleteBtn.textContent = 'Delete';
    deleteBtn.disabled = !canEdit;
    deleteBtn.style.background = '#9b3d3d';
    deleteBtn.addEventListener('click', () => onDelete(product.id, product.image_url));
    controls.append(saveBtn, deleteBtn);

    const origName = product.name;
    const origPrice = String(product.price);
    const origState = product.available ? 'on' : 'off';

    function markDirty() {
        const changed = nameInput.value.trim() !== origName ||
            priceInput.value !== origPrice ||
            availabilityBtn.dataset.state !== origState;
        saveBtn.style.background = changed ? '#c47c00' : '#64756a';
        saveBtn.textContent = changed ? 'Save ●' : 'Save';
    }

    nameInput.addEventListener('input', markDirty);
    priceInput.addEventListener('input', markDirty);
    availabilityBtn.addEventListener('click', () => setTimeout(markDirty, 0));

    row.append(heading, createField('Product name', nameInput), createField('Price (₹)', priceInput), availabilityBtn, controls);
    return row;
}

function flashSaved(btn) {
    if (!btn) return;
    btn.textContent = '✔ Saved';
    btn.style.background = '#2e8b57';
    setTimeout(() => {
        btn.textContent = 'Save';
        btn.style.background = '#64756a';
    }, 2000);
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
    const addProductForm = document.getElementById('add-product-form');
    const pageRecords = {};
    let catalog = {};
    let adminProducts = [];
    let canEdit = false;
    let pagesLoaded = false;

    function setStatus(message, isError = false) {
        status.textContent = message;
        status.classList.toggle('error', isError);
    }

    async function loadPages() {
        for (const page of PAGES) {
            const pageUrl = new URL(page.file, location.href);
            const response = await fetch(pageUrl);
            if (!response.ok) throw new Error(`Could not load ${page.file} (HTTP ${response.status}).`);
            const parsedPage = new DOMParser().parseFromString(await response.text(), 'text/html');
            pageRecords[page.id] = getProductRecords(parsedPage, page.id, pageUrl);
            if (!pageRecords[page.id].length) throw new Error(`No products were found in ${page.file}.`);
        }
    }

    function renderProducts() {
        if (!pagesLoaded) return;
        const page = PAGES.find((item) => item.id === pageSelect.value);
        const query = searchInput.value.trim().toLocaleLowerCase();

        const htmlRecords = pageRecords[page.id].filter((record) => {
            const override = catalog[record.key];
            return `${override?.name ?? record.name} ${record.category}`.toLocaleLowerCase().includes(query);
        });

        const adminRows = adminProducts
            .filter(p => (p.page === 'both' || p.page === page.id) && p.name.toLocaleLowerCase().includes(query))
            .map(p => createAdminProductRow(p, canEdit, deleteAdminProduct));

        productList.replaceChildren(
            ...htmlRecords.map(r => createProductRow(r, catalog[r.key], canEdit)),
            ...adminRows
        );

        count.textContent = `${htmlRecords.length + adminRows.length} products (${adminRows.length} admin-added)`;
        resetAll.disabled = !canEdit;
        toggleNonfood.disabled = !canEdit;

        const nonfoodRecords = (pageRecords[page.id] ?? []).filter(r => r.category.includes('Non-Food Items and Packaging'));
        const allHidden = nonfoodRecords.length > 0 && nonfoodRecords.every(r => (catalog[r.key]?.available ?? true) === false);
        toggleNonfood.textContent = allHidden ? 'Show all non-food' : 'Hide all non-food';
    }

    async function saveRow(row) {
        const recordKey = row.dataset.key;
        const nameInput = row.querySelector('.product-name');
        const priceInput = row.querySelector('.product-price');
        const availableInput = row.querySelector('.product-availability');
        if (!nameInput.reportValidity() || !priceInput.reportValidity()) return;

        const name = nameInput.value.trim();
        const price = Number(priceInput.value);
        if (!name || name.length > 120 || !Number.isFinite(price) || price < 0) {
            setStatus('Enter a product name (up to 120 characters) and a valid non-negative price.', true);
            return;
        }

        const record = pageRecords[pageSelect.value].find((item) => item.key === recordKey);
        if (!record) throw new Error('Product not found. Reload and try again.');

        const isChecked = availableInput.dataset.state === 'on';
        console.log('[save-debug] key:', recordKey, 'name:', name, 'price:', price, 'available:', isChecked);
        if (name === record.name && price === record.price && isChecked) {
            console.log('[save-debug] DELETING override');
            const { error } = await supabase.from(TABLE).delete().eq('product_key', recordKey);
            if (error) throw error;
            delete catalog[recordKey];
        } else {
            const override = { name, price, available: isChecked };
            console.log('[save-debug] UPSERTING override:', override);
            const { data: upsertData, error } = await supabase.from(TABLE).upsert({ product_key: recordKey, ...override, updated_at: new Date().toISOString() }).select();
            console.log('[save-debug] upsert result:', upsertData, error);
            if (error) throw error;
            catalog[recordKey] = override;
        }
        setStatus(`Saved "${name}".`);
        renderProducts();
    }

    async function saveAdminProductRow(row) {
        const id = row.dataset.id;
        const name = row.querySelector('.product-name').value.trim();
        const price = Number(row.querySelector('.product-price').value);
        const available = row.querySelector('.product-availability').dataset.state === 'on';
        if (!name || !Number.isFinite(price) || price < 0) {
            setStatus('Invalid name or price.', true); return;
        }
        const { error } = await supabase.from(PRODUCTS_TABLE).update({ name, price, available, updated_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        const idx = adminProducts.findIndex(p => p.id === id);
        if (idx !== -1) Object.assign(adminProducts[idx], { name, price, available });
        setStatus(`Saved "${name}".`);
        renderProducts();
    }

    async function deleteAdminProduct(id, imageUrl) {
        if (!window.confirm('Delete this product permanently?')) return;
        try {
            const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq('id', id);
            if (error) throw error;
            if (imageUrl) {
                const path = imageUrl.split(`/${BUCKET}/`)[1];
                if (path) await supabase.storage.from(BUCKET).remove([path]);
            }
            adminProducts = adminProducts.filter(p => p.id !== id);
            setStatus('Product deleted.');
            renderProducts();
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not delete product.', true);
        }
    }

    function updateAuthUI(session) {
        canEdit = Boolean(session?.user && session.user.email?.toLocaleLowerCase() === 'ranojitjyoti@gmail.com');
        loginForm.hidden = canEdit;
        adminPanel.hidden = !canEdit;
        if (canEdit) renderProducts();
        if (session && !canEdit) setStatus('This account is not authorized to edit the catalog.', true);
        else if (!canEdit) setStatus('');
    }

    // ── Add product form ──
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!canEdit) return;

        const nameVal = document.getElementById('new-product-name').value.trim();
        const descVal = document.getElementById('new-product-desc').value.trim();
        const priceVal = Number(document.getElementById('new-product-price').value);
        const categoryVal = document.getElementById('new-product-category').value.trim() || 'Products';
        const pageVal = document.getElementById('new-product-page').value;
        const fileInput = document.getElementById('new-product-image');
        const file = fileInput.files[0];

        if (!nameVal || !Number.isFinite(priceVal) || priceVal < 0) {
            setStatus('Enter a valid name and price.', true); return;
        }
        if (file && file.size > MAX_IMAGE_BYTES) {
            setStatus(`Image is ${(file.size / 1024).toFixed(0)} KB — must be 500 KB or less.`, true); return;
        }

        setStatus('Saving new product…');
        try {
            let imageUrl = '';
            if (file) {
                const ext = file.name.split('.').pop();
                const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
                imageUrl = urlData.publicUrl;
            }

            const { data, error } = await supabase.from(PRODUCTS_TABLE).insert({
                name: nameVal, description: descVal, price: priceVal,
                category: categoryVal, page: pageVal, image_url: imageUrl, available: true
            }).select().single();
            if (error) throw error;

            adminProducts.push(data);
            setStatus(`"${nameVal}" added successfully.`);
            addProductForm.reset();
            document.getElementById('new-image-preview').hidden = true;
            renderProducts();
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not add product.', true);
        }
    });

    // Image preview + size check
    document.getElementById('new-product-image').addEventListener('change', (e) => {
        const file = e.target.files[0];
        const preview = document.getElementById('new-image-preview');
        const sizeNote = document.getElementById('new-image-size');
        if (!file) { preview.hidden = true; return; }
        const kb = (file.size / 1024).toFixed(0);
        sizeNote.textContent = `${kb} KB`;
        sizeNote.style.color = file.size > MAX_IMAGE_BYTES ? '#a52626' : '#2e6c45';
        const reader = new FileReader();
        reader.onload = ev => { preview.src = ev.target.result; preview.hidden = false; };
        reader.readAsDataURL(file);
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus('Signing in…');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput.value.trim(), password: passwordInput.value });
            if (error) throw error;
            passwordInput.value = '';
            // Load pages after successful auth
            if (!pagesLoaded) {
                setStatus('Loading catalog…');
                try {
                    await loadPages();
                    pagesLoaded = true;
                } catch (loadErr) {
                    setStatus(loadErr instanceof Error ? loadErr.message : 'Could not load catalog pages.', true);
                    return;
                }
            }
            updateAuthUI(data.session);
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not sign in.', true);
        }
    });

    logoutButton.addEventListener('click', async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            updateAuthUI(null);
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not sign out.', true);
        }
    });

    productList.addEventListener('click', async (event) => {
        const button = event.target.closest('button');
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
            } else if (button.classList.contains('save-admin-product')) {
                await saveAdminProductRow(row);
                flashSaved(row.querySelector('.save-admin-product'));
            }
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not save changes.', true);
        }
    });

    pageSelect.addEventListener('change', renderProducts);
    searchInput.addEventListener('input', renderProducts);

    resetAll.addEventListener('click', async () => {
        if (!canEdit || !window.confirm('Reset all name, price, and visibility changes for both catalogs?')) return;
        try {
            const { error } = await supabase.from(TABLE).delete().not('product_key', 'is', null);
            if (error) throw error;
            catalog = {};
            setStatus('All catalog changes were reset.');
            renderProducts();
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not reset catalog settings.', true);
        }
    });

    toggleNonfood.addEventListener('click', async () => {
        if (!canEdit) return;
        const pageId = pageSelect.value;
        const records = pageRecords[pageId] ?? [];
        const nonfoodRecords = records.filter(r => r.category.includes('Non-Food Items and Packaging'));
        if (!nonfoodRecords.length) { setStatus('No non-food items found on this page.', true); return; }
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
            setStatus(`Non-food items ${newAvailable ? 'shown' : 'hidden'} for customers.`);
            renderProducts();
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not update non-food visibility.', true);
        }
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            // Reload pages if not yet loaded (e.g. page refresh while logged in)
            if (!pagesLoaded) {
                try { await loadPages(); pagesLoaded = true; } catch (_) {}
            }
        }
        updateAuthUI(session);
    });

    // On startup: only fetch Supabase data, do NOT fetch HTML pages yet
    try {
        const [{ data: { session }, error: sessionError }, loadedCatalog, loadedProducts] = await Promise.all([
            supabase.auth.getSession(),
            fetchCatalog(),
            fetchAdminProducts()
        ]);
        if (sessionError) throw sessionError;
        catalog = loadedCatalog;
        adminProducts = loadedProducts;
        // If already logged in (session persisted), load pages now
        if (session?.user) {
            try { await loadPages(); pagesLoaded = true; } catch (loadErr) {
                setStatus(loadErr instanceof Error ? loadErr.message : 'Could not load catalog pages.', true);
            }
        }
        updateAuthUI(session);
    } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Could not connect to Supabase. Check your internet connection.', true);
    }
}

if (document.getElementById('catalog-manager')) {
    startAdmin();
} else {
    applyCustomerCatalog().catch((error) => {
        console.error('Could not load catalog from Supabase:', error);
    });
}
