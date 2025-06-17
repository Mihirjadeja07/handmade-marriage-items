document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    const pincodeError = document.getElementById('pincode-error');
    const paymentTotalEl = document.getElementById('payment-total');

    // કાર્ટમાંથી કુલ રકમની ગણતરી કરો
    const cart = JSON.parse(localStorage.getItem('baisaCraftCart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price.value || 0), 0);
    if(paymentTotalEl) paymentTotalEl.textContent = `₹${total}`;

    if(checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // --- ગુજરાતનો પિનકોડ તપાસો (સરળ પદ્ધતિ) ---
            const customerPincode = document.getElementById('customer-pincode').value;
            // ગુજરાતના પિનકોડ 36xxxx થી 39xxxx સુધીના હોય છે.
            if(!/^[3][6-9]\d{4}$/.test(customerPincode)){
                 pincodeError.textContent = 'કૃપા કરીને ગુજરાતનો સાચો પિનકોડ નાખો.';
                 return;
            }
            pincodeError.textContent = ''; // એરર મેસેજ દૂર કરો

            // ગ્રાહકની વિગતો મેળવો
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

            // ઓર્ડરનો ડેટા તૈયાર કરો
            const orderData = { 
                customer: customerDetails, 
                items: cart, 
                total: total,
                payment: {
                    upiId: upiId
                }
            };

            // ઓર્ડરને સર્વર પર મોકલો
            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                if (response.ok) {
                    const result = await response.json();
                    localStorage.removeItem('baisaCraftCart'); // કાર્ટ ખાલી કરો
                    sessionStorage.setItem('lastOrderId', result.orderId); // ઓર્ડર ID સેવ કરો
                    window.location.href = '/order-success.html'; // સફળતા પેજ પર મોકલો
                } else {
                    const errorResult = await response.json();
                    alert(`ઓર્ડર કરવામાં સમસ્યા આવી: ${errorResult.message}`);
                }
            } catch (error) {
                console.error('Order submission error:', error);
                alert('સર્વર સાથે કનેક્ટ થઈ શક્યું નથી.');
            }
        });
    }
});
