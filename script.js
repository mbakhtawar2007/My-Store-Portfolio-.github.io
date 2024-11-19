// script.js

// Utility function to update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    let currentCount = parseInt(localStorage.getItem('cartCount')) || 0;
    cartCount.textContent = currentCount;
}

// Handle Add to Cart button click
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-cart')) {
        event.preventDefault(); // Prevent page refresh
        let currentCount = parseInt(localStorage.getItem('cartCount')) || 0;
        currentCount += 1;
        localStorage.setItem('cartCount', currentCount);
        updateCartCount();
        alert('Item added to cart!');
    }
});

// On page load, set the cart count from localStorage
window.addEventListener('DOMContentLoaded', updateCartCount);

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

document.getElementById('category').addEventListener('change', filterProducts);
document.getElementById('price').addEventListener('input', filterProducts);