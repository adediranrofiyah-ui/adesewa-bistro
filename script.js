// Shopping Cart Management
let cart = [];
let allMenuItems = []; // Store all menu items for filtering
let currentCategory = 'all'; // Track current filter

// Load cart from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    setupEventListeners();
    loadMenuFromFirestore(); // Load menu items from Firestore
});

// Setup all event listeners
function setupEventListeners() {
    // Cart modal
    const cartToggle = document.getElementById('cart-toggle');
    const cartModal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Cart toggle
    cartToggle.addEventListener('click', function(e) {
        e.preventDefault();
        cartModal.style.display = 'block';
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Clear cart button
    clearCartBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear your cart?')) {
            cart = [];
            saveCart();
            updateCart();
        }
    });

    // Checkout button
    checkoutBtn.addEventListener('click', proceedToCheckout);

    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    });
}

// Add item to cart
function addToCart(itemName, itemPrice) {
    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: 1
        });
    }

    saveCart();
    updateCart();
    showNotification(`${itemName} added to cart!`);
}

// Remove item from cart
function removeFromCart(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    saveCart();
    updateCart();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('adesewa_cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const saved = localStorage.getItem('adesewa_cart');
    cart = saved ? JSON.parse(saved) : [];
    updateCart();
}

// Update cart display
function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalPriceSpan = document.getElementById('total-price');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items display
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalPriceSpan.textContent = '₦0';
    } else {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₦${item.price.toLocaleString()} × ${item.quantity}</div>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart('${item.name}')">Remove</button>
            </div>
        `).join('');

        // Calculate total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPriceSpan.textContent = '₦' + total.toLocaleString();
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Create order summary
    let orderSummary = 'Hello ADESEWA Bistro, I would like to place the following order:\n\n';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        orderSummary += `${item.name} (×${item.quantity}): ₦${itemTotal.toLocaleString()}\n`;
        total += itemTotal;
    });

    orderSummary += `\nTotal: ₦${total.toLocaleString()}`;

    // Redirect to WhatsApp
    const phoneNumber = '2347088572186';
    const encodedMessage = encodeURIComponent(orderSummary);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');

    // Clear cart after sending to WhatsApp
    setTimeout(() => {
        cart = [];
        saveCart();
        updateCart();
        document.getElementById('cart-modal').style.display = 'none';
    }, 500);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// FIRESTORE MENU LOADING
// ============================================

function loadMenuFromFirestore() {
    const container = document.getElementById('menu-container');
    const loading = document.getElementById('loading-indicator');

    if (!container) return; // Not on menu page

    // Listen for real-time updates from Firestore
    db.collection('menuItems').orderBy('name').onSnapshot(snapshot => {
        allMenuItems = [];
        snapshot.forEach(doc => {
            allMenuItems.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Hide loading indicator
        if (loading) loading.style.display = 'none';

        // Display menu
        renderMenu(allMenuItems);

        // Initialize search listener
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keyup', function() {
                filterMenuBySearch(this.value);
            });
        }
    }, error => {
        if (loading) {
            loading.innerHTML = '<p style="color: #f44336;">Error loading menu. Please refresh the page.</p>';
        }
        console.error('Error loading menu:', error);
    });
}

function renderMenu(items) {
    const container = document.getElementById('menu-container');
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #999;">No menu items available</p>';
        return;
    }

    // Group items by category
    const categories = {};
    items.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = [];
        }
        categories[item.category].push(item);
    });

    // Build HTML
    let html = '';
    Object.keys(categories).sort().forEach(category => {
        html += `
            <div class="menu-category" data-category="${category}">
                <h3 class="category-title">${category}</h3>
                <div class="menu-items">
        `;

        categories[category].forEach(item => {
            const imageSrc = item.image || 'images/placeholder.jpg';
            html += `
                <div class="menu-item">
                    <div class="item-image">
                        <img src="${imageSrc}" alt="${item.name}" onerror="this.src='images/akara%20balls.jpg.jfif'">
                    </div>
                    <div class="item-details">
                        <h4 class="item-name">${item.name}</h4>
                        <p class="item-description">${item.description}</p>
                        <div class="item-footer">
                            <span class="item-price">₦${item.price.toLocaleString()}</span>
                            <button class="add-to-cart-btn" onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function filterMenu(category) {
    currentCategory = category;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter and render
    if (category === 'all') {
        renderMenu(allMenuItems);
    } else {
        const filtered = allMenuItems.filter(item => item.category === category);
        renderMenu(filtered);
    }
}

function filterMenuBySearch(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    const filtered = allMenuItems.filter(item => {
        return item.name.toLowerCase().includes(searchLower) ||
               item.description.toLowerCase().includes(searchLower) ||
               item.category.toLowerCase().includes(searchLower);
    });

    renderMenu(filtered);
}

