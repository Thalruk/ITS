<script>
    // 1. DANE (Svelte 5 Props)
    let { 
        product = {
            title: "Cyberpunk 2077",
            type: "Klucz cyfrowy",
            platform: "Steam",
            region: "Global 🌍",
            rating: 4.8,
            reviewsCount: 3120,
            originalPrice: 199.99,
            price: 99.99,
            discount: "-50%",
            description: "Witaj w Night City! Zdobądź swój klucz i rozpocznij przygodę w najbardziej mrocznym mieście przyszłości. Przemierzaj ogromny otwarty świat, modyfikuj swoje ciało i zadecyduj o losach metropolii.",
            imageUrl: "https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg",
            requirements: {
                os: "Windows 10 64-bit",
                cpu: "Core i7-6700 / Ryzen 5 1600",
                ram: "12 GB RAM",
                gpu: "GTX 1060 6GB / Radeon RX 580 8GB",
                storage: "70 GB SSD"
            }
        } 
    } = $props();

    // 2. LOGIKA (Svelte 5 State)
    let activeTab = $state('description');
    let cartCount = $state(0);

    function addToCart() {
        cartCount += 1;
    }
</script>

<div class="page-wrapper">
    
    <header class="navbar">
        <div class="container nav-content">
            <div class="logo">SKLEP<span>INTERNETOWY</span></div>
            
            <nav class="categories">
                <a href="#action">Akcja</a>
                <a href="#rpg">RPG</a>
                <a href="#strategy">Strategie</a>
                <a href="#indie">Indie</a>
            </nav>

            <div class="cart-section">
                <div class="cart-icon">
                    🛒 <span class="badge">{cartCount}</span>
                </div>
            </div>
        </div>
    </header>

    <main class="container">
        <section class="product-hero">
            <div class="image-gallery">
                <img src={product.imageUrl} alt={product.title} class="main-img" />
                <div class="thumbnails">
                    <div class="thumb"></div>
                    <div class="thumb"></div>
                    <div class="thumb"></div>
                </div>
            </div>

            <div class="product-main-info">
                <div class="breadcrumb">Sklep > Gry RPG > {product.title}</div>
                <h1>{product.title}</h1>
                
                <div class="quick-meta">
                    <span>⭐ {product.rating}</span>
                    <span>{product.platform}</span>
                    <span>{product.region}</span>
                </div>

                <div class="buy-card">
                    <div class="price-row">
                        <span class="discount">{product.discount}</span>
                        <div class="price-stack">
                            <span class="old">{product.originalPrice} zł</span>
                            <span class="current">{product.price} zł</span>
                        </div>
                    </div>
                    <button class="cta-btn" onclick={addToCart}>KUP TERAZ</button>
                    <p class="stock">✅ W magazynie - natychmiasta wysyłka</p>
                </div>

                <div class="features-list">
                    <div class="feat">🛡️ Gwarancja legalności</div>
                    <div class="feat">⚡ Aktywacja w 2 minuty</div>
                    <div class="feat">📧 Klucz na e-mail</div>
                </div>
            </div>
        </section>

        <section class="details-tabs">
            <div class="tab-header">
                <button class:active={activeTab === 'description'} onclick={() => activeTab = 'description'}>Opis</button>
                <button class:active={activeTab === 'requirements'} onclick={() => activeTab = 'requirements'}>Wymagania</button>
                <button class:active={activeTab === 'activation'} onclick={() => activeTab = 'activation'}>Instrukcja aktywacji</button>
            </div>

            <div class="tab-body">
                {#if activeTab === 'description'}
                    <div class="text-content">
                        <h3>O tej grze</h3>
                        <p>{product.description}</p>
                        <p>Night City zmienia każdego. To miasto obsesji na punkcie władzy, mody i modyfikacji ciała. Wcielasz się w postać V, wyjętego spod prawa najemnika poszukującego jedynego w swoim rodzaju implantu, który jest kluczem do nieśmiertelności.</p>
                    </div>
                {:else if activeTab === 'requirements'}
                    <div class="req-grid">
                        <div class="req-item"><strong>OS:</strong> {product.requirements.os}</div>
                        <div class="req-item"><strong>CPU:</strong> {product.requirements.cpu}</div>
                        <div class="req-item"><strong>GPU:</strong> {product.requirements.gpu}</div>
                        <div class="req-item"><strong>RAM:</strong> {product.requirements.ram}</div>
                        <div class="req-item"><strong>DYSK:</strong> {product.requirements.storage}</div>
                    </div>
                {:else}
                    <div class="text-content">
                        <h3>Jak aktywować?</h3>
                        <ol>
                            <li>Zaloguj się do aplikacji {product.platform}.</li>
                            <li>Kliknij "Dodaj grę" w lewym dolnym rogu.</li>
                            <li>Wybierz "Aktywuj produkt na {product.platform}".</li>
                            <li>Wpisz otrzymany od nas kod.</li>
                        </ol>
                    </div>
                {/if}
            </div>
        </section>

        <section class="similar-games">
            <h2>Polecane dla Ciebie</h2>
            <div class="games-grid">
                {#each [1, 2, 3, 4] as item}
                    <div class="game-card-mini">
                        <div class="mini-img"></div>
                        <p>Inna Super Gra {item}</p>
                        <span>49,99 zł</span>
                    </div>
                {/each}
            </div>
        </section>
    </main>

    <footer class="main-footer">
        <div class="container footer-grid">
            <div class="footer-col">
                <h4>O nas</h4>
                <ul>
                    <li>Polityka prywatności</li>
                    <li>Regulamin sklepu</li>
                    <li>Kontakt</li>
                    <li>Kariera</li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Pomoc</h4>
                <ul>
                    <li>FAQ</li>
                    <li>Jak kupować</li>
                    <li>Metody płatności</li>
                    <li>Reklamacje</li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Obserwuj nas</h4>
                <div class="socials">
                    FB | IG | TW | YT
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 SKLEP INTERNETOWY - Wszystkie prawa zastrzeżone. Wszystkie znaki towarowe należą do ich właścicieli.</p>
        </div>
    </footer>
</div>

<style>
    /* RESET I BAZA */
    :global(body) {
        margin: 0;
        padding: 0;
        background-color: #0b0b0f;
        color: #fff;
        font-family: 'Inter', sans-serif;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }

    /* NAVBAR */
    .navbar {
        height: 80px;
        background: rgba(18, 18, 23, 0.95);
        border-bottom: 1px solid #333;
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
    }

    .nav-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .logo {
        font-size: 1.5rem;
        font-weight: 900;
        letter-spacing: 2px;
    }

    .logo span { color: #ff4747; }

    .categories a {
        color: #aaa;
        text-decoration: none;
        margin: 0 15px;
        font-weight: 500;
        transition: color 0.2s;
    }

    .categories a:hover { color: #fff; }

    .badge {
        background: #ff4747;
        padding: 2px 6px;
        border-radius: 50%;
        font-size: 0.7rem;
    }

    /* HERO */
    .product-hero {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 60px;
        padding: 60px 0;
    }

    .main-img {
        width: 100%;
        border-radius: 20px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }

    .thumbnails {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .thumb {
        width: 80px;
        height: 50px;
        background: #222;
        border-radius: 4px;
    }

    h1 { font-size: 3.5rem; margin: 10px 0; }

    .breadcrumb { color: #666; font-size: 0.8rem; }

    .buy-card {
        background: #1a1a20;
        padding: 30px;
        border-radius: 24px;
        margin: 30px 0;
        border: 1px solid #333;
    }

    .price-row { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }

    .discount {
        background: #a4d007;
        color: #000;
        font-weight: 900;
        font-size: 1.8rem;
        padding: 10px;
        border-radius: 8px;
    }

    .current { font-size: 2.5rem; font-weight: 900; display: block; }

    .cta-btn {
        width: 100%;
        padding: 20px;
        background: #ff4747;
        border: none;
        color: #fff;
        font-size: 1.2rem;
        font-weight: 900;
        border-radius: 12px;
        cursor: pointer;
    }

    /* TABS */
    .tab-header {
        display: flex;
        gap: 30px;
        border-bottom: 1px solid #333;
        margin-bottom: 30px;
    }

    .tab-header button {
        background: none;
        border: none;
        color: #666;
        padding: 15px 0;
        font-size: 1.1rem;
        cursor: pointer;
    }

    .tab-header button.active {
        color: #fff;
        border-bottom: 2px solid #ff4747;
    }

    .tab-body { min-height: 200px; line-height: 1.8; color: #ccc; }

    .req-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }

    /* SIMILAR */
    .similar-games { padding: 80px 0; }

    .games-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }

    .game-card-mini {
        background: #16161b;
        padding: 15px;
        border-radius: 12px;
        text-align: center;
    }

    .mini-img { height: 120px; background: #333; border-radius: 8px; margin-bottom: 10px; }

    /* FOOTER */
    .main-footer {
        background: #08080a;
        padding: 80px 0 20px 0;
        border-top: 1px solid #222;
        margin-top: 100px;
    }

    .footer-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 40px;
        margin-bottom: 60px;
    }

    .footer-col ul { list-style: none; padding: 0; }

    .footer-col li { color: #666; margin-bottom: 10px; cursor: pointer; }

    .footer-col li:hover { color: #fff; }

    .footer-bottom {
        text-align: center;
        border-top: 1px solid #111;
        padding-top: 30px;
        color: #444;
        font-size: 0.8rem;
    }
</style>