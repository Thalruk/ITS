<script lang="ts">
	let cartItems = $state([
		{ name: 'Basic T-Shirt', price: 49.99, quantity: 2 },
		{ name: 'Running Shoes', price: 189.99, quantity: 1 },
		{ name: 'Baseball Cap', price: 29.99, quantity: 3 }
	]);
	const totalPrice = $derived(
		cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);

	function increaseQuantity(index: number) {
		cartItems[index].quantity += 1;
	}

	function decreaseQuantity(index: number) {
		if (cartItems[index].quantity === 0) {
			return;
		}

		cartItems[index].quantity -= 1;
	}

	function removeItem(index: number) {
		cartItems.splice(index, 1);
	}
</script>

<svelte:head>
	<title>Shopping Cart</title>
</svelte:head>

<h1>Shopping Cart</h1>

<table style="border-collapse: separate; border-spacing: 0.75rem;">
	<thead>
		<tr>
			<th style="padding: 0.75rem 1rem; border: 1px solid #ccc;">Name</th>
			<th style="padding: 0.75rem 1rem; border: 1px solid #ccc;">Price</th>
			<th style="padding: 0.75rem 1rem; border: 1px solid #ccc; text-align: center;">Quantity</th>
			<th style="padding: 0.75rem 1rem; border: 1px solid #ccc;">Action</th>
		</tr>
	</thead>
	<tbody>
		{#each cartItems as item, index}
			<tr>
				<td style="padding: 0.75rem 1rem; border: 1px solid #ccc;">{item.name}</td>
				<td style="padding: 0.75rem 1rem; border: 1px solid #ccc;">${item.price}</td>
				<td style="padding: 0.75rem 1rem; border: 1px solid #ccc; text-align: center;">
					<div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
						<button
							type="button"
							onclick={() => decreaseQuantity(index)}
							disabled={item.quantity === 0}
						>
							-
						</button>
						<span>{item.quantity}</span>
						<button type="button" onclick={() => increaseQuantity(index)}>+</button>
					</div>
				</td>
				<td style="padding: 0.75rem 1rem; border: 1px solid #ccc;">
					<button type="button" onclick={() => removeItem(index)}>Remove</button>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<p>Total: ${totalPrice.toFixed(2)}</p>

<a href="/">Back to home</a>
