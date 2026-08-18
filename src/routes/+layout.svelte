<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import PrintLayout from '$lib/components/print-layout.svelte';
	import { Printer, House } from 'lucide-svelte';

	let { children } = $props();

	const isHome = $derived(page.url.pathname === resolve('/'));
	const isViewCollege = $derived(
		page.url.pathname === resolve('/builder') && page.url.searchParams.has('view')
	);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="ap-screen-only flex h-dvh flex-col overflow-hidden">
	<header class="ap-topbar ap-no-print">
		<a href={resolve('/')} class="ap-topbar-title">Aetherpunk 28</a>
		<div class="flex-1"></div>
		{#if !isHome}
			{#if isViewCollege}
				<button
					class="ap-topbar-btn"
					onclick={() => window.print()}
					aria-label="Print / Export PDF"
					title="Print / Export PDF"
				>
					<Printer size={18} aria-hidden="true" />
				</button>
			{/if}
			<a href={resolve('/')} class="ap-topbar-home-btn" aria-label="My Colleges">
				<House size={18} aria-hidden="true" />
				<span class="home-btn-label">My Colleges</span>
			</a>
		{/if}
	</header>

	<div class="flex-1 overflow-auto" id="app-scroll">
		{@render children()}
	</div>
</div>

{#if !isHome}
	<PrintLayout />
{/if}
