<script lang="ts">
	import ModelConfigurator from './model-configurator.svelte';
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

	// Available models: universal (minus Wizard) + faction unique
	const availableModels = $derived.by(() => {
		const models: ModelTemplate[] = UNIVERSAL_MODELS.filter((m) => m.id !== 'wizard');
		if (faction) models.push(faction.uniqueModel);
		return models;
	});

	// All models including wizard
	const allModels = $derived(collegeStore.models);

	const budgetRemaining = $derived(collegeStore.gameConfig.pointsLimit - collegeStore.totalCost);

	const wizardModel = $derived(allModels.find((m) => m.template.id === 'wizard'));

	let selectedModelId = $state<string | null>(null);

	// Auto-select wizard initially, and keep selection valid after removals
	const selectedModel = $derived.by(() => {
		const match = allModels.find((m) => m.id === selectedModelId);
		if (match) return match;
		// Fall back to wizard or first model
		return wizardModel ?? allModels[0] ?? null;
	});

	const addModel = (template: ModelTemplate) => {
		const id = collegeStore.addModel(template);
		selectedModelId = id;
	};

	const removeModel = (modelId: string) => {
		if (selectedModelId === modelId) {
			selectedModelId = null;
		}
		collegeStore.removeModel(modelId);
	};
</script>

<div class="mx-auto max-w-5xl">
	<!-- Header with budget -->
	<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
		<div>
			<h2 class="text-3xl font-bold">Build your Roster</h2>
			<p class="text-slate-400">Select a model to configure it. Add new models from the catalogue.</p>
		</div>
		<div class="text-right">
			<div class="text-2xl font-bold text-amber-400">
				{collegeStore.totalCost} / {collegeStore.gameConfig.pointsLimit} Sh
			</div>
			<div class="text-sm {budgetRemaining >= 0 ? 'text-slate-400' : 'text-red-400'}">
				{budgetRemaining >= 0
					? `${budgetRemaining} Shillings remaining`
					: `${Math.abs(budgetRemaining)} Shillings over budget`}
			</div>
		</div>
	</div>

	<!-- Master-detail layout -->
	<div class="flex gap-4" style="min-height: 32rem;">
		<!-- Left: model list + catalogue -->
		<div class="flex w-64 shrink-0 flex-col gap-3 overflow-y-auto">
			<!-- Roster list -->
			<div>
				<h3 class="mb-2 text-xs font-medium tracking-wider text-slate-500 uppercase">
					Roster ({allModels.length})
				</h3>
				<div class="space-y-1">
					{#each allModels as model (model.id)}
						<button
							onclick={() => (selectedModelId = model.id)}
							class="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition
								{selectedModel?.id === model.id
								? 'border-amber-500 bg-amber-500/10'
								: 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'}"
						>
							<div class="min-w-0">
								<div class="truncate font-medium text-slate-100">{model.name}</div>
								<div class="text-xs text-slate-500">{model.template.name}</div>
							</div>
							<div class="ml-2 shrink-0 text-xs font-semibold text-amber-400">
								{model.totalCost} Sh
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Add model catalogue -->
			<div>
				<h3 class="mb-2 text-xs font-medium tracking-wider text-slate-500 uppercase">
					Add Model
				</h3>
				<div class="space-y-1">
					{#each availableModels as template (template.id)}
						<button
							onclick={() => addModel(template)}
							class="flex w-full items-center justify-between rounded-lg border border-dashed border-slate-700 px-3 py-2 text-left text-sm transition hover:border-amber-500/50 hover:bg-slate-800"
						>
							<div class="min-w-0">
								<div class="truncate text-slate-300">{template.name}</div>
								{#if template.isUnique}
									<span class="text-xs text-purple-400">Unique</span>
								{:else if template.isSummonable}
									<span class="text-xs text-slate-500">Summonable</span>
								{/if}
							</div>
							<div class="ml-2 shrink-0 text-xs text-amber-400/70">{template.baseCost} Sh</div>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right: selected model detail -->
		<div class="min-w-0 flex-1">
			{#if selectedModel}
				<ModelConfigurator
					modelId={selectedModel.id}
					showRemove={selectedModel.template.id !== 'wizard'}
					onremove={() => removeModel(selectedModel.id)}
				/>
			{:else}
				<div
					class="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-700 text-slate-500"
				>
					Select a model from the list to configure it.
				</div>
			{/if}
		</div>
	</div>

	<!-- Footer navigation -->
	<div class="mt-6 flex justify-between">
		<button
			onclick={onback}
			class="rounded-lg border border-slate-700 px-6 py-3 text-slate-300 transition hover:bg-slate-800"
		>
			Back
		</button>
		<button
			onclick={onnext}
			class="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
		>
			Review College
		</button>
	</div>
</div>
