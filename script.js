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
    const notifEl = document.getElementById('notification');
    if (notifEl) {
        notifEl.setAttribute('role', 'status');
        notifEl.setAttribute('aria-live', 'polite');
    }

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

    const filterEls = {
        categoryCheckboxes: document.querySelectorAll('input[name="category"]'),
        priceRange: document.getElementById('price'),
        priceValue: document.getElementById('priceValue'),
        sortSelect: document.getElementById('sort'),
        productGrid: document.querySelector('.product-grid')
    };

    const navbarEls = {
        hamburger: document.getElementById('hamburger'),
        navbarDropdown: document.getElementById('navbarDropdown'),
        navbarMenu: document.getElementById('navbarMenu'),
        scrollToTopBtn: document.getElementById('scrollToTop')
    };

    const contactEl = {
        form: document.getElementById('contactForm')
    };

    const navbarSearchForm = document.getElementById('navbarSearchForm');
    const navbarSearchInput = document.getElementById('navbarSearchInput');

    // --- Utility Functions ---

    /**
     * Show a non-blocking in-page notification.
     * @param {string} msg
     * @param {'success'|'error'|'info'} [type='info']
     */
    const showNotification = (msg, type = 'info') => {
        if (!notifEl) return;
        notifEl.textContent = msg;
        notifEl.classList.add('show', type);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notifEl.classList.remove('show', type);
            notifEl.textContent = '';
        }, 3000);
    };

    /**
     * Debounce helper to limit how often a function runs.
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    const debounce = (func, wait) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), wait);
        };
    };

    /**
     * Safely retrieve cart items from localStorage.
     * @returns {Array<Object>}
     */
    const getCartItems = () => {
        const data = localStorage.getItem('cartItems');
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            console.warn('Corrupted cartItems in localStorage. Resetting.');
            localStorage.removeItem('cartItems');
            return [];
        }
    };

    /**
     * Save the cart array to localStorage.
     * @param {Array<Object>} cart
     */
    const saveCartItems = cart => {
        localStorage.setItem('cartItems', JSON.stringify(cart));
    };

    /**
     * Retrieve the currently applied coupon code from localStorage.
     * @returns {string|null}
     */
    const getAppliedCouponCode = () => {
        return localStorage.getItem('cartCoupon') || null;
    };

    /**
     * Store a coupon code in localStorage.
     * @param {string|null} code
     */
    const setAppliedCouponCode = code => {
        if (code) localStorage.setItem('cartCoupon', code);
        else localStorage.removeItem('cartCoupon');
    };

    /**
     * Calculate shipping cost based on ZIP code.
     * @returns {number}
     */
    const calculateShippingCost = () => {
        const zip = cartEls.shippingZip?.value.trim() || '';
        if (!zip) return SHIPPING_DEFAULT;
        if (/^\d{5}$/.test(zip)) {
            return zip.startsWith('9') ? SHIPPING_WEST_COAST : SHIPPING_REST;
        }
        return SHIPPING_DEFAULT;
    };

    /**
     * Calculate discount amount based on coupon.
     * @param {number} itemsTotal
     * @returns {number}
     */
    const getDiscountAmount = itemsTotal => {
        const code = getAppliedCouponCode();
        if (!code || !COUPONS.hasOwnProperty(code)) return 0;
        const val = COUPONS[code];
        if (val === 'free') {
            return calculateShippingCost();
        }
        return typeof val === 'number' ? itemsTotal * val : 0;
    };

    /**
     * Calculate price breakdown: items total, tax, shipping, discount, grand total.
     * @returns {{itemsTotal: number, tax: number, shipping: number, discount: number, grandTotal: number}}
     */
    const calculatePriceBreakdown = () => {
        const cart = getCartItems();
        const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = parseFloat((itemsTotal * TAX_RATE).toFixed(2));
        const shipping = calculateShippingCost();
        const discount = parseFloat(getDiscountAmount(itemsTotal).toFixed(2));
        const grandTotal = parseFloat((itemsTotal + tax + shipping - discount).toFixed(2));
        return { itemsTotal, tax, shipping, discount, grandTotal };
    };

    /**
     * Render the price breakdown section on the cart page.
     */
    const renderPriceBreakdown = () => {
        const { itemsTotal, tax, shipping, discount, grandTotal } = calculatePriceBreakdown();
        if (cartEls.itemsTotal) cartEls.itemsTotal.textContent = itemsTotal.toFixed(2);
        if (cartEls.taxes) cartEls.taxes.textContent = tax.toFixed(2);
        if (cartEls.shippingCost) cartEls.shippingCost.textContent = shipping.toFixed(2);
        if (cartEls.discount) cartEls.discount.textContent = discount.toFixed(2);
        if (cartEls.cartTotal) cartEls.cartTotal.textContent = grandTotal.toFixed(2);
    };

    /**
     * Update the cart count badge (sum of all quantities).
     */
    const updateCartCount = () => {
        const cart = getCartItems();
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartEls.count) cartEls.count.textContent = totalCount;
        if (cartEls.dropdownCartCount) cartEls.dropdownCartCount.textContent = totalCount;
        if (cartEls.desktopCartCount) cartEls.desktopCartCount.textContent = totalCount;
    };

    /**
     * Add a product object to the cart or increment quantity if it exists.
     * @param {{id: string, name: string, price: number, image: string}} product
     */
    const addToCart = product => {
        const cart = getCartItems();
        const existingIndex = cart.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCartItems(cart);
        updateCartCount();
        showNotification('✔️ Item added to cart!', 'success');
    };

    /**
     * Render all cart items on the cart page and attach listeners.
     */
    const renderCartItems = () => {
        if (!cartEls.itemsContainer) return;
        const cart = getCartItems();
        cartEls.itemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartEls.itemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            if (cartEls.checkoutBtn) cartEls.checkoutBtn.disabled = true;
            renderPriceBreakdown();
            updateCartCount();
            return;
        }

        const listEl = document.createElement('ul');
        listEl.className = 'cart-list';

        cart.forEach(item => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.dataset.id = item.id;

            // Stock alert if low stock
            const stockAlert = (typeof item.stock === 'number' && item.stock < 5)
                ? `<p class="stock-alert" aria-live="polite">Only ${item.stock} left in stock!</p>`
                : '';

            const wishlistText = item.inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';

            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p>Size: ${item.size || 'N/A'}</p>
                    <p>Color: ${item.color || 'N/A'}</p>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    ${stockAlert}
                    <div class="cart-item-quantity">
                        <label for="quantity-${item.id}">Quantity for ${item.name}:</label>
                        <input type="number" id="quantity-${item.id}" class="quantity-input" data-id="${item.id}" min="1" value="${item.quantity}" aria-live="polite" />
                    </div>
                    <button class="btn btn-danger remove-item-btn" data-id="${item.id}">Remove</button>
                    <button class="btn btn-wishlist wishlist-btn" data-id="${item.id}">${wishlistText}</button>
                    <p><button class="link-btn size-fit-link" aria-disabled="true">Size & Fit Guide</button></p>
                </div>
            `;
            listEl.appendChild(li);
        });

        cartEls.itemsContainer.appendChild(listEl);

        if (cartEls.checkoutBtn) cartEls.checkoutBtn.disabled = false;
        renderPriceBreakdown();
        updateCartCount();
    };

    /**
     * Update a single cart item's quantity in localStorage and re-render prices.
     * @param {string} id
     * @param {number} newQty
     */
    const updateCartItemQuantity = (id, newQty) => {
        const cart = getCartItems();
        const idx = cart.findIndex(item => item.id === id);
        if (idx === -1) return;
        cart[idx].quantity = newQty < 1 ? 1 : newQty;
        saveCartItems(cart);
        renderPriceBreakdown();
        updateCartCount();
    };

    /**
     * Remove a single item from the cart by ID, then re-render.
     * @param {string} id
     */
    const removeCartItem = id => {
        let cart = getCartItems();
        cart = cart.filter(item => item.id !== id);
        saveCartItems(cart);
        renderCartItems();
    };

    /**
     * Toggle wishlist status for a cart item, then re-render.
     * @param {string} id
     */
    const toggleWishlist = id => {
        const cart = getCartItems();
        const idx = cart.findIndex(item => item.id === id);
        if (idx === -1) return;
        cart[idx].inWishlist = !cart[idx].inWishlist;
        saveCartItems(cart);
        renderCartItems();
    };

    /**
     * Apply a coupon code (if valid) and re-render price breakdown.
     */
    const applyCoupon = () => {
        const codeInput = (cartEls.couponInput?.value.trim() || '').toUpperCase();
        if (COUPONS.hasOwnProperty(codeInput)) {
            setAppliedCouponCode(codeInput);
            if (cartEls.couponMessage) {
                cartEls.couponMessage.textContent = `Coupon "${codeInput}" applied!`;
            }
            showNotification(`Coupon "${codeInput}" applied!`, 'success');
        } else {
            setAppliedCouponCode(null);
            if (cartEls.couponMessage) {
                cartEls.couponMessage.textContent = 'Invalid coupon code.';
            }
            showNotification('Invalid coupon code.', 'error');
        }
        renderPriceBreakdown();
    };

    /**
     * Estimate shipping cost based on ZIP and display it.
     */
    const estimateShipping = () => {
        const zip = cartEls.shippingZip?.value.trim() || '';
        if (!zip) {
            cartEls.shippingEstimateMessage.textContent = 'Please enter a ZIP/Postal Code.';
            return;
        }
        if (/^\d{5}$/.test(zip)) {
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
    };

    /**
     * Handle cart-page events (quantity changes, remove, wishlist, size & fit).
     * Uses event delegation for efficiency.
     * @param {Event} e
     */
    const handleCartPageInteraction = e => {
        const target = e.target;

        // Quantity change
        if (target.matches('.quantity-input')) {
            const id = target.dataset.id;
            let newQty = parseInt(target.value, 10);
            if (isNaN(newQty) || newQty < 1) {
                newQty = 1;
                target.value = '1';
            }
            updateCartItemQuantity(id, newQty);
            showNotification(`Quantity updated for item ID: ${id}`, 'info');
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

        // Size & Fit guide (placeholder)
        if (target.matches('.size-fit-link')) {
            e.preventDefault();
            showNotification('Size & Fit guide is coming soon!', 'info');
            return;
        }
    };

    /**
     * Retrieve a single query parameter value by name.
     * @param {string} param
     * @returns {string|null}
     */
    const getQueryParam = param => {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get(param);
    };

    /**
     * Filter and sort products based on selected categories, price, and sort order.
     */
    const filterProducts = () => {
        const grid = filterEls.productGrid;
        if (!grid) return;

        const selectedCategories = Array.from(filterEls.categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        const maxPrice = parseFloat(filterEls.priceRange?.value) || Infinity;
        const sortValue = filterEls.sortSelect?.value || 'name-asc';

        let items = Array.from(grid.querySelectorAll('.product-item'));

        // Category & price filter
        items.forEach(item => {
            const category = item.dataset.category || '';
            const price = parseFloat(item.dataset.price) || 0;
            const matchesCategory = !selectedCategories.length || selectedCategories.includes(category);
            const matchesPrice = price <= maxPrice;

            if (!(matchesCategory && matchesPrice)) {
                item.classList.add('hidden');
            } else {
                item.classList.remove('hidden');
            }
        });

        // Search filter
        items = filterProductsBySearch(items);

        // Sort visible products
        const visible = items.filter(item => !item.classList.contains('hidden'));
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

        visible.forEach(item => grid.appendChild(item));

        // Show “No results” if none visible
        const anyVisible = visible.length > 0;
        const noResultsEl = grid.querySelector('.no-results');
        if (!anyVisible) {
            if (!noResultsEl) {
                const msgEl = document.createElement('p');
                msgEl.className = 'no-results';
                msgEl.setAttribute('aria-live', 'polite');
                msgEl.textContent = 'No products match your criteria.';
                grid.appendChild(msgEl);
            }
        } else if (noResultsEl) {
            noResultsEl.remove();
        }
    };

    /**
     * If a search query is present in the URL, filter products by name/title.
     * @param {Array<Element>} products
     * @returns {Array<Element>}
     */
    const filterProductsBySearch = products => {
        const searchTerm = getQueryParam('search');
        if (!searchTerm) return products;
        const lowerSearch = searchTerm.toLowerCase();
        return products.filter(item => {
            const name = item.querySelector('h3')?.textContent?.toLowerCase() || '';
            return name.includes(lowerSearch);
        });
    };

    /**
     * Update URL parameters based on selected filters/sort, without reloading.
     */
    const updateURLParams = () => {
        const selectedCategories = Array.from(filterEls.categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        const maxPrice = filterEls.priceRange?.value || '';
        const sortValue = filterEls.sortSelect?.value || '';

        const params = new URLSearchParams();
        if (selectedCategories.length) params.set('category', selectedCategories.join(','));
        if (maxPrice) params.set('price', maxPrice);
        if (sortValue) params.set('sort', sortValue);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    };

    /**
     * Load filters and sort values from URL query parameters, update UI.
     */
    const loadFiltersFromURL = () => {
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
    };

    /**
     * Handle global clicks: add-to-cart or product-item redirect.
     * @param {Event} e
     */
    const handleGlobalClick = e => {
        const target = e.target;

        // ADD TO CART button
        if (target.matches('.add-to-cart')) {
            e.preventDefault();
            const productEl = target.closest('.product-item');
            if (!productEl) return;

            const product = {
                id: target.dataset.id || productEl.dataset.id || productEl.querySelector('h3')?.textContent || '',
                name: target.dataset.name || productEl.querySelector('h3')?.textContent || '',
                price: parseFloat(target.dataset.price || productEl.dataset.price || '0') || 0,
                image: target.dataset.image || productEl.querySelector('img')?.src || ''
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
    };

    /**
     * Toggle mobile navbar dropdown.
     */
    const openNavbarDropdown = () => {
        navbarEls.navbarDropdown.classList.add('active');
        navbarEls.navbarDropdown.setAttribute('aria-hidden', 'false');
        navbarEls.hamburger.setAttribute('aria-expanded', 'true');
    };

    const closeNavbarDropdown = () => {
        navbarEls.navbarDropdown.classList.remove('active');
        navbarEls.navbarDropdown.setAttribute('aria-hidden', 'true');
        navbarEls.hamburger.setAttribute('aria-expanded', 'false');
    };

    const toggleNavbarDropdown = e => {
        e.stopPropagation();
        if (!navbarEls.navbarDropdown || !navbarEls.hamburger) return;
        const isActive = navbarEls.navbarDropdown.classList.contains('active');
        isActive ? closeNavbarDropdown() : openNavbarDropdown();
    };

    /**
     * Basic contact form validation and feedback.
     */
    const setupContactForm = () => {
        if (!contactEl.form) return;
        contactEl.form.addEventListener('submit', e => {
            e.preventDefault();
            const { name, email, subject, message } = contactEl.form;
            const nameVal = name.value.trim();
            const emailVal = email.value.trim();
            const subjectVal = subject.value.trim();
            const messageVal = message.value.trim();

            if (!nameVal || !emailVal || !subjectVal || !messageVal) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailVal)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            // TODO: Actually send data to server via fetch/ajax
            showNotification(`Thank you, ${nameVal}! We'll get back to you soon.`, 'success');
            contactEl.form.reset();
        });
    };

    /**
     * On page load, initialize cart count and render cart if on cart page.
     */
    const setupCart = () => {
        updateCartCount();

        if (cartEls.itemsContainer) {
            // We are on the cart page
            renderCartItems();
            cartEls.itemsContainer.addEventListener('click', handleCartPageInteraction);
            cartEls.itemsContainer.addEventListener('input', handleCartPageInteraction);
        }

        // Coupon apply
        cartEls.applyCouponBtn?.addEventListener('click', e => {
            e.preventDefault();
            applyCoupon();
        });

        // Shipping estimate
        cartEls.estimateShippingBtn?.addEventListener('click', e => {
            e.preventDefault();
            estimateShipping();
        });

        // Proceed to Checkout
        cartEls.checkoutBtn?.addEventListener('click', e => {
            e.preventDefault();
            showNotification('Checkout functionality not implemented yet.', 'info');
            alert('Checkout functionality is not implemented yet.');
        });
    };

    /**
     * Initialize everything once DOM is ready.
     */
    const init = () => {
        // 1. Global click handler: add to cart / product redirect
        document.body.addEventListener('click', handleGlobalClick);

        // 2. Setup cart logic (if on cart page)
        setupCart();

        // 3. Category from URL (on product listing page)
        const catParam = getQueryParam('category');
        const categorySelectDropdown = document.getElementById('category');
        if (catParam && categorySelectDropdown) {
            const optExists = Array.from(categorySelectDropdown.options).some(opt => opt.value === catParam);
            if (optExists) categorySelectDropdown.value = catParam;
        }

        // 4. Search Bar
        if (navbarSearchForm && navbarSearchInput) {
            navbarSearchForm.addEventListener('submit', e => {
                e.preventDefault();
                const query = navbarSearchInput.value.trim();
                if (query.length) {
                    window.location.href = `./products.html?search=${encodeURIComponent(query)}`;
                } else {
                    navbarSearchInput.focus();
                }
            });
            navbarSearchInput.addEventListener('input', debounce(() => {
                // Optional: live suggestions or similar
            }, 300));
        }

        // 5. Filters: load from URL, then filter & set listeners
        loadFiltersFromURL();
        filterProducts();
        filterEls.categoryCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                filterProducts();
                updateURLParams();
            });
        });
        filterEls.priceRange?.addEventListener('input', debounce(() => {
            if (filterEls.priceValue) filterEls.priceValue.textContent = `$${filterEls.priceRange.value}`;
            filterProducts();
            updateURLParams();
        }, 200));
        filterEls.sortSelect?.addEventListener('change', () => {
            filterProducts();
            updateURLParams();
        });

        // 6. Navbar dropdown toggle & close on outside click or link click
        if (navbarEls.hamburger && navbarEls.navbarDropdown) {
            navbarEls.hamburger.addEventListener('click', toggleNavbarDropdown);
            document.addEventListener('click', e => {
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
                link.addEventListener('click', closeNavbarDropdown);
            });
        }

        // 7. Scroll-to-top button (debounced)
        if (navbarEls.scrollToTopBtn) {
            window.addEventListener('scroll', debounce(() => {
                navbarEls.scrollToTopBtn.style.display = window.pageYOffset > 100 ? 'block' : 'none';
            }, 100));
            navbarEls.scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // 8. Global focus listener for inputs (could be used for analytics or future UX)
        document.addEventListener('focusin', e => {
            if (e.target.matches('input')) {
                // Placeholder for analytics or future enhancements
                // console.log(`Input focused: ${e.target.id || e.target.name}`);
            }
        });

        // 9. Contact form validation
        setupContactForm();
    };

    window.addEventListener('DOMContentLoaded', init);
})();
