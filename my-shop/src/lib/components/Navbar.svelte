<script>
    /** @type {{ cartCount: number, categories?: any[] }} */
    let { cartCount = 0, categories = [] } = $props();
    let isMobileMenuOpen = $state(false);
    let isCategoryMenuOpen = $state(false);

    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
    }

    function toggleCategoryMenu() {
        isCategoryMenuOpen = !isCategoryMenuOpen;
    }

    /** @param {string} name */
    function getCategoryHref(name) {
        return `/gry/kategoria/${encodeURIComponent(name)}`;
    }

    function closeMenus() {
        isMobileMenuOpen = false;
        isCategoryMenuOpen = false;
    }

    /** @param {string} targetId */
    function scrollToSection(targetId) {
        isMobileMenuOpen = false;
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
</script>

<nav class="navbar">
    <div class="navbar-container">
        <a href="/" class="logo">
            <img src="https://twojsklep.pl/assets/textures/ui/logo-gaming.png" alt="Logo Sklepu" class="logo-img" />
            <span class="logo-text">Game<span class="highlight">Store</span></span>
        </a>

        <ul class="nav-links {isMobileMenuOpen ? 'mobile-open' : ''}">
            <li><a href="/gry" onclick={closeMenus}>Katalog Gier</a></li>
            <li class="category-menu">
                <button class="category-toggle" onclick={toggleCategoryMenu} aria-expanded={isCategoryMenuOpen}>
                    Kategorie
                </button>
                {#if isCategoryMenuOpen}
                    <div class="category-dropdown">
                        {#each categories as category (category.id)}
                            <a href={getCategoryHref(category.name)} onclick={closeMenus}>{category.name}</a>
                        {:else}
                            <span class="category-empty">Brak kategorii</span>
                        {/each}
                    </div>
                {/if}
            </li>
            <li><a href="/gry?filter=nowosci" onclick={() => isMobileMenuOpen = false}>Nowości</a></li>
            <li><a href="/gry?filter=promocje" class="sale-link" onclick={() => isMobileMenuOpen = false}>% Promocje</a></li>
            <li><a href="/gry?filter=uzywane" onclick={() => isMobileMenuOpen = false}>Używane</a></li>
            <li><a href="#footer-about" onclick={(e) => { e.preventDefault(); scrollToSection('footer-about'); }}>O nas</a></li>
            <li><a href="#footer-contact" onclick={(e) => { e.preventDefault(); scrollToSection('footer-contact'); }}>Kontakt</a></li>
            <li><a href="#footer-rules" onclick={(e) => { e.preventDefault(); scrollToSection('footer-rules'); }}>Regulamin</a></li>
        </ul>

        <div class="nav-actions">
            <a href="/profil" class="icon-btn" aria-label="Profil">
                <img src="https://twojsklep.pl/assets/textures/ui/user-icon.svg" alt="Profil" class="ui-icon" />
            </a>
            
            <a href="/koszyk" class="cart-btn">
                <img src="https://twojsklep.pl/assets/textures/ui/cart-icon.svg" alt="Koszyk" class="ui-icon" />
                {#if cartCount > 0}
                    <span class="cart-badge">{cartCount}</span>
                {/if}
            </a>
            
            <button class="mobile-toggle" onclick={toggleMobileMenu}>
                ☰
            </button>
        </div>
    </div>
</nav>

<style>
    .navbar { background-color: rgba(15, 15, 20, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #2a2a35; position: sticky; top: 0; z-index: 1000; width: 100%; }
    .navbar-container { max-width: 1400px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
    .logo-img { width: 40px; height: 40px; object-fit: contain; }
    .logo-text { font-size: 1.8rem; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }
    .logo-text .highlight { color: #00ffcc; }
    .nav-links { display: flex; list-style: none; gap: 2rem; margin: 0; padding: 0; }
    .nav-links a, .category-toggle { text-decoration: none; color: #b3b3b3; font-weight: 600; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.5px; transition: color 0.3s; }
    .category-toggle { background: none; border: none; cursor: pointer; padding: 0; font-family: inherit; }
    .nav-links a:hover, .category-toggle:hover { color: #ffffff; text-shadow: 0 0 8px rgba(255, 255, 255, 0.5); }
    .nav-links .sale-link { color: #ff3366; }
    .category-menu { position: relative; }
    .category-dropdown { position: absolute; top: calc(100% + 1rem); left: 0; min-width: 180px; background: #14141d; border: 1px solid #2a2a35; border-radius: 8px; padding: 0.5rem; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35); display: flex; flex-direction: column; gap: 0.25rem; z-index: 1001; }
    .category-dropdown a, .category-empty { color: #d7dde7; padding: 0.7rem 0.8rem; border-radius: 6px; white-space: nowrap; text-transform: none; letter-spacing: 0; font-size: 0.95rem; }
    .category-dropdown a:hover { background: rgba(0, 255, 204, 0.12); color: #00ffcc; text-shadow: none; }
    .category-empty { color: #718096; }
    .nav-actions { display: flex; align-items: center; gap: 1.5rem; }
    .icon-btn, .cart-btn { display: flex; align-items: center; text-decoration: none; position: relative; padding: 0.5rem; border-radius: 8px; }
    .icon-btn:hover, .cart-btn:hover { background-color: rgba(255, 255, 255, 0.1); }
    .ui-icon { width: 24px; height: 24px; filter: invert(1); }
    .cart-badge { position: absolute; top: 0; right: 0; background-color: #00ffcc; color: #0f0f14; border-radius: 50%; padding: 0.15rem 0.4rem; font-size: 0.75rem; font-weight: bold; transform: translate(25%, -25%); }
    .mobile-toggle { display: none; background: none; border: none; color: #ffffff; font-size: 1.8rem; cursor: pointer; }
    @media (max-width: 1100px) {
        .nav-links { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; width: 100%; background-color: #0f0f14; padding: 1rem 0; border-top: 1px solid #2a2a35; }
        .nav-links.mobile-open { display: flex; }
        .nav-links li { text-align: center; padding: 1rem 0; }
        .category-dropdown { position: static; width: min(320px, calc(100% - 2rem)); margin: 1rem auto 0; }
        .mobile-toggle { display: block; }
    }
</style>
