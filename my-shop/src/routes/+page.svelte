<script>
  import { supabase } from '$lib/supabaseClient';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import './page.css';

  import * as auth from '$lib/services/auth';
  import * as cartSvc from '$lib/services/cart';
  import * as orderSvc from '$lib/services/orders';
  import * as adminSvc from '$lib/services/admin';

  let { data } = $props();

  // --- STAN UI I NAWIGACJI ---
  let isHistoryVisible = $state(false);
  let activeView = $state('shop');
  
  /** @type {any} */
  let currentUser = $state(null);

  // --- STAN KOSZYKA I ZAMÓWIEŃ ---
  /** @type {any[]} */
  let cart = $state([]);
  /** @type {any[]} */
  let orderHistory = $state([]);
  let selectedDeliveryId = $state('');
  let selectedPaymentId = $state('');
  /** @type {Record<string, number>} */
  let selectedQuantities = $state({});

  // --- STAN ADMINA I EDYCJI ---
  let newName = $state(''), newDesc = $state(''), newPrice = $state(''), newStock = $state(''), newImg = $state(''), newCat = $state('');
  /** @type {any} */
  let editingProduct = $state(null);

  // --- OBLICZENIA ($derived) ---
  let isAdmin = $derived(currentUser?.email === 'admin@sklep.pl');
  let itemsTotal = $derived(cart.reduce((acc, item) => acc + (item.products.price * item.quantity), 0));
  let deliveryPrice = $derived(data.deliveryMethods.find((/** @type {any} */ d) => d.id == selectedDeliveryId)?.price || 0);
  let finalTotal = $derived(itemsTotal + deliveryPrice);

  async function refreshData() {
    if (currentUser && !isAdmin) {
      cart = await cartSvc.loadCart(currentUser.id);
      orderHistory = await orderSvc.loadOrders(currentUser.id);
    }
  }

  onMount(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      currentUser = session?.user || null;
      refreshData();
    });

    const subscription = supabase
      .channel('produkty-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          invalidateAll();
          refreshData();
      }).subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  });

  // --- WRAPPERY ŁĄCZĄCE HTML Z SERWISAMI ---
  
  /** @param {any} p */
  const handleAddToCart = async (p) => {
    if (!currentUser) return alert('Zaloguj się jako klient!');
    await cartSvc.addToCart(p, currentUser.id, isAdmin, cart, selectedQuantities[p.id]);
    refreshData();
  };

  /** * @param {any} item 
   * @param {number} delta 
   */
  const handleUpdateQty = async (item, delta) => {
    await cartSvc.updateCartQuantity(item, delta);
    refreshData();
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) return;
    const success = await orderSvc.placeOrder({
      userId: currentUser.id, cart, finalTotal, deliveryId: selectedDeliveryId, paymentId: selectedPaymentId
    });
    
    if (success === true) {
      selectedDeliveryId = ''; selectedPaymentId = '';
      refreshData(); invalidateAll();
    } else if (typeof success === 'object' && success !== null && 'action' in success) {
      refreshData(); invalidateAll();
    }
  };

  /** @param {any} order */
  const handleReturnOrder = async (order) => {
    const success = await orderSvc.returnOrder(order);
    if (success) { refreshData(); invalidateAll(); }
  };

  const handleAddProduct = async () => {
    const success = await adminSvc.addProduct({ newName, newDesc, newPrice, newStock, newImg, newCat });
    if (success) { newName = ''; newDesc = ''; newPrice = ''; newStock = ''; newImg = ''; newCat = ''; }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    const success = await adminSvc.saveEdit(editingProduct);
    if (success) { editingProduct = null; invalidateAll(); }
  };
</script>

<div class="dev-bar">
  <span>
    Widok: <strong>{!currentUser ? 'Niezalogowany Gość' : (isAdmin ? 'Admin' : 'Klient')}</strong>
    {#if currentUser}
      <small style="margin-left: 10px; opacity: 0.8;">({currentUser.email})</small>
      {#if !isAdmin}
        <button class="nav-toggle-btn" onclick={() => activeView = activeView === 'shop' ? 'profile' : 'shop'}>
          {activeView === 'shop' ? '👤 Moje Konto' : '🛒 Wróć do sklepu'}
        </button>
      {/if}
    {/if}
  </span>
  <div class="dev-buttons">
    <button onclick={() => auth.logout()} class="logout-btn">Wyloguj</button>
    <button onclick={() => auth.loginAs('tester@sklep.pl')}>Tester 1</button>
    <button onclick={() => auth.loginAs('tester2@sklep.pl')}>Tester 2</button>
    <button onclick={() => auth.loginAs('admin@sklep.pl')} class="admin-btn">Admin</button>
  </div>
</div>

<header>
  <h1>GamerShop Pro 🎮</h1>
</header>

<main>
  {#if editingProduct}
    <div class="modal-backdrop">
      <div class="modal-content add-form">
        <h2>✏️ Edytuj grę</h2>
        <label for="edit-name">Nazwa:</label>
        <input id="edit-name" type="text" bind:value={editingProduct.name} />
        <label for="edit-desc">Producent:</label>
        <input id="edit-desc" type="text" bind:value={editingProduct.description} />
        <label for="edit-price">Cena (zł):</label>
        <input id="edit-price" type="number" bind:value={editingProduct.price} />
        <label for="edit-img">Link do obrazka:</label>
        <input id="edit-img" type="text" bind:value={editingProduct.image_url} />
        <label for="edit-cat">Rodzaj gry:</label>
        <select id="edit-cat" bind:value={editingProduct.category}>
          <option value="">Brak...</option>
          <option value="RPG">RPG</option>
          <option value="FPS">FPS</option>
          <option value="Strategia">Strategia</option>
          <option value="Sportowa">Sportowa</option>
          <option value="Horror">Horror</option>
          <option value="Symulator">Symulator</option>
        </select>
        <label for="edit-stock">Ilość sztuk na magazynie:</label>
        <input id="edit-stock" type="number" bind:value={editingProduct.stock_quantity} />
        <div class="modal-actions">
          <button class="order-btn" onclick={handleSaveEdit}>Zapisz zmiany</button>
          <button class="cancel-btn" onclick={() => editingProduct = null}>Anuluj</button>
        </div>
      </div>
    </div>
  {/if}

  {#if isAdmin}
    <section class="admin-dashboard">
      <h2>🛠️ Panel Administratora - Dodaj Grę</h2>
      <div class="add-form">
        <input type="text" bind:value={newName} placeholder="Nazwa gry" />
        <input type="text" bind:value={newDesc} placeholder="Producent" />
        <input type="number" bind:value={newPrice} placeholder="Cena (zł)" min="0" />
        <input type="number" bind:value={newStock} placeholder="Ilość sztuk" min="0" />
        <input type="text" bind:value={newImg} placeholder="Link do obrazka" />
        <select bind:value={newCat}>
          <option value="">Gatunek...</option>
          <option value="RPG">RPG</option>
          <option value="FPS">FPS</option>
          <option value="Strategia">Strategia</option>
          <option value="Sportowa">Sportowa</option>
        </select>
        <button class="order-btn" onclick={handleAddProduct}>Dodaj grę</button>
      </div>
    </section>

    <section class="admin-dashboard">
      <h2>📥 Powiadomienia Admina</h2>
      <div class="admin-grid">
        <div class="tasks">
          <h3>Lista zadań</h3>
          {#each data.adminTasks as task (task.id)}
            <div class="task-card">{task.status === 'zakończone' ? '✅' : '⏳'} {task.title}</div>
          {:else}
            <p>Brak zadań.</p>
          {/each}
        </div>
        <div class="inquiries">
          <h3>Zapytania o produkty</h3>
          {#each data.inquiries as inq (inq.id)}
            <div class="inquiry-card">
              <strong>{inq.products?.name}</strong>: {inq.message} <br/>
              <small>Od: {inq.email}</small>
            </div>
          {:else}
            <p>Brak zapytań.</p>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  {#if activeView === 'shop'}
    {#if currentUser && !isAdmin}
      <section class="checkout-section">
        <div class="cart-header">
          <h2>🛒 Twój Koszyk</h2>
          {#if cart.length > 0}
            <button class="clear-cart-btn" onclick={async () => { if(await cartSvc.clearCart(currentUser.id)) refreshData(); }}>Wyczyść koszyk 🗑️</button>
          {/if}
        </div>
        <div class="cart-list">
          {#each cart as item (item.id)}
            <div class="cart-item">
              <div class="cart-item-info">
                <span class="cart-item-name">{item.products.name}</span>
                <div class="qty-controls">
                  <button class="qty-btn" onclick={() => handleUpdateQty(item, -1)} disabled={item.quantity <= 1}>-</button>
                  <span class="cart-item-qty">{item.quantity}</span>
                  <button class="qty-btn" onclick={() => handleUpdateQty(item, 1)} disabled={item.quantity >= item.products.stock_quantity}>+</button>
                </div>
                <span class="cart-item-price">{(item.products.price * item.quantity).toFixed(2)} zł</span>
              </div>
              <button class="remove-btn" onclick={async () => { await cartSvc.removeFromCart(item.id); refreshData(); }}>Usuń 🗑️</button>
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
              <hr>
              <h3>Do zapłaty: {finalTotal.toFixed(2)} zł</h3>
            </div>
            <button class="order-btn" onclick={handlePlaceOrder}>Zapłać i zamów</button>
          </div>
        {/if}
      </section>
    {/if}

    <section class="catalog">
      <h2>🕹️ Katalog Gier</h2>
      <div class="grid">
        {#each data.products as p (p.id)}
          {#if !p.is_hidden || isAdmin}
            <div class="card" class:hidden={p.is_hidden} class:empty-stock={p.stock_quantity === 0}>
              <img src={p.image_url} alt={p.name} />
              <div class="title-row">
                <h3>{p.name}</h3>
                {#if p.category}
                  <span class="category-tag">{p.category}</span>
                {/if}
              </div>
              <p class="desc">{p.description}</p>
              <p class="price">{p.price} zł</p>
              <p class="stock">Dostępnych sztuk: <strong>{p.stock_quantity}</strong></p>
              {#if !isAdmin}
                {#if p.stock_quantity > 0}
                  <div class="buy-section">
                    <input type="number" min="1" max={p.stock_quantity} bind:value={selectedQuantities[p.id]} placeholder="1" class="qty-input" />
                    <button class="buy-btn" onclick={() => handleAddToCart(p)}>Do koszyka</button>
                  </div>
                {:else}
                  <button class="buy-btn out-of-stock" disabled>Brak w magazynie</button>
                {/if}
              {/if}
              {#if isAdmin}
                <div class="admin-controls">
                  <button class="toggle-btn" class:restore={p.is_hidden} onclick={() => adminSvc.toggleVisibility(p)}>
                    {p.is_hidden ? 'Przywróć widoczność' : 'Ukryj przed klientami'}
                  </button>
                  <button class="edit-btn" onclick={() => editingProduct = { ...p }}>Edytuj ✏️</button>
                  <button class="del-btn" onclick={() => adminSvc.deleteProduct(p.id)}>Usuń z bazy 🗑️</button>
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    </section>
  {/if}

  {#if activeView === 'profile' && currentUser && !isAdmin}
    <div class="profile-header">
      <button class="back-link" onclick={() => activeView = 'shop'}>← Powrót do zakupów</button>
      <h1>Panel Klienta</h1>
    </div>

    <section class="order-history-section">
      <div 
        class="section-header expandable" 
        onclick={() => isHistoryVisible = !isHistoryVisible}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (isHistoryVisible = !isHistoryVisible)}
        role="button"
        tabindex="0"
      >
        <h2>
          <span class="arrow {isHistoryVisible ? 'down' : ''}">▶</span>
          📦 Twoja Historia Zamówień
        </h2>
      </div>

      {#if isHistoryVisible}
        <div class="orders-list">
          {#each orderHistory as order (order.id)}
            <div class="order-card">
              <div class="order-header">
                <span><strong>Zamówienie nr:</strong> {order.id.slice(0, 8)}...</span>
                <span><strong>Data:</strong> {new Date(order.created_at).toLocaleDateString()}</span>
                <span><strong>Suma:</strong> {order.total_amount.toFixed(2)} zł</span>
                <span class="status-badge {order.status}">
                  {order.status === 'paid' ? 'Opłacone' : 'Zwrócone'}
                </span>
              </div>
              
              <div class="order-details-visible">
                <ul class="order-items-list">
                  {#each order.order_items as item (item.id)}
                    <li>{item.quantity}x {item.products?.name} <small>({item.price_at_time} zł/szt)</small></li>
                  {/each}
                </ul>

                {#if order.status === 'paid'}
                  <div class="order-actions">
                    <button class="return-btn" onclick={() => handleReturnOrder(order)}>
                      Zwróć zamówienie
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          {:else}
            <p>Nie masz jeszcze żadnych zamówień.</p>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</main>