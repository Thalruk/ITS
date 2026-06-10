<script>
  import { supabase } from '$lib/supabaseClient';
  import { invalidateAll } from '$app/navigation';
  import { loadCartGlobal } from '$lib/store.svelte.js';
  import { onMount } from 'svelte';
  import './koszyk.css';
  
  // NOWE IMPORTY DO OBSŁUGI ZAMÓWIEŃ:
  import CheckoutForm from '$lib/components/CheckoutForm.svelte';
  import { placeOrder } from '$lib/services/orders.js';

  let { data } = $props();

  /** @type {any} */
  let currentUser = $derived(data.user || null);
  let authChecked = $derived(true);
  let isAdmin = $derived(data.user?.role?.toLowerCase() === 'admin');

  /** @type {any[]} */
  let cart = $state([]);
  let selectedDeliveryId = $state('');
  let selectedPaymentId = $state('');

  //Liczby do zagadki
  const secretQuantities = [444, 555, 666, 888, 33, 999, 666, 88];

 
 // NOWY STAN NA DANE FORMULARZA (Rozbita ulica i dodany Paczkomat)
  let shippingData = $state({
    
      firstName: '', lastName: '', 
      streetName: '', buildingNumber: '', apartmentNumber: '', 
      postalCode: '', city: '', country: 'Polska', phone: '', paczkomatId: ''
      
  });
//=================================================================================
  //Zagadka Szyfr cezara   https://imgur.com/a/cuLybcy
$effect(() => {
      const wpisaneMiasto = shippingData.city.toLowerCase().trim();
      
      if (wpisaneMiasto === 'novigrad' || wpisaneMiasto === 'Novigrad') {
          
          shippingData.city = ''; 
          
          setTimeout(() => {
              alert('⚔️ "Witamy w Wolnym Mieście Novigrad!\n\nGratulacje, zagadka rozwiązana! Hasło to: WolneMiasto');
          }, 100);
      }
  });
  //=================================================================================

// Sprawdzamy czy w nazwie wybranej dostawy jest słowo "paczkomat" (niezależnie od wielkości liter)
  let isPaczkomat = $derived(
      data.deliveryMethods.find((/** @type {any} */ d) => d.id == selectedDeliveryId)?.name.toLowerCase().includes('paczkomat') || false
  );

  /** @param {any} product */
  function getActivePrice(product) {
    return (product.promo_price > 0 && product.promo_price < product.price) 
        ? product.promo_price 
        : product.price;
  }

  let itemsTotal = $derived(cart.reduce((acc, item) => acc + getActivePrice(item.products) * item.quantity, 0));
  let deliveryPrice = $derived(data.deliveryMethods.find((/** @type {any} */ d) => d.id == selectedDeliveryId)?.price || 0);
  let finalTotal = $derived(itemsTotal + deliveryPrice);

  //Zagadka
  let isSecretSolved = $derived(
      cart.length === secretQuantities.length &&
      cart.every((item, index) => item.quantity === secretQuantities[index])
  );

  $effect(() => {
      if (currentUser && !isAdmin) {
          loadCart();
      } else {
          cart = [];
      }
  });

  onMount(() => {

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
    if (!currentUser) {
      cart = [];
      return;
    }

    const { data: c } = await supabase
      .from('cart_items')
      .select('id, quantity, product_id, products(*, categories(name))')
      .eq('user_id', currentUser.id)
      .order('id', { ascending: true });

    cart = c || [];
    await loadCartGlobal();
  }

  /** @param {number} cartItemId */
  async function removeFromCart(cartItemId) {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
    if (error) alert(error.message);
    else await loadCart();
  }

  async function clearCart() {
    if (!confirm('Czy na pewno chcesz usunąć wszystkie produkty z koszyka?')) return;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', currentUser.id);
    if (error) alert('Błąd: ' + error.message);
    else await loadCart();
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
    else await loadCart();
  }

  // --- FUNKCJA WYSYŁAJĄCA DANE DO orders.js ---
 async function handlePlaceOrder() {

//===================================================================================================
      //  ZAGADKA : Wiedzmin 3 najlepszy 3 https://imgur.com/a/PvisHqc
      const witcherInCart = cart.find((/** @type {any} */ item) => 
          item.products.name.toLowerCase().includes('wiedźmin 3') || 
          item.products.name.toLowerCase().includes('wiedzmin 3')
      );

      if (witcherInCart) {
          const isAllThrees = 
              shippingData.firstName.trim() === '3' &&
              shippingData.lastName.trim() === '3' &&
              shippingData.postalCode.trim() === '3' &&
              shippingData.city.trim() === '3' &&
              (isPaczkomat 
                  ? (shippingData.paczkomatId.trim() === '3' && shippingData.phone.trim() === '3')
                  : (shippingData.streetName.trim() === '3' && shippingData.buildingNumber.trim() === '3')
              );

          if (isAllThrees) {
              alert('Płotka jest z ciebie zadowolona.\n\nRozwiązałeś zagadkę! Oto twoje hasło: NieznoszePortali\n👉 ');

              return; 
          }
      }
//===================================================================================================


      const success = await placeOrder({
          userId: currentUser.id,
          cart: cart,
          finalTotal: finalTotal,
          deliveryId: selectedDeliveryId,
          paymentId: selectedPaymentId,
          shippingData: shippingData,
          isPaczkomat: isPaczkomat 
      });
    

      if (success === true) {
          selectedDeliveryId = '';
          selectedPaymentId = '';
          shippingData = { 
              firstName: '', lastName: '', 
              streetName: '', buildingNumber: '', apartmentNumber: '', 
              postalCode: '', city: '', country: 'Polska', phone: '', paczkomatId: '' 
          };
          await loadCart();
          await invalidateAll();
      } else if (typeof success === 'object' && success !== null && success.action === 'refresh_cart') {
          // Teraz TypeScript wie na 100%, że to obiekt i przestanie krzyczeć
          await loadCart();
          await invalidateAll();
      }
  }
</script>


<header class="cart-page-header">
  <h1>Twój Koszyk</h1>
<button class="back-link" onclick={() => window.location.href = '/gry'}>Wróć do katalogu</button>
</header>

<main class="cart-page-main">
  {#if !authChecked}
    <section class="checkout-section">
      <p>Ładowanie koszyka...</p>
    </section>
  {:else if !currentUser}
    <section class="checkout-section">
      <p>Musisz być zalogowany jako klient, aby zobaczyć koszyk.</p>
    </section>
  {:else if isAdmin}
    <section class="checkout-section">
      <p>Admin nie korzysta z koszyka.</p>
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
        
        <CheckoutForm bind:shippingData={shippingData} isPaczkomat={isPaczkomat} />
        
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
          {#if shippingData.city.toLowerCase().trim() === 'night city'}
            <span class="secret-message" style="color: #ff0055; margin-top: 15px; display: block; text-align: center; font-weight: bold; font-size: 1.1rem; border: 1px dashed #ff0055; padding: 8px; border-radius: 6px; background: rgba(255, 0, 85, 0.05);">
              Rozwiązanie: Chooh2Collector
            </span>
          {/if}
          
          <div class="order-action">
            <button class="order-btn" onclick={handlePlaceOrder}>Zapłać i zamów</button>
            {#if isSecretSolved}
              <span class="secret-message">love4games</span>
            {/if}
          </div>
        </div>
      {/if}
    </section>
  {/if}
</main>
