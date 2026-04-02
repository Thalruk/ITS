import { supabase } from '$lib/supabaseClient';

export async function load() {
  // To zapytanie działa jak "Wybierz wszystko (*) z tabeli products"
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error("Błąd pobierania produktów:", error);
  }

  // Zwracamy produkty, dzięki czemu będą dostępne w naszym pliku HTML (Svelte)
  return {
    products: products ?? []
  };
}