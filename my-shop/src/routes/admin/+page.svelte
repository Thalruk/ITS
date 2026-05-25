<script>
    import AdminPanel from '$lib/components/AdminPanel.svelte';
    import { addProduct, approveReturn, rejectReturn } from '$lib/services/admin.js';

    /** @type {{ data: any }} */
    let { data } = $props();
    let returnRequests = $derived(
        data.orders?.filter((/** @type {any} */ order) => order.status === 'return_requested') || []
    );

    /**
     * @param {any} productData
     * @param {Function} resetForm
     */
    async function handleAddProduct(productData, resetForm) {
        const success = await addProduct({
            newName: productData.name,
            newDesc: productData.description,
            newPrice: productData.price,
            newStock: productData.stock_quantity,
            newImageFile: productData.image_file,
            newCat: productData.category
        });

        if (success) {
            resetForm();
        }
    }

    /** @param {any} order */
    async function handleApproveReturn(order) {
        await approveReturn(order);
    }

    /** @param {any} order */
    async function handleRejectReturn(order) {
        await rejectReturn(order);
    }

</script>

<svelte:head>
    <title>Panel administratora</title>
</svelte:head>

<main class="admin-page">
    <h1>Panel administratora</h1>

    <AdminPanel
        {data}
        onAddProduct={handleAddProduct}
    />

    <section class="returns-section">
    <h2>↩️ Zwroty oczekujące</h2>

    {#if returnRequests.length === 0}
        <p class="empty-info">Brak zwrotów oczekujących na zatwierdzenie.</p>
    {:else}
        <div class="returns-list">
            {#each returnRequests as order (order.id)}
                <article class="return-card">
                    <div class="return-header">
                        <strong>Zamówienie #{order.id}</strong>
                        <span>{new Date(order.created_at).toLocaleDateString('pl-PL')}</span>
                    </div>

                    <p>
                        <strong>Kwota:</strong>
                        {Number(order.total_amount).toFixed(2)} zł
                    </p>

                    <p>
                        <strong>Status:</strong>
                        Oczekuje na zatwierdzenie zwrotu
                    </p>

                    {#if order.order_items?.length}
                        <div class="return-items">
                            <strong>Produkty:</strong>
                            <ul>
                                {#each order.order_items as item (item.id)}
                                    <li>
                                        {item.products?.name || 'Nieznany produkt'}
                                        × {item.quantity}
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                    <div class="return-actions">
                        <button class="reject-return-btn" onclick={() => handleRejectReturn(order)}>
                            Odrzuć zwrot
                        </button>

                        <button class="approve-return-btn" onclick={() => handleApproveReturn(order)}>
                            Zatwierdź zwrot
                        </button>
                    </div>
                </article>
            {/each}
        </div>
    {/if}
</section>

</main>

<style>
    .admin-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 24px 60px;
    }

    .admin-page h1 {
        margin-bottom: 40px;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .returns-section {
    margin-top: 40px;
    background: #1a202c;
    border: 1px solid #4a5568;
    border-radius: 12px;
    padding: 24px;
    }

    .returns-section h2 {
        margin: 0 0 20px 0;
        font-size: 1.2rem;
    }

    .empty-info {
        color: #a0aec0;
        margin: 0;
    }

    .returns-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .return-card {
        background: #111827;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 16px;
    }

    .return-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 12px;
        color: #ffffff;
    }

    .return-card p {
        margin: 8px 0;
        color: #cbd5e1;
    }

    .return-items {
        margin-top: 12px;
        color: #cbd5e1;
    }

    .return-items ul {
        margin: 8px 0 0 20px;
        padding: 0;
    }

    .return-actions {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }

    .approve-return-btn {
        background: #256bec;
        color: white;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
    }

    .approve-return-btn:hover {
        background: #0238c0;
    }

    .reject-return-btn {
    background: #e53e3e;
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    }

    .reject-return-btn:hover {
        background: #c53030;
    }

</style>