import { supabase } from '$lib/supabaseClient';

export async function load({ params }) {
    const categoryName = params.nazwa_kategorii;

    const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('name', categoryName)
        .single();

    if (categoryError || !category) {
        console.error('Blad pobierania kategorii:', categoryError);
        return {
            categoryName,
            products: []
        };
    }

    const { data: products, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('category', category.id);

    if (error) {
        console.error('Blad pobierania gier z kategorii:', error);
        return {
            categoryName: category.name,
            products: []
        };
    }

    return {
        categoryName: category.name,
        products: products || []
    };
}
