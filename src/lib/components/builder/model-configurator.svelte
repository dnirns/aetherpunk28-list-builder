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

	const availableItems = $derived.by(() => {
		if (!model) return [];
		return MERCHANT_ITEMS.filter((item) => checkMerchantItemRestriction(model, item));
	});

	const handleSlotChange = (equipmentName: string, upgradeName: string) => {
		if (!model) return;
		const current = model.equippedUpgrades.find((eu) => eu.replacedEquipment === equipmentName);
		if (current) collegeStore.removeUpgrade(modelId, current.upgrade.name);
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
	<div class="configurator">
		<div class="head">
			<div class="head-main">
				<input
					type="text"
					value={model.name}
					oninput={handleNameChange}
					class="name-input"
					placeholder="Character name…"
				/>
				<div class="meta">
					<span>{model.template.name}</span>
					<span class="dot">·</span>
					<span>{model.template.baseSize}</span>
				</div>
			</div>
			<div class="cost">{model.totalCost} Sh</div>
			{#if showRemove && onremove}
				<button class="remove-btn" onclick={onremove}>Remove</button>
			{/if}
		</div>

		<div class="ed-section">
			<div class="ap-section-label-ink">Statistics</div>
			<div class="stat-row">
				<div class="stat-cell">
					<div class="stat-val">{model.template.stats.mv}</div>
					<div class="stat-lbl">MV</div>
				</div>
				<div class="stat-cell">
					<div class="stat-val">{formatDicePool(model.template.stats.ra)}</div>
					<div class="stat-lbl">RA</div>
				</div>
				<div class="stat-cell">
					<div class="stat-val">{formatDicePool(model.template.stats.me)}</div>
					<div class="stat-lbl">ME</div>
				</div>
				<div class="stat-cell">
					<div class="stat-val">{model.template.stats.df || '-'}</div>
					<div class="stat-lbl">DF</div>
				</div>
				<div class="stat-cell">
					<div class="stat-val">{model.template.stats.wp || '-'}</div>
					<div class="stat-lbl">WP</div>
				</div>
				{#if model.template.stats.range !== '-'}
					<div class="stat-cell">
						<div class="stat-val small">{model.template.stats.range}</div>
						<div class="stat-lbl">RNG</div>
					</div>
				{/if}
				<div class="stat-cell">
					<div class="stat-val small">{model.template.stats.passiveSurge}</div>
					<div class="stat-lbl">SURGE</div>
				</div>
			</div>
		</div>

		<div class="ed-section">
			<div class="ap-section-label-ink">Base Equipment</div>
			<div class="tag-row">
				{#each model.template.baseEquipment as equip (equip.name)}
					<span class="ap-tag base-tag">
						{equip.name}{#if equip.range}
							({equip.range}){/if}
					</span>
				{/each}
			</div>
		</div>

		{#if model.template.specialRules.length > 0}
			<div class="ed-section">
				<div class="ap-section-label-ink">Special Rules</div>
				<div class="tag-row">
					{#each model.template.specialRules as rule (rule.name)}
						<span class="ap-tag rule-tag" title={rule.description ?? ''}>
							{rule.name}{rule.params ? ` (${Object.values(rule.params).join(', ')})` : ''}
						</span>
					{/each}
				</div>
			</div>
		{/if}

		{#if model.template.upgrades.length > 0}
			<div class="ed-section">
				<div class="ap-section-label-ink">Upgrades</div>

				{#each upgradeGroups.slots as slot (slot.equipmentName)}
					<fieldset class="upgrade-group">
						<legend class="upgrade-legend">Replace {slot.equipmentName}</legend>
						<label class="upgrade-row">
							<input
								type="radio"
								name="{modelId}-{slot.equipmentName}"
								checked={!slotSelections[slot.equipmentName]}
								onchange={() => handleSlotChange(slot.equipmentName, '')}
							/>
							<span class="upgrade-name dim">Keep {slot.equipmentName}</span>
						</label>
						{#each slot.options as upgrade (upgrade.name)}
							<label class="upgrade-row">
								<input
									type="radio"
									name="{modelId}-{slot.equipmentName}"
									checked={slotSelections[slot.equipmentName] === upgrade.name}
									onchange={() => handleSlotChange(slot.equipmentName, upgrade.name)}
								/>
								<span class="upgrade-name">{upgrade.name}</span>
								<span class="upgrade-cost">+{upgrade.cost} Sh</span>
								{#if upgrade.description}
									<span class="upgrade-desc">{upgrade.description}</span>
								{/if}
							</label>
						{/each}
					</fieldset>
				{/each}

				{#if upgradeGroups.additional.length > 0}
					<fieldset class="upgrade-group">
						<legend class="upgrade-legend">Additional Gear</legend>
						{#each upgradeGroups.additional as upgrade (upgrade.name)}
							<label class="upgrade-row">
								<input
									type="checkbox"
									checked={equippedNames.has(upgrade.name)}
									onchange={() => toggleUpgrade(upgrade)}
								/>
								<span class="upgrade-name">{upgrade.name}</span>
								<span class="upgrade-cost">+{upgrade.cost} Sh</span>
								{#if upgrade.description}
									<span class="upgrade-desc">{upgrade.description}</span>
								{/if}
							</label>
						{/each}
					</fieldset>
				{/if}
			</div>
		{/if}

		<div class="ed-section">
			<div class="ap-section-label-ink">Merchant Item</div>
			{#if model.template.isSummonable}
				<p class="muted-line">Summonable models cannot carry merchant items.</p>
			{:else}
				<select
					onchange={handleMerchantItem}
					value={model.merchantItem?.name ?? ''}
					class="merchant-select"
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

<style>
	.configurator {
		background: var(--panel2);
		color: var(--parchment);
		border: 1px solid var(--border-gold-faint);
		border-radius: 4px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 22px;
	}
	@media (min-width: 640px) {
		.configurator {
			padding: 22px 24px;
		}
	}

	.head {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		flex-wrap: wrap;
	}
	.head-main {
		flex: 1;
		min-width: 0;
	}
	.name-input {
		display: block;
		width: 100%;
		font-family: 'Special Elite', serif;
		font-size: 22px;
		font-weight: 600;
		color: var(--parchment);
		background: transparent;
		border: none;
		border-bottom: 1.5px solid transparent;
		outline: none;
		padding: 2px 0;
		transition: border-color 0.15s;
	}
	@media (min-width: 640px) {
		.name-input {
			font-size: 24px;
		}
	}
	.name-input:focus {
		border-bottom-color: var(--gold);
	}
	.meta {
		font-family: 'Spectral', serif;
		font-size: 14px;
		font-style: italic;
		color: var(--ink-light);
		margin-top: 4px;
		display: flex;
		gap: 6px;
	}
	.dot {
		opacity: 0.5;
	}
	.cost {
		font-family: 'Special Elite', serif;
		font-size: 20px;
		font-weight: 600;
		color: var(--gold-light);
		flex-shrink: 0;
	}
	.remove-btn {
		font-family: 'Special Elite', serif;
		font-size: 13px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--danger);
		background: transparent;
		border: 1px solid rgba(139, 42, 42, 0.4);
		border-radius: var(--r);
		padding: 5px 12px;
		cursor: pointer;
		transition: background 0.15s;
		flex-shrink: 0;
	}
	.remove-btn:hover {
		background: rgba(139, 42, 42, 0.12);
	}

	.ed-section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.stat-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.stat-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		min-width: 52px;
	}
	.stat-val {
		min-width: 52px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(184, 144, 58, 0.06);
		border: 1px solid var(--border-gold-faint);
		border-radius: 2px;
		font-family: 'Special Elite', serif;
		font-size: 20px;
		font-weight: 600;
		color: var(--parchment);
		padding: 0 8px;
	}
	.stat-val.small {
		font-size: 14px;
	}
	.stat-lbl {
		font-family: 'Special Elite', serif;
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-light);
	}

	.tag-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.base-tag {
		color: var(--parchment);
		font-style: normal;
		border-color: var(--border-gold-faint);
	}
	.rule-tag {
		color: #c2a8e0;
		font-style: normal;
		border-color: rgba(90, 62, 122, 0.4);
	}

	.upgrade-group {
		border: none;
		padding: 0;
		margin: 0 0 14px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.upgrade-legend {
		font-family: 'Spectral', serif;
		font-size: 14px;
		font-style: italic;
		color: var(--ink-light);
		padding: 0;
		margin-bottom: 4px;
	}
	.upgrade-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 5px 8px;
		border-radius: 2px;
		font-family: 'Spectral', serif;
		font-size: 15px;
		color: var(--parchment);
		cursor: pointer;
		transition: background 0.12s;
	}
	.upgrade-row:hover {
		background: var(--panel3);
	}
	.upgrade-row input {
		accent-color: var(--gold);
	}
	.upgrade-name {
		min-width: 100px;
	}
	.upgrade-name.dim {
		color: var(--ink-light);
	}
	.upgrade-cost {
		color: var(--gold-light);
		font-family: 'Special Elite', serif;
		font-size: 13px;
	}
	.upgrade-desc {
		color: var(--ink-light);
		font-size: 14px;
		font-style: italic;
	}

	.muted-line {
		font-family: 'Spectral', serif;
		font-size: 14px;
		color: var(--ink-light);
		font-style: italic;
	}

	.merchant-select {
		width: 100%;
		background: var(--panel);
		border: 1px solid var(--border-gold-faint);
		color: var(--parchment);
		font-family: 'Spectral', serif;
		font-size: 15px;
		padding: 8px 12px;
		border-radius: var(--r);
		outline: none;
		transition: border-color 0.15s;
	}
	.merchant-select:focus {
		border-color: var(--gold);
	}
</style>
