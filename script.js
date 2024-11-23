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
window.addEventListener('DOMContentLoaded', updateCartCount);

// Toggle the navbar menu on mobile
const hamburger = document.getElementById('hamburger');
const navbarMenu = document.querySelector('.navbar-center ul');

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

// Scroll to Top Button Visibility
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    scrollToTopBtn.style.display = window.pageYOffset > 100 ? 'block' : 'none';
});

// Scroll to the top when button is clicked
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Filter products based on category and price
const filterProducts = () => {
    const category = document.getElementById('category').value;
    const price = parseFloat(document.getElementById('price').value);
    const products = document.querySelectorAll('.product-item');

    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        const productPrice = parseFloat(product.getAttribute('data-price'));

        product.style.display = (category === productCategory || category === 'all') && productPrice <= price ? 'block' : 'none';
    });
};

// Add event listeners for filtering
document.getElementById('category').addEventListener('change', filterProducts);
document.getElementById('price').addEventListener('input', filterProducts);