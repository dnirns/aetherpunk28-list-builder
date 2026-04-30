<script lang="ts">
	import ModelConfigurator from '$lib/components/builder/model-configurator.svelte';
	import ModelPickerDialog from '$lib/components/builder/model-picker-dialog.svelte';
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
	let savedSnapshot = $state('');
	let editingName = $state(false);
	let editingTreasury = $state(false);
	let nameInputEl = $state<HTMLInputElement | null>(null);
	let treasuryInputEl = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (editingName) nameInputEl?.focus();
	});

	$effect(() => {
		if (editingTreasury) {
			treasuryInputEl?.focus();
			treasuryInputEl?.select();
		}
	});

	const snapshotState = () =>
		JSON.stringify({
			name: collegeStore.name,
			pointsLimit: collegeStore.gameConfig.pointsLimit,
			models: collegeStore.models
		});

	if (collegeId) {
		const saved = storage.findById(collegeId);
		if (saved) {
			collegeStore.loadFromSaved(saved);
			loaded = true;
			savedSnapshot = snapshotState();
		}
	}

	const isDirty = $derived(loaded && snapshotState() !== savedSnapshot);

	const faction = $derived(FACTIONS.find((f) => f.id === collegeStore.factionId));

	const availableModels = $derived.by(() => {
		const models: ModelTemplate[] = UNIVERSAL_MODELS.filter((m) => m.id !== 'wizard');
		if (faction) models.push(faction.uniqueModel);
		return models;
	});

	const allModels = $derived(collegeStore.models);
	const pointsLimit = $derived(collegeStore.gameConfig.pointsLimit);
	const hasLimit = $derived(pointsLimit !== null);
	const budgetRemaining = $derived(pointsLimit === null ? 0 : pointsLimit - collegeStore.totalCost);
	const wizardModel = $derived(allModels.find((m) => m.template.id === 'wizard'));
	const hasErrors = $derived(collegeStore.validationErrors.length > 0);

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

	const handleSave = () => {
		if (!isDirty || hasErrors) return;
		collegeStore.save();
		savedSnapshot = snapshotState();
		goto(`${resolve('/builder')}?view=${collegeId}`);
	};
</script>

<svelte:head>
	<title>Edit {collegeStore.name} &mdash; Aetherpunk 28</title>
</svelte:head>

{#if !loaded}
	<div class="not-found">
		<p>College not found.</p>
		<a class="ap-btn-ghost-dark" href={resolve('/')}>Back to Home</a>
	</div>
{:else}
	<div class="builder-shell">
		<div class="edit-page">
			<header class="step-head">
				<div class="head-text">
					<span class="editing-badge">Editing</span>
					{#if editingName}
						<input
							bind:this={nameInputEl}
							class="title-input"
							value={collegeStore.name}
							oninput={(e) => collegeStore.setName((e.target as HTMLInputElement).value)}
							onblur={() => {
								if (collegeStore.name.trim()) editingName = false;
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter' && collegeStore.name.trim()) editingName = false;
							}}
						/>
					{:else}
						<button
							class="title-button"
							onclick={() => (editingName = true)}
							title="Click to rename"
						>
							<span class="title">{collegeStore.name}</span>
							<span class="edit-hint" aria-hidden="true">✎</span>
						</button>
					{/if}
					{#if faction}
						<p class="subtitle">{faction.name}</p>
					{/if}
				</div>
				<div class="budget">
					<div class="budget-amount">
						{collegeStore.totalCost} <span class="budget-sep">/</span>
						{#if editingTreasury}
							<input
								bind:this={treasuryInputEl}
								class="treasury-input"
								type="number"
								min="0"
								value={pointsLimit ?? ''}
								placeholder="∞"
								oninput={(e) => {
									const raw = (e.target as HTMLInputElement).value;
									if (raw.trim() === '') {
										collegeStore.setPointsLimit(null);
										return;
									}
									const v = Number(raw) || 0;
									collegeStore.setPointsLimit(v);
								}}
								onblur={() => (editingTreasury = false)}
								onkeydown={(e) => {
									if (e.key === 'Enter') editingTreasury = false;
								}}
							/>
						{:else}
							<button
								class="treasury-button"
								onclick={() => (editingTreasury = true)}
								title="Click to edit treasury (clear for no limit)"
							>
								{pointsLimit ?? '∞'}<span class="edit-hint" aria-hidden="true">✎</span>
							</button>
						{/if}
						<span class="budget-unit">Sh</span>
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

			{#if hasErrors}
				<div class="errors">
					<h3>Validation Errors</h3>
					<ul>
						{#each collegeStore.validationErrors as error, i (i)}
							<li>{error}</li>
						{/each}
					</ul>
				</div>
			{/if}

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
				<a class="ap-btn-ghost-dark" href="{resolve('/builder')}?view={collegeId}">Cancel</a>
				<button
					class="ap-btn-ghost-dark"
					onclick={handleSave}
					disabled={!isDirty || hasErrors}
				>
					Save College
				</button>
			</footer>
		</div>
	</div>

	<ModelPickerDialog
		open={pickerOpen}
		templates={availableModels}
		onclose={() => (pickerOpen = false)}
		onpick={handlePickModel}
	/>
{/if}

<style>
	.not-found {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
		padding: 96px 24px;
		font-family: 'Spectral', serif;
		color: var(--ink-light);
	}

	.builder-shell {
		min-height: 100%;
		padding: 24px 16px 48px;
	}
	@media (min-width: 640px) {
		.builder-shell {
			padding: 32px 32px 64px;
		}
	}

	.edit-page {
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
	.head-text {
		min-width: 0;
		flex: 1;
	}
	.editing-badge {
		display: inline-block;
		font-family: 'Surabanglus', serif;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--ink);
		background: var(--gold);
		padding: 4px 10px;
		border-radius: 2px;
		margin-bottom: 10px;
	}
	.title-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: transparent;
		border: none;
		padding: 0;
		margin-top: 6px;
		color: inherit;
		cursor: pointer;
		text-align: left;
	}
	.title-button:hover .edit-hint {
		opacity: 1;
	}
	.title {
		font-family: 'Surabanglus', serif;
		font-size: 26px;
		font-weight: 600;
		color: var(--parchment);
	}
	.title-input {
		display: block;
		margin-top: 6px;
		background: transparent;
		border: none;
		border-bottom: 1.5px solid var(--gold);
		color: var(--parchment);
		font-family: 'Surabanglus', serif;
		font-size: 26px;
		font-weight: 600;
		outline: none;
		padding: 0 0 2px;
		width: 100%;
		max-width: 420px;
	}
	.edit-hint {
		font-family: 'Spectral', serif;
		font-size: 14px;
		color: var(--ink-light);
		opacity: 0.4;
		transition: opacity 0.2s;
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
		font-family: 'Surabanglus', serif;
		font-size: 24px;
		font-weight: 600;
		color: var(--gold-light);
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
	}
	.budget-sep,
	.budget-unit {
		color: var(--ink-light);
		font-weight: 400;
	}
	.treasury-button {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
		background: transparent;
		border: none;
		padding: 0;
		font: inherit;
		color: var(--gold-light);
		cursor: pointer;
	}
	.treasury-button:hover .edit-hint {
		opacity: 1;
	}
	.treasury-input {
		background: transparent;
		border: none;
		border-bottom: 1.5px solid var(--gold);
		color: var(--gold-light);
		font-family: 'Surabanglus', serif;
		font-size: 24px;
		font-weight: 600;
		width: 70px;
		text-align: right;
		outline: none;
		padding-bottom: 1px;
	}
	.treasury-input::-webkit-inner-spin-button,
	.treasury-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
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

	.errors {
		border: 1px solid rgba(139, 42, 42, 0.4);
		background: rgba(139, 42, 42, 0.08);
		border-radius: var(--r);
		padding: 12px 16px;
		margin-bottom: 18px;
	}
	.errors h3 {
		font-family: 'Surabanglus', serif;
		font-size: 13px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--danger);
		margin-bottom: 6px;
	}
	.errors ul {
		list-style: none;
		font-family: 'Spectral', serif;
		font-size: 15px;
		color: var(--danger);
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.errors li::before {
		content: '· ';
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
		color: inherit;
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
		border-color: var(--gold);
		background: rgba(184, 144, 58, 0.08);
	}
	.list-row-main {
		min-width: 0;
		flex: 1;
	}
	.list-row-name {
		font-family: 'Surabanglus', serif;
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
		font-family: 'Surabanglus', serif;
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
		.title,
		.title-input {
			font-size: 22px;
		}
		.budget-amount,
		.treasury-input {
			font-size: 20px;
		}
	}
</style>
