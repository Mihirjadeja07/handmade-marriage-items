document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCounter = document.getElementById('cart-counter');
    const totalPriceEl = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const updateCartCounter = () => {
        if (cartCounter) cartCounter.textContent = cart.length;
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.price.value, 0);
    };
    
    const displayCartItems = () => {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>તમારું કાર્ટ હાલ ખાલી છે.</p>';
            if(checkoutButton) checkoutButton.style.display = 'none';
        } else {
            cartItemsContainer.innerHTML = ''; 
            cart.forEach((item, index) => {
                const cartItemHTML = `
                    <div class="cart-item">
                        <img src="${item.image_url}" alt="${item.name}">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>₹${item.price.value} / ${item.price.unit}</p>
                        </div>
                        <button class="delete-button" data-index="${index}">કાઢી નાખો</button>
                    </div>
                `;
                cartItemsContainer.innerHTML += cartItemHTML;
            });
            if(checkoutButton) checkoutButton.style.display = 'block';
        }
        
        if(totalPriceEl) totalPriceEl.textContent = `₹${calculateTotal()}`;
        updateCartCounter();
        addDeleteListeners();
    };

    const addDeleteListeners = () => {
        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const indexToRemove = parseInt(e.target.getAttribute('data-index'));
                cart.splice(indexToRemove, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                displayCartItems();
            });
        });
    };
    
    if(checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            window.location.href = '/checkout.html';
        });
    }

    displayCartItems();
});
