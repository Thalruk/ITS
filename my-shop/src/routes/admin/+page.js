import { supabase } from '$lib/supabaseClient';

export async function load() {
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    const { data: delivery } = await supabase
        .from('delivery_methods')
        .select('*')
        .eq('is_active', true);

    const { data: tasks } = await supabase
        .from('admin_tasks')
        .select('*')
        .order('created_at', { ascending: false });

    const { data: inquiries } = await supabase
        .from('product_inquiries')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

    const { data: paymentMethods } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true);

    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
            id,
            created_at,
            total_amount,
            status,
            addresses(street, city, postal_code),
            order_items(
                id,
                product_id,
                quantity,
                price_at_time,
                products(name)
            )
        `)
        .order('created_at', { ascending: false });

    if (ordersError) {
        console.error('Błąd pobierania zamówień w panelu admina:', ordersError.message);
    }

    return {
        products: products ?? [],
        deliveryMethods: delivery ?? [],
        adminTasks: tasks ?? [],
        inquiries: inquiries ?? [],
        paymentMethods: paymentMethods ?? [],
        orders: orders ?? []
    };
}