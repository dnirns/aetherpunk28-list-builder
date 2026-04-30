<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { children } = $props();

	const isHome = $derived(page.url.pathname === resolve('/'));
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex h-screen flex-col overflow-hidden">
	<header class="ap-topbar ap-no-print">
		<a href={resolve('/')} class="ap-topbar-title">Aetherpunk 28</a>
		<div class="flex-1"></div>
		{#if !isHome}
			<button class="ap-topbar-btn" onclick={() => window.print()}>Print / Export PDF</button>
			<a href={resolve('/')} class="ap-topbar-home-btn">
				<span aria-hidden="true">⌂</span> My Colleges
			</a>
		{/if}
	</header>

	<div class="flex-1 overflow-auto bg-panel" id="app-scroll">
		{@render children()}
	</div>
</div>
