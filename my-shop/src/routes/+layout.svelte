<script>
    import Navbar from '$lib/components/Navbar.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import './layout.css';

    import { supabase } from '$lib/supabaseClient';
    import { invalidateAll } from '$app/navigation';
    import { base } from '$app/paths';
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

    /** @param {string} email */
    async function loginAs(email) {
        const { data: loginData, error } = await supabase.auth.signInWithPassword({
            email,
            password: 'haslo123'
        });

        if (error) {
            alert('Błąd logowania: Upewnij się, że konto istnieje w Supabase!');
            return;
        }

        authStore.currentUser = loginData.user;
        authStore.isAdmin = email === 'admin@sklep.pl';

        let targetPath;

        if (authStore.isAdmin) {
            cartStore.items = [];
            targetPath = '/admin';
        } else {
            await loadCartGlobal();
            targetPath = '/zamowienia';
        }

        await invalidateAll();
        window.location.href = `${base}${targetPath}`;
    }

    async function logout() {
        await supabase.auth.signOut();

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

    <div class="dev-buttons">
        <button onclick={() => logout()} class="logout-btn">Wyloguj</button>
        <button onclick={() => loginAs('tester@sklep.pl')}>Tester 1</button>
        <button onclick={() => loginAs('tester2@sklep.pl')}>Tester 2</button>
        <button onclick={() => loginAs('admin@sklep.pl')} class="admin-btn">Admin</button>
    </div>
</div>

<Navbar cartCount={cartStore.items.length} />

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

    .dev-buttons button {
        padding: 6px 14px;
        margin-left: 8px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        background: #1a6004;
        color: white;
        font-weight: bold;
    }

    .dev-buttons button:hover {
        background: #35ba1e;
    }

    .dev-buttons .admin-btn {
        background: #b12828;
    }

    .dev-buttons .admin-btn:hover {
        background: #dc2626;
    }

    .dev-buttons .logout-btn {
        background: #475569;
        color: white;
    }

    .dev-buttons .logout-btn:hover {
        background: #64748b;
    }

    .content-wrapper {
        min-height: calc(100vh - 120px);
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
    }
</style>