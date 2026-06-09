<script>
    // Importujemy nasz uniwersalny komponent do załatwiania spraw z hasłami
    import PuzzleSolver from '$lib/components/PuzzleSolver.svelte';
</script>

<div class="puzzle-page">
    <div class="puzzle-wrapper">
        <img src="https://i.imgur.com/rZFRTon.png" alt="Zagadka 3" />
        
        <PuzzleSolver pageName="szym1" />
    </div>
</div>

<style>
    .puzzle-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background-color: #0f0f14; /* Ciemne tło sklepu */
        padding: 2rem;
        box-sizing: border-box;
    }

    .puzzle-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        max-width: 100%;
    }

    img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); /* Hakerski, głęboki cień pod grafiką */
    }
</style>