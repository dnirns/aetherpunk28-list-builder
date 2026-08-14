import type { ModelTemplate } from '$lib/types/game.types';

export const UNIVERSAL_MODELS: ModelTemplate[] = [
	// --- Wizard (5 Shillings) ---
	{
		id: 'wizard',
		name: 'Wizard',
		baseCost: 5,
		baseSize: '32-40mm',
		stats: {
			mv: '6"',
			ra: { count: 1, die: 'D6' },
			me: { count: 1, die: 'D6' },
			df: 'D8',
			wp: 'D12',
			range: '12"',
			passiveSurge: 'Unbind'
		},
		baseEquipment: [
			{ name: 'Ranged Cantrip', type: 'ranged', range: '12"' },
			{ name: 'Combat Knife', type: 'melee' }
		],
		specialRules: [
			{
				name: 'Paragon of the College',
				description: 'Increases base stats as if empowered at no additional cost permanently.'
			}
		],
		upgrades: [
			// Replace Ranged Cantrip
			{
				name: 'Service Pistol',
				cost: 1,
				replaces: 'Ranged Cantrip',
				weapon: { name: 'Service Pistol', type: 'ranged', range: '12"' }
			},
			{
				name: 'Rifle',
				cost: 2,
				replaces: 'Ranged Cantrip',
				weapon: { name: 'Rifle', type: 'ranged', range: '24"' }
			},
			// Replace Combat Knife
			{
				name: 'Duelling Sabre',
				cost: 1,
				replaces: 'Combat Knife',
				weapon: { name: 'Duelling Sabre', type: 'melee', dice: { count: 2, die: 'D6' } }
			},
			{
				name: 'Claymore',
				cost: 2,
				replaces: 'Combat Knife',
				weapon: { name: 'Claymore', type: 'melee', dice: { count: 3, die: 'D6' } }
			},
			// Additional Gear/Abilities
			{
				name: 'Mount',
				cost: 2,
				statModifier: { mv: '10"' },
				description: 'Base becomes 40-50mm.'
			},
			{
				name: 'Marksmanship',
				cost: 1,
				statModifier: { ra: { count: 1, die: 'D8' } },
				description: 'Ra D8.'
			},
			{
				name: 'Martial Training',
				cost: 1,
				statModifier: { me: { count: 1, die: 'D8' } },
				description: 'Me D8.'
			},
			{ name: 'Hard as Nails', cost: 1, statModifier: { df: 'D8' }, description: 'Df D8.' },
			{
				name: 'Senior Officer',
				cost: 3,
				specialRules: ['Commander'],
				description: 'Grants Commander rule.'
			},
			{
				name: 'Blue Flare',
				cost: 3,
				weapon: {
					name: 'Blue Flare',
					type: 'ranged',
					dice: { count: 10, die: 'D6' },
					range: '18"',
					specialRules: ['Blast 6"', 'Artillery Barrage', 'One-Use']
				}
			},
			{
				name: 'Amber Flare',
				cost: 4,
				weapon: {
					name: 'Amber Flare',
					type: 'ranged',
					dice: { count: 10, die: 'D6' },
					range: '18"',
					specialRules: ['Blast 6"', 'Flaming', 'Artillery Barrage', 'One-Use']
				}
			}
		]
	},

	// --- Slogger (7 Shillings) ---
	{
		id: 'slogger',
		name: 'Slogger',
		baseCost: 7,
		baseSize: '32-40mm',
		stats: {
			mv: '6"',
			ra: { count: 1, die: 'D8' },
			me: { count: 1, die: 'D6' },
			df: 'D8',
			wp: 'D6',
			range: '24"',
			passiveSurge: 'Hunker Down'
		},
		baseEquipment: [
			{ name: 'Rifle', type: 'ranged', range: '24"' },
			{ name: 'Combat Knife', type: 'melee' }
		],
		specialRules: [{ name: 'Take Aim', description: 'If no Move orders executed, +1 Ra.' }],
		upgrades: [
			// Replace Rifle
			{
				name: 'Carbine',
				cost: 4,
				replaces: 'Rifle',
				weapon: { name: 'Carbine', type: 'ranged', dice: { count: 2, die: 'D8' }, range: '24"' }
			},
			{
				name: 'Trench Sweeper',
				cost: 4,
				replaces: 'Rifle',
				weapon: {
					name: 'Trench Sweeper',
					type: 'ranged',
					dice: { count: 4, die: 'D8' },
					range: '12"'
				}
			},
			{
				name: 'Pyrocaster',
				cost: 4,
				replaces: 'Rifle',
				weapon: {
					name: 'Pyrocaster',
					type: 'ranged',
					dice: { count: 2, die: 'D8' },
					range: '12"',
					specialRules: ['Flaming']
				}
			},
			{
				name: 'Wizzbanger',
				cost: 5,
				replaces: 'Rifle',
				weapon: {
					name: 'Wizzbanger',
					type: 'ranged',
					dice: { count: 4, die: 'D8' },
					range: '12"',
					specialRules: ['Blast 3"']
				}
			},
			// Replace Combat Knife
			{
				name: 'Bayonet',
				cost: 1,
				replaces: 'Combat Knife',
				weapon: { name: 'Bayonet', type: 'melee', dice: { count: 2, die: 'D6' } }
			},
			// Additional Gear
			{ name: 'Familiar', cost: 1, statModifier: { wp: 'D8' }, description: 'Wp D8.' },
			{
				name: 'Grenade',
				cost: 1,
				weapon: {
					name: 'Grenade',
					type: 'ranged',
					dice: { count: 4, die: 'D8' },
					range: '6"',
					specialRules: ['One-Use']
				}
			},
			{
				name: 'Firebomb',
				cost: 1,
				weapon: {
					name: 'Firebomb',
					type: 'ranged',
					dice: { count: 2, die: 'D8' },
					range: '6"',
					specialRules: ['Flaming', 'One-Use']
				}
			},
			{
				name: 'Splinterbomb',
				cost: 1,
				weapon: {
					name: 'Splinterbomb',
					type: 'ranged',
					dice: { count: 4, die: 'D8' },
					range: '6"',
					specialRules: ['Blast 3"', 'One-Use']
				}
			}
		]
	},

	// --- Scrapper (7 Shillings) ---
	{
		id: 'scrapper',
		name: 'Scrapper',
		baseCost: 7,
		baseSize: '32-40mm',
		stats: {
			mv: '6"',
			ra: { count: 1, die: 'D6' },
			me: { count: 3, die: 'D8' },
			df: 'D8',
			wp: 'D10',
			range: '6"',
			passiveSurge: 'Fight'
		},
		baseEquipment: [
			{ name: 'Ranged Cantrip', type: 'ranged', range: '6"' },
			{ name: 'Trench Club', type: 'melee', dice: { count: 3, die: 'D8' } }
		],
		specialRules: [],
		upgrades: [
			// Replace Ranged Cantrip
			{
				name: 'Service Pistol',
				cost: 1,
				replaces: 'Ranged Cantrip',
				weapon: { name: 'Service Pistol', type: 'ranged', range: '12"' }
			},
			// Replace Trench Club
			{
				name: 'Feudal Blade',
				cost: 2,
				replaces: 'Trench Club',
				weapon: { name: 'Feudal Blade', type: 'melee', dice: { count: 4, die: 'D8' } }
			},
			{
				name: 'Rune Hammer',
				cost: 4,
				replaces: 'Trench Club',
				weapon: { name: 'Rune Hammer', type: 'melee', dice: { count: 5, die: 'D8' } }
			},
			// Additional Gear
			{ name: 'Familiar', cost: 1, statModifier: { wp: 'D10' }, description: 'Wp D10.' },
			{ name: 'Ballistic Shield', cost: 1, statModifier: { df: 'D10' }, description: 'Df D10.' },
			{
				name: 'Breaching Charms',
				cost: 2,
				specialRules: ['Critical Hits'],
				description: 'Critical Hits for Fight orders.'
			},
			{
				name: 'Grenade',
				cost: 1,
				weapon: {
					name: 'Grenade',
					type: 'ranged',
					dice: { count: 4, die: 'D8' },
					range: '6"',
					specialRules: ['One-Use']
				}
			},
			{
				name: 'Firebomb',
				cost: 1,
				weapon: {
					name: 'Firebomb',
					type: 'ranged',
					dice: { count: 2, die: 'D8' },
					range: '6"',
					specialRules: ['Flaming', 'One-Use']
				}
			},
			{
				name: 'Splinterbomb',
				cost: 1,
				weapon: {
					name: 'Splinterbomb',
					type: 'ranged',
					dice: { count: 4, die: 'D8' },
					range: '6"',
					specialRules: ['Blast 3"', 'One-Use']
				}
			}
		]
	},

	// --- Dragoon (15 Shillings) ---
	{
		id: 'dragoon',
		name: 'Dragoon',
		baseCost: 15,
		baseSize: '40-50mm',
		stats: {
			mv: '12"',
			ra: { count: 1, die: 'D10' },
			me: { count: 2, die: 'D6' },
			df: 'D10',
			wp: 'D10',
			range: '24"',
			passiveSurge: 'Move'
		},
		baseEquipment: [
			{
				name: 'Heavy Rifle',
				type: 'ranged',
				dice: { count: 1, die: 'D10' },
				specialRules: ['Critical Hits']
			},
			{ name: "Mount's Natural Weapons", type: 'melee', dice: { count: 2, die: 'D6' } }
		],
		specialRules: [
			{
				name: 'Deadeye',
				description: 'If no Move, hits reduce target Wp by 2 instead of 1.'
			}
		],
		upgrades: [
			// Replace Natural Weapons
			{
				name: 'Cavalry Sabre',
				cost: 2,
				replaces: "Mount's Natural Weapons",
				weapon: { name: 'Cavalry Sabre', type: 'melee', dice: { count: 2, die: 'D8' } }
			},
			{
				name: 'Vicious Natural Weapons',
				cost: 4,
				replaces: "Mount's Natural Weapons",
				weapon: {
					name: 'Vicious Natural Weapons',
					type: 'melee',
					dice: { count: 3, die: 'D8' }
				}
			},
			// Additional Gear
			{ name: 'Blinding Speed', cost: 3, statModifier: { mv: '18"' }, description: 'Mv 18".' },
			{
				name: 'Fearsome Impact',
				cost: 3,
				specialRules: ['Impact 1'],
				description: 'Impact 1.'
			},
			{ name: 'Sturdier Familiar', cost: 1, description: 'Wp +1.' },
			{ name: 'Wings', cost: 2, specialRules: ['Fly'], description: 'Fly.' },
			{
				name: 'Piercing Round',
				cost: 1,
				description: '-2 Df on target, One-Use.',
				specialRules: ['One-Use']
			},
			{
				name: 'Grenade',
				cost: 1,
				weapon: {
					name: 'Grenade',
					type: 'ranged',
					dice: { count: 4, die: 'D8' },
					range: '6"',
					specialRules: ['One-Use']
				}
			},
			{
				name: 'Firebomb',
				cost: 1,
				weapon: {
					name: 'Firebomb',
					type: 'ranged',
					dice: { count: 2, die: 'D8' },
					range: '6"',
					specialRules: ['Flaming', 'One-Use']
				}
			},
			{
				name: 'Splinterbomb',
				cost: 1,
				weapon: {
					name: 'Splinterbomb',
					type: 'ranged',
					dice: { count: 4, die: 'D8' },
					range: '6"',
					specialRules: ['Blast 3"', 'One-Use']
				}
			}
		]
	},

	// --- Arcane Engine (26 Shillings) ---
	{
		id: 'arcane-engine',
		name: 'Arcane Engine',
		baseCost: 26,
		baseSize: '80-100mm',
		stats: {
			mv: '8"',
			ra: { count: 3, die: 'D10' },
			me: { count: 0, die: 0 },
			df: 'D12',
			wp: 'D10',
			range: '24"',
			passiveSurge: 'Fire'
		},
		baseEquipment: [
			{ name: 'Wand Battery', type: 'ranged' },
			{ name: 'Slow Advance', type: 'melee' }
		],
		specialRules: [
			{ name: 'Armour', params: { value: 1 } },
			{ name: 'Hulking Behemoth' },
			{ name: 'Cargo Hold' }
		],
		upgrades: [
			// Replace Weapon
			{
				name: 'Imbued Stave',
				cost: 0,
				replaces: 'Wand Battery',
				weapon: {
					name: 'Imbued Stave',
					type: 'ranged',
					dice: { count: 2, die: 'D10' },
					range: '36"'
				}
			},
			{
				name: 'Erudite Conductor',
				cost: 3,
				replaces: 'Wand Battery',
				weapon: { name: 'Erudite Conductor', type: 'ranged', range: '36"' }
			},
			{
				name: 'Tinderbox',
				cost: 0,
				replaces: 'Wand Battery',
				weapon: {
					name: 'Tinderbox',
					type: 'ranged',
					dice: { count: 2, die: 'D10' },
					range: '18"',
					specialRules: ['Flaming']
				}
			},
			// Additional Gear
			{ name: 'Ablative Plating', cost: 1, description: 'Wp D12.' },
			{
				name: 'Bladed Plough',
				cost: 3,
				specialRules: ['Impact 1'],
				description: 'Impact 1.'
			},
			{
				name: 'Dispersion Runes',
				cost: 1,
				specialRules: ['Blast 3"'],
				description: 'Blast 3".'
			},
			{ name: 'Discouragement Bomb', cost: 2, description: 'Discouragement Bomb.' },
			{ name: 'Fireball Shells', cost: 2, description: 'Fireball Shells.' }
		]
	},

	// --- Field Gun (11 Shillings) ---
	{
		id: 'field-gun',
		name: 'Field Gun',
		baseCost: 11,
		baseSize: '50-60mm',
		stats: {
			mv: '0"',
			ra: { count: 3, die: 'D8' },
			me: { count: 0, die: 0 },
			df: 'D10',
			wp: 'D8',
			range: '24"',
			passiveSurge: 'Hunker Down'
		},
		baseEquipment: [
			{ name: 'Clattergun', type: 'ranged' },
			{ name: 'Ineffective Fists', type: 'melee' }
		],
		specialRules: [
			{ name: 'Artillery' },
			{ name: 'Dug-In' },
			{
				name: 'Emplacement',
				description: 'Deploy 6" outside deployment zone.'
			}
		],
		upgrades: [
			// Replace Clattergun
			{
				name: 'Caliburn 20lb Gun',
				cost: 3,
				replaces: 'Clattergun',
				weapon: { name: 'Caliburn 20lb Gun', type: 'ranged', range: '36"' }
			},
			{
				name: 'Mordred 20lb Gun',
				cost: 4,
				replaces: 'Clattergun',
				weapon: {
					name: 'Mordred 20lb Gun',
					type: 'ranged',
					range: '36"',
					specialRules: ['Blast 3"']
				}
			},
			// Additional Gear
			{ name: 'Draft Beast', cost: 2, statModifier: { mv: '4"' }, description: 'Mv 4".' },
			{ name: 'Veteran Crew', cost: 1, description: 'Wp D10.' },
			{ name: 'Alchemical Munitions', cost: 2, description: 'Alchemical Munitions.' },
			{ name: 'Thunderclapper Shells', cost: 2, description: 'Thunderclapper Shells.' },
			{ name: 'Fireball Shells', cost: 2, description: 'Fireball Shells.' }
		]
	},

	// --- Broomstick C.A.T.V. (15 Shillings) ---
	{
		id: 'broomstick-catv',
		name: 'Broomstick C.A.T.V.',
		baseCost: 15,
		baseSize: '80-100mm',
		stats: {
			mv: '10"',
			ra: { count: 0, die: 0 },
			me: { count: 0, die: 0 },
			df: 'D10',
			wp: 'D10',
			range: 'X',
			passiveSurge: 'Charge'
		},
		baseEquipment: [
			{ name: 'Loud Horn', type: 'ranged' },
			{ name: 'Freshly Inflated Tires', type: 'melee' }
		],
		specialRules: [
			{ name: 'Armour', params: { value: 1 } },
			{ name: 'Fly' },
			{ name: 'Hulking Behemoth' },
			{ name: 'Impact', params: { value: 1 } },
			{ name: 'Troop Transport', params: { value: 21 } },
			{ name: 'Cargo Hold' },
			{ name: 'Volatile Locomotion' }
		],
		upgrades: [
			{
				name: 'Light Clattergun',
				cost: 6,
				weapon: {
					name: 'Light Clattergun',
					type: 'ranged',
					dice: { count: 2, die: 'D8' },
					range: '18"'
				}
			},
			{
				name: 'Clattergun',
				cost: 12,
				weapon: {
					name: 'Clattergun',
					type: 'ranged',
					dice: { count: 3, die: 'D8' },
					range: '24"'
				}
			},
			{
				name: 'Experimental Engine',
				cost: 3,
				statModifier: { mv: '16"' },
				description: 'Mv 16".'
			},
			{
				name: 'Bladed Plough',
				cost: 3,
				specialRules: ['Impact 2'],
				description: 'Impact 2.'
			},
			{
				name: 'Heavy Carrier',
				cost: 5,
				description: 'Base 120-150mm, Troop Transport 42.'
			}
		]
	}
];
