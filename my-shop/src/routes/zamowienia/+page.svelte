<script>
    import { onMount } from 'svelte';
    import { loadOrders, returnOrder } from '$lib/services/orders.js';
    import { authStore } from '$lib/store.svelte.js';

    // NAPRAWA 1: Dodany typ dla tablicy orders
    /** @type {any[]} */
    let orders = $state([]);
    let loading = $state(true);

    onMount(async () => {
        setTimeout(async () => {
            if (authStore.currentUser) {
                orders = await loadOrders(authStore.currentUser.id);
                console.log("Pobrane zamówienia z bazy:", orders); // <--- DODAJ TĘ LINIJKĘ
            }
            loading = false;
        }, 500);
    });

    // NAPRAWA 2: Dodany typ dla parametru order
    /** @param {any} order */
    async function handleReturn(order) {
        const success = await returnOrder(order);
        if (success) {
            orders = await loadOrders(authStore.currentUser.id);
        }
    }
</script>

<svelte:head>
    <title>Panel klienta</title>
</svelte:head>

<div class="orders-container">
    <h2>📦 Twoje Zamówienia i Zwroty</h2>

    {#if loading}
        <p class="loading-text">Ładowanie historii zamówień...</p>
    {:else if !authStore.currentUser}
        <div class="empty-state">
            <p>Musisz być zalogowany jako klient, aby zobaczyć swoje zamówienia.</p>
            <button onclick={() => window.location.href = '/'} class="action-btn">Wróć do sklepu</button>
        </div>
    {:else if orders.length === 0}
        <div class="empty-state">
            <p>Nie masz jeszcze żadnych zamówień w naszej bazie.</p>
            <button onclick={() => window.location.href = '/'} class="action-btn">Przejdź do katalogu</button>
        </div>
    {:else}
        <div class="orders-list">
            {#each orders as order (order.id)}
                <div class="order-card">
                    <div class="order-header">
                        <div class="order-info">
                            <span class="order-date">📅 {new Date(order.created_at).toLocaleDateString()}</span>
                            <span class="order-total">💰 {order.total_amount.toFixed(2)} zł</span>
                        </div>
                        <span class="status-badge {order.status}">
                            {order.status === 'paid' ? 'Opłacone' : (order.status === 'returned' ? 'Zwrócone' : order.status)}
                        </span>
                    </div>
                    
                    {#if order.addresses}
                        <div class="order-shipping-address">
                            📍 <strong>Adres dostawy:</strong> {order.addresses.street}, {order.addresses.postal_code} {order.addresses.city}
                        </div>
                    {:else}
                        <div class="order-shipping-address" style="border-style: dashed; opacity: 0.7;">
                            📍 <strong>Adres dostawy:</strong> Brak danych (stare zamówienie)
                        </div>
                    {/if}
                    
                    <div class="order-items">
                        <h4>Kupione produkty:</h4>
                        <ul>
                            {#each order.order_items as item (item.id)}
                                <li>
                                    <span class="item-name">{item.products?.name}</span> 
                                    <span class="item-details">{item.quantity} szt. ({item.price_at_time} zł/szt.)</span>
                                </li>
                            {/each}
                        </ul>
                    </div>

                    {#if order.status === 'paid'}
                        <div class="order-actions">
                            <button class="return-btn" onclick={() => handleReturn(order)}>Zwróć zamówienie 🔄</button>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>


<style>
    .orders-container { 
        max-width: 900px; 
        margin: 40px auto; 
        padding: 20px; 
    }
    
    .orders-container h2 {
        border-bottom: 2px solid #2d3748;
        padding-bottom: 15px;
        margin-bottom: 30px;
        color: #e2e8f0;
    }

    .loading-text, .empty-state {
        text-align: center;
        padding: 40px;
        background: #1a202c;
        border-radius: 8px;
        border: 1px dashed #4a5568;
        color: #a0aec0;
    }

    .action-btn {
        background: #3182ce; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 15px; font-weight: bold;
    }

    .order-card { 
        background: #1a202c; 
        padding: 20px; 
        margin-bottom: 20px; 
        border-radius: 8px; 
        border-left: 5px solid #3182ce; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }

    .order-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: center;
        border-bottom: 1px solid #2d3748; 
        padding-bottom: 15px; 
        margin-bottom: 15px; 
    }

    .order-info { display: flex; gap: 20px; font-size: 1.1rem; font-weight: bold; }
    .order-date { color: #a0aec0; }
    .order-total { color: #48bb78; }

    .status-badge { 
        padding: 6px 12px; 
        border-radius: 20px; 
        font-size: 0.85rem; 
        font-weight: bold; 
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .status-badge.paid { background: rgba(72, 187, 120, 0.2); color: #48bb78; border: 1px solid #48bb78; }
    .status-badge.returned { background: rgba(229, 62, 62, 0.2); color: #fc8181; border: 1px solid #fc8181; }

    .order-items h4 { margin: 0 0 10px 0; color: #a0aec0; font-size: 0.9rem; text-transform: uppercase; }
    .order-items ul { list-style: none; padding: 0; margin: 0; }
    .order-items li { 
        display: flex; justify-content: space-between; 
        margin-bottom: 8px; padding: 8px; 
        background: #2d3748; border-radius: 4px;
    }
    .item-name { font-weight: bold; color: #e2e8f0; }
    .item-details { color: #a0aec0; font-size: 0.9rem; }

    .order-actions { margin-top: 20px; text-align: right; border-top: 1px dashed #2d3748; padding-top: 15px;}
    .return-btn { 
        background: #e53e3e; color: white; border: none; 
        padding: 10px 20px; border-radius: 6px; cursor: pointer; 
        font-weight: bold; transition: all 0.2s;
    }
    .return-btn:hover { background: #c53030; transform: translateY(-2px); }
    .order-shipping-address {
        background: #232a34;
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 0.9rem;
        margin-bottom: 20px;
        color: #cbd5e1;
        border: 1px solid #2d3748;
    }
</style>