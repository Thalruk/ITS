import { supabase } from '$lib/supabaseClient';

export async function load() {
	/* Zagadka 4 */
	const { data: product, error } = await supabase
		.from('products')
		.select('name, price, promo_price')
		.eq('name', 'Tomb Raider')
		.single();

	if (error || !product) {
		console.error('Błąd pobierania produktu do zagadki 4:', error);

		return {
			requiredLogoClicks: 15
		};
	}

	const price = Number(product.price);
	const promoPrice = Number(product.promo_price);

	if (!Number.isFinite(price) || !Number.isFinite(promoPrice) || promoPrice <= 0 || promoPrice >= price) {
		return {
			requiredLogoClicks: 15
		};
	}

	const discountDifference = Math.round(price - promoPrice);

	return {
		requiredLogoClicks: Math.max(1, discountDifference)
	};
}