document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCounter = document.getElementById('cart-counter');
    const totalPriceEl = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    
    // "baisaCraftCart" માંથી કાર્ટની માહિતી મેળવો
    let cart = JSON.parse(localStorage.getItem('baisaCraftCart')) || [];

    // કાર્ટ કાઉન્ટરને અપડેટ કરતું ફંક્શન
    const updateCartCounter = () => {
        if (cartCounter) cartCounter.textContent = cart.length;
    };

    // કુલ કિંમતની ગણતરી કરતું ફંક્શન
    const calculateTotal = () => {
        let total = 0;
        cart.forEach(item => {
            // ખાતરી કરો કે કિંમત એક નંબર છે
            if (item.price && typeof item.price.value === 'number') {
                total += item.price.value;
            }
        });
        return total;
    };
    
    // કાર્ટમાં રહેલી વસ્તુઓને પેજ પર બતાવતું ફંક્શન
    const displayCartItems = () => {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>તમારું કાર્ટ હાલ ખાલી છે.</p>';
            if(checkoutButton) checkoutButton.style.display = 'none'; // જો કાર્ટ ખાલી હોય તો બટન છુપાવો
        } else {
            cartItemsContainer.innerHTML = ''; // જૂની વસ્તુઓ દૂર કરો
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
        
        // ટોટલ અને કાઉન્ટર અપડેટ કરો
        if(totalPriceEl) totalPriceEl.textContent = `₹${calculateTotal()}`;
        updateCartCounter();
        addDeleteListeners();
    };

    // કાર્ટમાંથી વસ્તુ કાઢી નાખવા માટેનું ફંક્શન
    const addDeleteListeners = () => {
        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const indexToRemove = parseInt(e.target.getAttribute('data-index'));
                cart.splice(indexToRemove, 1); // એરેમાંથી વસ્તુ દૂર કરો
                localStorage.setItem('baisaCraftCart', JSON.stringify(cart)); // લોકલ સ્ટોરેજ અપડેટ કરો
                displayCartItems(); // કાર્ટ ફરીથી બતાવો
            });
        });
    };
    
    // ચેકઆઉટ બટન પર ક્લિક કરવાથી checkout.html પર લઈ જશે
    if(checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            window.location.href = '/checkout.html';
        });
    }

    // પેજ લોડ થતાં જ બધી વસ્તુઓ બતાવો
    displayCartItems();
});
