<script lang="ts">
	import StepIndicator from '$lib/components/builder/step-indicator.svelte';
	import NameStep from '$lib/components/builder/name-step.svelte';
	import LimitStep from '$lib/components/builder/limit-step.svelte';
	import FactionStep from '$lib/components/builder/faction-step.svelte';
	import ModelsStep from '$lib/components/builder/models-step.svelte';
	import CollegeSummary from '$lib/components/college-summary.svelte';
	import ModelDetailCard from '$lib/components/model-detail-card.svelte';
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { UNIVERSAL_MODELS } from '$lib/data/universal-models';
	import { FACTIONS } from '$lib/data/factions';
	import type { FactionId } from '$lib/types/game.types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { storage } from '$lib/utils/storage';

	type Step = 'name' | 'limit' | 'faction' | 'models' | 'complete';

	const STEPS = [
		{ id: 'name', label: 'Name' },
		{ id: 'limit', label: 'Limit' },
		{ id: 'faction', label: 'Faction' },
		{ id: 'models', label: 'Roster' }
	] as const;

	let currentStep = $state<Step>('name');
	let selectedFactionId = $state<FactionId | null>(null);
	let selectedModelId = $state<string | null>(null);
	let mode = $state<'build' | 'view'>('build');

	const selectedModel = $derived(
		selectedModelId ? collegeStore.models.find((m) => m.id === selectedModelId) ?? null : null
	);

	const viewId = page.url.searchParams.get('view');

	if (viewId) {
		const saved = storage.findById(viewId);
		if (saved) {
			collegeStore.loadFromSaved(saved);
			selectedFactionId = collegeStore.factionId;
			currentStep = 'complete';
			mode = 'view';
		}
	} else {
		collegeStore.reset();
	}

	const goTo = (step: Step) => {
		currentStep = step;
		const scroller = document.getElementById('builder-scroll');
		scroller?.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleNameNext = () => goTo('limit');

	const handleLimitNext = () => goTo('faction');
	const handleLimitBack = () => goTo('name');

	const handleFactionSelect = (id: FactionId) => {
		selectedFactionId = id;
	};

	const handleFactionNext = () => {
		if (!selectedFactionId) return;

		const oldFactionId = collegeStore.factionId;
		collegeStore.setFaction(selectedFactionId);

		if (oldFactionId !== selectedFactionId) {
			const oldFaction = FACTIONS.find((f) => f.id === oldFactionId);
			if (oldFaction) {
				const oldUniqueId = oldFaction.uniqueModel.id;
				for (const model of [...collegeStore.models]) {
					if (model.template.id === oldUniqueId) {
						collegeStore.removeModel(model.id);
					}
				}
			}
		}

		const wizardTemplate = UNIVERSAL_MODELS.find((m) => m.id === 'wizard');
		const existingWizard = collegeStore.models.find((m) => m.template.id === 'wizard');

		if (!existingWizard && wizardTemplate) {
			collegeStore.addModel(wizardTemplate);
		}

		goTo('models');
	};

	const handleFactionBack = () => goTo('limit');
	const handleModelsBack = () => goTo('faction');

	const handleFinish = () => {
		collegeStore.save();
		const url = new URL(page.url);
		url.searchParams.set('view', collegeStore.college.id);
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
		goTo('complete');
	};

	const nameValid = $derived(collegeStore.name.trim().length > 0);
	const limitValid = $derived(
		collegeStore.gameConfig.pointsLimit === null ||
			(collegeStore.gameConfig.pointsLimit ?? 0) > 0
	);
</script>

<svelte:head>
	<title>Build a College &mdash; Aetherpunk 28</title>
</svelte:head>

<div class="builder-shell">
	<div class="builder-scroll" id="builder-scroll">
		<div class="builder-inner">
			{#if currentStep !== 'complete'}
				<div class="step-rail">
					<StepIndicator steps={STEPS} {currentStep} />
				</div>
			{/if}

			{#if currentStep === 'name'}
				<NameStep
					name={collegeStore.name}
					onnamechange={(n) => collegeStore.setName(n)}
					onnext={handleNameNext}
				/>
			{:else if currentStep === 'limit'}
				<LimitStep
					pointsLimit={collegeStore.gameConfig.pointsLimit}
					onlimitchange={(l) => collegeStore.setPointsLimit(l)}
					onnext={handleLimitNext}
				/>
			{:else if currentStep === 'faction'}
				<FactionStep
					selectedFaction={selectedFactionId}
					onfactionselect={handleFactionSelect}
					onnext={handleFactionNext}
				/>
			{:else if currentStep === 'models'}
				<ModelsStep />
			{:else if currentStep === 'complete'}
				<div class="complete">
					<div class="ap-section-label-ink heading-rule">
						{mode === 'view' ? 'College' : 'Saved'}
					</div>
					{#if mode === 'build'}
						<p class="complete-sub">College has been saved to your device.</p>
					{/if}

					<div class="complete-grid">
						<CollegeSummary
							{selectedModelId}
							onmodelselect={(id) => (selectedModelId = selectedModelId === id ? null : id)}
						/>

						{#if selectedModel}
							<div class="detail-sticky">
								<ModelDetailCard model={selectedModel} onclose={() => (selectedModelId = null)} />
							</div>
						{:else}
							<div class="detail-empty">
								<img
									class="detail-empty-image"
									src="/images/scrapper_transparent.png"
									alt=""
								/>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<footer class="builder-footer">
		<div class="builder-footer-inner">
			{#if currentStep === 'name'}
				<button class="ap-btn-ghost-dark" onclick={handleNameNext} disabled={!nameValid}>
					Next
				</button>
			{:else if currentStep === 'limit'}
				<button class="ap-btn-ghost-dark" onclick={handleLimitBack}>Back</button>
				<button class="ap-btn-ghost-dark" onclick={handleLimitNext} disabled={!limitValid}>
					Next
				</button>
			{:else if currentStep === 'faction'}
				<button class="ap-btn-ghost-dark" onclick={handleFactionBack}>Back</button>
			{:else if currentStep === 'models'}
				<button class="ap-btn-ghost-dark" onclick={handleModelsBack}>Back</button>
				<button class="ap-btn-ghost-dark" onclick={handleFinish}>Save College</button>
			{:else if currentStep === 'complete'}
				<a class="ap-btn-ghost-dark" href={resolve('/')}>Home</a>
				<a
					class="ap-btn-ghost-dark"
					href="{resolve('/edit')}?id={viewId ?? collegeStore.college.id}"
				>
					Edit
				</a>
			{/if}
		</div>
	</footer>
</div>

<style>
	.builder-shell {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.builder-scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 24px 16px 24px;
	}
	@media (min-width: 640px) {
		.builder-scroll {
			padding: 32px 32px 32px;
		}
	}
	.builder-inner {
		max-width: 1200px;
		margin: 0 auto;
	}
	.step-rail {
		margin-bottom: 32px;
	}

	.builder-footer {
		flex-shrink: 0;
		padding: 14px 16px 18px;
	}
	@media (min-width: 640px) {
		.builder-footer {
			padding: 14px 32px 22px;
		}
	}
	.builder-footer-inner {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		gap: 12px;
	}

	.complete {
		max-width: 1100px;
		margin: 0 auto;
	}
	.heading-rule {
		margin-bottom: 12px;
	}

	.complete-sub {
		font-family: 'Spectral', serif;
		font-size: 15px;
		color: var(--ink-light);
		font-style: italic;
		margin-bottom: 24px;
	}
	.complete-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
		margin-bottom: 28px;
		align-items: start;
	}
	@media (min-width: 1000px) {
		.complete-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	.detail-sticky {
		position: sticky;
		top: 24px;
	}
	.detail-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		height: 100%;
		padding: 48px;
		overflow: hidden;
	}
	.detail-empty-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
