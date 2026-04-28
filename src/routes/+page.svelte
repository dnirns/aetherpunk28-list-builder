<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savedCollegesStore } from '$lib/stores/saved-colleges.store.svelte';
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { FACTIONS } from '$lib/data/factions';
	import { goto } from '$app/navigation';

	onMount(() => {
		savedCollegesStore.refresh();
	});

	const getFactionName = (factionId: string) => {
		return FACTIONS.find((f) => f.id === factionId)?.name ?? factionId;
	};

	const formatDate = (iso: string) => {
		return new Date(iso).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	};

	const handleLoad = (saved: (typeof savedCollegesStore.colleges)[number]) => {
		collegeStore.loadFromSaved(saved);
		goto(resolve('/builder') + '?edit=true');
	};

	const handleDelete = (id: string) => {
		savedCollegesStore.remove(id);
	};
</script>

<svelte:head>
	<title>Aetherpunk 28 &mdash; College Builder</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center px-4 py-12">
	<h1 class="mb-2 text-5xl font-bold tracking-tight text-amber-400">Aetherpunk 28</h1>
	<p class="mb-12 text-lg text-slate-400">College Builder</p>

	<a
		href={resolve('/builder')}
		class="rounded-lg bg-amber-500 px-8 py-4 text-lg font-semibold text-slate-950 transition hover:bg-amber-400"
	>
		Create a College
	</a>

	{#if savedCollegesStore.colleges.length > 0}
		<section class="mt-16 w-full max-w-2xl">
			<h2 class="mb-4 text-2xl font-semibold text-slate-200">Saved Colleges</h2>
			<ul class="space-y-3">
				{#each savedCollegesStore.colleges as saved (saved.id)}
					<li
						class="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-5 py-4"
					>
						<div>
							<p class="font-semibold text-slate-100">{saved.name}</p>
							<p class="text-sm text-slate-400">
								{getFactionName(saved.factionId)} &middot; {saved.totalCost}/{saved.gameConfig.pointsLimit}
								shillings &middot; {formatDate(saved.savedAt)}
							</p>
						</div>
						<div class="flex gap-2">
							<button
								onclick={() => handleLoad(saved)}
								class="rounded bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-400 transition hover:bg-amber-500/30"
							>
								Edit
							</button>
							<button
								onclick={() => handleDelete(saved.id)}
								class="rounded bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-500/30"
							>
								Delete
							</button>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>
