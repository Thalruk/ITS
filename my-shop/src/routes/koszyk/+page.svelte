<script>
  import { supabase } from '$lib/supabaseClient';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import './koszyk.css';

  let { data } = $props();

  /** @type {any} */
  let currentUser = $state(null);
  let authChecked = $state(false);
  let isAdmin = $derived(currentUser?.email === 'admin@sklep.pl');

  /** @type {any[]} */
  let cart = $state([]);
  let selectedDeliveryId = $state('');
  let selectedPaymentId = $state('');

  let itemsTotal = $derived(cart.reduce((acc, item) => acc + item.products.price * item.quantity, 0));
  let deliveryPrice = $derived(data.deliveryMethods.find((d) => d.id == selectedDeliveryId)?.price || 0);
  let finalTotal = $derived(itemsTotal + deliveryPrice);

  onMount(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      currentUser = session?.user || null;
      authChecked = true;
      if (currentUser && !isAdmin) loadCart();
    });

    const subscription = supabase
      .channel('koszyk-products-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        if (currentUser && !isAdmin) loadCart();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  });

  async function loadCart() {
    const { data: c } = await supabase
      .from('cart_items')
      .select('id, quantity, product_id, products(*)')
      .eq('user_id', currentUser.id)
      .order('id', { ascending: true });

    cart = c || [];
  }

  /** @param {number} cartItemId */
  async function removeFromCart(cartItemId) {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
    if (error) alert(error.message);
    else loadCart();
  }

  async function clearCart() {
    if (!confirm('Czy na pewno chcesz usunąć wszystkie produkty z koszyka?')) return;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', currentUser.id);
    if (error) alert('Błąd: ' + error.message);
    else loadCart();
  }

  /** @param {any} item @param {number} delta */
  async function updateCartQuantity(item, delta) {
    const newQty = item.quantity + delta;

    if (newQty < 1) return;

    if (newQty > item.products.stock_quantity) {
      return alert(`Maksymalna dostępna ilość to ${item.products.stock_quantity} szt.`);
    }

    const { error } = await supabase.from('cart_items').update({ quantity: newQty }).eq('id', item.id);

    if (error) alert('Błąd: ' + error.message);
    else loadCart();
  }

  async function placeOrder() {
    if (!selectedDeliveryId) return alert('Wybierz metodę dostawy!');
    if (!selectedPaymentId) return alert('Wybierz metodę płatności!');

    const productIds = cart.map((item) => item.product_id);
    const { data: liveProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .in('id', productIds);

    if (fetchError || !liveProducts) {
      return alert('Błąd połączenia z serwerem. Nie można zweryfikować stanu magazynu.');
    }

    for (const item of cart) {
      const liveProd = liveProducts.find((p) => p.id === item.product_id);

      if (!liveProd || liveProd.stock_quantity === 0) {
        await supabase.from('cart_items').delete().eq('id', item.id);
        alert(`Niestety, gra "${item.products.name}" została wyprzedana! Usunęliśmy ją z Twojego koszyka.`);
        loadCart();
        invalidateAll();
        return;
      }

      if (liveProd.stock_quantity < item.quantity) {
        await supabase.from('cart_items').update({ quantity: liveProd.stock_quantity }).eq('id', item.id);
        alert(
          `Niestety, ktoś ubiegł Cię z zakupem i zostało tylko ${liveProd.stock_quantity} szt. gry "${item.products.name}"! Zaktualizowaliśmy Twój koszyk.`
        );
        loadCart();
        invalidateAll();
        return;
      }
    }

    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert({
        user_id: currentUser.id,
        total_amount: finalTotal,
        delivery_method_id: selectedDeliveryId,
        payment_method_id: selectedPaymentId,
        status: 'paid'
      })
      .select()
      .single();

    if (oErr) return alert('Błąd zamówienia: ' + oErr.message);

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.products.price
    }));

    await supabase.from('order_items').insert(orderItems);

    for (const item of cart) {
      const liveProd = liveProducts.find((p) => p.id === item.product_id);

      if (liveProd) {
        await supabase
          .from('products')
          .update({ stock_quantity: liveProd.stock_quantity - item.quantity })
          .eq('id', item.product_id);
      }
    }

    await supabase.from('cart_items').delete().eq('user_id', currentUser.id);

    alert('Dziękujemy! Zamówienie zostało złożone.');
    selectedDeliveryId = '';
    selectedPaymentId = '';
    loadCart();
    invalidateAll();
  }
</script>

<header class="cart-page-header">
  <h1>Twój Koszyk</h1>
  <a class="back-link" href="/">Wróć do katalogu</a>
</header>

<main class="cart-page-main">
  {#if !authChecked}
    <section class="checkout-section">
      <p>Ładowanie koszyka...</p>
    </section>
  {:else if !currentUser}
    <section class="checkout-section">
      <p>Musisz być zalogowany jako klient, aby zobaczyć koszyk.</p>
      <a class="back-link inline" href="/">Przejdź do katalogu</a>
    </section>
  {:else if isAdmin}
    <section class="checkout-section">
      <p>Admin nie korzysta z koszyka.</p>
      <a class="back-link inline" href="/">Przejdź do katalogu</a>
    </section>
  {:else}
    <section class="checkout-section">
      <div class="cart-header">
        <h2>Produkty w koszyku</h2>
        {#if cart.length > 0}
          <button class="clear-cart-btn" onclick={clearCart}>Wyczyść koszyk</button>
        {/if}
      </div>

      <div class="cart-list">
        {#each cart as item (item.id)}
          <div class="cart-item">
            <div class="cart-item-info">
              <div class="cart-product-title">
                {#if item.products.image_url}
                  <img class="cart-product-image" src={item.products.image_url} alt={item.products.name} />
                {/if}
                <span class="cart-item-name">{item.products.name}</span>
              </div>

              <div class="qty-controls">
                <button class="qty-btn" onclick={() => updateCartQuantity(item, -1)} disabled={item.quantity <= 1}>-</button>
                <span class="cart-item-qty">{item.quantity}</span>
                <button class="qty-btn" onclick={() => updateCartQuantity(item, 1)} disabled={item.quantity >= item.products.stock_quantity}>+</button>
              </div>

              <span class="cart-item-price">{(item.products.price * item.quantity).toFixed(2)} zł</span>
            </div>
            <button class="remove-btn" onclick={() => removeFromCart(item.id)}>Usuń</button>
          </div>
        {:else}
          <p>Koszyk jest pusty.</p>
        {/each}
      </div>

      {#if cart.length > 0}
        <div class="checkout-controls">
          <div class="delivery-picker">
            <label for="delivery">Dostawa:</label>
            <select id="delivery" bind:value={selectedDeliveryId}>
              <option value="">-- wybierz --</option>
              {#each data.deliveryMethods as dm (dm.id)}
                <option value={dm.id}>{dm.name} (+{dm.price} zł)</option>
              {/each}
            </select>
          </div>

          <div class="payment-picker">
            <label for="payment">Metoda płatności:</label>
            <select id="payment" bind:value={selectedPaymentId}>
              <option value="">-- wybierz --</option>
              {#each data.paymentMethods as pm (pm.id)}
                <option value={pm.id}>{pm.name}</option>
              {/each}
            </select>
          </div>

          <div class="summary">
            <p>Produkty: {itemsTotal.toFixed(2)} zł</p>
            <p>Dostawa: {deliveryPrice.toFixed(2)} zł</p>
            <hr />
            <h3>Do zapłaty: {finalTotal.toFixed(2)} zł</h3>
          </div>

          <button class="order-btn" onclick={placeOrder}>Zapłać i zamów</button>
        </div>
      {/if}
    </section>
  {/if}
</main>
