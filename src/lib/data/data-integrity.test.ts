import { describe, expect, it } from 'vitest';
import { FACTIONS } from './factions';
import { MERCHANT_ITEMS, CORE_SPELLS } from './spells-and-items';
import { UNIVERSAL_MODELS } from './universal-models';
import type { FactionId, ModelTemplate } from '../types/game.types';

// The full set of valid faction IDs as defined in the type system.
const KNOWN_FACTION_IDS: FactionId[] = [
	'abjurers',
	'diviners',
	'druids',
	'evokers',
	'geomancers',
	'golem-corps',
	'mechanists',
	'necromancers',
	'paladins',
	'stormcallers',
	'hedge-wizards'
];

// The only restriction strings handled by checkMerchantItemRestriction.
const KNOWN_RESTRICTIONS = new Set([
	'Wizard only',
	'Wizard or Veteran only',
	'Dragoon/Familiar/Mount only',
	'Cargo Hold models only',
	'50mm base or smaller'
]);

// Helper: collect all equipment names for a model template.
const equipmentNames = (model: ModelTemplate): Set<string> =>
	new Set(model.baseEquipment.map((e) => e.name));

// Helper: all model templates across both data sets.
const allModelTemplates = (): ModelTemplate[] => [
	...UNIVERSAL_MODELS,
	...FACTIONS.map((f) => f.uniqueModel)
];

// --- FACTIONS ---

describe('FACTIONS', () => {
	it('contains exactly 11 factions', () => {
		expect(FACTIONS).toHaveLength(11);
	});

	it('contains every expected faction ID', () => {
		const ids = FACTIONS.map((f) => f.id);
		for (const expected of KNOWN_FACTION_IDS) {
			expect(ids).toContain(expected);
		}
	});

	it('has no duplicate faction IDs', () => {
		const ids = FACTIONS.map((f) => f.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('has no duplicate faction names', () => {
		const names = FACTIONS.map((f) => f.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('has non-empty name and symbol on every faction', () => {
		for (const faction of FACTIONS) {
			expect(faction.name.length, `${faction.id} name is empty`).toBeGreaterThan(0);
			expect(faction.symbol.length, `${faction.id} symbol is empty`).toBeGreaterThan(0);
		}
	});

	it('has at least one empowered bonus per faction', () => {
		for (const faction of FACTIONS) {
			expect(faction.empowered.length, `${faction.id} has no empowered bonuses`).toBeGreaterThan(0);
		}
	});

	it('has non-negative faction spell costs', () => {
		for (const faction of FACTIONS) {
			expect(
				faction.factionSpell.cost,
				`${faction.id} faction spell has negative cost`
			).toBeGreaterThanOrEqual(0);
		}
	});

	it('has non-empty faction spell names and descriptions', () => {
		for (const faction of FACTIONS) {
			expect(
				faction.factionSpell.name.length,
				`${faction.id} faction spell name is empty`
			).toBeGreaterThan(0);
			expect(
				faction.factionSpell.description.length,
				`${faction.id} faction spell description is empty`
			).toBeGreaterThan(0);
		}
	});

	it('marks every unique model with isUnique: true', () => {
		for (const faction of FACTIONS) {
			expect(
				faction.uniqueModel.isUnique,
				`${faction.id} unique model (${faction.uniqueModel.id}) missing isUnique flag`
			).toBe(true);
		}
	});

	it('has no duplicate unique model IDs across factions', () => {
		const ids = FACTIONS.map((f) => f.uniqueModel.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('has positive base costs on all unique models', () => {
		for (const faction of FACTIONS) {
			const model = faction.uniqueModel;
			expect(
				model.baseCost,
				`${faction.id} unique model ${model.id} has non-positive cost`
			).toBeGreaterThan(0);
		}
	});

	it('has non-negative upgrade costs on all unique model upgrades', () => {
		for (const faction of FACTIONS) {
			const model = faction.uniqueModel;
			for (const upgrade of model.upgrades) {
				expect(
					upgrade.cost,
					`${faction.id} unique model upgrade "${upgrade.name}" has negative cost`
				).toBeGreaterThanOrEqual(0);
			}
		}
	});

	it('has no duplicate upgrade names within any unique model', () => {
		for (const faction of FACTIONS) {
			const model = faction.uniqueModel;
			const names = model.upgrades.map((u) => u.name);
			expect(new Set(names).size, `${faction.id} unique model has duplicate upgrade names`).toBe(
				names.length
			);
		}
	});

	it('has upgrade replaces fields that reference actual base equipment names', () => {
		for (const faction of FACTIONS) {
			const model = faction.uniqueModel;
			const equipment = equipmentNames(model);
			for (const upgrade of model.upgrades) {
				if (upgrade.replaces !== undefined) {
					expect(
						equipment.has(upgrade.replaces),
						`${faction.id} upgrade "${upgrade.name}" references unknown equipment "${upgrade.replaces}"`
					).toBe(true);
				}
			}
		}
	});
});

// --- UNIVERSAL_MODELS ---

describe('UNIVERSAL_MODELS', () => {
	it('includes the wizard model', () => {
		const ids = UNIVERSAL_MODELS.map((m) => m.id);
		expect(ids).toContain('wizard');
	});

	it('has no duplicate model IDs', () => {
		const ids = UNIVERSAL_MODELS.map((m) => m.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('has no duplicate model names', () => {
		const names = UNIVERSAL_MODELS.map((m) => m.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('has positive base costs on all models', () => {
		for (const model of UNIVERSAL_MODELS) {
			expect(model.baseCost, `${model.id} has non-positive base cost`).toBeGreaterThan(0);
		}
	});

	it('has non-negative upgrade costs on all models', () => {
		for (const model of UNIVERSAL_MODELS) {
			for (const upgrade of model.upgrades) {
				expect(
					upgrade.cost,
					`${model.id} upgrade "${upgrade.name}" has negative cost`
				).toBeGreaterThanOrEqual(0);
			}
		}
	});

	it('has no duplicate upgrade names within any model', () => {
		for (const model of UNIVERSAL_MODELS) {
			const names = model.upgrades.map((u) => u.name);
			expect(new Set(names).size, `${model.id} has duplicate upgrade names`).toBe(names.length);
		}
	});

	it('has upgrade replaces fields that reference actual base equipment names', () => {
		for (const model of UNIVERSAL_MODELS) {
			const equipment = equipmentNames(model);
			for (const upgrade of model.upgrades) {
				if (upgrade.replaces !== undefined) {
					expect(
						equipment.has(upgrade.replaces),
						`${model.id} upgrade "${upgrade.name}" references unknown equipment "${upgrade.replaces}"`
					).toBe(true);
				}
			}
		}
	});

	it('has at least one ranged and one melee weapon in base equipment', () => {
		for (const model of UNIVERSAL_MODELS) {
			const types = model.baseEquipment.map((e) => e.type);
			expect(types, `${model.id} missing ranged base equipment`).toContain('ranged');
			expect(types, `${model.id} missing melee base equipment`).toContain('melee');
		}
	});
});

// --- Cross-data: no ID collisions ---

describe('model ID uniqueness across data sets', () => {
	it('unique model IDs do not clash with universal model IDs', () => {
		const universalIds = new Set(UNIVERSAL_MODELS.map((m) => m.id));
		for (const faction of FACTIONS) {
			expect(
				universalIds.has(faction.uniqueModel.id),
				`${faction.id} unique model ID "${faction.uniqueModel.id}" clashes with a universal model`
			).toBe(false);
		}
	});

	it('all model IDs across the full data set are unique', () => {
		const allIds = allModelTemplates().map((m) => m.id);
		expect(new Set(allIds).size).toBe(allIds.length);
	});
});

// --- CORE_SPELLS ---

describe('CORE_SPELLS', () => {
	it('has no duplicate spell names', () => {
		const names = CORE_SPELLS.map((s) => s.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('has non-negative costs on all spells', () => {
		for (const spell of CORE_SPELLS) {
			expect(spell.cost, `spell "${spell.name}" has negative cost`).toBeGreaterThanOrEqual(0);
		}
	});

	it('has non-empty names and descriptions on all spells', () => {
		for (const spell of CORE_SPELLS) {
			expect(spell.name.length, `a spell has an empty name`).toBeGreaterThan(0);
			expect(
				spell.description.length,
				`spell "${spell.name}" has an empty description`
			).toBeGreaterThan(0);
		}
	});
});

// --- MERCHANT_ITEMS ---

describe('MERCHANT_ITEMS', () => {
	it('has no duplicate item names', () => {
		const names = MERCHANT_ITEMS.map((i) => i.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('has positive costs on all items', () => {
		for (const item of MERCHANT_ITEMS) {
			expect(item.cost, `item "${item.name}" has non-positive cost`).toBeGreaterThan(0);
		}
	});

	it('has non-empty descriptions on all items', () => {
		for (const item of MERCHANT_ITEMS) {
			expect(
				item.description.length,
				`item "${item.name}" has an empty description`
			).toBeGreaterThan(0);
		}
	});

	it('uses only known restriction strings', () => {
		for (const item of MERCHANT_ITEMS) {
			if (item.restriction !== undefined) {
				expect(
					KNOWN_RESTRICTIONS.has(item.restriction),
					`item "${item.name}" has unrecognised restriction "${item.restriction}"`
				).toBe(true);
			}
		}
	});
});
