// script.js

// Handle Add to Cart button click
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent page refresh
        const cartCount = document.querySelector('.cart-count');
        const currentCount = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = currentCount + 1; // Increment cart count
        alert('Item added to cart!');
    });
});

// Toggle the navbar menu on mobile
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.navbar-center ul');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active'); // Toggle menu visibility
  hamburger.classList.toggle('active'); // Animate hamburger
});

// script.js

// Scroll to Top Button Visibility
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.style.display = 'block'; // Show button when scrolling down
    } else {
        scrollToTopBtn.style.display = 'none'; // Hide button at top of page
    }
});

// Scroll to the top when button is clicked
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
