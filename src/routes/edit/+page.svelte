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
	const budgetRemaining = $derived(collegeStore.gameConfig.pointsLimit - collegeStore.totalCost);
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
	<div class="edit-shell">
		<aside class="sidebar">
			<div class="college-header">
				<div class="college-label">College</div>
				{#if editingName}
					<input
						bind:this={nameInputEl}
						class="college-name-input"
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
						class="college-name-display"
						onclick={() => (editingName = true)}
						title="Click to rename"
					>
						<span>{collegeStore.name}</span>
						<span class="edit-hint">✎</span>
					</button>
				{/if}

				<div class="treasury-row">
					<span class="treasury-label">Treasury</span>
					{#if editingTreasury}
						<input
							bind:this={treasuryInputEl}
							class="treasury-input"
							type="number"
							min="0"
							value={collegeStore.gameConfig.pointsLimit}
							oninput={(e) => {
								const v = Number((e.target as HTMLInputElement).value) || 0;
								collegeStore.setGameConfig({ ...collegeStore.gameConfig, pointsLimit: v });
							}}
							onblur={() => (editingTreasury = false)}
							onkeydown={(e) => {
								if (e.key === 'Enter') editingTreasury = false;
							}}
						/>
					{:else}
						<button class="treasury-display" onclick={() => (editingTreasury = true)}>
							<span class="treasury-amount">{collegeStore.gameConfig.pointsLimit}</span>
							<span class="treasury-unit">shillings ✎</span>
						</button>
					{/if}
				</div>

				<div class="treasury-row">
					<span class="treasury-label">Spent</span>
					<span class="spent-amount" class:over={budgetRemaining < 0}>
						{collegeStore.totalCost}
						<span class="spent-unit"
							>· {budgetRemaining >= 0
								? `${budgetRemaining} left`
								: `${Math.abs(budgetRemaining)} over`}</span
						>
					</span>
				</div>

				{#if faction}
					<div class="faction-line">
						<span class="treasury-label">Faction</span>
						<span class="faction-name">{faction.name}</span>
					</div>
				{/if}
			</div>

			<div class="roster-list">
				<div class="ap-section-label-ink list-heading">Roster ({allModels.length})</div>
				{#each allModels as model (model.id)}
					<button
						class="roster-item"
						class:active={selectedModel?.id === model.id}
						onclick={() => selectRosterModel(model.id)}
					>
						<div class="roster-info">
							<div class="roster-name">{model.name}</div>
							<div class="roster-role">{model.template.name}</div>
						</div>
						<div class="roster-cost">{model.totalCost}</div>
						{#if model.template.id === 'wizard'}
							<span class="required-badge">Leader</span>
						{/if}
					</button>
				{/each}
			</div>

			<button class="add-model-btn" onclick={() => (pickerOpen = true)}>
				<span class="plus">+</span> Add Model
			</button>
		</aside>

		<main class="editor-pane">
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

			<div class="editor-scroll">
				{#if selectedModel}
					<ModelConfigurator
						modelId={selectedModel.id}
						showRemove={selectedModel.template.id !== 'wizard'}
						onremove={() => removeModel(selectedModel.id)}
					/>
				{:else}
					<div class="empty">
						<div class="empty-sigil">⚗</div>
						<p>Select a model to configure it</p>
					</div>
				{/if}
			</div>

			<div class="editor-footer">
				<button class="ap-btn-primary" onclick={handleSave} disabled={!isDirty || hasErrors}>
					Save College
				</button>
				<a class="ap-btn-ghost-dark" href="{resolve('/builder')}?view={collegeId}">Cancel</a>
			</div>
		</main>
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
		font-family: 'Lora', serif;
		color: var(--ink-light);
	}

	.edit-shell {
		display: grid;
		grid-template-columns: 280px 1fr;
		height: 100%;
		min-height: 0;
	}

	.sidebar {
		background: var(--panel2);
		border-right: 1px solid var(--border-gold);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		min-height: 0;
	}

	.college-header {
		padding: 20px 18px 16px;
		border-bottom: 1px solid var(--border-gold-faint);
	}
	.college-label {
		font-family: 'Cinzel', serif;
		font-size: 9px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--gold);
		margin-bottom: 6px;
	}
	.college-name-display {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 6px;
		width: 100%;
		background: transparent;
		border: none;
		font-family: 'Cinzel', serif;
		font-size: 17px;
		font-weight: 600;
		color: var(--parchment);
		text-align: left;
		cursor: pointer;
		padding: 0;
		line-height: 1.25;
	}
	.edit-hint {
		font-family: 'Lora', serif;
		font-size: 11px;
		color: var(--ink-light);
		opacity: 0;
		transition: opacity 0.2s;
		margin-top: 2px;
	}
	.college-name-display:hover .edit-hint {
		opacity: 1;
	}
	.college-name-input {
		background: transparent;
		border: none;
		border-bottom: 1.5px solid var(--gold);
		color: var(--parchment);
		font-family: 'Cinzel', serif;
		font-size: 17px;
		font-weight: 600;
		width: 100%;
		outline: none;
		padding: 0 0 2px;
	}

	.treasury-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
	}
	.treasury-label {
		font-family: 'Cinzel', serif;
		font-size: 9px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-light);
		flex-shrink: 0;
	}
	.treasury-display {
		display: flex;
		align-items: center;
		gap: 5px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		color: inherit;
	}
	.treasury-amount {
		font-family: 'Cinzel', serif;
		font-size: 15px;
		color: var(--gold-light);
		font-weight: 600;
	}
	.treasury-unit {
		font-family: 'Lora', serif;
		font-size: 12px;
		color: var(--ink-light);
		font-style: italic;
	}
	.treasury-input {
		background: transparent;
		border: none;
		border-bottom: 1.5px solid var(--gold);
		color: var(--gold-light);
		font-family: 'Cinzel', serif;
		font-size: 15px;
		font-weight: 600;
		width: 70px;
		outline: none;
		padding-bottom: 1px;
	}
	.treasury-input::-webkit-inner-spin-button,
	.treasury-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}
	.spent-amount {
		font-family: 'Cinzel', serif;
		font-size: 15px;
		color: var(--parchment);
	}
	.spent-amount.over {
		color: var(--danger);
	}
	.spent-unit {
		font-family: 'Lora', serif;
		font-size: 11px;
		color: var(--ink-light);
		font-style: italic;
		margin-left: 4px;
	}

	.faction-line {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
	}
	.faction-name {
		font-family: 'Cinzel', serif;
		font-size: 12px;
		color: var(--gold-light);
	}

	.roster-list {
		flex: 1;
		overflow-y: auto;
		padding: 12px 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.list-heading {
		margin: 6px 4px 8px;
	}

	.add-model-btn {
		margin: 8px 12px 14px;
		padding: 10px 14px;
		background: transparent;
		border: 1px dashed rgba(184, 144, 58, 0.35);
		border-radius: var(--r);
		color: var(--gold);
		font-family: 'Lora', serif;
		font-size: 13px;
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
		font-size: 18px;
		line-height: 1;
	}

	.roster-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 12px;
		background: transparent;
		border: 1px solid transparent;
		border-left: 3px solid transparent;
		border-radius: var(--r);
		text-align: left;
		color: inherit;
		cursor: pointer;
		transition:
			background 0.12s,
			border-color 0.12s;
	}
	.roster-item:hover {
		background: var(--panel3);
	}
	.roster-item.active {
		background: rgba(184, 144, 58, 0.08);
		border-left-color: var(--gold);
	}
	.roster-info {
		flex: 1;
		min-width: 0;
	}
	.roster-name {
		font-family: 'Cinzel', serif;
		font-size: 13px;
		color: var(--parchment);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.roster-role {
		font-family: 'Lora', serif;
		font-size: 11px;
		font-style: italic;
		color: var(--ink-light);
		margin-top: 1px;
	}
	.roster-cost {
		font-family: 'Cinzel', serif;
		font-size: 12px;
		color: var(--gold-light);
		flex-shrink: 0;
	}
	.required-badge {
		font-family: 'Cinzel', serif;
		font-size: 8px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #a07acc;
		border: 1px solid rgba(90, 62, 122, 0.4);
		border-radius: 2px;
		padding: 1px 5px;
		flex-shrink: 0;
	}

	.editor-pane {
		background: var(--parchment);
		color: var(--ink);
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}

	.errors {
		margin: 18px 36px 0;
		border: 1px solid rgba(139, 42, 42, 0.4);
		background: rgba(139, 42, 42, 0.06);
		border-radius: var(--r);
		padding: 12px 16px;
	}
	.errors h3 {
		font-family: 'Cinzel', serif;
		font-size: 11px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--danger);
		margin-bottom: 6px;
	}
	.errors ul {
		list-style: none;
		font-family: 'Lora', serif;
		font-size: 13px;
		color: var(--danger);
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.errors li::before {
		content: '· ';
	}

	.editor-scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 28px 36px;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		height: 100%;
		opacity: 0.5;
	}
	.empty-sigil {
		width: 64px;
		height: 64px;
		border: 2px solid var(--ink-mid);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28px;
		color: var(--ink-mid);
	}
	.empty p {
		font-family: 'Cinzel', serif;
		font-size: 14px;
		letter-spacing: 0.08em;
		color: var(--ink-mid);
	}

	.editor-footer {
		flex-shrink: 0;
		padding: 14px 36px;
		background: var(--parchment);
		border-top: 1px solid var(--parchment3);
		display: flex;
		align-items: center;
		gap: 10px;
	}
</style>
