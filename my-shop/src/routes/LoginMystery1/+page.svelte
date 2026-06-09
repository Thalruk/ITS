<script>
	import { onMount } from 'svelte';

	// @ts-ignore
	let logs = $state([]);

	onMount(() => {
		// Pierwszy log (ASCII)
		console.warn(`[CRON_JOB: STOCK_AUDIT_772]
ALERT: Critical synchronization error in Shop Engine. 
Manual intervention required. 

Warning: Data corruption detected in table 'products'. 
Re-calculating stock_quantity values for orphaned SKUs:
Item #01 updated stock_quantity: 98
Item #02 updated stock_quantity: 105
Item #03 updated stock_quantity: 116
Item #04 updated stock_quantity: 46
Item #05 updated stock_quantity: 108
Item #06 updated stock_quantity: 121
Item #07 updated stock_quantity: 47
Item #08 updated stock_quantity: 97
Item #09 updated stock_quantity: 114
Item #10 updated stock_quantity: 103
Item #11 updated stock_quantity: 48
Item #12 updated stock_quantity: 50
Audit complete. Syncing UI...`);

		// Logi do konsoli (dodatkowe ostrzeżenie)
		console.warn(`[CRON_JOB: STOCK_AUDIT_772] Critical synchronization error...`);

		// Symulacja sypiącego się systemu na ekranie
		const messages = [
			'INITIALIZING_DEBUG_MODE...',
			"FATAL_ERROR: Table 'products' corrupt.",
			'Attempting rollback...',
			'FAILED. Connection lost to Supabase.',
			'CRITICAL_FAILURE: System unstable.',
			'PLEASE_SEND_HELP_TO_ARG01...'
		];

		let i = 0;
		const interval = setInterval(() => {
			if (i < messages.length) {
				logs = [...logs, messages[i]];
				i++;
			} else {
				clearInterval(interval);
			}
		}, 800);
	});
</script>

<div class="emergency-wrapper">
	<div class="glitch-card">
		<h1>[SYSTEM_FAILURE]</h1>
		<p class="status">Status: <b>CRITICAL_ERROR</b></p>

		<div class="log-terminal">
			{#each logs as log}
				<p>> {log}</p>
			{/each}
		</div>

		<div class="error-footer">CODE: 0x88F29A | NODE: 772</div>

		<!-- Ukryty element dla ARG (HEX) -->
		<span style="display:none;" id="arg-data">
			[DB_FETCH_ERROR] API constraint violation. Endpoint: POST /api/orders/checkout Details:
			Foreign key mismatch in table 'order_items'. Payload verification failed for
			product_hash:(6269742E6C792F6172673031) Action: Transaction rollback initiated.
		</span>
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
		border: 2px solid #ff3333;
		padding: 30px;
		box-shadow: 0 0 20px rgba(255, 51, 51, 0.2);
		animation: flicker 0.15s infinite;
	}

	h1 {
		color: #ff3333;
		font-size: 2rem;
		text-transform: uppercase;
		margin: 0 0 10px 0;
		letter-spacing: 2px;
	}

	.status {
		color: #ffaaaa;
		margin-bottom: 20px;
	}

	.log-terminal {
		background: #000;
		border: 1px solid #333;
		padding: 15px;
		height: 150px;
		overflow-y: hidden;
		color: #00ff00;
		font-size: 0.9rem;
	}

	.error-footer {
		margin-top: 20px;
		font-size: 0.7rem;
		color: #555;
		text-align: right;
	}
</style>
