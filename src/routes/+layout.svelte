<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import PrintLayout from '$lib/components/print-layout.svelte';
	import { Printer, House } from 'lucide-svelte';
	import {
		GAME_AUTHOR,
		GAME_NAME,
		GAME_URL,
		SITE_DESCRIPTION,
		SITE_NAME,
		SITE_URL
	} from '$lib/config/site';

	let { children } = $props();

	// Structured data so search engines connect this app to the game it supports,
	// and recognise the unspaced "Aetherpunk28" spelling people search for.
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: SITE_NAME,
		alternateName: [
			'Aetherpunk 28 List Builder',
			'Aetherpunk28 List Builder',
			'Aetherpunk28 Field Guide',
			'A28 List Builder'
		],
		url: SITE_URL,
		description: SITE_DESCRIPTION,
		applicationCategory: 'GameApplication',
		applicationSubCategory: 'Tabletop wargaming list builder',
		operatingSystem: 'Any modern web browser',
		isAccessibleForFree: true,
		inLanguage: 'en-GB',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
		author: {
			'@type': 'Person',
			name: 'Daniel Lowena-Irons',
			url: 'https://github.com/dnirns'
		},
		about: {
			'@type': 'Game',
			name: GAME_NAME,
			alternateName: 'Aetherpunk28',
			url: GAME_URL,
			author: { '@type': 'Person', name: GAME_AUTHOR },
			genre: 'Tabletop skirmish wargame'
		},
		featureList: [
			'Guided College builder for all 11 Aetherpunk 28 factions',
			'Live Shilling costing and Erudite charge totals',
			'Continuous list building rule validation',
			'Printable game-ready roster sheets',
			'Colleges saved locally in the browser'
		]
	};

	const isHome = $derived(page.url.pathname === resolve('/'));
	const isViewCollege = $derived(
		page.url.pathname === resolve('/builder') && page.url.searchParams.has('view')
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#1e1812" />
	<meta name="author" content="Daniel Lowena-Irons" />
	<!-- JSON-LD can only be injected as raw markup. The payload is a local constant with no
	     user input in it, and the closing tag is escaped so it cannot terminate the script early. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags, no-useless-escape -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}<\/script>`}
</svelte:head>

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
