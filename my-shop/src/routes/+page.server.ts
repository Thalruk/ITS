export const actions = {
	logout: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
	}
};

export const load = async ({ locals: { supabase } }) => {
	// Główna strona musi pobierać produkty, metody dostawy, zapytania, płatności i kategorie
	const [products, delivery, tasks, inquiries, payment, categories] = await Promise.all([
		supabase
			.from('products')
			.select('*, categories(name)')
			.order('created_at', { ascending: false }),

		supabase
			.from('delivery_methods')
			.select('*')
			.eq('is_active', true),

		supabase
			.from('admin_tasks')
			.select('*')
			.order('created_at', { ascending: false }),

		supabase
			.from('product_inquiries')
			.select('*')
			.order('created_at', { ascending: false }),

		supabase
			.from('payment_methods')
			.select('*')
			.eq('is_active', true),

		supabase
			.from('categories')
			.select('*')
			.order('name', { ascending: true })
	]);

	return {
		products: products.data ?? [],
		deliveryMethods: delivery.data ?? [],
		adminTasks: tasks.data ?? [],
		inquiries: inquiries.data ?? [],
		paymentMethods: payment.data ?? [],
		categories: categories.data ?? []
	};
};