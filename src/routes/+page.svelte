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
	<div class="home-layout">
		<aside class="home-recruit">
			<h1 class="recruit-title">Start Recruiting</h1>
			<img class="recruit-image" src="/images/rebecca.png" alt="Recruiter" />
			<a class="recruit-button" href={resolve('/builder')}>Create a New College</a>
		</aside>

		<section class="home-colleges">
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
			</div>
		</section>
	</div>
</div>

<style>
	.home-screen {
		min-height: 100%;
		padding: 48px 60px;
	}

	.home-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 48px;
		align-items: start;
	}

	.home-recruit {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		position: sticky;
		top: 48px;
	}

	.recruit-title {
		font-family: 'Special Elite', serif;
		font-size: 32px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink);
		text-align: center;
		margin: 0 0 12px;
		line-height: 1.1;
	}

	.recruit-button {
		margin-top: 8px;
	}

	.recruit-image {
		max-width: 100%;
		max-height: calc(100vh - 240px);
		width: auto;
		height: auto;
		display: block;
		object-fit: contain;
	}

	.recruit-button {
		font-family: 'Special Elite', serif;
		font-size: 14px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--gold);
		border: 1px solid var(--gold);
		padding: 12px 22px;
		text-decoration: none;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.recruit-button:hover {
		background: var(--gold);
		color: var(--ink);
	}

	.home-heading {
		margin-bottom: 28px;
	}

	.colleges-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
		margin-bottom: 32px;
	}

	@media (max-width: 1200px) {
		.colleges-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 900px) {
		.home-layout {
			grid-template-columns: 1fr;
		}
		.home-recruit {
			position: static;
		}
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
		font-family: 'Special Elite', serif;
		font-size: 20px;
		font-weight: 600;
		color: var(--parchment);
		line-height: 1.2;
	}

	.card-delete {
		background: none;
		border: none;
		color: var(--ink-light);
		font-size: 15px;
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
		font-family: 'Special Elite', serif;
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-light);
	}
	.card-meta-val {
		font-family: 'Special Elite', serif;
		font-size: 16px;
		color: var(--gold-light);
		font-weight: 600;
	}
	.card-pips {
		display: flex;
		gap: 3px;
		margin-top: 2px;
	}

	.card-faction {
		font-family: 'Spectral', serif;
		font-size: 14px;
		font-style: italic;
		color: var(--ink-light);
	}

	.card-roles {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}

	.card-open {
		font-family: 'Special Elite', serif;
		font-size: 13px;
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
</style>
