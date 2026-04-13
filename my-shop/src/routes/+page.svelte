<script>
  import { supabase } from '$lib/supabaseClient';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';

  let { data } = $props();

  // --- STAN KONT I UPRAWNIEŃ ---
  /** @type {any} */
  let currentUser = $state(null);
  let isAdmin = $derived(currentUser?.email === 'admin@sklep.pl');

  // --- STAN KOSZYKA I CHECKOUTU ---
  /** @type {any[]} */
  let cart = $state([]);
  let selectedDeliveryId = $state('');

  // --- STAN FORMULARZA ADMINA ---
  let newName = $state(''), newDesc = $state(''), newPrice = $state(''), newImg = $state(''), newCat = $state('');

  // --- OBLICZENIA ($derived) ---
  let itemsTotal = $derived(cart.reduce((acc, item) => acc + (item.products.price * item.quantity), 0));
  let deliveryPrice = $derived(data.deliveryMethods.find(d => d.id == selectedDeliveryId)?.price || 0);
  let finalTotal = $derived(itemsTotal + deliveryPrice);

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;
    if (currentUser && !isAdmin) loadCart();
  });

  // --- LOGOWANIE TESTOWE ---
  /** @param {string} email */
  async function loginAs(email) {
    const { error } = await supabase.auth.signInWithPassword({ email: email, password: 'haslo123' });
    if (error) alert('Błąd logowania: Upewnij się, że konto istnieje w Supabase!');
    else location.reload();
  }

  async function logout() {
    await supabase.auth.signOut();
    location.reload();
  }

  // --- LOGIKA KOSZYKA (Tylko Klient) ---
  async function loadCart() {
    const { data: c } = await supabase.from('cart_items').select('id, quantity, product_id, products(*)').eq('user_id', currentUser.id);
    cart = c || [];
  }

  /** @param {number} productId */
  async function addToCart(productId) {
    if (!currentUser) return alert('Musisz być zalogowany jako klient, aby kupować!');
    if (isAdmin) return alert('Admin nie robi zakupów!');
    
    const { error } = await supabase.from('cart_items').insert({ user_id: currentUser.id, product_id: productId });
    if (error) alert(error.code === '23505' ? 'Gra jest już w koszyku!' : error.message);
    else loadCart();
  }

  /** @param {number} cartItemId */
  async function removeFromCart(cartItemId) {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
    if (error) alert(error.message);
    else loadCart();
  }

  async function placeOrder() {
    if (!selectedDeliveryId) return alert('Wybierz metodę dostawy!');
    
    const { data: order, error: oErr } = await supabase.from('orders').insert({
      user_id: currentUser.id, total_amount: finalTotal, delivery_method_id: selectedDeliveryId, status: 'paid'
    }).select().single();

    if (oErr) return alert("Błąd zamówienia: " + oErr.message);

    const orderItems = cart.map(item => ({
      order_id: order.id, product_id: item.product_id, quantity: item.quantity, price_at_time: item.products.price
    }));

    await supabase.from('order_items').insert(orderItems);
    await supabase.from('cart_items').delete().eq('user_id', currentUser.id);
    
    alert('Dziękujemy! Zamówienie zostało złożone.');
    selectedDeliveryId = ''; loadCart(); invalidateAll();
  }

  // --- LOGIKA ADMINA ---
 /** @param {any} product */
  async function toggleVisibility(product) {
    // 1. Upewniamy się, że cokolwiek się klika
    console.log("Kliknięto grę:", product.name);

    // 2. Bezpieczne odwracanie (jeśli w bazie było pusto/null, traktuj jako false)
    const newStatus = product.is_hidden === true ? false : true;
    
    // Testowe okienko - jeśli się NIE pojawi, to znaczy, że nie zapisałeś pliku w VS Code!
    alert('Przycisk żyje! Próbuję ustawić ukrycie na: ' + newStatus);

    // 3. Wysyłamy prośbę do Supabase
    const { error } = await supabase
      .from('products')
      .update({ is_hidden: newStatus })
      .eq('id', product.id);

    // 4. Sprawdzamy odpowiedź
    if (error) {
      alert('SUPABASE ODRZUCIŁO ZMIANĘ: ' + error.message);
    } else {
      alert('Zapisano w bazie! Odświeżam stronę.');
      invalidateAll(); // Wymusza ponowne pobranie danych i narysowanie strony
    }
  }

/** @param {number} productId */
  async function deleteProduct(productId) {
    if (!confirm('UWAGA: Czy na pewno chcesz całkowicie usunąć ten produkt z bazy danych? Tej akcji nie można cofnąć!')) return;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
      
    if (error) {
      alert('Błąd podczas usuwania: ' + error.message);
    } else {
      invalidateAll(); // Odświeża widok po usunięciu
    }
  }

  async function addProduct() {
    if (!newName || !newPrice) return alert('Podaj nazwę i cenę!');
    await supabase.from('products').insert([{ 
      name: newName, description: newDesc, price: parseFloat(newPrice), image_url: newImg || 'https://via.placeholder.com/150', category: newCat 
    }]);
    newName = ''; newDesc = ''; newPrice = ''; newImg = ''; newCat = '';
    invalidateAll();
  }
</script>

<div class="dev-bar">
  <span>Widok: <strong>{!currentUser ? 'Niezalogowany Gość' : (isAdmin ? 'Administrator' : 'Zalogowany Klient')}</strong></span>
  <div class="dev-buttons">
    <button onclick={() => logout()}>Wyloguj (Gość)</button>
    <button onclick={() => loginAs('tester@sklep.pl')}>Zaloguj jako Klient</button>
    <button onclick={() => loginAs('admin@sklep.pl')} class="admin-btn">Zaloguj jako Admin</button>
  </div>
</div>

<header>
  <h1>GamerShop Pro 🎮</h1>
</header>

<main>
  {#if isAdmin}
    <section class="admin-dashboard">
      <h2>🛠️ Panel Administratora - Dodaj Grę</h2>
      <div class="add-form">
        <input type="text" bind:value={newName} placeholder="Nazwa" />
        <input type="text" bind:value={newDesc} placeholder="Krótki opis" />
        <input type="number" bind:value={newPrice} placeholder="Cena" />
        <input type="text" bind:value={newImg} placeholder="Link do obrazka" />
        <select bind:value={newCat}>
          <option value="">Gatunek...</option>
          <option value="RPG">RPG</option>
          <option value="FPS">FPS</option>
          <option value="Strategia">Strategia</option>
        </select>
        <button class="order-btn" onclick={addProduct}>Dodaj grę</button>
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

  {#if currentUser && !isAdmin}
    <section class="checkout-section">
      <h2>🛒 Twój Koszyk</h2>
      <div class="cart-list">
        {#each cart as item (item.id)}
          <div class="cart-item">
            <span>{item.products.name} - <strong>{item.products.price} zł</strong></span>
            <button class="remove-btn" onclick={() => removeFromCart(item.id)}>Usuń 🗑️</button>
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

          <div class="summary">
            <p>Produkty: {itemsTotal.toFixed(2)} zł</p>
            <p>Dostawa: {deliveryPrice.toFixed(2)} zł</p>
            <hr>
            <h3>Do zapłaty: {finalTotal.toFixed(2)} zł</h3>
          </div>

          <button class="order-btn" onclick={placeOrder}>Zapłać i zamów</button>
        </div>
      {/if}
    </section>
  {/if}

  <section class="catalog">
    <h2>🕹️ Katalog Gier</h2>
    <div class="grid">
      {#each data.products as p (p.id)}
        {#if !p.is_hidden || isAdmin}
          <div class="card" class:hidden={p.is_hidden}>
            <img src={p.image_url} alt={p.name} />
            <h3>{p.name}</h3>
            <p class="price">{p.price} zł</p>
            
            {#if !isAdmin}
              <button class="buy-btn" onclick={() => addToCart(p.id)}>Do koszyka</button>
            {/if}
            
            {#if isAdmin}
              <div class="admin-controls">
                <button class="toggle-btn" onclick={() => toggleVisibility(p)}>
                  {p.is_hidden ? 'Przywróć widoczność' : 'Ukryj przed klientami'}
                </button>
                <button class="del-btn" onclick={() => deleteProduct(p.id)}>
                  Usuń z bazy 🗑️
                </button>
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </section>
</main>

<style>
  :global(body) { font-family: 'Segoe UI', sans-serif; background: #121212; color: white; margin: 0; }
  
  /* Style paska dev */
  .dev-bar { background: #d6bcfa; color: #44337a; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
  .dev-buttons button { padding: 5px 10px; margin-left: 5px; border: none; border-radius: 4px; cursor: pointer; background: white; color: #44337a; font-weight: bold;}
  .dev-buttons .admin-btn { background: #e53e3e; color: white; }
  
  header { padding: 20px; background: #1f1f1f; border-bottom: 3px solid #3182ce; }
  main { padding: 20px; max-width: 1100px; margin: auto; }

  .checkout-section, .admin-dashboard { background: #1a202c; padding: 20px; border-radius: 12px; margin-bottom: 40px; border: 1px solid #2d3748; }
  .cart-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #2d3748; align-items: center; }
  .remove-btn { background: #e53e3e; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
  
  .add-form { display: flex; gap: 10px; flex-wrap: wrap; }
  .add-form input, .add-form select { padding: 8px; border-radius: 4px; border: none; }
  
  .checkout-controls { margin-top: 20px; background: #2d3748; padding: 20px; border-radius: 8px; }
  .summary { text-align: right; margin: 20px 0; }
  .summary h3 { color: #48bb78; font-size: 1.5rem; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
  .card { background: #1f1f1f; padding: 15px; border-radius: 8px; display: flex; flex-direction: column; }
  .card.hidden { opacity: 0.4; filter: grayscale(1); border: 1px dashed red;}
  .card img { width: 100%; height: 140px; object-fit: contain; background: #000; border-radius: 4px; }

  .buy-btn, .order-btn { background: #3182ce; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; margin-top: auto;}
  .order-btn { background: #48bb78; font-size: 1.1rem; }
  
  .admin-controls { margin-top: 15px; border-top: 1px solid #333; padding-top: 10px; }
  .toggle-btn { background: none; border: 1px solid #a0aec0; color: #a0aec0; cursor: pointer; padding: 5px; width: 100%; font-size: 0.8rem; }

  .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .task-card, .inquiry-card { background: #2d3748; padding: 10px; margin-bottom: 10px; border-radius: 5px; font-size: 0.9rem; }

  .admin-controls { display: flex; flex-direction: column; gap: 5px; }
  .del-btn { background: #e53e3e; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 0.8rem; }
  .del-btn:hover { background: #c53030; }
</style>