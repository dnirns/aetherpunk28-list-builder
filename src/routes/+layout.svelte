<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import PrintLayout from '$lib/components/print-layout.svelte';
	import { Printer } from 'lucide-svelte';

	let { children } = $props();

	const isHome = $derived(page.url.pathname === resolve('/'));
	const isViewCollege = $derived(
		page.url.pathname === resolve('/builder') && page.url.searchParams.has('view')
	);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex h-screen flex-col overflow-hidden ap-screen-only">
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
			<a href={resolve('/')} class="ap-topbar-home-btn">
				<span aria-hidden="true">⌂</span> My Colleges
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
