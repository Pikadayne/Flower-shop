let allProducts = [];
let currentPage = 1;
let itemsPerPage = 24;
let currentSort = 'price-asc';
let currentView = 'grid';
let searchTerm = '';

async function loadProductsPage() {
    const data = await loadProducts();
    if (!data) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    searchTerm = urlParams.get('search') || '';
    const categoryParam = urlParams.get('category') || '';
    
    if (searchTerm) {
        const map = new Map();
        data.categories.forEach(category => {
            const catIdStr = String(category.id);
            (category.products || []).forEach(prod => {
                if (!prod || typeof prod.id !== 'number') return;
                const existing = map.get(prod.id);
                if (existing) {
                    if (!existing.categoryIds.includes(catIdStr)) existing.categoryIds.push(catIdStr);
                } else {
                    const p = Object.assign({}, prod);
                    p.categoryIds = [catIdStr];
                    map.set(p.id, p);
                }
            });
        });
        allProducts = Array.from(map.values());
        
        const pageTitle = document.getElementById('pageTitle') || document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = `Kết quả tìm kiếm: "${searchTerm}"`;
        }
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchTerm;
        }
        document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
        const filterDiscountEl = document.getElementById('filterDiscount');
        if (filterDiscountEl) filterDiscountEl.checked = false;
    } else {
        const map = new Map();
        data.categories.forEach(cat => {
            const catIdStr = String(cat.id);
            (cat.products || []).forEach(prod => {
                if (!prod || typeof prod.id !== 'number') return;
                const existing = map.get(prod.id);
                if (existing) {
                    if (!existing.categoryIds.includes(catIdStr)) existing.categoryIds.push(catIdStr);
                } else {
                    const p = Object.assign({}, prod);
                    p.categoryIds = [catIdStr];
                    map.set(p.id, p);
                }
            });
        });
        allProducts = Array.from(map.values());

        if (categoryParam) {
            document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = (cb.value === categoryParam));
        } else {
            document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
        }
    }
    
    renderProducts();
    renderPagination();
}

function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    let filteredProducts = filterProducts([...allProducts]);
    const sortedProducts = sortProducts(filteredProducts);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
    
    container.innerHTML = '';
    container.className = `row ${currentView === 'list' ? 'products-list-view' : ''}`;
    
    if (paginatedProducts.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Không tìm thấy sản phẩm nào.</p></div>';
    } else {
        paginatedProducts.forEach(product => {
            let cardHTML = renderProductCard(product);
            if (currentView === 'list') {
                cardHTML = cardHTML.replace('col-md-3 col-sm-6 mb-4', 'col-12 mb-4');
            } else {
                cardHTML = cardHTML.replace('col-md-3 col-sm-6 mb-4', 'col-lg-4 col-md-6 mb-4');
            }
            container.insertAdjacentHTML('beforeend', cardHTML);
        });
    }
    
    updatePaginationInfo(sortedProducts.length);
}

function filterProducts(products) {
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        products = products.filter(product => {
            return product.name.toLowerCase().includes(term);
        });
    }
    
    const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Infinity;
    
    products = products.filter(product => {
        return product.currentPrice >= minPrice && product.currentPrice <= maxPrice;
    });
    
    const filterDiscount = document.getElementById('filterDiscount');
    if (filterDiscount && filterDiscount.checked) {
        products = products.filter(product => product.hasDiscount);
    }
    
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => String(cb.value));
    if (!searchTerm && selectedCategories.length > 0) {
        products = products.filter(product => {
            const ids = (product.categoryIds || (product.categoryId ? [product.categoryId] : [])).map(c => String(c));
            return ids.some(c => selectedCategories.includes(c));
        });
    }
    
    return products;
}

function sortProducts(products) {
    switch(currentSort) {
        case 'price-asc':
            return products.sort((a, b) => a.currentPrice - b.currentPrice);
        case 'price-desc':
            return products.sort((a, b) => b.currentPrice - a.currentPrice);
        case 'name-asc':
            return products.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return products.sort((a, b) => b.name.localeCompare(a.name));
        default:
            return products;
    }
}

function renderPagination() {
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">‹</a>`;
    pagination.appendChild(prevLi);
    
    const maxPages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    if (startPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        firstLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(1); return false;">1</a>`;
        pagination.appendChild(firstLi);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>`;
        pagination.appendChild(li);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(ellipsis);
        }
        
        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        lastLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>`;
        pagination.appendChild(lastLi);
    }
    
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">›</a>`;
    pagination.appendChild(nextLi);
}

function changePage(page) {
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderProducts();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePaginationInfo(totalItems) {
    const info = document.getElementById('paginationInfo');
    if (!info) return;
    
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    info.textContent = `Hiển thị từ ${start} đến ${end} / ${totalItems} (${totalPages} Trang)`;
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('productsContainer')) {
        loadProductsPage();
        
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput && searchBtn) {
            const performSearch = () => {
                const term = searchInput.value.trim();
                if (term) {
                    window.location.href = `products.html?search=${encodeURIComponent(term)}`;
                }
            };
            
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                currentSort = this.value;
                currentPage = 1;
                renderProducts();
                renderPagination();
            });
        }
        
        const itemsPerPageSelect = document.getElementById('itemsPerPage');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', function() {
                itemsPerPage = parseInt(this.value);
                currentPage = 1;
                renderProducts();
                renderPagination();
            });
        }
        
        const viewButtons = document.querySelectorAll('.btn-view');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                viewButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentView = this.dataset.view;
                renderProducts();
            });
        });
        
        const toggleFilterBtn = document.getElementById('toggleFilter');
        const sidebarFilter = document.getElementById('sidebarFilter');
        const closeFilterBtn = document.getElementById('closeFilter');
        const filterOverlay = document.getElementById('filterOverlay');
        
        if (toggleFilterBtn && sidebarFilter) {
            toggleFilterBtn.addEventListener('click', function() {
                sidebarFilter.classList.toggle('active');
                if (filterOverlay) {
                    filterOverlay.classList.toggle('active');
                }
            });
        }
        
        if (closeFilterBtn && sidebarFilter) {
            closeFilterBtn.addEventListener('click', function() {
                sidebarFilter.classList.remove('active');
                if (filterOverlay) {
                    filterOverlay.classList.remove('active');
                }
            });
        }
        
        if (filterOverlay) {
            filterOverlay.addEventListener('click', function() {
                sidebarFilter.classList.remove('active');
                filterOverlay.classList.remove('active');
            });
        }
        
        const applyPriceFilter = document.getElementById('applyPriceFilter');
        const resetFilters = document.getElementById('resetFilters');
        const filterDiscount = document.getElementById('filterDiscount');
        
        if (applyPriceFilter) {
            applyPriceFilter.addEventListener('click', function() {
                renderProducts();
            });
        }
        
        if (resetFilters) {
            resetFilters.addEventListener('click', function() {
                document.getElementById('minPrice').value = '';
                document.getElementById('maxPrice').value = '';
                if (filterDiscount) filterDiscount.checked = false;
                document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
                renderProducts();
            });
        }
        
        if (filterDiscount) {
            filterDiscount.addEventListener('change', function() {
                renderProducts();
            });
        }

        document.querySelectorAll('input[name="category"]').forEach(cb => {
            cb.addEventListener('change', function() {
                searchTerm = '';
                renderProducts();
            });
        });
    }
});

