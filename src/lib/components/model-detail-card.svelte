<script lang="ts">
	import type { CollegeModel, DicePool, DieStep } from '$lib/types/game.types';

	type Props = {
		model: CollegeModel;
		onclose: () => void;
	};

	const { model, onclose }: Props = $props();

	const formatDice = (pool: DicePool): string => {
		if (pool.die === 0) return '-';
		return pool.count > 1 ? `${pool.count}${pool.die}` : `${pool.die}`;
	};

	const formatDie = (die: DieStep): string => {
		return die === 0 ? '-' : `${die}`;
	};

	// Work out the effective equipment: start with base, apply replacements from upgrades
	const effectiveEquipment = $derived.by(() => {
		const replaced = new Set(model.equippedUpgrades.map((eu) => eu.replacedEquipment).filter(Boolean));
		const base = model.template.baseEquipment.filter((w) => !replaced.has(w.name));
		const upgradeWeapons = model.equippedUpgrades
			.filter((eu) => eu.upgrade.weapon)
			.map((eu) => eu.upgrade.weapon!);
		return [...base, ...upgradeWeapons];
	});

	// Non-weapon upgrades (stat mods, abilities, etc.)
	const abilityUpgrades = $derived(
		model.equippedUpgrades.filter((eu) => !eu.upgrade.weapon)
	);
</script>

<div class="rounded-lg border border-slate-600 bg-slate-800 p-5">
	<!-- Header -->
	<div class="mb-4 flex items-start justify-between">
		<div>
			<h3 class="text-lg font-bold text-amber-400">{model.name}</h3>
			{#if model.name !== model.template.name}
				<p class="text-sm text-slate-500">{model.template.name}</p>
			{/if}
			<p class="mt-0.5 text-xs text-slate-500">
				Base: {model.template.baseSize} &middot; {model.totalCost} Sh
			</p>
		</div>
		<button
			onclick={onclose}
			class="rounded p-1 text-slate-500 transition hover:bg-slate-700 hover:text-slate-300"
			aria-label="Close"
		>
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<!-- Stat Block -->
	<div class="mb-4 overflow-x-auto">
		<table class="w-full text-center text-sm">
			<thead>
				<tr class="border-b border-slate-700 text-xs tracking-wider text-slate-500 uppercase">
					<th class="px-2 py-1">MV</th>
					<th class="px-2 py-1">RA</th>
					<th class="px-2 py-1">ME</th>
					<th class="px-2 py-1">DF</th>
					<th class="px-2 py-1">WP</th>
					<th class="px-2 py-1">Range</th>
					<th class="px-2 py-1">Surge</th>
				</tr>
			</thead>
			<tbody>
				<tr class="font-mono text-slate-200">
					<td class="px-2 py-1.5">{model.template.stats.mv}</td>
					<td class="px-2 py-1.5">{formatDice(model.template.stats.ra)}</td>
					<td class="px-2 py-1.5">{formatDice(model.template.stats.me)}</td>
					<td class="px-2 py-1.5">{formatDie(model.template.stats.df)}</td>
					<td class="px-2 py-1.5">{formatDie(model.template.stats.wp)}</td>
					<td class="px-2 py-1.5">{model.template.stats.range}</td>
					<td class="px-2 py-1.5 text-xs">{model.template.stats.passiveSurge}</td>
				</tr>
			</tbody>
		</table>
	</div>

	<!-- Equipment -->
	<div class="mb-4">
		<h4 class="mb-1.5 text-xs font-medium tracking-wider text-slate-500 uppercase">Equipment</h4>
		<div class="space-y-1">
			{#each effectiveEquipment as weapon (weapon.name)}
				<div class="flex items-center justify-between rounded bg-slate-700/50 px-3 py-1.5 text-sm">
					<span class="text-slate-200">{weapon.name}</span>
					<span class="text-xs text-slate-400">
						{weapon.type === 'ranged' ? 'Ranged' : 'Melee'}
						{#if weapon.range}
							&middot; {weapon.range}
						{/if}
						{#if weapon.dice}
							&middot; {formatDice(weapon.dice)}
						{/if}
					</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Ability Upgrades -->
	{#if abilityUpgrades.length > 0}
		<div class="mb-4">
			<h4 class="mb-1.5 text-xs font-medium tracking-wider text-slate-500 uppercase">Upgrades</h4>
			<div class="space-y-1">
				{#each abilityUpgrades as eu (eu.upgrade.name)}
					<div class="rounded bg-slate-700/50 px-3 py-1.5 text-sm">
						<div class="flex items-center justify-between">
							<span class="font-medium text-slate-200">{eu.upgrade.name}</span>
							<span class="text-xs text-amber-400">+{eu.upgrade.cost} Sh</span>
						</div>
						{#if eu.upgrade.description}
							<p class="mt-0.5 text-xs text-slate-400">{eu.upgrade.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Special Rules -->
	{#if model.template.specialRules.length > 0}
		<div class="mb-4">
			<h4 class="mb-1.5 text-xs font-medium tracking-wider text-slate-500 uppercase">
				Special Rules
			</h4>
			<div class="space-y-1">
				{#each model.template.specialRules as rule (rule.name)}
					<div class="rounded bg-indigo-900/20 px-3 py-1.5 text-sm">
						<span class="font-medium text-indigo-300">{rule.name}</span>
						{#if rule.description}
							<p class="mt-0.5 text-xs text-slate-400">{rule.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Merchant Item -->
	{#if model.merchantItem}
		<div>
			<h4 class="mb-1.5 text-xs font-medium tracking-wider text-slate-500 uppercase">
				Merchant Item
			</h4>
			<div class="rounded bg-amber-900/20 px-3 py-1.5 text-sm">
				<div class="flex items-center justify-between">
					<span class="font-medium text-amber-300">{model.merchantItem.name}</span>
					<span class="text-xs text-amber-400">+{model.merchantItem.cost} Sh</span>
				</div>
				<p class="mt-0.5 text-xs text-slate-400">{model.merchantItem.description}</p>
			</div>
		</div>
	{/if}
</div>
