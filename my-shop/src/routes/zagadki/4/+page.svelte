<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	/** @typedef {{ id: number, x: number, size: number, duration: number }} Coin */

	/** @type {{ data: { requiredLogoClicks: number } }} */
	let { data } = $props();

	let logoClicks = $state(0);
	let gameUnlocked = $state(false);
	let gameStarted = $state(false);
	let gameFinished = $state(false);
	let gameFailed = $state(false);
	let collectedCoins = $state(0);
	
    const gameTime = 30;
    let timeLeft = $state(gameTime);

	/** @type {Coin[]} */
	let coins = $state([]);

	let requiredLogoClicks = $derived(data.requiredLogoClicks);

	const coinsToCollect = 50;
	const coinSpawnIntervalMs = 500;

	/** @type {ReturnType<typeof setInterval> | null} */
	let spawnTimer = null;

	/** @type {ReturnType<typeof setInterval> | null} */
	let gameTimer = null;

	let nextCoinId = 1;

	function handleRiddleLogoClick() {
		if (gameUnlocked) return;

		logoClicks += 1;

		if (logoClicks >= requiredLogoClicks) {
			gameUnlocked = true;
		}
	}

	function startGame() {
		gameStarted = true;
		gameFinished = false;
		gameFailed = false;
		collectedCoins = 0;
		timeLeft = gameTime;
		coins = [];
		nextCoinId = 1;

		spawnCoin();

		spawnTimer = setInterval(() => {
			spawnCoin();
		}, coinSpawnIntervalMs);

		gameTimer = setInterval(() => {
			timeLeft -= 1;

			if (timeLeft <= 0) {
				failGame();
			}
		}, 1000);
	}

	function spawnCoin() {
		if (!gameStarted || gameFinished || gameFailed) return;

		const coin = {
			id: nextCoinId,
			x: Math.floor(Math.random() * 88) + 4,
			size: Math.floor(Math.random() * 12) + 48,
			duration: Math.random() * 0.8 + 1.7
		};

		nextCoinId += 1;
		coins = [...coins, coin];

		setTimeout(() => {
			coins = coins.filter((currentCoin) => currentCoin.id !== coin.id);
		}, coin.duration * 1000);
	}

	/** @param {number} coinId */
	function collectCoin(coinId) {
		if (!gameStarted || gameFinished || gameFailed) return;

		coins = coins.filter((coin) => coin.id !== coinId);
		collectedCoins += 1;

		if (collectedCoins >= coinsToCollect) {
			finishGame();
		}
	}

	function finishGame() {
		gameFinished = true;
		gameStarted = false;
		clearGameTimers();
		coins = [];
	}

	function failGame() {
		gameFailed = true;
		gameStarted = false;
		clearGameTimers();
		coins = [];
	}

	function clearGameTimers() {
		if (spawnTimer) {
			clearInterval(spawnTimer);
			spawnTimer = null;
		}

		if (gameTimer) {
			clearInterval(gameTimer);
			gameTimer = null;
		}
	}

	function goNext() {
		goto(resolve('/zagadki/placeholder'));
	}

	onMount(() => {
		window.addEventListener('riddle4-logo-click', handleRiddleLogoClick);

		return () => {
			window.removeEventListener('riddle4-logo-click', handleRiddleLogoClick);
			clearGameTimers();
		};
	});
</script>

<svelte:head>
	<title>Zagadka 4</title>
</svelte:head>

<section class="riddle-page">
	<div class="riddle-card">
		<p class="riddle-number">Zagadka 4</p>

		<h1>Uciekające Bogactwo</h1>

        <p class="hint">
            PIENIĄDZ NIE zawsze UTRZYMUJE swoją wartość.
            Zawsze jednak mami obietnicą POWROTU DO DOMU bogatszym.
        </p>

        <p class="hint">
            Znajdź GROBOWIEC. Pamięta WARTOŚĆ swojego skarbu, zanim została ZMNIEJSZONA.
            Tęskni za zabraną RÓŻNICĄ. 
        </p>

        <p class="hint">
            Zderzające się złoto wybiło melodię, gdy poszukiwacz WCISKAŁ je kolejno do sakiewki.
            Wróć tutaj i ją powtórz. To otworzy skarbiec.
        </p>

        <p class="hint">
            Później zostaje już tylko próba Twojej szybkości.
        </p>

        {#if !gameUnlocked}
            <div class="status-box">
                <p>Skarbiec milczy. Jeszcze nie usłyszał właściwego rytmu...</p>
            </div>
        {/if}

        {#if gameUnlocked && !gameStarted && !gameFinished && !gameFailed}
            <div class="success-box">
                <h2>Minigra odblokowana</h2>
                <p>Skarb już czeka. Zbierz {coinsToCollect} monet, zanim skończy się czas.</p>

                <button class="start-btn" type="button" onclick={startGame}>
                    Rozpocznij
                </button>
            </div>
        {/if}

        {#if gameStarted}
            <div class="game-panel">
                <div class="game-stats">
                    <span>Monety: <strong>{collectedCoins} / {coinsToCollect}</strong></span>
                    <span>Czas: <strong>{timeLeft}s</strong></span>
                </div>

                <div class="coin-arena">
                    {#each coins as coin (coin.id)}
                        <button
                            type="button"
                            class="falling-coin"
                            style={`left: ${coin.x}%; width: ${coin.size}px; height: ${coin.size}px; animation-duration: ${coin.duration}s;`}
                            aria-label="Zbierz monetę"
                            onpointerdown={(event) => {
                                event.preventDefault();
                                collectCoin(coin.id);
                            }}
                            oncontextmenu={(event) => event.preventDefault()}
                        >
                            🪙
                        </button>
                    {/each}
                </div>
            </div>
        {/if}

        {#if gameFinished}
            <div class="success-box">
                <h2>Minigra ukończona</h2>
                <p>Zebrano {coinsToCollect} monet. Droga dalej została odblokowana.</p>

                <div class="puzzle-text-block">
        			Rozwiązanie: 6721
   				</div>
            </div>
        {/if}

        {#if gameFailed}
            <div class="error-box">
                <h2>Czas minął</h2>
                <p>Zebrano {collectedCoins} / {coinsToCollect} monet. Powodzenia następnym razem.</p>

                <button class="start-btn" type="button" onclick={startGame}>
                    Spróbuj ponownie
                </button>
            </div>
        {/if}
	</div>
</section>

<style>
	.riddle-page {
		min-height: 70vh;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 40px 20px;
	}

	.riddle-card {
		width: min(900px, 100%);
		background: #1a202c;
		border: 1px solid #2d3748;
		border-radius: 14px;
		padding: 32px;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
	}

	.riddle-number {
		color: #00ffcc;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin: 0 0 8px 0;
	}

	h1 {
		margin: 0 0 20px 0;
		font-size: 2rem;
		color: #ffffff;
	}

	.hint {
		color: #cbd5e0;
		font-size: 1.05rem;
		line-height: 1.6;
		margin-bottom: 18px;
	}

	.status-box {
		margin-top: 28px;
		background: #0f1117;
		border: 1px solid #2d3748;
		border-radius: 10px;
		padding: 18px;
		color: #cbd5e0;
	}

	.status-box p {
		margin: 0 0 8px 0;
	}

	.success-box {
		margin-top: 22px;
		background: rgba(34, 197, 94, 0.15);
		border: 1px solid #22c55e;
		color: #bbf7d0;
		border-radius: 10px;
		padding: 18px;
	}

	.success-box h2 {
		margin: 0 0 8px 0;
		color: #bbf7d0;
		font-size: 1.3rem;
	}

	.success-box p {
		margin: 0;
	}

    .start-btn {
	margin-top: 16px;
	background: #00ffcc;
	color: #0f1117;
	border: none;
	border-radius: 8px;
	padding: 12px 20px;
	font-weight: 800;
	cursor: pointer;
    }

    .start-btn:hover {
        background: #38ffe0;
    }

    .game-panel {
        margin-top: 24px;
        background: #0f1117;
        border: 1px solid #2d3748;
        border-radius: 12px;
        padding: 18px;
    }

    .game-stats {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
        color: #cbd5e0;
        font-weight: 700;
    }

    .game-stats strong {
        color: #00ffcc;
    }

    .coin-arena {
        position: relative;
        height: 360px;
        overflow: hidden;
        background: radial-gradient(circle at top, #1a202c 0%, #0f1117 70%);
        border: 1px solid #2d3748;
        border-radius: 12px;
    }

    .falling-coin {
        position: absolute;
        top: -48px;
        border: none;
        background: transparent;
        font-size: 2rem;
        cursor: pointer;
        animation-name: coin-fall;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.55));

        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        box-sizing: border-box;
        line-height: 1;
        z-index: 2;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
    }

    .falling-coin:hover {
        filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.85));
    }

    .error-box {
        margin-top: 22px;
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid #ef4444;
        color: #fecaca;
        border-radius: 10px;
        padding: 18px;
    }

    .error-box h2 {
        margin: 0 0 8px 0;
        color: #fecaca;
        font-size: 1.3rem;
    }

    .error-box p {
        margin: 0;
    }

    @keyframes coin-fall {
        from {
            transform: translateY(0);
        }

        to {
            transform: translateY(430px);
        }
    }
</style>