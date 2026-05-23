import { supabase } from '$lib/supabaseClient';

export async function load() {
    // Pobieramy listę kategorii (gatunków gier) z tabeli 'categories'
    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true });

    if (error) {
        console.error('Błąd podczas pobierania kategorii dla nawigacji:', error);
        return {
            categories: []
        };
    }

    return {
        categories
    };
}
