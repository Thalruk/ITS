<script>
    // Importujemy komponenty z odpowiedniego, uporządkowanego folderu
    import Navbar from '$lib/components/Navbar.svelte'; 
    import Footer from '$lib/components/Footer.svelte';
    import './layout.css'; 

    import { supabase } from '$lib/supabaseClient';
    import { invalidateAll, goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { onMount } from 'svelte';
    import { authStore, cartStore, loadCartGlobal } from '$lib/store.svelte.js';

    /** @type {{ data: any, children: any }} */
    let { data, children } = $props();

    onMount(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            authStore.currentUser = session?.user || null;
            authStore.isAdmin = authStore.currentUser?.email === 'admin@sklep.pl' || data.user?.role?.toLowerCase() === 'admin';
            
            if (authStore.currentUser && !authStore.isAdmin) {
                loadCartGlobal();
            }
        });

        const subscription = supabase
            .channel('produkty-channel')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'products' }, 
                (payload) => {
                    console.log('Ktoś zmienił bazę! Odświeżam...', payload);
                    invalidateAll(); 
                    if (authStore.currentUser && !authStore.isAdmin) loadCartGlobal(); 
                }
            )
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

        if (authStore.isAdmin) {
            cartStore.items = [];
            await goto(resolve('/admin'));
        } else {
            await loadCartGlobal();
            await goto(resolve('/zamowienia'));
        }

        await invalidateAll();
    }

    async function logout() {
        await supabase.auth.signOut();

        authStore.currentUser = null;
        authStore.isAdmin = false;
        cartStore.items = [];

        await goto(resolve('/'));
        await invalidateAll();
    }

</script>

<div class="dev-bar">
    <span>
        Widok: <strong>{!authStore.currentUser ? 'Niezalogowany Gość' : (authStore.isAdmin ? 'Admin' : 'Klient')}</strong>
        {#if authStore.currentUser}
            <small style="margin-left: 10px; opacity: 0.8;">({authStore.currentUser.email})</small>
        {/if}
        
        <small style="margin-left: 10px; color: #a0aec0;">
            | Rola z sesji: {!authStore.currentUser ? 'Brak sesji' : (authStore.isAdmin ? 'Administrator' : 'Zwykły użytkownik')}
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
    :global(html) { scroll-behavior: smooth; }
    :global(body) { font-family: 'Segoe UI', sans-serif; background: #0f0f14; color: white; margin: 0; padding: 0; }
    
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
    
    .dev-buttons button:hover { background: #35ba1e; }
    .dev-buttons .admin-btn { background: #b12828; }
    .dev-buttons .logout-btn { background: #475569; color: white; }
    
    .content-wrapper { 
        min-height: calc(100vh - 120px); 
        max-width: 1400px; /* Zrównanie szerokości z nawigacją i stopką */
        margin: 0 auto;    /* Wymuszenie stałego wyśrodkowania */
        padding: 2rem;     /* Dodanie wewnętrznego, bezpiecznego odstępu */
    }
</style>