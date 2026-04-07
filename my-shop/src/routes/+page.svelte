<script>
  import { supabase } from '$lib/supabaseClient';
  import { invalidateAll } from '$app/navigation'; // Służy do odświeżania danych na stronie

  // Odbiera produkty
  let { data } = $props();

  // Zmienne, które przechowują to, co wpisujemy w formularzu
  let newName = $state('');
  let newDescription = $state('');
  let newPrice = $state('');
 let newImageUrl = $state(''); 
 let newCategory = $state('');
  // 1. FUNKCJA DODAWANIA PRODUKTU
  async function addProduct() {
    if (!newName || !newPrice) return alert('Wpisz chociaż nazwę i cenę!');

    const { error } = await supabase
      .from('products')
      .insert([
        { 
          name: newName, 
          description: newDescription, 
          price: parseFloat(newPrice),
          image_url: newImageUrl || 'https://via.placeholder.com/150', 
          category: newCategory 
        }
      ]);

    if (error) {
      alert('Błąd dodawania: ' + error.message);
    } else {
      // Czyści pola formularza
      newName = '';
      newDescription = '';
      newPrice = '';
      // Odświeża dane na stronie
      invalidateAll();
    }
  }

  // 2. FUNKCJA USUWANIA PRODUKTU
  /** @param {number} productId */
  async function deleteProduct(productId) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId); // Usuwa produkt, którego id zgadza się z tym klikniętym

    if (error) {
      alert('Błąd usuwania: ' + error.message);
    } else {
      // Odświeża dane na stronie po usunięciu
      invalidateAll();
    }
  }
</script>

<h1>Witaj w naszym Sklepie Internetowym! 🛒</h1>

<div class="admin-panel">
  <h3>🛠️ Szybkie dodawanie produktu</h3>
  <input type="text" bind:value={newName} placeholder="Nazwa produktu" />
  <input type="text" bind:value={newDescription} placeholder="Krótki opis" />
  <input type="number" bind:value={newPrice} placeholder="Cena (np. 99.99)" />
  <input type="text" bind:value={newImageUrl} placeholder="Link do zdjęcia (URL)" />
  <select bind:value={newCategory}>
    <option value="">Wybierz gatunek...</option>
    <option value="RPG">RPG</option>
    <option value="FPS">FPS / Strzelanka</option>
    <option value="Strategia">Strategia</option>
    <option value="Symulator">Symulator</option>
    <option value="Horror">Horror</option>
    <option value="Sportowa">Sportowa</option>
  </select>
  <button class="add-btn" onclick={addProduct}>Dodaj do bazy</button>
</div>

<div class="products-grid">
  {#each data.products as product (product.id)}
    <div class="product-card">
      <img src={product.image_url} alt={product.name} />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      {#if product.category}
    <span class="category-tag">{product.category}</span>
  {/if}
      <div class="price">{product.price} zł</div>
      
      <button class="buy-btn">Dodaj do koszyka</button>
      <button class="delete-btn" onclick={() => deleteProduct(product.id)}>Usuń z bazy 🗑️</button>
    </div>
  {:else}
    <p>Brak produktów w sklepie. Półki są puste!</p>
  {/each}
</div>

<style>
  /* CSS dla nowego panelu i przycisków */
  .admin-panel {
    background-color: #f7fafc;
    border: 2px dashed #cbd5e0;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .admin-panel input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .add-btn {
    background-color: #48bb78;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .add-btn:hover { background-color: #38a169; }

  .products-grid {
    display: grid;
    /* Automatycznie dopasowuje kolumny */
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .product-card img {
    width: 90%;
    height: 300px;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  

 .price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2c7a7b;
    margin-bottom: 10px;
    margin-top: auto;
  }

  .buy-btn {
    width: 100%;
    padding: 10px;
    background-color: #3182ce;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 5px;
  }
  .buy-btn:hover { background-color: #2b6cb0; }

  .delete-btn {
    width: 100%;
    padding: 10px;
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .delete-btn:hover { background-color: #c53030; }
  .category-tag {
    background-color: #4a5568;
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
    padding: 4px 8px;
    border-radius: 6px;
    align-self: flex-start;
    margin-bottom: 10px;
    text-transform: uppercase;
  }
  

  .admin-panel select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: rgb(233, 228, 228);
  }
</style>