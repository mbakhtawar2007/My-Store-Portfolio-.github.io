// script.js

// Utility function to update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const currentCount = parseInt(localStorage.getItem('cartCount')) || 0;
    cartCount.textContent = currentCount;
}

// Function to handle adding items to the cart
function addToCart() {
    let currentCount = parseInt(localStorage.getItem('cartCount')) || 0;
    currentCount += 1;
    localStorage.setItem('cartCount', currentCount);
    updateCartCount();
    alert('Item added to cart!');
}

// Handle Add to Cart button click
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-cart')) {
        event.preventDefault(); // Prevent page refresh
        addToCart();
    }
});

// On page load, set the cart count from localStorage
window.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
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
