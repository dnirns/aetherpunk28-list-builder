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
	{
		name: 'Brickwalker Boots',
		cost: 5,
		description:
			'In place of an order, a model equipped with this item may select a single piece of terrain within 1" and climb up it, ignoring vertical distance, ending their movement within 1" of the edge of any platform on the structure.'
	},
	{
		name: 'Runic Wards',
		cost: 4,
		restriction: 'Wizard or Veteran only',
		description:
			'A model equipped with this item gains the Armour (1) special rule. This item may only be given to Wizards or models that have access to the Veteran upgrades. Contrary to the standard Armour (X) rules, this upgrade replaces any alternative armour rules the model may already have.'
	},
	{
		name: 'Rangefinder',
		cost: 2,
		description:
			'Increase the model\'s Range by 6" when executing a Fire order with any weapon that does not have the One-Use special rule.'
	},
	{
		name: 'Eldritch Kibble',
		cost: 1,
		restriction: 'Dragoon/Familiar/Mount only',
		description:
			'This item may be given to a Dragoon or any model with a familiar or mount upgrade. A model equipped with this item increases their willpower by 1.'
	},
	{
		name: 'Secret Stash',
		cost: 1,
		restriction: 'Wizard only',
		description:
			'This item may only be given to a Wizard. At the start of a game, roll a D10, on a 6 or higher gain an additional Erudite charge in the first turn.'
	},
	{
		name: 'Erudite Trinket',
		cost: 1,
		description:
			'Once per game, the model equipped with this item may reroll a single failed check.'
	},
	{
		name: 'Runic Breastplate',
		cost: 1,
		restriction: '50mm base or smaller',
		description:
			'This item may only be given to a model with a 50mm base or smaller. A model equipped with this item may increase their defence skill by 1. This improvement is in effect until the model fails a defence check, at which point the improvement is lost for the rest of the game.'
	},
	{
		name: 'Shiny Satchel',
		cost: 1,
		restriction: '50mm base or smaller',
		description:
			'This item may only be given to a model with a 50mm base or smaller. A model equipped with this item may carry an additional Erudite deposit.'
	},
	{
		name: 'Smoke Bombs',
		cost: 1,
		description:
			'Once per game, when a model equipped with this item is targeted by a Fire order, they may gain the benefits of light cover, even if not in cover. This does not count as a surge.'
	},
	{
		name: 'Orb',
		cost: 1,
		description:
			"Once per game, this item may be used to improve the die used for an Unbind order by one. The College's Wizard does not need to be equipped with this item for it to be used."
	},
	{
		name: 'Unstable Ranged Foci',
		cost: 7,
		description:
			'When this item is purchased for a model, select a single ranged weapon they are equipped with that does not have the One-Use special rule. The chosen weapon gains the Unstable special rule.'
	},
	{
		name: "Bently Bartle's Book of Balistics",
		cost: 7,
		description:
			"A model equipped with this item gains the Take aim special rule listed in the Slogger's profile."
	},
	{
		name: 'Sock Full of Exceptionally Sharp Rocks',
		cost: 1,
		description:
			'When a model equipped with this item is target of a Fight order, execute a free Fight order replacing their melee skill with 1D6 targeting the attacker. This order does not count as a surge.'
	},
	{
		name: 'Exploding Underpants',
		cost: 2,
		description:
			'When a model equipped with this item is removed from the board as a result of an enemy Fight order, execute a Fire order using 8D6 targeting the model that removed them. If this item is used during a game, then the model that used it automatically gains an injury after the battle instead of rolling an injury check.'
	},
	{
		name: 'Runic Blind-Bag',
		cost: 7,
		description:
			'When this item is purchased for a model, select a single melee weapon they are equipped with that does not have the One-Use special rule. The chosen weapon gains the Unstable special rule.'
	},
	{
		name: 'Munitions Stowage',
		cost: 1,
		restriction: 'Cargo Hold models only',
		description:
			'This item may only be given to a model with the Cargo Hold special rule. Once per game while within 3" of this model, any model that makes use of an item with the One-Use property does not expend the item following its use.'
	},
	{
		name: "Wizard's Grog",
		cost: 2,
		description: "Change the equipped model's passive surge to Charge."
	},
	{
		name: 'Entrenching Shovel',
		cost: 2,
		description: 'A model equipped with this item changes their passive surge to Hunker down.'
	},
	{
		name: 'Triage Kit',
		cost: 2,
		description:
			'A model equipped with this item may use both of its orders to increase its willpower by 1, this may not take the model above its starting willpower, this item is removed once used.'
	},
	{
		name: 'Superior Pointed Hat',
		cost: 1,
		description: 'A model equipped with this item increases their willpower by 1.'
	}
];
