import { supabase } from '$lib/supabaseClient';

export async function load({ params }) {
	const categoryName = params.nazwa_kategorii;

	const { data: category, error: categoryError } = await supabase
		.from('categories')
		.select('id, name')
		.eq('name', categoryName)
		.single();

	const { data: categories } = await supabase
		.from('categories')
		.select('id, name')
		.order('name', { ascending: true });

	if (categoryError || !category) {
		console.error('Błąd pobierania kategorii:', categoryError);
		return {
			categoryName,
			categories: categories || [],
			products: []
		};
	}

	const { data: products, error } = await supabase
		.from('products')
		.select('*, categories(name)')
		.eq('category', category.id);

	if (error) {
		console.error('Błąd pobierania gier z kategorii:', error);
		return {
			categoryName: category.name,
			categories: categories || [],
			products: []
		};
	}

	return {
		categoryName: category.name,
		categories: categories || [],
		products: products || []
	};
}