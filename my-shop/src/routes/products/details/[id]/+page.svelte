<script>
    // Importujemy narzędzie Svelte do czytania adresu URL
    import { page } from '$app/stores';

    // 1. ŁAPIEMY ID Z LINKU
    // Cokolwiek wpiszesz w linku zamiast [id], pojawi się w tej zmiennej
    let productId = $page.params.id;

    // 2. MOCK DATA (Zastępcze dane)
    // Gdy koledzy podepną bazę, ten obiekt 'product' będzie pobierany 
    // z bazy danych na podstawie zmiennej 'productId' powyżej.
    let product = {
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
    };

    // 3. LOGIKA KOSZYKA
    let cartCount = $state(0);

    function addToCart() {
        cartCount += 1;
    }
</script>

<div class="page-wrapper">
    
    <header class="navbar">
        <div class="container nav-content">
            <div class="logo">SKLEP<span>INTERNETOWY</span></div>
            
            <div class="cart-section">
                <div class="cart-icon">
                    🛒 <span class="badge">{cartCount}</span>
                </div>
            </div>
        </div>
    </header>

    <main class="container">
        
        <div class="debug-bar">
            <span>Obecne ID produktu pobrane z URL: <strong>{productId}</strong></span>
            <span>(Tutaj poleci zapytanie do bazy)</span>
        </div>

        <section class="product-hero">
            <div class="image-gallery">
                <img src={product.imageUrl} alt={product.title} class="main-img" />
            </div>

            <div class="product-main-info">
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
            </div>
        </section>

        <section class="stacked-details">
            
            <div class="detail-block">
                <h2>O tej grze</h2>
                <div class="content-box">
                    <p>{product.description}</p>
                    <p>Night City zmienia każdego. To miasto obsesji na punkcie władzy, mody i modyfikacji ciała. Wcielasz się w postać V, wyjętego spod prawa najemnika poszukującego jedynego w swoim rodzaju implantu, który jest kluczem do nieśmiertelności.</p>
                </div>
            </div>

            <div class="detail-block">
                <h2>Wymagania systemowe</h2>
                <div class="content-box req-grid">
                    <div class="req-item"><strong>System:</strong> {product.requirements.os}</div>
                    <div class="req-item"><strong>Procesor:</strong> {product.requirements.cpu}</div>
                    <div class="req-item"><strong>Karta Graficzna:</strong> {product.requirements.gpu}</div>
                    <div class="req-item"><strong>Pamięć RAM:</strong> {product.requirements.ram}</div>
                    <div class="req-item"><strong>Miejsce na dysku:</strong> {product.requirements.storage}</div>
                </div>
            </div>

            <div class="detail-block">
                <h2>Jak aktywować?</h2>
                <div class="content-box">
                    <ol class="activation-steps">
                        <li>Zaloguj się do aplikacji {product.platform} na swoim komputerze.</li>
                        <li>Kliknij opcję "Dodaj grę" znajdującą się w lewym dolnym rogu ekranu.</li>
                        <li>Wybierz "Aktywuj produkt na {product.platform}".</li>
                        <li>Skopiuj i wklej otrzymany od nas klucz cyfrowy.</li>
                        <li>Ciesz się grą!</li>
                    </ol>
                </div>
            </div>

        </section>
    </main>

    <footer class="main-footer">
        <div class="container footer-grid">
            <div class="footer-col">
                <h4>O nas</h4>
                <ul><li>Regulamin</li><li>Kontakt</li></ul>
            </div>
            <div class="footer-col">
                <h4>Pomoc</h4>
                <ul><li>FAQ</li><li>Reklamacje</li></ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 SKLEP INTERNETOWY - "Informacje, które nigdy nikogo nie interesują" ;)</p>
        </div>
    </footer>
</div>

<style>
    /* BAZA */
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

    /* Pasek testowy ID */
    .debug-bar {
        background-color: #2a2a00;
        border: 1px solid #ffe600;
        color: #ffe600;
        padding: 10px;
        margin-top: 20px;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
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
        padding: 40px 0 60px 0;
    }

    .main-img {
        width: 100%;
        max-width: 500px;
        border-radius: 20px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }

    h1 { font-size: 3.5rem; margin: 10px 0; }

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
    .old { color: #888; text-decoration: line-through; }

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

    /* SEKCJE JEDNO POD DRUGIM */
    .stacked-details {
        display: flex;
        flex-direction: column;
        gap: 40px;
        padding-bottom: 60px;
    }

    .detail-block h2 {
        border-bottom: 2px solid #333;
        padding-bottom: 10px;
        margin-bottom: 20px;
        color: #ff4747;
    }

    .content-box {
        background: #16161b;
        padding: 30px;
        border-radius: 16px;
        border: 1px solid #222;
        line-height: 1.8;
        color: #ccc;
    }

    .req-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .activation-steps {
        margin: 0;
        padding-left: 20px;
    }

    .activation-steps li {
        margin-bottom: 10px;
    }

    /* FOOTER */
    .main-footer {
        background: #08080a;
        padding: 60px 0 20px 0;
        border-top: 1px solid #222;
    }

    .footer-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 40px;
        margin-bottom: 40px;
    }

    .footer-col ul { list-style: none; padding: 0; }
    .footer-col li { color: #666; margin-bottom: 10px; cursor: pointer; }

    .footer-bottom {
        text-align: center;
        border-top: 1px solid #111;
        padding-top: 20px;
        color: #444;
        font-size: 0.8rem;
    }
</style>