<script>
    import ProductReviews from '$lib/components/ProductReviews.svelte';
	import { resolve } from '$app/paths';
	import { loadCartGlobal } from '$lib/store.svelte.js';
	import { addToCart } from '$lib/services/cart.js';

	let { data } = $props();

	let product = $derived(data.product);
	let currentUser = $derived(data.user || null);
	let isAdmin = $derived(data.user?.role?.toLowerCase() === 'admin');
    let quantity = $state(1);

	async function handleAddToCart() {
		if (!product) return;

		const result = await addToCart(
            product,
            currentUser?.id,
            isAdmin,
            [],
            quantity
        );

		if (result?.error) {
			alert('Błąd dodawania do koszyka: ' + result.error.message);
			return;
		}

		if (result) {
			alert(`Dodano do koszyka: ${product.name}!`);
			loadCartGlobal();
		}
	}

	/** @param {string} imageFileName */
	function getAbsoluteTexturePath(imageFileName) {
		if (!imageFileName) return 'https://twojsklep.pl/assets/textures/games/placeholder-cover.jpg';
		if (imageFileName.startsWith('http://') || imageFileName.startsWith('https://')) return imageFileName;
		return `https://twojsklep.pl/assets/textures/games/${imageFileName}`;
	}
</script>

<div class="page-wrapper">
    <main class="container main-content">
        {#if product}
            <section class="product-hero">
                <div class="image-gallery">
                    <div class="image-wrapper">
                        <div class="status-badges">
                            {#if product.promo_price > 0 && product.promo_price < product.price}
                                <span class="status-badge sale">PROMO</span>
                            {/if}
                            {#if product.is_new}
                                <span class="status-badge new">NOWOŚĆ</span>
                            {/if}
                            {#if product.is_used}
                                <span class="status-badge used">UŻYWANA</span>
                            {/if}
                        </div>
                        <img src={getAbsoluteTexturePath(product.image_url)} alt={product.name} class="main-img" />
                    </div>
                </div>

                <div class="product-main-info">
                    <h1>{product.name}</h1>
                    
                    <div class="quick-meta">
                        <span class="tag">🎮 {product.category || 'Gra'}</span>
                        <span class="tag">💻 {product.platform || 'Brak platformy'}</span>
                        <span class="tag">🌍 {product.region || 'Global'}</span>
                        <span class="tag stock-tag">📦 Dostępne sztuki: {product.stock_quantity}</span>
                    </div>

                    <div class="buy-card">
                        <div class="price-row">
                            <div class="price-stack">
                                {#if product.promo_price > 0 && product.promo_price < product.price}
                                    <span class="old-price">{product.price} zł</span>
                                    <span class="current promo-color">{product.promo_price} zł</span>
                                {:else}
                                    <span class="current">{product.price} zł</span>
                                {/if}
                                
                                {#if product.lowest_price_30d}
                                    <span class="omnibus">Najniższa cena z 30 dni: {product.lowest_price_30d} zł</span>
                                {/if}
                            </div>
                        </div>
                        
                        <div class="quantity-row">
                            <label for="product-quantity">Ilość:</label>
                            <input
                                id="product-quantity"
                                type="number"
                                min="1"
                                max={product.stock_quantity}
                                bind:value={quantity}
                                disabled={product.stock_quantity <= 0 || isAdmin || !currentUser}
                            />
                        </div>

                        <button
                            class="cta-button primary"
                            onclick={handleAddToCart}
                            disabled={product.stock_quantity <= 0 || isAdmin || !currentUser}
                        >
                            {product.stock_quantity > 0 ? 'KUP TERAZ' : 'BRAK W MAGAZYNIE'}
                        </button>
                        
                        <p class="stock">
                            {product.stock_quantity > 0
                                ? '✅ Dostępne - natychmiast na e-mail'
                                : '❌ Produkt chwilowo niedostępny'}
                        </p>
                    </div>
                </div>
            </section>

            <section class="stacked-details">
                <div class="detail-block">
                    <h2>Opis gry</h2>
                    <div class="content-box">
                        <p>{product.description || 'Brak opisu dla tej gry.'}</p>
                    </div>
                </div>

                <div class="detail-block">
                    <h2>Wymagania sprzętowe</h2>
                    <div class="content-box req-grid">
                        <div class="req-item"><strong>System:</strong> {product.req_os || 'Brak danych'}</div>
                        <div class="req-item"><strong>Procesor:</strong> {product.req_cpu || 'Brak danych'}</div>
                        <div class="req-item"><strong>Karta Graficzna:</strong> {product.req_gpu || 'Brak danych'}</div>
                        <div class="req-item"><strong>Pamięć RAM:</strong> {product.req_ram || 'Brak danych'}</div>
                    </div>
                </div>

                <div class="detail-block">
                    <h2>Instrukcja aktywacji</h2>
                    <div class="content-box">
                        <ol class="activation-steps">
                            <li>Zaloguj się do aplikacji <strong>{product.platform || 'odpowiedniej platformy'}</strong> na swoim komputerze.</li>
                            <li>Wybierz opcję dodania lub aktywacji nowej gry w swojej bibliotece.</li>
                            <li>Wybierz "Aktywuj produkt w serwisie <strong>{product.platform || 'wybranym'}</strong>".</li>
                            <li>Skopiuj i wklej otrzymany od nas na maila klucz cyfrowy.</li>
                            <li>Gra zostanie przypisana do Twojego konta. Ciesz się rozgrywką!</li>
                        </ol>
                    </div>
                </div>
                {#if product.id}
					<ProductReviews productId={product.id} />
				{/if}
            </section>
        {:else}
            <div class="error-view">
                <h1>Błąd 404</h1>
                <p>Ojej! Nie znaleziono gry o podanym ID w naszej bazie danych.</p>
                <a href={resolve('/')} class="cta-button primary">Wróć na stronę główną</a>
            </div>
        {/if}
    </main>
</div>

<style>
    /* BAZA ZGODNA ZE STRONĄ GŁÓWNĄ - Przywrócono Ciemne Tło */
    .page-wrapper {
        background-color: #0f0f14; /* Ciemny Cyberpunkowy mrok powrócił! */
        min-height: 100vh;         /* Upewniamy się, że tło wypełnia cały ekran */
        color: #ffffff; 
        font-family: 'Inter', sans-serif; 
    }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .main-content { padding-top: 40px; }

    /* HERO */
    .product-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; padding-bottom: 60px; }
    
    .image-wrapper { position: relative; }
    .main-img { 
        width: 100%; 
        max-width: 500px; 
        border-radius: 8px; 
        border: 1px solid #2a2a35;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
        object-fit: contain; 
        background: #14141d; 
    }

    /* BADGE ZGODNE ZE ZNACZNIKAMI GŁÓWNEJ */
    .status-badges { position: absolute; top: 15px; left: 15px; display: flex; flex-direction: column; gap: 8px; z-index: 10; }
    .status-badge { font-size: 0.8rem; font-weight: bold; padding: 6px 10px; border-radius: 4px; color: white; letter-spacing: 0.5px; width: max-content; text-transform: uppercase; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
    .status-badge.sale { background-color: #ff3366; }
    .status-badge.new { background-color: #48bb78; }
    .status-badge.used { background-color: #3182ce; }

    /* TYPOGRAFIA INFO */
    h1 { font-size: 3.5rem; margin: 0 0 20px 0; line-height: 1.1; font-weight: 900; text-transform: uppercase; }
    
    .quick-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; }
    .tag { padding: 6px 14px; border-radius: 4px; font-weight: 600; font-size: 0.9rem; background-color: #1a1a24; border: 1px solid #2a2a35; color: #b3b3b3;}

    .stock-tag { color: #48bb78; font-weight: 800; }

    /* KARTA ZAKUPU ZGODNA Z UI */
    .buy-card { background: #1a1a24; padding: 30px; border-radius: 8px; border: 1px solid #2a2a35; }
    .price-row { margin-bottom: 25px; }
    .price-stack { display: flex; flex-direction: column; }
    
    .old-price { text-decoration: line-through; color: #666; font-size: 1.2rem; margin-bottom: 5px; }
    .current { font-size: 3rem; font-weight: 900; color: #00ffcc; line-height: 1; margin-bottom: 8px; }
    .current.promo-color { color: #ff3366; }
    
    .omnibus { display: block; font-size: 0.85rem; color: #666; margin-top: 5px; }

    /* GŁÓWNY PRZYCISK UI */
    .cta-button { 
        width: 100%;
        padding: 1rem 2.5rem; 
        text-decoration: none; 
        border-radius: 4px; 
        border: none;
        font-weight: bold; 
        font-size: 1.2rem; 
        text-transform: uppercase; 
        display: inline-block; 
        background-color: #00ffcc; 
        color: #0f0f14; 
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s; 
    }
    .cta-button:hover { 
        background-color: #00ccaa; 
        transform: translateY(-2px); 
        box-shadow: 0 4px 15px rgba(0, 255, 204, 0.4); 
    }
    
    .stock { margin-top: 15px; color: #b3b3b3; font-size: 0.9rem; text-align: center; }

    /* SEKCJE SZCZEGÓŁÓW Z LINEARYZACJĄ TYTUŁÓW */
    .stacked-details { display: flex; flex-direction: column; gap: 40px; padding-bottom: 60px; }
    
    .detail-block h2 { 
        font-size: 1.8rem; 
        color: #ffffff; 
        margin-top: 0; 
        margin-bottom: 1.5rem; 
        border-left: 4px solid #00ffcc; /* Neonowa kreska z motywu strony głównej */
        padding-left: 15px; 
        text-transform: uppercase; 
    }
    
    .content-box { 
        background: #1a1a24; 
        padding: 30px; 
        border-radius: 8px; 
        border: 1px solid #2a2a35; 
        line-height: 1.8; 
        color: #b3b3b3; 
    }
    
    .req-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .req-item strong { color: #fff; }
    
    .activation-steps { margin: 0; padding-left: 20px; }
    .activation-steps li { margin-bottom: 15px; }
    .activation-steps strong { color: #00ffcc; } 

    /* BŁĄD 404 */
    .error-view { text-align: center; padding: 100px 0; color: #ff3366; }
    .error-view .cta-button { width: auto; margin-top: 30px; }

    /* Responsywność */
    @media (max-width: 768px) {
        .product-hero { grid-template-columns: 1fr; gap: 30px; }
        .req-grid { grid-template-columns: 1fr; }
        h1 { font-size: 2.5rem; }
    }

    .cta-button:disabled {
        background-color: #4a5568;
        color: #a0aec0;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .quantity-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 16px 0;
        color: #cbd5e0;
    }

    .quantity-row label {
        font-weight: 700;
    }

    .quantity-row input {
        width: 90px;
        background: #2d3748;
        color: #ffffff;
        border: 1px solid #4a5568;
        border-radius: 6px;
        padding: 10px;
        font-weight: 700;
    }

</style>