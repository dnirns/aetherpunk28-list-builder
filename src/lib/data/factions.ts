import type { Faction } from '$lib/types/game.types';

export const FACTIONS: Faction[] = [
	// --- Abjurers (Tortoise) ---
	{
		id: 'abjurers',
		name: 'Abjurers',
		symbol: 'Tortoise',
		empowered: [
			{ stat: 'me', value: '+1' },
			{ stat: 'wp', value: '+1' }
		],
		factionSpell: {
			name: 'Repulsion',
			cost: 1,
			description: 'Move target model 12" in any direction.'
		},
		uniqueModel: {
			id: 'bulwark',
			name: 'Bulwark',
			baseCost: 10,
			baseSize: '32-40mm',
			isUnique: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{ name: 'Ranged Cantrip', type: 'ranged' },
				{ name: 'Cudgel', type: 'melee' }
			],
			specialRules: [{ name: 'Moving Wall' }, { name: 'Interlocking Aegis' }],
			upgrades: [
				{
					name: 'Service Pistol',
					cost: 1,
					replaces: 'Ranged Cantrip',
					weapon: { name: 'Service Pistol', type: 'ranged', range: '12"' }
				},
				{
					name: 'Repeater Pistol',
					cost: 2,
					replaces: 'Ranged Cantrip',
					weapon: { name: 'Repeater Pistol', type: 'ranged', range: '12"' }
				},
				{
					name: 'Rune Hammer',
					cost: 3,
					replaces: 'Cudgel',
					weapon: { name: 'Rune Hammer', type: 'melee', dice: { count: 5, die: 'D8' } }
				},
				{ name: 'Familiar', cost: 1, description: 'Familiar.' },
				{
					name: 'Breaching Charms',
					cost: 2,
					specialRules: ['Critical Hits'],
					description: 'Critical Hits for Fight orders.'
				},
				{
					name: 'Studded Shield',
					cost: 3,
					specialRules: ['Impact 1'],
					description: 'Impact 1.'
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
		}
	},

	// --- Diviners (Butterfly) ---
	{
		id: 'diviners',
		name: 'Diviners',
		symbol: 'Butterfly',
		empowered: [
			{ stat: 'ra', value: '+1' },
			{ stat: 'wp', value: '+1' }
		],
		factionSpell: {
			name: 'Prescient Strike',
			cost: 0,
			description: 'Faction spell not listed separately; see Seer Prescience rule.'
		},
		uniqueModel: {
			id: 'seer',
			name: 'Seer',
			baseCost: 9,
			baseSize: '32-40mm',
			isUnique: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{ name: 'Long Rifle', type: 'ranged', range: '24"' },
				{ name: 'Combat Knife', type: 'melee' }
			],
			specialRules: [
				{
					name: 'Prescience',
					description: 'Surge resolved before attacker rolls.'
				}
			],
			upgrades: [
				{
					name: 'Tommyknocker',
					cost: 1,
					specialRules: ['Critical Hits'],
					description: 'Critical Hits.'
				},
				{
					name: 'Arquebus',
					cost: 3,
					replaces: 'Long Rifle',
					weapon: {
						name: 'Arquebus',
						type: 'ranged',
						dice: { count: 2, die: 'D10' },
						range: '24"'
					}
				},
				{
					name: '25mm Probability Breaker',
					cost: 3,
					replaces: 'Long Rifle',
					weapon: {
						name: '25mm Probability Breaker',
						type: 'ranged',
						dice: { count: 2, die: 'D10' },
						range: '24"',
						specialRules: ['Critical Hits']
					}
				},
				{
					name: 'Bayonet',
					cost: 1,
					replaces: 'Combat Knife',
					weapon: { name: 'Bayonet', type: 'melee', dice: { count: 2, die: 'D6' } }
				},
				{ name: 'Familiar', cost: 1, description: 'Familiar.' },
				{
					name: 'Piercing Round',
					cost: 1,
					description: '-2 Df on target, One-Use.',
					specialRules: ['One-Use']
				},
				{ name: 'Dazzle Jar', cost: 1, description: 'Dazzle Jar.' }
			]
		}
	},

	// --- Druids (Owl) ---
	{
		id: 'druids',
		name: 'Druids',
		symbol: 'Owl',
		empowered: [
			{ stat: 'mv', value: '+2"' },
			{ stat: 'me', value: '+1' }
		],
		factionSpell: {
			name: 'Regenerate',
			cost: 2,
			description: 'Permanently increase target Wp by 1 (up to starting Wp).'
		},
		uniqueModel: {
			id: 'feral-familiar',
			name: 'Feral Familiar',
			baseCost: 13,
			baseSize: '40-50mm',
			isUnique: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{ name: 'Fierce Glare', type: 'ranged' },
				{ name: 'Natural Weapons', type: 'melee' }
			],
			specialRules: [
				{
					name: 'Uncaged Fury',
					description: 'Must always charge closest model.'
				}
			],
			upgrades: [
				{
					name: 'Unnatural Weapons',
					cost: 3,
					replaces: 'Natural Weapons',
					weapon: { name: 'Unnatural Weapons', type: 'melee' }
				},
				{
					name: 'Fearsome Impact',
					cost: 3,
					specialRules: ['Impact 1'],
					description: 'Impact 1.'
				},
				{ name: 'Alpha Beast', cost: 1, description: 'Alpha Beast.' },
				{ name: 'Lithe Build', cost: 2, description: 'Lithe Build.' }
			]
		}
	},

	// --- Evokers (Rabbit) ---
	{
		id: 'evokers',
		name: 'Evokers',
		symbol: 'Rabbit',
		empowered: [
			{ stat: 'ra', value: '+1' },
			{ stat: 'me', value: '+1' }
		],
		factionSpell: {
			name: 'Cinder Shot',
			cost: 1,
			description:
				'Target friendly model gets 12" range, 3 dice for Fire order. Target uses Wp to defend.'
		},
		uniqueModel: {
			id: 'firebrand',
			name: 'Firebrand',
			baseCost: 16,
			baseSize: '32-40mm',
			isUnique: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{ name: 'Brace of Pistols', type: 'ranged' },
				{ name: 'Twin Blades', type: 'melee' }
			],
			specialRules: [
				{ name: 'Critical Hits' },
				{ name: 'Take Aim', description: 'If no Move orders executed, +1 Ra.' },
				{
					name: 'Barrage',
					description: 'Two Fire orders as one, Ra -1.'
				}
			],
			upgrades: [
				{
					name: 'Sawn-Off Trench Sweepers',
					cost: 1,
					replaces: 'Brace of Pistols',
					weapon: { name: 'Sawn-Off Trench Sweepers', type: 'ranged' }
				},
				{
					name: 'Trench Club',
					cost: 2,
					replaces: 'Twin Blades',
					weapon: { name: 'Trench Club', type: 'melee' }
				},
				{
					name: 'Brazier Hammers',
					cost: 2,
					replaces: 'Twin Blades',
					weapon: { name: 'Brazier Hammers', type: 'melee' }
				},
				{ name: 'Familiar', cost: 1, description: 'Familiar.' },
				{ name: 'Exploding Hat', cost: 3, description: 'Exploding Hat.' }
			]
		}
	},

	// --- Geomancers (Snail) ---
	{
		id: 'geomancers',
		name: 'Geomancers',
		symbol: 'Snail',
		empowered: [
			{ stat: 'mv', value: '+2"' },
			{ stat: 'df', value: '+1' }
		],
		factionSpell: {
			name: 'Petrify',
			cost: 1,
			description: 'Reduce enemy movement by 4" (resisted by Wp).'
		},
		uniqueModel: {
			id: 'bastion',
			name: 'Bastion',
			baseCost: 24,
			baseSize: '80-100mm',
			isUnique: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{ name: 'Bombard', type: 'ranged' },
				{ name: 'Glacial Movement', type: 'melee' }
			],
			specialRules: [
				{ name: 'Armour', params: { value: 2 } },
				{ name: 'Artillery' },
				{ name: 'Dug-In' },
				{ name: 'Hulking Behemoth' },
				{ name: 'Cargo Hold' },
				{ name: 'Unstoppable' }
			],
			upgrades: [
				{
					name: 'Tinderbox',
					cost: 0,
					replaces: 'Bombard',
					weapon: { name: 'Tinderbox', type: 'ranged', specialRules: ['Flaming'] }
				},
				{
					name: 'Obliteration Engine',
					cost: 10,
					replaces: 'Bombard',
					weapon: { name: 'Obliteration Engine', type: 'ranged' }
				},
				{
					name: 'Dispersion Runes',
					cost: 1,
					specialRules: ['Blast 3"'],
					description: 'Blast 3".'
				},
				{ name: 'Ablative Plating', cost: 1, description: 'Ablative Plating.' },
				{ name: 'Warded Armour', cost: 1, description: 'Warded Armour.' },
				{ name: 'Discouragement Bomb', cost: 2, description: 'Discouragement Bomb.' },
				{
					name: 'Crushing Bulk',
					cost: 18,
					specialRules: ['Impact 6'],
					description: 'Impact 6.'
				},
				{
					name: 'Gunnery Decks',
					cost: 5,
					specialRules: ['Troop Transport 10'],
					description: 'Troop Transport 10.'
				}
			]
		}
	},

	// --- Golem Corps (Crab) ---
	{
		id: 'golem-corps',
		name: 'Golem Corps',
		symbol: 'Crab',
		empowered: [
			{ stat: 'mv', value: '+2"' },
			{ stat: 'wp', value: '+1' }
		],
		factionSpell: {
			name: 'Construct Golem',
			cost: 6,
			description: 'Summon a Golem within 3".'
		},
		uniqueModel: {
			id: 'golem',
			name: 'Golem',
			baseCost: 12,
			baseSize: '40-50mm',
			isUnique: true,
			isSummonable: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{
					name: 'Landmine Cluster',
					type: 'ranged',
					specialRules: ['Blast 3"', 'One-Use']
				},
				{ name: 'Brutal Fists', type: 'melee' }
			],
			specialRules: [{ name: 'Hulking Behemoth' }],
			upgrades: [
				{ name: 'Union Membership', cost: 1, description: 'Wp +1.' },
				{
					name: 'Bigger Collection',
					cost: 1,
					description: '+1 Use of Landmine.'
				}
			]
		}
	},

	// --- Mechanists (Toad) ---
	{
		id: 'mechanists',
		name: 'Mechanists',
		symbol: 'Toad',
		empowered: [
			{ stat: 'ra', value: '+1' },
			{ stat: 'df', value: '+1' }
		],
		factionSpell: {
			name: 'Enhance',
			cost: 1,
			description: 'Target friendly model increases Ra or Me by 2.'
		},
		uniqueModel: {
			id: 'steam-titan',
			name: 'Steam Titan',
			baseCost: 21,
			baseSize: '60-80mm',
			isUnique: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{ name: 'Splinter Gun', type: 'ranged' },
				{ name: 'Mechanical Fists', type: 'melee' }
			],
			specialRules: [
				{ name: 'Armour', params: { value: 1 } },
				{ name: 'Hulking Behemoth' },
				{ name: 'Boiler Explosion' },
				{ name: 'Defensive Protocols' }
			],
			upgrades: [
				{
					name: 'Tinderbox',
					cost: 4,
					replaces: 'Splinter Gun',
					weapon: { name: 'Tinderbox', type: 'ranged', specialRules: ['Flaming'] }
				},
				{
					name: 'Clattergun',
					cost: 6,
					replaces: 'Splinter Gun',
					weapon: { name: 'Clattergun', type: 'ranged' }
				},
				{
					name: 'Rotary Cannon',
					cost: 6,
					replaces: 'Splinter Gun',
					weapon: { name: 'Rotary Cannon', type: 'ranged' }
				},
				{
					name: 'Titanic Blade',
					cost: 2,
					replaces: 'Mechanical Fists',
					weapon: { name: 'Titanic Blade', type: 'melee' }
				},
				{
					name: 'Excavation Drill',
					cost: 4,
					replaces: 'Mechanical Fists',
					weapon: { name: 'Excavation Drill', type: 'melee' }
				},
				{
					name: 'Dispersion Runes',
					cost: 1,
					specialRules: ['Blast 3"'],
					description: 'Blast 3".'
				},
				{ name: 'Ablative Plating', cost: 1, description: 'Ablative Plating.' }
			]
		}
	},

	// --- Necromancers (Spider) ---
	{
		id: 'necromancers',
		name: 'Necromancers',
		symbol: 'Spider',
		empowered: [
			{ stat: 'me', value: '+1' },
			{ stat: 'df', value: '+1' }
		],
		factionSpell: {
			name: 'Raise Undead',
			cost: 2,
			description: 'Summon a Zombie within 3".'
		},
		uniqueModel: {
			id: 'zombie',
			name: 'Zombie',
			baseCost: 4,
			baseSize: '32-40mm',
			isUnique: true,
			isSummonable: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{ name: 'Discomforting Groan', type: 'ranged' },
				{ name: 'Gnashing Teeth', type: 'melee' }
			],
			specialRules: [{ name: 'Mindless Hoard' }],
			upgrades: []
		}
	},

	// --- Paladins (Frog) ---
	{
		id: 'paladins',
		name: 'Paladins',
		symbol: 'Frog',
		empowered: [
			{ stat: 'df', value: '+1' },
			{ stat: 'wp', value: '+1' }
		],
		factionSpell: {
			name: 'Smite',
			cost: 1,
			description: 'Friendly models within 12" apply Critical Hits to melee weapons.'
		},
		uniqueModel: {
			id: 'cleaver',
			name: 'Cleaver',
			baseCost: 15,
			baseSize: '32-40mm',
			isUnique: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{ name: 'Aggressive Shouting', type: 'ranged' },
				{ name: 'Great Weapon', type: 'melee' }
			],
			specialRules: [{ name: 'Have at Thee!' }],
			upgrades: [
				{
					name: 'Enchanted Blade',
					cost: 4,
					replaces: 'Great Weapon',
					weapon: { name: 'Enchanted Blade', type: 'melee' }
				},
				{
					name: 'Ancient Heirloom',
					cost: 7,
					replaces: 'Great Weapon',
					weapon: { name: 'Ancient Heirloom', type: 'melee' }
				},
				{ name: 'Shield', cost: 1, description: 'Shield.' },
				{ name: 'Familiar', cost: 1, description: 'Familiar.' },
				{
					name: 'Mount',
					cost: 2,
					statModifier: { mv: '10"' },
					description: 'Base becomes 40-50mm.'
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
		}
	},

	// --- Stormcallers (Raven) ---
	{
		id: 'stormcallers',
		name: 'Stormcallers',
		symbol: 'Raven',
		empowered: [
			{ stat: 'mv', value: '+2"' },
			{ stat: 'ra', value: '+1' }
		],
		factionSpell: {
			name: 'Conjur Storm',
			cost: 3,
			description: '3-dice attack with Blast 3" within 36".'
		},
		uniqueModel: {
			id: 'dynamo',
			name: 'Dynamo',
			baseCost: 15,
			baseSize: '32-40mm',
			isUnique: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{ name: 'Thunder Carbine', type: 'ranged' },
				{ name: 'Lightning Runes', type: 'melee' }
			],
			specialRules: [{ name: 'Kinetic Transference' }],
			upgrades: [
				{
					name: 'Squall Cannon',
					cost: 4,
					replaces: 'Thunder Carbine',
					weapon: { name: 'Squall Cannon', type: 'ranged' }
				},
				{
					name: 'Nimbus Repeating Rifle',
					cost: 4,
					replaces: 'Thunder Carbine',
					weapon: { name: 'Nimbus Repeating Rifle', type: 'ranged' }
				},
				{ name: 'Conduction Pylons', cost: 2, description: 'Conduction Pylons.' },
				{
					name: 'Storm Hammer',
					cost: 4,
					replaces: 'Lightning Runes',
					weapon: { name: 'Storm Hammer', type: 'melee' }
				},
				{ name: 'Familiar', cost: 1, description: 'Familiar.' },
				{ name: 'Static Barrier', cost: 3, description: 'Static Barrier.' },
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
		}
	},

	// --- Hedge Wizards (Hedgehog) ---
	{
		id: 'hedge-wizards',
		name: 'Hedge Wizards',
		symbol: 'Hedgehog',
		empowered: [{ stat: 'lightCover', value: 'permanent' }],
		factionSpell: {
			name: 'Tactical Translocation',
			cost: 2,
			description: 'Summon a Swain within 3".'
		},
		uniqueModel: {
			id: 'swain',
			name: 'Swain',
			baseCost: 4,
			baseSize: '32-40mm',
			isUnique: true,
			isSummonable: true,
			stats: {
				// TODO: stats not in docs, update manually
				mv: '-',
				ra: { count: 0, die: 0 },
				me: { count: 0, die: 0 },
				df: 0,
				wp: 0,
				range: '-',
				passiveSurge: 'Hunker Down'
			},
			baseEquipment: [
				{ name: 'Antique Firearm', type: 'ranged' },
				{ name: 'Hand-Me-Down Knife', type: 'melee' }
			],
			specialRules: [],
			upgrades: [
				{ name: 'Familiar', cost: 1, description: 'Familiar.' },
				{ name: 'Marksmanship', cost: 2, description: 'Marksmanship.' },
				{ name: 'Martial Training', cost: 2, description: 'Martial Training.' },
				{ name: 'Heavy Coat', cost: 1, description: 'Heavy Coat.' },
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
		}
	}
];
