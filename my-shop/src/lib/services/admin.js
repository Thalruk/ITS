import { supabase } from '$lib/supabaseClient';
import { invalidateAll } from '$app/navigation';

/**
 * Zmienia widoczność produktu (ukryty/widoczny).
 * @param {any} product - Obiekt produktu z bazy danych
 */
export async function toggleVisibility(product) {
    const newStatus = product.is_hidden === true ? false : true;
    const actionText = newStatus ? 'ukryć ten produkt przed klientami' : 'przywrócić widoczność tego produktu';
    
    if (!confirm(`Czy na pewno chcesz ${actionText}?`)) return;

    const { error } = await supabase
        .from('products')
        .update({ is_hidden: newStatus })
        .eq('id', product.id);

    if (error) {
        alert('Błąd bazy danych: ' + error.message);
    } else {
        alert('Zapisano w bazie! Odświeżam stronę.');
        invalidateAll();
    }
}

/**
 * Zapisuje zmiany w edytowanym produkcie.
 * @param {any} editingProduct - Obiekt edytowanego produktu
 */
export async function saveEdit(editingProduct) {
    if (!editingProduct.name || !editingProduct.price) {
        alert('Podaj nazwę i cenę!');
        return false;
    }

    const { error } = await supabase
        .from('products')
        .update({
            name: editingProduct.name,
            description: editingProduct.description,
            price: parseFloat(editingProduct.price),
            image_url: editingProduct.image_url,
            category: editingProduct.category,
            stock_quantity: parseInt(editingProduct.stock_quantity) || 0
        })
        .eq('id', editingProduct.id);

    if (error) {
        alert('Błąd aktualizacji: ' + error.message);
        return false;
    } else {
        alert('Zapisano zmiany!');
        invalidateAll();
        return true;
    }
}

/**
 * Usuwa produkt z bazy danych.
 * @param {any} productId - ID produktu (liczba lub tekst)
 */
export async function deleteProduct(productId) {
    if (!confirm('UWAGA: Czy na pewno chcesz całkowicie usunąć ten produkt z bazy danych? Tej akcji nie można cofnąć!')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      alert('Błąd podczas usuwania: ' + error.message);
    } else {
      invalidateAll();
    }
}

/**
 * Dodaje nowy produkt do bazy.
 * @param {any} productData - Obiekt z danymi nowego produktu
 */
export async function addProduct(productData) {
    if (!productData.newName || !productData.newPrice) {
        alert('Podaj nazwę i cenę!');
        return false;
    }

    const parsedPrice = parseFloat(productData.newPrice);
    const parsedStock = parseInt(productData.newStock) || 0;

    if (parsedPrice < 0 || parsedStock < 0) {
      alert('Błąd: Cena oraz ilość sztuk nie mogą być ujemne!');
      return false;
    }

    const { error } = await supabase.from('products').insert([{ 
      name: productData.newName, 
      description: productData.newDesc, 
      price: parsedPrice, 
      stock_quantity: parsedStock, 
      image_url: productData.newImg || 'https://via.placeholder.com/150', 
      category: productData.newCat 
    }]);

    if (error) {
      alert('Błąd dodawania: ' + error.message);
      return false;
    } else {
      invalidateAll();
      return true;
    }
}

/**
 * Zatwierdza zwrot zamówienia i przywraca produkty do magazynu.
 * @param {any} order
 */
export async function approveReturn(order) {
    if (!confirm('Czy na pewno chcesz zatwierdzić ten zwrot?')) return false;

    for (const item of order.order_items) {
        if (!item.product_id) continue;

        const { data: product, error: productError } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

        if (productError || !product) {
            alert('Błąd pobierania produktu: ' + (productError?.message || 'Nie znaleziono produktu'));
            return false;
        }

        const newStockQuantity = Number(product.stock_quantity || 0) + Number(item.quantity || 0);

        const { data: updatedProduct, error: stockError } = await supabase
            .from('products')
            .update({
                stock_quantity: newStockQuantity
            })
            .eq('id', item.product_id)
            .select('id, name, stock_quantity')
            .single();

        if (stockError || !updatedProduct) {
            alert('Błąd aktualizacji magazynu: ' + (stockError?.message || 'Produkt nie został zaktualizowany'));
            return false;
        }
    }

    const { error: statusError } = await supabase
        .from('orders')
        .update({ status: 'returned' })
        .eq('id', order.id);

    if (statusError) {
        alert('Błąd zatwierdzania zwrotu: ' + statusError.message);
        return false;
    }

    alert('Zwrot został zatwierdzony.');
    invalidateAll();
    return true;
}

/**
 * Odrzuca zgłoszenie zwrotu zamówienia.
 * Zamówienie wraca do statusu opłaconego, a magazyn nie jest zmieniany.
 * @param {any} order
 */
export async function rejectReturn(order) {
    if (!confirm('Czy na pewno chcesz odrzucić ten zwrot?')) return false;

    const { error } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order.id);

    if (error) {
        alert('Błąd odrzucania zwrotu: ' + error.message);
        return false;
    }

    alert('Zwrot został odrzucony.');
    invalidateAll();
    return true;
}