<script lang="ts">
	import RosterEditor from './roster-editor.svelte';
	import FactionIcon from '$lib/components/faction-icon.svelte';
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { FACTIONS } from '$lib/data/factions';
	import { formatEmpowered } from '$lib/utils/format';

	const faction = $derived(FACTIONS.find((f) => f.id === collegeStore.factionId));

	const pointsLimit = $derived(collegeStore.gameConfig.pointsLimit);
	const hasLimit = $derived(pointsLimit !== null);
	const budgetRemaining = $derived(pointsLimit === null ? 0 : pointsLimit - collegeStore.totalCost);
</script>

<div class="models-step">
	<header class="step-head">
		<div>
			<div class="ap-section-label-ink">Roster</div>
			<h2 class="title">Build your Roster</h2>
			<p class="subtitle">Select a model to configure it. Add new models from the catalogue.</p>
		</div>
		<div class="budget">
			<div class="budget-amount">
				{collegeStore.totalCost} <span class="budget-sep">/</span>
				{pointsLimit ?? '∞'} <span class="budget-unit">Sh</span>
			</div>
			<div class="budget-remaining" class:over={hasLimit && budgetRemaining < 0}>
				{#if !hasLimit}
					No limit
				{:else if budgetRemaining >= 0}
					{budgetRemaining} Shillings remaining
				{:else}
					{Math.abs(budgetRemaining)} Shillings over budget
				{/if}
			</div>
		</div>
	</header>

	{#if faction}
		<section class="faction-card" aria-label="Faction information">
			<div class="faction-heading">
				<FactionIcon factionId={faction.id} size={56} />
				<div class="faction-heading-text">
					<span class="faction-eyebrow">Faction</span>
					<span class="faction-name">{faction.name}</span>
					<span class="faction-symbol">Symbol: {faction.symbol}</span>
				</div>
			</div>

			<div class="faction-block">
				<span class="faction-label">Empowered</span>
				<span class="faction-empowered-val">{formatEmpowered(faction.empowered)}</span>
			</div>

			<div class="faction-block">
				<span class="faction-label">Faction Spell</span>
				<span class="faction-spell-line">
					{faction.factionSpell.name}
					<span class="faction-spell-cost">({faction.factionSpell.cost} Ch)</span>
				</span>
				<p class="faction-spell-desc">{faction.factionSpell.description}</p>
			</div>
		</section>
	{/if}

	<RosterEditor />
</div>

<style>
	.models-step {
		max-width: 1200px;
		margin: 0 auto;
	}

	.step-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}
	.title {
		font-family: 'Special Elite', serif;
		font-size: 26px;
		font-weight: 600;
		color: var(--ink);
		margin-top: 6px;
	}
	.faction-card {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
		padding: 14px 16px;
		margin-bottom: 20px;
		background: var(--panel2);
		border: 1px solid var(--border-gold-faint);
		border-left: 3px solid var(--gold-light);
		border-radius: var(--r);
	}
	@media (min-width: 720px) {
		.faction-card {
			grid-template-columns: minmax(160px, auto) 1fr 1.4fr;
			gap: 24px;
			align-items: start;
		}
	}
	.faction-heading {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.faction-heading-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.faction-eyebrow {
		font-family: 'Spectral', serif;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--ink-light);
	}
	.faction-name {
		font-family: 'Special Elite', serif;
		font-size: 19px;
		color: var(--gold-light);
		line-height: 1.2;
	}
	.faction-symbol {
		font-family: 'Spectral', serif;
		font-size: 13px;
		font-style: italic;
		color: var(--ink-light);
	}
	.faction-block {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.faction-label {
		font-family: 'Spectral', serif;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--ink-light);
	}
	.faction-empowered-val {
		font-family: 'Special Elite', serif;
		font-size: 14px;
		color: var(--parchment);
	}
	.faction-spell-line {
		font-family: 'Special Elite', serif;
		font-size: 14px;
		color: var(--parchment);
	}
	.faction-spell-cost {
		color: var(--ink-light);
		font-weight: 400;
	}
	.faction-spell-desc {
		font-family: 'Spectral', serif;
		font-size: 13px;
		color: var(--ink-light);
		margin-top: 2px;
		line-height: 1.4;
	}
	.subtitle {
		font-family: 'Spectral', serif;
		font-size: 15px;
		color: var(--ink-light);
		font-style: italic;
		margin-top: 4px;
	}
	.budget {
		text-align: right;
		flex-shrink: 0;
	}
	.budget-amount {
		font-family: 'Special Elite', serif;
		font-size: 24px;
		font-weight: 600;
		color: var(--gold-light);
	}
	.budget-sep,
	.budget-unit {
		color: var(--ink-light);
		font-weight: 400;
	}
	.budget-remaining {
		font-family: 'Spectral', serif;
		font-size: 14px;
		color: var(--ink-light);
		font-style: italic;
		margin-top: 2px;
	}
	.budget-remaining.over {
		color: var(--danger);
	}

	@media (max-width: 640px) {
		.title {
			font-size: 22px;
		}
		.budget-amount {
			font-size: 20px;
		}
	}
</style>
