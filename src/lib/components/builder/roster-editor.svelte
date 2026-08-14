<script lang="ts">
	import ModelConfigurator from './model-configurator.svelte';
	import ModelPickerDialog from './model-picker-dialog.svelte';
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { UNIVERSAL_MODELS } from '$lib/data/universal-models';
	import { FACTIONS } from '$lib/data/factions';
	import type { ModelTemplate } from '$lib/types/game.types';
	import { calculateModelCost } from '$lib/utils/college-calculations';

	const faction = $derived(FACTIONS.find((f) => f.id === collegeStore.factionId));

	// The Wizard is added automatically when a faction is chosen, so it is never
	// offered in the picker.
	const availableModels = $derived.by(() => {
		const models: ModelTemplate[] = UNIVERSAL_MODELS.filter((m) => m.id !== 'wizard');
		if (faction) models.push(faction.uniqueModel);
		return models;
	});

	const allModels = $derived(collegeStore.models);
	const wizardModel = $derived(allModels.find((m) => m.template.id === 'wizard'));

	let selectedModelId = $state<string | null>(null);
	let pickerOpen = $state(false);

	// Falls back to the Wizard, then the first model, so the detail pane is never
	// empty while the roster has models in it.
	const selectedModel = $derived.by(() => {
		const match = allModels.find((m) => m.id === selectedModelId);
		if (match) return match;
		return wizardModel ?? allModels[0] ?? null;
	});

	const handlePickModel = (template: ModelTemplate) => {
		selectedModelId = collegeStore.addModel(template);
	};

	const removeModel = (modelId: string) => {
		if (selectedModelId === modelId) selectedModelId = null;
		collegeStore.removeModel(modelId);
	};
</script>

<div class="layout">
	<aside class="lists">
		<section class="list-section">
			<div class="list-items">
				{#each allModels as model (model.id)}
					<button
						class="list-row"
						class:active={selectedModel?.id === model.id}
						onclick={() => (selectedModelId = model.id)}
					>
						<div class="list-row-main">
							<div class="list-row-name">{model.name}</div>
							<div class="list-row-sub">{model.template.name}</div>
						</div>
						<div class="list-row-cost">{calculateModelCost(model)} Sh</div>
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

<ModelPickerDialog
	open={pickerOpen}
	templates={availableModels}
	onclose={() => (pickerOpen = false)}
	onpick={handlePickModel}
/>

<style>
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
		font-family: 'Special Elite', serif;
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
		background: linear-gradient(rgba(184, 144, 58, 0.16), rgba(184, 144, 58, 0.16)), var(--panel2);
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
		background: var(--gold);
		border: 1px solid var(--gold);
		border-radius: var(--r);
		color: var(--ink);
		font-family: 'Special Elite', serif;
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
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
		background: var(--gold-light);
		border-color: var(--gold-light);
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
</style>
