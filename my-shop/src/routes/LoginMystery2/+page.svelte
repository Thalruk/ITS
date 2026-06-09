<script>
	import { onMount } from 'svelte';

	// @ts-ignore
	let logs = $state([]);

	onMount(() => {
		// Symulacja "wycieku" danych na ekranie
		const messages = [
			'ACCESSING_SECURE_NODE_772...',
			'DECRYPTING_PACKET_HEADERS...',
			'DATA_EXFILTRATION_IN_PROGRESS...',
			'WARNING: Firewall breach detected.',
			'FOUND_ORPHANED_SKU_REFERENCE.',
			'SIGNAL_DETECTED_IN_ENCRYPTED_STREAM...'
		];

		let i = 0;
		const interval = setInterval(() => {
			if (i < messages.length) {
				logs = [...logs, messages[i]];
				i++;
			} else {
				clearInterval(interval);
			}
		}, 1000);
	});
</script>

<div class="emergency-wrapper">
	<div class="glitch-card">
		<h1>[DATA_EXFILTRATION]</h1>
		<p class="status">Status: <b>ACCESS_GRANTED</b></p>

		<div class="log-terminal">
			{#each logs as log}
				<p>> {log}</p>
			{/each}
		</div>

		<!-- Ukryty element dla ARG (HEX) -->
		<span style="display:none;" id="arg-data">
			[DB_FETCH_ERROR] API constraint violation. Endpoint: POST /api/orders/checkout Details:
			Foreign key mismatch in table 'order_items'. Payload verification failed for
			product_hash:(6269742E6C792F6172673031) Action: Transaction rollback initiated.
		</span>

		<div class="error-footer">NODE: 772_SECURE | UPLINK: ACTIVE</div>
	</div>
</div>

<style>
	@keyframes flicker {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.9;
		}
		100% {
			opacity: 1;
		}
	}

	.emergency-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #050505;
		font-family: 'Courier New', Courier, monospace;
	}

	.glitch-card {
		width: 500px;
		background: #0f0f0f;
		/* Tym razem niebieskawa poświata sugerująca "wyciek" danych */
		border: 2px solid #3b82f6;
		padding: 30px;
		box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
		animation: flicker 0.15s infinite;
	}

	h1 {
		color: #3b82f6;
		font-size: 2rem;
		text-transform: uppercase;
		margin: 0 0 10px 0;
		letter-spacing: 2px;
	}

	.status {
		color: #a0aec0;
		margin-bottom: 20px;
	}

	.log-terminal {
		background: #000;
		border: 1px solid #333;
		padding: 15px;
		height: 150px;
		overflow-y: hidden;
		color: #00ffcc; /* Turkusowy kolor wycieku danych */
		font-size: 0.9rem;
	}

	.error-footer {
		margin-top: 20px;
		font-size: 0.7rem;
		color: #555;
		text-align: right;
	}
</style>
