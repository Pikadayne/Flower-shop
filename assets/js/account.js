document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
    checkLoginStatus();
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn đăng xuất không?')) {
                logoutUser();
            }
        });
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                showNotification('Đăng nhập thành công!');
                checkLoginStatus();
            } else {
                alert('Email hoặc mật khẩu không đúng!');
            }
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const phone = document.getElementById('registerPhone').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            
            if (password !== passwordConfirm) {
                alert('Mật khẩu xác nhận không khớp!');
                return;
            }
            
            let users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.find(u => u.email === email)) {
                alert('Email này đã được sử dụng!');
                return;
            }
            
            const newUser = {
                id: Date.now(),
                name,
                phone,
                email,
                password,
                registerDate: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            showNotification('Đăng ký thành công!');
            checkLoginStatus();
            
            const registerTab = document.getElementById('register-tab');
            const ordersTab = document.getElementById('orders-tab');
            if (registerTab && ordersTab) {
                registerTab.click();
                setTimeout(() => ordersTab.click(), 100);
            }
        });
    }
    
    loadOrders();
});

function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const ordersTabItem = document.getElementById('ordersTabItem');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const logoutButton = document.getElementById('logoutButton');
    
    if (currentUser) {
        if (ordersTabItem) ordersTabItem.style.display = 'block';
        if (loginTab) loginTab.style.display = 'none';
        if (registerTab) registerTab.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'inline-block';
        
        const ordersTab = document.getElementById('orders-tab');
        if (ordersTab && !ordersTab.classList.contains('active')) {
            ordersTab.click();
        }
    } else {
        if (ordersTabItem) ordersTabItem.style.display = 'none';
        if (loginTab) loginTab.style.display = 'block';
        if (registerTab) registerTab.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    checkLoginStatus();
    if (typeof showNotification === 'function') {
        showNotification('Bạn đã đăng xuất.');
    } else {
        alert('Bạn đã đăng xuất.');
    }
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

async function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        ordersList.innerHTML = '<p class="text-muted">Vui lòng đăng nhập để xem đơn hàng của bạn.</p>';
        return;
    }
    
    const userOrders = orders.filter(order => order.email === currentUser.email);
    
    if (userOrders.length === 0) {
        ordersList.innerHTML = '<p class="text-muted">Bạn chưa có đơn hàng nào.</p>';
        return;
    }
    
    ordersList.innerHTML = '';
    
    const data = await loadProducts();
    
    userOrders.reverse().forEach(order => {
        const orderDate = new Date(order.orderDate).toLocaleDateString('vi-VN');
        const orderCard = document.createElement('div');
        orderCard.className = 'card mb-3';
        orderCard.innerHTML = `
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <div>
                    <strong>Mã đơn: ${order.orderId}</strong>
                    <br>
                    <small class="text-muted">${orderDate}</small>
                </div>
                <span class="badge bg-success">Đã đặt hàng</span>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <strong>Thông tin giao hàng:</strong>
                    <p class="mb-1">${order.fullName} - ${order.phone}</p>
                    <p class="mb-0 text-muted small">${order.address}, ${order.ward}, ${order.district}, ${getProvinceName(order.province)}</p>
                </div>
                <div class="mb-3">
                    <strong>Phương thức thanh toán:</strong>
                    <p class="mb-0">${getPaymentMethodName(order.paymentMethod)}</p>
                </div>
                <hr>
                <div class="order-items mb-3">
                    ${order.products.map(product => {
                        const productData = data ? findProductInData(data, product.id) : null;
                        return `
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="d-flex gap-2">
                                    <img src="${encodeURI(product.image || (productData ? productData.image : ''))}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                                    <div>
                                        <div class="fw-medium">${product.name}</div>
                                        <small class="text-muted">Số lượng: ${product.quantity}</small>
                                    </div>
                                </div>
                                <div class="text-end">
                                    <strong>${formatPrice(product.currentPrice * product.quantity)}</strong>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <hr>
                <div class="d-flex justify-content-between">
                    <strong>Tổng cộng:</strong>
                    <strong class="text-danger">${formatPrice(order.total)}</strong>
                </div>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

function findProductInData(data, productId) {
    for (const category of data.categories) {
        const product = category.products.find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

function getProvinceName(value) {
    const provinces = {
        'hcm': 'TP. Hồ Chí Minh',
        'hn': 'Hà Nội',
        'dn': 'Đà Nẵng',
        'other': 'Khác'
    };
    return provinces[value] || value;
}

function getPaymentMethodName(value) {
    const methods = {
        'cash': 'Thanh toán khi nhận hàng (COD)',
        'bank': 'Chuyển khoản ngân hàng',
        'momo': 'Ví điện tử (MoMo, ZaloPay)',
        'card': 'Thẻ tín dụng/Ghi nợ'
    };
    return methods[value] || value;
}

