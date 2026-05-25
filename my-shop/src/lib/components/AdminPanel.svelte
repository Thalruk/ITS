<script>
    /** @type {{ data: any, onAddProduct: Function }} */
    let { data, onAddProduct } = $props();

    let newName = $state('');
    let newDesc = $state('');
    let newPrice = $state('');
    let newStock = $state('');

    /** @type {File | null} */
    let newImageFile = $state(null);

    let newCat = $state('');

    /** @type {HTMLInputElement | null} */
    let imageFileInput = $state(null);
    
    // Nowe zmienne dla statusów gier
    let isNew = $state(false);
    let isUsed = $state(false);
    let promoPrice = $state('');

    /** @param {Event} event */
    function handleImageFileChange(event) {
        const input = /** @type {HTMLInputElement} */ (event.target);
        newImageFile = input.files?.[0] || null;
    }

    function handleSubmit() {
        onAddProduct({
            name: newName,
            description: newDesc,
            price: newPrice,
            stock_quantity: newStock,
            image_file: newImageFile,
            category: newCat,
            is_new: isNew,
            is_used: isUsed,
            promo_price: promoPrice ? parseFloat(promoPrice) : 0
        }, () => {
            newName = '';
            newDesc = '';
            newPrice = '';
            newStock = '';
            newImageFile = null;
            newCat = '';
            isNew = false; 
            isUsed = false; 
            promoPrice = '';

            if (imageFileInput) {
                imageFileInput.value = '';
            }
        });
    }
</script>

<section class="admin-dashboard">
    <h2 class="section-title">🎮 Dodawanie produktu</h2>
    <div class="add-form">
        <input type="text" bind:value={newName} placeholder="Nazwa gry" />
        <input type="text" bind:value={newDesc} placeholder="Opis / Producent" />
        
        <input type="number" bind:value={newPrice} placeholder="Cena podstawowa (zł)" min="0" step="1.0" />
        <input type="number" bind:value={promoPrice} placeholder="Cena w promocji" min="0" step="1.0" class="promo-input" />
        <input type="number" bind:value={newStock} placeholder="Ilość sztuk (magazyn)" min="0" step="1" />
        
    <div class="file-picker">
        <input
            bind:this={imageFileInput}
            id="product-image-file"
            class="file-input"
            type="file"
            accept="image/*"
            onchange={handleImageFileChange}
        />

        <label for="product-image-file" class="file-picker-button">
            📁 {newImageFile ? 'Zmień obraz' : 'Wybierz obraz'}
        </label>

        <span class="file-picker-name">
            {newImageFile ? `(${newImageFile.name})` : '(Brak wybranego pliku)'}
        </span>
    </div>
        <select bind:value={newCat}>
            <option value="">Gatunek...</option>
            {#each data.categories || [] as category (category.id)}
                <option value={String(category.id)}>{category.name}</option>
            {/each}
        </select>

        <div class="checkbox-group">
            <label><input type="checkbox" bind:checked={isNew} /> Oznacz jako Nowość</label>
            <label><input type="checkbox" bind:checked={isUsed} /> Oznacz jako Używana</label>
        </div>

        <button class="order-btn" onclick={handleSubmit}>Dodaj grę</button>
    </div>
</section>

<section class="admin-dashboard">
    <h2 class="section-title">📥 Powiadomienia Admina</h2>
    <div class="admin-grid">
        <div class="tasks">
            <h3>Lista zadań</h3>
            {#each data.adminTasks || [] as task (task.id)}
                <div class="task-card">{task.status === 'zakończone' ? '✅' : '⏳'} {task.title}</div>
            {:else}
                <p>Brak zadań.</p>
            {/each}
        </div>
        <div class="inquiries">
            <h3>Zapytania o produkty</h3>
            {#each data.inquiries || [] as inq (inq.id)}
                <div class="inquiry-card">
                    <strong>{inq.products?.name}</strong>: {inq.message} <br/>
                    <small>Od: {inq.email}</small>
                </div>
            {:else}
                <p>Brak zapytań.</p>
            {/each}
        </div>
    </div>
</section>

<style>
    .admin-dashboard { background: #1a202c; padding: 20px; border-radius: 12px; margin-bottom: 40px; border: 1px solid #2d3748; }
    .add-form { display: flex; gap: 10px; flex-wrap: wrap; }
    .add-form input, .add-form select { padding: 8px; border-radius: 4px; border: 1px solid #4a5568; background-color: #2d3748; color: white; flex-grow: 1; min-width: 200px; }
    .promo-input { border-color: #ff3366 !important; }
    .checkbox-group { display: flex; gap: 20px; align-items: center; width: 100%; padding: 10px 0; }
    .checkbox-group label { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #a0aec0; }
    .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .task-card, .inquiry-card { background: #2d3748; padding: 10px; margin-bottom: 10px; border-radius: 5px; font-size: 0.9rem; border: 1px solid #4a5568; }
    .order-btn { background: linear-gradient(135deg, #48bb78, #38a169); color: white; font-size: 1rem; font-weight: bold; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; box-shadow: 0 4px 6px rgba(72, 187, 120, 0.25); transition: all 0.2s ease-in-out; width: 100%; margin-top: 10px; }
    .order-btn:hover { background: linear-gradient(135deg, #38a169, #2f855a); transform: translateY(-2px); }
    .section-title {
    margin: 0 0 16px 0;
    }

    .file-picker {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #2d3748;
    border: 1px solid #4a5568;
    border-radius: 8px;
    padding: 0.75rem;
    color: #cbd5e0;
    }

    .file-input {
        display: none;
    }

    .file-picker-button {
        background: #4a5568;
        color: #ffffff;
        border-radius: 6px;
        padding: 8px 14px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.2s ease;
    }

    .file-picker-button:hover {
        background: #5a6678;
    }

    .file-picker-name {
        color: #a0aec0;
        font-size: 0.95rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

</style>