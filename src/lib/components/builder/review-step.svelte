<script lang="ts">
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import CollegeSummary from '$lib/components/college-summary.svelte';

	type Props = {
		onback: () => void;
		onfinish: () => void;
	};

	const { onback, onfinish }: Props = $props();

	const hasErrors = $derived(collegeStore.validationErrors.length > 0);
</script>

<div class="mx-auto max-w-2xl">
	<h2 class="mb-6 text-center text-3xl font-bold">Review your College</h2>

	<!-- Validation Errors -->
	{#if hasErrors}
		<div class="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
			<h3 class="mb-2 font-semibold text-red-400">Validation Errors</h3>
			<ul class="space-y-1 text-sm text-red-300">
				{#each collegeStore.validationErrors as error, i (i)}
					<li>&bull; {error}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="mb-6">
		<CollegeSummary />
	</div>

	<div class="flex justify-between">
		<button
			onclick={onback}
			class="rounded-lg border border-slate-700 px-6 py-3 text-slate-300 transition hover:bg-slate-800"
		>
			Back
		</button>
		<button
			onclick={onfinish}
			disabled={hasErrors}
			class="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
		>
			Finish
		</button>
	</div>
</div>
