<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { savedCollegesStore } from '$lib/stores/saved-colleges.store.svelte';
	import { FACTIONS } from '$lib/data/factions';
	import FactionIcon from '$lib/components/faction-icon.svelte';
	import type { FactionId } from '$lib/types/game.types';

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
			<img
				class="recruit-image"
				src="/images/rebecca-filled.webp"
				alt="Recruiter"
				width="388"
				height="570"
			/>
			<a class="recruit-button" href={resolve('/builder')}>Create a New College</a>
		</aside>

		<section class="home-colleges">
			<div class="ap-section-label home-heading">My Colleges</div>

			<div class="colleges-grid">
				{#each savedCollegesStore.colleges as saved (saved.id)}
					{@const memberCount = saved.models.length}
					{@const previewModels = saved.models.slice(0, 4)}
					<a class="ap-card college-card" href="{resolve('/builder')}?view={saved.id}">
						<div class="card-stamp">
							<FactionIcon factionId={saved.factionId as FactionId} size={72} />
						</div>
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
									{#each Array.from({ length: MAX_MEMBERS }, (_, i) => i) as pip (pip)}
										<span class="ap-pip" class:filled={pip < memberCount}></span>
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

	<footer class="home-credits">
		<div class="ap-section-label credits-heading">Credits</div>
		<p class="credits-line">
			For <a
				class="credits-link credits-em"
				href="https://www.wargamevault.com/product/463718/Aetherpunk28?manufacturers_id=26307"
				target="_blank"
				rel="noopener noreferrer"><span>Aetherpunk 28</span></a
			> by Jack Edwards
		</p>
		<p class="credits-line">
			Developed by Daniel Lowena-Irons
			<a
				class="credits-link"
				href="https://www.instagram.com/gotredonme"
				target="_blank"
				rel="noopener noreferrer"
			>
				<svg
					class="credits-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect x="2" y="2" width="20" height="20" rx="5" />
					<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
					<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
				</svg>
				<span>@gotredonme</span>
			</a>
			<a
				class="credits-link"
				href="https://github.com/dnirns"
				target="_blank"
				rel="noopener noreferrer"
			>
				<svg
					class="credits-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path
						d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
					/>
					<path d="M9 18c-4.51 2-5-2-7-2" />
				</svg>
				<span>dnirns</span>
			</a>
		</p>
	</footer>
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
		color: var(--ink);
		background: var(--gold);
		border: 1px solid var(--gold);
		padding: 12px 22px;
		text-decoration: none;
		transition:
			background 0.15s,
			border-color 0.15s,
			color 0.15s;
	}
	.recruit-button:hover {
		background: var(--gold-light);
		border-color: var(--gold-light);
		color: var(--ink);
	}

	.home-heading {
		margin-bottom: 28px;
	}

	.colleges-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 40px;
		margin-bottom: 32px;
		padding-top: 28px;
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
		overflow: visible;
	}

	.card-stamp {
		position: absolute;
		top: 0;
		right: 0;
		transform: translate(30%, -35%);
		pointer-events: none;
		z-index: 2;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45));
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
		padding-right: 56px;
	}

	.card-name {
		font-family: 'Special Elite', serif;
		font-size: 20px;
		font-weight: 600;
		color: var(--parchment);
		line-height: 1.2;
	}

	.card-delete {
		background: var(--danger);
		border: 1px solid var(--danger);
		border-radius: var(--r);
		color: var(--parchment);
		font-family: 'Spectral', serif;
		font-size: 16px;
		line-height: 1;
		cursor: pointer;
		width: 28px;
		height: 28px;
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition:
			background 0.15s,
			border-color 0.15s;
		flex-shrink: 0;
	}
	.card-delete:hover {
		background: #a83434;
		border-color: #a83434;
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

	.home-credits {
		margin-top: 64px;
		padding-top: 24px;
		border-top: 1px solid var(--border-gold-faint);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.credits-heading {
		margin-bottom: 10px;
	}

	.credits-line {
		font-family: 'Spectral', serif;
		font-size: 14px;
		color: var(--ink-mid);
		margin: 0;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
	}

	.credits-em {
		font-family: 'Special Elite', serif;
		letter-spacing: 0.04em;
		color: var(--ink);
	}

	.credits-link {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		color: var(--gold);
		text-decoration: none;
		transition: color 0.15s;
	}

	.credits-link span {
		text-decoration: none;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.credits-link:hover {
		color: var(--gold-light);
	}

	.credits-link:hover span {
		text-decoration: underline;
	}

	.credits-icon {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}
</style>
