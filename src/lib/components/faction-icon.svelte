<script lang="ts">
	import type { FactionId } from '$lib/types/game.types';

	type Props = {
		factionId: FactionId;
		size?: number;
	};

	const { factionId, size = 56 }: Props = $props();

	const FACTION_IMAGES: Record<FactionId, string> = {
		abjurers: '/images/factions/Abjurer.webp',
		diviners: '/images/factions/Diviner.webp',
		druids: '/images/factions/Druid.webp',
		evokers: '/images/factions/Evoker.webp',
		geomancers: '/images/factions/Geomancer.webp',
		'golem-corps': '/images/factions/Golem-Corps.webp',
		'hedge-wizards': '/images/factions/Hedge-Wizard.webp',
		mechanists: '/images/factions/Mechanists.webp',
		necromancers: '/images/factions/Necromancer.webp',
		paladins: '/images/factions/Paladin.webp',
		stormcallers: '/images/factions/Stormcaller.webp'
	};
</script>

<div class="icon" style="width: {size}px; height: {size}px;" aria-hidden="true">
	<img class="circle" src="/images/circle.webp" alt="" width={size} height={size} />
	<img
		class="faction"
		src={FACTION_IMAGES[factionId]}
		alt=""
		width={size}
		height={size}
		loading="lazy"
	/>
</div>

<style>
	.icon {
		position: relative;
		flex-shrink: 0;
	}
	.circle {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.faction {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 72%;
		height: 72%;
		transform: translate(-50%, -50%);
		object-fit: contain;
		border-radius: 50%;
	}
</style>
