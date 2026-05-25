<script>
	import { base, resolve } from '$app/paths';
	import { authStore } from '$lib/store.svelte.js';

    /** @type {{ cartCount: number }} */
    let { cartCount = 0 } = $props();

    let isMobileMenuOpen = $state(false);

    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
    }

    /** @param {string} targetId */
    function scrollToSection(targetId) {
        isMobileMenuOpen = false;

        const element = document.getElementById(targetId);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

	function goToRolePanel() {
    window.location.href = `${base}${authStore.isAdmin ? '/admin' : '/zamowienia'}`;
	}

</script>

<nav class="navbar">
    <div class="navbar-container">
        <a href={resolve('/')} class="logo">
            <img
                src="https://twojsklep.pl/assets/textures/ui/logo-gaming.png"
                alt="Logo Sklepu"
                class="logo-img"
            />
            <span class="logo-text">Game<span class="highlight">Store</span></span>
        </a>

        <ul class="nav-links {isMobileMenuOpen ? 'mobile-open' : ''}">
            <li>
                <a href={resolve('/gry')} onclick={() => isMobileMenuOpen = false}>
                    Katalog Gier
                </a>
            </li>

            <li>
                <a href={resolve('/gry?filter=nowosci')} onclick={() => isMobileMenuOpen = false}>
                    Nowości
                </a>
            </li>

            <li>
                <a
                    href={resolve('/gry?filter=promocje')}
                    class="sale-link"
                    onclick={() => isMobileMenuOpen = false}
                >
                    % Promocje
                </a>
            </li>

            <li>
                <a href={resolve('/gry?filter=uzywane')} onclick={() => isMobileMenuOpen = false}>
                    Używane
                </a>
            </li>

            <li>
                <a
                    href="#footer-about"
                    onclick={(e) => {
                        e.preventDefault();
                        scrollToSection('footer-about');
                    }}
                >
                    O nas
                </a>
            </li>

            <li>
                <a
                    href="#footer-contact"
                    onclick={(e) => {
                        e.preventDefault();
                        scrollToSection('footer-contact');
                    }}
                >
                    Kontakt
                </a>
            </li>

            <li>
                <a
                    href="#footer-rules"
                    onclick={(e) => {
                        e.preventDefault();
                        scrollToSection('footer-rules');
                    }}
                >
                    Regulamin
                </a>
            </li>
        </ul>

        <div class="nav-actions">
            {#if authStore.currentUser}
				<button
					type="button"
					class="icon-btn"
					aria-label={authStore.isAdmin ? 'Panel administratora' : 'Panel klienta'}
					title={authStore.isAdmin ? 'Panel administratora' : 'Panel klienta'}
					onclick={goToRolePanel}
				>
					<span class="nav-emoji">{authStore.isAdmin ? '🛠️' : '👤'}</span>
				</button>
			{/if}

            <a href={resolve('/koszyk')} class="cart-btn" aria-label="Koszyk" title="Koszyk">
                <span class="nav-emoji">🛒</span>

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
    .navbar {
        background-color: rgba(15, 15, 20, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid #2a2a35;
        position: sticky;
        top: 0;
        z-index: 1000;
        width: 100%;
    }

    .navbar-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
    }

    .logo-img {
        width: 40px;
        height: 40px;
        object-fit: contain;
    }

    .logo-text {
        font-size: 1.8rem;
        font-weight: 800;
        color: #ffffff;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .logo-text .highlight {
        color: #00ffcc;
    }

    .nav-links {
        display: flex;
        list-style: none;
        gap: 2rem;
        margin: 0;
        padding: 0;
    }

    .nav-links a {
        text-decoration: none;
        color: #b3b3b3;
        font-weight: 600;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: color 0.3s;
    }

    .nav-links a:hover {
        color: #ffffff;
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
    }

    .nav-links .sale-link {
        color: #ff3366;
    }

    .nav-actions {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .icon-btn,
	.cart-btn {
		display: flex;
		align-items: center;
		text-decoration: none;
		position: relative;
		padding: 0.5rem;
		border-radius: 8px;
		background: transparent;
		border: none;
		cursor: pointer;
	}

    .icon-btn:hover,
    .cart-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-emoji {
        font-size: 1.4rem;
        line-height: 1;
    }

    .cart-badge {
        position: absolute;
        top: 0;
        right: 0;
        background-color: #00ffcc;
        color: #0f0f14;
        border-radius: 50%;
        padding: 0.15rem 0.4rem;
        font-size: 0.75rem;
        font-weight: bold;
        transform: translate(25%, -25%);
    }

    .mobile-toggle {
        display: none;
        background: none;
        border: none;
        color: #ffffff;
        font-size: 1.8rem;
        cursor: pointer;
    }

    @media (max-width: 1100px) {
        .nav-links {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background-color: #0f0f14;
            padding: 1rem 0;
            border-top: 1px solid #2a2a35;
        }

        .nav-links.mobile-open {
            display: flex;
        }

        .nav-links li {
            text-align: center;
            padding: 1rem 0;
        }

        .mobile-toggle {
            display: block;
        }
    }
	
</style>