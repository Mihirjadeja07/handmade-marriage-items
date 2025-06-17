document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    const pincodeError = document.getElementById('pincode-error');
    const paymentTotalEl = document.getElementById('payment-total');

    const cart = JSON.parse(localStorage.getItem('baisaCraftCart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price.value || 0), 0);
    if(paymentTotalEl) paymentTotalEl.textContent = `₹${total}`;

    if(checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const customerPincode = document.getElementById('customer-pincode').value;
            if(!/^[3][6-9]\d{4}$/.test(customerPincode)){
                 pincodeError.textContent = 'કૃપા કરીને ગુજરાતનો સાચો પિનકોડ નાખો.';
                 return;
            }
            pincodeError.textContent = '';

            const customerDetails = {
                name: document.getElementById('customer-name').value,
                address: document.getElementById('customer-address').value,
                phone: document.getElementById('customer-phone').value,
                pincode: customerPincode
            };
            
            const upiId = document.getElementById('customer-upi-id').value;
            if (!upiId) {
                alert("કૃપા કરીને UPI ટ્રાન્ઝેક્શન ID નાખો.");
                return;
            }

            const orderData = { 
                customer: customerDetails, 
                items: cart, 
                total: total,
                payment: {
                    upiId: upiId
                }
            };

            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                if (response.ok) {
                    const result = await response.json();
                    localStorage.removeItem('baisaCraftCart');
                    sessionStorage.setItem('lastOrderId', result.orderId);
                    window.location.href = '/order-success.html';
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
