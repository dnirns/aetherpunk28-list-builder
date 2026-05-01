<script lang="ts">
	import ModelConfigurator from './model-configurator.svelte';
	import ModelPickerDialog from './model-picker-dialog.svelte';
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { UNIVERSAL_MODELS } from '$lib/data/universal-models';
	import { FACTIONS } from '$lib/data/factions';
	import type { ModelTemplate } from '$lib/types/game.types';

	type Props = {
		onnext: () => void;
		onback: () => void;
	};

	const { onnext, onback }: Props = $props();

	const faction = $derived(FACTIONS.find((f) => f.id === collegeStore.factionId));

	const availableModels = $derived.by(() => {
		const models: ModelTemplate[] = UNIVERSAL_MODELS.filter((m) => m.id !== 'wizard');
		if (faction) models.push(faction.uniqueModel);
		return models;
	});

	const allModels = $derived(collegeStore.models);
	const pointsLimit = $derived(collegeStore.gameConfig.pointsLimit);
	const hasLimit = $derived(pointsLimit !== null);
	const budgetRemaining = $derived(
		pointsLimit === null ? 0 : pointsLimit - collegeStore.totalCost
	);
	const wizardModel = $derived(allModels.find((m) => m.template.id === 'wizard'));

	let selectedModelId = $state<string | null>(null);
	let pickerOpen = $state(false);

	const selectedModel = $derived.by(() => {
		const match = allModels.find((m) => m.id === selectedModelId);
		if (match) return match;
		return wizardModel ?? allModels[0] ?? null;
	});

	const selectRosterModel = (id: string) => {
		selectedModelId = id;
	};

	const handlePickModel = (template: ModelTemplate) => {
		const id = collegeStore.addModel(template);
		selectedModelId = id;
	};

	const removeModel = (modelId: string) => {
		if (selectedModelId === modelId) selectedModelId = null;
		collegeStore.removeModel(modelId);
	};
</script>

<div class="models-step">
	<header class="step-head">
		<div>
			<div class="ap-section-label-ink">Roster</div>
			<h2 class="title">Build your Roster</h2>
			<p class="subtitle">
				Select a model to configure it. Add new models from the catalogue.
			</p>
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

	<div class="layout">
		<aside class="lists">
			<section class="list-section">
				<div class="list-items">
					{#each allModels as model (model.id)}
						<button
							class="list-row"
							class:active={selectedModel?.id === model.id}
							onclick={() => selectRosterModel(model.id)}
						>
							<div class="list-row-main">
								<div class="list-row-name">{model.name}</div>
								<div class="list-row-sub">{model.template.name}</div>
							</div>
							<div class="list-row-cost">{model.totalCost} Sh</div>
						</button>
					{/each}
				</div>

				<button class="add-model-btn" onclick={() => (pickerOpen = true)}>
					<span class="plus">+</span> Add Model
				</button>
			</section>
		</aside>

		<main class="detail">
			{#if selectedModel}
				<ModelConfigurator
					modelId={selectedModel.id}
					showRemove={selectedModel.template.id !== 'wizard'}
					onremove={() => removeModel(selectedModel.id)}
				/>
			{:else}
				<div class="empty">Select a model from the list to configure it.</div>
			{/if}
		</main>
	</div>

	<footer class="actions">
		<button class="ap-btn-ghost-dark" onclick={onback}>Back</button>
		<button class="ap-btn-ghost-dark" onclick={onnext}>Save College</button>
	</footer>
</div>

<ModelPickerDialog
	open={pickerOpen}
	templates={availableModels}
	onclose={() => (pickerOpen = false)}
	onpick={handlePickModel}
/>

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

	.layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 18px;
	}
	@media (min-width: 820px) {
		.layout {
			grid-template-columns: 260px 1fr;
			min-height: 32rem;
		}
	}

	.lists {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.list-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.list-items {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.list-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		text-align: left;
		padding: 9px 12px;
		background: var(--panel2);
		border: 1px solid var(--border-gold-faint);
		border-radius: var(--r);
		color: var(--parchment);
		cursor: pointer;
		transition:
			background 0.12s,
			border-color 0.12s;
	}
	.list-row:hover {
		background: var(--panel3);
		border-color: var(--border-gold);
	}
	.list-row.active {
		border-color: var(--gold-light);
		background:
			linear-gradient(rgba(184, 144, 58, 0.16), rgba(184, 144, 58, 0.16)),
			var(--panel2);
		box-shadow:
			0 0 0 2px var(--gold-light),
			0 0 12px rgba(184, 144, 58, 0.35);
	}
	.list-row-main {
		min-width: 0;
		flex: 1;
	}
	.list-row-name {
		font-family: 'Special Elite', serif;
		font-size: 15px;
		color: var(--parchment);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.list-row-sub {
		font-family: 'Spectral', serif;
		font-size: 13px;
		font-style: italic;
		color: var(--ink-light);
		margin-top: 1px;
	}
	.list-row-cost {
		font-family: 'Special Elite', serif;
		font-size: 14px;
		color: var(--gold-light);
		flex-shrink: 0;
	}

	.add-model-btn {
		margin-top: 4px;
		padding: 10px 14px;
		background: transparent;
		border: 1px dashed rgba(184, 144, 58, 0.35);
		border-radius: var(--r);
		color: var(--gold);
		font-family: 'Spectral', serif;
		font-size: 15px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition:
			background 0.15s,
			border-color 0.15s;
	}
	.add-model-btn:hover {
		background: rgba(184, 144, 58, 0.07);
		border-color: var(--gold);
	}
	.add-model-btn .plus {
		font-size: 20px;
		line-height: 1;
	}

	.detail {
		min-width: 0;
	}

	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 320px;
		border: 1px dashed rgba(122, 110, 98, 0.3);
		border-radius: 4px;
		color: var(--ink-light);
		font-family: 'Spectral', serif;
		font-size: 15px;
		font-style: italic;
	}

	.actions {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		margin-top: 24px;
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
