<script>
    import Navbar from '$lib/components/Navbar.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import './layout.css';

    import { supabase } from '$lib/supabaseClient';
    import { invalidateAll } from '$app/navigation';
    import { base, resolve } from '$app/paths';
    import { authStore, cartStore, loadCartGlobal } from '$lib/store.svelte.js';
    import { untrack } from 'svelte';

    let { data, children } = $props();

    // Reaktywna synchronizacja stanu sklepu
    $effect(() => {
        authStore.currentUser = data.user || null;
        authStore.isAdmin = data.user?.role?.toLowerCase() === 'admin';

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

    async function logout() {
        await supabase.auth.signOut();

        await fetch('/?/logout', {
            method: 'POST',
            body: new FormData()
        });

        authStore.currentUser = null;
        authStore.isAdmin = false;
        cartStore.items = [];

        await invalidateAll();
        window.location.href = `${base}/`;
    }
</script>

<div class="dev-bar">
    <span>
        Widok:
        <strong>
            {!authStore.currentUser ? 'Niezalogowany Gość' : authStore.isAdmin ? 'Admin' : 'Klient'}
        </strong>

        {#if authStore.currentUser}
            <small style="margin-left: 10px; opacity: 0.8;">
                ({authStore.currentUser.email})
            </small>
        {/if}

        <small style="margin-left: 10px; color: #a0aec0;">
            | Rola zweryfikowana przez JWT: {data.user?.role || 'Zwykły użytkownik'}
        </small>
    </span>

    <div class="top-auth-actions">
        {#if !authStore.currentUser}
            <a href={resolve('/auth/login')} class="top-auth-btn">Zaloguj</a>
            <a href={resolve('/auth/register')} class="top-auth-btn register-btn">Rejestracja</a>
        {:else}
            <button onclick={() => logout()} class="top-auth-btn logout-btn">Wyloguj</button>
        {/if}
    </div>
</div>

<Navbar cartCount={cartStore.items.length} categories={data.categories || []} />

<main class="content-wrapper">
    {@render children()}
</main>

<Footer />

<style>
    :global(html) {
        scroll-behavior: smooth;
    }

    :global(body) {
        font-family: 'Segoe UI', sans-serif;
        background: #0f0f14;
        color: white;
        margin: 0;
        padding: 0;
    }

    .dev-bar {
        background: #021e49;
        color: #e2e8f0;
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        border-bottom: 2px solid #3b82f6;
    }

    .top-auth-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    }

    .top-auth-btn {
        padding: 6px 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        background: #2563eb;
        color: white;
        font-weight: bold;
        text-decoration: none;
        font-size: 0.85rem;
    }

    .top-auth-btn:hover {
        background: #1d4ed8;
    }

    .register-btn {
        background: #0f766e;
    }

    .register-btn:hover {
        background: #0d9488;
    }

    .logout-btn {
        background: #475569;
    }

    .logout-btn:hover {
        background: #64748b;
    }

    .content-wrapper {
        min-height: calc(100vh - 120px);
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
    }
</style>
