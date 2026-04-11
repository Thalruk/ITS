import { createServerClient } from '@supabase/ssr';
import { type Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      }
    }
  });

  event.locals.safeGetSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    if (!session) return { session: null, user: null };

    const { data: { user }, error } = await event.locals.supabase.auth.getUser();
    if (error || !user) return { session: null, user: null };

    const role = user.app_metadata?.role || 'User';

    return { session, user: { ...user, role } };
  };

  // --- OPCJONALNA BRAMKA BEZPIECZEŃSTWA ---
  // Jeśli masz ścieżki, na które wejść może TYLKO admin (np. pliki w folderze src/routes/admin/...)
  // Możesz odblokować ten kod poniżej, żeby odrzucać niechcianych gości już na wejściu:

  /*
  const { user } = await event.locals.safeGetSession();
  if (event.url.pathname.startsWith('/admin') && user?.role?.toLowerCase() !== 'admin') {
      return new Response('Brak uprawnień', { status: 403 });
      // lub użyj redirect z @sveltejs/kit:
      // throw redirect(303, '/'); 
  }
  */

  return resolve(event);
};