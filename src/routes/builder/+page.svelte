<script lang="ts">
	import StepIndicator from '$lib/components/builder/step-indicator.svelte';
	import NameStep from '$lib/components/builder/name-step.svelte';
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

	type Step = 'name' | 'faction' | 'models' | 'review' | 'complete';

	const STEPS = [
		{ id: 'name', label: 'Name' },
		{ id: 'faction', label: 'Faction' },
		{ id: 'models', label: 'Roster' },
		{ id: 'review', label: 'Review' }
	] as const;

	let currentStep = $state<Step>('name');
	let selectedFactionId = $state<FactionId | null>(null);
	let selectedModelId = $state<string | null>(null);

	const selectedModel = $derived(
		selectedModelId ? collegeStore.models.find((m) => m.id === selectedModelId) ?? null : null
	);

	// Load a saved college by ID from URL for viewing, or reset for a fresh build
	const viewId = page.url.searchParams.get('view');

	if (viewId) {
		const saved = storage.findById(viewId);
		if (saved) {
			collegeStore.loadFromSaved(saved);
			selectedFactionId = collegeStore.factionId;
			currentStep = 'complete';
		}
	} else {
		collegeStore.reset();
	}

	const goTo = (step: Step) => {
		currentStep = step;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// --- Step handlers ---

	const handleNameNext = () => {
		goTo('faction');
	};

	const handleFactionSelect = (id: FactionId) => {
		selectedFactionId = id;
	};

	const handleFactionNext = () => {
		if (!selectedFactionId) return;

		const oldFactionId = collegeStore.factionId;
		collegeStore.setFaction(selectedFactionId);

		// If faction changed, remove models belonging to the old faction's unique
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

		// Add the Wizard if not already present
		const wizardTemplate = UNIVERSAL_MODELS.find((m) => m.id === 'wizard');
		const existingWizard = collegeStore.models.find((m) => m.template.id === 'wizard');

		if (!existingWizard && wizardTemplate) {
			collegeStore.addModel(wizardTemplate);
		}

		goTo('models');
	};

	const handleFactionBack = () => {
		goTo('name');
	};

	const handleFinish = () => {
		collegeStore.save();
		goTo('complete');
	};

	const handleNewCollege = () => {
		collegeStore.reset();
		selectedFactionId = null;
		goTo('name');
	};
</script>

<svelte:head>
	<title>Build a College &mdash; Aetherpunk 28</title>
</svelte:head>

<div class="min-h-screen px-4 py-8">
	<div class="mx-auto max-w-5xl">
		{#if currentStep !== 'complete'}
			<div class="mb-8">
				<StepIndicator steps={STEPS} {currentStep} />
			</div>
		{/if}

		{#if currentStep === 'name'}
			<NameStep
				name={collegeStore.name}
				onnamechange={(n) => collegeStore.setName(n)}
				onnext={handleNameNext}
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
			<div>
				<h2 class="mb-2 text-center text-3xl font-bold text-amber-400">College Saved</h2>
				<p class="mb-8 text-center text-slate-400">
					{collegeStore.name} has been saved to your device.
				</p>

				<div class="mb-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
					<CollegeSummary
						{selectedModelId}
						onmodelselect={(id) => (selectedModelId = selectedModelId === id ? null : id)}
					/>

					{#if selectedModel}
						<div class="lg:sticky lg:top-8">
							<ModelDetailCard model={selectedModel} onclose={() => (selectedModelId = null)} />
						</div>
					{:else}
						<div
							class="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-700 text-slate-500"
						>
							Select a model to view its details
						</div>
					{/if}
				</div>

				<div class="flex justify-center gap-4">
					<a
						href={resolve('/')}
						class="rounded-lg border border-slate-700 px-6 py-3 text-slate-300 transition hover:bg-slate-800"
					>
						Home
					</a>
					<button
						onclick={handleNewCollege}
						class="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
					>
						Create Another
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
