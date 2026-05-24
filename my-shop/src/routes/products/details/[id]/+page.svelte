<script>
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';

    // 1. ODBIERAMY DANE Z BAZY (Dostarczone przez plik +page.js)
    let { data } = $props();
    let product = data.product; 

    // 2. LOGIKA KOSZYKA I KONTA
    let currentUser = $state(null);
    let cartCount = $state(0);

    onMount(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        currentUser = session?.user || null;
        if (currentUser) loadCartCount();
    });

    async function loadCartCount() {
        const { data: c } = await supabase
            .from('cart_items')
            .select('id')
            .eq('user_id', currentUser.id);
        cartCount = c?.length || 0;
    }

    async function addToCart() {
        if (!product) return;
        if (!currentUser) return alert('Musisz być zalogowany jako klient, aby kupować!');
        if (currentUser.email === 'admin@sklep.pl') return alert('Admin nie robi zakupów!');

        const { error } = await supabase
            .from('cart_items')
            .insert({ user_id: currentUser.id, product_id: product.id });
            
        if (error) {
            alert(error.code === '23505' ? 'Gra jest już w koszyku!' : error.message);
        } else {
            cartCount += 1;
            alert(`Dodano do koszyka: ${product.name}!`);
        }
    }

    // 3. FUNKCJA OBRAZKÓW (Zapożyczona ze strony głównej)
    function getAbsoluteTexturePath(imageFileName) {
        if (!imageFileName) return 'https://twojsklep.pl/assets/textures/games/placeholder-cover.jpg';
        if (imageFileName.startsWith('http://') || imageFileName.startsWith('https://')) return imageFileName;
        return `https://twojsklep.pl/assets/textures/games/${imageFileName}`;
    }
</script>

<div class="page-wrapper">
    <header class="navbar">
        <div class="container nav-content">
            <div class="logo">GamerShop <span>Pro</span></div>
            <div class="cart-section">
                <div class="cart-icon">
                    🛒 <span class="cart-badge">{cartCount}</span>
                </div>
            </div>
        </div>
    </header>

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
                        
                        <button class="cta-button primary" onclick={addToCart}>KUP TERAZ</button>
                        
                        <p class="stock">✅ Dostępne - natychmiasta na e-mail</p>
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
            </section>
        {:else}
            <div class="error-view">
                <h1>Błąd 404</h1>
                <p>Ojej! Nie znaleziono gry o podanym ID w naszej bazie danych.</p>
                <a href="/" class="cta-button primary">Wróć na stronę główną</a>
            </div>
        {/if}
    </main>

    <footer class="main-footer">
        <div class="container footer-grid">
            <div class="footer-col">
                <h4>O sklepie</h4>
                <ul><li>Regulamin sklepu</li><li>Polityka prywatności</li><li>Kontakt</li></ul>
            </div>
            <div class="footer-col">
                <h4>Wsparcie</h4>
                <ul><li>FAQ</li><li>Reklamacje i zwroty</li><li>Jak aktywować gry?</li></ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 GamerShop Pro - Cyfrowa rozgrywka. Wszelkie prawa zastrzeżone.</p>
        </div>
    </footer>
</div>

<style>
    /* BAZA ZGODNA ZE STRONĄ GŁÓWNĄ */
    :global(body) { 
        margin: 0; 
        padding: 0; 
        background-color: #0f0f14; /* Zmieniono z #0b0b0f na tło ze strony głównej */
        color: #ffffff; 
        font-family: 'Inter', sans-serif; 
    }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .main-content { padding-top: 40px; }

    /* NAVBAR */
    .navbar { 
        height: 80px; 
        background: rgba(15, 15, 20, 0.95); 
        border-bottom: 1px solid #2a2a35; 
        position: sticky; 
        top: 0; 
        z-index: 100; 
        display: flex; 
        align-items: center; 
    }
    .nav-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    
    /* LOGO ZGODNE Z MOTYWEM */
    .logo { font-size: 1.8rem; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
    .logo span { color: #00ffcc; } /* Zmieniono na akcent cyan */
    
    .cart-badge { 
        background: #00ffcc; 
        color: #0f0f14; 
        font-weight: bold;
        padding: 2px 6px; 
        border-radius: 4px; 
        font-size: 0.8rem; 
    }

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

    /* KARTA ZAKUPU ZGODNA Z UI */
    .buy-card { background: #1a1a24; padding: 30px; border-radius: 8px; border: 1px solid #2a2a35; }
    .price-row { margin-bottom: 25px; }
    .price-stack { display: flex; flex-direction: column; }
    
    .old-price { text-decoration: line-through; color: #666; font-size: 1.2rem; margin-bottom: 5px; }
    .current { font-size: 3rem; font-weight: 900; color: #00ffcc; line-height: 1; margin-bottom: 8px; }
    .current.promo-color { color: #ff3366; } /* Jeśli promocja, zmień na różowy z motywu */
    
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
        border-left: 4px solid #00ffcc; /* Kreska z motywu strony głównej */
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
    .activation-steps strong { color: #00ffcc; } /* Oznaczanie platformy kolorem cyjanu */

    /* BŁĄD 404 */
    .error-view { text-align: center; padding: 100px 0; color: #ff3366; }
    .error-view .cta-button { width: auto; margin-top: 30px; }

    /* FOOTER (Ciemniejszy od kart) */
    .main-footer { background: #0f0f14; padding: 60px 0 20px 0; border-top: 1px solid #2a2a35; }
    .footer-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-bottom: 40px; }
    .footer-col h4 { text-transform: uppercase; border-left: 3px solid #00ffcc; padding-left: 10px; margin-bottom: 20px; }
    .footer-col ul { list-style: none; padding: 0; margin: 0; }
    .footer-col li { color: #b3b3b3; margin-bottom: 10px; cursor: pointer; transition: color 0.2s; }
    .footer-col li:hover { color: #00ffcc; }
    .footer-bottom { text-align: center; border-top: 1px solid #1a1a24; padding-top: 20px; color: #666; font-size: 0.8rem; }

    /* Responsywność */
    @media (max-width: 768px) {
        .product-hero { grid-template-columns: 1fr; gap: 30px; }
        .req-grid { grid-template-columns: 1fr; }
        h1 { font-size: 2.5rem; }
    }
</style>