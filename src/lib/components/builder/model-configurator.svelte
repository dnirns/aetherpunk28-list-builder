<script lang="ts">
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { MERCHANT_ITEMS } from '$lib/data/spells-and-items';
	import { checkMerchantItemRestriction } from '$lib/utils/college-calculations';
	import type { Upgrade } from '$lib/types/game.types';

	type Props = {
		modelId: string;
		showRemove?: boolean;
		onremove?: () => void;
	};

	const { modelId, showRemove = false, onremove }: Props = $props();

	const model = $derived(collegeStore.models.find((m) => m.id === modelId));

	// Derived reactive state for equipped upgrades
	const equippedNames = $derived(
		new Set(model?.equippedUpgrades.map((eu) => eu.upgrade.name) ?? [])
	);

	const slotSelections = $derived.by(() => {
		const selections: Record<string, string> = {};
		if (model) {
			for (const eu of model.equippedUpgrades) {
				if (eu.replacedEquipment) {
					selections[eu.replacedEquipment] = eu.upgrade.name;
				}
			}
		}
		return selections;
	});

	// Group upgrades: weapon replacements by slot vs additional gear
	const upgradeGroups = $derived.by(() => {
		if (!model)
			return {
				slots: [] as { equipmentName: string; options: Upgrade[] }[],
				additional: [] as Upgrade[]
			};

		const slotRecord: Record<string, Upgrade[]> = {};
		const additional: Upgrade[] = [];

		for (const upgrade of model.template.upgrades) {
			if (upgrade.replaces) {
				(slotRecord[upgrade.replaces] ??= []).push(upgrade);
			} else {
				additional.push(upgrade);
			}
		}

		return {
			slots: Object.entries(slotRecord).map(([equipmentName, options]) => ({
				equipmentName,
				options
			})),
			additional
		};
	});

	// Merchant items this model is eligible for
	const availableItems = $derived.by(() => {
		if (!model) return [];
		return MERCHANT_ITEMS.filter((item) => checkMerchantItemRestriction(model, item));
	});

	const handleSlotChange = (equipmentName: string, upgradeName: string) => {
		if (!model) return;

		// Remove current upgrade for this slot
		const current = model.equippedUpgrades.find((eu) => eu.replacedEquipment === equipmentName);
		if (current) {
			collegeStore.removeUpgrade(modelId, current.upgrade.name);
		}

		// Equip the new upgrade (if not "keep base")
		if (upgradeName) {
			const upgrade = model.template.upgrades.find((u) => u.name === upgradeName);
			if (upgrade) collegeStore.equipUpgrade(modelId, upgrade);
		}
	};

	const toggleUpgrade = (upgrade: Upgrade) => {
		if (equippedNames.has(upgrade.name)) {
			collegeStore.removeUpgrade(modelId, upgrade.name);
		} else {
			collegeStore.equipUpgrade(modelId, upgrade);
		}
	};

	const handleMerchantItem = (e: Event) => {
		const value = (e.target as HTMLSelectElement).value;
		if (!value) {
			collegeStore.removeMerchantItem(modelId);
		} else {
			const item = MERCHANT_ITEMS.find((i) => i.name === value);
			if (item) collegeStore.equipMerchantItem(modelId, item);
		}
	};

	const handleNameChange = (e: Event) => {
		collegeStore.renameModel(modelId, (e.target as HTMLInputElement).value);
	};

	const formatDicePool = (pool: { count: number; die: string | number }) =>
		pool.die === 0 ? '-' : `${pool.count}x${pool.die}`;
</script>

{#if model}
	<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
		<!-- Header -->
		<div class="mb-4 flex items-start justify-between gap-4">
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
					<input
						type="text"
						value={model.name}
						oninput={handleNameChange}
						class="border-b border-transparent bg-transparent text-lg font-bold text-slate-100 outline-none focus:border-amber-500"
					/>
					<span class="text-sm text-slate-500"
						>{model.template.name} &middot; {model.template.baseSize}</span
					>
				</div>
				<div class="mt-1 text-sm font-semibold text-amber-400">{model.totalCost} Shillings</div>
			</div>
			{#if showRemove && onremove}
				<button
					onclick={onremove}
					class="shrink-0 text-sm text-red-400 transition hover:text-red-300"
				>
					Remove
				</button>
			{/if}
		</div>

		<!-- Stats -->
		<div class="mb-4 flex flex-wrap gap-2 text-xs">
			<span class="rounded bg-slate-700 px-2 py-1">Mv {model.template.stats.mv}</span>
			<span class="rounded bg-slate-700 px-2 py-1"
				>Ra {formatDicePool(model.template.stats.ra)}</span
			>
			<span class="rounded bg-slate-700 px-2 py-1"
				>Me {formatDicePool(model.template.stats.me)}</span
			>
			<span class="rounded bg-slate-700 px-2 py-1">Df {model.template.stats.df || '-'}</span>
			<span class="rounded bg-slate-700 px-2 py-1">Wp {model.template.stats.wp || '-'}</span>
			{#if model.template.stats.range !== '-'}
				<span class="rounded bg-slate-700 px-2 py-1">Range {model.template.stats.range}</span>
			{/if}
			<span class="rounded bg-slate-700 px-2 py-1">Surge: {model.template.stats.passiveSurge}</span>
		</div>

		<!-- Base Equipment -->
		<div class="mb-4">
			<h4 class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
				Base Equipment
			</h4>
			<div class="flex flex-wrap gap-2">
				{#each model.template.baseEquipment as equip (equip.name)}
					<span class="rounded bg-slate-700/50 px-2 py-1 text-xs text-slate-300">
						{equip.name}
						{#if equip.range}({equip.range}){/if}
					</span>
				{/each}
			</div>
		</div>

		<!-- Special Rules -->
		{#if model.template.specialRules.length > 0}
			<div class="mb-4">
				<h4 class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
					Special Rules
				</h4>
				<div class="flex flex-wrap gap-2">
					{#each model.template.specialRules as rule (rule.name)}
						<span
							class="rounded bg-indigo-900/50 px-2 py-1 text-xs text-indigo-300"
							title={rule.description ?? ''}
						>
							{rule.name}{rule.params ? ` (${Object.values(rule.params).join(', ')})` : ''}
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Upgrades -->
		{#if model.template.upgrades.length > 0}
			<div class="mb-4">
				<h4 class="mb-2 text-xs font-medium tracking-wider text-slate-500 uppercase">Upgrades</h4>

				<!-- Weapon Replacement Slots -->
				{#each upgradeGroups.slots as slot (slot.equipmentName)}
					<fieldset class="mb-3">
						<legend class="mb-1 text-sm text-slate-400">Replace {slot.equipmentName}</legend>
						<div class="space-y-1">
							<label
								class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-700/50"
							>
								<input
									type="radio"
									name="{modelId}-{slot.equipmentName}"
									checked={!slotSelections[slot.equipmentName]}
									onchange={() => handleSlotChange(slot.equipmentName, '')}
									class="accent-amber-500"
								/>
								<span class="text-slate-300">Keep {slot.equipmentName}</span>
							</label>
							{#each slot.options as upgrade (upgrade.name)}
								<label
									class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-700/50"
								>
									<input
										type="radio"
										name="{modelId}-{slot.equipmentName}"
										checked={slotSelections[slot.equipmentName] === upgrade.name}
										onchange={() => handleSlotChange(slot.equipmentName, upgrade.name)}
										class="accent-amber-500"
									/>
									<span class="text-slate-100">{upgrade.name}</span>
									<span class="text-amber-400">+{upgrade.cost} Sh</span>
									{#if upgrade.description}
										<span class="text-xs text-slate-500">{upgrade.description}</span>
									{/if}
								</label>
							{/each}
						</div>
					</fieldset>
				{/each}

				<!-- Additional Gear -->
				{#if upgradeGroups.additional.length > 0}
					<fieldset>
						<legend class="mb-1 text-sm text-slate-400">Additional Gear</legend>
						<div class="space-y-1">
							{#each upgradeGroups.additional as upgrade (upgrade.name)}
								<label
									class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-700/50"
								>
									<input
										type="checkbox"
										checked={equippedNames.has(upgrade.name)}
										onchange={() => toggleUpgrade(upgrade)}
										class="accent-amber-500"
									/>
									<span class="text-slate-100">{upgrade.name}</span>
									<span class="text-amber-400">+{upgrade.cost} Sh</span>
									{#if upgrade.description}
										<span class="text-xs text-slate-500">{upgrade.description}</span>
									{/if}
								</label>
							{/each}
						</div>
					</fieldset>
				{/if}
			</div>
		{/if}

		<!-- Merchant Item -->
		<div>
			<h4 class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
				Merchant Item
			</h4>
			{#if model.template.isSummonable}
				<p class="text-xs text-slate-500 italic">Summonable models cannot carry merchant items.</p>
			{:else}
				<select
					onchange={handleMerchantItem}
					value={model.merchantItem?.name ?? ''}
					class="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
				>
					<option value="">None</option>
					{#each availableItems as item (item.name)}
						<option value={item.name}>
							{item.name} ({item.cost} Sh) &mdash; {item.description}
						</option>
					{/each}
				</select>
			{/if}
		</div>
	</div>
{/if}
