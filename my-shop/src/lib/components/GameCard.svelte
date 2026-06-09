<script>
    import { resolve } from '$app/paths';
    import { authStore } from '$lib/store.svelte.js';

    /**
     * @typedef {Object} GameCardProps
     * @property {any} game
     * @property {(product: any, qty: number) => void | Promise<void>} onAddToCart
     * @property {(product: any) => void | Promise<void>} [onToggleVisibility]
     * @property {(product: any) => void} [onEdit]
     * @property {(productId: number) => void | Promise<void>} [onDelete]
     * @property {(product: any) => void | Promise<void>} [onClone]
     * @property {boolean} [showAdminControls]
     */

    /** @type {GameCardProps} */
    let {
        game,
        onAddToCart,
        onToggleVisibility,
        onEdit,
        onDelete,
        onClone,
        showAdminControls = false
    } = $props();

    let quantity = $state(1);

    /** @param {string} imageFileName */
    function getAbsoluteTexturePath(imageFileName) {
        if (!imageFileName) return 'https://twojsklep.pl/assets/textures/games/placeholder-cover.jpg';
        if (imageFileName.startsWith('http://') || imageFileName.startsWith('https://')) return imageFileName;
        return `https://twojsklep.pl/assets/textures/games/${imageFileName}`;
    }
</script>

<div class="card" class:hidden={game.is_hidden} class:empty-stock={game.stock_quantity === 0}>
    
    <div class="image-container">
        <div class="badges">
            {#if game.promo_price > 0 && game.promo_price < game.price}
                <span class="badge sale">PROMO</span>
            {/if}
            
            {#if game.is_new}
                <span class="badge new">NOWOŚĆ</span>
            {/if}
            
            {#if game.is_used}
                <span class="badge used">UŻYWANA</span>
            {/if}
        </div>
        <a
            href={resolve('/products/details/[id]', { id: String(game.id) })}
            class="image-link"
            aria-label={`Zobacz szczegóły gry ${game.name}`}
        >
            <img src={getAbsoluteTexturePath(game.image_url)} alt={game.name} />
        </a>
    </div>
    
    <div class="title-row">
        <a href={resolve('/products/details/[id]', { id: String(game.id) })} class="title-link">
            <h3>{game.name}</h3>
        </a>
        {#if game.categories?.name || game.category}
            <span class="category-tag">{game.categories?.name || game.category}</span>
        {/if}
    </div>
    
    <p class="desc">{game.description}</p>
    
    <div class="price-section">
        {#if game.promo_price > 0 && game.promo_price < game.price}
            <p class="price old-price">{game.price} zł</p>
            <p class="price promo-price">{game.promo_price} zł</p>
        {:else}
            <p class="price standard-price">{game.price} zł</p>
        {/if}
    </div>
    
    <p class="stock">Dostępnych sztuk: <strong>{game.stock_quantity}</strong></p>

    {#if !authStore.isAdmin}
        {#if game.is_hidden}
            <button class="buy-btn out-of-stock" disabled>Produkt ukryty</button>
        {:else if game.stock_quantity > 0}
            <div class="buy-section">
                <input type="number" min="1" max={game.stock_quantity} bind:value={quantity} class="qty-input" />
                <button class="buy-btn" onclick={() => onAddToCart(game, quantity)}>Do koszyka</button>
            </div>
        {:else}
            <button class="buy-btn out-of-stock" disabled>Brak w magazynie</button>
        {/if}
    {/if}
    
    {#if authStore.isAdmin && showAdminControls}
        <div class="admin-controls">
            <button class="toggle-btn" class:restore={game.is_hidden} onclick={() => onToggleVisibility?.(game)}>
                {game.is_hidden ? 'Przywróć widoczność' : 'Ukryj przed klientami'}
            </button>

            <div class="action-buttons-row">
                <button class="edit-btn" onclick={() => onEdit?.(game)}>Edytuj ✏️</button>
                <button class="clone-btn" onclick={() => onClone?.(game)}>Klonuj 🗐</button>
            </div>

            <button class="del-btn" onclick={() => onDelete?.(game.id)}>
                Usuń z bazy 🗑️
            </button>
        </div>
    {/if}
</div>

<style>
    .card { background: #1f1f1f; padding: 15px; border-radius: 8px; display: flex; flex-direction: column; border: 1px solid #2d3748; position: relative; }
    .card.hidden img, .card.hidden h3, .card.hidden .desc, .card.hidden .price-section, .card.hidden .stock, .card.hidden .category-tag, .card.hidden .badges,
    .card.empty-stock img, .card.empty-stock h3, .card.empty-stock .desc, .card.empty-stock .price-section, .card.empty-stock .stock, .card.empty-stock .category-tag, .card.empty-stock .badges { opacity: 0.4; filter: grayscale(1); }
    
    .image-container { position: relative; width: 100%; }
    
    .card img { 
        width: 100%; 
        height: 160px; 
        object-fit: contain; 
        background: #1a202c; 
        border-radius: 4px; 
        margin-bottom: 15px;
        transition: transform 0.2s ease-in-out; 
    }
    
    /* Elastyczny kontener układający odznaki jedna pod drugą w zgrabny stos */
    .badges { position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 5px; z-index: 10; }
    .badge { font-size: 0.7rem; font-weight: bold; padding: 4px 6px; border-radius: 4px; color: white; letter-spacing: 0.5px; width: max-content; text-transform: uppercase; }
    .badge.sale { background-color: #ff3366; }
    .badge.new { background-color: #48bb78; }
    .badge.used { background-color: #3182ce; }

    .title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
    .title-row h3 { margin: 0; font-size: 1.15rem; }
    .category-tag { background: #dad5d5; color: black; font-size: 0.7rem; font-weight: bold; padding: 4px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .desc { font-size: 0.85rem; color: #a0aec0; margin-bottom: 10px; flex-grow: 1; }
    
    .price-section { display: flex; align-items: baseline; gap: 10px; margin-top: auto; margin-bottom: 5px; }
    .price { margin: 0; }
    .standard-price { font-size: 1.25rem; font-weight: bold; color: #48bb78; }
    .old-price { font-size: 0.95rem; text-decoration: line-through; color: #718096; font-weight: normal; }
    .promo-price { font-size: 1.35rem; font-weight: bold; color: #ff3366; text-shadow: 0 0 8px rgba(255, 51, 102, 0.3); }
    
    .stock { margin-bottom: 15px; font-size: 0.9rem; color: #cbd5e0; }
    .buy-section { display: flex; gap: 10px; }
    .qty-input { width: 60px; padding: 10px; border-radius: 8px; border: 1px solid #4a5568; background: #2d3748; color: white; text-align: center; font-weight: bold; font-size: 1rem; }
    .buy-btn { background: linear-gradient(135deg, #3182ce, #2b6cb0); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; flex: 1; box-shadow: 0 4px 6px rgba(49, 130, 206, 0.25); transition: all 0.2s ease-in-out; text-transform: uppercase; letter-spacing: 0.5px; }
    .buy-btn:hover { background: linear-gradient(135deg, #2b6cb0, #2c5282); transform: translateY(-2px); box-shadow: 0 6px 8px rgba(49, 130, 206, 0.4); }
    .buy-btn.out-of-stock { background: #2d3748; color: #718096; box-shadow: none; cursor: not-allowed; border: 1px dashed #4a5568; text-transform: none; }
    
    .admin-controls { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; border-top: 1px solid #333; padding-top: 10px; }
    .action-buttons-row { display: flex; gap: 5px; }
    .toggle-btn { background: none; border: 1px solid #a0aec0; color: #a0aec0; cursor: pointer; padding: 6px; width: 100%; border-radius: 4px; font-size: 0.8rem; }
    .toggle-btn.restore { background: #48bb78; color: white; border: none; font-weight: bold; }
    .edit-btn { background: #d69e2e; color: black; font-weight: bold; border: none; padding: 6px; border-radius: 4px; cursor: pointer; flex: 1; font-size: 0.8rem; }
    .edit-btn:hover { background: #b7791f; }
    .clone-btn { background: #3182ce; color: white; font-weight: bold; border: none; padding: 6px; border-radius: 4px; cursor: pointer; flex: 1; font-size: 0.8rem; }
    .clone-btn:hover { background: #2b6cb0; }
    .del-btn { background: #e53e3e; color: white; font-weight: bold; border: none; padding: 6px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 0.8rem; }
    .del-btn:hover { background: #c53030; }
    .image-link,
    .title-link { color: inherit; text-decoration: none; }
    .image-link { display: block; }
    .image-link:hover img { transform: scale(1.02); }
    .title-link:hover { color: #00ffcc; }

</style>