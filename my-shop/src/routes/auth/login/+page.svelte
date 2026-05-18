<script>
	let { form } = $props();
</script>

<div class="auth-container">
	<form method="POST">
		<h1>Zaloguj się</h1>

		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}

		<input name="email" type="email" placeholder="Email" required />
		<input name="password" type="password" placeholder="Hasło" required />

		<button type="submit">Wejdź do sklepu</button>
	</form>
	<p>Nie masz konta? <a href="/auth/register">Zarejestruj się</a></p>
</div>

<style>
	.auth-container {
		max-width: 400px;
		margin: 50px auto;
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 8px;
	}
	input {
		display: block;
		width: 100%;
		margin-bottom: 10px;
		padding: 8px;
	}
	button {
		width: 100%;
		padding: 10px;
		background: #3182ce;
		color: white;
		border: none;
		cursor: pointer;
	}
	.error {
		color: red;
		font-size: 0.9rem;
	}
</style>
