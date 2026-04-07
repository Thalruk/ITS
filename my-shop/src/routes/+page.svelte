<script>
  import { invalidateAll } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';

  let { data } = $props();
  const products = $derived(data?.products ?? []);
  const departments = [
    {
      id: 'pc',
      name: 'Gry komputerowe',
      slug: 'gry-komputerowe',
      categories: ['Gry akcji', 'RPG', 'Strategiczne', 'Symulatory', 'MMO', 'Indie']
    },
    {
      id: 'console',
      name: 'Gry konsolowe',
      slug: 'gry-konsolowe',
      categories: ['PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch', 'Przygodowe', 'Sportowe', 'Wyscigowe']
    },
    {
      id: 'board',
      name: 'Gry planszowe',
      slug: 'gry-planszowe',
      categories: ['Rodzinne', 'Strategiczne', 'Karciane', 'Ekonomiczne', 'Imprezowe', 'Kooperacyjne']
    },
    {
      id: 'cards',
      name: 'Gry karciane',
      slug: 'gry-karciane',
      categories: ['Kolekcjonerskie', 'Fantasy', 'Dla 2 osob', 'Turniejowe', 'Starter sety', 'Akcesoria']
    }
  ];
  let activeDepartmentId = $state('pc');
  const activeDepartment = $derived(
    departments.find((department) => department.id === activeDepartmentId) ?? departments[0]
  );

  let newName = $state('');
  let newDescription = $state('');
  let newPrice = $state('');
  let newImageUrl = $state('');

  async function addProduct() {
    if (!newName || !newPrice) {
      alert('Wpisz chociaz nazwe i cene!');
      return;
    }

    const { error } = await supabase.from('products').insert([
      {
        name: newName,
        description: newDescription,
        price: parseFloat(newPrice),
        image_url: newImageUrl || 'https://via.placeholder.com/150'
      }
    ]);

    if (error) {
      alert('Blad dodawania: ' + error.message);
      return;
    }

    newName = '';
    newDescription = '';
    newPrice = '';
    newImageUrl = '';
    invalidateAll();
  }

  /** @param {number} productId */
  async function deleteProduct(productId) {
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      alert('Blad usuwania: ' + error.message);
      return;
    }

    invalidateAll();
  }
</script>

<h1>Witaj w naszym sklepie internetowym!</h1>

<details class="categories-menu">
  <summary class="categories-trigger">
    <span>Kategorie</span>
    <span class="trigger-arrow">^</span>
  </summary>

  <div class="categories-dropdown">
    <div class="departments-list">
      {#each departments as department}
        <a
          href={`/dzial/${department.slug}`}
          class="department-button"
          class:active={department.id === activeDepartmentId}
          onmouseenter={() => (activeDepartmentId = department.id)}
          onfocus={() => (activeDepartmentId = department.id)}
        >
          {department.name}
        </a>
      {/each}
    </div>

    <div class="departments-content">
      <section class="department-panel">
        <h3>{activeDepartment.name}</h3>
        <div class="details-grid">
          {#each activeDepartment.categories as category}
            <a href={`/kategoria/${category.toLowerCase().replaceAll(' ', '-')}`} class="category-link">
              {category}
            </a>
          {/each}
        </div>
      </section>
    </div>
  </div>
</details>

<div class="admin-panel">
  <h3>Szybkie dodawanie produktu</h3>
  <input type="text" bind:value={newName} placeholder="Nazwa produktu" />
  <input type="text" bind:value={newDescription} placeholder="Krotki opis" />
  <input type="number" bind:value={newPrice} placeholder="Cena (np. 99.99)" />
  <input type="text" bind:value={newImageUrl} placeholder="Link do zdjecia (URL)" />
  <button class="add-btn" onclick={addProduct}>Dodaj do bazy</button>
</div>

<div class="products-grid">
  {#each products as product (product.id)}
    <div class="product-card">
      <img src={product.image_url} alt={product.name} />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <div class="price">{product.price} zl</div>

      <button class="buy-btn">Dodaj do koszyka</button>
      <button class="delete-btn" onclick={() => deleteProduct(product.id)}>Usun z bazy</button>
    </div>
  {:else}
    <p>Brak produktow w sklepie. Polki sa puste!</p>
  {/each}
</div>

<style>
  .categories-menu {
    position: relative;
    margin-bottom: 24px;
  }

  .categories-trigger {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 14px 22px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background-color: #ffffff;
    color: #111827;
    cursor: pointer;
    font-size: 1.25rem;
    font-weight: 700;
    list-style: none;
  }

  .categories-trigger::-webkit-details-marker {
    display: none;
  }

  .trigger-arrow {
    display: inline-block;
    transform: rotate(180deg);
    transition: transform 0.2s ease;
  }

  .categories-menu[open] .trigger-arrow {
    transform: rotate(0deg);
  }

  .categories-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 20;
    width: min(1000px, 100%);
    display: grid;
    grid-template-columns: 260px 1fr;
    background-color: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.15);
    overflow: hidden;
  }

  .departments-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    background-color: #f8fafc;
    border-right: 1px solid #e5e7eb;
  }

  .department-button {
    display: block;
    text-align: left;
    padding: 12px 14px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #1f2937;
    cursor: pointer;
    text-decoration: none;
  }

  .department-button.active,
  .department-button:hover,
  .department-button:focus-visible {
    background-color: #e6fffb;
    color: #0f766e;
    outline: none;
  }

  .departments-content {
    padding: 24px;
  }

  .department-panel h3 {
    margin: 0 0 18px;
    font-size: 1.6rem;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(140px, 1fr));
    gap: 14px 24px;
  }

  .category-link {
    text-align: left;
    display: block;
    padding: 0;
    color: #111827;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;
  }

  .category-link:hover {
    color: #0f766e;
  }

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

  .add-btn:hover {
    background-color: #38a169;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .product-card img {
    width: 100%;
    height: 180px;
    object-fit: contain;
    background-color: #1a202c;
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

  .buy-btn:hover {
    background-color: #2b6cb0;
  }

  .delete-btn {
    width: 100%;
    padding: 10px;
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .delete-btn:hover {
    background-color: #c53030;
  }

  @media (max-width: 900px) {
    .categories-dropdown {
      position: static;
      width: 100%;
      grid-template-columns: 1fr;
      margin-top: 8px;
    }

    .departments-list {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
    }

    .details-grid {
      grid-template-columns: repeat(2, minmax(140px, 1fr));
    }
  }

  @media (max-width: 640px) {
    .categories-trigger {
      width: 100%;
      justify-content: space-between;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
