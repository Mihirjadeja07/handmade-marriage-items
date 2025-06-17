document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const productForm = document.getElementById('product-form');
    const adminProductContainer = document.getElementById('admin-product-container');
    const adminOrdersContainer = document.getElementById('admin-orders-container');
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('form-submit-button');
    const cancelButton = document.getElementById('form-cancel-button');
    const productIdField = document.getElementById('product-id');

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
        
        try {
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
                    <div class="admin-buttons">
                        <button class="edit-button" data-id="${product._id}">એડિટ</button>
                        <button class="delete-button" data-id="${product._id}">ડિલીટ</button>
                    </div>
                `;
                adminProductContainer.appendChild(productDiv);
            });
            
            addEditEventListeners(products);
            addProductDeleteListeners();
        } catch (error) {
            console.error("Error fetching products for admin:", error);
            adminProductContainer.innerHTML = "<p>પ્રોડક્ટ્સ લોડ કરવામાં સમસ્યા આવી.</p>";
        }
    }
    
    if (productForm) {
        productForm.addEventListener('submit', handleFormSubmit);
    }
    
    if(cancelButton) {
        cancelButton.addEventListener('click', resetForm);
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'પ્રોસેસિંગ...';

        const productId = productIdField.value;
        const productData = {
            name: document.getElementById('product-name').value,
            price: document.getElementById('product-price').value,
            unit: document.getElementById('product-unit').value,
            image_url: document.getElementById('product-image').value
        };

        const method = productId ? 'PUT' : 'POST';
        const url = productId ? `/api/products/${productId}` : '/api/products';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(productId ? 'પ્રોડક્ટ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે!' : 'પ્રોડક્ટ સફળતાપૂર્વક ઉમેરાઈ ગઈ છે!');
                resetForm();
                fetchAndDisplayProducts();
            } else {
                // સર્વરમાંથી આવેલો સ્પષ્ટ એરર મેસેજ બતાવો
                alert(`ભૂલ: ${result.message || 'અજાણી ભૂલ થઈ.'}`);
            }
        } catch (error) {
            console.error("Form submission error:", error);
            alert('કંઈક ભૂલ થઈ. કૃપા કરીને કન્સોલ તપાસો.');
        } finally {
            // બટનને ફરીથી કાર્યરત કરો
            submitButton.disabled = false;
            submitButton.textContent = productId ? 'અપડેટ કરો' : 'પ્રોડક્ટ ઉમેરો';
        }
    }

    function addEditEventListeners(products) {
        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                const productToEdit = products.find(p => p._id === productId);
                
                if (productToEdit) {
                    formTitle.textContent = 'પ્રોડક્ટ એડિટ કરો';
                    productIdField.value = productToEdit._id;
                    document.getElementById('product-name').value = productToEdit.name;
                    document.getElementById('product-price').value = productToEdit.price.value;
                    document.getElementById('product-unit').value = productToEdit.price.unit;
                    document.getElementById('product-image').value = productToEdit.image_url;
                    submitButton.textContent = 'અપડેટ કરો';
                    cancelButton.style.display = 'inline-block';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    function addProductDeleteListeners() {
        const deleteButtons = document.querySelectorAll('.admin-products-list .delete-button');
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

    function resetForm() {
        formTitle.textContent = 'નવી પ્રોડક્ટ ઉમેરો';
        productForm.reset();
        productIdField.value = '';
        submitButton.textContent = 'પ્રોડક્ટ ઉમેરો';
        cancelButton.style.display = 'none';
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
                        <span>${new Date(order.timestamp).toLocaleString('gu-IN')}</span>
                    </div>
                    <div class="order-body">
                        <p><strong>ગ્રાહક:</strong> ${order.customer.name}</p>
                        <p><strong>સરનામું:</strong> ${order.customer.address}, ${order.customer.pincode}</p>
                        <p><strong>ફોન:</strong> ${order.customer.phone}</p>
                        <p><strong>UPI ID:</strong> ${order.payment.upiId}</p>
                        <p><strong>ઓર્ડરની વસ્તુઓ:</strong></p>
                        <ul>${orderItemsHTML}</ul>
                    </div>
                    <div class="order-footer">
                        <strong>કુલ રકમ: ₹${order.total}</strong>
                        <button class="delete-button order-delete-btn" data-id="${order._id}">ઓર્ડર ડિલીટ કરો</button>
                    </div>
                `;
                adminOrdersContainer.appendChild(orderCard);
            });
            
            addOrderDeleteEventListeners();
        } catch (error) {
            console.error('Error fetching orders:', error);
            adminOrdersContainer.innerHTML = '<p>ઓર્ડર્સ લોડ કરવામાં સમસ્યા આવી.</p>';
        }
    }

    function addOrderDeleteEventListeners() {
        const deleteButtons = document.querySelectorAll('.order-delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const orderId = e.target.getAttribute('data-id');
                if (confirm('શું તમે આ ઓર્ડરને ખરેખર ડિલીટ કરવા માંગો છો? આ પ્રક્રિયા ઉલટાવી શકાશે નહીં.')) {
                    const response = await fetch(`/api/admin/orders/${orderId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        fetchAndDisplayOrders();
                    } else {
                        alert('ઓર્ડર ડિલીટ કરવામાં નિષ્ફળતા મળી.');
                    }
                }
            });
        });
    }
});
