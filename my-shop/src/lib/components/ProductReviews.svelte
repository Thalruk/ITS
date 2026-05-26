<script>
	import { supabase } from '$lib/supabaseClient';
	import { authStore } from '$lib/store.svelte.js';
	import { onMount } from 'svelte';

	// Odbieramy ID gry jako prop w Svelte 5
	let { productId } = $props();

	let reviews = $state([]);
	let hasBought = $state(false);
	let isLoading = $state(true);

	// Stan formularza opinii
	let userRating = $state(5);
	let userComment = $state('');

	// Dynamiczne obliczanie średniej ocen (Run $derived)
	let avgRating = $derived(
		reviews.length > 0
			? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
			: 'Brak ocen'
	);

	// Nasłuchiwanie na zmianę ID produktu (zabezpieczenie przy przełączaniu gier)
	$effect(() => {
		if (productId) {
			initReviews();
		}
	});

	async function initReviews() {
		isLoading = true;
		await loadReviews();
		if (authStore.currentUser && !authStore.isAdmin) {
			await checkPurchaseStatus();
		}
		isLoading = false;
	}

	// 1. Pobieranie recenzji wraz z danymi autora z relacji 'profiles'
	async function loadReviews() {
		const { data, error } = await supabase
			.from('reviews')
			.select('*, profiles(first_name, last_name)')
			.eq('product_id', productId)
			.order('created_at', { ascending: false });

		if (!error) {
			reviews = data || [];
		}
	}

	// 2. Weryfikacja: Czy zalogowany użytkownik kupił i opłacił tę grę
	async function checkPurchaseStatus() {
		const { data, error } = await supabase
			.from('orders')
			.select('id, status, order_items(product_id)')
			.eq('user_id', authStore.currentUser.id)
			.eq('status', 'paid');

		if (!error && data) {
			hasBought = data.some((order) =>
				order.order_items.some((item) => item.product_id === productId)
			);
		}
	}

	// 3. Dodawanie opinii do bazy danych
	async function submitReview() {
		if (!userComment.trim()) return alert('Napisz treść recenzji przed publikacją!');

		// Sprawdzenie, czy ten użytkownik już nie oceniał tej gry
		const alreadyReviewed = reviews.some((r) => r.user_id === authStore.currentUser.id);
		if (alreadyReviewed) return alert('Wystawiłeś już opinię dla tej gry!');

		const { error } = await supabase.from('reviews').insert([
			{
				product_id: productId,
				user_id: authStore.currentUser.id,
				rating: userRating,
				comment: userComment
			}
		]);

		if (error) {
			alert('Błąd dodawania opinii: ' + error.message);
		} else {
			alert('Dziękujemy! Twoja opinia została opublikowana.');
			userComment = '';
			await loadReviews(); // Odświeżamy sekcję komentarzy na ekranie
		}
	}
</script>

<section class="reviews-section">
	<div class="reviews-header">
		<h2>💬 Recenzje i Opinie Graczy</h2>
		<div class="avg-badge">
			<span class="star-icon">⭐</span>
			<span class="rating-val">{avgRating}</span>
			{#if reviews.length > 0}
				<span class="rating-count">({reviews.length} ocen)</span>
			{/if}
		</div>
	</div>

	{#if isLoading}
		<p class="status-text">Ładowanie opinii użytkowników...</p>
	{:else}
		<div class="reviews-layout">
			
			<div class="reviews-list">
				{#each reviews as r (r.id)}
					<div class="review-card">
						<div class="review-meta">
							<span class="review-author">
								👤 {r.profiles?.first_name || 'Anonimowy'} {r.profiles?.last_name || 'Gracz'}
							</span>
							<span class="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
						</div>
						<p class="review-body">{r.comment}</p>
						<span class="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
					</div>
				{:else}
					<div class="no-reviews-box">
						<p>Ta gra nie posiada jeszcze żadnych recenzji.</p>
					</div>
				{/each}
			</div>

			<div class="review-sidebar">
				{#if hasBought}
					<div class="review-form">
						<h3>Napisz recenzję</h3>
						<div class="form-group">
							<label for="rating">Twoja ocena gry:</label>
							<select id="rating" bind:value={userRating}>
								<option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
								<option value={4}>⭐⭐⭐⭐ (4/5)</option>
								<option value={3}>⭐⭐⭐ (3/5)</option>
								<option value={2}>⭐⭐ (2/5)</option>
								<option value={1}>⭐ (1/5)</option>
							</select>
						</div>
						<div class="form-group">
							<label for="comment">Treść opinii:</label>
							<textarea 
								id="comment" 
								placeholder="Opisz swoje wrażenia z rozgrywki..." 
								bind:value={userComment}
							></textarea>
						</div>
						<button class="submit-btn" onclick={submitReview}>Opublikuj</button>
					</div>
				{:else if authStore.currentUser && !authStore.isAdmin}
					<div class="status-box locked">
						<p>🔒 Formularz ocen dostępny wyłącznie dla zweryfikowanych posiadaczy tego tytułu.</p>
					</div>
				{:else}
					<div class="status-box info">
						<p>💡 Zaloguj się na konto klienta, aby wystawić ocenę.</p>
					</div>
				{/if}
			</div>

		</div>
	{/if}
</section>

<style>
	.reviews-section {
		margin-top: 40px;
		border-top: 1px solid #2a2a35;
		padding-top: 30px;
	}
	.reviews-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 25px;
	}
	.reviews-header h2 {
		font-size: 1.6rem;
		margin: 0;
		color: #ffffff;
	}
	.avg-badge {
		display: flex;
		align-items: center;
		gap: 8px;
		background-color: #0f0f14;
		padding: 8px 16px;
		border-radius: 20px;
		border: 1px solid #2a2a35;
	}
	.star-icon { color: #00ffcc; font-size: 1.2rem; }
	.rating-val { font-weight: bold; font-size: 1.2rem; color: #ffffff; }
	.rating-count { color: #8e9db0; font-size: 0.85rem; }

	.reviews-layout {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 30px;
		align-items: start;
	}

	/* Lista recenzji */
	.reviews-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}
	.review-card {
		background-color: rgba(255, 255, 255, 0.02);
		border: 1px solid #2a2a35;
		border-radius: 8px;
		padding: 16px;
		position: relative;
	}
	.review-meta {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
	}
	.review-author {
		font-weight: 600;
		color: #e2e8f0;
	}
	.review-stars {
		color: #00ffcc;
		letter-spacing: 2px;
	}
	.review-body {
		margin: 0;
		color: #b3b3b3;
		font-size: 0.95rem;
		line-height: 1.5;
		word-break: break-word;
	}
	.review-date {
		display: block;
		text-align: right;
		font-size: 0.75rem;
		color: #62627a;
		margin-top: 10px;
	}
	.no-reviews-box {
		border: 1px dashed #323244;
		border-radius: 8px;
		padding: 40px;
		text-align: center;
		color: #8e9db0;
	}

	/* Boczny pasek formularza */
	.review-sidebar {
		position: sticky;
		top: 100px;
	}
	.review-form {
		background-color: #0f0f14;
		border: 1px solid #2a2a35;
		border-radius: 8px;
		padding: 20px;
	}
	.review-form h3 {
		margin-top: 0;
		margin-bottom: 15px;
		font-size: 1.1rem;
		color: #ffffff;
	}
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 12px;
	}
	.form-group label {
		font-size: 0.8rem;
		color: #8e9db0;
		text-transform: uppercase;
		font-weight: 600;
	}
	.form-group select, .form-group textarea {
		background-color: #161622;
		color: white;
		border: 1px solid #2a2a35;
		border-radius: 6px;
		padding: 10px;
		font-size: 0.9rem;
		outline: none;
		font-family: inherit;
	}
	.form-group select:focus, .form-group textarea:focus {
		border-color: #00ffcc;
	}
	.form-group textarea {
		height: 100px;
		resize: none;
	}
	.submit-btn {
		background: linear-gradient(135deg, #00ffcc, #00b399);
		color: #0f0f14;
		border: none;
		width: 100%;
		padding: 12px;
		border-radius: 6px;
		font-weight: bold;
		cursor: pointer;
		text-transform: uppercase;
		font-size: 0.85rem;
	}
	.submit-btn:hover {
		opacity: 0.9;
	}

	.status-box {
		padding: 15px;
		border-radius: 8px;
		font-size: 0.85rem;
		text-align: center;
		line-height: 1.4;
	}
	.status-box.locked {
		background-color: rgba(255, 51, 102, 0.05);
		border: 1px dashed #ff3366;
		color: #ff3366;
	}
	.status-box.info {
		background-color: rgba(142, 157, 176, 0.05);
		border: 1px dashed #323244;
		color: #8e9db0;
	}
	.status-text { text-align: center; color: #8e9db0; padding: 20px 0; }

	@media (max-width: 900px) {
		.reviews-layout {
			grid-template-columns: 1fr;
		}
		.review-sidebar {
			position: static;
		}
	}
</style>