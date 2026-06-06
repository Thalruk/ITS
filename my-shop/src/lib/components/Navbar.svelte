<script>
	import { base, resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { authStore, filterStore } from '$lib/store.svelte.js';

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
</script>

<svelte:window
	onclick={() => {
		isCategoryMenuOpen = false;
	}}
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
</style>