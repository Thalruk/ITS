<script>
  import { supabase } from '$lib/supabaseClient';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import './koszyk.css';
  
  // NOWE IMPORTY DO OBSŁUGI ZAMÓWIEŃ:
  import CheckoutForm from '$lib/components/CheckoutForm.svelte';
  import { placeOrder } from '$lib/services/orders.js';

  let { data } = $props();

  /** @type {any} */
  let currentUser = $state(null);
  let authChecked = $state(false);
  let isAdmin = $derived(currentUser?.email === 'admin@sklep.pl');

  /** @type {any[]} */
  let cart = $state([]);
  let selectedDeliveryId = $state('');
  let selectedPaymentId = $state('');

  // NOWY STAN NA DANE FORMULARZA:
  let shippingData = $state({
      firstName: '', lastName: '', street: '', postalCode: '', city: '', country: 'Polska', phone: ''
  });

  /** @param {any} product */
  function getActivePrice(product) {
    return (product.promo_price > 0 && product.promo_price < product.price) 
        ? product.promo_price 
        : product.price;
  }

  let itemsTotal = $derived(cart.reduce((acc, item) => acc + getActivePrice(item.products) * item.quantity, 0));
  let deliveryPrice = $derived(data.deliveryMethods.find((/** @type {any} */ d) => d.id == selectedDeliveryId)?.price || 0);
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

  // --- FUNKCJA WYSYŁAJĄCA DANE DO orders.js ---
 async function handlePlaceOrder() {
      const success = await placeOrder({
          userId: currentUser.id,
          cart: cart,
          finalTotal: finalTotal,
          deliveryId: selectedDeliveryId,
          paymentId: selectedPaymentId,
          shippingData: shippingData
      });

      if (success === true) {
          selectedDeliveryId = '';
          selectedPaymentId = '';
          shippingData = { firstName: '', lastName: '', street: '', postalCode: '', city: '', country: 'Polska', phone: '' };
          loadCart();
          invalidateAll();
      } else if (typeof success === 'object' && success !== null && success.action === 'refresh_cart') {
          // Teraz TypeScript wie na 100%, że to obiekt i przestanie krzyczeć
          loadCart();
          invalidateAll();
      }
  }
</script>


<header class="cart-page-header">
  <h1>Twój Koszyk</h1>
<button class="back-link" onclick={() => window.location.href = '/'}>Wróć do katalogu</button>
</header>

<main class="cart-page-main">
  {#if !authChecked}
    <section class="checkout-section">
      <p>Ładowanie koszyka...</p>
    </section>
  {:else if !currentUser}
    <section class="checkout-section">
      <p>Musisz być zalogowany jako klient, aby zobaczyć koszyk.</p>
     <button class="back-link" onclick={() => window.location.href = '/'}>Wróć do katalogu</button>
    </section>
  {:else if isAdmin}
    <section class="checkout-section">
      <p>Admin nie korzysta z koszyka.</p>
      <button class="back-link" onclick={() => window.location.href = '/'}>Wróć do katalogu</button>
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

              <div class="cart-price-wrapper">
                {#if item.products.promo_price > 0 && item.products.promo_price < item.products.price}
                  <span class="cart-item-price" style="text-decoration: line-through; color: #aeb9c8; font-size: 0.85rem; display: block; text-align: right;">
                    {(item.products.price * item.quantity).toFixed(2)} zł
                  </span>
                  <span class="cart-item-price" style="color: #ff3366; display: block; text-align: right;">
                    {(item.products.promo_price * item.quantity).toFixed(2)} zł
                  </span>
                {:else}
                  <span class="cart-item-price" style="display: block; text-align: right;">
                    {(item.products.price * item.quantity).toFixed(2)} zł
                  </span>
                {/if}
              </div>

            </div>
            <button class="remove-btn" onclick={() => removeFromCart(item.id)}>Usuń</button>
          </div>
        {:else}
          <p>Koszyk jest pusty.</p>
        {/each}
      </div>

      {#if cart.length > 0}
        
        <CheckoutForm bind:shippingData={shippingData} />
        
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

          <button class="order-btn" onclick={handlePlaceOrder}>Zapłać i zamów</button>
        </div>
      {/if}
    </section>
  {/if}
</main>