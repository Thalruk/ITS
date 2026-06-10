<script>
	import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
	import PuzzleSolver from '$lib/components/PuzzleSolver.svelte';


	let answer = $state('');
	let error = $state('');
	let solved = $state(false);

	const correctAnswer = "it's me mario";

	function checkAnswer() {
        const normalizedAnswer = answer
            .trim()
            .toLowerCase()
            .replace(/[!?.]/g, '');

        if (normalizedAnswer === correctAnswer || normalizedAnswer === 'its me mario') {
            error = '';
            solved = true;

            setTimeout(() => {
                goto(resolve('/zagadki/placeholder'));
            }, 1200);

            return;
        }

        error = 'To nie jest poprawna odpowiedź.';
    }
</script>

<svelte:head>
	<title>Zagadka 9</title>
</svelte:head>

<section class="riddle-page">
	<div class="riddle-card">
        <p class="riddle-number">Zagadka 9</p>

        <h1>Zgadnij to, Bat... detektywie</h1>

        <p class="hint">
            Potrzebujesz klucza, by przejść dalej. Tak się składa, że „zgubiłem” go gdzieś
            w sklepie z grami.
        </p>

        <p class="hint">
            W swojej wspaniałomyślności zostawiam ci szyfr. W mojej opinii to uczciwy układ.
        </p>

        <p class="hint">
            Pamiętaj: to ja decyduję, co jest najpierw, co później i co na końcu.
        </p>

        <p class="hint">
            Dokop się do drugiego dna, poszukiwaczu, a może uda Ci się znaleźć diament.
        </p>

		<div class="cipher-box">
			<h2>Klucz szyfru</h2>

			<div class="cipher-grid">
				<span>a=1</span><span>b=2</span><span>c=3</span><span>d=4</span><span>e=5</span><span>f=6</span>
				<span>g=7</span><span>h=8</span><span>i=9</span><span>j=10</span><span>k=11</span><span>l=12</span>
				<span>m=13</span><span>n=14</span><span>o=15</span><span>p=16</span><span>q=17</span><span>r=18</span>
				<span>s=19</span><span>t=20</span><span>u=21</span><span>v=22</span><span>w=23</span><span>x=24</span>
				<span>y=25</span><span>z=26</span>

				<span>A=27</span><span>B=28</span><span>C=29</span><span>D=30</span><span>E=31</span><span>F=32</span>
				<span>G=33</span><span>H=34</span><span>I=35</span><span>J=36</span><span>K=37</span><span>L=38</span>
				<span>M=39</span><span>N=40</span><span>O=41</span><span>P=42</span><span>Q=43</span><span>R=44</span>
				<span>S=45</span><span>T=46</span><span>U=47</span><span>V=48</span><span>W=49</span><span>X=50</span>
				<span>Y=51</span><span>Z=52</span>
			</div>
		</div>

		<form
			class="answer-form"
			onsubmit={(e) => {
				e.preventDefault();
				checkAnswer();
			}}
		>
			<label for="answer">Odpowiedź:</label>
			<input
				id="answer"
				type="text"
				bind:value={answer}
				placeholder="Wpisz rozwiązanie zagadki"
				autocomplete="off"
			/>

			<button type="submit">Sprawdź</button>
		</form>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		{#if solved}
			<p class="success">Poprawna odpowiedź. Przejście dalej...</p>
		{/if}

		<div class="puzzle-wrapper">
			<PuzzleSolver pageName="LoginMystery1" />
		</div>
	</div>
</section>

<style>
    .puzzle-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        max-width: 100%;
    }

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

	.cipher-box {
		background: #0f1117;
		border: 1px solid #2d3748;
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 24px;
	}

	.cipher-box h2 {
		margin: 0 0 16px 0;
		font-size: 1.2rem;
		color: #ffffff;
	}

	.cipher-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
		gap: 8px;
		color: #cbd5e0;
		font-family: monospace;
		font-size: 0.95rem;
	}

	.cipher-grid span {
		background: #1a202c;
		border: 1px solid #2d3748;
		border-radius: 6px;
		padding: 7px 8px;
		text-align: center;
	}

	.answer-form {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		margin-top: 20px;
	}

	.answer-form label {
		color: #a0aec0;
		font-weight: 700;
	}

	.answer-form input {
		flex: 1;
		min-width: 220px;
		background: #0f1117;
		border: 1px solid #4a5568;
		color: #ffffff;
		border-radius: 8px;
		padding: 12px;
		font-size: 1rem;
	}

	.answer-form input:focus {
		outline: none;
		border-color: #00ffcc;
	}

	.answer-form button {
		background: #00ffcc;
		color: #0f1117;
		border: none;
		border-radius: 8px;
		padding: 12px 20px;
		font-weight: 800;
		cursor: pointer;
	}

	.answer-form button:hover {
		background: #38ffe0;
	}

	.error {
		margin-top: 16px;
		color: #fecaca;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid #ef4444;
		padding: 10px 12px;
		border-radius: 8px;
	}

	.success {
		margin-top: 16px;
		color: #bbf7d0;
		background: rgba(34, 197, 94, 0.15);
		border: 1px solid #22c55e;
		padding: 10px 12px;
		border-radius: 8px;
	}
</style>