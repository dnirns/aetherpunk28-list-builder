<script lang="ts">
	import type { CollegeModel } from '$lib/types/game.types';
	import { formatDice, formatDie, formatSpecialRule } from '$lib/utils/format';
	import { describeSpecialRule } from '$lib/data/special-rules';
	import {
		abilityUpgrades,
		calculateModelCost,
		effectiveEquipment,
		effectiveSpecialRules,
		effectiveStats
	} from '$lib/utils/college-calculations';

	type Props = {
		model: CollegeModel;
		onclose: () => void;
	};

	const { model, onclose }: Props = $props();

	const stats = $derived(effectiveStats(model));
	const specialRules = $derived(effectiveSpecialRules(model));
	const equipment = $derived(effectiveEquipment(model));
	const abilities = $derived(abilityUpgrades(model));
</script>

<div class="detail">
	<header class="head">
		<div>
			<h3 class="name">{model.name}</h3>
			{#if model.name !== model.template.name}
				<p class="template">{model.template.name}</p>
			{/if}
			<p class="meta">{model.template.baseSize} · {calculateModelCost(model)} Sh</p>
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
					<td>{stats.mv}</td>
					<td>{formatDice(stats.ra)}</td>
					<td>{formatDice(stats.me)}</td>
					<td>{formatDie(stats.df)}</td>
					<td>{formatDie(stats.wp)}</td>
					<td>{stats.range}</td>
					<td class="surge">{stats.passiveSurge}</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="ed-section">
		<div class="ap-section-label-ink">Equipment</div>
		<div class="rows">
			{#each equipment as weapon (weapon.name)}
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

	{#if abilities.length > 0}
		<div class="ed-section">
			<div class="ap-section-label-ink">Upgrades</div>
			<div class="rows">
				{#each abilities as eu (eu.upgrade.name)}
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

	{#if specialRules.length > 0}
		<div class="ed-section">
			<div class="ap-section-label-ink">Special Rules</div>
			<div class="rows">
				{#each specialRules as rule (rule.name)}
					{@const description = describeSpecialRule(rule)}
					<div class="row stacked rule">
						<span class="row-name">{formatSpecialRule(rule)}</span>
						{#if description}
							<p class="row-desc">{description}</p>
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
		color: var(--parchment);
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
		font-family: 'Special Elite', serif;
		font-size: 22px;
		font-weight: 600;
		color: var(--gold-light);
	}
	.template {
		font-family: 'Spectral', serif;
		font-size: 14px;
		color: var(--ink-light);
		font-style: italic;
		margin-top: 2px;
	}
	.meta {
		font-family: 'Spectral', serif;
		font-size: 13px;
		color: var(--ink-light);
		margin-top: 2px;
	}
	.close {
		background: var(--panel3);
		border: 1px solid var(--panel3);
		border-radius: var(--r);
		padding: 4px 10px;
		color: var(--parchment);
		cursor: pointer;
		font-family: 'Special Elite', serif;
		font-size: 15px;
		transition:
			color 0.15s,
			background 0.15s,
			border-color 0.15s;
	}
	.close:hover {
		background: var(--gold);
		border-color: var(--gold);
		color: var(--ink);
	}

	.ed-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.stat-table {
		width: 100%;
		border-collapse: collapse;
		font-family: 'Special Elite', serif;
	}
	.stat-table th {
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-light);
		font-weight: 400;
		padding: 6px 4px;
		border-bottom: 1px solid var(--border-gold-faint);
	}
	.stat-table td {
		font-size: 16px;
		color: var(--parchment);
		padding: 8px 4px;
		text-align: center;
	}
	.stat-table td.surge {
		font-size: 13px;
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
		font-family: 'Special Elite', serif;
		font-size: 15px;
		color: var(--parchment);
	}
	.row-meta {
		font-family: 'Spectral', serif;
		font-size: 13px;
		color: var(--ink-light);
		font-style: italic;
	}
	.row-cost {
		font-family: 'Special Elite', serif;
		font-size: 13px;
		color: var(--gold-light);
	}
	.row-desc {
		font-family: 'Spectral', serif;
		font-size: 14px;
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
