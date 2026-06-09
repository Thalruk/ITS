<script>
	import { page } from '$app/stores';
	import { authStore, filterStore, loadCartGlobal } from '$lib/store.svelte.js';
	import GameCard from '$lib/components/GameCard.svelte';
	import EditModal from '$lib/components/EditModal.svelte';
	import { addToCart } from '$lib/services/cart.js';
	import { saveEdit, deleteProduct, toggleVisibility, cloneProduct } from '$lib/services/admin.js';

	/** @type {{ data: any }} */
	let { data } = $props();

	/** @type {any} */
	let editingProduct = $state(null);

	/* Zagadka 9 */
	const riddle9SearchCode = 'ReTrO';
	const riddle9ProductName = 'Super Mario Bros. (1985)';

	let currentFilter = $derived($page.url.searchParams.get('filter'));

	let displayedGames = $derived(
		(data.products || [])
			.filter((/** @type {any} */ p) => {
				if (currentFilter === 'nowosci' && p.is_new !== true) return false;
				if (currentFilter === 'promocje' && !(p.promo_price > 0 && p.promo_price < p.price)) return false;
				if (currentFilter === 'uzywane' && p.is_used !== true) return false;

				const rawSearchQuery = filterStore.searchQuery.trim();
				const searchQuery = rawSearchQuery.toLowerCase();

				/* Zagadka 9 */
				const isRiddle9Product = p.name === riddle9ProductName;
				const isRiddle9Search = rawSearchQuery === riddle9SearchCode;

				if (searchQuery && !p.name.toLowerCase().includes(searchQuery) && !(isRiddle9Search && isRiddle9Product)) {
					return false;
				}

				if (filterStore.selectedPublisher && p.description !== filterStore.selectedPublisher) {
					return false;
				}

				const effectivePrice = p.promo_price > 0 && p.promo_price < p.price ? p.promo_price : p.price;

				if (effectivePrice < filterStore.minPrice || effectivePrice > filterStore.maxPrice) {
					return false;
				}

				return true;
			})
			.sort((/** @type {any} */ a, /** @type {any} */ b) => {
				const priceA = a.promo_price > 0 && a.promo_price < a.price ? a.promo_price : a.price;
				const priceB = b.promo_price > 0 && b.promo_price < b.price ? b.promo_price : b.price;

				if (filterStore.sortBy === 'price-asc') return priceA - priceB;
				if (filterStore.sortBy === 'price-desc') return priceB - priceA;
				if (filterStore.sortBy === 'name-asc') return a.name.localeCompare(b.name);

				return 0;
			})
	);

	let sectionTitle = $derived(
		currentFilter === 'nowosci'
			? '🔥 Nowości Wydawnicze'
			: currentFilter === 'promocje'
				? '⚡ Wyjątkowe Promocje'
				: currentFilter === 'uzywane'
					? '💿 Gry Używane'
					: '🕹️ Pełny Katalog Gier'
	);

	/** @param {any} product */
	function handleEditProduct(product) {
		editingProduct = product;
	}

	/** @param {any} product */
	async function handleSaveEdit(product) {
		const success = await saveEdit(product);

		if (success) {
			editingProduct = null;
		}
	}

	/** @param {any} product */
	async function handleToggleVisibility(product) {
		await toggleVisibility(product);
	}

	/** @param {any} productId */
	async function handleDeleteProduct(productId) {
		await deleteProduct(productId);
	}

	/** @param {any} product */
	async function handleCloneProduct(product) {
		await cloneProduct(product);
	}

	/** @param {any} product @param {number} qty */
	async function handleAddToCart(product, qty) {
		const result = await addToCart(
			product,
			authStore.currentUser?.id,
			authStore.isAdmin,
			data.cart || [],
			qty
		);

		if (result?.error) {
			alert('Błąd dodawania do koszyka: ' + result.error.message);
			return;
		}

		if (result) {
			alert('Dodano do koszyka!');
			loadCartGlobal();
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

	<div class="grid">
		{#each displayedGames as p (p.id)}
			{#if !p.is_hidden || authStore.isAdmin || (filterStore.searchQuery.trim() === riddle9SearchCode && p.name === riddle9ProductName)}
				<GameCard
					game={p}
					onAddToCart={handleAddToCart}
					onToggleVisibility={handleToggleVisibility}
					onEdit={handleEditProduct}
					onDelete={handleDeleteProduct}
					showAdminControls={authStore.isAdmin}
					onClone={handleCloneProduct}
				/>
			{/if}
		{:else}
			<div class="empty-state">
				<p>
					Niestety, nie mamy w tej chwili gier pasujących do wybranych kryteriów wyszukiwania i
					filtrów. Spróbuj zmienić parametry na pasku u góry!
				</p>
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
		margin-bottom: 25px;
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