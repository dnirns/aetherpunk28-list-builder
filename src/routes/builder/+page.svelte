<script lang="ts">
	import StepIndicator from '$lib/components/builder/step-indicator.svelte';
	import NameStep from '$lib/components/builder/name-step.svelte';
	import LimitStep from '$lib/components/builder/limit-step.svelte';
	import FactionStep from '$lib/components/builder/faction-step.svelte';
	import ModelsStep from '$lib/components/builder/models-step.svelte';
	import ReviewStep from '$lib/components/builder/review-step.svelte';
	import CollegeSummary from '$lib/components/college-summary.svelte';
	import ModelDetailCard from '$lib/components/model-detail-card.svelte';
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { UNIVERSAL_MODELS } from '$lib/data/universal-models';
	import { FACTIONS } from '$lib/data/factions';
	import type { FactionId } from '$lib/types/game.types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { storage } from '$lib/utils/storage';

	type Step = 'name' | 'limit' | 'faction' | 'models' | 'review' | 'complete';

	const STEPS = [
		{ id: 'name', label: 'Name' },
		{ id: 'limit', label: 'Limit' },
		{ id: 'faction', label: 'Faction' },
		{ id: 'models', label: 'Roster' },
		{ id: 'review', label: 'Review' }
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
		const scroller = document.getElementById('app-scroll');
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

	const handleFinish = () => {
		collegeStore.save();
		goTo('complete');
	};

</script>

<svelte:head>
	<title>Build a College &mdash; Aetherpunk 28</title>
</svelte:head>

<div class="builder-shell">
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
				onback={handleLimitBack}
			/>
		{:else if currentStep === 'faction'}
			<FactionStep
				selectedFaction={selectedFactionId}
				onfactionselect={handleFactionSelect}
				onnext={handleFactionNext}
				onback={handleFactionBack}
			/>
		{:else if currentStep === 'models'}
			<ModelsStep onnext={() => goTo('review')} onback={() => goTo('faction')} />
		{:else if currentStep === 'review'}
			<ReviewStep onback={() => goTo('models')} onfinish={handleFinish} />
		{:else if currentStep === 'complete'}
			<div class="complete">
				<div class="ap-section-label-ink heading-rule">
					{mode === 'view' ? 'College' : 'Saved'}
				</div>
				<h2 class="complete-title">{collegeStore.name}</h2>
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
						<div class="detail-empty">Select a model to view its details</div>
					{/if}
				</div>

				<div class="complete-actions">
					<a class="ap-btn-ghost-dark" href={resolve('/')}>Home</a>
					<a
						class="ap-btn-ghost-dark"
						href="{resolve('/edit')}?id={viewId ?? collegeStore.college.id}"
					>
						Edit
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.builder-shell {
		min-height: 100%;
		padding: 24px 16px 48px;
	}
	@media (min-width: 640px) {
		.builder-shell {
			padding: 32px 32px 64px;
		}
	}
	.builder-inner {
		max-width: 1200px;
		margin: 0 auto;
	}
	.step-rail {
		margin-bottom: 32px;
	}

	.complete {
		max-width: 1100px;
		margin: 0 auto;
	}
	.heading-rule {
		margin-bottom: 12px;
	}
	.complete-title {
		font-family: 'Cinzel', serif;
		font-size: 28px;
		font-weight: 600;
		color: var(--gold-light);
		margin-bottom: 4px;
	}
	.complete-sub {
		font-family: 'Lora', serif;
		font-size: 13px;
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
		border: 1px dashed rgba(122, 110, 98, 0.3);
		border-radius: 4px;
		color: var(--ink-light);
		font-family: 'Lora', serif;
		font-size: 13px;
		font-style: italic;
	}
	.complete-actions {
		display: flex;
		justify-content: center;
		gap: 12px;
	}
</style>
