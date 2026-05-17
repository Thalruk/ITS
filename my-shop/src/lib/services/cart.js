import { supabase } from '$lib/supabaseClient';

/**
 * Pobiera zawartość koszyka dla danego użytkownika.
 * @param {any} userId - ID zalogowanego użytkownika
 */
export async function loadCart(userId) {
    const { data: c } = await supabase
      .from('cart_items')
      .select('id, quantity, product_id, products(*)')
      .eq('user_id', userId)
      .order('id', { ascending: true });
      
    return c || [];
}

/**
 * Dodaje produkt do koszyka z uwzględnieniem stanów magazynowych.
 * @param {any} product - Obiekt produktu
 * @param {any} userId - ID użytkownika
 * @param {any} isAdmin - Czy użytkownik jest adminem
 * @param {any[]} cart - Aktualna zawartość koszyka (tablica)
 * @param {any} requestedQty - Żądana ilość (domyślnie 1)
 */
export async function addToCart(product, userId, isAdmin, cart, requestedQty = 1) {
    if (!userId) return alert('Musisz być zalogowany jako klient, aby dokonać zakupu!');
    if (isAdmin) return alert('Admin nie robi zakupów!');

    if (requestedQty < 1) requestedQty = 1;

    if (requestedQty > product.stock_quantity) {
      return alert(`Błąd: Mamy tylko ${product.stock_quantity} sztuk w magazynie!`);
    }

    let existingItem = cart.find(c => c.product_id === product.id);
    
    if (existingItem) {
      let newTotalQty = existingItem.quantity + requestedQty;
      if (newTotalQty > product.stock_quantity) {
        return alert(`Nie możesz dodać więcej! Masz już w koszyku ${existingItem.quantity} szt.`);
      }
      return await supabase.from('cart_items').update({ quantity: newTotalQty }).eq('id', existingItem.id);
    } else {
      return await supabase.from('cart_items').insert({ 
        user_id: userId, 
        product_id: product.id, 
        quantity: requestedQty 
      });
    }
}

/**
 * Zmienia ilość produktu o daną wartość (delta).
 * @param {any} item - Element koszyka
 * @param {any} delta - Wartość zmiany (np. +1 lub -1)
 */
export async function updateCartQuantity(item, delta) {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    
    if (newQty > item.products.stock_quantity) {
      alert(`Maksymalna dostępna ilość to ${item.products.stock_quantity} szt.`);
      return null;
    }

    return await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', item.id);
}

/**
 * Usuwa pojedynczy element z koszyka.
 * @param {any} cartItemId - ID elementu w tabeli cart_items
 */
export async function removeFromCart(cartItemId) {
    return await supabase.from('cart_items').delete().eq('id', cartItemId);
}

/**
 * Czyści cały koszyk użytkownika.
 * @param {any} userId - ID użytkownika
 */
export async function clearCart(userId) {
    if (!confirm('Czy na pewno chcesz usunąć wszystkie produkty z koszyka?')) return null;
    return await supabase.from('cart_items').delete().eq('user_id', userId);
}