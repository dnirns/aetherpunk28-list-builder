<script lang="ts">
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { FACTIONS } from '$lib/data/factions';

	type Props = {
		onback: () => void;
		onfinish: () => void;
	};

	const { onback, onfinish }: Props = $props();

	const faction = $derived(FACTIONS.find((f) => f.id === collegeStore.factionId));
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

	<!-- College Summary -->
	<div class="mb-6 rounded-lg border border-slate-700 bg-slate-800/50 p-6">
		<!-- Header -->
		<div class="mb-4 flex items-center justify-between">
			<div>
				<h3 class="text-xl font-bold">{collegeStore.name}</h3>
				<p class="text-slate-400">{faction?.name} ({faction?.symbol})</p>
			</div>
			<div class="text-right">
				<div class="text-2xl font-bold text-amber-400">{collegeStore.totalCost} Sh</div>
				<div class="text-sm text-slate-400">of {collegeStore.gameConfig.pointsLimit}</div>
			</div>
		</div>

		<!-- Key stats -->
		<div class="mb-4 flex gap-4 rounded bg-slate-700/50 p-3 text-sm">
			<div>
				<span class="text-slate-400">Erudite Charges:</span>
				<span class="ml-1 font-bold text-amber-400">{collegeStore.eruditeCharges}</span>
			</div>
			<div>
				<span class="text-slate-400">Models:</span>
				<span class="ml-1 font-bold">{collegeStore.models.length}</span>
			</div>
			<div>
				<span class="text-slate-400">Unspent:</span>
				<span class="ml-1 font-bold">
					{collegeStore.gameConfig.pointsLimit - collegeStore.totalCost} Sh
				</span>
			</div>
		</div>

		<!-- Faction Spell -->
		{#if faction}
			<div class="mb-4 rounded bg-indigo-900/30 p-3 text-sm">
				<span class="text-indigo-300">Faction Spell:</span>
				<span class="ml-1 font-medium">{faction.factionSpell.name}</span>
				<span class="text-slate-400"> ({faction.factionSpell.cost} Ch)</span>
				<p class="mt-1 text-slate-400">{faction.factionSpell.description}</p>
			</div>
		{/if}

		<!-- Empowered Bonuses -->
		{#if faction}
			<div class="mb-4 rounded bg-amber-900/20 p-3 text-sm">
				<span class="text-amber-300">Empowered:</span>
				<span class="ml-1 text-slate-300">
					{faction.empowered
						.map((e) =>
							e.stat === 'lightCover'
								? 'Permanent Light Cover'
								: `${e.stat.toUpperCase()} ${e.value}`
						)
						.join(', ')}
				</span>
			</div>
		{/if}

		<!-- Model List -->
		<h4 class="mb-2 text-xs font-medium tracking-wider text-slate-500 uppercase">Models</h4>
		<div class="space-y-3">
			{#each collegeStore.models as model (model.id)}
				<div class="rounded border border-slate-700 bg-slate-900/50 p-3">
					<div class="flex items-center justify-between">
						<div>
							<span class="font-medium">{model.name}</span>
							{#if model.name !== model.template.name}
								<span class="text-sm text-slate-500">({model.template.name})</span>
							{/if}
							{#if model.template.id === 'wizard'}
								<span class="ml-2 rounded bg-amber-900/30 px-1.5 py-0.5 text-xs text-amber-300">
									Leader
								</span>
							{/if}
						</div>
						<span class="text-amber-400">{model.totalCost} Sh</span>
					</div>
					{#if model.equippedUpgrades.length > 0}
						<div class="mt-1 flex flex-wrap gap-1">
							{#each model.equippedUpgrades as eu (eu.upgrade.name)}
								<span class="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300">
									{eu.upgrade.name} (+{eu.upgrade.cost})
								</span>
							{/each}
						</div>
					{/if}
					{#if model.merchantItem}
						<div class="mt-1">
							<span class="rounded bg-amber-900/30 px-1.5 py-0.5 text-xs text-amber-300">
								{model.merchantItem.name} (+{model.merchantItem.cost})
							</span>
						</div>
					{/if}
				</div>
			{/each}
		</div>
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
