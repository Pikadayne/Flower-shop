# Flower Shop Website

Website bán hoa tươi FlowerCorner.vn được xây dựng bằng HTML, CSS, Bootstrap và JavaScript thuần.

## Cấu trúc dự án

```
flower-shop/
├── index.html          # Trang chủ
├── products.html       # Trang danh sách sản phẩm
├── assets/
│   ├── css/
│   │   └── style.css   # File CSS chính
│   ├── js/
│   │   ├── main.js     # JavaScript chung (trang chủ)
│   │   └── products.js  # JavaScript cho trang sản phẩm
│   └── img/            # Thư mục chứa hình ảnh sản phẩm
├── data/
│   └── products.js     # Dữ liệu sản phẩm (exposes window.products)
└── README.md           # File hướng dẫn
```

## Tính năng

### Trang chủ (index.html)
- Hiển thị banner carousel
- Hiển thị các danh mục sản phẩm:
  - Sơn Tùng Noel
  - Hoa Tặng Giáng Sinh
  - Đang Giảm Giá
  - Đặt Nhiều Nhất
  - Sản Phẩm Mới
- Load dữ liệu từ file JSON
- Thêm sản phẩm vào giỏ hàng

### Trang danh sách sản phẩm (products.html)
- Hiển thị danh sách sản phẩm "Hoa Sinh Nhật"
- Sắp xếp sản phẩm theo:
  - Giá (Thấp > Cao)
  - Giá (Cao > Thấp)
  - Tên A-Z
  - Tên Z-A
- Chọn số lượng sản phẩm hiển thị (12, 24, 36, 48)
- Chuyển đổi giữa chế độ xem Grid và List
- Phân trang sản phẩm

## Quản lý dữ liệu sản phẩm

Tất cả dữ liệu sản phẩm được lưu trong file `data/products.js` (đã bọc thành một object JS và gán vào `window.products`). Cấu trúc dữ liệu:

```json
{
  "categories": [
    {
      "id": "category-id",
      "name": "Tên danh mục",
      "products": [
        {
          "id": 1,
          "name": "Tên sản phẩm",
          "image": "URL hình ảnh",
          "currentPrice": 450000,
          "oldPrice": 490000,
          "discount": 8,
          "hasDiscount": true
        }
      ]
    }
  ]
}
```

### Thêm sản phẩm mới

1. Mở file `data/products.js`
2. Tìm category tương ứng
3. Thêm object sản phẩm mới vào mảng `products`

### Thêm danh mục mới

1. Mở file `data/products.js`
2. Thêm object category mới vào mảng `categories`
3. Cập nhật JavaScript nếu cần hiển thị category mới trên trang chủ

## Cách sử dụng

1. Mở file `index.html` hoặc `products.html` trong trình duyệt
2. Đảm bảo file `data/products.js` nằm trong thư mục `data/` và được nạp trước script chính (đã tự động chèn `<script src="data/products.js"></script>` vào các HTML chính).
3. Website sẽ tự động load dữ liệu từ `window.products`

## Tính năng JavaScript

### main.js
- `loadProducts()`: Load dữ liệu từ JSON
- `renderProductCard(product)`: Render card sản phẩm
- `renderProductSection(category)`: Render section danh mục
- `addToCart(productId)`: Thêm sản phẩm vào giỏ hàng
- `updateCartBadge()`: Cập nhật số lượng trong giỏ hàng

### products.js
- `loadProductsPage()`: Load sản phẩm cho trang danh sách
- `renderProducts()`: Render danh sách sản phẩm
- `sortProducts(products)`: Sắp xếp sản phẩm
- `renderPagination()`: Render phân trang
- `changePage(page)`: Chuyển trang

## Responsive Design

Website được thiết kế responsive với Bootstrap 5:
- Desktop: Hiển thị 4 cột sản phẩm
- Tablet: Hiển thị 2 cột sản phẩm
- Mobile: Hiển thị 1 cột sản phẩm

## Lưu ý

- Dữ liệu giỏ hàng được lưu trong `localStorage` của trình duyệt
- Hình ảnh sản phẩm hiện đang dùng placeholder, cần thay thế bằng URL thực tế
- Cần cấu hình web server để chạy file JSON (tránh lỗi CORS khi mở trực tiếp file HTML)

## Công nghệ sử dụng

- HTML5
- CSS3
- Bootstrap 5.3.0
- Bootstrap Icons
- Vanilla JavaScript (ES6+)

