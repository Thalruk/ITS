import { supabase } from '$lib/supabaseClient';

export async function load({ locals: { safeGetSession, supabase } }) {
  const { user } = await safeGetSession();
  let userRole = 'user'; // Domyślnie zwykły user

  if (user) {
    // Pobieramy Twoją nową kolumnę 'user_role'
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profile && !error) {
      // Przypisujemy wartość z bazy (admin lub user)
      userRole = profile.user_role;
    }
  }

  // Pobieranie produktów bez zmian
  const { data: products } = await supabase.from('products').select('*');

  return {
    products: products ?? [],
    // Przekazujemy wzbogacony obiekt usera do frontendu
    user: user ? { ...user, role: userRole } : null
  };
}