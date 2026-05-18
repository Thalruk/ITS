import { supabase } from '$lib/supabaseClient';

export async function load() {
    // Zauważ brak .eq('is_featured', true) - pobieramy cały katalog
    const { data: products, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Błąd pobierania katalogu gier:', error);
        return {
            products: [] 
        };
    }

    return {
        products
    };
}