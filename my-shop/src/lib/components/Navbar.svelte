<script>
	import { base, resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { authStore, filterStore } from '$lib/store.svelte.js';
	import { secretGameStore } from '$lib/secretStore.svelte.js';
	import { riddlesConfig } from '$lib/riddlesConfig.js';

	/** @type {{ cartCount: number, categories?: any[] }} */
	let { cartCount = 0, categories = [] } = $props();

	let isMobileMenuOpen = $state(false);
	let isCategoryMenuOpen = $state(false);
	let areFiltersVisible = $derived(
	$page.url.pathname === '/gry' || $page.url.pathname.startsWith('/gry/kategoria/')
	);

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function toggleCategoryMenu() {
		isCategoryMenuOpen = !isCategoryMenuOpen;
	}

	function closeMenus() {
		isMobileMenuOpen = false;
		isCategoryMenuOpen = false;
	}

	/** @param {string} targetId */
	function scrollToSection(targetId) {
		isMobileMenuOpen = false;
		isCategoryMenuOpen = false;

		const element = document.getElementById(targetId);

		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function goToRolePanel() {
		window.location.href = `${base}${authStore.isAdmin ? '/admin' : '/zamowienia'}`;
	}

	/*Zagadka 4*/
	/** @param {MouseEvent} event */
	function handleLogoClick(event) {
		if ($page.url.pathname !== '/zagadki/4') return;

		const clickedElement = event.target;

		if (!(clickedElement instanceof Element)) return;

		const clickedCoin = clickedElement.closest('.logo-img');

		if (!clickedCoin) return;

		event.preventDefault();
		window.dispatchEvent(new CustomEvent('riddle4-logo-click'));
	}

	function resetFilters() {
		filterStore.searchQuery = '';
		filterStore.selectedPublisher = '';
		filterStore.minPrice = 0;
		filterStore.maxPrice = 500;
		filterStore.sortBy = 'default';
	}

	const kSequence = [
        'ArrowUp', 'ArrowUp', 
        'ArrowDown', 'ArrowDown', 
        'ArrowLeft', 'ArrowRight', 
        'ArrowLeft', 'ArrowRight', 
        'b', 'a'
    ];
    let sequenceIndex = 0;

    /** @param {KeyboardEvent} event */
    function handleKeyDown(event) {
        const pressed = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        const expected = kSequence[sequenceIndex].length === 1 
            ? kSequence[sequenceIndex].toLowerCase() 
            : kSequence[sequenceIndex];

        if (pressed === expected) {
            sequenceIndex++;
            if (sequenceIndex === kSequence.length) {
                secretGameStore.activateGame(); // Uruchamiamy tryb gry w store!
                sequenceIndex = 0;
            }
        } else {
            // Jeśli pomyłka, sprawdź czy gracz nie zaczął od nowa (czyli od Strzałki w Górę)
            if (pressed === 'ArrowUp') {
                sequenceIndex = 1;
            } else {
                sequenceIndex = 0;
            }
        }
    }
</script>

<svelte:window
	onclick={() => {
		isCategoryMenuOpen = false;
	}}
	onkeydown={handleKeyDown}
/>

<nav class="navbar">
	<div class="navbar-container">
		<a href={resolve('/')} class="logo" onclick={handleLogoClick}>
			<img
				src="/assets/logo-gaming.png"
				alt="Logo Sklepu"
				class="logo-img"
			/>
			<span class="logo-text">Game<span class="highlight">Store</span></span>
		</a>

		<ul class="nav-links {isMobileMenuOpen ? 'mobile-open' : ''}">
			<li>
				<a href={resolve('/gry')} onclick={closeMenus}>
					Katalog Gier
				</a>
			</li>

			<li class="category-menu">
				<button
					type="button"
					class="category-toggle"
					onclick={(e) => {
						e.stopPropagation();
						toggleCategoryMenu();
					}}
					aria-expanded={isCategoryMenuOpen}
				>
					Kategorie
				</button>

				{#if isCategoryMenuOpen}
					<div class="category-dropdown">
						{#each categories as category (category.id)}
							<a
								href={resolve('/gry/kategoria/[nazwa_kategorii]', {
									nazwa_kategorii: encodeURIComponent(category.name)
								})}
								onclick={closeMenus}
							>
								{category.name}
							</a>
						{:else}
							<span class="category-empty">Brak kategorii</span>
						{/each}
					</div>
				{/if}
			</li>

			<li>
				<a href={resolve('/gry?filter=nowosci')} onclick={closeMenus}>
					Nowości
				</a>
			</li>

			<li>
				<a href={resolve('/gry?filter=promocje')} class="sale-link" onclick={closeMenus}>
					% Promocje
				</a>
			</li>

			<li>
				<a href={resolve('/gry?filter=uzywane')} onclick={closeMenus}>
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

	{#if secretGameStore.konamiActivated}
        <div class="hacker-matrix-bar">
            <div class="matrix-container">
                
                <div class="matrix-info">
                    <span class="matrix-title">🔓 MATRYCA PROMOCJI AKTYWNA</span>
                    <span class="matrix-subtitle">Rozwiąż zagadkę aby zdeszyfrować promocje</span>
                </div>

                <div class="matrix-grid">
                    {#each riddlesConfig as riddle (riddle.id)}
                        {@const isSolved = secretGameStore.solvedPages.includes(riddle.pageName)}
                        
                        <a 
                            href={resolve(/** @type {any} */ ('/' + riddle.pageName))} 
                            class="matrix-cell {isSolved ? 'solved' : 'unsolved'}"
                            onclick={closeMenus}
                        >
                            {String(riddle.id).padStart(2, '0')}
                        </a>
                    {/each}
                </div>

                <button class="matrix-exit-btn" onclick={() => secretGameStore.resetGame()}>
                    Wyłącz
                </button>
            </div>
        </div>
    {/if}

	{#if areFiltersVisible}
		<div class="navbar-filters">
			<div class="filters-container">
				<div class="filter-group search-group">
					<input
						type="text"
						class="filter-input search-input"
						placeholder="Wyszukaj grę po nazwie..."
						bind:value={filterStore.searchQuery}
					/>
				</div>

				<div class="filter-group">
					<select class="filter-input select-input" bind:value={filterStore.selectedPublisher}>
						<option value="">Wszyscy Producenci</option>
						<option value="Warhorse Studio">Warhorse Studio</option>
						<option value="Ubisoft">Ubisoft</option>
						<option value="Mojang Studios">Mojang Studios</option>
						<option value="PARADOX Interactive">PARADOX Interactive</option>
						<option value="Capcom">Capcom</option>
						<option value="DICE">DICE</option>
						<option value="Electronic Arts">Electronic Arts</option>
					</select>
				</div>

				<div class="filter-group price-group">
					<span class="filter-label">Cena:</span>
					<input
						type="number"
						class="filter-input price-input"
						placeholder="Od"
						min="0"
						bind:value={filterStore.minPrice}
					/>
					<span class="filter-sep">-</span>
					<input
						type="number"
						class="filter-input price-input"
						placeholder="Do"
						min="0"
						bind:value={filterStore.maxPrice}
					/>
					<span class="filter-currency">zł</span>
				</div>

				<div class="filter-group">
					<select class="filter-input select-input" bind:value={filterStore.sortBy}>
						<option value="default">Sortowanie domyślne</option>
						<option value="price-asc">Cena: od najniższej</option>
						<option value="price-desc">Cena: od najwyższej</option>
						<option value="name-asc">Nazwa: A - Z</option>
					</select>
				</div>

				<button class="reset-filters-btn" onclick={resetFilters} title="Resetuj filtry">
					✕ Reset
				</button>
			</div>
		</div>
	{/if}
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
		gap: 0.65rem;
		text-decoration: none;
	}

	.logo-img {
		width: 42px;
		height: 42px;
		object-fit: contain;
		display: block;
		transform: translateY(2px);
	}

	.logo-text {
		display: flex;
		align-items: center;
		font-size: 1.8rem;
		font-weight: 800;
		color: #ffffff;
		text-transform: uppercase;
		letter-spacing: 1px;
		line-height: 1;
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

	.nav-links a,
	.category-toggle {
		text-decoration: none;
		color: #b3b3b3;
		font-weight: 600;
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: color 0.3s;
	}

	.category-toggle {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		font-family: inherit;
	}

	.nav-links a:hover,
	.category-toggle:hover {
		color: #ffffff;
		text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
	}

	.nav-links .sale-link {
		color: #ff3366;
	}

	.category-menu {
		position: relative;
	}

	.category-dropdown {
		position: absolute;
		top: calc(100% + 1rem);
		left: 0;
		min-width: 180px;
		background: #14141d;
		border: 1px solid #2a2a35;
		border-radius: 8px;
		padding: 0.5rem;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
		z-index: 1001;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.category-dropdown a,
	.category-empty {
		color: #d7dde7;
		padding: 0.7rem 0.8rem;
		border-radius: 6px;
		white-space: nowrap;
		text-transform: none;
		letter-spacing: 0;
		font-size: 0.95rem;
	}

	.category-dropdown a:hover {
		background: rgba(0, 255, 204, 0.12);
		color: #00ffcc;
		text-shadow: none;
	}

	.category-empty {
		color: #718096;
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

	.navbar-filters {
		background-color: rgba(20, 20, 27, 0.9);
		border-top: 1px solid #22222d;
		padding: 0.6rem 2rem;
		width: 100%;
		box-sizing: border-box;
	}

	.filters-container {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.2rem;
	}

	.filter-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.search-group {
		flex-grow: 1;
		min-width: 250px;
	}

	.filter-label {
		font-size: 0.85rem;
		color: #8e9db0;
		text-transform: uppercase;
		font-weight: 600;
	}

	.filter-input {
		background-color: #0f0f14;
		color: #ffffff;
		border: 1px solid #323244;
		border-radius: 6px;
		padding: 0.5rem 0.8rem;
		font-size: 0.9rem;
		outline: none;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		box-sizing: border-box;
	}

	.filter-input:focus {
		border-color: #00ffcc;
		box-shadow: 0 0 5px rgba(0, 255, 204, 0.2);
	}

	.search-input {
		width: 100%;
	}

	.select-input {
		cursor: pointer;
		min-width: 180px;
	}

	.price-group {
		background-color: #0f0f14;
		border: 1px solid #323244;
		padding: 0.15rem 0.6rem;
		border-radius: 6px;
	}

	.price-group .filter-input {
		border: none;
		background: transparent;
		padding: 0.3rem 0;
		width: 55px;
		text-align: center;
	}

	.filter-sep {
		color: #4a4a62;
	}

	.filter-currency {
		font-size: 0.85rem;
		color: #62627a;
		font-weight: 600;
	}

	.reset-filters-btn {
		background: transparent;
		border: 1px dashed #ff3366;
		color: #ff3366;
		padding: 0.45rem 0.9rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		font-size: 0.85rem;
		text-transform: uppercase;
		transition:
			background 0.2s,
			color 0.2s;
	}

	.reset-filters-btn:hover {
		background-color: #ff3366;
		color: #ffffff;
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

		.category-menu {
			position: static;
		}

		.category-dropdown {
			position: static;
			width: min(320px, calc(100% - 2rem));
			margin: 1rem auto 0;
		}

		.mobile-toggle {
			display: block;
		}

		.filters-container {
			flex-direction: column;
			align-items: stretch;
			gap: 0.8rem;
		}

		.search-group {
			width: 100%;
		}

		.price-group {
			justify-content: center;
		}
	}

	.hacker-matrix-bar {
        background-color: #09090d;
        border-top: 1px solid #1e1b4b;
        border-bottom: 1px solid #1e1b4b;
        padding: 0.75rem 2rem;
        font-family: monospace;
        width: 100%;
        box-sizing: border-box;
    }

    .matrix-container {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 2rem;
    }

    .matrix-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex-shrink: 0;
    }

    .matrix-title {
        color: #a78bfa;
        font-weight: bold;
        font-size: 0.85rem;
        letter-spacing: 1px;
    }

    .matrix-subtitle {
        color: #6366f1;
        font-size: 0.7rem;
    }

    .matrix-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr); 
        gap: 10px;
        flex-grow: 1;
        max-width: 900px;
    }

    .matrix-cell {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.6rem 0;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 900;
        border-radius: 4px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }

    .matrix-cell.unsolved {
        background-color: #dc2626;
        color: #ffffff;
        border: 1px solid #f87171;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
    }

    .matrix-cell.unsolved:hover {
        background-color: #ef4444;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        border-color: #ffffff;
    }

    .matrix-cell.solved {
        background-color: #059669;
        color: #ffffff;
        border: 1px solid #34d399;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
    }

    .matrix-cell.solved:hover {
        background-color: #10b981;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
        border-color: #ffffff;
    }

    .matrix-exit-btn {
        background: transparent;
        border: 1px solid #3f3f46;
        color: #71717a;
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.75rem;
        text-transform: uppercase;
        font-family: inherit;
        font-weight: bold;
        transition: all 0.2s;
        flex-shrink: 0;
    }

    .matrix-exit-btn:hover {
        color: #ef4444;
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.05);
    }

    @media (max-width: 1100px) {
        .matrix-container {
            flex-direction: column;
            align-items: stretch;
            gap: 1.2rem;
        }
        .matrix-grid {
            grid-template-columns: repeat(6, 1fr); 
            max-width: 100%;
        }
        .matrix-cell {
            padding: 0.8rem 0;
        }
        .matrix-exit-btn {
            align-self: flex-end;
        }
    }
</style>