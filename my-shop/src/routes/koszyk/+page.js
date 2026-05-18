import { supabase } from '$lib/supabaseClient';

export async function load() {
  const { data: delivery } = await supabase.from('delivery_methods').select('*').eq('is_active', true);
  const { data: paymentMethods } = await supabase.from('payment_methods').select('*').eq('is_active', true);

  return {
    deliveryMethods: delivery ?? [],
    paymentMethods: paymentMethods ?? []
  };
}
