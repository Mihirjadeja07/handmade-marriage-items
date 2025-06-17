document.addEventListener('DOMContentLoaded', () => {
    
    const productContainer = document.querySelector('.product-container');
    const cartCounter = document.getElementById('cart-counter');

    // કાર્ટની માહિતી બ્રાઉઝરના લોકલ સ્ટોરેજમાંથી મેળવો
    let cart = JSON.parse(localStorage.getItem('baisaCraftCart')) || [];
    
    // કાર્ટ કાઉન્ટરને અપડેટ કરતું ફંક્શન
    const updateCartCounter = () => {
        if(cartCounter) cartCounter.textContent = cart.length;
    };

    // આ કોડ ફક્ત એ જ પેજ પર ચાલશે જ્યાં પ્રોડક્ટ બતાવવાની છે
    if (productContainer) {
        // API માંથી પ્રોડક્ટ્સ લાવો
        fetch('/api/products') // એબ્સોલ્યુટ પાથનો ઉપયોગ
            .then(response => response.json())
            .then(products => {
                // જો ડેટાબેઝમાં કોઈ પ્રોડક્ટ ન હોય તો ડેમો પ્રોડક્ટ્સ બતાવો
                if(products.length === 0 && window.location.pathname === '/'){
                    productContainer.innerHTML = `
                        <div class="product-card">
                            <img src="images/placeholder_chundadi.jpg" alt="રજવાડી ચુંદડી">
                            <h3>રજવાડી ચુંદડી</h3>
                            <p class="price">₹1500 / નંગ</p>
                            <button class="order-button">કાર્ટમાં ઉમેરો</button>
                        </div>
                        <div class="product-card">
                            <img src="images/placeholder_khambha.jpg" alt="લગ્નના ખમ્ભા">
                            <h3>લગ્નના ખમ્ભા</h3>
                            <p class="price">₹2100 / જોડી</p>
                            <button class="order-button">કાર્ટમાં ઉમેરો</button>
                        </div>
                        <div class="product-card">
                            <img src="images/placeholder_sirakh.jpg" alt="હાથબનાવટ સિરખ">
                            <h3>હાથબનાવટ સિરખ</h3>
                            <p class="price">₹1100 / નંગ</p>
                            <button class="order-button">કાર્ટમાં ઉમેરો</button>
                        </div>
                    `;
                    alert("ડેટાબેઝ ખાલી છે. એડમિન પેનલમાંથી પ્રોડક્ટ્સ ઉમેરો.");
                    return;
                }

                productContainer.innerHTML = ''; // જૂનો ડેટા સાફ કરો
                products.forEach(product => {
                    // દરેક પ્રોડક્ટ માટે HTML કાર્ડ બનાવો
                    const productCardHTML = `
                        <div class="product-card">
                            <img src="${product.image_url}" alt="${product.name}">
                            <h3>${product.name}</h3>
                            <p class="price">₹${product.price.value} / ${product.price.unit}</p>
                            <button class="order-button" data-product-id="${product._id}">કાર્ટમાં ઉમેરો</button>
                        </div>
                    `;
                    productContainer.innerHTML += productCardHTML;
                });
                
                // નવા બનેલા બટનો પર ઇવેન્ટ લિસનર ઉમેરો
                addEventListenersToButtons(products);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                productContainer.innerHTML = '<p>પ્રોડક્ટ્સ લોડ કરવામાં સમસ્યા આવી રહી છે.</p>';
            });
    }

    // કાર્ટમાં ઉમેરવા માટેનું ફંક્શન
    const addEventListenersToButtons = (products) => {
        const orderButtons = document.querySelectorAll('.order-button');
        orderButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.getAttribute('data-product-id');
                const productToAdd = products.find(p => p._id === productId);
                
                if (productToAdd) {
                    cart.push(productToAdd);
                    localStorage.setItem('baisaCraftCart', JSON.stringify(cart)); // નવા પ્રોજેક્ટ માટે અલગ કાર્ટ
                    updateCartCounter();
                    alert(`'${productToAdd.name}' તમારા કાર્ટમાં ઉમેરાઈ ગયું છે!`);
                }
            });
        });
    };

    // પેજ લોડ થતાં જ કાર્ટ કાઉન્ટર અપડેટ કરો
    updateCartCounter();
});
