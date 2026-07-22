let cart = JSON.parse(localStorage.getItem('cart')) || [];
let productsDB = JSON.parse(localStorage.getItem('productsDB')) || [];
let currentVoucherPercent = 0;

const formatVND = (price) => Math.round(price).toLocaleString('vi-VN') + ' VND';

function validateQuantity(input) {
    let qty = parseInt(input, 10);
    if (isNaN(qty) || qty < 1) {
        return 1;
    }
    return qty;
}

function validateVoucher(input) {
    if (input === "" || input === null || input === undefined || Number(input) === 0) {
        return { isValid: true, value: 0, message: "" };
    }
    
    let voucher = Number(input);
    if (isNaN(voucher)) {
        return { isValid: false, value: 0, message: "Error: Letters entered! Reset to 0%" };
    }
    if (voucher < 0) {
        return { isValid: false, value: 0, message: "Error: Negative value! Reset to 0%" };
    }
    if (voucher > 100) {
        return { isValid: false, value: 100, message: "Error: Exceeded 100%! Capped at 100%" };
    }

    const allowedVouchers = [...new Set(
        cart
            .filter(item => item.checked)
            .map(item => {
                const p = productsDB.find(prod => prod.id === item.id);
                return (p && p.voucher !== null && p.voucher !== undefined) ? Number(p.voucher) : null;
            })
            .filter(v => v !== null)
    )];

    if (!allowedVouchers.includes(voucher)) {
        const allowedText = allowedVouchers.length > 0 ? allowedVouchers.join('%, ') + '%' : 'None';
        return { 
            isValid: false, 
            value: 0, 
            message: `Error: Invalid voucher code! (Allowed for selected items: ${allowedText})` 
        };
    }

    return { isValid: true, value: voucher, message: "" };
}

function calculateTotal() {
    let subtotal = 0;
    let totalTaxAmount = 0;
    let checkedItemsCount = 0;
    let totalTaxPercentSum = 0;

    cart.forEach(item => {
        if (item.checked) {
            const product = productsDB.find(p => p.id === item.id);
            if (product) {
                checkedItemsCount++;
                const itemQty = validateQuantity(item.quantity);
                const itemPrice = Number(product.price) || 0;
                const taxRate = (product.tax !== null && !isNaN(product.tax)) ? Number(product.tax) : 0;

                const itemSubtotal = itemPrice * itemQty;
                subtotal += itemSubtotal;

                const itemTax = itemSubtotal * (taxRate / 100);
                totalTaxAmount += itemTax;
                totalTaxPercentSum += taxRate;
            }
        }
    });

    const avgTaxRate = checkedItemsCount > 0 ? Math.round(totalTaxPercentSum / checkedItemsCount) : 0;
    const totalBeforeDiscount = subtotal + totalTaxAmount;
    const discountAmount = totalBeforeDiscount * (currentVoucherPercent / 100);
    const finalTotal = totalBeforeDiscount - discountAmount;

    document.getElementById('display-subtotal').innerText = formatVND(subtotal);
    document.getElementById('display-tax-rate').innerText = `${avgTaxRate}%`;
    document.getElementById('display-tax-amount').innerText = `+ ${formatVND(totalTaxAmount)}`;
    document.getElementById('display-discount').innerText = `- ${formatVND(discountAmount)}`;
    document.getElementById('final-total-price').innerText = formatVND(finalTotal > 0 ? finalTotal : 0);
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = `<div class="alert alert-info fw-bold">Your shopping cart is currently empty!</div>`;
        calculateTotal();
        return;
    }

    cart.forEach((item, index) => {
        const product = productsDB.find(p => p.id === item.id);
        if (!product) return;
        item.quantity = validateQuantity(item.quantity);

        const itemDiv = document.createElement('div');
        itemDiv.className = 'd-flex align-items-center justify-content-between mb-4 pb-3 border-bottom';
        itemDiv.innerHTML = `
            <div class="me-3">
                <input class="form-check-input fs-4" type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleCheck(${index})">
            </div>
            <div class="d-flex align-items-center flex-grow-1 me-3">
                <img src="${product.image}" alt="${product.name}" class="cart-item-img rounded me-3">
                <div>
                    <h6 class="fw-bold mb-1">${product.name}</h6>
                    <small class="text-muted">Tax: ${product.tax ? product.tax + '%' : '0%'}</small>
                </div>
            </div>
            <div class="text-end d-flex flex-column align-items-end">
                <img src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png" alt="Delete" width="20" class="trash-icon mb-2" onclick="removeItem(${index})">
                <div class="price-text mb-2">${formatVND(product.price)}</div>
                <div class="input-group input-group-sm quantity-box">
                    <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${index}, -1)">-</button>
                    <input type="text" class="form-control quantity-input" value="${item.quantity}" onchange="inputQuantityChange(${index}, this.value)">
                    <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
        `;
        container.appendChild(itemDiv);
    });

    calculateTotal();
}

function saveAndRefresh() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

window.toggleCheck = (index) => { cart[index].checked = !cart[index].checked; saveAndRefresh(); };
window.updateQuantity = (index, change) => {
    let newQty = cart[index].quantity + change;
    if (newQty > 0) {
        cart[index].quantity = newQty;
        saveAndRefresh();
    } else {
        if (confirm('Do you want to remove this product from your cart?')) {
            cart.splice(index, 1);
            saveAndRefresh();
        }
    }
};
window.inputQuantityChange = (index, value) => {
    cart[index].quantity = validateQuantity(value);
    saveAndRefresh();
};
window.removeItem = (index) => { cart.splice(index, 1); saveAndRefresh(); };


// INSTRUCTOR TEST SCENARIOS (WRONG vs CORRECT OUTPUT)
window.runTestScenario = function(scenarioId) {
    const compBox = document.getElementById('comparison-display');
    const wrongEl = document.getElementById('wrong-output-content');
    const correctEl = document.getElementById('correct-output-content');
    const explainEl = document.getElementById('explanation-content');
    const inputVoucher = document.getElementById('input-voucher');
    const voucherError = document.getElementById('voucher-error');

    compBox.style.display = 'block';

    if (!productsDB || productsDB.length === 0) {
        productsDB = [
            {"id": 1, "name": "Mechanical Keyboard Pro", "price": 1500000, "image": "https://placehold.co/300x300", "tax": 10, "voucher": 20},
            {"id": 2, "name": "Wireless Ergonomic Mouse", "price": 450000, "image": "https://placehold.co/300x300", "tax": null, "voucher": null},
            {"id": 3, "name": "Ultra-wide Monitor 34 inch", "price": 8900000, "image": "https://placehold.co/300x300", "tax": 12, "voucher": 15}
        ];
    }

    let item1 = productsDB.find(p => p.id === 1);
    let item2 = productsDB.find(p => p.id === 2);
    let item3 = productsDB.find(p => p.id === 3);
    if (item1) { item1.tax = 10; item1.voucher = 20; }
    if (item2) { item2.tax = null; item2.voucher = null; }
    if (item3) { item3.tax = 12; item3.voucher = 15; }
    localStorage.setItem('productsDB', JSON.stringify(productsDB));

    if (scenarioId === 1) {
        // SCENARIO 1: NORMAL CASE (2 items of Product A -> Voucher must be 20%)
        cart = [{ id: 1, quantity: 2, checked: true }]; // 2 x 1.5M = 3M + 10% tax = 3.3M
        inputVoucher.value = "20";
        currentVoucherPercent = 20;
        if (voucherError) voucherError.style.display = "none";

        wrongEl.innerHTML = `
            <b>Hypothetical Error:</b> If the developer forgets to add TAX before applying the Voucher, or uses the wrong priority order.<br>
            <ul>
                <li>Subtotal: 3,000,000 VND</li>
                <li>Subtract 20% Voucher first: -600,000 VND</li>
                <li>Add 10% Tax: +240,000 VND</li>
                <li><b>Incorrect Final Total: 2,640,000 VND</b> (Flawed tax calculation logic!)</li>
            </ul>
        `;

        correctEl.innerHTML = `
            <b>Standard Formula Implementation:</b><br>
            <ul>
                <li>Subtotal (2 keyboards): <b>3,000,000 VND</b></li>
                <li>TAX (10%): <b>+300,000 VND</b></li>
                <li>Total before discount: 3,300,000 VND</li>
                <li>Voucher (20%): <b>-660,000 VND</b></li>
                <li><b class="text-success fs-6">Correct Final Total: 2,640,000 VND</b></li>
            </ul>
        `;

        explainEl.innerHTML = `
            <b>Happy Path Logic:</b><br>
            Code strictly adheres to the standard order: <br>
            <code>Total = (Price * Qty * (1 + Tax%)) * (1 - Voucher%)</code>
            <span class="code-snippet">// 2 items of Product A still share the same 20% voucher. Validated!</span>
        `;
    } 
    else if (scenarioId === 2) {
        // SCENARIO 2: ZERO TAX & ZERO VOUCHER
        cart = [{ id: 2, quantity: 1, checked: true }]; // 1 x 450k, Tax = null
        inputVoucher.value = "0";
        currentVoucherPercent = 0;
        if (voucherError) voucherError.style.display = "none";

        wrongEl.innerHTML = `
            <b>Hypothetical Error:</b> In the JSON data, the attribute is set to <code>tax: null</code>.<br>
            If the JS code lacks a null check during arithmetic operations:
            <ul>
                <li><code>450,000 * (1 + null/100)</code> -> May result in <b>NaN</b> or crash the script in older browsers.</li>
                <li>Or if divided by zero: <b>Infinity / Divide by Zero Error</b>.</li>
                <li><b>UI displays error: NaN VND</b> or <b>undefined</b>.</li>
            </ul>
        `;

        correctEl.innerHTML = `
            <b>Safe Handling (Edge Case):</b><br>
            <ul>
                <li>Subtotal (1 mouse): <b>450,000 VND</b></li>
                <li>TAX (null -> 0%): <b>0 VND</b></li>
                <li>Voucher (0%): <b>0 VND</b></li>
                <li><b class="text-success fs-6">Correct Final Total: 450,000 VND</b></li>
            </ul>
            <span class="badge bg-success mt-1">✔ UI displays clean currency figures</span>
        `;

        explainEl.innerHTML = `
            <b>Defensive Programming:</b><br>
            Using ternary operators to check for null/NaN prior to multiplication:
            <span class="code-snippet">const taxRate = (product.tax !== null && !isNaN(product.tax)) ? Number(product.tax) : 0;</span>
        `;
    } 
    else if (scenarioId === 3) {
        // SCENARIO 3: MULTIPLE PRODUCTS WITH DIFFERENT VOUCHERS + INVALID INPUT
        cart = [
            { id: 1, quantity: 2, checked: true }, // Voucher 20%
            { id: 3, quantity: 1, checked: true }  // Voucher 15%
        ];
        
        inputVoucher.value = "50"; 
        let check = validateVoucher("50");

        currentVoucherPercent = check.value;
        if (voucherError) {
            voucherError.innerText = check.message;
            voucherError.style.display = "block";
        }
        
        wrongEl.innerHTML = `
            <b>Hypothetical Error (Without Validation):</b><br>
            Cart has 2 items of Product A (20%) and 1 item of Product C (15%). User illegally enters a fake voucher <code>50%</code>:<br>
            <ul>
                <li>Subtotal: 3M + 8.9M = <b>11,900,000 VND</b></li>
                <li>TAX: 300k + 1,068k = <b>1,368,000 VND</b></li>
                <li>Fake Voucher 50% applied illegally: -6,634,000 VND!</li>
                <li><b>Incorrect Final Total: 6,634,000 VND</b></li>
            </ul>
            <span class="badge bg-danger">CRITICAL ERROR: Unvalidated voucher causes massive financial loss!</span>
        `;

        correctEl.innerHTML = `
            <b>After JS Intercept & Validate:</b><br>
            <ul>
                <li>Allowed vouchers for selected items: <b>20% or 15%</b></li>
                <li>Entered Voucher <code>50%</code> -> Blocked! Does not match product data. Reset to: <b>0%</b></li>
                <li>Total before discount: <b>13,268,000 VND</b></li>
                <li>Discount amount (0%): <b>-0 VND</b></li>
                <li><b class="text-success fs-6">Safe Final Total: 13,268,000 VND</b></li>
            </ul>
            <span class="badge bg-success">✔ Order & Voucher fully protected</span>
        `;

        explainEl.innerHTML = `
            <b>Business Logic Validation:</b><br>
            System scans <code>productsDB</code> for selected items and builds an allowed list <code>[20, 15]</code>. Any input not matching this list is immediately blocked:
            <span class="code-snippet">if (!allowedVouchers.includes(voucher)) return { isValid: false, value: 0 };</span>
        `;
    }

    saveAndRefresh();
};

// INITIALIZE CART
document.addEventListener("DOMContentLoaded", () => {
    renderCart();

    const inputVoucher = document.getElementById('input-voucher');
    const voucherError = document.getElementById('voucher-error');

    if (inputVoucher) {
        inputVoucher.addEventListener('input', (e) => {
            const result = validateVoucher(e.target.value);
            if (!result.isValid) {
                if (voucherError) {
                    voucherError.innerText = result.message;
                    voucherError.style.display = "block";
                }
            } else {
                if (voucherError) voucherError.style.display = "none";
            }
            currentVoucherPercent = result.value;
            calculateTotal();
        });

        inputVoucher.addEventListener('blur', (e) => {
            const result = validateVoucher(e.target.value);
            e.target.value = result.value;
            if (result.isValid && voucherError) voucherError.style.display = "none";
        });
    }

    const btnPay = document.getElementById('btn-pay');
    if (btnPay) {
        btnPay.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is currently empty! Please select products before proceeding to checkout.');
                return;
            }
            alert('Payment successful! (Validated & Clean Data Processed)');
        });
    }
});