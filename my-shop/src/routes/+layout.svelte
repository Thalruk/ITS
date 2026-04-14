<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Navbar />

<main class="content">
  {@render children()}
</main>

<style>
  /* Podstawowy styl resetujący marginesy dla całej aplikacji */
  :global(body) {
    margin: 0;
    font-family: Arial, sans-serif;
    background-color: #f4f4f9;
  }

  .content {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
</style>