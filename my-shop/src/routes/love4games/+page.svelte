<script>
    import puzzleImage from '../../assets/Zagadka 2.png';
    import PuzzleSolver from '$lib/components/PuzzleSolver.svelte';
</script>

<div class="puzzle-page">
    <div class="puzzle-wrapper">
        <img src={puzzleImage} alt="Zagadka 2" />
        
        <PuzzleSolver pageName="love4games" />
    </div>
</div>

<style>
    .puzzle-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background-color: #0f0f14; /* Ciemne tło pasujące do klimatu Waszego sklepu */
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
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); /* Dodaje głębi i hakerskiego klimatu */
    }
</style>