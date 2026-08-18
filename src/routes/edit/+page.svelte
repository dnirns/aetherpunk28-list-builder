<script lang="ts">
	import RosterEditor from '$lib/components/builder/roster-editor.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { FACTIONS } from '$lib/data/factions';
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

	const pointsLimit = $derived(collegeStore.gameConfig.pointsLimit);
	const hasLimit = $derived(pointsLimit !== null);
	const budgetRemaining = $derived(pointsLimit === null ? 0 : pointsLimit - collegeStore.totalCost);
	const hasErrors = $derived(collegeStore.validationErrors.length > 0);

	const handleSave = () => {
		if (!isDirty || hasErrors) return;
		collegeStore.save();
		savedSnapshot = snapshotState();
		// The route itself is resolved; the rule cannot see through the appended query string.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${resolve('/builder')}?view=${collegeId}`);
	};
</script>

<Seo
	title="Edit {collegeStore.name} | Aetherpunk 28 List Builder"
	description="Edit a saved Aetherpunk 28 College: adjust the roster, swap equipment and re-check the list against the game's list building rules."
	path="/edit"
	noindex
/>

{#if !loaded}
	<div class="not-found">
		<p>College not found.</p>
		<a class="ap-btn-ghost-dark" href={resolve('/')}>Back to Home</a>
	</div>
{:else}
	<div class="builder-shell">
		<div class="edit-scroll" id="edit-scroll">
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

				<RosterEditor />
			</div>
		</div>

		<footer class="actions">
			<div class="actions-inner">
				<a class="ap-btn-ghost-dark" href="{resolve('/builder')}?view={collegeId}">Cancel</a>
				<button class="ap-btn-ghost-dark" onclick={handleSave} disabled={!isDirty || hasErrors}>
					Save College
				</button>
			</div>
		</footer>
	</div>
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
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.edit-scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 24px 16px 24px;
	}
	@media (min-width: 640px) {
		.edit-scroll {
			padding: 32px 32px 32px;
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
		font-family: 'Special Elite', serif;
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
		font-family: 'Special Elite', serif;
		cursor: pointer;
		text-align: left;
	}
	.title-button:hover .edit-hint {
		opacity: 1;
	}
	.title {
		font-family: 'Special Elite', serif;
		font-size: 26px;
		font-weight: 600;
		color: var(--ink);
	}
	.title-input {
		display: block;
		margin-top: 6px;
		background: transparent;
		border: none;
		border-bottom: 1.5px solid var(--gold);
		color: var(--ink);
		font-family: 'Special Elite', serif;
		font-size: 26px;
		font-weight: 600;
		outline: none;
		padding: 0 0 2px;
		width: 100%;
		max-width: 420px;
	}
	.edit-hint {
		font-family: 'Spectral', serif;
		font-size: 26px;
		color: var(--ink);
		opacity: 1;
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
		font-family: 'Special Elite', serif;
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
		font-family: 'Special Elite', serif;
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

	.actions {
		flex-shrink: 0;
		padding: 14px 16px 18px;
	}
	@media (min-width: 640px) {
		.actions {
			padding: 14px 32px 22px;
		}
	}
	.actions-inner {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		gap: 12px;
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
