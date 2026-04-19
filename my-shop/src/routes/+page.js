import { supabase } from '$lib/supabaseClient';

export async function load() {
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  const { data: delivery } = await supabase.from('delivery_methods').select('*').eq('is_active', true);
  const { data: tasks } = await supabase.from('admin_tasks').select('*').order('created_at', { ascending: false });
  const { data: inquiries } = await supabase.from('product_inquiries').select('*, products(name)').order('created_at', { ascending: false });
  const { data: paymentMethods } = await supabase.from('payment_methods').select('*').eq('is_active', true);

  return {
    products: products ?? [],
    deliveryMethods: delivery ?? [],
    adminTasks: tasks ?? [],
    inquiries: inquiries ?? [],
    paymentMethods: paymentMethods || []
  };
}