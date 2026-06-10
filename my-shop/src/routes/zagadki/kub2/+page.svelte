<script>
    import PuzzleSolver from '$lib/components/PuzzleSolver.svelte';
</script>
<div>
    <div class="puzzle-wrapper">
        <a href="/zamowienia">Linko do miejsca ukrycia rozwiązania zagadki nr 12</a> 
    </div>
    <div class="puzzle-wrapper">
        <PuzzleSolver pageName="LoginMystery1" />
    </div>
</div>
<style>
    .puzzle-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        max-width: 100%;
    }
</style>