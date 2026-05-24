export const load = async ({ locals: { safeGetSession, supabase } }) => {
    const { session, user } = await safeGetSession();

    // Kategorie muszą być w layout, żeby Navbar je widział na każdej stronie
    const { data: categories } = await supabase.from('categories').select('*');

    return {
        session,
        user,
        categories: categories || []
    };
};