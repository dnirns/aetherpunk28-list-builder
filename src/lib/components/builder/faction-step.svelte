<script lang="ts">
	import { FACTIONS } from '$lib/data/factions';
	import FactionIcon from '$lib/components/faction-icon.svelte';
	import type { FactionId } from '$lib/types/game.types';

	type Props = {
		selectedFaction: FactionId | null;
		onfactionselect: (id: FactionId) => void;
		onnext: () => void;
	};

	const { selectedFaction, onfactionselect, onnext }: Props = $props();

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
			<div
				class="faction-card"
				class:selected={selectedFaction === faction.id}
				role="button"
				tabindex="0"
				onclick={() => onfactionselect(faction.id)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onfactionselect(faction.id);
					}
				}}
			>
				<div class="faction-stamp">
					<FactionIcon factionId={faction.id} size={88} />
				</div>
				<div class="faction-header">
					<div class="header-name">{faction.name}</div>
					<div class="header-symbol">{faction.symbol}</div>
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
				<button
					type="button"
					class="select-action ap-btn-ghost-dark"
					class:visible={selectedFaction === faction.id}
					tabindex={selectedFaction === faction.id ? 0 : -1}
					aria-hidden={selectedFaction !== faction.id}
					onclick={(e) => {
						e.stopPropagation();
						onnext();
					}}
				>
					Select
				</button>
			</div>
		{/each}
	</div>

</div>

<style>
	.faction-step {
		max-width: 1300px;
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
		grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
		gap: 56px 56px;
		padding-top: 44px;
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

	.faction-stamp {
		position: absolute;
		top: 0;
		right: 0;
		transform: translate(30%, -35%);
		pointer-events: none;
		z-index: 2;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45));
	}

	.faction-header {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding-right: 56px;
		margin-bottom: 4px;
	}
	.header-name {
		font-family: 'Special Elite', serif;
		font-size: 18px;
		font-weight: 600;
		color: var(--parchment);
		line-height: 1.15;
	}
	.header-symbol {
		font-family: 'Spectral', serif;
		font-size: 12px;
		font-style: italic;
		color: var(--ink-light);
		line-height: 1.15;
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

	.select-action {
		margin-top: 8px;
		align-self: stretch;
		visibility: hidden;
	}
	.select-action.visible {
		visibility: visible;
	}

	@media (max-width: 600px) {
		.faction-grid {
			grid-template-columns: 1fr;
			gap: 40px;
			padding-top: 28px;
			padding-right: 28px;
		}
		.faction-stamp {
			transform: translate(20%, -25%) scale(0.85);
			transform-origin: top right;
		}
		.faction-header {
			padding-right: 64px;
		}
	}

</style>
