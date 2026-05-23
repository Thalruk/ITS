<script>
    import { supabase } from '$lib/supabaseClient';
    import { invalidateAll } from '$app/navigation';
    import { authStore, loadCartGlobal } from '$lib/store.svelte.js';
    import GameCard from '$lib/components/GameCard.svelte';
    import AdminPanel from '$lib/components/AdminPanel.svelte';
    import EditModal from '$lib/components/EditModal.svelte';

    /** @type {{ data: any }} */
    let { data } = $props();

    /** @type {any} */
    let editingProduct = $state(null);

    let displayedGames = $derived(data.products || []);
    let sectionTitle = $derived(`Kategoria: ${data.categoryName || 'Nieznana'}`);

    /** @param {any} gameToEdit */
    function handleEditProduct(gameToEdit) {
        editingProduct = gameToEdit;
    }

    /** @param {any} productToCopy */
    async function handleCloneProduct(productToCopy) {
        if (!confirm(`Czy skopiowac produkt: ${productToCopy.name}?`)) return;

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
            alert('Blad klonowania: ' + error.message);
        } else {
            alert('Pomyslnie sklonowano produkt.');
            invalidateAll();
        }
    }

    /** @param {any} product @param {number} qty */
    async function handleAddToCart(product, qty) {
        if (!authStore.currentUser) return alert('Musisz byc zalogowany jako klient, aby dokonac zakupu!');
        if (authStore.isAdmin) return alert('Admin nie robi zakupow!');
        if (qty > product.stock_quantity) return alert(`Blad: Mamy tylko ${product.stock_quantity} sztuk w magazynie!`);

        let existingItem = data.cart?.find((/** @type {any} */ c) => c.product_id === product.id);

        if (existingItem) {
            let newTotalQty = existingItem.quantity + qty;
            if (newTotalQty > product.stock_quantity) return alert('Brak wystarczajacej ilosci w magazynie.');
            const { error } = await supabase.from('cart_items').update({ quantity: newTotalQty }).eq('id', existingItem.id);
            if (!error) { alert('Zaktualizowano ilosc!'); loadCartGlobal(); }
        } else {
            const { error } = await supabase.from('cart_items').insert({
                user_id: authStore.currentUser.id,
                product_id: product.id,
                quantity: qty
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
        if (!confirm('Czy chcesz usunac produkt z bazy?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) invalidateAll();
    }

    /** @param {any} formFields @param {Function} callback */
    async function handleAddProduct(formFields, callback) {
        const price = parseFloat(formFields.price);
        const stock = parseInt(formFields.stock_quantity) || 0;
        if (price < 0 || stock < 0) return alert('Wartosci nie moga byc ujemne!');

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
    <EditModal product={editingProduct} categories={data.categories || []} onSave={handleSaveEdit} onCancel={() => editingProduct = null} />
{/if}

{#if authStore.isAdmin}
    <AdminPanel {data} onAddProduct={handleAddProduct} />
{/if}

<section class="catalog">
    <h2>{sectionTitle}</h2>
    <a class="back-link" href="/gry">Wroc do katalogu</a>

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
                <p>Brak gier w tej kategorii.</p>
            </div>
        {/each}
    </div>
</section>

<style>
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
    .catalog { margin-top: 20px; }
    .catalog h2 { font-size: 2rem; border-bottom: 2px solid #3182ce; padding-bottom: 10px; margin-bottom: 12px; }
    .back-link { display: inline-flex; margin-bottom: 25px; color: #00ffcc; text-decoration: none; font-weight: 700; }
    .back-link:hover { color: #ffffff; }
    .empty-state { grid-column: 1 / -1; padding: 40px; text-align: center; background: #1a202c; border: 1px dashed #4a5568; border-radius: 8px; color: #a0aec0; font-size: 1.1rem; }
</style>
