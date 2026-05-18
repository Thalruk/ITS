import { supabase } from '$lib/supabaseClient';

/**
 * Pobiera historię zamówień zalogowanego użytkownika.
 * @param {any} userId
 */
export async function loadOrders(userId) {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, status, order_items(id, product_id, quantity, price_at_time, products(name))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Błąd pobierania historii:', error.message);
        return [];
    }
    return orders || [];
}

/**
 * Obsługuje zwrot zamówienia i aktualizację magazynu.
 * @param {any} order
 */
export async function returnOrder(order) {
    if (!confirm(`Czy na pewno chcesz zwrócić zamówienie?`)) return false;

    const { error: statusError } = await supabase
        .from('orders')
        .update({ status: 'returned' })
        .eq('id', order.id);

    if (statusError) {
        alert("Błąd statusu: " + statusError.message);
        return false;
    }

    /** @type {any} */
    for (const item of order.order_items) {
        if (!item.product_id) continue;

        const { data: prod } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

        if (prod) {
            await supabase
                .from('products')
                .update({ stock_quantity: prod.stock_quantity + item.quantity })
                .eq('id', item.product_id);
        }
    }

    alert('Zamówienie zwrócone poprawnie!');
    return true;
}

/**
 * Główna funkcja składania zamówienia.
 * @param {{userId: any, cart: any[], finalTotal: number, deliveryId: any, paymentId: any}} params
 */
export async function placeOrder({ userId, cart, finalTotal, deliveryId, paymentId }) {
    if (!deliveryId) return alert('Wybierz metodę dostawy!');
    if (!paymentId) return alert('Wybierz metodę płatności!');
    
    const productIds = cart.map((/** @type {any} */ item) => item.product_id);
    const { data: liveProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .in('id', productIds);

    if (fetchError || !liveProducts) {
      alert('Błąd połączenia z serwerem.');
      return false;
    }

    /** @type {any} */
    for (const item of cart) {
      const liveProd = liveProducts.find((/** @type {any} */ p) => p.id === item.product_id);
      if (!liveProd || liveProd.stock_quantity === 0) {
        alert(`Niestety, gra "${item.products.name}" została wyprzedana!`);
        return { action: 'refresh_cart' };
      }

      if (liveProd.stock_quantity < item.quantity) {
        alert(`Niestety, zostało tylko ${liveProd.stock_quantity} sztuk gry "${item.products.name}"!`);
        return { action: 'refresh_cart' };
      }
    }

    const { data: order, error: oErr } = await supabase.from('orders').insert({
      user_id: userId, 
      total_amount: finalTotal, 
      delivery_method_id: deliveryId, 
      payment_method_id: paymentId,
      status: 'paid'
    }).select().single();

    if (oErr) {
        alert("Błąd zamówienia: " + oErr.message);
        return false;
    }

    const orderItems = cart.map((/** @type {any} */ item) => ({
      order_id: order.id, 
      product_id: item.product_id, 
      quantity: item.quantity, 
      price_at_time: item.products.price
    }));
    await supabase.from('order_items').insert(orderItems);

    /** @type {any} */
    for (const item of cart) {
      const liveProd = liveProducts.find((/** @type {any} */ p) => p.id === item.product_id);
      if (liveProd) {
        await supabase
          .from('products')
          .update({ stock_quantity: liveProd.stock_quantity - item.quantity })
          .eq('id', item.product_id);
      }
    }

    await supabase.from('cart_items').delete().eq('user_id', userId);

    alert('Dziękujemy! Zamówienie zostało złożone.');
    return true;
}