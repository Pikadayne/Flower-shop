let checkoutProducts = [];

async function loadCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }
    
    const data = await loadProducts();
    if (!data) return;
    
    checkoutProducts = [];
    for (const cartItem of cart) {
        for (const category of data.categories) {
            const product = category.products.find(p => p.id === cartItem.id);
            if (product) {
                checkoutProducts.push({
                    ...product,
                    quantity: cartItem.quantity
                });
                break;
            }
        }
    }
    
    renderOrderItems();
    updateOrderSummary();
}

function showEmptyCart() {
    document.getElementById('emptyCartMessage').style.display = 'block';
    document.getElementById('checkoutContent').style.display = 'none';
}

function renderOrderItems() {
    const orderItems = document.getElementById('orderItems');
    if (!orderItems) return;
    
    orderItems.innerHTML = '';
    
    checkoutProducts.forEach(product => {
        const total = product.currentPrice * product.quantity;
        const item = document.createElement('div');
        item.className = 'd-flex justify-content-between align-items-start mb-3 pb-3 border-bottom';
        item.innerHTML = `
            <div class="d-flex gap-3">
                <img src="${encodeURI(product.image)}" alt="${product.name}" class="rounded" style="width: 60px; height: 60px; object-fit: cover;">
                <div>
                    <h6 class="mb-1">${product.name}</h6>
                    <small class="text-muted">Số lượng: ${product.quantity}</small>
                </div>
            </div>
            <div class="text-end">
                <strong>${formatPrice(total)}</strong>
            </div>
        `;
        orderItems.appendChild(item);
    });
}

function updateOrderSummary() {
    const subtotal = checkoutProducts.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const discount = 0;
    const total = subtotal + shippingFee - discount;
    
    document.getElementById('orderSubtotal').textContent = formatPrice(subtotal);
    document.getElementById('orderShipping').textContent = formatPrice(shippingFee);
    document.getElementById('orderDiscount').textContent = formatPrice(discount);
    document.getElementById('orderTotal').textContent = formatPrice(total);
}

document.addEventListener('DOMContentLoaded', function() {
    loadCheckout();
    updateCartBadge();
    
    const checkoutForm = document.getElementById('checkoutForm');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            if (checkoutProducts.length === 0) {
                alert('Giỏ hàng của bạn đang trống!');
                window.location.href = 'cart.html';
                return;
            }
            
            if (!checkoutForm.checkValidity()) {
                checkoutForm.reportValidity();
                return;
            }
            
            const formData = {
                fullName: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                province: document.getElementById('province').value,
                district: document.getElementById('district').value,
                ward: document.getElementById('ward').value,
                note: document.getElementById('note').value,
                paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
                products: checkoutProducts,
                subtotal: checkoutProducts.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0),
                shippingFee: checkoutProducts.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0) > 500000 ? 0 : 30000,
                total: checkoutProducts.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0) + (checkoutProducts.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0) > 500000 ? 0 : 30000),
                orderDate: new Date().toISOString(),
                orderId: 'ORD' + Date.now()
            };
            
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(formData);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            localStorage.removeItem('cart');
            
            showOrderSuccess(formData.orderId);
        });
    }
});

function showOrderSuccess(orderId) {
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header border-0">
                    <h5 class="modal-title">Đặt hàng thành công!</h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                </div>
                <div class="modal-body text-center">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 60px;"></i>
                    <h4 class="mt-3 mb-2">Cảm ơn bạn đã đặt hàng!</h4>
                    <p class="text-muted">Mã đơn hàng của bạn: <strong>${orderId}</strong></p>
                    <p class="text-muted">Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.</p>
                </div>
                <div class="modal-footer border-0 justify-content-center">
                    <a href="index.html" class="btn btn-danger">Về trang chủ</a>
                    <a href="account.html" class="btn btn-outline-secondary">Xem đơn hàng</a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 5000);
}

