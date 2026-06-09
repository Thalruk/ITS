<script>
    import './page.css'; 

    /** @type {{ data: any }} */
    let { data } = $props();

    // FILTROWANIE SYSTEMOWE NA BAZIE DANYCH Z SUPABASE
    let newGames = $derived(data.products?.filter((/** @type {any} */ p) => p.is_new === true) || []);
    let promoGames = $derived(data.products?.filter((/** @type {any} */ p) => p.promo_price > 0 && p.promo_price < p.price) || []);
    let usedGames = $derived(data.products?.filter((/** @type {any} */ p) => p.is_used === true) || []);

    /** * Funkcja gwarantująca, że pasek zawsze będzie miał dokładnie 20 kafelków.
     * Dzięki temu szerokość każdego paska jest identyczna, a prędkość stała!
     * @param {any[]} gamesArray
     */
    function prepareMarqueeItems(gamesArray) {
        if (!gamesArray || gamesArray.length === 0) return [];
        
        let result = [...gamesArray];
        while (result.length < 20) {
            result = [...result, ...gamesArray];
        }
        return result.slice(0, 20);
    }

    /** @param {string} imageFileName */
    function getAbsoluteTexturePath(imageFileName) {
        if (!imageFileName) return 'https://twojsklep.pl/assets/textures/games/placeholder-cover.jpg';
        if (imageFileName.startsWith('http://') || imageFileName.startsWith('https://')) return imageFileName;
        return `https://twojsklep.pl/assets/textures/games/${imageFileName}`;
    }
</script>

<div class="home-container">
    
    <section class="hero" style="background-image: linear-gradient(to right, rgba(15, 15, 20, 0.95), rgba(15, 15, 20, 0.4)), url('/assets/background.jpg');">
        <div class="hero-content">
            <span class="badge" style="width: auto;">Najlepsze uniwersa</span>
            <h1>GamerShop Pro </h1>
            <p>Witaj w sercu cyfrowej rozgrywki. Przeglądaj unikalne zestawienia nowości, gier używanych oraz niesamowitych wyprzedaży cenowych.</p>
            <div class="hero-actions">
                <a href="/gry" class="cta-button primary">Otwórz Pełny Katalog</a>
            </div>
        </div>
    </section>

    <div class="sliders-section">
        
        <section class="game-slider-row">
            <h2>🔥 Najnowsze premiery</h2>
            {#if newGames.length === 0}
                <p class="empty-info">Brak gier oznaczonych jako Nowość.</p>
            {:else}
                <div class="marquee-container">
                    <div class="marquee-track">
                        {#each prepareMarqueeItems(newGames) as game}
                            <a href="/gry" class="slider-card">
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
                                <img src={getAbsoluteTexturePath(game.image_url)} alt={game.name} />
                                <h4>{game.name}</h4>
                                <div class="price-section">
                                    {#if game.promo_price > 0 && game.promo_price < game.price}
                                        <span class="price-tag old-price">{game.price} zł</span>
                                        <span class="price-tag new-price">{game.promo_price} zł</span>
                                    {:else}
                                        <span class="price-tag">{game.price} zł</span>
                                    {/if}
                                </div>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </section>

        <section class="game-slider-row">
            <h2>⚡ Wyjątkowe promocje i okazje</h2>
            {#if promoGames.length === 0}
                <p class="empty-info">Brak gier w promocji.</p>
            {:else}
                <div class="marquee-container">
                    <div class="marquee-track">
                        {#each prepareMarqueeItems(promoGames) as game}
                            <a href="/gry" class="slider-card sale">
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
                                <img src={getAbsoluteTexturePath(game.image_url)} alt={game.name} />
                                <h4>{game.name}</h4>
                                <div class="price-section">
                                    <span class="price-tag old-price">{game.price} zł</span>
                                    <span class="price-tag new-price">{game.promo_price} zł</span>
                                </div>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </section>

        <section class="game-slider-row">
            <h2>💿 Drugi obieg - Gry Używane</h2>
            {#if usedGames.length === 0}
                <p class="empty-info">Brak używanych tytułów na stanie.</p>
            {:else}
                <div class="marquee-container">
                    <div class="marquee-track">
                        {#each prepareMarqueeItems(usedGames) as game}
                            <a href="/gry" class="slider-card used">
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
                                <img src={getAbsoluteTexturePath(game.image_url)} alt={game.name} />
                                <h4>{game.name}</h4>
                                <div class="price-section">
                                    {#if game.promo_price > 0 && game.promo_price < game.price}
                                        <span class="price-tag old-price">{game.price} zł</span>
                                        <span class="price-tag new-price">{game.promo_price} zł</span>
                                    {:else}
                                        <span class="price-tag">{game.price} zł</span>
                                    {/if}
                                </div>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </section>

    </div>
</div>

<style>
    .home-container { width: 100%; overflow: hidden; }
    .hero { background-size: cover; background-position: center; padding: 10rem 2rem 8rem 2rem; min-height: 60vh; display: flex; align-items: center; }
    .hero-content { max-width: 800px; margin: 0 auto 0 5%; }
    
    .hero-content h1 { font-size: 4.5rem; font-weight: 900; margin: 0 0 1rem 0; text-transform: uppercase; }
    .hero-content p { font-size: 1.2rem; margin-bottom: 2.5rem; color: #b3b3b3; line-height: 1.6; }
    .cta-button { padding: 1rem 2.5rem; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 1.1rem; text-transform: uppercase; display: inline-block; background-color: #00ffcc; color: #0f0f14; }
    .cta-button:hover { background-color: #00ccaa; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0, 255, 204, 0.4); }

    .sliders-section { padding: 4rem 0; display: flex; flex-direction: column; gap: 5rem; }
    .game-slider-row h2 { font-size: 1.8rem; color: #ffffff; margin-top: 0; margin-bottom: 1.5rem; border-left: 4px solid #00ffcc; padding-left: 15px; margin-left: 2rem; text-transform: uppercase; }
    
    .marquee-container { width: 100%; overflow: hidden; position: relative; }
    .marquee-container::before, .marquee-container::after { content: ""; position: absolute; top: 0; width: 100px; height: 100%; z-index: 2; pointer-events: none; }
    .marquee-container::before { left: 0; background: linear-gradient(to right, #0f0f14, transparent); }
    .marquee-container::after { right: 0; background: linear-gradient(to left, #0f0f14, transparent); }

    .marquee-track { 
        display: flex; 
        gap: 20px; 
        width: max-content; 
        animation: scroll 35s linear infinite; 
        padding: 10px 0; 
    }    
    .marquee-track:hover { animation-play-state: paused; }

    @keyframes scroll {
        0% { transform: translateX(calc(-50% - 10px)); }
        100% { transform: translateX(0); }
    }
    
    .slider-card { 
        flex: 0 0 220px; 
        width: 220px;    
        box-sizing: border-box; 
        background-color: #1a1a24; 
        border: 1px solid #2a2a35; 
        padding: 15px; 
        border-radius: 8px; 
        text-decoration: none; 
        color: white; 
        display: flex; 
        flex-direction: column; 
        position: relative; 
        transition: transform 0.2s, border-color 0.2s; 
        cursor: pointer; 
        overflow: hidden; 
    }
    
    .slider-card:hover { transform: translateY(-5px); border-color: #00ffcc; }
    
    .slider-card img { 
        width: 100%; 
        height: 200px; 
        object-fit: contain; 
        background: #14141d; 
        border-radius: 4px; 
        margin-bottom: 10px; 
    }
    
    /* STYLE DLA NOWYCH, ZUNIFIKOWANYCH ETYKIET */
    .badges { position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 5px; z-index: 10; }
    .badge { font-size: 0.7rem; font-weight: bold; padding: 4px 6px; border-radius: 4px; color: white; letter-spacing: 0.5px; width: max-content; text-transform: uppercase; }
    .badge.sale { background-color: #ff3366; }
    .badge.new { background-color: #48bb78; }
    .badge.used { background-color: #3182ce; }
    
    .slider-card h4 { 
        margin: 0 0 10px 0; 
        font-size: 1.1rem; 
        font-weight: 600; 
        white-space: nowrap; 
        overflow: hidden; 
        text-overflow: ellipsis; 
    }
    
    .price-section {
        margin-top: auto; 
        display: flex;
        align-items: baseline;
        gap: 8px;
    }
    
    .price-tag { font-weight: bold; color: #00ffcc; font-size: 1.2rem; }
    
    .old-price { text-decoration: line-through; color: #666; font-size: 0.95rem; font-weight: normal; }
    .new-price { color: #ff3366; }
    .empty-info { color: #4a5568; font-style: italic; margin-left: 2rem; }
</style>