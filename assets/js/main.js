function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'VND';
}

async function loadProducts() {
    try {
        if (window.products) {
            return window.products;
        }
        const response = await fetch('data/products.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading products:', error);
        return null;
    }
}

function renderProductCard(product) {
    const discountBadge = product.hasDiscount 
        ? `<span class="discount-badge">${product.discount}% GIẢM</span>` 
        : '';
    
    const oldPrice = product.oldPrice 
        ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` 
        : '';
    
    return `
        <div class="col-md-3 col-sm-6 mb-4">
            <div class="product-card">
                <div class="product-image">
                    <a href="product-detail.html?id=${product.id}">
                        <img src="${encodeURI(product.image)}" alt="${product.name}">
                    </a>
                    ${discountBadge}
                </div>
                <div class="product-info">
                    <h3><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
                    <div class="product-price">
                        <span class="current-price">${formatPrice(product.currentPrice)}</span>
                        ${oldPrice}
                    </div>
                    <a href="product-detail.html?id=${product.id}" class="btn-order">XEM CHI TIẾT</a>
                </div>
            </div>
        </div>
    `;
}

function renderProductSection(category) {
    const productsHTML = category.products.map(product => renderProductCard(product)).join('');
    
    return `
        <section class="product-section">
            <h2 class="section-title">${category.name}</h2>
            <div class="row">
                ${productsHTML}
            </div>
        </section>
    `;
}

async function loadHomepageProducts() {
    const data = await loadProducts();
    if (!data) return;
    
    const mainContent = document.querySelector('.main-content .container');
    if (!mainContent) return;
    
    const idsToShow = ['san-pham-moi', 'dang-giam-gia', 'dat-nhieu-nhat'];
    
    function shuffleInPlace(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    idsToShow.forEach(id => {
        const category = data.categories.find(c => c.id === id);
        if (category) {
            const pool = (category.products || []).slice();
            shuffleInPlace(pool);
            const picks = pool.slice(0, Math.min(4, pool.length));
            const categoryPreview = Object.assign({}, category, { products: picks });
            mainContent.insertAdjacentHTML('beforeend', renderProductSection(categoryPreview));
        }
    });
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showNotification('Đã thêm sản phẩm vào giỏ hàng!');
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('bi-list');
                icon.classList.add('bi-x-lg');
            } else {
                icon.classList.remove('bi-x-lg');
                icon.classList.add('bi-list');
            }
        });
        
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('bi-x-lg');
                    icon.classList.add('bi-list');
                }
            }
        });
        
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('bi-x-lg');
                    icon.classList.add('bi-list');
                }
            });
        });
    }
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!searchInput) return;
    
    const performSearch = () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        }
    };
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
    initMobileMenu();
    initSearch();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'index.html' && document.querySelector('.main-content .product-section') === null) {
        loadHomepageProducts();
    }
    
    highlightNavByCategory();
});

function highlightNavByCategory() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;

    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navMenu.querySelectorAll('a').forEach(link => {
        link.classList.remove('active');
    });

    if (currentPage === 'products.html') {
        if (cat) {
            const match = Array.from(navMenu.querySelectorAll('a')).find(a => {
                try {
                    const url = new URL(a.getAttribute('href'), window.location.origin);
                    return url.pathname.split('/').pop() === 'products.html' && url.searchParams.get('category') === cat;
                } catch (e) {
                    return false;
                }
            });
            if (match) match.classList.add('active');
        } else {
            const match = Array.from(navMenu.querySelectorAll('a')).find(a => {
                try {
                    const url = new URL(a.getAttribute('href'), window.location.origin);
                    return url.pathname.split('/').pop() === 'products.html' && !url.searchParams.get('category');
                } catch (e) {
                    return false;
                }
            });
            if (match) match.classList.add('active');
        }
        return;
    }

    const otherMatch = Array.from(navMenu.querySelectorAll('a')).find(a => {
        try {
            const url = new URL(a.getAttribute('href'), window.location.origin);
            return url.pathname.split('/').pop() === currentPage;
        } catch (e) {
            return false;
        }
    });
    if (otherMatch) otherMatch.classList.add('active');
}

const mainStyle = document.createElement('style');
mainStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(mainStyle);

