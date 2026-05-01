<script lang="ts">
	type Props = {
		name: string;
		onnamechange: (name: string) => void;
		onnext: () => void;
	};

	const { name, onnamechange, onnext }: Props = $props();

	const isValid = $derived(name.trim().length > 0);

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && isValid) onnext();
	};
</script>

<div class="name-step">
	<div class="ap-section-label-ink heading-rule">Begin</div>
	<h2 class="title">Name your College</h2>
	<p class="subtitle">Every great warband needs a name.</p>

	<input
		type="text"
		value={name}
		oninput={(e) => onnamechange(e.currentTarget.value)}
		onkeydown={handleKeydown}
		placeholder="e.g. The Iron Scholars"
		class="ap-field-input-dark name-input"
	/>

	<div class="actions">
		<button class="ap-btn-ghost-dark" onclick={onnext} disabled={!isValid}>Next</button>
	</div>
</div>

<style>
	.name-step {
		max-width: 480px;
		margin: 0 auto;
		padding-top: 48px;
		text-align: center;
	}
	.heading-rule {
		justify-content: center;
		margin-bottom: 20px;
	}
	.title {
		font-family: 'Special Elite', serif;
		font-size: 30px;
		font-weight: 600;
		color: var(--parchment);
		margin-bottom: 8px;
	}
	.subtitle {
		font-family: 'Spectral', serif;
		font-size: 16px;
		color: var(--ink-light);
		font-style: italic;
		margin-bottom: 28px;
	}
	.name-input {
		text-align: center;
		font-family: 'Special Elite', serif;
		font-size: 20px;
	}
	.actions {
		margin-top: 24px;
	}
</style>
