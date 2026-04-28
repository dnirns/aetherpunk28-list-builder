<script lang="ts">
	type Step = { id: string; label: string };

	type Props = {
		steps: readonly Step[];
		currentStep: string;
	};

	const { steps, currentStep }: Props = $props();

	const currentIndex = $derived(steps.findIndex((s) => s.id === currentStep));
</script>

<nav class="step-indicator" aria-label="Builder progress">
	{#each steps as step, i (step.id)}
		<div class="step-row">
			<div
				class="step-dot"
				class:done={i < currentIndex}
				class:active={i === currentIndex}
			>
				{#if i < currentIndex}
					<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
			<span class="step-label" class:active={i === currentIndex}>{step.label}</span>
		</div>
		{#if i < steps.length - 1}
			<div class="step-rule" class:done={i < currentIndex}></div>
		{/if}
	{/each}
</nav>

<style>
	.step-indicator {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.step-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.step-dot {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Cinzel', serif;
		font-size: 12px;
		border-radius: 50%;
		border: 1px solid rgba(122, 110, 98, 0.4);
		color: var(--ink-light);
		background: transparent;
	}
	.step-dot.active {
		border-color: var(--gold);
		color: var(--gold);
		background: rgba(184, 144, 58, 0.08);
	}
	.step-dot.done {
		background: var(--gold);
		border-color: var(--gold);
		color: var(--ink);
	}
	.step-dot svg {
		width: 14px;
		height: 14px;
	}

	.step-label {
		font-family: 'Cinzel', serif;
		font-size: 11px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--ink-light);
		display: none;
	}
	.step-label.active {
		color: var(--gold);
	}

	.step-rule {
		flex: 1;
		height: 1px;
		background: rgba(122, 110, 98, 0.3);
	}
	.step-rule.done {
		background: linear-gradient(90deg, var(--gold), var(--gold));
	}

	@media (min-width: 640px) {
		.step-label {
			display: inline;
		}
	}
</style>
