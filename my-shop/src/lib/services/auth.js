import { supabase } from '$lib/supabaseClient';

/** * Loguje użytkownika na konto testowe.
 * @param {string} email 
 */
export async function loginAs(email) {
    const { error } = await supabase.auth.signInWithPassword({ 
        email: email, 
        password: 'haslo123' 
    });

    if (error) {
        alert('Błąd logowania: Upewnij się, że konto istnieje w Supabase!');
    } else {
        location.reload();
    }
}

/** * Wylogowuje użytkownika.
 */
export async function logout() {
    await supabase.auth.signOut();
    location.reload();
}