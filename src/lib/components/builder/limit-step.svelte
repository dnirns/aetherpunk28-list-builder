<script lang="ts">
	type Props = {
		pointsLimit: number | null;
		onlimitchange: (limit: number | null) => void;
		onnext: () => void;
		onback: () => void;
	};

	const { pointsLimit, onlimitchange, onnext, onback }: Props = $props();

	const PRESETS = [30, 50, 75, 100] as const;

	const isNoLimit = $derived(pointsLimit === null);
	const isPreset = $derived(pointsLimit !== null && (PRESETS as readonly number[]).includes(pointsLimit));
	const isCustom = $derived(!isNoLimit && !isPreset);

	let customValue = $state('');

	const isValid = $derived(isNoLimit || (pointsLimit !== null && pointsLimit > 0));

	const selectPreset = (n: number) => {
		customValue = '';
		onlimitchange(n);
	};

	const selectNoLimit = () => {
		customValue = '';
		onlimitchange(null);
	};

	const handleCustomInput = (raw: string) => {
		customValue = raw;
		const n = Number(raw);
		if (raw.trim() === '' || Number.isNaN(n) || n <= 0) {
			onlimitchange(0);
			return;
		}
		onlimitchange(Math.floor(n));
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && isValid) onnext();
	};
</script>

<div class="limit-step">
	<div class="ap-section-label-ink heading-rule">Stakes</div>
	<h2 class="title">Set the Shilling limit</h2>
	<p class="subtitle">How large a College will you be fielding?</p>

	<div class="presets" role="radiogroup" aria-label="Shilling limit presets">
		{#each PRESETS as preset (preset)}
			<button
				type="button"
				class="preset"
				class:active={!isNoLimit && pointsLimit === preset}
				role="radio"
				aria-checked={!isNoLimit && pointsLimit === preset}
				onclick={() => selectPreset(preset)}
			>
				<span class="preset-amount">{preset}</span>
				<span class="preset-unit">Sh</span>
			</button>
		{/each}
		<button
			type="button"
			class="preset no-limit"
			class:active={isNoLimit}
			role="radio"
			aria-checked={isNoLimit}
			onclick={selectNoLimit}
		>
			<span class="preset-amount">∞</span>
			<span class="preset-unit">No limit</span>
		</button>
	</div>

	<div class="custom">
		<label class="custom-label" for="custom-limit">Or enter a custom amount</label>
		<input
			id="custom-limit"
			type="number"
			min="1"
			step="1"
			inputmode="numeric"
			value={customValue}
			oninput={(e) => handleCustomInput(e.currentTarget.value)}
			onkeydown={handleKeydown}
			placeholder="e.g. 60"
			class="ap-field-input-dark custom-input"
			class:active={isCustom}
		/>
	</div>

	<div class="actions">
		<button class="ap-btn-ghost-dark" onclick={onback}>Back</button>
		<button class="ap-btn-ghost-dark" onclick={onnext} disabled={!isValid}>Next</button>
	</div>
</div>

<style>
	.limit-step {
		max-width: 520px;
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
		color: var(--ink);
		margin-bottom: 8px;
	}
	.subtitle {
		font-family: 'Spectral', serif;
		font-size: 16px;
		color: var(--ink-light);
		font-style: italic;
		margin-bottom: 28px;
	}
	.presets {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		margin-bottom: 24px;
	}
	@media (min-width: 520px) {
		.presets {
			grid-template-columns: repeat(5, 1fr);
		}
	}
	.preset {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 14px 8px;
		background: var(--panel2);
		border: 1px solid var(--border-gold-faint);
		border-radius: var(--r);
		color: var(--parchment);
		cursor: pointer;
		transition:
			background 0.12s,
			border-color 0.12s;
	}
	.preset:hover {
		background: var(--panel3);
		border-color: var(--border-gold);
	}
	.preset.active {
		border-color: var(--gold-light);
		background:
			linear-gradient(rgba(184, 144, 58, 0.16), rgba(184, 144, 58, 0.16)),
			var(--panel2);
		box-shadow:
			0 0 0 2px var(--gold-light),
			0 0 12px rgba(184, 144, 58, 0.35);
	}
	.preset-amount {
		font-family: 'Special Elite', serif;
		font-size: 22px;
		font-weight: 600;
		color: var(--gold-light);
	}
	.preset-unit {
		font-family: 'Spectral', serif;
		font-size: 13px;
		color: var(--ink-light);
		font-style: italic;
	}
	.no-limit .preset-amount {
		font-size: 24px;
	}

	.custom {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		margin-bottom: 28px;
	}
	.custom-label {
		font-family: 'Special Elite', serif;
		font-size: 12px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--ink-light);
	}
	.custom-input {
		max-width: 200px;
		text-align: center;
		font-family: 'Special Elite', serif;
		font-size: 20px;
		color: #000;
	}
	.custom-input.active {
		border-color: var(--gold);
	}

	.actions {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		margin-top: 24px;
	}
</style>
