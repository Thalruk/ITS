<script>
    import AdminPanel from '$lib/components/AdminPanel.svelte';
    import { addProduct } from '$lib/services/admin.js';

    /** @type {{ data: any }} */
    let { data } = $props();

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
            newImg: productData.image_url,
            newCat: productData.category
        });

        if (success) {
            resetForm();
        }
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

</style>