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

<div class="faction-step">
	<div class="ap-section-label-ink heading-rule">Choose a Faction</div>
	<h2 class="title">Select your Faction</h2>
	<p class="subtitle">Empowered bonuses, a unique spell, and access to a unique model.</p>

	<div class="faction-grid">
		{#each FACTIONS as faction (faction.id)}
			<button
				class="faction-card"
				class:selected={selectedFaction === faction.id}
				onclick={() => onfactionselect(faction.id)}
			>
				<div class="faction-head">
					<span class="faction-name">{faction.name}</span>
					<span class="faction-symbol">{faction.symbol}</span>
				</div>
				<div class="faction-row">
					<span class="row-label">Empowered</span>
					<span class="row-val">{formatEmpowered(faction.empowered)}</span>
				</div>
				<div class="faction-row">
					<span class="row-label">Spell</span>
					<span class="row-val">
						<span class="gold">{faction.factionSpell.name}</span>
						<span class="dim">({faction.factionSpell.cost} Ch)</span>
					</span>
				</div>
				<div class="faction-row">
					<span class="row-label">Unique</span>
					<span class="row-val">
						{faction.uniqueModel.name}
						<span class="dim">({faction.uniqueModel.baseCost} Sh)</span>
					</span>
				</div>
			</button>
		{/each}
	</div>

	<div class="actions">
		<button class="ap-btn-ghost-dark" onclick={onback}>Back</button>
		<button class="ap-btn-ghost-dark" onclick={onnext} disabled={!selectedFaction}>Next</button>
	</div>
</div>

<style>
	.faction-step {
		max-width: 1100px;
		margin: 0 auto;
	}
	.heading-rule {
		margin-bottom: 12px;
	}
	.title {
		font-family: 'Special Elite', serif;
		font-size: 26px;
		font-weight: 600;
		color: var(--ink);
		margin-bottom: 6px;
	}
	.subtitle {
		font-family: 'Spectral', serif;
		font-size: 15px;
		color: var(--ink-light);
		font-style: italic;
		margin-bottom: 24px;
	}

	.faction-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 14px;
	}

	.faction-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		text-align: left;
		background: var(--panel2);
		border: 1px solid var(--border-gold-faint);
		border-radius: 4px;
		cursor: pointer;
		color: var(--parchment);
		transition:
			border-color 0.15s,
			background 0.15s;
		position: relative;
		overflow: hidden;
	}
	.faction-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, var(--gold), transparent);
		opacity: 0;
		transition: opacity 0.2s;
	}
	.faction-card:hover {
		border-color: var(--border-gold);
		background: var(--panel3);
	}
	.faction-card:hover::before,
	.faction-card.selected::before {
		opacity: 1;
	}
	.faction-card.selected {
		border-color: var(--gold-light);
		background:
			linear-gradient(rgba(184, 144, 58, 0.14), rgba(184, 144, 58, 0.14)),
			var(--panel2);
		box-shadow:
			0 0 0 2px var(--gold-light),
			0 0 12px rgba(184, 144, 58, 0.35);
	}

	.faction-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
	}
	.faction-name {
		font-family: 'Special Elite', serif;
		font-size: 19px;
		font-weight: 600;
		color: var(--parchment);
	}
	.faction-symbol {
		font-family: 'Spectral', serif;
		font-size: 13px;
		font-style: italic;
		color: var(--ink-light);
	}

	.faction-row {
		display: flex;
		gap: 10px;
		font-size: 14px;
		line-height: 1.4;
	}
	.row-label {
		font-family: 'Special Elite', serif;
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
		padding-top: 2px;
		flex-shrink: 0;
		min-width: 64px;
	}
	.row-val {
		color: var(--parchment);
	}
	.row-val .gold {
		color: var(--gold-light);
	}
	.row-val .dim {
		color: var(--ink-light);
	}

	.actions {
		display: flex;
		justify-content: space-between;
		margin-top: 32px;
	}
</style>
