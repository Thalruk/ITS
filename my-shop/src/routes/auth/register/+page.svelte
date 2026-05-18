<script>
	let { form } = $props(); // Svelte 5: odbieramy błędy lub sukces z serwera
</script>

<div class="mx-auto mt-20 max-w-md rounded border p-6 shadow">
	<h1 class="mb-4 text-2xl font-bold">Stwórz konto</h1>

	{#if form?.error}
		<p class="mb-4 text-red-500">{form.error}</p>
	{/if}
	{#if form?.success}
		<p class="mb-4 text-green-500">{form.message}</p>
	{/if}

	<form method="POST" class="flex flex-col gap-4">
		<input name="email" type="email" placeholder="Email" required class="border p-2" />
		<input name="password" type="password" placeholder="Hasło" required class="border p-2" />
		<button type="submit" class="rounded bg-blue-600 p-2 text-white">Zarejestruj się</button>
	</form>
	<a href="/logowanie" class="mt-4 block text-sm underline">Masz już konto? Zaloguj się</a>
</div>
<pre>{JSON.stringify(form, null, 2)}</pre>
