<script>
    import { supabase } from '$lib/supabaseClient';
    import { page } from '$app/stores'; 
    import { authStore, loadCartGlobal } from '$lib/store.svelte.js';
    import GameCard from '$lib/components/GameCard.svelte';

    /** @type {{ data: any }} */
    let { data } = $props();

    // --- LOGIKA FILTROWANIA PO ADRESIE URL ---
    let currentFilter = $derived($page.url.searchParams.get('filter'));

    let displayedGames = $derived((data.products || []).filter((/** @type {any} */ p) => {
        if (currentFilter === 'nowosci') return p.is_new === true;
        if (currentFilter === 'promocje') return p.promo_price > 0 && p.promo_price < p.price;
        if (currentFilter === 'uzywane') return p.is_used === true;
        return true; 
    }));

    let sectionTitle = $derived(
        currentFilter === 'nowosci' ? '🔥 Nowości Wydawnicze' :
        currentFilter === 'promocje' ? '⚡ Wyjątkowe Promocje' :
        currentFilter === 'uzywane' ? '💿 Gry Używane' :
        '🕹️ Pełny Katalog Gier'
    );

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

</script>

<section class="catalog">
    <h2>{sectionTitle}</h2>
    
    <div class="grid">
        {#each displayedGames as p (p.id)}
            {#if !p.is_hidden}
                <GameCard 
                    game={p} 
                    onAddToCart={handleAddToCart} 
                />
            {/if}
        {:else}
            <div class="empty-state">
                <p>Niestety, nie mamy w tej chwili gier pasujących do tego kryterium. Sprawdź ponownie za jakiś czas!</p>
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