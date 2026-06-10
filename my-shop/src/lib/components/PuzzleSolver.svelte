<script>
    import { secretGameStore } from '$lib/secretStore.svelte.js';
    import { riddlesConfig } from '$lib/riddlesConfig.js';

    /** @type {{ pageName: string }} */
    let { pageName } = $props();

    const currentRiddleConfig = riddlesConfig.find(r => r.pageName === pageName);
    const correctPassword = currentRiddleConfig ? currentRiddleConfig.correctPassword : '';
    // Pobieramy nazwę nagrody z konfiguracji
    const rewardName = currentRiddleConfig ? currentRiddleConfig.rewardName : 'tajną promocję';

    let userPassword = $state('');
    let feedback = $state('');

    let isSolved = $derived(secretGameStore.solvedPages.includes(pageName));

    function handleVerify() {
        const cleanUserAnswer = userPassword.trim().toLowerCase();
        const cleanCorrectPassword = correctPassword.trim().toLowerCase();

        if (!cleanCorrectPassword) {
            feedback = '❌ Błąd: Brak konfiguracji dla tego sektora.';
            return;
        }

        if (cleanUserAnswer === cleanCorrectPassword) {
            secretGameStore.markPageAsSolved(pageName);
            // DYNAMICZNY KOMUNIKAT: Pokazuje graczowi dokładnie co odblokował
            feedback = `🔓 Sektor zdeszyfrowany! Aktywowano: ${rewardName}`;
            userPassword = '';
        } else {
            feedback = '❌ Błędne hasło. Sekwencja odrzucona.';
        }
    }
</script>

<div class="input-zone">
    {#if isSolved}
        <p class="success-message">✓ Sukces! Aktywowano: {rewardName}</p>
    {:else}
        <div class="form-container">
            <input 
                type="text" 
                bind:value={userPassword} 
                placeholder="Wpisz rozwiązanie..." 
                class="terminal-input"
            />
            <button onclick={handleVerify} class="terminal-btn">
                Zatwierdź
            </button>
        </div>
    {/if}

    {#if feedback}
        <p class="feedback-text {isSolved ? 'success' : 'error'}">{feedback}</p>
    {/if}
</div>

<style>
    /* Style pozostają bez zmian (takie same jak w poprzedniej wiadomości) */
    .input-zone { width: 100%; max-width: 400px; font-family: monospace; text-align: center; margin-top: 1rem; }
    .form-container { display: flex; gap: 10px; }
    .terminal-input { flex-grow: 1; background-color: #14141d; border: 1px solid #2a2a35; border-radius: 4px; padding: 0.6rem 1rem; color: #00ffcc; font-family: inherit; outline: none; font-size: 0.95rem; }
    .terminal-input:focus { border-color: #00ffcc; }
    .terminal-btn { background-color: #00ffcc; color: #0f0f14; border: none; padding: 0.6rem 1.2rem; font-weight: bold; border-radius: 4px; cursor: pointer; text-transform: uppercase; font-family: inherit; transition: background-color 0.2s; }
    .terminal-btn:hover { background-color: #00ccaa; }
    .success-message { color: #34d399; font-weight: bold; background: rgba(5, 150, 105, 0.1); border: 1px solid #059669; padding: 0.75rem; border-radius: 4px; margin: 0; }
    .feedback-text { margin: 0.75rem 0 0 0; font-size: 0.85rem; font-weight: bold; }
    .feedback-text.success { color: #34d399; }
    .feedback-text.error { color: #f87171; }
</style>