<script lang="ts">
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import CollegeSummary from '$lib/components/college-summary.svelte';

	type Props = {
		onback: () => void;
		onfinish: () => void;
	};

	const { onback, onfinish }: Props = $props();

	const hasErrors = $derived(collegeStore.validationErrors.length > 0);
</script>

<div class="review-step">
	<div class="ap-section-label-ink heading-rule">Review</div>
	<h2 class="title">Review your College</h2>

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

	<div class="summary-wrap">
		<CollegeSummary />
	</div>

	<div class="actions">
		<button class="ap-btn-ghost-dark" onclick={onback}>Back</button>
		<button class="ap-btn-ghost-dark" onclick={onfinish} disabled={hasErrors}>Finish</button>
	</div>
</div>

<style>
	.review-step {
		max-width: 720px;
		margin: 0 auto;
	}
	.heading-rule {
		margin-bottom: 12px;
	}
	.title {
		font-family: 'Cinzel', serif;
		font-size: 24px;
		font-weight: 600;
		color: var(--parchment);
		margin-bottom: 24px;
	}
	.errors {
		border: 1px solid rgba(139, 42, 42, 0.4);
		background: rgba(139, 42, 42, 0.08);
		border-radius: var(--r);
		padding: 14px 16px;
		margin-bottom: 20px;
	}
	.errors h3 {
		font-family: 'Cinzel', serif;
		font-size: 12px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #d97a7a;
		margin-bottom: 8px;
	}
	.errors ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-family: 'Lora', serif;
		font-size: 13px;
		color: #e0a3a3;
	}
	.errors li::before {
		content: '· ';
	}
	.summary-wrap {
		margin-bottom: 24px;
	}
	.actions {
		display: flex;
		justify-content: space-between;
	}
</style>
