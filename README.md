# Shopping-Cart

A responsive and dynamic e-commerce frontend demonstration project built to evaluate **Middle-level Frontend Development** skills. This project strictly adheres to clean separation of concerns using **HTML5**, **Bootstrap 5 (CDN)**, and **Pure Vanilla JavaScript (ES6+)**, utilizing browser `localStorage` as a mock database.

It features a product catalog, interactive product modals, dynamic cart calculations, strict data validation, and a built-in **Instructor Test Comparison Panel** designed for academic and technical evaluation.

---

## 🚀 Key Features

### 1. Product Catalog & Detail Modal
* **Dynamic Catalog:** Fetches and renders 20 sample products from `data.json` with formatted VND pricing and dynamic 5-star rating displays.
* **Seamless Modal View:** Clicking any product opens a detailed modal (Frame 2) allowing users to inspect descriptions, view prices, and trigger actions.
* **Smart Cart Actions:** Supports *"Add to Cart"* (adds item and updates cart badge without reloading) and *"Buy Now"* (adds item and redirects directly to the checkout cart).

### 2. Dynamic Shopping Cart
* **Real-time Math Engine:** Calculates item subtotals, average estimated tax rates, discount amounts, and final totals automatically.
* **Interactive Controls:** Includes item selection checkboxes, increment/decrement quantity buttons, and item removal with confirmation prompts.
* **Data Persistence:** Automatically syncs cart state and product modifications with browser `localStorage`.

### 3. Strict Data Sanitization & Business Logic
* **Typed Input Validation:** Protects calculations against invalid user inputs. Automatically catches non-numeric strings, converts negative quantities to a minimum of `1`, and caps inputs to sensible bounds.
* **Business Logic Validation:** Scans the selected items in the cart and dynamically builds a whitelist of allowed discount vouchers. If a user enters an unauthorized voucher code (e.g., trying to apply a 50% discount when the cart items only allow 15% or 20%), the system blocks the input and displays an inline error:
  > `Error: Invalid voucher code! (Allowed for selected items: 20%, 15%)`

### 4. 👨‍🏫 Instructor Test Comparison Panel
To facilitate grading and technical evaluation, the cart interface features an interactive comparison engine that displays **Wrong Output (Before JS Fix)** vs **Correct Output (After JS Sanitization)** alongside technical explanations across 3 test scenarios:
* **Scenario 1 (Normal Case - Happy Path):** Demonstrates correct formula execution with 10% Tax and a valid 20% Voucher applied in proper mathematical precedence: `Total = (Price * Qty * (1 + Tax%)) * (1 - Voucher%)`.
* **Scenario 2 (Edge Case - Zero Tax & Zero Voucher):** Proves defensive programming capabilities by safely handling `tax: null` values from JSON without throwing `NaN` or division-by-zero errors.
* **Scenario 3 (Negative Test & Illegal Vouchers):** Simulates a "destructive" user entering negative quantities (`-5`) and unmatched voucher codes (`50%`), showcasing how the JS engine intercepts, sanitizes, and protects order totals from dropping into negative values.

---

## 🛠️ Tech Stack

* **Structure:** HTML5 (Semantic Markup)
* **Styling & Layout:** CSS3, Bootstrap 5.3.0 (via CDN), CSS Grid & Flexbox
* **Logic & DOM Manipulation:** Pure Vanilla JavaScript (ES6+), Fetch API
* **Storage:** Browser `localStorage`

---

## 📁 Project Structure

```text
├── data.json        # Mock database containing 20 products (price, rating, voucher, tax)
├── index.html       # Home & Modal product detail
├── cart.html        # Shopping cart & test scenarios
├── style/
│   └── style.css    # Custom styling for comparison cards and responsive layout
├── wireframe/       # Simple wireframe for each screen
│   └── index.png
|   |__ cart.png
|   |__ productDetail.png
└── js/
    ├── main.js      # Logic for catalog rendering, modal interactions, and cart badge
    └── cart.js      # Core cart engine, math formulas, validation checks, and test suites