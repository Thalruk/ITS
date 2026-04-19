<script>
    import { supabase } from '$lib/supabaseClient';
    import { onMount } from 'svelte';

    // 1. ODBIERAMY DANE Z BAZY (Dostarczone przez plik +page.js)
    let { data } = $props();
    let product = data.product; // Tutaj siedzi prawdziwa gra z Waszej bazy!

    // 2. PRAWDZIWA LOGIKA KOSZYKA (zapożyczona z głównej strony)
    let currentUser = $state(null);
    let cartCount = $state(0);

    onMount(async () => {
        // Sprawdzamy, czy ktoś jest zalogowany
        const { data: { session } } = await supabase.auth.getSession();
        currentUser = session?.user || null;
        if (currentUser) loadCartCount();
    });

    async function loadCartCount() {
        // Liczymy, ile przedmiotów ten użytkownik ma w bazie w koszyku
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

        // Wrzucamy do prawdziwej bazy danych
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
        {#if product}
            <section class="product-hero">
                <div class="image-gallery">
                    <img src={product.image_url} alt={product.name} class="main-img" />
                </div>

                <div class="product-main-info">
                    <h1>{product.name}</h1>
                    
                    <div class="quick-meta">
                        <span>{product.category || 'Inne'}</span>
                        <span>⭐ 4.8</span> <span>Klucz Global</span> </div>

                    <div class="buy-card">
                        <div class="price-row">
                            <div class="price-stack">
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
                    </div>
                </div>

                <div class="detail-block">
                    <h2>Wymagania systemowe (Tymczasowe)</h2>
                    <div class="content-box req-grid">
                        <div class="req-item"><strong>System:</strong> Windows 10 64-bit</div>
                        <div class="req-item"><strong>Procesor:</strong> Core i7-6700 / Ryzen 5 1600</div>
                        <div class="req-item"><strong>Karta Graficzna:</strong> GTX 1060 6GB / Radeon RX 580 8GB</div>
                        <div class="req-item"><strong>Pamięć RAM:</strong> 12 GB RAM</div>
                    </div>
                </div>

                <div class="detail-block">
                    <h2>Jak aktywować?</h2>
                    <div class="content-box">
                        <ol class="activation-steps">
                            <li>Zaloguj się do wybranej aplikacji na swoim komputerze.</li>
                            <li>Kliknij opcję "Dodaj grę" znajdującą się w lewym dolnym rogu ekranu.</li>
                            <li>Wybierz opcję aktywacji produktu.</li>
                            <li>Skopiuj i wklej otrzymany od nas klucz cyfrowy.</li>
                            <li>Ciesz się grą!</li>
                        </ol>
                    </div>
                </div>
            </section>
        {:else}
            <div class="error-view">
                <h1>Błąd 404</h1>
                <p>Nie znaleziono gry o podanym ID w bazie danych.</p>
            </div>
        {/if}
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
            <p>&copy; 2024 SKLEP INTERNETOWY</p>
        </div>
    </footer>
</div>

<style>
    /* BAZA */
    :global(body) { margin: 0; padding: 0; background-color: #0b0b0f; color: #fff; font-family: 'Inter', sans-serif; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

    /* NAVBAR */
    .navbar { height: 80px; background: rgba(18, 18, 23, 0.95); border-bottom: 1px solid #333; position: sticky; top: 0; z-index: 100; display: flex; align-items: center; }
    .nav-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .logo { font-size: 1.5rem; font-weight: 900; letter-spacing: 2px; }
    .logo span { color: #ff4747; }
    .badge { background: #ff4747; padding: 2px 6px; border-radius: 50%; font-size: 0.7rem; }

    /* HERO */
    .product-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; padding: 40px 0 60px 0; }
    .main-img { width: 100%; max-width: 500px; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); object-fit: contain; background: #000; }
    h1 { font-size: 3.5rem; margin: 10px 0; }
    .quick-meta { display: flex; gap: 15px; color: #aaa; font-weight: bold; margin-bottom: 20px; }

    .buy-card { background: #1a1a20; padding: 30px; border-radius: 24px; margin: 30px 0; border: 1px solid #333; }
    .price-row { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
    .current { font-size: 2.5rem; font-weight: 900; display: block; color: #48bb78; }

    .cta-btn { width: 100%; padding: 20px; background: #ff4747; border: none; color: #fff; font-size: 1.2rem; font-weight: 900; border-radius: 12px; cursor: pointer; }
    .cta-btn:hover { background: #e53e3e; }
    .stock { margin-top: 15px; color: #aaa; font-size: 0.9rem; text-align: center; }

    /* SEKCJE JEDNO POD DRUGIM */
    .stacked-details { display: flex; flex-direction: column; gap: 40px; padding-bottom: 60px; }
    .detail-block h2 { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; color: #ff4747; }
    .content-box { background: #16161b; padding: 30px; border-radius: 16px; border: 1px solid #222; line-height: 1.8; color: #ccc; }
    .req-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .activation-steps { margin: 0; padding-left: 20px; }
    .activation-steps li { margin-bottom: 10px; }

    /* BŁĄD 404 */
    .error-view { text-align: center; padding: 100px 0; color: #ff4747; }

    /* FOOTER */
    .main-footer { background: #08080a; padding: 60px 0 20px 0; border-top: 1px solid #222; }
    .footer-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-bottom: 40px; }
    .footer-col ul { list-style: none; padding: 0; }
    .footer-col li { color: #666; margin-bottom: 10px; cursor: pointer; }
    .footer-bottom { text-align: center; border-top: 1px solid #111; padding-top: 20px; color: #444; font-size: 0.8rem; }
</style>