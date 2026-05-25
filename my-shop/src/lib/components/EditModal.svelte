<script>
	/**
	 * @typedef {Object} ModalProps
	 * @property {any} product
	 * @property {any[]} categories
	 * @property {(updatedProduct: any) => void} onSave
	 * @property {() => void} onCancel
	 */

	/** @type {ModalProps} */
	let { product, categories = [], onSave, onCancel } = $props();

	/** @type {any} */
	let localProduct = $derived({
		...product,
		category: product.category === null || product.category === undefined ? '' : String(product.category)
	});

	/** @type {File | null} */
	let editImageFile = $state(null);

	/** @type {HTMLInputElement | null} */
	let editImageFileInput = $state(null);

	/** @param {Event} event */
	function handleEditImageFileChange(event) {
		const input = /** @type {HTMLInputElement} */ (event.target);
		editImageFile = input.files?.[0] || null;
	}

	function handleSaveClick() {
		onSave({
			...localProduct,
			image_file: editImageFile
		});
	}
</script>

<div class="modal-backdrop">
	<div class="modal-content">
		<h2>✏️ Edytuj grę</h2>

		<label for="edit-name">Nazwa:</label>
		<input id="edit-name" type="text" bind:value={localProduct.name} />

		<label for="edit-desc">Opis / Producent:</label>
		<input id="edit-desc" type="text" bind:value={localProduct.description} />

		<div class="price-row">
			<div>
				<label for="edit-price">Cena podstawowa (zł):</label>
				<input id="edit-price" type="number" bind:value={localProduct.price} />
			</div>

			<div>
				<label for="edit-promo" style="color: #ff3366;">Cena Promo (zł):</label>
				<input id="edit-promo" type="number" bind:value={localProduct.promo_price} />
			</div>
		</div>

		<span class="field-label">Obraz produktu:</span>

		<div class="file-picker">
			<input
				bind:this={editImageFileInput}
				id="edit-image-file"
				class="file-input"
				type="file"
				accept="image/*"
				onchange={handleEditImageFileChange}
			/>

			<label for="edit-image-file" class="file-picker-button">
				📁 {editImageFile ? 'Zmień obraz' : 'Wybierz nowy obraz'}
			</label>

			<span class="file-picker-name">
				{editImageFile ? `(${editImageFile.name})` : '(aktualny obraz)'}
			</span>
		</div>

		<label for="edit-cat">Rodzaj gry:</label>
		<select id="edit-cat" bind:value={localProduct.category}>
			<option value="">Brak...</option>
			{#each categories as category (category.id)}
				<option value={String(category.id)}>{category.name}</option>
			{/each}
		</select>

		<label for="edit-stock">Ilość sztuk na magazynie:</label>
		<input id="edit-stock" type="number" bind:value={localProduct.stock_quantity} />

		<div class="checkbox-group">
			<label><input type="checkbox" bind:checked={localProduct.is_new} /> Nowość</label>
			<label><input type="checkbox" bind:checked={localProduct.is_used} /> Używana</label>
		</div>

		<div class="modal-actions">
			<button class="order-btn" onclick={handleSaveClick}>Zapisz zmiany</button>
			<button class="cancel-btn" onclick={onCancel}>Anuluj</button>
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: #1a202c;
		padding: 25px;
		border-radius: 12px;
		width: min(450px, calc(100vw - 32px));
		border: 1px solid #4a5568;
		display: flex;
		flex-direction: column;
		max-height: 90vh;
		overflow-y: auto;
		overflow-x: hidden;
		box-sizing: border-box;
	}

	.modal-content h2 {
		margin-top: 0;
		color: #e2e8f0;
		border-bottom: 1px solid #2d3748;
		padding-bottom: 10px;
	}

	.modal-content label {
		margin-top: 10px;
		font-size: 0.85rem;
		color: #a0aec0;
		display: block;
	}

	.modal-content input,
	.modal-content select {
		width: 100%;
		box-sizing: border-box;
		background: #2d3748;
		color: white;
		margin-bottom: 5px;
		padding: 8px;
		border-radius: 4px;
		border: 1px solid #4a5568;
	}

	.price-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.checkbox-group {
		display: flex;
		gap: 20px;
		align-items: center;
		width: 100%;
		padding: 15px 0;
		border-top: 1px solid #2d3748;
		margin-top: 10px;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		color: #a0aec0;
		font-weight: bold;
	}

	.modal-actions {
		display: flex;
		gap: 10px;
		margin-top: 20px;
		width: 100%;
	}

	.modal-actions button {
		min-width: 0;
	}

	.cancel-btn {
		background: #4a5568;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 12px 24px;
		cursor: pointer;
		font-weight: bold;
		flex: 1;
		transition: background-color 0.2s ease;
	}

	.cancel-btn:hover {
		background: #2d3748;
	}

	.order-btn {
		background: linear-gradient(135deg, #48bb78, #38a169);
		color: white;
		font-size: 1rem;
		font-weight: bold;
		border: none;
		border-radius: 8px;
		padding: 12px 24px;
		cursor: pointer;
		flex: 2;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.order-btn:hover {
		background: linear-gradient(135deg, #38a169, #2f855a);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(72, 187, 120, 0.3);
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
		margin-bottom: 5px;
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
		margin-top: 0;
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

	.field-label {
		display: block;
		margin-top: 12px;
		margin-bottom: 6px;
		color: #cbd5e0;
	}
</style>