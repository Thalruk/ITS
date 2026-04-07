import { supabase } from '$lib/supabaseClient';

export async function load() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error("Błąd pobierania produktów:", error);
  }

  return {
    products: products ?? []
  };
}