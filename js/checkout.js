document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    const pincodeError = document.getElementById('pincode-error');

    // જુનાગઢ જિલ્લાના માન્ય પિનકોડની યાદી
    const junagadhPincodes = [
        "362001", "362002", "362011", "362015", "362020", "362030", "362037",
        "362110", "362120", "362130", "362135", "362140", "362150",
        "362220", "362222", "362225", "362229", "362240", "362245", "362250", 
        "362255", "362260", "362263", "362268", "362310", "362610", "362620", 
        "362625", "362630", "362640", "362715", "362720", "362725", 
        "365440", "362560", "362565", "362510", "360490"
    ];

    if(checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const customerPincode = document.getElementById('customer-pincode').value;

            // પિનકોડ તપાસો
            if (!junagadhPincodes.includes(customerPincode)) {
                pincodeError.textContent = 'માફ કરશો, આ પિનકોડ પર ડિલિવરી ઉપલબ્ધ નથી.';
                return;
            }
            
            pincodeError.textContent = '';
            
            // ગ્રાહકની વિગતો મેળવો
            const customerDetails = {
                name: document.getElementById('customer-name').value,
                address: document.getElementById('customer-address').value,
                phone: document.getElementById('customer-phone').value,
                pincode: customerPincode
            };

            // કાર્ટમાંથી વસ્તુઓ અને ટોટલ મેળવો
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            if (cartItems.length === 0) {
                alert("તમારું કાર્ટ ખાલી છે!");
                return;
            }
            
            const total = cartItems.reduce((sum, item) => sum + item.price.value, 0);

            // ઓર્ડરનો ડેટા તૈયાર કરો
            const orderData = { customer: customerDetails, items: cartItems, total: total };

            // ઓર્ડરને સર્વર પર મોકલો
            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                if (response.ok) {
                    const result = await response.json();
                    localStorage.removeItem('cart'); // કાર્ટ ખાલી કરો
                    sessionStorage.setItem('lastOrderId', result.orderId); // ઓર્ડર ID સેવ કરો
                    window.location.href = '/order-success.html'; // સફળતા પેજ પર મોકલો
                } else {
                    alert('ઓર્ડર કરવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયત્ન કરો.');
                }
            } catch (error) {
                console.error('Order submission error:', error);
                alert('સર્વર સાથે કનેક્ટ થઈ શક્યું નથી.');
            }
        });
    }
});
