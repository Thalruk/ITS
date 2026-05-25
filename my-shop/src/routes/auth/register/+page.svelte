<script>
	import { resolve } from '$app/paths';

	let { form } = $props();
</script>

<div class="auth-container">
	<div class="auth-card">
		<h1>Stwórz konto</h1>

		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}

		{#if form?.success}
			<p class="success">{form.message}</p>
		{/if}

		<form method="POST">
			<input name="email" type="email" placeholder="Email" required />
			<input name="password" type="password" placeholder="Hasło" required />

			<button type="submit" class="register-submit-btn">Zarejestruj się</button>
		</form>

		<p class="auth-switch">
			Masz już konto? <a href={resolve('/auth/login')}>Zaloguj się</a>
		</p>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		min-height: 60vh;
		padding-top: 70px;
	}

	.auth-card {
		width: 460px;
		background: #0f0f14;
		border: 1px solid #cbd5e0;
		border-radius: 6px;
		padding: 24px;
		box-sizing: border-box;
	}

	.auth-card h1 {
		margin: 0 0 20px 0;
		font-size: 1.6rem;
		font-weight: 800;
		color: #ffffff;
	}

	.auth-card form {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.auth-card input {
		width: 100%;
		box-sizing: border-box;
		background: #0f0f14;
		border: 1px solid #ffffff;
		color: #ffffff;
		padding: 12px;
		font-size: 0.95rem;
	}

	.auth-card input::placeholder {
		color: #a0aec0;
	}

	.auth-card input:focus {
		outline: none;
		border-color: #0d9488;
		box-shadow: 0 0 0 1px #0d9488;
	}

	.auth-card button {
		width: 100%;
		border: none;
		border-radius: 4px;
		padding: 12px;
		color: #ffffff;
		font-weight: 700;
		cursor: pointer;
		font-size: 0.95rem;
	}

	.register-submit-btn {
		background: #0f766e;
	}

	.register-submit-btn:hover {
		background: #0d9488;
	}

	.auth-switch {
		margin-top: 14px;
		margin-bottom: 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.auth-switch a {
		color: #ffffff;
		font-weight: 800;
		text-decoration: underline;
	}

	.auth-switch a:hover {
		color: #00ffcc;
	}

	.error {
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid #ef4444;
		color: #fecaca;
		padding: 10px;
		border-radius: 4px;
		margin-bottom: 14px;
	}

	.success {
		background: rgba(34, 197, 94, 0.15);
		border: 1px solid #22c55e;
		color: #bbf7d0;
		padding: 10px;
		border-radius: 4px;
		margin-bottom: 14px;
	}
</style>