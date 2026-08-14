<script lang="ts">
	import { collegeStore } from '$lib/stores/college.store.svelte';
	import { FACTIONS } from '$lib/data/factions';
	import type { CollegeModel, DicePool, DieStep } from '$lib/types/game.types';

	const faction = $derived(FACTIONS.find((f) => f.id === collegeStore.factionId));

	const formatDice = (pool: DicePool): string => {
		if (pool.die === 0) return '-';
		return pool.count > 1 ? `${pool.count}${pool.die}` : `${pool.die}`;
	};

	const formatDie = (die: DieStep): string => (die === 0 ? '-' : `${die}`);

	const formatEmpowered = (stat: string, value: string): string => {
		if (stat === 'lightCover') return 'Permanent Light Cover';
		return `${stat.toUpperCase()} ${value}`;
	};

	const effectiveEquipment = (model: CollegeModel) => {
		const replaced = new Set(
			model.equippedUpgrades.map((eu) => eu.replacedEquipment).filter(Boolean)
		);
		const base = model.template.baseEquipment.filter((w) => !replaced.has(w.name));
		const upgradeWeapons = model.equippedUpgrades
			.filter((eu) => eu.upgrade.weapon)
			.map((eu) => eu.upgrade.weapon!);
		return [...base, ...upgradeWeapons];
	};

	const abilityUpgrades = (model: CollegeModel) =>
		model.equippedUpgrades.filter((eu) => !eu.upgrade.weapon);
</script>

<div class="print-only">
	<div class="brand">AETHERPUNK 28</div>
	<header class="header">
		<div class="header-main">
			<h1 class="college-name">{collegeStore.name}</h1>
			{#if faction}
				<p class="faction">{faction.name} ({faction.symbol})</p>
			{/if}
		</div>
		<div class="header-meta">
			<div class="meta-row">
				<span class="meta-label">Treasury</span>
				<span class="meta-val">
					{collegeStore.totalCost} / {collegeStore.gameConfig.pointsLimit ?? '∞'} Sh
				</span>
			</div>
			<div class="meta-row">
				<span class="meta-label">Erudite Charges</span>
				<span class="meta-val">{collegeStore.eruditeCharges}</span>
			</div>
			<div class="meta-row">
				<span class="meta-label">Models</span>
				<span class="meta-val">{collegeStore.models.length}</span>
			</div>
		</div>
	</header>

	{#if faction}
		<section class="faction-info">
			<div class="info-block">
				<span class="info-label">Empowered:</span>
				<span class="info-text">
					{faction.empowered.map((e) => formatEmpowered(e.stat, e.value)).join(', ')}
				</span>
			</div>
			<div class="info-block">
				<span class="info-label">Faction Spell:</span>
				<span class="info-text">
					<strong>{faction.factionSpell.name}</strong> ({faction.factionSpell.cost} Ch) &mdash;
					{faction.factionSpell.description}
				</span>
			</div>
		</section>
	{/if}

	<div class="models">
		{#each collegeStore.models as model (model.id)}
			{@const equipment = effectiveEquipment(model)}
			{@const upgrades = abilityUpgrades(model)}
			<article class="model">
				<header class="model-head">
					<div class="model-title">
						<h2 class="model-name">{model.name}</h2>
						{#if model.name !== model.template.name}
							<span class="model-template">({model.template.name})</span>
						{/if}
						{#if model.template.id === 'wizard'}
							<span class="leader-tag">Leader</span>
						{/if}
					</div>
					<div class="model-meta">
						<span>{model.template.baseSize}</span>
						<span class="cost">{model.totalCost} Sh</span>
					</div>
				</header>

				<table class="stats">
					<thead>
						<tr>
							<th>MV</th>
							<th>RA</th>
							<th>ME</th>
							<th>DF</th>
							<th>WP</th>
							<th>Range</th>
							<th>Surge</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{model.template.stats.mv}</td>
							<td>{formatDice(model.template.stats.ra)}</td>
							<td>{formatDice(model.template.stats.me)}</td>
							<td>{formatDie(model.template.stats.df)}</td>
							<td>{formatDie(model.template.stats.wp)}</td>
							<td>{model.template.stats.range}</td>
							<td>{model.template.stats.passiveSurge}</td>
						</tr>
					</tbody>
				</table>

				{#if equipment.length > 0}
					<div class="row">
						<span class="row-label">Equipment</span>
						<ul class="row-list">
							{#each equipment as weapon (weapon.name)}
								<li>
									<strong>{weapon.name}</strong>
									<span class="dim">
										&mdash; {weapon.type === 'ranged' ? 'Ranged' : 'Melee'}{#if weapon.range}, {weapon.range}{/if}{#if weapon.dice},
											{formatDice(weapon.dice)}{/if}
									</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if upgrades.length > 0}
					<div class="row">
						<span class="row-label">Upgrades</span>
						<ul class="row-list">
							{#each upgrades as eu (eu.upgrade.name)}
								<li>
									<strong>{eu.upgrade.name}</strong>
									<span class="dim">(+{eu.upgrade.cost} Sh)</span>
									{#if eu.upgrade.description}
										<span class="desc"> &mdash; {eu.upgrade.description}</span>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if model.template.specialRules.length > 0}
					<div class="row">
						<span class="row-label">Special Rules</span>
						<ul class="row-list">
							{#each model.template.specialRules as rule (rule.name)}
								<li>
									<strong
										>{rule.name}{rule.params
											? ` (${Object.values(rule.params).join(', ')})`
											: ''}</strong
									>
									{#if rule.description}
										<span class="desc"> &mdash; {rule.description}</span>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if model.merchantItem}
					<div class="row">
						<span class="row-label">Merchant Item</span>
						<ul class="row-list">
							<li>
								<strong>{model.merchantItem.name}</strong>
								<span class="dim">(+{model.merchantItem.cost} Sh)</span>
								<span class="desc"> &mdash; {model.merchantItem.description}</span>
							</li>
						</ul>
					</div>
				{/if}
			</article>
		{/each}
	</div>
</div>

<style>
	.print-only {
		display: none;
	}

	@media print {
		.print-only {
			display: block;
			background: white;
			color: black;
			font-family: 'Spectral', Georgia, serif;
			font-size: 10.5pt;
			line-height: 1.4;
			padding: 14mm;
		}

		.brand {
			font-family: 'Special Elite', Georgia, serif;
			font-size: 10pt;
			letter-spacing: 0.32em;
			text-align: center;
			margin-bottom: 6pt;
			padding-bottom: 4pt;
			border-bottom: 0.5pt solid black;
		}

		.header {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			gap: 16pt;
			border-bottom: 1.5pt solid black;
			padding-bottom: 6pt;
			margin-bottom: 10pt;
		}
		.college-name {
			font-family: 'Special Elite', Georgia, serif;
			font-size: 22pt;
			font-weight: 700;
			line-height: 1.1;
			margin: 0;
		}
		.faction {
			font-style: italic;
			margin-top: 2pt;
			font-size: 11pt;
		}
		.header-meta {
			display: flex;
			gap: 14pt;
			flex-shrink: 0;
		}
		.meta-row {
			display: flex;
			flex-direction: column;
			gap: 1pt;
			text-align: right;
		}
		.meta-label {
			font-family: 'Special Elite', Georgia, serif;
			font-size: 8pt;
			letter-spacing: 0.14em;
			text-transform: uppercase;
		}
		.meta-val {
			font-family: 'Special Elite', Georgia, serif;
			font-size: 13pt;
			font-weight: 700;
		}

		.faction-info {
			margin-bottom: 10pt;
			padding: 6pt 8pt;
			border: 0.75pt solid black;
			display: flex;
			flex-direction: column;
			gap: 3pt;
			break-inside: avoid;
		}
		.info-block {
			font-size: 10pt;
		}
		.info-label {
			font-family: 'Special Elite', Georgia, serif;
			text-transform: uppercase;
			letter-spacing: 0.1em;
			font-size: 9pt;
			margin-right: 4pt;
		}

		.models {
			display: block;
		}
		.models::after {
			content: '';
			display: block;
			clear: both;
		}
		.model {
			float: left;
			width: calc(50% - 4pt);
			box-sizing: border-box;
			border: 0.75pt solid black;
			padding: 6pt 8pt;
			margin: 0 8pt 8pt 0;
			break-inside: avoid;
			page-break-inside: avoid;
		}
		.model:nth-child(2n) {
			margin-right: 0;
		}
		.model-head {
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			gap: 10pt;
			margin-bottom: 4pt;
		}
		.model-title {
			display: flex;
			align-items: baseline;
			gap: 6pt;
			flex-wrap: wrap;
		}
		.model-name {
			font-family: 'Special Elite', Georgia, serif;
			font-size: 14pt;
			font-weight: 700;
			margin: 0;
		}
		.model-template {
			font-style: italic;
			font-size: 10pt;
		}
		.leader-tag {
			font-family: 'Special Elite', Georgia, serif;
			font-size: 8pt;
			letter-spacing: 0.1em;
			text-transform: uppercase;
			border: 0.5pt solid black;
			padding: 0.5pt 4pt;
		}
		.model-meta {
			display: flex;
			gap: 10pt;
			font-size: 10pt;
		}
		.cost {
			font-family: 'Special Elite', Georgia, serif;
			font-weight: 700;
		}

		.stats {
			width: 100%;
			border-collapse: collapse;
			margin: 4pt 0 6pt;
			font-family: 'Special Elite', Georgia, serif;
		}
		.stats th {
			font-size: 8pt;
			letter-spacing: 0.12em;
			text-transform: uppercase;
			font-weight: 400;
			border: 0.5pt solid black;
			padding: 2pt 0;
			background: #eee;
		}
		.stats td {
			font-size: 11pt;
			font-weight: 700;
			text-align: center;
			border: 0.5pt solid black;
			padding: 3pt 0;
		}

		.row {
			margin-top: 4pt;
			font-size: 10pt;
		}
		.row-label {
			font-family: 'Special Elite', Georgia, serif;
			font-size: 8.5pt;
			letter-spacing: 0.12em;
			text-transform: uppercase;
			display: block;
			margin-bottom: 1pt;
		}
		.row-list {
			list-style: none;
			padding: 0;
			margin: 0;
			display: flex;
			flex-direction: column;
			gap: 1pt;
		}
		.row-list li {
			padding-left: 8pt;
			text-indent: -8pt;
		}
		.row-list li::before {
			content: '· ';
		}
		.dim {
			color: #444;
		}
		.desc {
			font-style: italic;
		}

		@page {
			margin: 0;
		}
	}

	@media print and (orientation: landscape) {
		.print-only {
			padding: 10mm 12mm;
		}
		.header {
			margin-bottom: 6pt;
			padding-bottom: 4pt;
		}
		.college-name {
			font-size: 18pt;
		}
		.faction-info {
			margin-bottom: 6pt;
			padding: 4pt 6pt;
		}
		.model {
			width: calc(33.333% - 5.333pt);
			padding: 5pt 7pt;
			margin: 0 8pt 6pt 0;
		}
		.model:nth-child(2n) {
			margin-right: 8pt;
		}
		.model:nth-child(3n) {
			margin-right: 0;
		}
		.model-name {
			font-size: 12pt;
		}
		.stats {
			margin: 3pt 0 4pt;
		}
		.stats td {
			font-size: 10pt;
			padding: 2pt 0;
		}
	}
</style>
