<script>
    let { shippingData = $bindable() } = $props();
</script>

<div class="checkout-card">
    <h3>📍 Dane do wysyłki</h3>
    <div class="form-grid">
        <div class="input-group">
            <label for="firstName">Imię *</label>
            <input type="text" id="firstName" bind:value={shippingData.firstName} placeholder="Jan" required />
        </div>
        <div class="input-group">
            <label for="lastName">Nazwisko *</label>
            <input type="text" id="lastName" bind:value={shippingData.lastName} placeholder="Kowalski" required />
        </div>
        <div class="input-group full-width">
            <label for="street">Ulica i numer domu/lokalu *</label>
            <input type="text" id="street" bind:value={shippingData.street} placeholder="ul. Sezamkowa 15/2" required />
        </div>
        <div class="input-group">
            <label for="postalCode">Kod pocztowy *</label>
            <input type="text" id="postalCode" bind:value={shippingData.postalCode} placeholder="00-000" required />
        </div>
        <div class="input-group">
            <label for="city">Miejscowość *</label>
            <input type="text" id="city" bind:value={shippingData.city} placeholder="Warszawa" required />
        </div>
        <div class="input-group">
            <label for="country">Kraj *</label>
            <input type="text" id="country" bind:value={shippingData.country} placeholder="Polska" required />
        </div>
        <div class="input-group full-width">
            <label for="phone">Numer telefonu (opcjonalnie)</label>
            <input type="tel" id="phone" bind:value={shippingData.phone} placeholder="+48 123 456 789" />
        </div>
    </div>
</div>

<style>
    .checkout-card { background: #1a202c; padding: 20px; border-radius: 8px; border: 1px solid #2d3748; margin-top: 20px; }
    .checkout-card h3 { margin-top: 0; color: #e2e8f0; border-bottom: 1px solid #2d3748; padding-bottom: 10px; margin-bottom: 20px;}
    
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .full-width { grid-column: span 2; }
    
    .input-group { display: flex; flex-direction: column; }
    .input-group label { font-size: 0.85rem; color: #a0aec0; margin-bottom: 5px; font-weight: bold; }
    .input-group input { 
        background: #2d3748; border: 1px solid #4a5568; color: white; 
        padding: 10px; border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s;
    }
    .input-group input:focus { outline: none; border-color: #3182ce; }
</style>