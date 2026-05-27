import { supabase } from '$lib/supabaseClient';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {

    // Prosimy Supabase o jeden produkt o ID z linku
    const { data: product, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', params.id)
        .single(); 

    if (error) {
        return { product: null }; 
    }

    return { product };
}