<script lang="ts">
	import ModelConfigurator from './model-configurator.svelte';
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { FACTIONS } from '$lib/data/factions';

	type Props = {
		wizardModelId: string;
		onnext: () => void;
		onback: () => void;
	};

	const { wizardModelId, onnext, onback }: Props = $props();

	const faction = $derived(FACTIONS.find((f) => f.id === collegeStore.factionId));

	const formatEmpowered = (empowered: NonNullable<typeof faction>['empowered']) =>
		empowered
			.map((e) =>
				e.stat === 'lightCover' ? 'Permanent Light Cover' : `${e.stat.toUpperCase()} ${e.value}`
			)
			.join(', ');
</script>

<div class="mx-auto max-w-2xl">
	<h2 class="mb-2 text-center text-3xl font-bold">Your Wizard</h2>
	<p class="mb-2 text-center text-slate-400">
		The Wizard is the heart of your College &mdash; your mandatory leader.
	</p>
	{#if faction}
		<p class="mb-6 text-center text-sm text-amber-400/80">
			As Paragon of the College, your Wizard permanently gains the {faction.name} empowered bonuses:
			{formatEmpowered(faction.empowered)}
		</p>
	{/if}

	<ModelConfigurator modelId={wizardModelId} />

	<div class="mt-8 flex justify-between">
		<button
			onclick={onback}
			class="rounded-lg border border-slate-700 px-6 py-3 text-slate-300 transition hover:bg-slate-800"
		>
			Back
		</button>
		<button
			onclick={onnext}
			class="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
		>
			Next
		</button>
	</div>
</div>
