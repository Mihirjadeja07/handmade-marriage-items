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

            const screenshotFile = document.getElementById('payment-screenshot').files[0];
            if (!screenshotFile) {
                alert("કૃપા કરીને પેમેન્ટનો સ્ક્રીનશોટ અપલોડ કરો.");
                return;
            }

            // FormData નો ઉપયોગ ફાઇલ અને ટેક્સ્ટ બંને મોકલવા માટે થાય છે
            const formData = new FormData();
            
            const customerDetails = {
                name: document.getElementById('customer-name').value,
                address: document.getElementById('customer-address').value,
                phone: document.getElementById('customer-phone').value,
                pincode: customerPincode
            };

            // FormData માં બધી માહિતી ઉમેરો
            formData.append('customer', JSON.stringify(customerDetails));
            formData.append('items', JSON.stringify(cart));
            formData.append('total', total);
            formData.append('upiId', document.getElementById('customer-upi-id').value);
            formData.append('paymentScreenshot', screenshotFile);

            try {
                // નોંધ: FormData મોકલતી વખતે headers માં 'Content-Type' નથી લખવાનું,
                // બ્રાઉઝર તે આપમેળે સેટ કરી લે છે.
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    body: formData 
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
