// script.js

(() => {
    'use strict';

    // --- Cached Selectors ---
    // Notification banner (for inline feedback instead of alert)
    const notifEl = document.getElementById('notification'); // <div id="notification" aria-live="polite"></div>

    // Cart elements
    const cartCountEl = document.querySelector('.cart-count');
    const cartItemsContainer = document.querySelector('.cart-items');
    const itemsTotalEl = document.getElementById('items-total');
    const taxesEl = document.getElementById('taxes');
    const shippingCostEl = document.getElementById('shipping-cost');
    const discountEl = document.getElementById('discount');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const couponInputEl = document.getElementById('coupon-code');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const shippingZipEl = document.getElementById('shipping-zip');
    const estimateShippingBtn = document.getElementById('estimate-shipping-btn');
    const shippingEstimateMessageEl = document.getElementById('shipping-estimate-message');
    const couponMessageEl = document.getElementById('coupon-message');

    // Filter & Sort elements
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const priceRangeEl = document.getElementById('price');
    const priceValueEl = document.getElementById('priceValue');
    const sortSelectEl = document.getElementById('sort');
    const productGridEl = document.querySelector('.product-grid');

    // Navbar toggle
    const hamburgerEl = document.getElementById('hamburger');
    const navbarDropdownEl = document.getElementById('navbarDropdown');
    const navbarMenuEl = document.getElementById('navbarMenu'); // Should match aria-controls in HTML

    // Contact form
    const contactFormEl = document.getElementById('contactForm');

    // --- Search Bar Functionality ---
    const navbarSearchForm = document.getElementById('navbarSearchForm');
    const navbarSearchInput = document.getElementById('navbarSearchInput');

    if (navbarSearchForm && navbarSearchInput) {
        navbarSearchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const query = navbarSearchInput.value.trim();
            if (query.length > 0) {
                // Redirect to products.html with search param
                window.location.href = `./products.html?search=${encodeURIComponent(query)}`;
            } else {
                navbarSearchInput.focus();
            }
        });
    }

    // --- Utility Functions ---

    /**
     * Show a non-blocking in-page notification.
     * @param {string} msg - The message to display.
     * @param {'success'|'error'|'info'} [type='info'] - Style type.
     */
    function showNotification(msg, type = 'info') {
        if (!notifEl) return;
        notifEl.textContent = msg;
        notifEl.className = `show ${type}`; // e.g. .show.success or .show.error
        // Automatically clear after 3s
        setTimeout(() => {
            notifEl.className = '';
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
     * Calculate shipping cost. If ZIP (5 digits) starts with '9', cost is $3.50, else $7.00, default $5.00.
     * @returns {number}
     */
    function calculateShippingCost() {
        const zip = shippingZipEl?.value.trim() || '';
        if (!zip) return 5.0;
        if (/^\d{5}$/.test(zip)) {
            return zip.startsWith('9') ? 3.5 : 7.0;
        }
        return 5.0; // fallback default if format not exactly 5 digits
    }

    /**
     * Calculate discount amount based on coupon stored in localStorage.
     * @param {number} itemsTotal
     * @returns {number}
     */
    function getDiscountAmount(itemsTotal) {
        const code = getAppliedCouponCode();
        if (!code) return 0;
        const coupons = {
            'SAVE10': 0.10,       // 10% off
            'FREESHIP': 'free',   // free shipping
        };
        if (!coupons.hasOwnProperty(code)) return 0;

        const val = coupons[code];
        if (val === 'free') {
            return calculateShippingCost(); // full shipping cost waived
        }
        if (typeof val === 'number') {
            return itemsTotal * val;
        }
        return 0;
    }

    /**
     * Calculate price breakdown: items total, tax (8%), shipping, discount, grand total.
     * @returns {{itemsTotal:number, tax:number, shipping:number, discount:number, grandTotal:number}}
     */
    function calculatePriceBreakdown() {
        const cart = getCartItems();
        const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = parseFloat((itemsTotal * 0.08).toFixed(2));
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
        if (itemsTotalEl) itemsTotalEl.textContent = itemsTotal.toFixed(2);
        if (taxesEl) taxesEl.textContent = tax.toFixed(2);
        if (shippingCostEl) shippingCostEl.textContent = shipping.toFixed(2);
        if (discountEl) discountEl.textContent = discount.toFixed(2);
        if (cartTotalEl) cartTotalEl.textContent = grandTotal.toFixed(2);
    }

    /**
     * Update the cart count badge (sum of all quantities).
     */
    function updateCartCount() {
        if (!cartCountEl) return;
        const cart = getCartItems();
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalCount;
    }

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
        if (!cartItemsContainer) return;
        const cart = getCartItems();

        // Clear existing items
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            if (checkoutBtn) checkoutBtn.disabled = true;
            renderPriceBreakdown();
            updateCartCount();
            return;
        }

        // For each item, build its DOM row
        cart.forEach(item => {
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.dataset.id = item.id;

            // Stock alert (if item.stock exists and < 5)
            let stockInfo = '';
            if (typeof item.stock === 'number' && item.stock < 5) {
                stockInfo = `<p class="stock-alert">Only ${item.stock} left in stock!</p>`;
            }

            const wishlistText = item.inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';

            row.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.name}</h3>
          <p>Size: ${item.size || 'N/A'}</p>
          <p>Color: ${item.color || 'N/A'}</p>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
          ${stockInfo}
          <div class="cart-item-quantity">
            <label for="quantity-${item.id}">Quantity:</label>
            <input type="number" id="quantity-${item.id}" class="quantity-input" data-id="${item.id}" min="1" value="${item.quantity}" />
          </div>
          <button class="btn btn-danger remove-item-btn" data-id="${item.id}">Remove</button>
          <button class="btn btn-wishlist wishlist-btn" data-id="${item.id}">${wishlistText}</button>
          <p><a href="#" class="size-fit-link">Size & Fit Guide</a></p>
        </div>
      `;
            cartItemsContainer.appendChild(row);
        });

        // Enable checkout
        if (checkoutBtn) checkoutBtn.disabled = false;

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
        const code = (couponInputEl?.value.trim() || '').toUpperCase();
        const validCoupons = ['SAVE10', 'FREESHIP'];
        if (validCoupons.includes(code)) {
            setAppliedCouponCode(code);
            couponMessageEl.textContent = `Coupon "${code}" applied!`;
            showNotification(`Coupon "${code}" applied!`, 'success');
        } else {
            setAppliedCouponCode(null);
            couponMessageEl.textContent = 'Invalid coupon code.';
            showNotification('Invalid coupon code.', 'error');
        }
        renderPriceBreakdown();
    }

    /**
     * Estimate shipping cost (mock logic) and display it.
     */
    function estimateShipping() {
        const zip = shippingZipEl?.value.trim() || '';
        if (!zip) {
            shippingEstimateMessageEl.textContent = 'Please enter a ZIP/Postal Code.';
            return;
        }
        if (/^\d{5}$/.test(zip)) {
            const cost = calculateShippingCost().toFixed(2);
            shippingEstimateMessageEl.textContent = `Estimated shipping cost: $${cost}`;
        } else {
            shippingEstimateMessageEl.textContent = 'Invalid ZIP/Postal Code format.';
        }
        // After estimating, re-render price breakdown to update shipping in the total
        renderPriceBreakdown();
    }

    /**
     * Handle cart‐page events (quantity changes, remove, wishlist, size & fit).
     */
    function handleCartPageClick(e) {
        // Quantity change
        if (e.target.matches('.quantity-input')) {
            const id = e.target.dataset.id;
            let newQty = parseInt(e.target.value, 10);
            if (isNaN(newQty) || newQty < 1) {
                newQty = 1;
                e.target.value = '1';
            }
            updateCartItemQuantity(id, newQty);
            return;
        }

        // Remove item
        if (e.target.matches('.remove-item-btn')) {
            e.preventDefault();
            const id = e.target.dataset.id;
            removeCartItem(id);
            showNotification('Item removed from cart.', 'info');
            return;
        }

        // Wishlist toggle
        if (e.target.matches('.wishlist-btn')) {
            e.preventDefault();
            const id = e.target.dataset.id;
            toggleWishlist(id);
            showNotification('Wishlist status updated.', 'info');
            return;
        }

        // Size & Fit link
        if (e.target.matches('.size-fit-link')) {
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
        if (!productGridEl) return;
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        const maxPrice = parseFloat(priceRangeEl?.value) || Infinity;
        const sortValue = sortSelectEl?.value || 'name-asc';

        let items = Array.from(document.querySelectorAll('.product-item'));

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
        visible.forEach(p => productGridEl.appendChild(p));
    }

    /**
     * If a search query is present in the URL, filter products by name/title.
     */
    function filterProductsBySearch(products) {
        const urlParams = new URLSearchParams(window.location.search);
        const search = urlParams.get('search');
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
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        const maxPrice = priceRangeEl?.value || '';
        const sortValue = sortSelectEl?.value || '';

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
            categoryCheckboxes.forEach(cb => {
                cb.checked = cats.includes(cb.value);
            });
        }

        // Price
        const priceParam = params.get('price');
        if (priceParam && priceRangeEl && priceValueEl) {
            priceRangeEl.value = priceParam;
            priceValueEl.textContent = `$${priceParam}`;
        }

        // Sort
        const sortParam = params.get('sort');
        if (sortParam && sortSelectEl) {
            sortSelectEl.value = sortParam;
        }
    }

    /**
     * Handle global clicks: add-to-cart or product-item redirect.
     */
    function handleGlobalClick(e) {
        // ADD TO CART
        if (e.target.matches('.add-to-cart')) {
            e.preventDefault();
            const productEl = e.target.closest('.product-item');
            if (!productEl) return;
            const product = {
                id: productEl.querySelector('h3')?.textContent || '',
                name: productEl.querySelector('h3')?.textContent || '',
                price: parseFloat(productEl.querySelector('p')?.textContent.replace('$', '')) || 0,
                image: productEl.querySelector('img')?.src || ''
            };
            addToCart(product);
            return;
        }

        // PRODUCT CARD CLICK (redirect to category page)
        const prodItemEl = e.target.closest('.product-item');
        if (prodItemEl && !e.target.classList.contains('add-to-cart')) {
            const cat = prodItemEl.dataset.category;
            if (cat) {
                window.location.href = `products.html?category=${encodeURIComponent(cat)}`;
            }
        }
    }

    /**
     * Toggle mobile navbar: update aria-expanded, aria-hidden, and focus.
     */
    function toggleNavbarMenu() {
        const expanded = hamburgerEl.getAttribute('aria-expanded') === 'true';
        hamburgerEl.setAttribute('aria-expanded', String(!expanded));
        navbarMenuEl.setAttribute('aria-hidden', String(expanded));
        navbarMenuEl.classList.toggle('active');
        if (!expanded) {
            // Menu just opened: focus first link
            const firstLink = navbarMenuEl.querySelector('a');
            if (firstLink) firstLink.focus();
        } else {
            // Menu closed: return focus to hamburger
            hamburgerEl.focus();
        }
    }

    /**
     * Toggle mobile navbar dropdown
     */
    function toggleNavbarDropdown() {
        if (!navbarDropdownEl || !hamburgerEl) return;
        const isActive = navbarDropdownEl.classList.contains('active');
        if (isActive) {
            navbarDropdownEl.classList.remove('active');
            navbarDropdownEl.setAttribute('aria-hidden', 'true');
            hamburgerEl.setAttribute('aria-expanded', 'false');
        } else {
            navbarDropdownEl.classList.add('active');
            navbarDropdownEl.setAttribute('aria-hidden', 'false');
            hamburgerEl.setAttribute('aria-expanded', 'true');
        }
    }

    /**
     * Close navbar (used when a link is clicked on mobile).
     */
    function closeNavbarMenu() {
        hamburgerEl.setAttribute('aria-expanded', 'false');
        navbarMenuEl.setAttribute('aria-hidden', 'true');
        navbarMenuEl.classList.remove('active');
        hamburgerEl.focus();
    }

    /**
     * Setup all filter-related event listeners.
     */
    function setupFilterListeners() {
        // Category checkboxes
        categoryCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                filterProducts();
                updateURLParams();
            });
        });

        // Price range slider
        if (priceRangeEl) {
            priceRangeEl.addEventListener('input', () => {
                if (priceValueEl) priceValueEl.textContent = `$${priceRangeEl.value}`;
                filterProducts();
                updateURLParams();
            });
        }

        // Sort select
        if (sortSelectEl) {
            sortSelectEl.addEventListener('change', () => {
                filterProducts();
                updateURLParams();
            });
        }
    }

    /**
     * Basic contact form validation and feedback.
     */
    function setupContactForm() {
        if (!contactFormEl) return;
        contactFormEl.addEventListener('submit', e => {
            e.preventDefault();
            const name = contactFormEl.name.value.trim();
            const email = contactFormEl.email.value.trim();
            const subject = contactFormEl.subject.value.trim();
            const message = contactFormEl.message.value.trim();

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
            contactFormEl.reset();
        });
    }

    /**
     * On page load, initialize cart count and render cart if on cart page.
     */
    function setupCart() {
        updateCartCount();

        if (cartItemsContainer) {
            // We are on the cart page
            renderCartItems();

            // Attach event listeners for quantity, remove, wishlist, size/fit
            document.body.addEventListener('click', handleCartPageClick);
        }

        // Coupon code apply
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', e => {
                e.preventDefault();
                applyCoupon();
            });
        }

        // Shipping estimate
        if (estimateShippingBtn) {
            estimateShippingBtn.addEventListener('click', e => {
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

        // 4. Filters: load from URL, then filter & set listeners
        loadFiltersFromURL();
        filterProducts();
        setupFilterListeners();

        // 5. Navbar toggle (mobile) & close on link click
        if (hamburgerEl && navbarDropdownEl) {
            hamburgerEl.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleNavbarDropdown();
            });
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (navbarDropdownEl.classList.contains('active') && !navbarDropdownEl.contains(e.target) && e.target !== hamburgerEl) {
                    navbarDropdownEl.classList.remove('active');
                    navbarDropdownEl.setAttribute('aria-hidden', 'true');
                    hamburgerEl.setAttribute('aria-expanded', 'false');
                }
            });
            // Close dropdown on resize above 768px
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                    navbarDropdownEl.classList.remove('active');
                    navbarDropdownEl.setAttribute('aria-hidden', 'true');
                    hamburgerEl.setAttribute('aria-expanded', 'false');
                }
            });
            // Close dropdown when a link is clicked
            navbarDropdownEl.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navbarDropdownEl.classList.remove('active');
                    navbarDropdownEl.setAttribute('aria-hidden', 'true');
                    hamburgerEl.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // 6. Scroll-to-top button
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                scrollToTopBtn.style.display = window.pageYOffset > 100 ? 'block' : 'none';
            });
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // 8. Contact form
        setupContactForm();
    }

    // Wait for the DOM fully loaded, then run init
    window.addEventListener('DOMContentLoaded', init);

})();
