document.addEventListener('DOMContentLoaded', () => {
    
    const productContainer = document.querySelector('.product-container');
    const cartCounter = document.getElementById('cart-counter');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const updateCartCounter = () => {
        if(cartCounter) cartCounter.textContent = cart.length;
    };

    if (productContainer) {
        fetch('/api/products')
            .then(response => response.json())
            .then(products => {
                productContainer.innerHTML = '';
                products.forEach(product => {
                    const productCardHTML = `
                        <div class="product-card">
                            <img src="${product.image_url}" alt="${product.name}">
                            <h3>${product.name}</h3>
                            <p class="price">₹${product.price.value} / ${product.price.unit}</p>
                            <button class="order-button" data-product-id="${product.id}">કાર્ટમાં ઉમેરો</button>
                        </div>
                    `;
                    productContainer.innerHTML += productCardHTML;
                });
                
                addEventListenersToButtons(products);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                productContainer.innerHTML = '<p>પ્રોડક્ટ્સ લોડ કરવામાં સમસ્યા આવી રહી છે.</p>';
            });
    }

    const addEventListenersToButtons = (products) => {
        const orderButtons = document.querySelectorAll('.order-button');
        orderButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.getAttribute('data-product-id'));
                const productToAdd = products.find(p => p.id === productId);
                
                if (productToAdd) {
                    cart.push(productToAdd);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartCounter();
                    alert(`${productToAdd.name} તમારા કાર્ટમાં ઉમેરાઈ ગયું છે!`);
                }
            });
        });
    };

    updateCartCounter();
});
