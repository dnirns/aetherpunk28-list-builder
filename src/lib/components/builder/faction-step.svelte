<script lang="ts">
	import { FACTIONS } from '$lib/data/factions';
	import type { FactionId } from '$lib/types/game.types';

	type Props = {
		selectedFaction: FactionId | null;
		onfactionselect: (id: FactionId) => void;
		onnext: () => void;
		onback: () => void;
	};

	const { selectedFaction, onfactionselect, onnext, onback }: Props = $props();

	const formatEmpowered = (empowered: (typeof FACTIONS)[number]['empowered']) =>
		empowered
			.map((e) =>
				e.stat === 'lightCover' ? 'Permanent Light Cover' : `${e.stat.toUpperCase()} ${e.value}`
			)
			.join(', ');
</script>

<div class="mx-auto max-w-4xl">
	<h2 class="mb-2 text-center text-3xl font-bold">Choose your Faction</h2>
	<p class="mb-8 text-center text-slate-400">
		Your faction determines empowered bonuses, a unique spell, and access to a unique model.
	</p>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each FACTIONS as faction (faction.id)}
			<button
				onclick={() => onfactionselect(faction.id)}
				class="rounded-lg border p-4 text-left transition
					{selectedFaction === faction.id
					? 'border-amber-500 bg-amber-500/10'
					: 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'}"
			>
				<div class="mb-1 flex items-center gap-2">
					<span class="text-lg font-bold">{faction.name}</span>
					<span class="text-sm text-slate-500">({faction.symbol})</span>
				</div>
				<div class="mb-2 text-sm text-slate-400">
					Empowered: {formatEmpowered(faction.empowered)}
				</div>
				<div class="mb-1 text-sm">
					<span class="text-amber-400">{faction.factionSpell.name}</span>
					<span class="text-slate-500"> ({faction.factionSpell.cost} Ch)</span>
				</div>
				<div class="text-sm text-slate-500">
					Unique: {faction.uniqueModel.name} ({faction.uniqueModel.baseCost} Sh)
				</div>
			</button>
		{/each}
	</div>

	<div class="mt-8 flex justify-between">
		<button
			onclick={onback}
			class="rounded-lg border border-slate-700 px-6 py-3 text-slate-300 transition hover:bg-slate-800"
		>
			Back
		</button>
		<button
			onclick={onnext}
			disabled={!selectedFaction}
			class="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
		>
			Next
		</button>
	</div>
</div>
