import { supabase } from '$lib/supabaseClient';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    // --- NASZ SZPIEG: Pobiera wszystkie gry tylko po to, żebyś poznał ich ID ---
    const { data: allProducts } = await supabase.from('products').select('id, name');
    console.log("👉 DOSTĘPNE GRY W BAZIE:", allProducts);
    // ---------------------------------------------------------------------------

    // Prosimy Supabase o jeden produkt o ID z linku
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single(); 

    if (error) {
        return { product: null }; 
    }

    return { product };
}