<script lang="ts">
	type Step = { id: string; label: string };

	type Props = {
		steps: readonly Step[];
		currentStep: string;
	};

	const { steps, currentStep }: Props = $props();

	const currentIndex = $derived(steps.findIndex((s) => s.id === currentStep));
</script>

<nav class="flex items-center gap-2" aria-label="Builder progress">
	{#each steps as step, i (step.id)}
		<div class="flex items-center gap-2">
			<div
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium
					{i < currentIndex
					? 'bg-amber-500 text-slate-950'
					: i === currentIndex
						? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500'
						: 'bg-slate-800 text-slate-500'}"
			>
				{#if i < currentIndex}
					<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
				{:else}
					{i + 1}
				{/if}
			</div>
			<span
				class="hidden text-sm sm:inline
					{i === currentIndex ? 'font-medium text-amber-400' : 'text-slate-500'}"
			>
				{step.label}
			</span>
		</div>
		{#if i < steps.length - 1}
			<div class="h-px flex-1 {i < currentIndex ? 'bg-amber-500' : 'bg-slate-700'}"></div>
		{/if}
	{/each}
</nav>
