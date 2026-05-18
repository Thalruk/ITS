import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return fail(400, { error: 'Błędny email lub hasło' });
        }

        // Po poprawnym zalogowaniu wracamy na stronę główną
        throw redirect(303, '/');
    }
};