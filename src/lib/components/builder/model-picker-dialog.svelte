<script lang="ts">
	import type { ModelTemplate } from '$lib/types/game.types';

	type Props = {
		open: boolean;
		templates: ModelTemplate[];
		onclose: () => void;
		onpick: (template: ModelTemplate) => void;
	};

	const { open, templates, onclose, onpick }: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!dialogEl) return;
		if (open && !dialogEl.open) dialogEl.showModal();
		if (!open && dialogEl.open) dialogEl.close();
	});

	const formatDicePool = (pool: { count: number; die: string | number }) =>
		pool.die === 0 ? '-' : `${pool.count}x${pool.die}`;

	const handleBackdrop = (e: MouseEvent) => {
		if (e.target === dialogEl) onclose();
	};

	const handlePick = (template: ModelTemplate) => {
		onpick(template);
		onclose();
	};
</script>

<dialog bind:this={dialogEl} class="picker" onclose={onclose} onclick={handleBackdrop}>
	<div class="picker-inner">
		<header class="picker-head">
			<div>
				<div class="ap-section-label-ink">Add Model</div>
				<h3 class="picker-title">Choose a model to add</h3>
			</div>
			<button class="close-btn" onclick={onclose} aria-label="Close">✕</button>
		</header>

		<div class="picker-grid">
			{#each templates as template (template.id)}
				<button class="card" onclick={() => handlePick(template)}>
					<div class="card-head">
						<div class="card-name-block">
							<div class="card-name">{template.name}</div>
							<div class="card-sub">
								{template.baseSize}
								{#if template.isUnique}
									<span class="dot">·</span> <span class="unique">Unique</span>
								{:else if template.isSummonable}
									<span class="dot">·</span> Summonable
								{/if}
							</div>
						</div>
						<div class="card-cost">{template.baseCost} <span class="unit">Sh</span></div>
					</div>

					<div class="card-stats">
						<span><span class="key">MV</span> {template.stats.mv}</span>
						<span><span class="key">RA</span> {formatDicePool(template.stats.ra)}</span>
						<span><span class="key">ME</span> {formatDicePool(template.stats.me)}</span>
						<span><span class="key">DF</span> {template.stats.df || '-'}</span>
						<span><span class="key">WP</span> {template.stats.wp || '-'}</span>
					</div>

					{#if template.specialRules.length > 0}
						<div class="card-rules">
							{#each template.specialRules as rule (rule.name)}
								<span class="rule-tag">{rule.name}</span>
							{/each}
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</dialog>

<style>
	.picker {
		padding: 0;
		border: 1px solid var(--border-gold);
		border-radius: 4px;
		background: var(--panel2);
		color: var(--parchment);
		width: min(960px, calc(100vw - 48px));
		max-height: calc(100vh - 64px);
		margin: auto;
	}
	.picker::backdrop {
		background: rgba(15, 11, 8, 0.7);
		backdrop-filter: blur(2px);
	}
	.picker-inner {
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - 64px);
	}

	.picker-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 18px 22px 12px;
		border-bottom: 1px solid var(--border-gold-faint);
		flex-shrink: 0;
	}
	.picker-title {
		font-family: 'Surabanglus', serif;
		font-size: 18px;
		font-weight: 600;
		color: var(--parchment);
		margin-top: 4px;
	}
	.close-btn {
		background: transparent;
		border: 1px solid rgba(122, 110, 98, 0.3);
		border-radius: var(--r);
		padding: 4px 10px;
		color: var(--ink-light);
		cursor: pointer;
		font-size: 13px;
		font-family: 'Lora', serif;
		transition:
			color 0.15s,
			border-color 0.15s;
	}
	.close-btn:hover {
		color: var(--gold);
		border-color: var(--border-gold);
	}

	.picker-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 10px;
		padding: 14px 18px 18px;
		overflow-y: auto;
	}

	.card {
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px 14px;
		background: var(--panel);
		border: 1px solid var(--border-gold-faint);
		border-radius: var(--r);
		color: inherit;
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s;
	}
	.card:hover {
		background: var(--panel3);
		border-color: var(--gold);
	}

	.card-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 10px;
	}
	.card-name-block {
		min-width: 0;
		flex: 1;
	}
	.card-name {
		font-family: 'Surabanglus', serif;
		font-size: 15px;
		font-weight: 600;
		color: var(--parchment);
		line-height: 1.2;
	}
	.card-sub {
		font-family: 'Lora', serif;
		font-size: 11px;
		font-style: italic;
		color: var(--ink-light);
		margin-top: 2px;
	}
	.unique {
		color: #a07acc;
	}
	.dot {
		opacity: 0.5;
	}
	.card-cost {
		font-family: 'Surabanglus', serif;
		font-size: 14px;
		font-weight: 600;
		color: var(--gold-light);
		flex-shrink: 0;
		line-height: 1.2;
	}
	.card-cost .unit {
		font-size: 10px;
		color: var(--ink-light);
		font-weight: 400;
	}

	.card-stats {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 12px;
		font-family: 'Surabanglus', serif;
		font-size: 11px;
		color: var(--parchment);
	}
	.card-stats .key {
		color: var(--ink-light);
		letter-spacing: 0.08em;
		font-size: 9px;
		margin-right: 2px;
	}

	.card-rules {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.rule-tag {
		font-family: 'Surabanglus', serif;
		font-size: 9px;
		letter-spacing: 0.04em;
		color: #c2a8e0;
		border: 1px solid rgba(90, 62, 122, 0.4);
		background: rgba(90, 62, 122, 0.08);
		border-radius: 2px;
		padding: 1px 5px;
	}
</style>
