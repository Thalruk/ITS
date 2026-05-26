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
 * Wysyła obraz produktu do Supabase Storage i zwraca publiczny adres pliku.
 * @param {File | null | undefined} imageFile
 */
async function uploadProductImage(imageFile) {
    if (!imageFile) {
        return 'https://via.placeholder.com/150';
    }

    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile);

    if (uploadError) {
        throw new Error('Błąd wysyłania obrazu: ' + uploadError.message);
    }

    const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

    return data.publicUrl;
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

    const parsedPrice = parseFloat(editingProduct.price);
    const parsedStock = parseInt(editingProduct.stock_quantity) || 0;

    if (parsedPrice < 0 || parsedStock < 0) {
        alert('Błąd: Cena oraz ilość sztuk nie mogą być ujemne!');
        return false;
    }

    let imageUrl = editingProduct.image_url;

    if (editingProduct.image_file) {
        try {
            imageUrl = await uploadProductImage(editingProduct.image_file);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Nieznany błąd wysyłania obrazu';
            alert(message);
            return false;
        }
    }

    const { error } = await supabase
        .from('products')
        .update({
            name: editingProduct.name,
            description: editingProduct.description,
            price: parsedPrice,
            image_url: imageUrl,
            category: editingProduct.category ? Number(editingProduct.category) : null,
            stock_quantity: parsedStock
        })
        .eq('id', editingProduct.id);

    if (error) {
        alert('Błąd aktualizacji: ' + error.message);
        return false;
    }

    alert('Zapisano zmiany!');
    invalidateAll();
    return true;
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
 * Tworzy kopię istniejącego produktu.
 * Kopia jest domyślnie ukryta, żeby klient nie widział jej przed edycją.
 * @param {any} product
 */
export async function cloneProduct(product) {
    if (!confirm('Czy na pewno chcesz sklonować ten produkt?')) return false;

    const baseName = product.name.replace(/\s-\skopia\s\d+$/i, '').replace(/\s-\skopia$/i, '');

    const { data: existingCopies, error: fetchError } = await supabase
        .from('products')
        .select('name')
        .ilike('name', `${baseName} - kopia%`);

    if (fetchError) {
        alert('Błąd sprawdzania istniejących kopii: ' + fetchError.message);
        return false;
    }

    const copyNumbers = (existingCopies || [])
        .map((copy) => {
            const match = copy.name.match(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} - kopia (\\d+)$`, 'i'));
            return match ? Number(match[1]) : 0;
        });

    const nextCopyNumber = copyNumbers.length > 0 ? Math.max(...copyNumbers) + 1 : 1;
    const clonedName = `${baseName} - kopia ${nextCopyNumber}`;

    const { error } = await supabase.from('products').insert([{
        name: clonedName,
        description: product.description,
        price: product.price,
        lowest_price_30d: product.lowest_price_30d ?? product.price,
        promo_price: product.promo_price ?? 0,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url,
        category: product.category,
        is_new: product.is_new ?? false,
        is_used: product.is_used ?? false,
        is_hidden: true
    }]);

    if (error) {
        alert('Błąd klonowania produktu: ' + error.message);
        return false;
    }

    alert(`Produkt został sklonowany.`);
    invalidateAll();
    return true;
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

    if (!productData.newCat) {
        alert('Wybierz gatunek gry!');
        return false;
    }

    const parsedPrice = parseFloat(productData.newPrice);
    const parsedStock = parseInt(productData.newStock) || 0;

    if (parsedPrice < 0 || parsedStock < 0) {
        alert('Błąd: Cena oraz ilość sztuk nie mogą być ujemne!');
        return false;
    }

    let imageUrl;

    try {
        imageUrl = await uploadProductImage(productData.newImageFile);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Nieznany błąd wysyłania obrazu';
        alert(message);
        return false;
    }

    const { error } = await supabase.from('products').insert([{
        name: productData.newName,
        description: productData.newDesc,
        price: parsedPrice,
        lowest_price_30d: parsedPrice,
        stock_quantity: parsedStock,
        image_url: imageUrl,
        category: productData.newCat ? Number(productData.newCat) : null
    }]);

    if (error) {
        alert('Błąd dodawania: ' + error.message);
        return false;
    }

    alert('Produkt został dodany.');

    invalidateAll();
    return true;
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
        .update({ status: 'return_rejected' })
        .eq('id', order.id);

    if (error) {
        alert('Błąd odrzucania zwrotu: ' + error.message);
        return false;
    }

    alert('Zwrot został odrzucony.');
    invalidateAll();
    return true;
}