<script>
	import { supabase } from '$lib/supabaseClient';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores'; 
	import { authStore, loadCartGlobal, filterStore } from '$lib/store.svelte.js';
	import GameCard from '$lib/components/GameCard.svelte';
	import AdminPanel from '$lib/components/AdminPanel.svelte';
	import EditModal from '$lib/components/EditModal.svelte';

	/** @type {{ data: any }} */
	let { data } = $props();

	/** @type {any} */
	let editingProduct = $state(null);

	// --- LOGIKA FILTROWANIA PO ADRESIE URL ---
	let currentFilter = $derived($page.url.searchParams.get('filter'));

	// --- ZAAWANSOWANE FILTROWANIE I SORTOWANIE ---
	let displayedGames = $derived(
		(data.products || [])
			.filter((/** @type {any} */ p) => {
				
				if (currentFilter === 'nowosci' && p.is_new !== true) return false;
				if (currentFilter === 'promocje' && !(p.promo_price > 0 && p.promo_price < p.price)) return false;
				if (currentFilter === 'uzywane' && p.is_used !== true) return false;

				
				if (filterStore.searchQuery && !p.name.toLowerCase().includes(filterStore.searchQuery.toLowerCase())) {
					return false;
				}

				
				if (filterStore.selectedPublisher && p.description !== filterStore.selectedPublisher) {
					return false;
				}

				
				const effectivePrice = (p.promo_price > 0 && p.promo_price < p.price) ? p.promo_price : p.price;
				if (effectivePrice < filterStore.minPrice || effectivePrice > filterStore.maxPrice) {
					return false;
				}

				return true; 
			})
			.sort((a, b) => {
				
				const priceA = (a.promo_price > 0 && a.promo_price < a.price) ? a.promo_price : a.price;
				const priceB = (b.promo_price > 0 && b.promo_price < b.price) ? b.promo_price : b.price;

				if (filterStore.sortBy === 'price-asc') return priceA - priceB;
				if (filterStore.sortBy === 'price-desc') return priceB - priceA;
				if (filterStore.sortBy === 'name-asc') return a.name.localeCompare(b.name);
				
				return 0; // Sortowanie domyślne (kolejność z bazy danych)
			})
	);

	let sectionTitle = $derived(
		currentFilter === 'nowosci' ? '🔥 Nowości Wydawnicze' :
		currentFilter === 'promocje' ? '⚡ Wyjątkowe Promocje' :
		currentFilter === 'uzywane' ? '💿 Gry Używane' :
		'🕹️ Pełny Katalog Gier'
	);

	/** @param {any} gameToEdit */
	function handleEditProduct(gameToEdit) {
		editingProduct = gameToEdit;
	}

	// --- LOGIKA KLONOWANIA PRODUKTU ---
	/** @param {any} productToCopy */
	async function handleCloneProduct(productToCopy) {
		if (!confirm(`Czy skopiować produkt: ${productToCopy.name}?`)) return;

		const newProductData = {
			name: productToCopy.name + ' (KOPIA)',
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
		} else {
			alert('Pomyślnie sklonowano produkt z uwzględnieniem najniższej ceny!');
			invalidateAll(); 
		}
	}

	// --- LOGIKA DODAWANIA DO KOSZYKA ---
	/** @param {any} product * @param {number} qty */
	async function handleAddToCart(product, qty) {
		if (!authStore.currentUser) return alert('Musisz być zalogowany jako klient, aby dokonać zakupu!');
		if (authStore.isAdmin) return alert('Admin nie robi zakupów!');
		if (qty > product.stock_quantity) return alert(`Błąd: Mamy tylko ${product.stock_quantity} sztuk w magazynie!`);

		let existingItem = data.cart?.find((/** @type {any} */ c) => c.product_id === product.id);

		if (existingItem) {
			let newTotalQty = existingItem.quantity + qty;
			if (newTotalQty > product.stock_quantity) return alert('Brak wystarczającej ilości w magazynie.');
			const { error } = await supabase.from('cart_items').update({ quantity: newTotalQty }).eq('id', existingItem.id);
			if (!error) { alert('Zaktualizowano ilość!'); loadCartGlobal(); }
		} else {
			const { error } = await supabase.from('cart_items').insert({ 
				user_id: authStore.currentUser.id, product_id: product.id, quantity: qty 
			});
			if (!error) { alert('Dodano do koszyka!'); loadCartGlobal(); }
		}
	}

	/** @param {any} product */
	async function handleToggleVisibility(product) {
		const newStatus = !product.is_hidden;
		const { error } = await supabase.from('products').update({ is_hidden: newStatus }).eq('id', product.id);
		if (!error) invalidateAll();
	}

	/** @param {any} updatedFields */
	async function handleSaveEdit(updatedFields) {
		const { error } = await supabase.from('products').update({
			name: updatedFields.name,
			description: updatedFields.description,
			price: parseFloat(updatedFields.price),
			promo_price: parseFloat(updatedFields.promo_price) || 0,
			image_url: updatedFields.image_url,
			category: updatedFields.category,
			stock_quantity: parseInt(updatedFields.stock_quantity) || 0,
			is_new: updatedFields.is_new,
			is_used: updatedFields.is_used,
			lowest_price_30d: updatedFields.lowest_price_30d || updatedFields.price
		}).eq('id', updatedFields.id);

		if (!error) { editingProduct = null; invalidateAll(); }
	}

	/** @param {number} id */
	async function handleDeleteProduct(id) {
		if (!confirm('Czy chcesz usunąć produkt z bazy?')) return;
		const { error } = await supabase.from('products').delete().eq('id', id);
		if (!error) invalidateAll();
	}

	/** @param {any} formFields * @param {Function} callback */
	async function handleAddProduct(formFields, callback) {
		const price = parseFloat(formFields.price);
		const stock = parseInt(formFields.stock_quantity) || 0;
		if (price < 0 || stock < 0) return alert('Wartości nie mogą być ujemne!');

		const { error } = await supabase.from('products').insert([{
			name: formFields.name,
			description: formFields.description,
			price,
			stock_quantity: stock,
			image_url: formFields.image_url || 'https://via.placeholder.com/150',
			category: formFields.category,
			is_new: formFields.is_new,
			is_used: formFields.is_used,
			promo_price: formFields.promo_price || 0,
			lowest_price_30d: price
		}]);

		if (!error) { callback(); invalidateAll(); } else { alert(error.message); }
	}
</script>

{#if editingProduct}
	<EditModal product={editingProduct} onSave={handleSaveEdit} onCancel={() => editingProduct = null} />
{/if}

{#if authStore.isAdmin}
	<AdminPanel {data} onAddProduct={handleAddProduct} />
{/if}

<section class="catalog">
	<h2>{sectionTitle}</h2>
	
	<div class="grid">
		{#each displayedGames as p (p.id)}
			{#if !p.is_hidden || authStore.isAdmin}
				<GameCard 
					game={p} 
					onAddToCart={handleAddToCart} 
					onToggleVisibility={handleToggleVisibility} 
					onEdit={handleEditProduct} 
					onClone={handleCloneProduct}
					onDelete={handleDeleteProduct} 
				/>
			{/if}
		{:else}
			<div class="empty-state">
				<p>Niestety, nie mamy w tej chwili gier pasujących do wybranych kryteriów wyszukiwania i filtrów. Spróbuj zmienić parametry na pasku u góry!</p>
			</div>
		{/each}
	</div>
</section>

<style>
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
	.catalog { margin-top: 20px; }
	.catalog h2 { font-size: 2rem; border-bottom: 2px solid #3182ce; padding-bottom: 10px; margin-bottom: 25px; }
	.empty-state { grid-column: 1 / -1; padding: 40px; text-align: center; background: #1a202c; border: 1px dashed #4a5568; border-radius: 8px; color: #a0aec0; font-size: 1.1rem; }
</style>