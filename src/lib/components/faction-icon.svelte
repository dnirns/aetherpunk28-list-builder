<script lang="ts">
	import type { FactionId } from '$lib/types/game.types';

	type Props = {
		factionId: FactionId;
		size?: number;
	};

	const { factionId, size = 56 }: Props = $props();

	const FACTION_IMAGES: Record<FactionId, string> = {
		abjurers: '/images/factions/Abjurer.png',
		diviners: '/images/factions/Diviner.png',
		druids: '/images/factions/Druid.png',
		evokers: '/images/factions/Evoker.png',
		geomancers: '/images/factions/Geomancer.png',
		'golem-corps': '/images/factions/Golem-Corps.png',
		'hedge-wizards': '/images/factions/Hedge-Wizard.png',
		mechanists: '/images/factions/Mechanists.png',
		necromancers: '/images/factions/Necromancer.png',
		paladins: '/images/factions/Paladin.png',
		stormcallers: '/images/factions/Stormcaller.png'
	};
</script>

<div class="icon" style="width: {size}px; height: {size}px;" aria-hidden="true">
	<img class="circle" src="/images/circle.png" alt="" />
	<img class="faction" src={FACTION_IMAGES[factionId]} alt="" />
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
