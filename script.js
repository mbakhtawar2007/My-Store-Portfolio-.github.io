// script.js

/* Updated script.js with dynamic cart item management */

// Utility function to update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const cart = getCartItems();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalCount;
    }
}

// Get cart items from localStorage
function getCartItems() {
    const cart = localStorage.getItem('cartItems');
    return cart ? JSON.parse(cart) : [];
}

// Save cart items to localStorage
function saveCartItems(cart) {
    localStorage.setItem('cartItems', JSON.stringify(cart));
}

// Add item to cart with product details
function addToCart(product) {
    let cart = getCartItems();
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    saveCartItems(cart);
    updateCartCount();
    alert('Item added to cart!');
}

// Handle Add to Cart button click
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-cart')) {
        event.preventDefault(); // Prevent page refresh
        const productElement = event.target.closest('.product-item');
        if (!productElement) return;
        const product = {
            id: productElement.querySelector('h3')?.textContent || '',
            name: productElement.querySelector('h3')?.textContent || '',
            price: parseFloat(productElement.querySelector('p')?.textContent.replace('$', '')) || 0,
            image: productElement.querySelector('img')?.src || ''
        };
        addToCart(product);
    }
});

// Redirect to products.html?category on product card click except when clicking Add to Cart
document.addEventListener('click', (event) => {
    const productItem = event.target.closest('.product-item');
    if (productItem && !event.target.classList.contains('add-to-cart')) {
        const category = productItem.getAttribute('data-category');
        if (category) {
            window.location.href = `products.html?category=${encodeURIComponent(category)}`;
        }
    }
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// On page load, set the cart count from localStorage
window.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Render cart items if on cart page
    if (document.querySelector('.cart-items')) {
        renderCart();

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                alert('Checkout functionality is not implemented yet.');
            });
        }
    }

    // Set category filter dropdown based on URL query parameter
    const categoryParam = getQueryParam('category');
    const categorySelect = document.getElementById('category');
    if (categoryParam && categorySelect) {
        const optionExists = Array.from(categorySelect.options).some(
            option => option.value === categoryParam
        );
        if (optionExists) {
            categorySelect.value = categoryParam;
        }
    }

    filterProducts(); // Initialize filter on page load
    setupContactForm(); // Setup contact form handler
    setupSearchBar(); // Setup enhanced search bar
});

// Toggle the navbar menu on mobile
const hamburger = document.getElementById('hamburger');
const navbarMenu = document.querySelector('.navbar-center ul');

if (hamburger && navbarMenu) {
    hamburger.addEventListener('click', () => {
        const isActive = navbarMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isActive);
    });

    // Close navbar when a link is clicked on mobile
    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', () => {
            navbarMenu.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
}

// Scroll to Top Button Visibility
const scrollToTopBtn = document.getElementById('scrollToTop');

if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        scrollToTopBtn.style.display = window.pageYOffset > 100 ? 'block' : 'none';
    });

    // Scroll to the top when button is clicked
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Filter products based on category and price
const filterProducts = () => {
    const categorySelect = document.getElementById('category');
    const priceRange = document.getElementById('price');
    const category = categorySelect ? categorySelect.value : 'all';
    const price = priceRange ? parseFloat(priceRange.value) : Infinity;
    const products = document.querySelectorAll('.product-item');

    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        const productPrice = parseFloat(product.getAttribute('data-price')) || 0;

        product.style.display = (category === 'all' || category === productCategory) && productPrice <= price ? 'block' : 'none';
    });
};

// Add event listeners for filtering if elements exist
const categorySelect = document.getElementById('category');
const priceRange = document.getElementById('price');

if (categorySelect) {
    categorySelect.addEventListener('change', filterProducts);
}
if (priceRange) {
    priceRange.addEventListener('input', () => {
        const priceValue = document.getElementById('priceValue');
        if (priceValue) {
            priceValue.textContent = `$${priceRange.value}`;
        }
        filterProducts();
    });
}

// Search bar functionality
const searchInput = document.querySelector('.search-bar input[type="text"]');
const searchButton = document.querySelector('.search-bar button');

const performSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    const products = document.querySelectorAll('.product-item');
    let found = false;

    products.forEach(product => {
        const title = product.querySelector('h3')?.textContent.toLowerCase() || '';
        if (title.includes(query)) {
            product.style.display = 'block';
            found = true;
        } else {
            product.style.display = 'none';
        }
    });

    if (!found) {
        alert('No products found matching your search.');
    }
};

if (searchButton && searchInput) {
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

// Enhanced search bar setup for mobile toggle
function setupSearchBar() {
    const searchBar = document.querySelector('.search-bar');
    if (!searchBar) return;

    // For mobile, toggle search input visibility on clicking the search icon (::after content)
    searchBar.addEventListener('click', (e) => {
        if (window.innerWidth <= 767) {
            const input = searchBar.querySelector('input');
            const button = searchBar.querySelector('button');
            if (e.target === input || e.target === button) {
                return; // Ignore clicks on input or button
            }
            if (input.style.display === 'block') {
                input.style.display = 'none';
                if (button) button.style.display = 'none';
            } else {
                input.style.display = 'block';
                if (button) button.style.display = 'inline-block';
                input.focus();
            }
        }
    });
}

// Contact form submission handling
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = contactForm.name.value.trim();
        const email = contactForm.email.value.trim();
        const subject = contactForm.subject.value.trim();
        const message = contactForm.message.value.trim();

        if (!name || !email || !subject || !message) {
            alert('Please fill in all fields.');
            return;
        }

        // Basic email format validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Here you can add code to send the form data to a server if needed

        alert('Thank you for contacting us, ' + name + '! We will get back to you shortly.');

        contactForm.reset();
    });
}

// Render cart items dynamically on the cart page
function renderCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const itemsTotalElement = document.getElementById('items-total');
    const taxesElement = document.getElementById('taxes');
    const shippingCostElement = document.getElementById('shipping-cost');
    const discountElement = document.getElementById('discount');
    const couponMessage = document.getElementById('coupon-message');

    if (!cartItemsContainer || !cartTotalElement || !checkoutBtn || !itemsTotalElement || !taxesElement || !shippingCostElement || !discountElement) return;

    const cart = getCartItems();

    // Clear existing items
    cartItemsContainer.innerHTML = '';
    couponMessage.textContent = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        itemsTotalElement.textContent = '0.00';
        taxesElement.textContent = '0.00';
        shippingCostElement.textContent = '0.00';
        discountElement.textContent = '0.00';
        cartTotalElement.textContent = '0.00';
        checkoutBtn.disabled = true;
        updateCartCount();
        return;
    }

    // Create cart item elements
    cart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';

        // Stock alert if stock is low (less than 5)
        const stockAlert = item.stock !== undefined && item.stock < 5 ? `<p class="stock-alert">Only ${item.stock} left in stock!</p>` : '';

        // Wishlist button text based on wishlist status
        const wishlistText = item.inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';

        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p>Size: ${item.size || 'N/A'}</p>
                <p>Color: ${item.color || 'N/A'}</p>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                ${stockAlert}
                <div class="cart-item-quantity">
                    <label for="quantity-${index}">Quantity:</label>
                    <input type="number" id="quantity-${index}" min="1" value="${item.quantity}" />
                </div>
                <button class="btn btn-danger remove-item-btn" data-index="${index}">Remove</button>
                <button class="btn btn-wishlist wishlist-btn" data-index="${index}">${wishlistText}</button>
                <p><a href="#" class="size-fit-link">Size & Fit Guide</a></p>
            </div>
        `;

        cartItemsContainer.appendChild(itemDiv);
    });

    // Calculate price breakdown
    const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxes = itemsTotal * 0.08; // 8% tax
    const shippingCost = calculateShippingCost();
    const discount = getDiscountAmount();

    const grandTotal = itemsTotal + taxes + shippingCost - discount;

    itemsTotalElement.textContent = itemsTotal.toFixed(2);
    taxesElement.textContent = taxes.toFixed(2);
    shippingCostElement.textContent = shippingCost.toFixed(2);
    discountElement.textContent = discount.toFixed(2);
    cartTotalElement.textContent = grandTotal.toFixed(2);

    // Enable checkout button
    checkoutBtn.disabled = false;

    updateCartCount();

    // Add event listeners for quantity changes and remove buttons
    cartItemsContainer.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.id.split('-')[1]);
            let newQuantity = parseInt(e.target.value);
            if (isNaN(newQuantity) || newQuantity < 1) {
                newQuantity = 1;
                e.target.value = '1';
            }
            const cart = getCartItems();
            cart[index].quantity = newQuantity;
            saveCartItems(cart);
            renderCart();
        });
    });

    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            let cart = getCartItems();
            cart.splice(index, 1);
            saveCartItems(cart);
            renderCart();
        });
    });

    // Add event listeners for wishlist buttons
    cartItemsContainer.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            let cart = getCartItems();
            cart[index].inWishlist = !cart[index].inWishlist;
            saveCartItems(cart);
            renderCart();
        });
    });

    // Add event listeners for size & fit guide links
    cartItemsContainer.querySelectorAll('.size-fit-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Size & Fit guide is coming soon!');
        });
    });
}

// Calculate shipping cost based on ZIP code or default
function calculateShippingCost() {
    const shippingZip = document.getElementById('shipping-zip')?.value.trim();
    if (!shippingZip) {
        return 5.00; // Default shipping cost
    }
    // Simple mock: if ZIP starts with 9, cheaper shipping
    if (shippingZip.startsWith('9')) {
        return 3.50;
    }
    return 7.00;
}

// Coupon code logic
let appliedCoupon = null;
const coupons = {
    'SAVE10': 0.10, // 10% discount
    'FREESHIP': 'free-shipping', // free shipping
};

function getDiscountAmount() {
    if (!appliedCoupon) return 0;
    const cart = getCartItems();
    const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (appliedCoupon === 'free-shipping') {
        return calculateShippingCost();
    }
    if (typeof appliedCoupon === 'number') {
        return itemsTotal * appliedCoupon;
    }
    return 0;
}

document.getElementById('apply-coupon-btn')?.addEventListener('click', () => {
    const couponInput = document.getElementById('coupon-code');
    const couponMessage = document.getElementById('coupon-message');
    const code = couponInput.value.trim().toUpperCase();
    if (coupons.hasOwnProperty(code)) {
        appliedCoupon = coupons[code];
        couponMessage.textContent = `Coupon "${code}" applied!`;
    } else {
        appliedCoupon = null;
        couponMessage.textContent = 'Invalid coupon code.';
    }
    renderCart();
});

// Shipping estimation button
document.getElementById('estimate-shipping-btn')?.addEventListener('click', () => {
    const shippingZip = document.getElementById('shipping-zip')?.value.trim();
    const shippingEstimateMessage = document.getElementById('shipping-estimate-message');
    if (!shippingZip) {
        shippingEstimateMessage.textContent = 'Please enter a ZIP/Postal Code.';
        return;
    }
    // Mock estimation logic
    if (shippingZip.match(/^\d{5}$/)) {
        shippingEstimateMessage.textContent = `Estimated shipping cost: $${calculateShippingCost().toFixed(2)}`;
    } else {
        shippingEstimateMessage.textContent = 'Invalid ZIP/Postal Code format.';
    }
});
