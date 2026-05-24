<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import './layout.css';

	import { supabase } from '$lib/supabaseClient';
	import { invalidateAll } from '$app/navigation';
	import { authStore, cartStore, loadCartGlobal } from '$lib/store.svelte.js';
	import { untrack } from 'svelte';

	let { data, children } = $props();

	// Reaktywna synchronizacja stanu sklepu
	$effect(() => {
		authStore.currentUser = data.user || null;
		authStore.isAdmin = data.user?.role?.toLowerCase() === 'admin';

		// untrack ucisza Svelte i blokuje pętlę nieskończoną
		untrack(() => {
			const isUserAdmin = data.user?.role?.toLowerCase() === 'admin';
			if (data.user && !isUserAdmin) {
				loadCartGlobal();
			}
		});
	});

	// Subskrypcja Realtime
	$effect(() => {
		const subscription = supabase
			.channel('produkty-channel')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
				invalidateAll();
			})
			.subscribe();

		return () => {
			supabase.removeChannel(subscription);
		};
	});
</script>

<div class="dev-bar">
	<span>
		Widok: <strong
			>{!authStore.currentUser
				? 'Niezalogowany Gość'
				: authStore.isAdmin
					? 'Admin'
					: 'Klient'}</strong
		>
		{#if authStore.currentUser}
			<small style="margin-left: 10px; opacity: 0.8;">({authStore.currentUser.email})</small>
		{/if}
		<small style="margin-left: 10px; color: #a0aec0;">
			| Rola zweryfikowana przez JWT: {data.user?.role || 'Zwykły użytkownik'}
		</small>
	</span>
</div>

<Navbar cartCount={cartStore.items.length} />

<main class="content-wrapper">
	{@render children()}
</main>

<Footer />
