import type { CoreSpell, MerchantItem } from '$lib/types/game.types';

export const CORE_SPELLS: CoreSpell[] = [
	{ name: 'Cracklebolt', cost: 1, description: 'Ranged attack within 8", uses Wp vs Wp.' },
	{ name: 'Arcane Barrier', cost: 1, description: 'Target within 6" gains cover bonus.' },
	{ name: 'Telekinetic Shunt', cost: 1, description: 'Move objective within 12" up to 4".' },
	{ name: 'Shatter Pulse', cost: 2, description: 'Destroy light cover within 12".' },
	{ name: 'Meteor Shower', cost: 2, description: 'Ranged attack within 16", uses Wp vs Wp.' },
	{ name: 'Seismic Catalyst', cost: 3, description: 'Terrain piece becomes troublesome.' }
];

export const MERCHANT_ITEMS: MerchantItem[] = [
	{ name: 'Brickwalker Boots', cost: 5, description: 'Climb terrain ignoring vertical distance.' },
	{ name: 'Runic Wards', cost: 4, description: 'Armour (1), overrides other armour rules.' },
	{ name: 'Rangefinder', cost: 2, description: 'Increase range of one non-One-Use weapon by 6".' },
	{ name: 'Eldritch Kibble', cost: 1, restriction: 'Dragoon/Familiar only', description: 'Wp +1.' },
	{
		name: 'Secret Stash',
		cost: 1,
		restriction: 'Wizard only',
		description: 'Chance for extra starting Erudite.'
	},
	{ name: 'Erudite Trinket', cost: 1, description: 'Reroll one failed check per game.' },
	{ name: 'Runic Breastplate', cost: 1, description: 'Df +1 until Df check failed.' },
	{ name: 'Shiny Satchel', cost: 1, description: 'Carry extra Erudite deposit.' },
	{ name: 'Smoke Bombs', cost: 1, description: 'Gain light cover once per game when fired upon.' },
	{ name: 'Orb', cost: 1, description: 'Improve Unbind die by one step once per game.' },
	{ name: 'Unstable Ranged Foci', cost: 7, description: 'Grants Unstable to a ranged weapon.' },
	{ name: "Bently Bartle's Book of Balistics", cost: 7, description: 'Grants Take Aim.' },
	{ name: 'Sock Full of Sharp Rocks', cost: 1, description: 'D6 counter-attack when fought.' },
	{ name: 'Exploding Underpants', cost: 2, description: '8D6 attack on death, guarantees injury.' },
	{ name: 'Runic Blind-Bag', cost: 7, description: 'Grants Unstable to a melee weapon.' },
	{
		name: 'Munitions Stowage',
		cost: 1,
		restriction: 'Cargo Hold models only',
		description: 'Free One-Use item usage within 3".'
	},
	{ name: "Wizard's Grog", cost: 2, description: 'Passive surge becomes Charge.' },
	{ name: 'Entrenching Shovel', cost: 2, description: 'Passive surge becomes Hunker Down.' },
	{ name: 'Triage Kit', cost: 2, description: 'Heal Wp by 1 (consumes both orders).' },
	{ name: 'Superior Pointed Hat', cost: 1, description: 'Wp +1.' }
];
