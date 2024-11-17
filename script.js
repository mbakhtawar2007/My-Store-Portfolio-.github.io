// script.js

// Handle Add to Cart button click
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent page refresh
        const cartCount = document.querySelector('.cart-count');
        let currentCount = parseInt(cartCount.textContent) || 0;
        currentCount += 1;
        cartCount.textContent = currentCount;

        // Save cart count to localStorage
        localStorage.setItem('cartCount', currentCount);

        alert('Item added to cart!');
    });
});

// On page load, set the cart count from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const savedCartCount = localStorage.getItem('cartCount');
    if (savedCartCount) {
        document.querySelector('.cart-count').textContent = savedCartCount;
    }
});

// Toggle the navbar menu on mobile
const hamburger = document.getElementById('hamburger');
const navbar = document.querySelector('.navbar');

hamburger.addEventListener('click', () => {
    navbar.classList.toggle('active');
});

// Close navbar when a link is clicked on mobile
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
        navbar.classList.remove('active');
    });
});

// Scroll to Top Button Visibility
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) { // Using pageYOffset for scroll detection
        scrollToTopBtn.style.display = 'block'; // Show button when scrolling down
    } else {
        scrollToTopBtn.style.display = 'none'; // Hide button at top of page
    }
});

// Scroll to the top when button is clicked
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Filter products based on category and price
document.getElementById('category').addEventListener('change', filterProducts);
document.getElementById('price').addEventListener('input', filterProducts);

function filterProducts() {
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const products = document.querySelectorAll('.product-item');

    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        const productPrice = parseFloat(product.getAttribute('data-price'));

        if ((category === productCategory || category === 'all') && productPrice <= price) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}
