let currentProduct = null;
let allProductsData = null;

async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }
    
    const data = await loadProducts();
    if (!data) return;
    
    allProductsData = data;
    
    let product = null;
    for (const category of data.categories) {
        product = category.products.find(p => p.id === productId);
        if (product) {
            product.category = category;
            break;
        }
    }
    
    if (!product) {
        window.location.href = 'products.html';
        return;
    }
    
    currentProduct = product;
    renderProductDetail(product);
    renderRelatedProducts(product);
}

function renderProductDetail(product) {
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productBreadcrumb').textContent = product.name;
    
    const mainImage = document.getElementById('mainProductImage');
    mainImage.src = encodeURI(product.image);
    mainImage.alt = product.name;
    
    const thumbnailContainer = document.getElementById('thumbnailImages');
    thumbnailContainer.innerHTML = '';
    
    for (let i = 1; i <= 4; i++) {
        const img = document.createElement('img');
        img.src = encodeURI(product.image);
        img.alt = `${product.name} - ${i}`;
        img.className = 'img-thumbnail';
        img.style.cssText = 'width: 100px; height: 100px; object-fit: cover; cursor: pointer;';
        img.addEventListener('click', () => {
            mainImage.src = img.src;
        });
        thumbnailContainer.appendChild(img);
    }
    
    const currentPriceEl = document.getElementById('currentPrice');
    currentPriceEl.textContent = formatPrice(product.currentPrice);
    
    const oldPriceEl = document.getElementById('oldPrice');
    if (product.oldPrice) {
        oldPriceEl.textContent = formatPrice(product.oldPrice);
        oldPriceEl.style.display = 'inline';
    } else {
        oldPriceEl.style.display = 'none';
    }
    
    const discountBadge = document.getElementById('discountBadge');
    if (product.hasDiscount && product.discount > 0) {
        discountBadge.textContent = `-${product.discount}%`;
        discountBadge.style.display = 'inline-block';
    } else {
        discountBadge.style.display = 'none';
    }
    
    const description = document.getElementById('productDescription');
    description.textContent = `Bó hoa ${product.name} là sự lựa chọn hoàn hảo cho những dịp đặc biệt. Sản phẩm được làm từ những bông hoa tươi nhất, được chọn lọc kỹ càng và được sắp xếp một cách nghệ thuật bởi những người thợ lành nghề.`;
    
    const components = document.getElementById('productComponents');
    const componentList = [
        'Hoa hồng đỏ',
        'Hoa cẩm chướng',
        'Lá dương xỉ',
        'Giấy gói cao cấp',
        'Ruy băng trang trí'
    ];
    components.innerHTML = componentList.map(comp => `<li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>${comp}</li>`).join('');
    
    const infoTable = document.getElementById('productInfoTable');
    infoTable.innerHTML = `
        <tr>
            <td class="fw-semibold" style="width: 200px;">Tên sản phẩm</td>
            <td>${product.name}</td>
        </tr>
        <tr>
            <td class="fw-semibold">Giá</td>
            <td>${formatPrice(product.currentPrice)}</td>
        </tr>
        <tr>
            <td class="fw-semibold">Danh mục</td>
            <td>${product.category.name}</td>
        </tr>
        <tr>
            <td class="fw-semibold">Tình trạng</td>
            <td><span class="badge bg-success">Còn hàng</span></td>
        </tr>
        <tr>
            <td class="fw-semibold">Bảo quản</td>
            <td>Để nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp</td>
        </tr>
    `;
}

function renderRelatedProducts(currentProduct) {
    const container = document.getElementById('relatedProductsContainer');
    if (!container || !allProductsData) return;
    const sameCategoryPool = (currentProduct.category.products || []).filter(p => p.id !== currentProduct.id).slice();
    
    for (let i = sameCategoryPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sameCategoryPool[i], sameCategoryPool[j]] = [sameCategoryPool[j], sameCategoryPool[i]];
    }
    const sameCategory = sameCategoryPool.slice(0, 4);
    
    container.innerHTML = '';
    sameCategory.forEach(product => {
        const discountBadge = product.hasDiscount 
            ? `<span class="discount-badge">${product.discount}% GIẢM</span>` 
            : '';
        
        const oldPrice = product.oldPrice 
            ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` 
            : '';
        
        const cardHTML = `
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
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadProductDetail();
    updateCartBadge();
    
    const decreaseQty = document.getElementById('decreaseQty');
    const increaseQty = document.getElementById('increaseQty');
    const quantityInput = document.getElementById('productQuantity');
    
    decreaseQty.addEventListener('click', () => {
        const current = parseInt(quantityInput.value);
        if (current > 1) {
            quantityInput.value = current - 1;
        }
    });
    
    increaseQty.addEventListener('click', () => {
        const current = parseInt(quantityInput.value);
        quantityInput.value = current + 1;
    });
    
    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn.addEventListener('click', () => {
        if (!currentProduct) return;
        const quantity = parseInt(quantityInput.value);
        addToCartWithQuantity(currentProduct.id, quantity);
    });
    
    const buyNowBtn = document.getElementById('buyNowBtn');
    buyNowBtn.addEventListener('click', () => {
        if (!currentProduct) return;
        const quantity = parseInt(quantityInput.value);
        addToCartWithQuantity(currentProduct.id, quantity);
        window.location.href = 'checkout.html';
    });
    
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rating = document.querySelector('input[name="rating"]:checked');
            const name = document.getElementById('reviewName').value;
            const email = document.getElementById('reviewEmail').value;
            const comment = document.getElementById('reviewComment').value;
            
            if (!rating) {
                alert('Vui lòng chọn đánh giá sao!');
                return;
            }
            
            const review = {
                productId: currentProduct.id,
                rating: parseInt(rating.value),
                name,
                email,
                comment,
                date: new Date().toLocaleDateString('vi-VN')
            };
            
            let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
            reviews.push(review);
            localStorage.setItem('reviews', JSON.stringify(reviews));
            
            showNotification('Cảm ơn bạn đã đánh giá sản phẩm!');
            reviewForm.reset();
            loadReviews();
        });
    }
    
    loadReviews();
});

function addToCartWithQuantity(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showNotification(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
}

function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    const reviewsTab = document.getElementById('reviews-tab');
    if (!reviewsList || !currentProduct) return;
    
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const productReviews = reviews.filter(r => r.productId === currentProduct.id);
    
    if (reviewsTab) {
        reviewsTab.textContent = `Đánh giá (${productReviews.length})`;
    }
    
    if (productReviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-muted">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>';
        return;
    }
    
    reviewsList.innerHTML = productReviews.map(review => `
        <div class="review-item border-bottom pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <strong>${review.name}</strong>
                    <div class="rating-display text-warning">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                </div>
                <small class="text-muted">${review.date}</small>
            </div>
            <p class="mb-0">${review.comment}</p>
        </div>
    `).join('');
}

const productDetailStyle = document.createElement('style');
productDetailStyle.textContent = `
    .rating {
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-end;
    }
    .rating input {
        display: none;
    }
    .rating label {
        font-size: 30px;
        color: #ddd;
        cursor: pointer;
        transition: color 0.2s;
    }
    .rating input:checked ~ label,
    .rating label:hover,
    .rating label:hover ~ label {
        color: #ffc107;
    }
    .rating input:checked ~ label {
        color: #ffc107;
    }
`;
document.head.appendChild(productDetailStyle);

