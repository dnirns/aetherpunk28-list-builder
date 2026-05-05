<script lang="ts">
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { FACTIONS } from '$lib/data/factions';
	import FactionIcon from './faction-icon.svelte';

	type Props = {
		selectedModelId?: string | null;
		onmodelselect?: (modelId: string) => void;
	};

	const { selectedModelId = null, onmodelselect }: Props = $props();

	const faction = $derived(FACTIONS.find((f) => f.id === collegeStore.factionId));
	const isSelectable = $derived(!!onmodelselect);
</script>

<div class="summary">
	<header class="summary-head">
		<div class="summary-head-main">
			{#if faction}
				<FactionIcon factionId={faction.id} size={64} />
			{/if}
			<div>
				<h3 class="summary-name">{collegeStore.name}</h3>
				<p class="summary-faction">{faction?.name} ({faction?.symbol})</p>
			</div>
		</div>
		<div class="summary-cost">
			<div class="cost-amount">{collegeStore.totalCost} <span class="unit">Sh</span></div>
			<div class="cost-of">
				of {collegeStore.gameConfig.pointsLimit ?? '∞'}
			</div>
		</div>
	</header>

	<div class="key-stats">
		<div class="key-stat">
			<span class="key-label">Erudite Charges</span>
			<span class="key-val gold">{collegeStore.eruditeCharges}</span>
		</div>
		<div class="key-stat">
			<span class="key-label">Models</span>
			<span class="key-val">{collegeStore.models.length}</span>
		</div>
		<div class="key-stat">
			<span class="key-label">Unspent</span>
			<span class="key-val">
				{#if collegeStore.gameConfig.pointsLimit === null}
					∞
				{:else}
					{collegeStore.gameConfig.pointsLimit - collegeStore.totalCost}
					<span class="unit">Sh</span>
				{/if}
			</span>
		</div>
	</div>

	{#if faction}
		<div class="info-block faction-spell">
			<div class="info-label">Faction Spell</div>
			<div>
				<span class="info-name">{faction.factionSpell.name}</span>
				<span class="info-cost">({faction.factionSpell.cost} Ch)</span>
			</div>
			<p class="info-desc">{faction.factionSpell.description}</p>
		</div>

		<div class="info-block empowered">
			<div class="info-label">Empowered</div>
			<p class="info-desc">
				{faction.empowered
					.map((e) =>
						e.stat === 'lightCover'
							? 'Permanent Light Cover'
							: `${e.stat.toUpperCase()} ${e.value}`
					)
					.join(', ')}
			</p>
		</div>
	{/if}

	<div class="ap-section-label-ink models-label">Models</div>
	{#if isSelectable}
		<p class="select-hint">Select a model to view its details</p>
	{/if}
	<div class="model-list">
		{#each collegeStore.models as model (model.id)}
			{#if isSelectable}
				<button
					type="button"
					class="model-row"
					class:active={selectedModelId === model.id}
					onclick={() => onmodelselect?.(model.id)}
				>
					{@render modelInner(model)}
				</button>
			{:else}
				<div class="model-row static">
					{@render modelInner(model)}
				</div>
			{/if}
		{/each}
	</div>
</div>

{#snippet modelInner(model: (typeof collegeStore.models)[number])}
	<div class="model-head">
		<div class="model-name-row">
			<span class="model-name">{model.name}</span>
			{#if model.name !== model.template.name}
				<span class="model-template">({model.template.name})</span>
			{/if}
			{#if model.template.id === 'wizard'}
				<span class="leader-badge">Leader</span>
			{/if}
		</div>
		<span class="model-cost">{model.totalCost} Sh</span>
	</div>
{/snippet}

<style>
	.summary {
		background: var(--panel2);
		color: var(--parchment);
		border: 1px solid var(--border-gold-faint);
		border-radius: 4px;
		padding: 22px 24px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.summary-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
	}
	.summary-head-main {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.summary-name {
		font-family: 'Special Elite', serif;
		font-size: 24px;
		font-weight: 600;
		color: var(--parchment);
	}
	.summary-faction {
		font-family: 'Spectral', serif;
		font-size: 15px;
		color: var(--ink-light);
		font-style: italic;
		margin-top: 2px;
	}
	.summary-cost {
		text-align: right;
	}
	.cost-amount {
		font-family: 'Special Elite', serif;
		font-size: 24px;
		font-weight: 600;
		color: var(--gold-light);
	}
	.cost-amount .unit {
		font-size: 15px;
		color: var(--ink-light);
		font-weight: 400;
	}
	.cost-of {
		font-family: 'Spectral', serif;
		font-size: 13px;
		color: var(--ink-light);
		font-style: italic;
	}

	.key-stats {
		display: flex;
		gap: 18px;
		padding: 12px 14px;
		background: rgba(184, 144, 58, 0.06);
		border: 1px solid var(--border-gold-faint);
		border-radius: var(--r);
	}
	.key-stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.key-label {
		font-family: 'Special Elite', serif;
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-light);
	}
	.key-val {
		font-family: 'Special Elite', serif;
		font-size: 18px;
		font-weight: 600;
		color: var(--parchment);
	}
	.key-val.gold {
		color: var(--gold-light);
	}
	.key-val .unit {
		font-size: 13px;
		color: var(--ink-light);
		font-weight: 400;
	}

	.info-block {
		padding: 12px 14px;
		border-radius: var(--r);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.info-label {
		font-family: 'Special Elite', serif;
		font-size: 11px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.info-name {
		font-family: 'Special Elite', serif;
		font-size: 16px;
		color: var(--parchment);
		font-weight: 600;
	}
	.info-cost {
		font-family: 'Spectral', serif;
		font-size: 14px;
		color: var(--ink-light);
		margin-left: 6px;
	}
	.info-desc {
		font-family: 'Spectral', serif;
		font-size: 14px;
		color: var(--ink-light);
		font-style: italic;
		line-height: 1.5;
	}
	.faction-spell {
		background: rgba(90, 62, 122, 0.08);
		border: 1px solid rgba(90, 62, 122, 0.3);
	}
	.empowered {
		background: rgba(184, 144, 58, 0.06);
		border: 1px solid var(--border-gold-faint);
	}

	.models-label {
		margin-top: 4px;
	}
	.select-hint {
		font-family: 'Spectral', serif;
		font-size: 14px;
		font-style: italic;
		color: var(--ink-light);
		margin-top: -8px;
	}
	.model-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.model-row {
		text-align: left;
		background: var(--panel);
		border: 1px solid var(--border-gold-faint);
		border-radius: var(--r);
		padding: 12px 14px;
		color: var(--parchment);
		cursor: pointer;
		transition:
			border-color 0.15s,
			background 0.15s;
	}
	.model-row:hover {
		border-color: var(--border-gold);
	}
	.model-row.active {
		border-color: var(--gold-light);
		background:
			linear-gradient(rgba(184, 144, 58, 0.14), rgba(184, 144, 58, 0.14)),
			var(--panel);
		box-shadow:
			0 0 0 2px var(--gold-light),
			0 0 12px rgba(184, 144, 58, 0.35);
	}
	.model-row.static {
		cursor: default;
	}
	.model-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.model-name-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.model-name {
		font-family: 'Special Elite', serif;
		font-size: 16px;
		font-weight: 600;
		color: var(--parchment);
	}
	.model-template {
		font-family: 'Spectral', serif;
		font-size: 14px;
		font-style: italic;
		color: var(--ink-light);
	}
	.leader-badge {
		font-family: 'Special Elite', serif;
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #a07acc;
		border: 1px solid rgba(90, 62, 122, 0.4);
		border-radius: 2px;
		padding: 1px 6px;
	}
	.model-cost {
		font-family: 'Special Elite', serif;
		font-size: 15px;
		color: var(--gold-light);
	}
</style>
