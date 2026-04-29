<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savedCollegesStore } from '$lib/stores/saved-colleges.store.svelte';
	import { FACTIONS } from '$lib/data/factions';

	const MAX_MEMBERS = 5;

	onMount(() => {
		savedCollegesStore.refresh();
	});

	const getFactionName = (factionId: string) =>
		FACTIONS.find((f) => f.id === factionId)?.name ?? factionId;

	const handleDelete = (e: MouseEvent, id: string) => {
		e.preventDefault();
		e.stopPropagation();
		if (window.confirm('Delete this College? This cannot be undone.')) {
			savedCollegesStore.remove(id);
		}
	};
</script>

<svelte:head>
	<title>Aetherpunk 28 &mdash; College Builder</title>
</svelte:head>

<div class="home-screen">
	<div class="ap-section-label home-heading">My Colleges</div>

	<div class="colleges-grid">
		{#each savedCollegesStore.colleges as saved (saved.id)}
			{@const memberCount = saved.models.length}
			{@const previewModels = saved.models.slice(0, 4)}
			<a class="ap-card college-card" href="{resolve('/builder')}?view={saved.id}">
				<div class="card-header">
					<div class="card-name">{saved.name}</div>
					<button
						class="card-delete"
						onclick={(e) => handleDelete(e, saved.id)}
						title="Delete College"
						aria-label="Delete College"
					>
						✕
					</button>
				</div>

				<div class="card-meta">
					<div class="card-meta-item">
						<span class="card-meta-label">Members</span>
						<div class="card-pips">
							{#each Array(MAX_MEMBERS) as _, i (i)}
								<span class="ap-pip" class:filled={i < memberCount}></span>
							{/each}
						</div>
					</div>
					<div class="card-meta-item">
						<span class="card-meta-label">Treasury</span>
						<span class="card-meta-val">
							{saved.totalCost} / {saved.gameConfig.pointsLimit ?? '∞'} ʃ
						</span>
					</div>
				</div>

				<div class="card-faction">{getFactionName(saved.factionId)}</div>

				{#if previewModels.length > 0}
					<div class="card-roles">
						{#each previewModels as model (model.id)}
							<span class="ap-tag">{model.name}</span>
						{/each}
						{#if saved.models.length > previewModels.length}
							<span class="ap-tag">+{saved.models.length - previewModels.length}</span>
						{/if}
					</div>
				{/if}

				<div class="card-open">Open College →</div>
			</a>
		{/each}

		<a class="ap-card-dashed new-college-card" href={resolve('/builder')}>
			<div class="new-college-plus">+</div>
			<div class="new-college-label">New College</div>
		</a>
	</div>
</div>

<style>
	.home-screen {
		min-height: 100%;
		padding: 48px 60px;
	}

	.home-heading {
		margin-bottom: 28px;
	}

	.colleges-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
		margin-bottom: 32px;
	}

	.college-card {
		min-height: 140px;
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
	}

	.card-name {
		font-family: 'Cinzel', serif;
		font-size: 18px;
		font-weight: 600;
		color: var(--parchment);
		line-height: 1.2;
	}

	.card-delete {
		background: none;
		border: none;
		color: var(--ink-light);
		font-size: 13px;
		cursor: pointer;
		padding: 2px 6px;
		opacity: 0;
		transition:
			color 0.15s,
			opacity 0.15s;
		flex-shrink: 0;
	}
	.college-card:hover .card-delete {
		opacity: 1;
	}
	.card-delete:hover {
		color: var(--danger);
	}

	.card-meta {
		display: flex;
		gap: 24px;
	}
	.card-meta-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.card-meta-label {
		font-family: 'Cinzel', serif;
		font-size: 9px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
	}
	.card-meta-val {
		font-family: 'Cinzel', serif;
		font-size: 14px;
		color: var(--gold-light);
		font-weight: 600;
	}
	.card-pips {
		display: flex;
		gap: 3px;
		margin-top: 2px;
	}

	.card-faction {
		font-family: 'Lora', serif;
		font-size: 12px;
		font-style: italic;
		color: var(--ink-light);
	}

	.card-roles {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}

	.card-open {
		font-family: 'Cinzel', serif;
		font-size: 11px;
		letter-spacing: 0.1em;
		color: var(--gold);
		margin-top: auto;
		opacity: 0;
		transition: opacity 0.15s;
		text-transform: uppercase;
	}
	.college-card:hover .card-open {
		opacity: 1;
	}

	.new-college-plus {
		font-size: 28px;
		line-height: 1;
	}
	.new-college-label {
		font-family: 'Cinzel', serif;
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
</style>
