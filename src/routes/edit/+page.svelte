<script lang="ts">
	import ModelConfigurator from '$lib/components/builder/model-configurator.svelte';
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { UNIVERSAL_MODELS } from '$lib/data/universal-models';
	import { FACTIONS } from '$lib/data/factions';
	import type { ModelTemplate } from '$lib/types/game.types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { storage } from '$lib/utils/storage';
	import { goto } from '$app/navigation';

	const collegeId = page.url.searchParams.get('id');
	let loaded = $state(false);

	if (collegeId) {
		const saved = storage.findById(collegeId);
		if (saved) {
			collegeStore.loadFromSaved(saved);
			loaded = true;
		}
	}

	const faction = $derived(FACTIONS.find((f) => f.id === collegeStore.factionId));

	const availableModels = $derived.by(() => {
		const models: ModelTemplate[] = UNIVERSAL_MODELS.filter((m) => m.id !== 'wizard');
		if (faction) models.push(faction.uniqueModel);
		return models;
	});

	const allModels = $derived(collegeStore.models);
	const budgetRemaining = $derived(collegeStore.gameConfig.pointsLimit - collegeStore.totalCost);
	const wizardModel = $derived(allModels.find((m) => m.template.id === 'wizard'));
	const hasErrors = $derived(collegeStore.validationErrors.length > 0);

	let selectedModelId = $state<string | null>(null);
	let previewTemplate = $state<ModelTemplate | null>(null);

	const selectedModel = $derived.by(() => {
		if (previewTemplate) return null;
		const match = allModels.find((m) => m.id === selectedModelId);
		if (match) return match;
		return wizardModel ?? allModels[0] ?? null;
	});

	const selectRosterModel = (id: string) => {
		previewTemplate = null;
		selectedModelId = id;
	};

	const previewCatalogueModel = (template: ModelTemplate) => {
		selectedModelId = null;
		previewTemplate = template;
	};

	const addPreviewedModel = () => {
		if (!previewTemplate) return;
		const id = collegeStore.addModel(previewTemplate);
		previewTemplate = null;
		selectedModelId = id;
	};

	const removeModel = (modelId: string) => {
		if (selectedModelId === modelId) {
			selectedModelId = null;
		}
		collegeStore.removeModel(modelId);
	};

	const handleSave = () => {
		collegeStore.save();
		goto(resolve('/'));
	};

	const formatDicePool = (pool: { count: number; die: string | number }) =>
		pool.die === 0 ? '-' : `${pool.count}x${pool.die}`;
</script>

<svelte:head>
	<title>Edit {collegeStore.name} &mdash; Aetherpunk 28</title>
</svelte:head>

<div class="min-h-screen px-4 py-8">
	<div class="mx-auto max-w-5xl">
		{#if !loaded}
			<div class="flex flex-col items-center gap-4 py-24">
				<p class="text-lg text-slate-400">College not found.</p>
				<a
					href={resolve('/')}
					class="rounded-lg border border-slate-700 px-6 py-3 text-slate-300 transition hover:bg-slate-800"
				>
					Back to Home
				</a>
			</div>
		{:else}
			<!-- Validation Errors -->
			{#if hasErrors}
				<div class="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
					<h3 class="mb-2 font-semibold text-red-400">Validation Errors</h3>
					<ul class="space-y-1 text-sm text-red-300">
						{#each collegeStore.validationErrors as error, i (i)}
							<li>&bull; {error}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Header with budget -->
			<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
				<div>
					<h2 class="text-3xl font-bold">Edit {collegeStore.name}</h2>
					<p class="text-slate-400">
						{faction?.name} ({faction?.symbol}) &middot; Select a model to configure it. Add new
						models from the catalogue.
					</p>
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
									onclick={() => selectRosterModel(model.id)}
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
									onclick={() => previewCatalogueModel(template)}
									class="flex w-full items-center justify-between rounded-lg border border-dashed px-3 py-2 text-left text-sm transition
									{previewTemplate?.id === template.id
										? 'border-amber-500 bg-amber-500/10'
										: 'border-slate-700 hover:border-amber-500/50 hover:bg-slate-800'}"
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

				<!-- Right: selected model detail or catalogue preview -->
				<div class="min-w-0 flex-1">
					{#if previewTemplate}
						<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
							<div class="mb-4 flex items-start justify-between gap-4">
								<div>
									<h3 class="text-lg font-bold text-slate-100">{previewTemplate.name}</h3>
									<span class="text-sm text-slate-500">{previewTemplate.baseSize}</span>
									<div class="mt-1 text-sm font-semibold text-amber-400">
										{previewTemplate.baseCost} Shillings
									</div>
								</div>
								<button
									onclick={addPreviewedModel}
									class="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
								>
									Add to College
								</button>
							</div>

							<!-- Stats -->
							<div class="mb-4 flex flex-wrap gap-2 text-xs">
								<span class="rounded bg-slate-700 px-2 py-1">Mv {previewTemplate.stats.mv}</span>
								<span class="rounded bg-slate-700 px-2 py-1"
									>Ra {formatDicePool(previewTemplate.stats.ra)}</span
								>
								<span class="rounded bg-slate-700 px-2 py-1"
									>Me {formatDicePool(previewTemplate.stats.me)}</span
								>
								<span class="rounded bg-slate-700 px-2 py-1"
									>Df {previewTemplate.stats.df || '-'}</span
								>
								<span class="rounded bg-slate-700 px-2 py-1"
									>Wp {previewTemplate.stats.wp || '-'}</span
								>
								{#if previewTemplate.stats.range !== '-'}
									<span class="rounded bg-slate-700 px-2 py-1"
										>Range {previewTemplate.stats.range}</span
									>
								{/if}
								<span class="rounded bg-slate-700 px-2 py-1"
									>Surge: {previewTemplate.stats.passiveSurge}</span
								>
							</div>

							<!-- Base Equipment -->
							<div class="mb-4">
								<h4 class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
									Base Equipment
								</h4>
								<div class="flex flex-wrap gap-2">
									{#each previewTemplate.baseEquipment as equip (equip.name)}
										<span class="rounded bg-slate-700/50 px-2 py-1 text-xs text-slate-300">
											{equip.name}{#if equip.range} ({equip.range}){/if}
										</span>
									{/each}
								</div>
							</div>

							<!-- Special Rules -->
							{#if previewTemplate.specialRules.length > 0}
								<div class="mb-4">
									<h4 class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
										Special Rules
									</h4>
									<div class="flex flex-wrap gap-2">
										{#each previewTemplate.specialRules as rule (rule.name)}
											<span
												class="rounded bg-indigo-900/50 px-2 py-1 text-xs text-indigo-300"
												title={rule.description ?? ''}
											>
												{rule.name}{rule.params
													? ` (${Object.values(rule.params).join(', ')})`
													: ''}
											</span>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Available Upgrades -->
							{#if previewTemplate.upgrades.length > 0}
								<div>
									<h4 class="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
										Available Upgrades
									</h4>
									<div class="flex flex-wrap gap-2">
										{#each previewTemplate.upgrades as upgrade (upgrade.name)}
											<span class="rounded bg-slate-700/50 px-2 py-1 text-xs text-slate-300">
												{upgrade.name} (+{upgrade.cost} Sh)
											</span>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{:else if selectedModel}
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
				<a
					href={resolve('/')}
					class="rounded-lg border border-slate-700 px-6 py-3 text-slate-300 transition hover:bg-slate-800"
				>
					Cancel
				</a>
				<button
					onclick={handleSave}
					disabled={hasErrors}
					class="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
				>
					Save College
				</button>
			</div>
		{/if}
	</div>
</div>
