<script>
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authStore, filterStore, loadCartGlobal } from '$lib/store.svelte.js';
	import { addToCart } from '$lib/services/cart.js';
	import { supabase } from '$lib/supabaseClient';
	import GameCard from '$lib/components/GameCard.svelte';
	import EditModal from '$lib/components/EditModal.svelte';

	/** @type {{ data: any }} */
	let { data } = $props();

	/** @type {any} */
	let editingProduct = $state(null);

	let sectionTitle = $derived(`Kategoria: ${data.categoryName || 'Nieznana'}`);

	let displayedGames = $derived(
		(data.products || []).filter((/** @type {any} */ game) => {
			const matchesSearch =
				!filterStore.searchQuery ||
				game.name?.toLowerCase().includes(filterStore.searchQuery.toLowerCase());

			const matchesPublisher =
				!filterStore.selectedPublisher || game.description === filterStore.selectedPublisher;

			const activePrice = game.promo_price > 0 ? game.promo_price : game.price;

			const matchesPrice =
				activePrice >= filterStore.minPrice && activePrice <= filterStore.maxPrice;

			return matchesSearch && matchesPublisher && matchesPrice;
		})
	);

	let sortedGames = $derived(
		[...displayedGames].sort((/** @type {any} */ a, /** @type {any} */ b) => {
			if (filterStore.sortBy === 'price-asc') {
				const priceA = a.promo_price > 0 ? a.promo_price : a.price;
				const priceB = b.promo_price > 0 ? b.promo_price : b.price;
				return priceA - priceB;
			}

			if (filterStore.sortBy === 'price-desc') {
				const priceA = a.promo_price > 0 ? a.promo_price : a.price;
				const priceB = b.promo_price > 0 ? b.promo_price : b.price;
				return priceB - priceA;
			}

			if (filterStore.sortBy === 'name-asc') {
				return a.name.localeCompare(b.name);
			}

			return 0;
		})
	);

	/** @param {any} gameToEdit */
	function handleEditProduct(gameToEdit) {
		editingProduct = gameToEdit;
	}

	/** @param {any} productToCopy */
	async function handleCloneProduct(productToCopy) {
		if (!confirm(`Czy skopiować produkt: ${productToCopy.name}?`)) return;

		const newProductData = {
			name: `${productToCopy.name} (KOPIA)`,
			description: productToCopy.description,
			price: productToCopy.price,
			promo_price: productToCopy.promo_price,
			image_url: productToCopy.image_url,
			category: productToCopy.category,
			stock_quantity: productToCopy.stock_quantity,
			is_new: productToCopy.is_new,
			is_used: productToCopy.is_used,
			lowest_price_30d: productToCopy.lowest_price_30d || productToCopy.price
		};

		const { error } = await supabase.from('products').insert([newProductData]);

		if (error) {
			alert('Błąd klonowania: ' + error.message);
			return;
		}

		alert('Pomyślnie sklonowano produkt.');
		await invalidateAll();
	}

	/** @param {any} product @param {number} qty */
	async function handleAddToCart(product, qty) {
		const result = await addToCart(
			product,
			authStore.currentUser?.id,
			authStore.isAdmin,
			[],
			qty
		);

		if (result?.error) {
			alert('Błąd dodawania do koszyka: ' + result.error.message);
			return;
		}

		if (result) {
			alert('Dodano do koszyka!');
			await loadCartGlobal();
		}
	}

	/** @param {any} product */
	async function handleToggleVisibility(product) {
        const newStatus = !product.is_hidden;
        const message = newStatus
            ? `Czy na pewno chcesz ukryć ten produkt przed klientami?`
            : `Czy na pewno chcesz przywrócić widoczność tego produktu?`;

        if (!confirm(message)) return;

        const { error } = await supabase
            .from('products')
            .update({ is_hidden: newStatus })
            .eq('id', product.id);

        if (error) {
            alert('Błąd zmiany widoczności: ' + error.message);
            return;
        }

        alert('Zapisano w bazie! Odświeżam stronę.');
        await invalidateAll();
    }

	/** @param {any} updatedFields */
	async function handleSaveEdit(updatedFields) {
		const updateData = {
			name: updatedFields.name,
			description: updatedFields.description,
			price: parseFloat(updatedFields.price),
			promo_price: parseFloat(updatedFields.promo_price) || 0,
			category: updatedFields.category,
			stock_quantity: parseInt(updatedFields.stock_quantity) || 0,
			is_new: updatedFields.is_new,
			is_used: updatedFields.is_used,
			lowest_price_30d: updatedFields.lowest_price_30d || updatedFields.price
		};

		if (updatedFields.image_file) {
			alert('Podmiana obrazu z poziomu strony kategorii nie jest jeszcze obsługiwana. Użyj panelu administratora.');
		}

		const { error } = await supabase.from('products').update(updateData).eq('id', updatedFields.id);

		if (error) {
			alert('Błąd edycji: ' + error.message);
			return;
		}

		editingProduct = null;
		await invalidateAll();
	}

	/** @param {number} id */
	async function handleDeleteProduct(id) {
		if (!confirm('Czy chcesz usunąć produkt z bazy?')) return;

		const { error } = await supabase.from('products').delete().eq('id', id);

		if (!error) {
			await invalidateAll();
		}
	}
</script>

{#if editingProduct}
	<EditModal
		product={editingProduct}
		categories={data.categories || []}
		onSave={handleSaveEdit}
		onCancel={() => (editingProduct = null)}
	/>
{/if}

<section class="catalog">
	<h2>{sectionTitle}</h2>
	<a class="back-link" href={resolve('/gry')}>Otwórz pełny katalog</a>

	<div class="grid">
		{#each sortedGames as p (p.id)}
			{#if !p.is_hidden || authStore.isAdmin}
                <GameCard
                    game={p}
                    onAddToCart={handleAddToCart}
                    onToggleVisibility={handleToggleVisibility}
                    onEdit={handleEditProduct}
                    onClone={handleCloneProduct}
                    onDelete={handleDeleteProduct}
                    showAdminControls={authStore.isAdmin}
                />
			{/if}
		{:else}
			<div class="empty-state">
				<p>Brak gier w tej kategorii.</p>
			</div>
		{/each}
	</div>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 20px;
	}

	.catalog {
		margin-top: 20px;
	}

	.catalog h2 {
		font-size: 2rem;
		border-bottom: 2px solid #3182ce;
		padding-bottom: 10px;
		margin-bottom: 12px;
	}

	.back-link {
		display: inline-flex;
		margin-bottom: 25px;
		color: #00ffcc;
		text-decoration: none;
		font-weight: 700;
	}

	.back-link:hover {
		color: #ffffff;
	}

	.empty-state {
		grid-column: 1 / -1;
		padding: 40px;
		text-align: center;
		background: #1a202c;
		border: 1px dashed #4a5568;
		border-radius: 8px;
		color: #a0aec0;
		font-size: 1.1rem;
	}
</style>