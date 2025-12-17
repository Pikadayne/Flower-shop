let cartProducts = [];

async function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }
    
    const data = await loadProducts();
    if (!data) return;
    
    cartProducts = [];
    for (const cartItem of cart) {
        for (const category of data.categories) {
            const product = category.products.find(p => p.id === cartItem.id);
            if (product) {
                cartProducts.push({
                    ...product,
                    quantity: cartItem.quantity
                });
                break;
            }
        }
    }
    
    renderCart();
}

function showEmptyCart() {
    document.getElementById('emptyCart').style.display = 'block';
    document.getElementById('cartContent').style.display = 'none';
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (cartProducts.length === 0) {
        showEmptyCart();
        return;
    }
    
    document.getElementById('emptyCart').style.display = 'none';
    document.getElementById('cartContent').style.display = 'block';
    
    cartItems.innerHTML = '';
    
    cartProducts.forEach(product => {
        const total = product.currentPrice * product.quantity;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${encodeURI(product.image)}" alt="${product.name}" class="img-fluid rounded" style="width: 80px; height: 80px; object-fit: cover;">
            </td>
            <td>
                <a href="product-detail.html?id=${product.id}" class="text-decoration-none text-dark fw-medium">
                    ${product.name}
                </a>
            </td>
            <td>${formatPrice(product.currentPrice)}</td>
            <td>
                <div class="input-group" style="width: 120px;">
                    <button class="btn btn-outline-secondary btn-sm" type="button" onclick="updateQuantity(${product.id}, -1)">-</button>
                    <input type="number" class="form-control form-control-sm text-center" value="${product.quantity}" min="1" onchange="updateQuantity(${product.id}, 0, this.value)">
                    <button class="btn btn-outline-secondary btn-sm" type="button" onclick="updateQuantity(${product.id}, 1)">+</button>
                </div>
            </td>
            <td class="fw-semibold">${formatPrice(total)}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${product.id})" title="Xóa">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        cartItems.appendChild(row);
    });
    
    updateCartSummary();
}

function updateQuantity(productId, change, newValue) {
    const product = cartProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (newValue !== undefined) {
        product.quantity = Math.max(1, parseInt(newValue));
    } else {
        product.quantity = Math.max(1, product.quantity + change);
    }
    
    saveCart();
    renderCart();
    updateCartBadge();
}

function removeFromCart(productId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        cartProducts = cartProducts.filter(p => p.id !== productId);
        saveCart();
        renderCart();
        updateCartBadge();
        
        if (cartProducts.length === 0) {
            showEmptyCart();
        }
    }
}

function saveCart() {
    const cart = cartProducts.map(p => ({
        id: p.id,
        quantity: p.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartSummary() {
    const subtotal = cartProducts.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const discount = 0;
    const total = subtotal + shippingFee - discount;
    
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shippingFee').textContent = formatPrice(shippingFee);
    document.getElementById('discount').textContent = formatPrice(discount);
    document.getElementById('total').textContent = formatPrice(total);
}

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartBadge();
    
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
                localStorage.removeItem('cart');
                cartProducts = [];
                showEmptyCart();
                updateCartBadge();
            }
        });
    }
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartProducts.length === 0) {
                alert('Giỏ hàng của bạn đang trống!');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }
});

