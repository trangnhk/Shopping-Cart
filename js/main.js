let productsData = [];
let currentSelectedProduct = null;
let productModal = null;

const formatVND = (price) => price.toLocaleString('vi-VN') + ' VND';

const renderStars = (rating) => {
    let stars = '';
    for (let i = 1; i <= 5; i++) stars += i <= rating ? '★' : '☆';
    return stars;
};

const updateCartBadge = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    if (cart.length > 0) {
        badge.style.display = 'inline-block';
        badge.innerText = cart.length;
    } else {
        badge.style.display = 'none';
    }
};

function renderProducts(products) {
    const container = document.getElementById('product-list');
    if (!container) return;
    container.innerHTML = '';
    products.forEach(prod => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 border-0 bg-transparent product-card" onclick="openProductModal(${prod.id})">
                <img src="${prod.image}" class="card-img-top product-img rounded mb-2" alt="${prod.name}">
                <div class="card-body p-0 text-center">
                    <h6 class="card-title text-truncate mb-1">${prod.name}</h6>
                    <div class="star-rating mb-1">${renderStars(prod.rating)}</div>
                    <div class="price-text">${formatVND(prod.price)}</div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

window.openProductModal = function(productId) {
    currentSelectedProduct = productsData.find(p => p.id === productId);
    if (!currentSelectedProduct) return;
    document.getElementById('modal-img').src = currentSelectedProduct.image;
    document.getElementById('modal-name').innerText = currentSelectedProduct.name;
    document.getElementById('modal-rating').innerHTML = renderStars(currentSelectedProduct.rating);
    document.getElementById('modal-desc').innerText = currentSelectedProduct.description;
    document.getElementById('modal-price').innerText = formatVND(currentSelectedProduct.price);
    if (productModal) productModal.show();
};

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: product.id, quantity: 1, checked: true });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

document.addEventListener("DOMContentLoaded", async () => {
    const modalElement = document.getElementById('productModal');
    if (modalElement) productModal = new bootstrap.Modal(modalElement);

    const btnAddCart = document.getElementById('btn-add-cart');
    const btnBuyNow = document.getElementById('btn-buy-now');

    if (btnAddCart) {
        btnAddCart.addEventListener('click', () => {
            if (currentSelectedProduct) {
                addToCart(currentSelectedProduct);
                alert('Đã thêm sản phẩm vào giỏ hàng!');
            }
        });
    }

    if (btnBuyNow) {
        btnBuyNow.addEventListener('click', () => {
            if (currentSelectedProduct) {
                addToCart(currentSelectedProduct);
                window.location.href = 'cart.html';
            }
        });
    }

    try {
        const response = await fetch('data.json');
        productsData = await response.json();
        localStorage.setItem('productsDB', JSON.stringify(productsData));
        renderProducts(productsData);
        updateCartBadge();
    } catch (error) {
        console.error("Lỗi tải data.json", error);
    }
});