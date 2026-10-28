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
            ['Choco Chips Pastry', '', 35],
            ['Black Forest Pastry', '', 35],
            ['Blue Berry Pastry', '', 32],
            ['Butterscotch Pastry', '', 28],
            ['Strawberry Pastry', '', 32],
            ['Kiwi Pastry', '', 32],
            ['Dark Chocolate Pastry', '', 35],
            ['Mango Malai Pastry', '', 32],
            ['Coconut Pastry', '', 35],
            ['Pineapple Pastry', '', 25]
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
    ['choco almond', 'Honey Almond Cake.jpg'],
    ['honey almond', 'Honey Almond Cake.jpg'],
    ['pinata heart', 'Chocolate Heart Pastry.jpg'],
    ['pinata ball', 'RAM BALL.jpg'],
    ['chocolate heart', 'Chocolate Heart Pastry.jpg'],
    ['heart cake', 'Chocolate Heart Pastry.jpg'],
    ['strawberry bento', 'mango Bento.webp'],
    ['vanilla bento', 'Choco Bento.webp'],
    ['mango bento', 'mango Bento.webp'],
    ['choco bento', 'Choco Bento.webp'],
    ['donut strawberry', 'Strawberry Pastry.jpg'],
    ['donut chocolate', 'Chocolate Cake.jpg'],
    ['rasmalai cake', 'Rahsmalai Pastry.jpg'],
    ['rasmalai pastry', 'Rahsmalai Pastry.jpg'],
    ['rahsmalai', 'Rahsmalai Pastry.jpg'],
    ['white forest pastry', 'White Forest Pastry image.webp'],
    ['white forest', 'White Forest Cake.webp'],
    ['black forest pastry', 'Black Forest Pastry.avif'],
    ['black forest', 'Black Forest Cake Veg (Regular).webp'],
    ['dual forest', 'Dual Forest Cake.jpg'],
    ['mango malai pastry', 'Mango Malai Cake.jpg'],
    ['mango malai', 'Mango Malai Cake.jpg'],
    ['mango pastry', 'Mango Malai Cake.jpg'],
    ['choco truffle', 'Choco Truffle Cake Veg.webp'],
    ['choco vanilla', 'Choco Vanilla Cake.jpg'],
    ['choco chip pastry', 'Choco Chip Pastry.webp'],
    ['chocko chip', 'Choco Chip Pastry.webp'],
    ['choco chips pastry', 'Choco Chip Pastry.webp'],
    ['choco chip', 'Choco Chip Cake Veg.jpg'],
    ['chocochip', 'Choco Chip Cake Veg.jpg'],
    ['choco lava', 'Choco Lava Pastry.webp'],
    ['chocko lava', 'Choco Lava Pastry.webp'],
    ['choco delight', 'Choco Lava Pastry.webp'],
    ['milk chocolate', 'Milk Chocolate pastry.jpg'],
    ['butterscotch pastry', 'Butterscotch Pastry.jpg'],
    ['butterscotch', 'Butterscotch Cake Veg.webp'],
    ['pineapple pastry', 'Pineapple Pastry.jpg'],
    ['pineapple', 'Pineapple Cake.jpg'],
    ['red velvet pastry', 'Red Velvet Pastry.avif'],
    ['red velvet', 'Red Velvet Cake.jpg'],
    ['blueberry cake', 'Blue Berry Pastry.webp'],
    ['blue berry pastry', 'Blue Berry Pastry.webp'],
    ['blueberry', 'Blue Berry Pastry.webp'],
    ['berry blast', 'Blue Berry Pastry.webp'],
    ['strawberry pastry', 'Strawberry Pastry.jpg'],
    ['strawberry muffin', 'strayberry muffin.jpeg'],
    ['strawberry mousse', 'strawberry-mousse-recipe.webp'],
    ['strawberry cake', 'Strawberry Pastry.jpg'],
    ['strawberry', 'strawbery.jpeg'],
    ['kiwi', 'Pineapple Pastry.jpg'],
    ['orange pastry', 'Orange Pastry.webp'],
    ['coconut pastry', 'Coconut Pastry.jpg'],
    ['swiss roll', 'Sweetmilk Pastry.png'],
    ['cream roll', 'Sweetmilk Pastry.png'],
    ['ice cream pastry', 'White Forest Pastry image.webp'],
    ['fantasy coffee', 'Chocolate Mousse.jpeg'],
    ['coffee mousse', 'Chocolate Mousse.jpeg'],
    ['lolipop', 'RAM BALL.jpg'],
    ['lollipop', 'RAM BALL.jpg'],
    ['dark chocolate pastry', 'dark-chocolate.jpeg'],
    ['dark chocolate mousse', 'dark-chocolate.jpeg'],
    ['dark chocolet muffin', 'dark-chocolate.jpeg'],
    ['dark chocolate muffin', 'dark-chocolate.jpeg'],
    ['white chocolate mousse', 'Chocolate Mousse.jpeg'],
    ['chocolate mousse', 'Chocolate Mousse.jpeg'],
    ['chocolate cake', 'Chocolate Cake.jpg'],
    ['choco muffin', 'choco muffin.jpeg'],
    ['vanilla muffin', 'Choco Vanilla Cake.jpg'],
    ['venilla muffin', 'Choco Vanilla Cake.jpg'],
    ['brownie', 'brownie.jpg'],
    ['arabic veg burger', 'arabic veg burger.jpg'],
    ['abric veg burger', 'arabic veg burger.jpg'],
    ['chicken tikki burger', 'veg big burger.jpg'],
    ['chicken mini burger', 'veg big burger.jpg'],
    ['veg big burger', 'veg big burger.jpg'],
    ['veg mini burger', 'veg big burger.jpg'],
    ['hot dog', 'veg big burger.jpg'],
    ['white sauce pasta', 'pasta.jpg'],
    ['red sauce pasta', 'pasta.jpg'],
    ['pasta', 'pasta.jpg'],
    ['chicken puff', 'Paneer Puff.webp'],
    ['paneer puff', 'Paneer Puff.webp'],
    ['chicken pizza', 'Paneer Pizza.webp'],
    ['paneer pizza', 'Paneer Pizza.webp'],
    ['grill chicken sandwich', 'Italian Sandwich.jpg'],
    ['chicken sandwich', 'Italian Sandwich.jpg'],
    ['italian mini sandwich', 'Italian Sandwich.jpg'],
    ['italian sandwich', 'Italian Sandwich.jpg'],
    ['veg sandwich', 'Italian Sandwich.jpg'],
    ['chicken garlic samosa', 'Chinese Samosa.webp'],
    ['chinese samosa', 'Chinese Samosa.webp'],
    ['panjabi samosa', 'Veg Paneer Samosa.webp'],
    ['paneer samosa', 'Veg Paneer Samosa.webp'],
    ['chicken 65', 'Paneer Puff.webp'],
    ['paneer 65', 'Paneer Puff.webp'],
    ['green chicken bun', 'pav.jpeg'],
    ['chilli fish bun', 'pav.jpeg'],
    ['chicken croissant', 'Paneer Puff.webp'],
    ['paneer croissant', 'Paneer Puff.webp'],
    ['chicken cheese patties', 'Egg Patties.webp'],
    ['chilly chicken patties', 'Egg Patties.webp'],
    ['chicken patties', 'Egg Patties.webp'],
    ['egg patties', 'Egg Patties.webp'],
    ['chicken internet', 'Italian Sandwich.jpg'],
    ['chicken parcel', 'Paneer Puff.webp'],
    ['misti shuk', 'gulab-jamun-recipe-01.webp'],
    ['misti dahi', 'gulab-jamun-recipe-01.webp'],
    ['fish chop', 'Veg Chop.jpg'],
    ['veg chop', 'Veg Chop.jpg'],
    ['fish finger', 'Veg Cutlet.jpg'],
    ['fish cutlet', 'Veg Cutlet.jpg'],
    ['chicken cutlet', 'Veg Cutlet.jpg'],
    ['veg cutlet', 'Veg Cutlet.jpg'],
    ['chicken kebab', 'turkish break kabab.jpg'],
    ['turkish', 'turkish break kabab.jpg'],
    ['chicken spring roll', 'Egg Spring Roll.jpg'],
    ['egg spring roll', 'Egg Spring Roll.jpg'],
    ['paneer spring', 'paneer spring.webp'],
    ['chicken drump', 'Fry Momo.jpg'],
    ['drum stick', 'Fry Momo.jpg'],
    ['chicken butter masala', 'Paneer Pizza.webp'],
    ['fry momo', 'Fry Momo.jpg'],
    ['steam momo', 'steem momo.webp'],
    ['small vada', 'Small Vada Pav.webp'],
    ['vada pav', 'Vada Pav.webp'],
    ['garlic bread', 'Garlic Bread.webp'],
    ['veg kachori', 'Veg Kachori.webp'],
    ['veg wrap', 'Italian Sandwich.jpg'],
    ['veg puff', 'Veg Puff.jpg'],
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
    if (!referenceSections.cakes || !referenceSections.pastries) {
        throw new Error('Could not find the existing cake and pastry categories.');
    }

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
