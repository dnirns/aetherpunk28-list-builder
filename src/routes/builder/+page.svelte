<script lang="ts">
	import StepIndicator from '$lib/components/builder/step-indicator.svelte';
	import NameStep from '$lib/components/builder/name-step.svelte';
	import FactionStep from '$lib/components/builder/faction-step.svelte';
	import WizardStep from '$lib/components/builder/wizard-step.svelte';
	import ModelsStep from '$lib/components/builder/models-step.svelte';
	import ReviewStep from '$lib/components/builder/review-step.svelte';
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { UNIVERSAL_MODELS } from '$lib/data/universal-models';
	import { FACTIONS } from '$lib/data/factions';
	import type { FactionId } from '$lib/types/game.types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	type Step = 'name' | 'faction' | 'wizard' | 'models' | 'review';

	const STEPS = [
		{ id: 'name', label: 'Name' },
		{ id: 'faction', label: 'Faction' },
		{ id: 'wizard', label: 'Wizard' },
		{ id: 'models', label: 'Roster' },
		{ id: 'review', label: 'Review' }
	] as const;

	let currentStep = $state<Step>('name');
	let selectedFactionId = $state<FactionId | null>(null);
	let wizardModelId = $state('');

	// Reset store for a fresh build
	collegeStore.reset();

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

		if (existingWizard) {
			wizardModelId = existingWizard.id;
		} else if (wizardTemplate) {
			wizardModelId = collegeStore.addModel(wizardTemplate);
		}

		goTo('wizard');
	};

	const handleFactionBack = () => {
		goTo('name');
	};

	const handleWizardBack = () => {
		goTo('faction');
	};

	const handleFinish = () => {
		goto(resolve('/'));
	};
</script>

<svelte:head>
	<title>Build a College &mdash; Aetherpunk 28</title>
</svelte:head>

<div class="min-h-screen px-4 py-8">
	<div class="mx-auto max-w-5xl">
		<div class="mb-8">
			<StepIndicator steps={STEPS} {currentStep} />
		</div>

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
		{:else if currentStep === 'wizard'}
			<WizardStep {wizardModelId} onnext={() => goTo('models')} onback={handleWizardBack} />
		{:else if currentStep === 'models'}
			<ModelsStep onnext={() => goTo('review')} onback={() => goTo('wizard')} />
		{:else if currentStep === 'review'}
			<ReviewStep onback={() => goTo('models')} onfinish={handleFinish} />
		{/if}
	</div>
</div>
