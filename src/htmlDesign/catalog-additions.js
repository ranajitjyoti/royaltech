const GROUPS = [
    {
        id: 'eggless-cakes',
        title: 'Celebration Cakes — Eggless',
        placement: 'before-cakes',
        items: [
            ['Choco Almond Cake', 'Regular', 430],
            ['Butterscotch Cake', 'Regular', 380],
            ['Chocolate Cake', 'Junior', 290],
            ['Chocolate Cake', 'Regular', 430],
            ['Black Forest Cake', 'Junior', 290],
            ['Black Forest Cake', 'Regular', 430],
            ['White Forest Cake', 'Junior', 290],
            ['White Forest Cake', 'Regular', 430],
            ['Dual Forest Cake', 'Junior', 280],
            ['Dual Forest Cake', 'Regular', 400],
            ['Choco Chip Cake', 'Junior', 290],
            ['Choco Chip Cake', 'Regular', 430],
            ['Rasmalai Cake', 'Regular', 430],
            ['Red Velvet Cake', 'Regular', 480],
            ['Pinata Ball Cake', 'Regular', 280],
            ['Pinata Heart Cake', 'Regular', 280],
            ['Mango Malai Cake', 'Junior', 280],
            ['Mango Malai Cake', 'Regular', 400],
            ['Strawberry Bento', 'Large', 170]
        ]
    },
    {
        id: 'nonveg-cakes',
        title: 'Celebration Cakes — Non-veg',
        placement: 'before-cakes',
        items: [
            ['Butterscotch Cake', 'Junior', 220],
            ['Butterscotch Cake', 'Regular', 310],
            ['Strawberry Cake', 'Junior', 220],
            ['Strawberry Cake', 'Regular', 310],
            ['Blueberry Cake', 'Junior', 260],
            ['Blueberry Cake', 'Regular', 370],
            ['Chocolate Heart', 'Regular', 350],
            ['Pineapple Cake', 'Junior', 217],
            ['Pineapple Cake', 'Large', 310],
            ['Black Forest Cake', 'Junior', 230],
            ['Black Forest Cake', 'Large', 330],
            ['Donut Chocolate Cake', 'Junior', 230],
            ['Donut Chocolate Cake', 'Regular', 330],
            ['Donut Strawberry Cake', 'Junior', 230],
            ['Donut Strawberry Cake', 'Regular', 330],
            ['Choco Vanilla Cake', 'Junior', 230],
            ['Choco Vanilla Cake', 'Regular', 330],
            ['Choco Truffle Cake', 'Junior', 250],
            ['Choco Truffle Cake', 'Regular', 350],
            ['Honey Almond', 'Junior', 230],
            ['Honey Almond', 'Regular', 330],
            ['Milk Chocolate', 'Regular', 350],
            ['Mango Bento', 'Large', 150],
            ['Choco Bento', 'Large', 150],
            ['Vanilla Bento', 'Large', 150]
        ]
    },
    {
        id: 'pastries',
        title: 'Pastries',
        items: [
            ['Butterscotch Pastry', '', 35],
            ['Mango Pastry', '', 35],
            ['Choco Delight Pastry', '', 35],
            ['Strawberry Pastry', '', 35],
            ['Swiss Roll', '', 40],
            ['RAM Ball', '', 30],
            ['Dark Chocolate Pastry', '', 45],
            ['Orange Pastry', '', 35],
            ['Choco Lava Pastry', '', 45],
            ['Chocko Chip Pastry', '', 45],
            ['Black Forest Pastry', '', 40],
            ['Red Velvet Pastry', '', 40],
            ['Milk Chocolate Pastry', '', 40],
            ['Chocko Lava Pastry', '', 45],
            ['Berry Blast Pastry', '', 40],
            ['Ice Cream Pastry', '', 25],
            ['Lolipop', '', 15],
            ['Rasmalai Pastry', '', 45],
            ['Fantasy Coffee Pastry', '', 35],
            ['Cream Roll', '', 20],
            ['Cream Roll Jumbo', '', 35]
        ]
    },
    {
        id: 'nonveg-pastries',
        title: 'Non-veg Pastries',
        placement: 'after-pastries',
        items: [
            ['Coconut Pastry', '', 35]
        ]
    },
    {
        id: 'snacks',
        title: 'Puffs, Breads and Snacks',
        items: [
            ['Veg Puff', '', 25],
            ['Veg Paneer Samosa', '', 30],
            ['Paneer Puff', '', 35],
            ['Chicken Puff', '', 35],
            ['Misti Shuk', '', 22],
            ['Chinese Samosa', '', 40],
            ['Chicken Garlic Samosa', '', 35],
            ['Chicken Pizza', '', 60],
            ['Grill Chicken Sandwich', '', 45],
            ['Chicken 65', '', 45],
            ['Green Chicken Bun', '', 45],
            ['Panjabi Samosa', '', 30],
            ['Chicken Croissant', '', 45],
            ['Abric Veg Burger', '', 50],
            ['Chicken Tikki Burger', '', 60],
            ['Chicken Mini Burger', '', 30],
            ['Chilli Fish Bun', '', 55],
            ['Chicken Cheese Patties', '', 45],
            ['Chilly Chicken Patties', '', 45],
            ['Italian Sandwich', '', 65],
            ['Italian Mini Sandwich', '', 35],
            ['Paneer 65', '', 50],
            ['Chicken Internet', '', 45],
            ['Chicken Parcel', '', 35],
            ['Special Hot Dog', '', 65],
            ['Turkish Bread Kebab', '', 35],
            ['Misti Dahi', '', 40]
        ]
    },
    {
        id: 'savouries',
        title: 'Rolls, Chops and Other Savouries',
        items: [
            ['Fish Chop', '', 40],
            ['Fish Finger', '', 22],
            ['Fish Cutlet', '', 45],
            ['Veg Kachori', '', 25],
            ['Chicken Cutlet', '', 45],
            ['Paneer Spring Roll', '', 55],
            ['Veg Wrap', '', 50],
            ['Veg Chop', '', 30],
            ['Egg Devil', '', 25],
            ['Chicken Kebab', '', 40],
            ['Chicken Spring Roll', '', 55],
            ['Chicken Drump Stick', '', 48],
            ['Fry Momo', '', 55],
            ['Steam Momo', '', 50],
            ['Paneer Pizza', '', 60],
            ['Small Vada Pav', '', 35],
            ['Vada Pav', '', 60],
            ['Chicken Butter Masala', '', 50],
            ['Garlic Bread', '', 70]
        ]
    },
    {
        id: 'muffins',
        title: 'Muffins and Brownies',
        items: [
            ['Strawberry Muffin', '', 20],
            ['Choco Muffin', '', 25],
            ['Venilla Muffin', '', 25],
            ['Dark Chocolet Muffin', '', 30],
            ['Brownie', '', 45]
        ]
    },
    {
        id: 'mousse',
        title: 'Mousse',
        items: [
            ['White Chocolate Mousse', '', 40],
            ['Dark Chocolate Mousse', '', 50],
            ['Chocolate Mousse', '', 45],
            ['Red Velvet Mousse', '', 40],
            ['Strawberry Mousse', '', 45]
        ]
    }
];

const IMAGE_DIR = '../../image/cakes/';
const PRODUCT_IMAGE_HINTS = [
    ['brown kham', 'brown kham small brown kham medium brown kham big.jpg'],
    ['choco almond', 'Choco Chips Cake Junior Regular Large.PNG'],
    ['honey almond', 'Honey Almond Cake.jpg'],
    ['pinata heart', 'Chocolate Heart Pastry.jpg'],
    ['pinata ball', 'pinata ball cake.jpg'],
    ['chocolate heart', 'Chocolate Heart Pastry.jpg'],
    ['heart cake', 'Chocolate Heart Pastry.jpg'],
    ['strawberry bento', 'mango Bento.webp'],
    ['vanilla bento', 'Choco Bento.webp'],
    ['mango bento', 'mango Bento.webp'],
    ['choco bento', 'Choco Bento.webp'],
    ['donut strawberry', 'strawberry -cakes.jpg'],
    ['donut chocolate', 'Chocolate Cake.jpg'],
    ['rasmalai cake', 'rasmalai-cakes.png'],
    ['rasmalai pastry', 'Rahsmalai Pastry.jpg'],
    ['rahsmalai', 'Rahsmalai Pastry.jpg'],
    ['white forest pastry', 'White Forest Pastry.PNG'],
    ['white forest', 'White Forest Cake.webp'],
    ['black forest pastry', 'Black Forest Pastry.avif'],
    ['black forest', 'Black Forest Cake Veg (Regular).webp'],
    ['dual forest', 'Dual Forest Cake.jpg'],
    ['mango malai pastry', 'Mango Malai Cake.jpg'],
    ['mango malai', 'Mango Malai Cake.jpg'],
    ['mango pastry', 'Mango Pastry.PNG'],
    ['choco truffle', 'Choco Truffle Cake Veg.webp'],
    ['choco vanilla', 'Choco Vanilla Cake.jpg'],
    ['choco chip pastry', 'Choco Chip Pastry.png'],
    ['chocko chip', 'Choco Chip Pastry.png'],
    ['choco chips pastry', 'Choco Chip Pastry.png'],
    ['choco chip', 'Choco Chip Cake Veg.jpg'],
    ['chocochip', 'Choco Chip Cake Veg.jpg'],
    ['choco lava', 'Choco Lava Pastry.png'],
    ['chocko lava', 'Choco Lava Pastry.png'],
    ['choco delight', 'Choco Lava Pastry.png'],
    ['milk chocolate pastry', 'Milk Chocolate pastry.jpg'],
    ['milk chocolate', 'milk chocolate-cake.png'],
    ['butterscotch pastry', 'Butterscotch Pastry.jpg'],
    ['butterscotch', 'Butterscotch Cake Veg.png'],
    ['pineapple pastry', 'Pineapple Pastry.jpg'],
    ['pineapple', 'Pineapple Cake.jpg'],
    ['red velvet pastry', 'red velvate pastry.PNG'],
    ['red velvet', 'Red Velvet Cake.jpg'],
    ['blueberry cake', 'blue-berry cakes.webp'],
    ['blue berry pastry', 'Blue Berry Pastry.webp'],
    ['blueberry', 'Blue Berry Pastry.webp'],
    ['berry blast', 'Blue Berry Pastry.webp'],
    ['strawberry pastry', 'Strawberry Pastry.jpg'],
    ['strawberry muffin', 'strawberry muffin.PNG'],
    ['strawberry mousse', 'strawberry-mousse-recipe.webp'],
    ['red velvet mousse', 'Red Velvet Mousse.PNG'],
    ['strawberry cake', 'strawberry -cakes.jpg'],
    ['strawberry', 'Strawberry Pastry.jpg'],
    ['kiwi', 'Pineapple Pastry.jpg'],
    ['orange pastry', 'Orange Pastry.png'],
    ['coconut pastry', 'Coconut Pastry.jpg'],
    ['swiss roll', 'Sweetmilk Pastry.png'],
    ['cream roll', 'Sweetmilk Pastry.png'],
    ['ice cream pastry', 'White Forest Pastry.PNG'],
    ['fantasy coffee', 'coffee Mousse.PNG'],
    ['coffee mousse', 'coffee Mousse.PNG'],
    ['lolipop', 'RAM BALL.jpg'],
    ['lollipop', 'RAM BALL.jpg'],
    ['dark chocolate pastry', 'Dark Chocolate Pastry.jpg'],
    ['dark chocolate mousse', 'Dark Chololate Mousse.PNG'],
    ['dark chocolet muffin', 'choco muffin.jpeg'],
    ['dark chocolate muffin', 'choco muffin.jpeg'],
    ['white chocolate mousse', 'chocolate mousse.png'],
    ['chocolate mousse', 'chocolate mousse.png'],
    ['chocolate cake', 'Chocolate Cake.jpg'],
    ['choco muffin', 'choco muffin.jpeg'],
    ['vanilla muffin', 'Choco Vanilla Cake.jpg'],
    ['venilla muffin', 'Choco Vanilla Cake.jpg'],
    ['brownie', 'brownie.jpg'],
    ['arabic veg burger', 'Veg Big Burger chicken tikki burger.png'],
    ['abric veg burger', 'Veg Big Burger chicken tikki burger.png'],
    ['chicken tikki burger', 'Veg Big Burger chicken tikki burger.png'],
    ['chicken mini burger', 'Veg Big Burger chicken tikki burger.png'],
    ['veg big burger', 'Veg Big Burger chicken tikki burger.png'],
    ['veg mini burger', 'Veg Big Burger chicken tikki burger.png'],
    ['hot dog', 'chicken sandwich.png'],
    ['white sauce pasta', 'pasta.jpg'],
    ['red sauce pasta', 'pasta.jpg'],
    ['pasta', 'pasta.jpg'],
    ['chicken puff', 'Paneer Puff chicken puff.png'],
    ['paneer puff', 'Paneer Puff chicken puff.png'],
    ['chicken pizza', 'chicken-pitzza.jpg'],
    ['paneer pizza', 'Paneer Pizza.webp'],
    ['grill chicken sandwich', 'chicken sandwich.png'],
    ['chicken sandwich', 'chicken sandwich.png'],
    ['italian mini sandwich', 'Italian Mini Sanditch.jpg'],
    ['italian sandwich', 'Veg Sandwich.PNG'],
    ['veg sandwich', 'Veg Sandwich.PNG'],
    ['chicken garlic samosa', 'veg samosa chiken samosa cheese samosa chicken samosa paneer samosa.PNG'],
    ['chinese samosa', 'veg samosa chiken samosa cheese samosa chicken samosa paneer samosa.PNG'],
    ['panjabi samosa', 'veg samosa chiken samosa cheese samosa chicken samosa paneer samosa.PNG'],
    ['paneer samosa', 'veg samosa chiken samosa cheese samosa chicken samosa paneer samosa.PNG'],
    ['chicken 65', 'chicken 65.jpg'],
    ['paneer 65', 'Paneer 65.PNG'],
    ['green chicken bun', 'chicken sandwich.png'],
    ['chilli fish bun', 'chicken sandwich.png'],
    ['chicken croissant', 'Paneer Croissant checken Croissant.PNG'],
    ['paneer croissant', 'Paneer Croissant checken Croissant.PNG'],
    ['chicken cheese patties', 'chicken patties chilli chiken ciken cheese green chicken all kind of chicken patties.PNG'],
    ['chilly chicken patties', 'chicken patties chilli chiken ciken cheese green chicken all kind of chicken patties.PNG'],
    ['chicken patties', 'chicken patties chilli chiken ciken cheese green chicken all kind of chicken patties.PNG'],
    ['egg patties', 'egg patiess.png'],
    ['chicken internet', 'chicken sandwich.png'],
    ['chicken parcel', 'chicken percel.jpg'],
    ['misti shuk', 'gulab-jamun-recipe-01.webp'],
    ['misti dahi', 'gulab-jamun-recipe-01.webp'],
    ['fish chop', 'fish chop.png'],
    ['veg chop', 'Veg Chop fish chop.jpg'],
    ['fish finger', 'fish finger.png'],
    ['fish cutlet', 'fish cutlet chicken cutlet.png'],
    ['chicken cutlet', 'fish cutlet chicken cutlet.png'],
    ['veg cutlet', 'Veg Cutlet.jpg'],
    ['chicken kebab', 'turkish break kabab.jpg'],
    ['turkish', 'turkish break kabab.jpg'],
    ['chicken spring roll', 'spring roll paneer spring roll egg spring roll chicken.PNG'],
    ['egg spring roll', 'spring roll paneer spring roll egg spring roll chicken.PNG'],
    ['paneer spring', 'spring roll paneer spring roll egg spring roll chicken.PNG'],
    ['chicken drump', 'Chicken Drump Stick.PNG'],
    ['drum stick', 'Fry Momo.jpg'],
    ['chicken butter masala', 'Paneer Pizza.webp'],
    ['fry momo', 'Fry Momo.jpg'],
    ['steam momo', 'steem momo.webp'],
    ['small vada', 'Vada Pav small vada pav big.png'],
    ['vada pav', 'Vada Pav small vada pav big.png'],
    ['garlic bread', 'Garlic Bread.webp'],
    ['veg kachori', 'Veg Kachori.PNG'],
    ['veg wrap', 'Veg Sandwich.PNG'],
    ['veg puff', 'veg puff.png'],
    ['egg devil', 'Egg Devil.webp'],
    ['ram ball', 'RAM BALL.jpg'],
    ['gulab jamun', 'gulab-jamun-recipe-01.webp'],
    ['chocolate', 'Chocolate Cake.jpg']
];

export function resolveProductImage(name) {
    const key = String(name || '').toLowerCase()
        .replace(/\bchocko\b/g, 'choco')
        .replace(/\bvenilla\b/g, 'vanilla')
        .replace(/\bchocolet\b/g, 'chocolate')
        .replace(/\babric\b/g, 'arabic');
    const match = PRODUCT_IMAGE_HINTS.find(([needle]) => key.includes(needle));
    return IMAGE_DIR + (match ? match[1] : 'Chocolate Cake.jpg');
}

function isMissingProductImage(src) {
    return !src || /product-placeholder/i.test(src);
}

const MATCH_ALIASES = new Map([
    ['mango bento (large)', ['mango bento cake']],
    ['strawberry bento (large)', ['strawberry bento']],
    ['choco bento (large)', ['choco bento cake']],
    ['rasmalai pastry', ['rahsmalai pastry']],
    ['chocko chip pastry', ['choco chip pastry']],
    ['chocko lava pastry', ['choco lava pastry']],
    ['abric veg burger', ['arabic veg burger']],
    ['venilla muffin', ['vanilla muffin']],
    ['dark chocolet muffin', ['dark chocolate muffin']]
]);

function normalizeProductName(name) {
    return name.toLocaleLowerCase()
        .replace(/\bnon[\s-]*veg\b/g, ' ')
        .replace(/\bveg\b/g, ' ')
        .replace(/\b(cake|pastry)\b/g, ' ')
        .replace(/\bchocko\b/g, 'choco')
        .replace(/\bchocochip\b/g, 'choco chip')
        .replace(/\bblue\s+berry\b/g, 'blueberry')
        .replace(/\bvenilla\b/g, 'vanilla')
        .replace(/\bdark\s+chocolet\b/g, 'dark chocolate')
        .replace(/[^a-z0-9]/g, '');
}

function isNonVegName(name) {
    return /\bnon[\s-]*veg\b/i.test(name);
}

function isVegName(name) {
    return /\bveg\b/i.test(name) && !isNonVegName(name);
}

function parseCardPrice(card) {
    return Number((card.querySelector('.cake-price')?.textContent ?? '').replace(/[^\d.]/g, ''));
}

function createSection(root, group, referenceSection) {
    const section = document.createElement('section');
    section.className = 'gallery-section';
    section.dataset.catalogAdditions = group.id;
    section.style.cssText = 'padding-top:0; background:#e8f5ee;';

    const container = document.createElement('div');
    container.className = 'container';
    container.style.cssText = 'padding-top:clamp(36px,6vw,70px);';

    const header = document.createElement('div');
    header.className = 'group-header';
    header.setAttribute('onclick', 'toggleGroup(this)');
    const heading = document.createElement('h2');
    heading.textContent = group.title;
    const toggle = document.createElement('span');
    toggle.className = 'group-toggle';
    toggle.textContent = '▼';
    header.append(heading, toggle);

    const body = document.createElement('div');
    body.className = 'group-body';
    const grid = document.createElement('div');
    grid.className = 'gallery-grid';
    body.append(grid);
    container.append(header, body);
    section.append(container);

    if (group.placement === 'before-cakes') {
        referenceSection.before(section);
    } else if (group.placement === 'after-pastries') {
        referenceSection.after(section);
    } else {
        referenceSection.before(section);
    }
    return section;
}

function createProductCard(product) {
    const [name, size, price] = product;
    const displayName = size ? `${name} (${size})` : name;
    const card = document.createElement('div');
    card.className = 'cake-card';
    card.dataset.catalogAddition = 'true';

    const image = document.createElement('img');
    image.src = resolveProductImage(displayName);
    image.alt = displayName;
    image.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'cake-info';
    const heading = document.createElement('h3');
    heading.textContent = displayName;
    const priceLabel = document.createElement('p');
    priceLabel.className = 'cake-price';
    priceLabel.textContent = `₹ ${price}`;
    info.append(heading, priceLabel);

    const cart = document.createElement('div');
    cart.className = 'cake-cart';
    cart.innerHTML = '<button class="btn-add-cart">Add to Cart</button><div class="qty-controls"><button class="qty-btn qty-minus">&#8722;</button><span class="qty-num">1</span><button class="qty-btn qty-plus">+</button></div>';
    card.append(image, info, cart);
    return card;
}

function productNames(group, product) {
    const [name, size] = product;
    const displayName = size ? `${name} (${size})` : name;
    return [displayName, ...(MATCH_ALIASES.get(displayName.toLocaleLowerCase()) ?? [])];
}

function findSection(root, group) {
    if (group.id === 'eggless-cakes' || group.id === 'nonveg-cakes' || group.id === 'nonveg-pastries') {
        return root.querySelector(`[data-catalog-additions="${group.id}"]`);
    }

    const headingPattern = {
        pastries: /pastries/i,
        snacks: /puff.*snacks.*breads/i,
        savouries: /rolls.*chops/i,
        muffins: /muffins.*brownies/i,
        mousse: /mousse/i
    }[group.id];
    return [...root.querySelectorAll('.gallery-section')].find(section =>
        !section.dataset.catalogAdditions &&
        headingPattern.test(section.querySelector('.group-header h2')?.textContent ?? '')
    );
}

function getSearchSections(root, group, targetSection) {
    if (group.id === 'eggless-cakes' || group.id === 'nonveg-cakes') {
        return [...root.querySelectorAll('.gallery-section')].filter(section =>
            section !== targetSection &&
            !section.dataset.catalogAdditions &&
            /cakes/i.test(section.querySelector('.group-header h2')?.textContent ?? '')
        );
    }

    if (group.id === 'pastries') {
        return [...root.querySelectorAll('.gallery-section')].filter(section =>
            !section.dataset.catalogAdditions &&
            /pastries|sweets/i.test(section.querySelector('.group-header h2')?.textContent ?? '')
        );
    }

    if (group.id === 'nonveg-pastries') {
        return [...root.querySelectorAll('.gallery-section')].filter(section =>
            !section.dataset.catalogAdditions &&
            /pastries/i.test(section.querySelector('.group-header h2')?.textContent ?? '')
        );
    }

    if (group.id === 'snacks' || group.id === 'savouries') {
        return [...root.querySelectorAll('.gallery-section')].filter(section =>
            !section.dataset.catalogAdditions &&
            /puff.*snacks.*breads|rolls.*chops|sweets/i.test(section.querySelector('.group-header h2')?.textContent ?? '')
        );
    }
    return [targetSection];
}

function installGroup(root, group, referenceSections) {
    let section = findSection(root, group);
    if (!section) {
        const reference = group.placement === 'after-pastries'
            ? referenceSections.pastries
            : referenceSections.cakes;
        if (!reference) throw new Error(`Could not find a category for ${group.title}.`);
        section = createSection(root, group, reference);
    }
    return section.querySelector('.gallery-grid');
}

export function installCatalogAdditions(root) {
    if (root.documentElement?.dataset.catalogAdditionsInstalled || root.dataset?.catalogAdditionsInstalled) return;
    const referenceSections = {
        cakes: [...root.querySelectorAll('.gallery-section')].find(section =>
            /cakes/i.test(section.querySelector('.group-header h2')?.textContent ?? '')
        ),
        pastries: [...root.querySelectorAll('.gallery-section')].find(section =>
            /pastries/i.test(section.querySelector('.group-header h2')?.textContent ?? '')
        )
    };
    if (!referenceSections.pastries) throw new Error('Could not find the existing pastry category.');
    referenceSections.cakes ??= referenceSections.pastries;

    const grids = new Map();
    for (const group of GROUPS) {
        if (['snacks', 'savouries', 'muffins', 'mousse'].includes(group.id) && !findSection(root, group)) {
            throw new Error(`Could not find the existing category for ${group.title}.`);
        }
        grids.set(group.id, installGroup(root, group, referenceSections));
    }

    for (const group of GROUPS) {
        const targetSection = grids.get(group.id).closest('.gallery-section');
        const candidates = getSearchSections(root, group, targetSection)
            .flatMap(section => [...section.querySelectorAll('.cake-card')])
            .filter(card => !card.dataset.catalogAddition);

        for (const product of group.items) {
            const [, , price] = product;
            const names = productNames(group, product).map(normalizeProductName);
            const matched = candidates.find(card => {
                const currentName = card.querySelector('h3')?.textContent ?? '';
                const normalized = normalizeProductName(currentName);
                if (!names.includes(normalized)) return false;
                if (group.id === 'eggless-cakes' && isNonVegName(currentName)) return false;
                if ((group.id === 'nonveg-cakes' || group.id === 'nonveg-pastries') && isVegName(currentName)) return false;
                return Math.abs(parseCardPrice(card) - price) < 0.005;
            });

            if (matched) {
                grids.get(group.id).append(matched);
                continue;
            }

            const sameCategoryVariant = candidates.find(card => {
                const currentName = card.querySelector('h3')?.textContent ?? '';
                const normalized = normalizeProductName(currentName);
                if (!names.includes(normalized)) return false;
                if (group.id === 'eggless-cakes' && isNonVegName(currentName)) return false;
                if ((group.id === 'nonveg-cakes' || group.id === 'nonveg-pastries') && isVegName(currentName)) return false;
                if (group.id === 'nonveg-pastries' && !isNonVegName(currentName)) return false;
                return true;
            });

            if (sameCategoryVariant) {
                if (group.id === 'eggless-cakes' || group.id === 'nonveg-cakes') {
                    grids.get(group.id).append(sameCategoryVariant);
                    candidates.splice(candidates.indexOf(sameCategoryVariant), 1);
                }
                continue;
            }

            const newCard = createProductCard(product);
            grids.get(group.id).append(newCard);
            candidates.push(newCard);
        }
    }

    for (const card of root.querySelectorAll('.cake-card')) {
        const name = card.querySelector('h3')?.textContent ?? '';
        let image = card.querySelector('img');
        if (!image) {
            const placeholder = card.querySelector('.product-placeholder');
            image = document.createElement('img');
            image.alt = name;
            image.loading = 'lazy';
            if (placeholder) placeholder.replaceWith(image);
            else card.prepend(image);
        }
        if (isMissingProductImage(image.getAttribute('src'))) {
            image.src = resolveProductImage(name || image.alt);
            image.hidden = false;
        }
    }

    if (root.documentElement) root.documentElement.dataset.catalogAdditionsInstalled = 'true';
    else if (root.dataset) root.dataset.catalogAdditionsInstalled = 'true';
}
