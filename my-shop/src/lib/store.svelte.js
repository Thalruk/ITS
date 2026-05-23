import { supabase } from '$lib/supabaseClient';

// Globalny stan aplikacji używający Runów Svelte 5
export const authStore = $state({
    /** @type {any} */
    currentUser: null,
    isAdmin: false
});

export const cartStore = $state({
    /** @type {any[]} */
    items: []
});

// Zcentralizowana funkcja do ładowania koszyka klienta
export async function loadCartGlobal() {
    if (!authStore.currentUser) return;
    
    const { data: c, error } = await supabase
        .from('cart_items')
        .select('id, quantity, product_id, products(*, categories(name))')
        .eq('user_id', authStore.currentUser.id)
        .order('id', { ascending: true });
        
    if (!error) {
        cartStore.items = c || [];
    }
}
