<script>
    // Odbieramy dane oraz informację z zewnątrz, czy klient wybrał paczkomat
    let { shippingData = $bindable(), isPaczkomat = false } = $props();
</script>

<div class="checkout-card">
    <h3>{isPaczkomat ? '📦 Dane do Paczkomatu' : '📍 Dane do wysyłki'}</h3>
    <div class="form-grid">
        <div class="input-group">
            <label for="firstName">Imię *</label>
            <input type="text" id="firstName" bind:value={shippingData.firstName} placeholder="Jan" required />
        </div>
        <div class="input-group">
            <label for="lastName">Nazwisko *</label>
            <input type="text" id="lastName" bind:value={shippingData.lastName} placeholder="Kowalski" required />
        </div>

        {#if isPaczkomat}
            <div class="input-group full-width">
                <label for="paczkomatId">Kod Paczkomatu (np. WAW123A) *</label>
                <input type="text" id="paczkomatId" bind:value={shippingData.paczkomatId} placeholder="Wpisz kod paczkomatu" required />
            </div>
        {:else}
            <div class="input-group full-width address-split">
                <div class="sub-group" style="flex: 2;">
                    <label for="streetName">Ulica *</label>
                    <input type="text" id="streetName" bind:value={shippingData.streetName} placeholder="Sezamkowa" required />
                </div>
                <div class="sub-group" style="flex: 1;">
                    <label for="buildingNumber">Nr domu *</label>
                    <input type="text" id="buildingNumber" bind:value={shippingData.buildingNumber} placeholder="15" required />
                </div>
                <div class="sub-group" style="flex: 1;">
                    <label for="apartmentNumber">Nr lokalu</label>
                    <input type="text" id="apartmentNumber" bind:value={shippingData.apartmentNumber} placeholder="(Opcjonalnie)" />
                </div>
            </div>
        {/if}

        <div class="input-group">
            <label for="postalCode">Kod pocztowy *</label>
            <input type="text" id="postalCode" bind:value={shippingData.postalCode} placeholder="00-000" required />
        </div>
        <div class="input-group">
            <label for="city">Miejscowość *</label>
            <input type="text" id="city" bind:value={shippingData.city} placeholder="Warszawa" required />
        </div>
        <div class="input-group full-width">
            <label for="phone">Numer telefonu {isPaczkomat ? '*' : '(Opcjonalnie)'}</label>
            <input type="tel" id="phone" bind:value={shippingData.phone} placeholder="+48 123 456 789" required={isPaczkomat} />
        </div>
    </div>
</div>

<style>
    .checkout-card { background: #1a202c; padding: 20px; border-radius: 8px; border: 1px solid #2d3748; margin-top: 20px; }
    .checkout-card h3 { margin-top: 0; color: #e2e8f0; border-bottom: 1px solid #2d3748; padding-bottom: 10px; margin-bottom: 20px;}
    
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .full-width { grid-column: span 2; }
    
    /* Nowe style dla podzielonej ulicy */
    .address-split { display: flex; gap: 10px; }
    .sub-group { display: flex; flex-direction: column; }
    
    .input-group, .sub-group { display: flex; flex-direction: column; }
    .input-group label, .sub-group label { font-size: 0.85rem; color: #a0aec0; margin-bottom: 5px; font-weight: bold; }
    .input-group input, .sub-group input { 
        background: #2d3748; border: 1px solid #4a5568; color: white; 
        padding: 10px; border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s;
        width: 100%; box-sizing: border-box;
    }
    .input-group input:focus, .sub-group input:focus { outline: none; border-color: #3182ce; }
</style>