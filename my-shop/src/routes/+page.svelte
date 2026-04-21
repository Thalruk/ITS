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
  let selectedPaymentId = $state('');
  /** @type {Record<number, number>} */
  let selectedQuantities = $state({});

  // --- STAN FORMULARZA ADMINA ---
// Formularz admina
  let newName = $state(''), newDesc = $state(''), newPrice = $state(''), newStock = $state(''), newImg = $state(''), newCat = $state('');
  // --- STAN EDYCJI PRODUKTU ---
  /** @type {any} */
  let editingProduct = $state(null);

  // --- OBLICZENIA ($derived) ---
  let itemsTotal = $derived(cart.reduce((acc, item) => acc + (item.products.price * item.quantity), 0));
  let deliveryPrice = $derived(data.deliveryMethods.find(d => d.id == selectedDeliveryId)?.price || 0);
  let finalTotal = $derived(itemsTotal + deliveryPrice);

  onMount(() => {
   
    supabase.auth.getSession().then(({ data: { session } }) => {
      currentUser = session?.user || null;
      if (currentUser && !isAdmin) loadCart();
    });

    const subscription = supabase
      .channel('produkty-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        (payload) => {
          console.log('Ktoś zmienił bazę! Odświeżam...', payload);
          invalidateAll(); 
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
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

  /** @param {any} product */
  async function addToCart(product) {
    if (!currentUser) return alert('Musisz być zalogowany jako klient, aby dokonać zakupu!');
    if (isAdmin) return alert('Admin nie robi zakupów!');

    // Pobieramy ilość z okienka (jeśli puste, zakładamy 1)
    let requestedQty = selectedQuantities[product.id] || 1;
    if (requestedQty < 1) requestedQty = 1;

    // Sprawdzamy, czy w ogóle mamy tyle na magazynie
    if (requestedQty > product.stock_quantity) {
      return alert(`Błąd: Mamy tylko ${product.stock_quantity} sztuk w magazynie!`);
    }

    // Sprawdzamy, czy gra jest już w koszyku
    let existingItem = cart.find(c => c.product_id === product.id);

    if (existingItem) {
      // Gra już tam jest -> Aktualizujemy ilość
      let newTotalQty = existingItem.quantity + requestedQty;
      if (newTotalQty > product.stock_quantity) {
        return alert(`Nie możesz dodać więcej! Masz już w koszyku ${existingItem.quantity} szt., a w magazynie jest łącznie ${product.stock_quantity} szt.`);
      }

      const { error } = await supabase.from('cart_items').update({ quantity: newTotalQty }).eq('id', existingItem.id);
      if (error) alert('Błąd: ' + error.message);
      else { alert('Zaktualizowano ilość w koszyku!'); loadCart(); }
      
    } else {
      // Gry nie ma w koszyku -> Dodajemy jako nową pozycję
      const { error } = await supabase.from('cart_items').insert({ 
        user_id: currentUser.id, 
        product_id: product.id, 
        quantity: requestedQty 
      });
      if (error) alert('Błąd: ' + error.message);
      else { alert('Dodano do koszyka!'); loadCart(); }
    }
  }

  /** @param {number} cartItemId */
  async function removeFromCart(cartItemId) {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
    if (error) alert(error.message);
    else loadCart();
  }

  // --- CZYSZCZENIE CAŁEGO KOSZYKA ---
  async function clearCart() {
    if (!confirm('Czy na pewno chcesz usunąć wszystkie produkty z koszyka?')) return;
    const { error } = await supabase.from('cart_items').delete().eq('user_id', currentUser.id);
    if (error) alert('Błąd: ' + error.message);
    else loadCart();
  }

  // --- ZMIANA ILOŚCI W KOSZYKU ---
  /** * @param {any} item 
   * @param {number} delta 
   */
  async function updateCartQuantity(item, delta) {
    const newQty = item.quantity + delta;

    // Nie pozwalamy zejść poniżej 1 (od tego jest przycisk Usuń)
    if (newQty < 1) return; 
    
    // Blokada przed dodaniem więcej niż jest na magazynie
    if (newQty > item.products.stock_quantity) {
      return alert(`Maksymalna dostępna ilość to ${item.products.stock_quantity} szt.`);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', item.id);

    if (error) alert('Błąd: ' + error.message);
    else loadCart(); // Odświeża koszyk i na nowo przelicza ceny
  }

  async function placeOrder() {
    if (!selectedDeliveryId) return alert('Wybierz metodę dostawy!');
    if (!selectedPaymentId) return alert('Wybierz metodę płatności!');
    
    // 1. Tworzymy nowe zamówienie w bazie
    const { data: order, error: oErr } = await supabase.from('orders').insert({
      user_id: currentUser.id, 
      total_amount: finalTotal, 
      delivery_method_id: selectedDeliveryId, 
      payment_method_id: selectedPaymentId,
      status: 'paid'
    }).select().single();
    if (oErr) return alert("Błąd zamówienia: " + oErr.message);

    // 2. Dodajemy pozycje do zamówienia
    const orderItems = cart.map(item => ({
      order_id: order.id, product_id: item.product_id, quantity: item.quantity, price_at_time: item.products.price
    }));
    await supabase.from('order_items').insert(orderItems);

    // 3. Zdejmujemy sztuki z magazynu 
    for (const item of cart) {
      const newStockQuantity = item.products.stock_quantity - item.quantity;
      
      await supabase
        .from('products')
        .update({ stock_quantity: newStockQuantity })
        .eq('id', item.product_id);
    }

    // 4. Czyścimy koszyk klienta
    await supabase.from('cart_items').delete().eq('user_id', currentUser.id);
    
    // 5. Finalizacja i odświeżenie widoku
    alert('Dziękujemy! Zamówienie zostało złożone.');
    selectedDeliveryId = ''; 
    selectedPaymentId = '';
    
    loadCart(); 
    invalidateAll(); // Automatycznie odświeży katalog gier z nowymi ilościami!
  }

  // --- LOGIKA ADMINA ---
  /** @param {any} product */
    async function toggleVisibility(product) {
      // 1. Bezpieczne odwracanie statusu
      const newStatus = product.is_hidden === true ? false : true;
      
      // 2. Dynamiczny tekst do okienka
      const actionText = newStatus ? 'ukryć ten produkt przed klientami' : 'przywrócić widoczność tego produktu';
      
      // 3. Pytamy o potwierdzenie. Jeśli ktoś kliknie "Anuluj", funkcja się zatrzyma (return)
      if (!confirm(`Czy na pewno chcesz ${actionText}?`)) return;

      // 4. Wysyłamy prośbę do Supabase
      const { error } = await supabase
        .from('products')
        .update({ is_hidden: newStatus })
        .eq('id', product.id);

      // 5. Sprawdzamy odpowiedź
      if (error) {
        alert('Błąd bazy danych: ' + error.message);
      } else {
        alert('Zapisano w bazie! Odświeżam stronę.');
        invalidateAll();
      }
    }
    async function saveEdit() {
      if (!editingProduct.name || !editingProduct.price) return alert('Podaj nazwę i cenę!');
      
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: parseFloat(editingProduct.price),
          image_url: editingProduct.image_url,
          category: editingProduct.category,
          stock_quantity: parseInt(editingProduct.stock_quantity) || 0
        })
        .eq('id', editingProduct.id);

      if (error) {
        alert('Błąd aktualizacji: ' + error.message);
      } else {
        alert('Zapisano zmiany!');
        editingProduct = null; // Zamykamy okienko
        invalidateAll(); // Odświeżamy widok
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

    const parsedPrice = parseFloat(newPrice);
    const parsedStock = parseInt(newStock) || 0; // Jeśli puste, dajemy 0 sztuk

    // GŁÓWNA BLOKADA: Sprawdzamy czy liczby nie są ujemne
    if (parsedPrice < 0 || parsedStock < 0) {
      return alert('Błąd: Cena oraz ilość sztuk nie mogą być ujemne!');
    }

    const { error } = await supabase.from('products').insert([{ 
      name: newName, 
      description: newDesc, 
      price: parsedPrice, 
      stock_quantity: parsedStock, // Wysyłamy stan magazynowy
      image_url: newImg || 'https://via.placeholder.com/150', 
      category: newCat 
    }]);

    if (error) {
      alert('Błąd dodawania: ' + error.message);
    } else {
      // Czyścimy formularz po udanym dodaniu
      newName = ''; newDesc = ''; newPrice = ''; newStock = ''; newImg = ''; newCat = '';
      invalidateAll();
    }
  }
</script>

<div class="dev-bar">
  <span>Widok: <strong>{!currentUser ? 'Niezalogowany Gość' : (isAdmin ? 'Administrator' : 'Zalogowany Klient')}</strong></span>
  <div class="dev-buttons">
    <button onclick={() => logout()} class="logout-btn">Wyloguj (Gość)</button>
    <button onclick={() => loginAs('tester@sklep.pl')}>Zaloguj jako Klient</button>
    <button onclick={() => loginAs('admin@sklep.pl')} class="admin-btn">Zaloguj jako Admin</button>
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
        
        <label for="edit-desc">Opis:</label>
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
          <button class="order-btn" onclick={saveEdit}>Zapisz zmiany</button>
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
        
        <input type="number" bind:value={newPrice} placeholder="Cena (zł)" min="0" step="1.0" />
        <input type="number" bind:value={newStock} placeholder="Ilość sztuk (magazyn)" min="0" step="1" />
        
        <input type="text" bind:value={newImg} placeholder="Link do obrazka" />
        <select bind:value={newCat}>
          <option value="">Gatunek...</option>
          <option value="RPG">RPG</option>
          <option value="FPS">FPS</option>
          <option value="Strategia">Strategia</option>
          <option value="Sportowa">Sportowa</option>
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
      <div class="cart-header">
        <h2>🛒 Twój Koszyk</h2>
        {#if cart.length > 0}
          <button class="clear-cart-btn" onclick={clearCart}>Wyczyść koszyk 🗑️</button>
        {/if}
      </div>

      <div class="cart-list">
        {#each cart as item (item.id)}
          <div class="cart-item">
            <div class="cart-item-info">
              <span class="cart-item-name">{item.products.name}</span>
              
              <div class="qty-controls">
                <button class="qty-btn" onclick={() => updateCartQuantity(item, -1)} disabled={item.quantity <= 1}>-</button>
                <span class="cart-item-qty">{item.quantity}</span>
                <button class="qty-btn" onclick={() => updateCartQuantity(item, 1)} disabled={item.quantity >= item.products.stock_quantity}>+</button>
              </div>

              <span class="cart-item-price">{(item.products.price * item.quantity).toFixed(2)} zł</span>
            </div>
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
                      <button class="buy-btn" onclick={() => addToCart(p)}>Do koszyka</button>
                    </div>
                  {:else}
                    <button class="buy-btn out-of-stock" disabled>Brak w magazynie</button>
                  {/if}
                {/if}
                
                {#if isAdmin}
                <div class="admin-controls">
                    <button class="toggle-btn" class:restore={p.is_hidden} onclick={() => toggleVisibility(p)}>
                      {p.is_hidden ? 'Przywróć widoczność' : 'Ukryj przed klientami'}
                    </button>
                    
                    <button class="edit-btn" onclick={() => editingProduct = { ...p }}>
                      Edytuj ✏️
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
  .dev-bar { 
    background: #021e49; 
    color: #e2e8f0; 
    padding: 12px 20px; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    font-size: 0.9rem;
    border-bottom: 2px solid #3b82f6; /* Jasnoniebieski akcent na dole paska */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
  
  .dev-buttons button { 
    padding: 6px 14px; 
    margin-left: 8px; 
    border: none; 
    border-radius: 6px; 
    cursor: pointer; 
    background: #1a6004; 
    color: rgb(255, 255, 255); 
    font-weight: bold;
    transition: background 0.2s; /* Płynna zmiana koloru */
  }
  .dev-buttons button:hover { background: #35ba1e; }
  .dev-buttons .admin-btn { background: #b12828; }
  .dev-buttons .admin-btn:hover { background: #600202; }
  /* Unikalny, grafitowy kolor dla przycisku Wyloguj */
  .dev-buttons .logout-btn { 
    background: #475569; 
    color: white; 
  }
  .dev-buttons .logout-btn:hover { 
    background: #334155; /* Ciemniejszy odcień po najechaniu */
  }
  
  header { padding: 20px; background: #1f1f1f; border-bottom: 3px solid #3182ce; }
  main { padding: 20px; max-width: 1100px; margin: auto; }

  .checkout-section, .admin-dashboard { background: #1a202c; padding: 20px; border-radius: 12px; margin-bottom: 40px; border: 1px solid #2d3748; }
  .cart-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #2d3748; align-items: center; }
  
  /* Układ informacji o produkcie w koszyku */
  .cart-item-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

    .cart-item-qty {
    background: #4a5568;
    color: #fff;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
  }
  
  .cart-item-name {
    font-weight: bold;
    color: #e2e8f0;
  }

  /* Cena sumaryczna za daną pozycję */
  .cart-item-price {
    margin-left: auto; 
    color: #48bb78;
    font-weight: bold;
    margin-right: 15px;
    font-size: 1.05rem;
  }
  .remove-btn { background: #e53e3e; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
  
  .add-form { display: flex; gap: 10px; flex-wrap: wrap; }
  .add-form input, .add-form select { padding: 8px; border-radius: 4px; border: none; }
  
  /* Poprawa widoczności listy dostaw w koszyku */
  .delivery-picker select {
    background-color: #2d3748; /* Ciemne tło pasujące do reszty interfejsu */
    color: white;
    border: 1px solid #4a5568;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-top: 5px;
  }

  .delivery-picker select option {
    background-color: #2d3748;
    color: white;
  }
  
  .delivery-picker label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    color: #a0aec0;
  }

  .checkout-controls { margin-top: 20px; background: #2d3748; padding: 20px; border-radius: 8px; }
  .summary { text-align: right; margin: 20px 0; }
  .summary h3 { color: #48bb78; font-size: 1.5rem; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
  .card { background: #1f1f1f; padding: 15px; border-radius: 8px; display: flex; flex-direction: column; }

  .card.hidden img, 
  .card.hidden h3, 
  .card.hidden .desc, 
  .card.hidden .price, 
  .card.hidden .stock,
  .card.hidden .category-tag {
    opacity: 0.4;
    filter: grayscale(1);
  }

  .card.empty-stock img, 
  .card.empty-stock h3, 
  .card.empty-stock .desc, 
  .card.empty-stock .price, 
  .card.empty-stock .stock,
  .card.empty-stock .category-tag {
    opacity: 0.4;
    filter: grayscale(1);
  }

  .card img { width: 100%; height: 140px; object-fit: contain; background: #000; border-radius: 4px; margin-bottom: 15px;}

  .desc { font-size: 0.85rem; color: #a0aec0; margin-bottom: 10px; }
  .stock {margin-bottom: 15px; font-size: 0.9rem;}
  
  .admin-controls { 
      display: flex; 
      flex-direction: column; 
      gap: 5px; 
      margin-top: auto;
      border-top: 1px solid #333; 
      padding-top: 10px; 
    }
  .toggle-btn { background: none; border: 1px solid #a0aec0; color: #a0aec0; cursor: pointer; padding: 5px; width: 100%; font-size: 0.8rem; }

  .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .task-card, .inquiry-card { background: #2d3748; padding: 10px; margin-bottom: 10px; border-radius: 5px; font-size: 0.9rem; }

  .del-btn { background: #e53e3e; color: rgb(255, 255, 255); font-weight: bold; border: none; padding: 5px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 0.8rem; }
  .del-btn:hover { background: #c53030; }

  .toggle-btn.restore {
    background: #48bb78;
    color: white;
    border: none;
    font-weight: bold;
  }

  .buy-btn { 
    background: linear-gradient(135deg, #3182ce, #2b6cb0); 
    color: white; 
    border: none; 
    padding: 12px; 
    border-radius: 8px; 
    cursor: pointer; 
    font-weight: 600; 
    font-size: 1rem;
    width: 100%; 
    margin-top: auto;
    box-shadow: 0 4px 6px rgba(49, 130, 206, 0.25);
    transition: all 0.2s ease-in-out;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .buy-btn:hover { 
    background: linear-gradient(135deg, #2b6cb0, #2c5282);
    transform: translateY(-2px); 
    box-shadow: 0 6px 8px rgba(49, 130, 206, 0.4);
  }

  .buy-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(49, 130, 206, 0.3);
  }

  .buy-btn.out-of-stock {
    background: #2d3748; /* Ciemnoszary, wchodzący w tło */
    color: #718096; /* Zgaszony tekst */
    box-shadow: none;
    cursor: not-allowed;
    border: 1px dashed #4a5568; /* Przerywana ramka potęguje efekt "braku" */
  }

  .buy-btn.out-of-stock:hover {
    transform: none; /* Wyłączamy animację skakania */
    background: #2d3748;
  }

  /* Układ okienka ilości i przycisku zakupu obok siebie */
  .buy-section {
    display: flex;
    gap: 10px;
    margin-top: auto; /* Przejmuje spychanie na dół od samego przycisku */
  }

  .buy-section .buy-btn {
    margin-top: 0; /* Kasujemy margines przycisku, żeby nie psół układu */
    flex: 1; /* Przycisk ma zająć resztę wolnego miejsca */
  }

  /* Styl okienka z cyferką */
  .qty-input {
    width: 60px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #4a5568;
    background: #2d3748;
    color: white;
    text-align: center;
    font-weight: bold;
    font-size: 1rem;
  }

  /* Styl dla przycisku edycji */
  .edit-btn { 
    background: #d69e2e; 
    color: rgb(0, 0, 0);
    font-weight: bold;
    border: none; 
    padding: 5px; 
    border-radius: 4px; 
    cursor: pointer; 
    width: 100%; 
    font-size: 0.8rem; 
  }
  .edit-btn:hover { background: #b7791f; }

  /* Style dla Modala Edycji (Tło i okienko) */
  .modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000; /* Zapewnia, że okno jest nad resztą strony */
  }
  .modal-content {
    background: #1a202c; 
    padding: 25px; 
    border-radius: 12px;
    width: 100%; 
    max-width: 450px; 
    border: 1px solid #4a5568;
    flex-direction: column; /* Ustawia pola jedno pod drugim */
  }
  .modal-content h2 { margin-top: 0; color: #e2e8f0; border-bottom: 1px solid #2d3748; padding-bottom: 10px;}
  .modal-content label { margin-top: 10px; font-size: 0.85rem; color: #a0aec0; }
  .modal-content input, .modal-content select { width: 100%; box-sizing: border-box; background: #2d3748; color: white; margin-bottom: 5px;}
  
  .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
  .modal-actions .order-btn { margin-top: 0; flex: 2; width: auto; }
  .cancel-btn { 
    background: #4a5568; color: white; border: none; border-radius: 8px; 
    padding: 12px 24px; cursor: pointer; font-weight: bold; flex: 1;
    transition: all 0.2s;
  }
  .cancel-btn:hover { background: #2d3748; }

/* Guzik 'Dodaj grę' i 'Zapłać i zamów' */
  .order-btn { 
    background: linear-gradient(135deg, #48bb78, #38a169);
    color: white;
    font-size: 1.1rem; 
    font-weight: bold;
    border: none;
    border-radius: 8px; /* Zaokrąglone rogi */
    padding: 12px 24px; /* Zapewnia odpowiednią wysokość i szerokość */
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(72, 187, 120, 0.25);
    transition: all 0.2s ease-in-out;
  }
  
  .order-btn:hover {
    background: linear-gradient(135deg, #38a169, #2f855a);
    transform: translateY(-2px); /* Delikatne uniesienie, jak przy Do koszyka */
    box-shadow: 0 6px 8px rgba(72, 187, 120, 0.4);
  }

  .order-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(72, 187, 120, 0.3);
  }
  
  /* Specjalny przypadek dla panelu admina, by przycisk zajmował całą szerokość */
  .add-form .order-btn {
    width: 100%;
    margin-top: 10px;
  }

  /* Układ tytułu i tagu w jednej linii */
  .title-row {
    display: flex;
    justify-content: space-between; /* Tytuł na lewo, tag na prawo */
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }

  .title-row h3 {
    margin: 0;
  }

  /* Zgrabna odznaka gatunku gry */
  .category-tag {
    background: #dad5d5; /* Zostawiłem Twój jasny kolor tła */
    color: rgb(0, 0, 0);
    font-size: 0.7rem; /* Nieco mniejsza czcionka */
    font-weight: bold;
    padding: 4px 8px;
    border-radius: 12px;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap; /* Zapobiega przenoszeniu do nowej linii */
  }

  /* Poprawa widoczności listy rozwijanej w panelu admina */
  .add-form select {
    background-color: #2d3748; /* Ciemne tło pasujące do inputów */
    color: white; /* Jasny tekst */
    border: 1px solid #4a5568;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .add-form select option {
    background-color: #2d3748;
    color: white;
  }

  .payment-picker {
    margin-top: 15px;
  }
  
  .payment-picker select {
    background-color: #2d3748;
    color: white;
    border: 1px solid #4a5568;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    width: auto;
    font-size: 0.9rem;
    margin-top: 5px;
  }

  .payment-picker select option {
    background-color: #2d3748;
    color: white;
  }

  .payment-picker label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    color: #a0aec0;
  }

  /* Nagłówek koszyka z przyciskiem czyszczenia */
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #2d3748;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  .cart-header h2 { margin: 0; border: none; padding: 0; }
  
  .clear-cart-btn {
    background: #4a5568; color: white; border: none;
    padding: 6px 12px; border-radius: 4px; cursor: pointer;
    font-size: 0.85rem; transition: background 0.2s;
  }
  .clear-cart-btn:hover { background: #e53e3e; }

  /* Kontrolki plus i minus */
  .qty-controls {
    display: flex; align-items: center; gap: 5px;
    background: #2d3748; padding: 2px 5px; border-radius: 6px;
  }
  
  .qty-btn {
    background: #4a5568; color: white; border: none;
    width: 24px; height: 24px; border-radius: 4px;
    cursor: pointer; font-weight: bold;
    display: flex; justify-content: center; align-items: center;
    transition: background 0.2s;
  }
  
  .qty-btn:hover:not(:disabled) { background: #3182ce; }
  .qty-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  
  /* Nadpisanie Twojej poprzedniej szarej pigułki na licznik */
  .cart-item-qty {
    background: transparent; color: white; padding: 0 5px; font-weight: bold;
  }

</style>