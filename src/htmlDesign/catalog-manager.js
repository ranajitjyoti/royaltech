import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';
import { installCatalogAdditions, resolveProductImage } from './catalog-additions.js';

const SUPABASE_URL = 'https://flsfsjtyfrpdbhyauxeg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_B65tKRHEWcEnjZkfb9wvMg_u7YSmsPy';
const TABLE = 'catalog_overrides';
const PROMOTIONS_TABLE = 'catalog_promotions';
const CAKES_PROMOTION_KEY = 'cakes';
const PROMOTION_TIME_ZONE = 'Asia/Kolkata';
const STORAGE_BUCKET = 'product-images';
const SHOP_AVAILABILITY_KEY = 'setting:shop-accepting-orders';
const DRY_CAKES_SECTION = '🍰 Dry Cakes';
const DRY_FOOD_ITEMS_SECTION = '🍱 Dry Food Items';
const SHOP_WHATSAPP_URL = 'https://wa.me/918420290133';
const CAKES_LOCAL_IMAGE_PRODUCTS = new Set([
    'fantasy coffee pastry',
    'cream roll jumbo',
    'chicken tikki burger',
    'turkish bread kebab',
    'fish cutlet',
    'chicken cutlet',
    'chicken kebab',
    'fry momo'
]);
const ADMIN_EMAILS = new Set([
    'ranojitjyoti@gmail.com',
    'connect@deeplinkdata.com'
]);
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const PAGES = [
    { id: 'cakes', file: 'cakes.html', label: 'Cakes page' },
    { id: 'order-cakes', file: 'order-cakes.html', label: 'Order cakes page' }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeName(name) {
    return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function sectionCatalogKey(pageId, sectionName) {
    return `section:${pageId}:${encodeURIComponent(normalizeName(sectionName))}`;
}

function getSectionOverride(catalog, pageId, sectionName) {
    const override = catalog[sectionCatalogKey(pageId, sectionName)];
    if (override || sectionName !== DRY_FOOD_ITEMS_SECTION) return override;
    return catalog[sectionCatalogKey(pageId, DRY_CAKES_SECTION)];
}

function setProductImageSource(image, pageId, name, preferredSource) {
    const fallbackSource = resolveProductImage(name);
    const normalizedName = normalizeName(name);
    const useCakesFolderImage = pageId === 'cakes'
        && (CAKES_LOCAL_IMAGE_PRODUCTS.has(normalizedName)
            || normalizedName.startsWith('strawberry bento')
            || normalizedName.startsWith('strawberry cake')
            || normalizedName.startsWith('donut strawberry cake'));
    const source = useCakesFolderImage || !preferredSource || /product-placeholder/i.test(preferredSource)
        ? fallbackSource
        : preferredSource;
    const fallbackUrl = new URL(fallbackSource, document.baseURI).href;

    image.onerror = () => {
        image.onerror = null;
        if (image.src !== fallbackUrl) image.src = fallbackSource;
    };
    image.src = source;
}

function normalizeProductCategory(category) {
    const normalized = normalizeName(category);
    if ([DRY_CAKES_SECTION, DRY_FOOD_ITEMS_SECTION, 'Dry Cakes', 'Dry Food Items']
        .some(name => normalizeName(name) === normalized)) {
        return DRY_FOOD_ITEMS_SECTION;
    }
    return category;
}

function formatPrice(price) {
    return `₹ ${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getErrorMessage(error, fallback) {
    if (error instanceof Error) return error.message;
    if (error && typeof error.message === 'string') return error.message;
    return fallback;
}

function formatCountdown(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function isCakesPromotionActive(promotion, now = Date.now()) {
    if (!promotion?.enabled || promotion.discount_type !== 'percentage') return false;
    const startsAt = Date.parse(promotion.starts_at);
    const endsAt = Date.parse(promotion.ends_at);
    return Number.isFinite(startsAt)
        && Number.isFinite(endsAt)
        && startsAt <= now
        && now < endsAt;
}

let cakesPromotionCountdownTimer = null;

async function fetchCakesPromotion() {
    const { data, error } = await supabase
        .from(PROMOTIONS_TABLE)
        .select('promotion_key, discount_type, discount_value, starts_at, ends_at, enabled')
        .eq('promotion_key', CAKES_PROMOTION_KEY)
        .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const discountValue = Number(data.discount_value);
    if (data.discount_type !== 'percentage'
        || !Number.isFinite(discountValue)
        || discountValue <= 0
        || discountValue > 100
        || !Number.isFinite(Date.parse(data.starts_at))
        || !Number.isFinite(Date.parse(data.ends_at))
        || Date.parse(data.ends_at) <= Date.parse(data.starts_at)) {
        throw new Error('The saved Cakes page discount settings are invalid.');
    }

    return { ...data, discount_value: discountValue };
}

function ensureCakesPromotionStyles() {
    let style = document.getElementById('cakes-promotion-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'cakes-promotion-styles';
        document.head.append(style);
    }
    style.textContent = `
        #cakes-promotion-error {
            margin: 14px auto; padding: 12px 16px; max-width: 1120px;
            border-radius: 10px; background: #fff3cd; color: #654d0a;
            font-weight: 600; text-align: center;
        }
        .cakes-discount-banner {
            position: sticky; top: calc(env(safe-area-inset-top, 0px) + 12px);
            z-index: 1000; display: flex; align-items: center; justify-content: space-between;
            gap: 18px; width: min(760px, calc(100% - 28px)); margin: 12px auto;
            padding: 12px 18px; border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px; background: linear-gradient(115deg, #153f2c, #267347);
            color: #fff; box-shadow: 0 12px 30px rgba(20, 61, 40, 0.25);
            text-align: left; animation: cakesDiscountArrive 0.45s ease-out both;
        }
        .cakes-discount-offer { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .cakes-discount-badge {
            flex: 0 0 auto; padding: 7px 10px; border-radius: 10px;
            background: #ffe4a3; color: #3c2b08; font-size: 0.88rem;
            font-weight: 800; letter-spacing: 0.03em;
        }
        .cakes-discount-copy { display: grid; gap: 2px; }
        .cakes-discount-kicker {
            color: #d3ead9; font-size: 0.66rem; font-weight: 700;
            letter-spacing: 0.12em; text-transform: uppercase;
        }
        .cakes-discount-description { font-size: 0.91rem; font-weight: 600; line-height: 1.35; }
        .cakes-discount-countdown {
            display: grid; gap: 2px; flex: 0 0 auto; padding-left: 18px;
            border-left: 1px solid rgba(255, 255, 255, 0.25); color: #e4f2e8;
            font-size: 0.72rem; line-height: 1.35;
        }
        .cakes-discount-countdown-value {
            color: #fff; font-size: 0.9rem; font-weight: 700;
            font-variant-numeric: tabular-nums;
        }
        .cakes-discount-countdown-value.tick { animation: cakesCountdownTick 0.35s ease-out; }
        @keyframes cakesDiscountArrive {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cakesCountdownTick {
            0% { opacity: 0.55; transform: translateY(2px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 520px) {
            .cakes-discount-banner { gap: 10px; width: calc(100% - 20px); padding: 10px 12px; }
            .cakes-discount-offer { gap: 8px; }
            .cakes-discount-badge { padding: 7px 8px; font-size: 0.78rem; }
            .cakes-discount-kicker { font-size: 0.58rem; }
            .cakes-discount-description { font-size: 0.78rem; }
            .cakes-discount-countdown { padding-left: 10px; font-size: 0.64rem; }
            .cakes-discount-countdown-value { font-size: 0.74rem; }
        }
        @media (max-width: 360px) {
            .cakes-discount-banner { align-items: flex-start; flex-direction: column; }
            .cakes-discount-countdown { padding: 0; border: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
            .cakes-discount-banner, .cakes-discount-countdown-value.tick { animation: none; }
        }
        .cake-price-original {
            display: block; margin-top: 8px; color: #718777;
            font-size: 0.78rem; text-decoration: line-through;
        }
        .cake-price.cakes-discounted-price { margin-top: 2px; color: #b42318; }
    `;
}

function clearCakesPromotionDisplay() {
    if (cakesPromotionCountdownTimer !== null) {
        clearInterval(cakesPromotionCountdownTimer);
        cakesPromotionCountdownTimer = null;
    }
    document.querySelectorAll('.cakes-discount-banner').forEach(banner => banner.remove());
    document.querySelectorAll('.cake-price.cakes-discounted-price').forEach(priceElement => {
        priceElement.textContent = priceElement.dataset.regularPriceText ?? '';
        delete priceElement.dataset.regularPriceText;
        priceElement.previousElementSibling?.remove();
        priceElement.classList.remove('cakes-discounted-price');
    });
}

function showCakesPromotionError(error) {
    console.error('Could not verify the Cakes page discount:', error);
    if (document.getElementById('cakes-promotion-error')) return;
    ensureCakesPromotionStyles();
    const banner = document.createElement('aside');
    banner.id = 'cakes-promotion-error';
    banner.setAttribute('role', 'alert');
    banner.textContent = 'We could not verify the current Cakes page discount. Displayed prices may not include an active offer.';
    const firstSection = document.querySelector('.gallery-section');
    (firstSection?.parentElement ?? document.body).insertBefore(banner, firstSection ?? null);
}

function applyCakesPromotion(promotion) {
    clearCakesPromotionDisplay();
    if (!isCakesPromotionActive(promotion)) return;
    ensureCakesPromotionStyles();

    const endsAt = Date.parse(promotion.ends_at);
    const banner = document.createElement('aside');
    banner.className = 'cakes-discount-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cakes page discount');
    const offer = document.createElement('div');
    offer.className = 'cakes-discount-offer';
    const badge = document.createElement('span');
    badge.className = 'cakes-discount-badge';
    badge.textContent = `${promotion.discount_value}% OFF`;
    const copy = document.createElement('span');
    copy.className = 'cakes-discount-copy';
    const kicker = document.createElement('span');
    kicker.className = 'cakes-discount-kicker';
    kicker.textContent = 'Limited-time offer';
    const description = document.createElement('span');
    description.className = 'cakes-discount-description';
    description.textContent = 'Discount on all items';
    copy.append(kicker, description);
    offer.append(badge, copy);
    const countdown = document.createElement('span');
    countdown.className = 'cakes-discount-countdown';
    countdown.setAttribute('aria-live', 'off');
    const countdownLabel = document.createElement('span');
    countdownLabel.textContent = 'Discount ends in';
    const countdownValue = document.createElement('strong');
    countdownValue.className = 'cakes-discount-countdown-value';
    countdown.append(countdownLabel, countdownValue);
    banner.append(offer, countdown);
    const firstSection = document.querySelector('.gallery-section');
    (firstSection?.parentElement ?? document.body).insertBefore(banner, firstSection ?? null);

    document.querySelectorAll('.cake-card').forEach(card => {
        const priceElement = card.querySelector('.cake-price');
        if (!priceElement || card.dataset.priceOnRequest === 'true') return;
        const regularPrice = Number(priceElement.textContent.replace(/[^\d.]/g, ''));
        if (!Number.isFinite(regularPrice) || regularPrice < 0) return;

        const originalPrice = document.createElement('del');
        originalPrice.className = 'cake-price-original';
        originalPrice.textContent = `Regular: ${formatPrice(regularPrice)}`;
        priceElement.before(originalPrice);
        priceElement.dataset.regularPriceText = priceElement.textContent;
        const discountedPrice = Math.round((regularPrice * (1 - promotion.discount_value / 100) + Number.EPSILON) * 100) / 100;
        priceElement.textContent = `Now: ${formatPrice(discountedPrice)}`;
        priceElement.classList.add('cakes-discounted-price');
    });

    const updateCountdown = () => {
        const remaining = endsAt - Date.now();
        if (remaining <= 0) {
            clearCakesPromotionDisplay();
            document.dispatchEvent(new Event('catalog:products-updated'));
            return;
        }
        countdownValue.textContent = formatCountdown(remaining);
        countdownValue.classList.remove('tick');
        // Restart the tick animation for each timer update.
        void countdownValue.offsetWidth;
        countdownValue.classList.add('tick');
    };
    cakesPromotionCountdownTimer = setInterval(updateCountdown, 1000);
    updateCountdown();
}

function sameCakesPromotion(left, right) {
    return left?.enabled === right?.enabled
        && left?.discount_type === right?.discount_type
        && left?.discount_value === right?.discount_value
        && left?.starts_at === right?.starts_at
        && left?.ends_at === right?.ends_at;
}

function monitorCakesPromotion(initialPromotion) {
    let currentPromotion = initialPromotion;
    let refreshing = false;
    setInterval(async () => {
        if (refreshing) return;
        refreshing = true;
        try {
            const latestPromotion = await fetchCakesPromotion();
            if (!sameCakesPromotion(currentPromotion, latestPromotion)) {
                currentPromotion = latestPromotion;
                applyCakesPromotion(currentPromotion);
                document.dispatchEvent(new Event('catalog:products-updated'));
            }
            document.getElementById('cakes-promotion-error')?.remove();
        } catch (error) {
            showCakesPromotionError(error);
        } finally {
            refreshing = false;
        }
    }, 30000);
}

function findOrCreateProductSection(title) {
    const existing = [...document.querySelectorAll('.gallery-section')].find(section =>
        section.querySelector('.group-header h2')?.textContent.trim() === title
    );
    if (existing) return existing.querySelector('.gallery-grid');

    const section = document.createElement('section');
    section.className = 'gallery-section';
    section.style.cssText = 'padding-top:0; background:#e8f5ee;';
    section.innerHTML = `
        <div class="container" style="padding-top:clamp(36px,6vw,70px);">
            <div class="group-header" onclick="toggleGroup(this)">
                <h2></h2>
                <span class="group-toggle">▼</span>
            </div>
            <div class="group-body"><div class="gallery-grid"></div></div>
        </div>`;
    section.querySelector('.group-header h2').textContent = title;
    (document.querySelector('.location-section') ?? document.getElementById('coOverlay'))?.before(section);
    return section.querySelector('.gallery-grid');
}

function createCustomerProductCard(product, pageId) {
    const card = document.createElement('div');
    card.className = 'cake-card';
    card.dataset.priceOnRequest = 'false';

    const image = document.createElement('img');
    setProductImageSource(image, pageId, product.name, product.imageUrl);
    image.alt = product.name;
    image.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'cake-info';
    const name = document.createElement('h3');
    name.textContent = product.name;
    const price = document.createElement('p');
    price.className = 'cake-price';
    price.textContent = formatPrice(product.price);
    info.append(name, price);

    const cart = document.createElement('div');
    cart.className = 'cake-cart';
    cart.innerHTML = '<button class="btn-add-cart">Add to Cart</button><div class="qty-controls"><button class="qty-btn qty-minus">&#8722;</button><span class="qty-num">1</span><button class="qty-btn qty-plus">+</button></div>';
    card.append(image, info, cart);
    return card;
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
            priceOnRequest: card.dataset.priceOnRequest === 'true',
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

function updateCustomerOrderAvailability(acceptingOrders, message) {
    const root = document.documentElement;
    root.dataset.orderAvailability = acceptingOrders ? 'open' : 'closed';

    let style = document.getElementById('shop-order-availability-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'shop-order-availability-styles';
        style.textContent = `
            .shop-closed-banner {
                display:flex; justify-content:center; align-items:center; flex-wrap:wrap;
                gap:6px; padding:14px 18px; background:#b42318; color:#fff;
                font-weight:600; text-align:center;
            }
            .shop-closed-banner[hidden] { display:none !important; }
            .shop-closed-banner a { color:#fff; text-decoration:underline; font-weight:700; }
            html[data-order-availability="closed"] .btn-add-cart,
            html[data-order-availability="closed"] .qty-plus,
            html[data-order-availability="closed"] .di-qty [data-action="plus"],
            html[data-order-availability="closed"] .sr-add,
            html[data-order-availability="closed"] .btn-checkout {
                opacity:.55; cursor:not-allowed;
            }
        `;
        document.head.append(style);
    }

    let banner = document.getElementById('shop-closed-banner');
    if (!banner) {
        banner = document.createElement('aside');
        banner.id = 'shop-closed-banner';
        banner.className = 'shop-closed-banner';
        banner.setAttribute('role', 'status');
        const text = document.createElement('span');
        text.className = 'shop-closed-message';
        const link = document.createElement('a');
        link.href = SHOP_WHATSAPP_URL;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'WhatsApp us to order';
        banner.append(text, link);
        const firstSection = document.querySelector('.gallery-section');
        (firstSection?.parentElement ?? document.body).insertBefore(banner, firstSection ?? document.body.firstChild);
    }
    banner.querySelector('.shop-closed-message').textContent =
        message ?? 'Shop is not accepting orders now. If you need to order, ';
    banner.hidden = acceptingOrders;
}

// ─── Customer page ────────────────────────────────────────────────────────────

async function applyCustomerCatalog() {
    installCatalogAdditions(document);
    const pageId = location.pathname.toLocaleLowerCase().endsWith('/order-cakes.html') ? 'order-cakes' : 'cakes';
    const controlsShopAvailability = pageId === 'cakes';
    const root = document.documentElement;
    root.dataset.orderAvailability = controlsShopAvailability ? 'checking' : 'open';
    const blockedControls = '.btn-add-cart, .qty-plus, .di-qty [data-action="plus"], .sr-add, .btn-checkout';
    const updateBlockedControls = () => {
        const blocked = root.dataset.orderAvailability !== 'open';
        document.querySelectorAll(blockedControls).forEach(button => {
            if (blocked) {
                if (!button.hasAttribute('data-order-state-disabled')) {
                    button.dataset.orderStateDisabled = String(button.disabled);
                }
                button.disabled = true;
            } else if (button.hasAttribute('data-order-state-disabled')) {
                button.disabled = button.dataset.orderStateDisabled === 'true';
                delete button.dataset.orderStateDisabled;
            }
        });
    };
    document.addEventListener('click', event => {
        if (root.dataset.orderAvailability === 'open' || !(event.target instanceof Element)) return;
        if (!event.target.closest(blockedControls)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }, true);
    updateBlockedControls();
    const controlsObserver = new MutationObserver(updateBlockedControls);
    controlsObserver.observe(document.body, { childList: true, subtree: true });

    const promotionResultPromise = controlsShopAvailability
        ? fetchCakesPromotion()
            .then(promotion => ({ promotion }))
            .catch(error => ({ error }))
        : Promise.resolve({ promotion: null });
    let catalog;
    let promotionResult;
    try {
        [catalog, promotionResult] = await Promise.all([fetchCatalog(), promotionResultPromise]);
    } catch (error) {
        if (controlsShopAvailability) {
            updateCustomerOrderAvailability(false, 'We can’t confirm order availability right now. Please contact us on WhatsApp. ');
        }
        updateBlockedControls();
        throw error;
    }
    if (controlsShopAvailability) {
        updateCustomerOrderAvailability(catalog[SHOP_AVAILABILITY_KEY]?.available !== false);
    }
    updateBlockedControls();
    const cards = [...document.querySelectorAll('.cake-card')];
    const records = getProductRecords(document, pageId);

    records.forEach((record, i) => {
        const override = catalog[record.key];
        const card = cards[i];
        if (!card) return;
        if (override) {
            card.querySelector('h3').textContent = override.name;
            if (record.priceOnRequest && override.price === 0) {
                card.querySelector('.cake-price').textContent = 'Price on request';
            } else {
                card.dataset.priceOnRequest = 'false';
                card.querySelector('.cake-price').textContent = formatPrice(override.price);
            }
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
        image.alt = displayName;
        image.hidden = false;
        setProductImageSource(image, pageId, displayName, imageSrc);
    });

    if (promotionResult.error) showCakesPromotionError(promotionResult.error);

    function applySectionVisibility() {
        for (const section of document.querySelectorAll('.gallery-section')) {
            const title = section.querySelector('.group-header h2')?.textContent.trim();
            if (!title) continue;
            const override = getSectionOverride(catalog, pageId, title);
            if (override?.available === false) {
                section.style.setProperty('display', 'none', 'important');
            } else {
                section.style.removeProperty('display');
            }
        }
    }

    applySectionVisibility();

    const newEntries = Object.entries(catalog).filter(([k, v]) =>
        k.startsWith(`new:${pageId}:`) && v.available !== false
    );
    if (newEntries.length) {
        const productGrids = new Map();
        newEntries.forEach(([, product]) => {
            const category = normalizeProductCategory(product.category || '✦ New Products');
            if (!productGrids.has(category)) {
                productGrids.set(category, findOrCreateProductSection(category));
            }
            productGrids.get(category).appendChild(createCustomerProductCard(product, pageId));
        });
    }

    if (pageId === 'cakes') {
        applyCakesPromotion(promotionResult.promotion);
        monitorCakesPromotion(promotionResult.promotion);
        document.dispatchEvent(new Event('catalog:products-updated'));
        updateBlockedControls();
        applySectionVisibility();
    } else if (newEntries.length) {
        document.dispatchEvent(new Event('catalog:products-updated'));
        updateBlockedControls();
        applySectionVisibility();
    }
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

function createProductRow(record, override, draft, canEdit, onDraftChange, onSave) {
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
    const originalName = document.createElement('strong');
    originalName.textContent = record.name;
    productTitle.append(originalName);
    heading.append(image, productTitle);

    const nameInput = document.createElement('input');
    nameInput.className = 'product-name';
    nameInput.type = 'text';
    nameInput.required = true;
    nameInput.maxLength = 120;
    nameInput.value = draft?.name ?? override?.name ?? record.name;
    nameInput.disabled = !canEdit;

    const priceInput = document.createElement('input');
    priceInput.className = 'product-price';
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '0.01';
    priceInput.required = true;
    priceInput.value = String(draft?.price ?? override?.price ?? record.price);
    if (record.priceOnRequest) priceInput.placeholder = '0 = price on request';
    priceInput.disabled = !canEdit;

    const available = draft?.available ?? override?.available ?? true;

    const availabilityBtn = document.createElement('button');
    availabilityBtn.className = 'product-availability toggle-btn';
    availabilityBtn.type = 'button';
    availabilityBtn.dataset.state = available ? 'on' : 'off';
    availabilityBtn.textContent = available ? '✔ Visible' : '✖ Hidden';
    availabilityBtn.disabled = !canEdit;

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-product-btn';
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save';
    saveBtn.disabled = !canEdit || !draft;

    function updateDraft() {
        const name = nameInput.value.trim();
        const price = Number(priceInput.value);
        const nextAvailable = availabilityBtn.dataset.state === 'on';
        const originalName = override?.name ?? record.name;
        const originalPrice = override?.price ?? record.price;
        const originalAvailable = override?.available ?? true;
        const changed = name !== originalName || price !== originalPrice || nextAvailable !== originalAvailable;
        const nextDraft = changed ? { name, price, available: nextAvailable } : null;
        onDraftChange(record.key, nextDraft);
        saveBtn.disabled = !canEdit || !changed || !nameInput.validity.valid || !priceInput.validity.valid;
    }

    nameInput.addEventListener('input', updateDraft);
    priceInput.addEventListener('input', updateDraft);
    saveBtn.addEventListener('click', () => onSave(record, {
        name: nameInput.value.trim(),
        price: Number(priceInput.value),
        available: availabilityBtn.dataset.state === 'on'
    }, saveBtn));
    availabilityBtn.addEventListener('click', () => {
        const on = availabilityBtn.dataset.state !== 'on';
        availabilityBtn.dataset.state = on ? 'on' : 'off';
        availabilityBtn.textContent = on ? '✔ Visible' : '✖ Hidden';
        updateDraft();
    });

    row.append(heading, createField('Product name', nameInput), createField('Price (₹)', priceInput), availabilityBtn, saveBtn);
    return row;
}

function createSectionControl(pageId, sectionName, catalog, draftAvailable, canEdit, onDraftChange, onSave) {
    const row = document.createElement('article');
    row.className = 'section-control';

    const title = document.createElement('strong');
    title.textContent = sectionName;

    const key = sectionCatalogKey(pageId, sectionName);
    const savedAvailable = getSectionOverride(catalog, pageId, sectionName)?.available ?? true;
    const available = draftAvailable ?? savedAvailable;
    const stateButton = document.createElement('button');
    stateButton.className = 'toggle-btn section-visibility-btn';
    stateButton.type = 'button';
    stateButton.dataset.state = available ? 'on' : 'off';
    stateButton.textContent = available ? '✔ Visible' : '✖ Hidden';
    stateButton.disabled = !canEdit;
    stateButton.addEventListener('click', () => {
        const nextAvailable = stateButton.dataset.state !== 'on';
        stateButton.dataset.state = nextAvailable ? 'on' : 'off';
        stateButton.textContent = nextAvailable ? '✔ Visible' : '✖ Hidden';
        onDraftChange(key, nextAvailable === savedAvailable ? null : nextAvailable);
        saveButton.disabled = !canEdit || nextAvailable === savedAvailable;
    });

    const saveButton = document.createElement('button');
    saveButton.className = 'save-product-btn section-save-btn';
    saveButton.type = 'button';
    saveButton.textContent = 'Save';
    saveButton.disabled = !canEdit || draftAvailable === undefined;
    saveButton.addEventListener('click', () =>
        onSave(pageId, sectionName, stateButton.dataset.state === 'on', saveButton)
    );

    row.append(title, stateButton, saveButton);
    return row;
}

async function startAdmin() {
    const pageSelect = document.getElementById('catalog-page');
    const searchInput = document.getElementById('product-search');
    const productList = document.getElementById('product-list');
    const sectionList = document.getElementById('section-list');
    const status = document.getElementById('catalog-status');
    const count = document.getElementById('product-count');
    const shopOrderState = document.getElementById('shop-order-state');
    const shopOrderToggle = document.getElementById('shop-order-toggle');
    const discountPercentInput = document.getElementById('cakes-discount-percent');
    const discountDurationInput = document.getElementById('cakes-discount-duration');
    const discountUnitInput = document.getElementById('cakes-discount-unit');
    const startDiscountButton = document.getElementById('start-cakes-discount');
    const stopDiscountButton = document.getElementById('stop-cakes-discount');
    const discountStatus = document.getElementById('cakes-discount-status');
    const resetAll = document.getElementById('reset-all');
    const toggleNonfood = document.getElementById('toggle-nonfood');
    const loginForm = document.getElementById('admin-login');
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const logoutButton = document.getElementById('admin-logout');
    const adminPanel = document.getElementById('admin-panel');
    const pageRecords = {};
    const pageSections = {};
    const drafts = new Map();
    const sectionDrafts = new Map();
    let catalog = {};
    let cakesPromotion = null;
    let canEdit = false;
    let pagesLoaded = false;
    let promotionLoaded = false;
    let promotionLoadStarted = false;
    let promotionSaving = false;

    function updateDraft(key, draft) {
        if (draft) drafts.set(key, draft);
        else drafts.delete(key);
    }

    function setStatus(msg, isError = false) {
        status.textContent = msg;
        status.classList.toggle('error', isError);
    }

    function renderShopAvailability() {
        const acceptingOrders = catalog[SHOP_AVAILABILITY_KEY]?.available !== false;
        shopOrderState.dataset.state = acceptingOrders ? 'open' : 'closed';
        shopOrderState.textContent = acceptingOrders ? 'Shop is accepting orders.' : 'Shop is not accepting orders.';
        shopOrderToggle.dataset.state = acceptingOrders ? 'open' : 'closed';
        shopOrderToggle.textContent = acceptingOrders ? 'Close shop to new orders' : 'Accept orders again';
        shopOrderToggle.disabled = !canEdit;
    }

    function formatPromotionEnd(value) {
        return new Intl.DateTimeFormat('en-IN', {
            timeZone: PROMOTION_TIME_ZONE,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        }).format(new Date(value));
    }

    function renderCakesPromotion() {
        const active = isCakesPromotionActive(cakesPromotion);
        const canManagePromotion = canEdit && !promotionSaving && promotionLoaded;
        discountPercentInput.disabled = !canEdit || promotionSaving || !promotionLoaded;
        discountDurationInput.disabled = !canEdit || promotionSaving || !promotionLoaded;
        discountUnitInput.disabled = !canEdit || promotionSaving || !promotionLoaded;
        startDiscountButton.disabled = !canManagePromotion || active;
        stopDiscountButton.disabled = !canManagePromotion || !active;

        if (!promotionLoaded) {
            discountStatus.textContent = promotionLoadStarted
                ? 'Loading discount settings…'
                : 'Discount settings are unavailable. Check the Supabase setup.';
        } else if (active) {
            discountPercentInput.value = String(cakesPromotion.discount_value);
            discountStatus.textContent = `Active: ${cakesPromotion.discount_value}% off until ${formatPromotionEnd(cakesPromotion.ends_at)}.`;
        } else if (cakesPromotion?.ends_at && Date.parse(cakesPromotion.ends_at) <= Date.now()) {
            discountStatus.textContent = `The previous discount expired at ${formatPromotionEnd(cakesPromotion.ends_at)}. No discount is active.`;
        } else {
            discountStatus.textContent = 'No Cakes page discount is active.';
        }
    }

    async function loadCakesPromotion() {
        cakesPromotion = await fetchCakesPromotion();
        promotionLoaded = true;
        renderCakesPromotion();
    }

    async function startCakesPromotion() {
        if (!canEdit || !promotionLoaded) return;
        const discountValue = Number(discountPercentInput.value);
        const duration = Number(discountDurationInput.value);
        const unit = discountUnitInput.value;
        const durationMultiplier = unit === 'days' ? 86400000 : 3600000;
        const startsAtMilliseconds = Date.now();
        const endsAtMilliseconds = startsAtMilliseconds + duration * durationMultiplier;
        if (!discountPercentInput.validity.valid
            || !Number.isFinite(discountValue)
            || discountValue <= 0
            || discountValue > 100
            || !discountDurationInput.validity.valid
            || !Number.isSafeInteger(duration)
            || duration < 1
            || !['hours', 'days'].includes(unit)
            || !Number.isFinite(endsAtMilliseconds)
            || Number.isNaN(new Date(endsAtMilliseconds).getTime())) {
            setStatus('Enter a discount from 0.01% to 100% and a positive whole-number duration.', true);
            return;
        }

        const now = new Date(startsAtMilliseconds);
        const promotion = {
            promotion_key: CAKES_PROMOTION_KEY,
            discount_type: 'percentage',
            discount_value: discountValue,
            starts_at: now.toISOString(),
            ends_at: new Date(endsAtMilliseconds).toISOString(),
            enabled: true,
            updated_at: now.toISOString()
        };
        promotionSaving = true;
        renderCakesPromotion();
        setStatus('Starting the Cakes page discount…');
        try {
            const { error } = await supabase.from(PROMOTIONS_TABLE).upsert(promotion);
            if (error) throw error;
            cakesPromotion = promotion;
            setStatus(`Started a ${discountValue}% Cakes page discount until ${formatPromotionEnd(promotion.ends_at)}.`);
        } catch (error) {
            setStatus(`Could not start the Cakes page discount: ${getErrorMessage(error, 'Unknown error')}`, true);
        } finally {
            promotionSaving = false;
            renderCakesPromotion();
        }
    }

    async function stopCakesPromotion() {
        if (!canEdit || !promotionLoaded || !isCakesPromotionActive(cakesPromotion)) return;
        promotionSaving = true;
        renderCakesPromotion();
        setStatus('Stopping the Cakes page discount…');
        const promotion = { ...cakesPromotion, enabled: false, updated_at: new Date().toISOString() };
        try {
            const { error } = await supabase.from(PROMOTIONS_TABLE).upsert(promotion);
            if (error) throw error;
            cakesPromotion = promotion;
            setStatus('Stopped the Cakes page discount.');
        } catch (error) {
            setStatus(`Could not stop the Cakes page discount: ${getErrorMessage(error, 'Unknown error')}`, true);
        } finally {
            promotionSaving = false;
            renderCakesPromotion();
        }
    }

    async function loadPages() {
        for (const page of PAGES) {
            const pageUrl = new URL(page.file, location.href);
            const res = await fetch(pageUrl);
            if (!res.ok) throw new Error(`Could not load ${page.file} (HTTP ${res.status}).`);
            const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
            installCatalogAdditions(doc);
            pageRecords[page.id] = getProductRecords(doc, page.id);
            pageSections[page.id] = [...doc.querySelectorAll('.gallery-section .group-header h2')]
                .map(heading => heading.textContent.trim());
            if (!pageRecords[page.id].length) throw new Error(`No products found in ${page.file}.`);
        }
    }

    function renderProducts() {
        renderShopAvailability();
        if (!pagesLoaded) return;
        const page = PAGES.find(p => p.id === pageSelect.value);
        const pageProductRecords = new Map((pageRecords[page.id] ?? []).map(record => [record.key, record]));
        Object.entries(catalog)
            .filter(([key]) => key.startsWith(`new:${page.id}:`) && !pageProductRecords.has(key))
            .forEach(([key, product]) => pageProductRecords.set(key, {
                key,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                category: normalizeProductCategory(product.category || '✦ New Products')
            }));
        const records = [...pageProductRecords.values()];
        const sectionNames = new Set([
            ...(pageSections[page.id] ?? []),
            ...records.map(record => record.category)
        ]);
        sectionList.replaceChildren(...[...sectionNames].map(sectionName =>
            createSectionControl(
                page.id,
                sectionName,
                catalog,
                sectionDrafts.get(sectionCatalogKey(page.id, sectionName)),
                canEdit,
                (key, available) => {
                    if (available === null) sectionDrafts.delete(key);
                    else sectionDrafts.set(key, available);
                },
                saveSectionVisibility
            )
        ));
        const query = searchInput.value.trim().toLocaleLowerCase();
        const visibleRecords = records.filter(r => {
            const override = catalog[r.key];
            return `${override?.name ?? r.name} ${r.category}`.toLocaleLowerCase().includes(query);
        });
        const productGroups = new Map();
        visibleRecords.forEach(record => {
            const category = record.category || 'Other items';
            let group = productGroups.get(category);
            if (!group) {
                const section = document.createElement('details');
                section.className = 'product-category-group';
                section.setAttribute('aria-label', category);
                const summary = document.createElement('summary');
                summary.className = 'product-category-summary';
                const heading = document.createElement('h2');
                heading.className = 'product-category-heading';
                heading.textContent = category;
                const items = document.createElement('div');
                items.className = 'product-category-items';
                summary.append(heading);
                section.append(summary, items);
                group = { section, items };
                productGroups.set(category, group);
            }
            group.items.append(createProductRow(
                record,
                catalog[record.key],
                drafts.get(record.key),
                canEdit,
                updateDraft,
                saveProduct
            ));
        });
        productList.replaceChildren(...[...productGroups.values()].map(group => group.section));
        count.textContent = `${visibleRecords.length} products`;
        resetAll.disabled = !canEdit;
        toggleNonfood.disabled = !canEdit;
        const nonfoodRecords = (pageRecords[page.id] ?? []).filter(r => r.category.includes('Non-Food Items and Packaging'));
        const allHidden = nonfoodRecords.length > 0 && nonfoodRecords.every(r => (catalog[r.key]?.available ?? true) === false);
        toggleNonfood.textContent = allHidden ? 'Show all non-food' : 'Hide all non-food';
    }

    function updateAuthUI(session) {
        canEdit = Boolean(session?.user?.email && ADMIN_EMAILS.has(session.user.email.toLocaleLowerCase()));
        loginForm.hidden = canEdit;
        adminPanel.hidden = !canEdit;
        if (canEdit) {
            renderProducts();
            if (!promotionLoadStarted) {
                promotionLoadStarted = true;
                renderCakesPromotion();
                loadCakesPromotion().catch(error => {
                    promotionLoadStarted = false;
                    renderCakesPromotion();
                    setStatus(`Could not load Cakes page discount settings: ${getErrorMessage(error, 'Unknown error')}`, true);
                });
            } else {
                renderCakesPromotion();
            }
        }
        if (session && !canEdit) setStatus('This account is not authorized.', true);
        else if (!canEdit) setStatus('');
    }

    async function saveProduct(record, values, saveBtn) {
        if (!canEdit || !values.name || !Number.isFinite(values.price) || values.price < 0) {
            setStatus('Enter a valid product name and price before saving.', true);
            return;
        }
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving…';
        try {
            const imageUrl = catalog[record.key]?.imageUrl ?? record.imageUrl;
            const category = catalog[record.key]?.category ?? record.category;
            const { error } = await supabase.from(TABLE).upsert({
                product_key: record.key,
                name: values.name,
                price: values.price,
                available: values.available,
                image_url: imageUrl,
                category,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
            catalog[record.key] = { name: values.name, price: values.price, available: values.available, imageUrl, category };
            drafts.delete(record.key);
            setStatus(`Saved "${values.name}".`);
            renderProducts();
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not save product.', true);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
        }
    }

    async function saveSectionVisibility(pageId, sectionName, available, button) {
        if (!canEdit) return;
        button.disabled = true;
        button.textContent = 'Saving…';
        try {
            const key = sectionCatalogKey(pageId, sectionName);
            const { error } = await supabase.from(TABLE).upsert({
                product_key: key,
                name: sectionName,
                price: 0,
                available,
                image_url: '',
                category: sectionName,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
            catalog[key] = { name: sectionName, price: 0, available, imageUrl: '', category: sectionName };
            sectionDrafts.delete(key);
            setStatus(`${sectionName} section ${available ? 'shown' : 'hidden'} on the ${PAGES.find(page => page.id === pageId)?.label ?? pageId}.`);
            renderProducts();
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not update section visibility.', true);
            button.disabled = false;
            button.textContent = 'Save';
        }
    }

    async function saveShopAvailability(acceptingOrders) {
        if (!canEdit) return;
        shopOrderToggle.disabled = true;
        shopOrderToggle.textContent = 'Saving…';
        try {
            const { error } = await supabase.from(TABLE).upsert({
                product_key: SHOP_AVAILABILITY_KEY,
                name: 'Shop order availability',
                price: 0,
                available: acceptingOrders,
                image_url: '',
                category: 'Settings',
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
            catalog[SHOP_AVAILABILITY_KEY] = {
                name: 'Shop order availability',
                price: 0,
                available: acceptingOrders,
                imageUrl: '',
                category: 'Settings'
            };
            setStatus(acceptingOrders ? 'The shop is now accepting orders.' : 'The shop is now closed to new orders.');
            renderProducts();
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Could not update order availability.', true);
            renderShopAvailability();
        }
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

    pageSelect.addEventListener('change', renderProducts);
    searchInput.addEventListener('input', renderProducts);
    startDiscountButton.addEventListener('click', startCakesPromotion);
    stopDiscountButton.addEventListener('click', stopCakesPromotion);
    shopOrderToggle.addEventListener('click', () =>
        saveShopAvailability(catalog[SHOP_AVAILABILITY_KEY]?.available === false)
    );

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
        const category = normalizeProductCategory(newCategoryInput.value.trim());
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
            drafts.clear();
            sectionDrafts.clear();
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
