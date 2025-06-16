document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const addProductForm = document.getElementById('add-product-form');
    const adminProductContainer = document.getElementById('admin-product-container');
    const adminOrdersContainer = document.getElementById('admin-orders-container');

    // ============= લોગિન અને સુરક્ષા =============
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    const onDashboardPage = window.location.pathname.includes('dashboard.html');
    if (onDashboardPage) {
        if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
            window.location.href = '/admin/login.html';
        } else {
            fetchAndDisplayProducts();
            fetchAndDisplayOrders();
        }
    }
    
    // ============= Admin Functions =============
    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (result.success) {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                window.location.href = '/admin/dashboard.html';
            } else {
                errorMessage.textContent = 'ઈમેલ કે પાસવર્ડ ખોટો છે.';
            }
        } catch (error) {
            errorMessage.textContent = 'સર્વર સાથે કનેક્ટ થઈ શક્યું નથી.';
        }
    }

    function handleLogout() {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.href = '/admin/login.html';
    }

    // --- પ્રોડક્ટ મેનેજમેન્ટ ---
    async function fetchAndDisplayProducts() {
        if (!adminProductContainer) return;
        
        const response = await fetch('/api/products');
        const products = await response.json();

        adminProductContainer.innerHTML = '';
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'cart-item';
            productDiv.innerHTML = `
                <img src="/${product.image_url}" alt="${product.name}">
                <div class="cart-item-details">
                    <h4>${product.name}</h4>
                    <p>₹${product.price.value} / ${product.price.unit}</p>
                </div>
                <button class="delete-button" data-id="${product.id}">ડિલીટ</button>
            `;
            adminProductContainer.appendChild(productDiv);
        });
        
        addDeleteEventListeners();
    }
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newProduct = {
                name: document.getElementById('product-name').value,
                price: document.getElementById('product-price').value,
                unit: document.getElementById('product-unit').value,
                image_url: document.getElementById('product-image').value
            };
            
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            
            if (response.ok) {
                alert('પ્રોડક્ટ સફળતાપૂર્વક ઉમેરાઈ ગઈ છે!');
                addProductForm.reset();
                fetchAndDisplayProducts();
            } else {
                alert('પ્રોડક્ટ ઉમેરવામાં નિષ્ફળતા મળી.');
            }
        });
    }

    function addDeleteEventListeners() {
        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.getAttribute('data-id');
                if (confirm('શું તમે આ પ્રોડક્ટને ખરેખર ડિલીટ કરવા માંગો છો?')) {
                    const response = await fetch(`/api/products/${productId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        fetchAndDisplayProducts();
                    } else {
                        alert('પ્રોડક્ટ ડિલીટ કરવામાં નિષ્ફળતા મળી.');
                    }
                }
            });
        });
    }

    // --- ઓર્ડર મેનેજમેન્ટ ---
    async function fetchAndDisplayOrders() {
        if (!adminOrdersContainer) return;

        try {
            const response = await fetch('/api/admin/orders');
            const orders = await response.json();
            adminOrdersContainer.innerHTML = '';

            if (orders.length === 0) {
                adminOrdersContainer.innerHTML = '<p>હજુ સુધી કોઈ ઓર્ડર મળ્યો નથી.</p>';
                return;
            }
            
            orders.reverse().forEach(order => {
                const orderItemsHTML = order.items.map(item => 
                    `<li>${item.name} (₹${item.price.value})</li>`
                ).join('');

                const orderCard = document.createElement('div');
                orderCard.className = 'order-card';
                orderCard.innerHTML = `
                    <div class="order-header">
                        <h4>ઓર્ડર ID: #${order.orderId}</h4>
                        <span>${order.timestamp}</span>
                    </div>
                    <div class="order-body">
                        <p><strong>ગ્રાહક:</strong> ${order.customer.name}</p>
                        <p><strong>સરનામું:</strong> ${order.customer.address}, ${order.customer.pincode}</p>
                        <p><strong>ફોન:</strong> ${order.customer.phone}</p>
                        <p><strong>ઓર્ડરની વસ્તુઓ:</strong></p>
                        <ul>${orderItemsHTML}</ul>
                    </div>
                    <div class="order-footer">
                        <strong>કુલ રકમ: ₹${order.total}</strong>
                    </div>
                `;
                adminOrdersContainer.appendChild(orderCard);
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            adminOrdersContainer.innerHTML = '<p>ઓર્ડર્સ લોડ કરવામાં સમસ્યા આવી.</p>';
        }
    }
});
