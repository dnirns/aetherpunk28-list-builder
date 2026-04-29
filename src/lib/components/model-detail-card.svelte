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

	const formatDie = (die: DieStep): string => (die === 0 ? '-' : `${die}`);

	const effectiveEquipment = $derived.by(() => {
		const replaced = new Set(
			model.equippedUpgrades.map((eu) => eu.replacedEquipment).filter(Boolean)
		);
		const base = model.template.baseEquipment.filter((w) => !replaced.has(w.name));
		const upgradeWeapons = model.equippedUpgrades
			.filter((eu) => eu.upgrade.weapon)
			.map((eu) => eu.upgrade.weapon!);
		return [...base, ...upgradeWeapons];
	});

	const abilityUpgrades = $derived(model.equippedUpgrades.filter((eu) => !eu.upgrade.weapon));
</script>

<div class="detail">
	<header class="head">
		<div>
			<h3 class="name">{model.name}</h3>
			{#if model.name !== model.template.name}
				<p class="template">{model.template.name}</p>
			{/if}
			<p class="meta">{model.template.baseSize} · {model.totalCost} Sh</p>
		</div>
		<button class="close" onclick={onclose} aria-label="Close">✕</button>
	</header>

	<div class="ed-section">
		<div class="ap-section-label-ink">Statline</div>
		<table class="stat-table">
			<thead>
				<tr>
					<th>MV</th>
					<th>RA</th>
					<th>ME</th>
					<th>DF</th>
					<th>WP</th>
					<th>Range</th>
					<th>Surge</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>{model.template.stats.mv}</td>
					<td>{formatDice(model.template.stats.ra)}</td>
					<td>{formatDice(model.template.stats.me)}</td>
					<td>{formatDie(model.template.stats.df)}</td>
					<td>{formatDie(model.template.stats.wp)}</td>
					<td>{model.template.stats.range}</td>
					<td class="surge">{model.template.stats.passiveSurge}</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="ed-section">
		<div class="ap-section-label-ink">Equipment</div>
		<div class="rows">
			{#each effectiveEquipment as weapon (weapon.name)}
				<div class="row">
					<span class="row-name">{weapon.name}</span>
					<span class="row-meta">
						{weapon.type === 'ranged' ? 'Ranged' : 'Melee'}
						{#if weapon.range}· {weapon.range}{/if}
						{#if weapon.dice}· {formatDice(weapon.dice)}{/if}
					</span>
				</div>
			{/each}
		</div>
	</div>

	{#if abilityUpgrades.length > 0}
		<div class="ed-section">
			<div class="ap-section-label-ink">Upgrades</div>
			<div class="rows">
				{#each abilityUpgrades as eu (eu.upgrade.name)}
					<div class="row stacked">
						<div class="row-head">
							<span class="row-name">{eu.upgrade.name}</span>
							<span class="row-cost">+{eu.upgrade.cost} Sh</span>
						</div>
						{#if eu.upgrade.description}
							<p class="row-desc">{eu.upgrade.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if model.template.specialRules.length > 0}
		<div class="ed-section">
			<div class="ap-section-label-ink">Special Rules</div>
			<div class="rows">
				{#each model.template.specialRules as rule (rule.name)}
					<div class="row stacked rule">
						<span class="row-name">{rule.name}</span>
						{#if rule.description}
							<p class="row-desc">{rule.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if model.merchantItem}
		<div class="ed-section">
			<div class="ap-section-label-ink">Merchant Item</div>
			<div class="row stacked merchant">
				<div class="row-head">
					<span class="row-name">{model.merchantItem.name}</span>
					<span class="row-cost">+{model.merchantItem.cost} Sh</span>
				</div>
				<p class="row-desc">{model.merchantItem.description}</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.detail {
		background: var(--panel2);
		border: 1px solid var(--border-gold-faint);
		border-radius: 4px;
		padding: 22px 24px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}
	.name {
		font-family: 'Surabanglus', serif;
		font-size: 20px;
		font-weight: 600;
		color: var(--gold-light);
	}
	.template {
		font-family: 'Lora', serif;
		font-size: 12px;
		color: var(--ink-light);
		font-style: italic;
		margin-top: 2px;
	}
	.meta {
		font-family: 'Lora', serif;
		font-size: 11px;
		color: var(--ink-light);
		margin-top: 2px;
	}
	.close {
		background: transparent;
		border: 1px solid rgba(122, 110, 98, 0.25);
		border-radius: var(--r);
		padding: 4px 10px;
		color: var(--ink-light);
		cursor: pointer;
		font-size: 13px;
		transition:
			color 0.15s,
			border-color 0.15s;
	}
	.close:hover {
		color: var(--gold);
		border-color: var(--border-gold);
	}

	.ed-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.stat-table {
		width: 100%;
		border-collapse: collapse;
		font-family: 'Surabanglus', serif;
	}
	.stat-table th {
		font-size: 9px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-light);
		font-weight: 400;
		padding: 6px 4px;
		border-bottom: 1px solid var(--border-gold-faint);
	}
	.stat-table td {
		font-size: 14px;
		color: var(--parchment);
		padding: 8px 4px;
		text-align: center;
	}
	.stat-table td.surge {
		font-size: 11px;
	}

	.rows {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 8px 12px;
		background: rgba(184, 144, 58, 0.05);
		border: 1px solid var(--border-gold-faint);
		border-radius: 2px;
	}
	.row.stacked {
		flex-direction: column;
		align-items: stretch;
		gap: 4px;
	}
	.row-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.row-name {
		font-family: 'Surabanglus', serif;
		font-size: 13px;
		color: var(--parchment);
	}
	.row-meta {
		font-family: 'Lora', serif;
		font-size: 11px;
		color: var(--ink-light);
		font-style: italic;
	}
	.row-cost {
		font-family: 'Surabanglus', serif;
		font-size: 11px;
		color: var(--gold-light);
	}
	.row-desc {
		font-family: 'Lora', serif;
		font-size: 12px;
		color: var(--ink-light);
		line-height: 1.5;
	}
	.row.rule {
		background: rgba(90, 62, 122, 0.08);
		border-color: rgba(90, 62, 122, 0.3);
	}
	.row.rule .row-name {
		color: #c2a8e0;
	}
	.row.merchant {
		background: rgba(184, 144, 58, 0.08);
		border-color: rgba(184, 144, 58, 0.3);
	}
	.row.merchant .row-name {
		color: var(--gold-light);
	}
</style>
