// script.js

(() => {
    'use strict';

    // --- Constants ---
    const TAX_RATE = 0.08;
    const SHIPPING_DEFAULT = 5.0;
    const SHIPPING_WEST_COAST = 3.5;
    const SHIPPING_REST = 7.0;
    const COUPONS = {
        SAVE10: 0.10,       // 10% off
        FREESHIP: 'free',   // free shipping
    };

    // --- Cached Selectors ---
    // Notification banner (for inline feedback instead of alert)
    const notifEl = document.getElementById('notification');
    if (notifEl) {
        notifEl.setAttribute('role', 'status');
        notifEl.setAttribute('aria-live', 'polite');
    }

    // Cart elements
    const cartEls = {
        count: document.querySelector('.cart-count'),
        itemsContainer: document.querySelector('.cart-items'),
        itemsTotal: document.getElementById('items-total'),
        taxes: document.getElementById('taxes'),
        shippingCost: document.getElementById('shipping-cost'),
        discount: document.getElementById('discount'),
        cartTotal: document.getElementById('cart-total'),
        checkoutBtn: document.getElementById('checkout-btn'),
        couponInput: document.getElementById('coupon-code'),
        applyCouponBtn: document.getElementById('apply-coupon-btn'),
        couponMessage: document.getElementById('coupon-message'),
        shippingZip: document.getElementById('shipping-zip'),
        estimateShippingBtn: document.getElementById('estimate-shipping-btn'),
        shippingEstimateMessage: document.getElementById('shipping-estimate-message'),
        dropdownCartCount: document.querySelector('.navbar-dropdown .dropdown-cart .cart-count'),
        desktopCartCount: document.querySelector('.navbar-cart.desktop-cart .cart-count')
    };

    // Filter & Sort elements
    const filterEls = {
        categoryCheckboxes: document.querySelectorAll('input[name="category"]'),
        priceRange: document.getElementById('price'),
        priceValue: document.getElementById('priceValue'),
        sortSelect: document.getElementById('sort'),
        productGrid: document.querySelector('.product-grid')
    };

    // Navbar toggle
    const navbarEls = {
        hamburger: document.getElementById('hamburger'),
        navbarDropdown: document.getElementById('navbarDropdown'),
        navbarMenu: document.getElementById('navbarMenu'),
        scrollToTopBtn: document.getElementById('scrollToTop')
    };

    // Contact form
    const contactEl = {
        form: document.getElementById('contactForm')
    };

    // Search Bar
    const navbarSearchForm = document.getElementById('navbarSearchForm');
    const navbarSearchInput = document.getElementById('navbarSearchInput');

    // --- Utility Functions ---

    /**
     * Show a non-blocking in-page notification.
     * @param {string} msg - The message to display.
     * @param {'success'|'error'|'info'} [type='info'] - Style type.
     */
    function showNotification(msg, type = 'info') {
        if (!notifEl) return;
        notifEl.textContent = msg;
        notifEl.classList.add('show', type);
        // Automatically clear after 3s
        setTimeout(() => {
            notifEl.classList.remove('show', type);
            notifEl.textContent = '';
        }, 3000);
    }

    /**
     * Debounce helper to limit how often a function runs.
     * @param {Function} func - The function to debounce.
     * @param {number} wait - Delay in ms.
     * @returns {Function} - Debounced function.
     */
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Safely retrieve cart items from localStorage. If JSON.parse fails, reset it.
     * @returns {Array<Object>}
     */
    function getCartItems() {
        const data = localStorage.getItem('cartItems');
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch (err) {
            console.warn('Corrupted cartItems in localStorage. Resetting to empty array.');
            localStorage.removeItem('cartItems');
            return [];
        }
    }

    /**
     * Save the cart array to localStorage.
     * @param {Array<Object>} cart
     */
    function saveCartItems(cart) {
        localStorage.setItem('cartItems', JSON.stringify(cart));
    }

    /**
     * Retrieve the currently applied coupon code from localStorage.
     * @returns {string|null}
     */
    function getAppliedCouponCode() {
        return localStorage.getItem('cartCoupon') || null;
    }

    /**
     * Store a coupon code in localStorage.
     * @param {string|null} code
     */
    function setAppliedCouponCode(code) {
        if (code) localStorage.setItem('cartCoupon', code);
        else localStorage.removeItem('cartCoupon');
    }

    /**
     * Calculate shipping cost. If ZIP (5 digits) starts with '9', cost is WEST_COAST, else REST, default DEFAULT.
     * @returns {number}
     */
    function calculateShippingCost() {
        const zip = cartEls.shippingZip?.value.trim() || '';
        if (!zip) return SHIPPING_DEFAULT;
        if (/^\d{5}$/.test(zip)) {
            return zip.startsWith('9') ? SHIPPING_WEST_COAST : SHIPPING_REST;
        }
        return SHIPPING_DEFAULT; // fallback default if format not exactly 5 digits
    }

    /**
     * Calculate discount amount based on coupon stored in localStorage.
     * @param {number} itemsTotal
     * @returns {number}
     */
    function getDiscountAmount(itemsTotal) {
        const code = getAppliedCouponCode();
        if (!code || !COUPONS.hasOwnProperty(code)) return 0;
        const val = COUPONS[code];
        if (val === 'free') {
            return calculateShippingCost();
        }
        if (typeof val === 'number') {
            return itemsTotal * val;
        }
        return 0;
    }

    /**
     * Calculate price breakdown: items total, tax, shipping, discount, grand total.
     * @returns {{itemsTotal:number, tax:number, shipping:number, discount:number, grandTotal:number}}
     */
    function calculatePriceBreakdown() {
        const cart = getCartItems();
        const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = parseFloat((itemsTotal * TAX_RATE).toFixed(2));
        const shipping = calculateShippingCost();
        const discount = parseFloat(getDiscountAmount(itemsTotal).toFixed(2));
        const grandTotal = parseFloat((itemsTotal + tax + shipping - discount).toFixed(2));
        return { itemsTotal, tax, shipping, discount, grandTotal };
    }

    /**
     * Render the price breakdown section on the cart page.
     */
    function renderPriceBreakdown() {
        const { itemsTotal, tax, shipping, discount, grandTotal } = calculatePriceBreakdown();
        if (cartEls.itemsTotal) cartEls.itemsTotal.textContent = itemsTotal.toFixed(2);
        if (cartEls.taxes) cartEls.taxes.textContent = tax.toFixed(2);
        if (cartEls.shippingCost) cartEls.shippingCost.textContent = shipping.toFixed(2);
        if (cartEls.discount) cartEls.discount.textContent = discount.toFixed(2);
        if (cartEls.cartTotal) cartEls.cartTotal.textContent = grandTotal.toFixed(2);
    }

    /**
     * Update the cart count badge (sum of all quantities).
     */
    function updateCartCount() {
        if (!cartEls.count) return;
        const cart = getCartItems();
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartEls.count.textContent = totalCount;
    }

    /**
     * Update the cart count in the navbar dropdown.
     */
    function updateDropdownCartCount() {
        if (cartEls.dropdownCartCount && cartEls.count) {
            cartEls.dropdownCartCount.textContent = cartEls.count.textContent;
        }
    }

    /**
     * Update the cart count in the desktop cart icon.
     */
    function updateDesktopCartCount() {
        if (cartEls.desktopCartCount && cartEls.count) {
            cartEls.desktopCartCount.textContent = cartEls.count.textContent;
        }
    }

    // Patch updateCartCount to also update dropdown & desktop badges
    const origUpdateCartCount = updateCartCount;
    window.updateCartCount = function () {
        origUpdateCartCount();
        updateDropdownCartCount();
        updateDesktopCartCount();
    };
    // Initial sync on load
    updateDropdownCartCount();
    updateDesktopCartCount();

    /**
     * Add a product object to the cart (in localStorage), or increment quantity if it already exists.
     * @param {{id:string, name:string, price:number, image:string}} product
     */
    function addToCart(product) {
        const cart = getCartItems();
        const idx = cart.findIndex(item => item.id === product.id);
        if (idx > -1) {
            cart[idx].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCartItems(cart);
        updateCartCount();
        showNotification('✔️ Item added to cart!', 'success');
    }

    /**
     * Render all cart items on the cart page and attach listeners.
     */
    function renderCartItems() {
        if (!cartEls.itemsContainer) return;
        const cart = getCartItems();

        // Clear existing items
        cartEls.itemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartEls.itemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            if (cartEls.checkoutBtn) cartEls.checkoutBtn.disabled = true;
            renderPriceBreakdown();
            updateCartCount();
            return;
        }

        // Create a <ul> for semantic markup
        const listEl = document.createElement('ul');
        listEl.className = 'cart-list';

        cart.forEach(item => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.dataset.id = item.id;

            // Stock alert
            let stockInfo = '';
            if (typeof item.stock === 'number' && item.stock < 5) {
                stockInfo = `<p class="stock-alert" aria-live="polite">Only ${item.stock} left in stock!</p>`;
            }

            const wishlistText = item.inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
                <div class="cart-item-details">
                  <h3 class="cart-item-name">${item.name}</h3>
                  <p>Size: ${item.size || 'N/A'}</p>
                  <p>Color: ${item.color || 'N/A'}</p>
                  <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                  ${stockInfo}
                  <div class="cart-item-quantity">
                    <label for="quantity-${item.id}">Quantity for ${item.name}:</label>
                    <input type="number" id="quantity-${item.id}" class="quantity-input" data-id="${item.id}" min="1" value="${item.quantity}" />
                  </div>
                  <button class="btn btn-danger remove-item-btn" data-id="${item.id}">Remove</button>
                  <button class="btn btn-wishlist wishlist-btn" data-id="${item.id}">${wishlistText}</button>
                  <p><button class="link-btn size-fit-link" aria-disabled="true">Size & Fit Guide</button></p>
                </div>
            `;
            listEl.appendChild(li);
        });

        cartEls.itemsContainer.appendChild(listEl);

        // Enable checkout
        if (cartEls.checkoutBtn) cartEls.checkoutBtn.disabled = false;

        // Render prices
        renderPriceBreakdown();

        // Update cart count
        updateCartCount();
    }

    /**
     * Update a single cart item's quantity in localStorage and re-render prices.
     * @param {string} id
     * @param {number} newQty
     */
    function updateCartItemQuantity(id, newQty) {
        const cart = getCartItems();
        const idx = cart.findIndex(item => item.id === id);
        if (idx === -1) return;
        cart[idx].quantity = newQty < 1 ? 1 : newQty;
        saveCartItems(cart);
        renderPriceBreakdown();
        updateCartCount();
    }

    /**
     * Remove a single item from the cart by ID, then re-render everything.
     * @param {string} id
     */
    function removeCartItem(id) {
        let cart = getCartItems();
        cart = cart.filter(item => item.id !== id);
        saveCartItems(cart);
        renderCartItems();
    }

    /**
     * Toggle wishlist status for a cart item (persist locally), then re-render the cart UI.
     * @param {string} id
     */
    function toggleWishlist(id) {
        const cart = getCartItems();
        const idx = cart.findIndex(item => item.id === id);
        if (idx === -1) return;
        cart[idx].inWishlist = !cart[idx].inWishlist;
        saveCartItems(cart);
        renderCartItems();
    }

    /**
     * Apply a coupon code (if valid) and re-render price breakdown.
     */
    function applyCoupon() {
        const code = (cartEls.couponInput?.value.trim() || '').toUpperCase();
        if (COUPONS.hasOwnProperty(code)) {
            setAppliedCouponCode(code);
            cartEls.couponMessage.textContent = `Coupon "${code}" applied!`;
            showNotification(`Coupon "${code}" applied!`, 'success');
        } else {
            setAppliedCouponCode(null);
            cartEls.couponMessage.textContent = 'Invalid coupon code.';
            showNotification('Invalid coupon code.', 'error');
        }
        renderPriceBreakdown();
    }

    /**
     * Estimate shipping cost based on ZIP and display it.
     */
    function estimateShipping() {
        const zip = cartEls.shippingZip?.value.trim() || '';
        if (!zip) {
            cartEls.shippingEstimateMessage.textContent = 'Please enter a ZIP/Postal Code.';
            return;
        }
        if (/^\d{5}$/.test(zip)) {
            // If FREESHIP coupon applied, show free shipping
            if (getAppliedCouponCode() === 'FREESHIP') {
                cartEls.shippingEstimateMessage.textContent = 'Shipping is free with your coupon!';
            } else {
                const cost = calculateShippingCost().toFixed(2);
                cartEls.shippingEstimateMessage.textContent = `Estimated shipping cost: $${cost}`;
            }
        } else {
            cartEls.shippingEstimateMessage.textContent = 'Invalid ZIP/Postal Code format.';
        }
        renderPriceBreakdown();
    }

    /**
     * Handle cart‐page events (quantity changes, remove, wishlist, size & fit).
     */
    function handleCartPageClick(e) {
        const target = e.target;
        // Quantity change (use 'input' event on quantity inputs)
        if (target.matches('.quantity-input')) {
            const id = target.dataset.id;
            let newQty = parseInt(target.value, 10);
            if (isNaN(newQty) || newQty < 1) {
                newQty = 1;
                target.value = '1';
            }
            updateCartItemQuantity(id, newQty);
            return;
        }

        // Remove item
        if (target.matches('.remove-item-btn')) {
            e.preventDefault();
            const id = target.dataset.id;
            removeCartItem(id);
            showNotification('Item removed from cart.', 'info');
            return;
        }

        // Wishlist toggle
        if (target.matches('.wishlist-btn')) {
            e.preventDefault();
            const id = target.dataset.id;
            toggleWishlist(id);
            showNotification('Wishlist status updated.', 'info');
            return;
        }

        // Size & Fit link (disabled)
        if (target.matches('.size-fit-link')) {
            e.preventDefault();
            showNotification('Size & Fit guide is coming soon!', 'info');
        }
    }

    /**
     * Retrieve a single query parameter value by name.
     * @param {string} param
     * @returns {string|null}
     */
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    /**
     * Filter and sort products based on selected categories, price, and sort order.
     */
    function filterProducts() {
        const grid = filterEls.productGrid;
        if (!grid) return;

        const selectedCategories = Array.from(filterEls.categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        const maxPrice = parseFloat(filterEls.priceRange?.value) || Infinity;
        const sortValue = filterEls.sortSelect?.value || 'name-asc';

        let items = Array.from(grid.querySelectorAll('.product-item'));

        items.forEach(prod => {
            const category = prod.dataset.category || '';
            const price = parseFloat(prod.dataset.price) || 0;
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
            const matchesPrice = price <= maxPrice;

            if (matchesCategory && matchesPrice) {
                prod.classList.remove('hidden');
            } else {
                prod.classList.add('hidden');
            }
        });

        // Filter by search query if present
        items = filterProductsBySearch(items);

        // Sort only the visible products
        const visible = items.filter(p => !p.classList.contains('hidden'));
        visible.sort((a, b) => {
            const nameA = a.querySelector('h3')?.textContent.toLowerCase() || '';
            const nameB = b.querySelector('h3')?.textContent.toLowerCase() || '';
            const priceA = parseFloat(a.dataset.price) || 0;
            const priceB = parseFloat(b.dataset.price) || 0;
            switch (sortValue) {
                case 'name-asc': return nameA.localeCompare(nameB);
                case 'name-desc': return nameB.localeCompare(nameA);
                case 'price-asc': return priceA - priceB;
                case 'price-desc': return priceB - priceA;
                default: return 0;
            }
        });

        // Re-append in sorted order
        visible.forEach(p => grid.appendChild(p));

        // If no products visible, show a "No results" message
        const anyVisible = visible.length > 0;
        let noResultsEl = grid.querySelector('.no-results');
        if (!anyVisible) {
            if (!noResultsEl) {
                noResultsEl = document.createElement('p');
                noResultsEl.className = 'no-results';
                noResultsEl.setAttribute('aria-live', 'polite');
                noResultsEl.textContent = 'No products match your criteria.';
                grid.appendChild(noResultsEl);
            }
        } else if (noResultsEl) {
            noResultsEl.remove();
        }
    }

    /**
     * If a search query is present in the URL, filter products by name/title.
     */
    function filterProductsBySearch(products) {
        const search = getQueryParam('search');
        if (!search) return products;
        const searchLower = search.toLowerCase();
        return products.filter(item => {
            const name = item.querySelector('h3')?.textContent?.toLowerCase() || '';
            return name.includes(searchLower);
        });
    }

    /**
     * Update URL parameters based on selected filters/sort, without reloading.
     */
    function updateURLParams() {
        const selectedCategories = Array.from(filterEls.categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        const maxPrice = filterEls.priceRange?.value || '';
        const sortValue = filterEls.sortSelect?.value || '';

        const params = new URLSearchParams();
        if (selectedCategories.length) params.set('category', selectedCategories.join(','));
        if (maxPrice) params.set('price', maxPrice);
        if (sortValue) params.set('sort', sortValue);

        const newUrl = window.location.pathname + '?' + params.toString();
        window.history.replaceState({}, '', newUrl);
    }

    /**
     * Load filters and sort values from URL query parameters, update UI.
     */
    function loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);

        // Categories
        const catParam = params.get('category');
        if (catParam) {
            const cats = catParam.split(',');
            filterEls.categoryCheckboxes.forEach(cb => {
                cb.checked = cats.includes(cb.value);
            });
        }

        // Price
        const priceParam = params.get('price');
        if (priceParam && filterEls.priceRange && filterEls.priceValue) {
            filterEls.priceRange.value = priceParam;
            filterEls.priceValue.textContent = `$${priceParam}`;
        }

        // Sort
        const sortParam = params.get('sort');
        if (sortParam && filterEls.sortSelect) {
            filterEls.sortSelect.value = sortParam;
        }
    }

    /**
     * Handle global clicks: add-to-cart or product-item redirect.
     */
    function handleGlobalClick(e) {
        const target = e.target;

        // ADD TO CART
        if (target.matches('.add-to-cart')) {
            e.preventDefault();
            const productEl = target.closest('.product-item');
            if (!productEl) return;
            // Assuming data attributes on the button for reliability
            const btn = target;
            const product = {
                id: btn.dataset.id || productEl.dataset.id || productEl.querySelector('h3')?.textContent || '',
                name: btn.dataset.name || productEl.querySelector('h3')?.textContent || '',
                price: parseFloat(btn.dataset.price || productEl.dataset.price || '0') || 0,
                image: btn.dataset.image || productEl.querySelector('img')?.src || ''
            };
            addToCart(product);
            return;
        }

        // PRODUCT CARD CLICK (redirect to category page), avoid inner buttons/links
        const prodItemEl = target.closest('.product-item');
        if (prodItemEl && !target.closest('button') && !target.closest('a')) {
            const cat = prodItemEl.dataset.category;
            if (cat) {
                window.location.href = `products.html?category=${encodeURIComponent(cat)}`;
            }
        }
    }

    /**
     * Toggle mobile navbar dropdown
     */
    function openNavbarDropdown() {
        navbarEls.navbarDropdown.classList.add('active');
        navbarEls.navbarDropdown.setAttribute('aria-hidden', 'false');
        navbarEls.hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeNavbarDropdown() {
        navbarEls.navbarDropdown.classList.remove('active');
        navbarEls.navbarDropdown.setAttribute('aria-hidden', 'true');
        navbarEls.hamburger.setAttribute('aria-expanded', 'false');
    }

    function toggleNavbarDropdown() {
        if (!navbarEls.navbarDropdown || !navbarEls.hamburger) return;
        const isActive = navbarEls.navbarDropdown.classList.contains('active');
        if (isActive) closeNavbarDropdown();
        else openNavbarDropdown();
    }

    /**
     * Setup all filter-related event listeners.
     */
    function setupFilterListeners() {
        // Category checkboxes
        filterEls.categoryCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                filterProducts();
                updateURLParams();
            });
        });

        // Price range slider (debounced)
        if (filterEls.priceRange) {
            filterEls.priceRange.addEventListener('input', debounce(() => {
                if (filterEls.priceValue) filterEls.priceValue.textContent = `$${filterEls.priceRange.value}`;
                filterProducts();
                updateURLParams();
            }, 200));
        }

        // Sort select
        if (filterEls.sortSelect) {
            filterEls.sortSelect.addEventListener('change', () => {
                filterProducts();
                updateURLParams();
            });
        }
    }

    /**
     * Basic contact form validation and feedback.
     */
    function setupContactForm() {
        if (!contactEl.form) return;
        contactEl.form.addEventListener('submit', e => {
            e.preventDefault();
            const name = contactEl.form.name.value.trim();
            const email = contactEl.form.email.value.trim();
            const subject = contactEl.form.subject.value.trim();
            const message = contactEl.form.message.value.trim();

            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            // (You can add a fetch/ajax call here to send data to your server.)
            showNotification(`Thank you, ${name}! We'll get back to you soon.`, 'success');
            contactEl.form.reset();
        });
    }

    /**
     * On page load, initialize cart count and render cart if on cart page.
     */
    function setupCart() {
        updateCartCount();

        if (cartEls.itemsContainer) {
            // We are on the cart page
            renderCartItems();
            cartEls.itemsContainer.addEventListener('click', handleCartPageClick);
            cartEls.itemsContainer.addEventListener('input', handleCartPageClick);
        }

        // Coupon code apply
        if (cartEls.applyCouponBtn) {
            cartEls.applyCouponBtn.addEventListener('click', e => {
                e.preventDefault();
                applyCoupon();
            });
        }

        // Shipping estimate
        if (cartEls.estimateShippingBtn) {
            cartEls.estimateShippingBtn.addEventListener('click', e => {
                e.preventDefault();
                estimateShipping();
            });
        }
    }

    /**
     * Initialize everything once DOM is ready.
     */
    function init() {
        // 1. Global click handler: add to cart / product redirect
        document.body.addEventListener('click', handleGlobalClick);

        // 2. Setup cart logic (if on cart page)
        setupCart();

        // 3. Category from URL (on product listing page)
        const catParam = getQueryParam('category');
        const categorySelectDropdown = document.getElementById('category');
        if (catParam && categorySelectDropdown) {
            const optExists = Array.from(categorySelectDropdown.options).some(
                opt => opt.value === catParam
            );
            if (optExists) categorySelectDropdown.value = catParam;
        }

        // 4. Search Bar
        if (navbarSearchForm && navbarSearchInput) {
            navbarSearchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const query = navbarSearchInput.value.trim();
                if (query.length > 0) {
                    window.location.href = `./products.html?search=${encodeURIComponent(query)}`;
                } else {
                    navbarSearchInput.focus();
                }
            });
        }

        // 5. Filters: load from URL, then filter & set listeners
        loadFiltersFromURL();
        filterProducts();
        setupFilterListeners();

        // 6. Navbar dropdown toggle & close on outside click or link click
        if (navbarEls.hamburger && navbarEls.navbarDropdown) {
            navbarEls.hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleNavbarDropdown();
            });
            document.addEventListener('click', (e) => {
                if (
                    navbarEls.navbarDropdown.classList.contains('active') &&
                    !navbarEls.navbarDropdown.contains(e.target) &&
                    e.target !== navbarEls.hamburger
                ) {
                    closeNavbarDropdown();
                }
            });
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                    closeNavbarDropdown();
                }
            });
            navbarEls.navbarDropdown.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    closeNavbarDropdown();
                });
            });
        }

        // 7. Scroll-to-top button (throttled)
        if (navbarEls.scrollToTopBtn) {
            window.addEventListener('scroll', debounce(() => {
                navbarEls.scrollToTopBtn.style.display = window.pageYOffset > 100 ? 'block' : 'none';
            }, 100));
            navbarEls.scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // 8. Contact form
        setupContactForm();
    }

    // Wait for the DOM fully loaded, then run init
    window.addEventListener('DOMContentLoaded', init);
})();
