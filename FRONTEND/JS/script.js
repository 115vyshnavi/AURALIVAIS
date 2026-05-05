const API_BASE_URL = 'https://auralivais-core-396859005652.us-central1.run.app';

let cart = JSON.parse(localStorage.getItem('auralivais_cart')) || [];
let products = [];

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
    initAnimations();
    updateCartUI();
    
    if (document.getElementById('product-grid')) {
        fetchProducts();
    }

    if (document.getElementById('checkout-items')) {
        renderCheckout();
    }
    
    if (document.getElementById('contact-form')) {
        initContactForm();
    }
});

// Scroll Effects (Navbar)
function initScrollEffects() {
    const header = document.querySelector('header');
    
    // Check initial state
    if (window.scrollY > 50) header.classList.add('scrolled');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Animations (Intersection Observer)
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// API: Fetch Products
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        document.getElementById('product-grid').innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Our atelier is currently updating the collection. Please return shortly.</p>';
    }
}

function renderProducts(items) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = items.map(product => `
        <div class="product-card fade-in">
            <div class="product-image" onclick="openProductModal(${product.id})" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}">
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">Acquire Piece</button>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
        </div>
    `).join('');
    
    // Re-observe new elements
    initAnimations();
}

// Cart Logic
function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('open');
    document.getElementById('cart-overlay').classList.toggle('show');
}

function closeCart() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('show');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    toggleCart();
}

function updateQuantity(productId, change) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        saveCart();
        updateCartUI();
        if (document.getElementById('checkout-items')) renderCheckout();
    }
}

function saveCart() {
    localStorage.setItem('auralivais_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-amount');

    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(countEl) countEl.textContent = totalQty;

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; margin-top: 2rem; color: var(--charcoal);">Your bag is empty.</p>';
        totalEl.textContent = '$0.00';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">$${item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)"><i class="fa-solid fa-minus"></i></button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalEl.textContent = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}

// Checkout Logic
function renderCheckout() {
    const container = document.getElementById('checkout-items');
    const totalEl = document.getElementById('checkout-total');
    const btn = document.getElementById('pay-btn');

    if (cart.length === 0) {
        container.innerHTML = '<p>Your bag is empty.</p>';
        totalEl.textContent = '$0.00';
        btn.disabled = true;
        btn.style.opacity = '0.5';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 1.5rem;">
            <div style="display: flex; gap: 1rem;">
                <img src="${item.image}" style="width: 60px; height: 80px; object-fit: cover;">
                <div>
                    <h4 style="font-family: var(--font-heading);">${item.name}</h4>
                    <p style="color: var(--charcoal); font-size: 0.9rem;">Qty: ${item.quantity}</p>
                </div>
            </div>
            <p style="font-weight: 500;">$${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalEl.textContent = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    btn.disabled = false;
    btn.style.opacity = '1';
}

async function processPayment() {
    if (cart.length === 0) return;
    
    const btn = document.getElementById('pay-btn');
    btn.innerHTML = '<span class="loader"></span> Authorizing...';
    btn.disabled = true;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const response = await fetch(`${API_BASE_URL}/process-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart, total: total })
        });
        const data = await response.json();
        
        showSuccessScreen(data.message);
        
        cart = [];
        saveCart();
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 4000);
        
    } catch (error) {
        alert('Transaction failed. Please try again or contact your advisor.');
        btn.innerHTML = 'Complete Purchase';
        btn.disabled = false;
    }
}

function showSuccessScreen(message) {
    const screen = document.getElementById('success-screen');
    screen.classList.add('active');
    setTimeout(() => {
        screen.innerHTML = `
            <h1>AURALIVAIS</h1>
            <p>${message}</p>
        `;
    }, 100);
}

// AI Chat Concierge Logic
function toggleChat() {
    document.getElementById('chat-popup').classList.toggle('active');
}

async function sendMessage() {
    const input = document.getElementById('chat-input-field');
    const message = input.value.trim();
    if (!message) return;

    appendMessage('user', message);
    input.value = '';

    const chatMessages = document.getElementById('chat-messages');
    const loadingId = 'loading-' + Date.now();
    chatMessages.innerHTML += `<div id="${loadingId}" class="message bot"><span class="loader"></span></div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        
        document.getElementById(loadingId).remove();
        appendMessage('bot', data.response);
    } catch (error) {
        document.getElementById(loadingId).remove();
        appendMessage('bot', 'Our connection to the atelier is currently interrupted. Please try again later.');
    }
}

function appendMessage(sender, text) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `
        <div class="message ${sender}">
            ${text.replace(/\n/g, '<br>')}
        </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// --- 3D Cinematic Modal Logic ---
let currentModalProductId = null;
let currentImageIndex = 0;
let modalImages = [];
let rotationInterval = null;

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentModalProductId = productId;
    currentImageIndex = 0;
    modalImages = product.gallery || [product.image]; // Fallback to single image if gallery missing

    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-price').textContent = `$${product.price.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('modal-desc').textContent = product.description;
    
    document.getElementById('modal-add-btn').onclick = () => {
        addToCart(product.id);
        closeProductModal();
    };

    renderCinematicViewer();
    
    const modal = document.getElementById('product-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Start auto-rotation
    startRotation();
}

function closeProductModal(event) {
    if (event && event.target.closest('.product-modal-content') && !event.target.closest('.close-modal-btn')) {
        return;
    }
    
    document.getElementById('product-modal').classList.remove('active');
    document.body.style.overflow = '';
    stopRotation();
}

function renderCinematicViewer() {
    const viewer = document.getElementById('cinematic-viewer');
    const dotsContainer = document.getElementById('viewer-dots');
    
    viewer.innerHTML = modalImages.map((imgUrl, index) => `
        <img src="${imgUrl}" class="cinematic-slide ${index === currentImageIndex ? 'active' : ''}" alt="Product View ${index + 1}">
    `).join('');

    dotsContainer.innerHTML = modalImages.map((_, index) => `
        <div class="dot ${index === currentImageIndex ? 'active' : ''}" onclick="goToImage(${index})"></div>
    `).join('');
}

function updateViewerUI() {
    const slides = document.querySelectorAll('.cinematic-slide');
    const dots = document.querySelectorAll('.dot');
    
    slides.forEach((slide, index) => {
        if (index === currentImageIndex) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    dots.forEach((dot, index) => {
        if (index === currentImageIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % modalImages.length;
    updateViewerUI();
    resetRotation();
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + modalImages.length) % modalImages.length;
    updateViewerUI();
    resetRotation();
}

function goToImage(index) {
    currentImageIndex = index;
    updateViewerUI();
    resetRotation();
}

function startRotation() {
    rotationInterval = setInterval(() => {
        currentImageIndex = (currentImageIndex + 1) % modalImages.length;
        updateViewerUI();
    }, 2500);
}

function stopRotation() {
    if (rotationInterval) clearInterval(rotationInterval);
}

function resetRotation() {
    stopRotation();
    startRotation();
}

// Contact Form Handler
function initContactForm() {
    const form = document.getElementById('contact-form');
    const responseDiv = document.getElementById('contact-response');
    const submitBtn = document.getElementById('contact-submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.innerHTML = '<span class="loader"></span> Sending...';
        submitBtn.disabled = true;

        const payload = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            subject: document.getElementById('contact-subject').value,
            message: document.getElementById('contact-message').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/contact-submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            form.style.display = 'none';
            responseDiv.style.display = 'block';
            responseDiv.innerHTML = `<i class="fa-solid fa-check" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>${data.message}`;
            
        } catch (error) {
            submitBtn.innerHTML = 'Send Inquiry';
            submitBtn.disabled = false;
            responseDiv.style.display = 'block';
            responseDiv.style.color = 'red';
            responseDiv.innerHTML = 'An error occurred. Please try again later.';
        }
    });
}
