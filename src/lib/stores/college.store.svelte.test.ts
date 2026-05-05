import { beforeEach, describe, expect, it } from 'vitest';
import type { SavedCollege } from '../types/game.types';
import { UNIVERSAL_MODELS } from '../data/universal-models';
import { collegeStore } from './college.store.svelte';
import { savedCollegesStore } from './saved-colleges.store.svelte';

const wizard = UNIVERSAL_MODELS.find((m) => m.id === 'wizard')!;
const slogger = UNIVERSAL_MODELS.find((m) => m.id === 'slogger')!;
const scrapper = UNIVERSAL_MODELS.find((m) => m.id === 'scrapper')!;

beforeEach(() => {
	localStorage.clear();
	savedCollegesStore.refresh();
	collegeStore.reset();
});

// --- setFaction ---

describe('setFaction', () => {
	it('updates factionId', () => {
		collegeStore.setFaction('druids');
		expect(collegeStore.factionId).toBe('druids');
	});
});

// --- setName ---

describe('setName', () => {
	it('updates name', () => {
		collegeStore.setName('Iron Guard');
		expect(collegeStore.name).toBe('Iron Guard');
	});
});

// --- setGameConfig ---

describe('setGameConfig', () => {
	it('replaces the entire game config', () => {
		collegeStore.setGameConfig({ pointsLimit: 75, isCampaign: true });
		expect(collegeStore.gameConfig).toEqual({ pointsLimit: 75, isCampaign: true });
	});
});

// --- setPointsLimit ---

describe('setPointsLimit', () => {
	it('updates only the points limit, preserving other config fields', () => {
		collegeStore.setGameConfig({ pointsLimit: 50, isCampaign: true });
		collegeStore.setPointsLimit(75);
		expect(collegeStore.gameConfig.pointsLimit).toBe(75);
		expect(collegeStore.gameConfig.isCampaign).toBe(true);
	});

	it('accepts null to remove the limit', () => {
		collegeStore.setPointsLimit(null);
		expect(collegeStore.gameConfig.pointsLimit).toBeNull();
	});
});

// --- addModel ---

describe('addModel', () => {
	it('adds a model and returns its id', () => {
		const id = collegeStore.addModel(wizard);
		expect(typeof id).toBe('string');
		expect(collegeStore.models).toHaveLength(1);
	});

	it('uses the template name for the first instance of a model', () => {
		collegeStore.addModel(slogger);
		expect(collegeStore.models[0].name).toBe('Slogger');
	});

	it('renames the first model to "X 1" and numbers the second "X 2" when a duplicate is added', () => {
		collegeStore.addModel(slogger);
		collegeStore.addModel(slogger);
		expect(collegeStore.models[0].name).toBe('Slogger 1');
		expect(collegeStore.models[1].name).toBe('Slogger 2');
	});

	it('continues numbering correctly for a third duplicate', () => {
		collegeStore.addModel(slogger);
		collegeStore.addModel(slogger);
		collegeStore.addModel(slogger);
		expect(collegeStore.models[2].name).toBe('Slogger 3');
	});

	it('does not apply numbering to the wizard model', () => {
		collegeStore.addModel(wizard);
		expect(collegeStore.models[0].name).toBe('Wizard');
	});

	it('uses a custom name when provided', () => {
		collegeStore.addModel(slogger, 'Old Bill');
		expect(collegeStore.models[0].name).toBe('Old Bill');
	});

	it('does not number models added with custom names', () => {
		collegeStore.addModel(slogger, 'Old Bill');
		collegeStore.addModel(slogger, 'Young Bill');
		expect(collegeStore.models[0].name).toBe('Old Bill');
		expect(collegeStore.models[1].name).toBe('Young Bill');
	});

	it('initialises the model with no upgrades or merchant item', () => {
		collegeStore.addModel(slogger);
		const model = collegeStore.models[0];
		expect(model.equippedUpgrades).toEqual([]);
		expect(model.merchantItem).toBeUndefined();
	});

	it('initialises totalCost equal to the template base cost', () => {
		collegeStore.addModel(slogger);
		expect(collegeStore.models[0].totalCost).toBe(slogger.baseCost);
	});
});

// --- removeModel ---

describe('removeModel', () => {
	it('removes the model with the given id', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.removeModel(id);
		expect(collegeStore.models).toHaveLength(0);
	});

	it('leaves other models untouched', () => {
		collegeStore.addModel(wizard);
		const id = collegeStore.addModel(slogger);
		collegeStore.removeModel(id);
		expect(collegeStore.models).toHaveLength(1);
		expect(collegeStore.models[0].template.id).toBe('wizard');
	});

	it('does nothing when the id does not exist', () => {
		collegeStore.addModel(slogger);
		collegeStore.removeModel('nonexistent');
		expect(collegeStore.models).toHaveLength(1);
	});
});

// --- equipUpgrade ---

describe('equipUpgrade', () => {
	// Slogger upgrades: Bayonet (replaces Combat Knife, cost 1), Carbine (replaces Rifle, cost 4),
	// Trench Sweeper (replaces Rifle, cost 4)
	const bayonet = slogger.upgrades.find((u) => u.name === 'Bayonet')!;
	const carbine = slogger.upgrades.find((u) => u.name === 'Carbine')!;
	const trenchSweeper = slogger.upgrades.find((u) => u.name === 'Trench Sweeper')!;

	it('adds an upgrade to the model', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.equipUpgrade(id, bayonet);
		expect(collegeStore.models[0].equippedUpgrades).toHaveLength(1);
		expect(collegeStore.models[0].equippedUpgrades[0].upgrade.name).toBe('Bayonet');
	});

	it('updates model totalCost after equipping', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.equipUpgrade(id, bayonet); // cost 1
		expect(collegeStore.models[0].totalCost).toBe(slogger.baseCost + 1);
	});

	it('does not equip the same upgrade twice', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.equipUpgrade(id, bayonet);
		collegeStore.equipUpgrade(id, bayonet);
		expect(collegeStore.models[0].equippedUpgrades).toHaveLength(1);
	});

	it('replaces an existing upgrade occupying the same slot', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.equipUpgrade(id, carbine); // replaces Rifle
		collegeStore.equipUpgrade(id, trenchSweeper); // also replaces Rifle
		const upgrades = collegeStore.models[0].equippedUpgrades;
		expect(upgrades).toHaveLength(1);
		expect(upgrades[0].upgrade.name).toBe('Trench Sweeper');
	});

	it('does nothing when the model id does not exist', () => {
		collegeStore.equipUpgrade('nonexistent', bayonet);
		expect(collegeStore.models).toHaveLength(0);
	});
});

// --- removeUpgrade ---

describe('removeUpgrade', () => {
	const bayonet = slogger.upgrades.find((u) => u.name === 'Bayonet')!;

	it('removes the upgrade by name', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.equipUpgrade(id, bayonet);
		collegeStore.removeUpgrade(id, 'Bayonet');
		expect(collegeStore.models[0].equippedUpgrades).toHaveLength(0);
	});

	it('recalculates model totalCost after removal', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.equipUpgrade(id, bayonet);
		collegeStore.removeUpgrade(id, 'Bayonet');
		expect(collegeStore.models[0].totalCost).toBe(slogger.baseCost);
	});

	it('does nothing when the model id does not exist', () => {
		collegeStore.removeUpgrade('nonexistent', 'Bayonet');
		expect(collegeStore.models).toHaveLength(0);
	});
});

// --- equipMerchantItem ---

describe('equipMerchantItem', () => {
	const item = { name: 'Runic Wards', cost: 4, description: 'Armour (1).' };

	it('sets the merchant item on the model', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.equipMerchantItem(id, item);
		expect(collegeStore.models[0].merchantItem).toEqual(item);
	});

	it('updates model totalCost', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.equipMerchantItem(id, item);
		expect(collegeStore.models[0].totalCost).toBe(slogger.baseCost + item.cost);
	});

	it('does nothing when the model id does not exist', () => {
		collegeStore.equipMerchantItem('nonexistent', item);
		expect(collegeStore.models).toHaveLength(0);
	});
});

// --- removeMerchantItem ---

describe('removeMerchantItem', () => {
	const item = { name: 'Runic Wards', cost: 4, description: 'Armour (1).' };

	it('clears the merchant item', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.equipMerchantItem(id, item);
		collegeStore.removeMerchantItem(id);
		expect(collegeStore.models[0].merchantItem).toBeUndefined();
	});

	it('restores the model cost to its pre-item value', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.equipMerchantItem(id, item);
		collegeStore.removeMerchantItem(id);
		expect(collegeStore.models[0].totalCost).toBe(slogger.baseCost);
	});

	it('does nothing when the model id does not exist', () => {
		collegeStore.removeMerchantItem('nonexistent');
		expect(collegeStore.models).toHaveLength(0);
	});
});

// --- renameModel ---

describe('renameModel', () => {
	it('updates the model name', () => {
		const id = collegeStore.addModel(slogger);
		collegeStore.renameModel(id, 'Big Karl');
		expect(collegeStore.models[0].name).toBe('Big Karl');
	});

	it('does nothing when the model id does not exist', () => {
		collegeStore.addModel(slogger);
		collegeStore.renameModel('nonexistent', 'Ghost');
		expect(collegeStore.models[0].name).toBe('Slogger');
	});
});

// --- totalCost (derived) ---

describe('totalCost', () => {
	it('is 0 when no models are added', () => {
		expect(collegeStore.totalCost).toBe(0);
	});

	it('equals the base cost after adding one model', () => {
		collegeStore.addModel(wizard); // 5 shillings
		expect(collegeStore.totalCost).toBe(5);
	});

	it('sums base costs across multiple models', () => {
		collegeStore.addModel(wizard); // 5
		collegeStore.addModel(slogger); // 7
		expect(collegeStore.totalCost).toBe(12);
	});

	it('includes equipped upgrade costs', () => {
		const id = collegeStore.addModel(slogger); // 7
		const bayonet = slogger.upgrades.find((u) => u.name === 'Bayonet')!; // cost 1
		collegeStore.equipUpgrade(id, bayonet);
		expect(collegeStore.totalCost).toBe(8);
	});

	it('decreases when a model is removed', () => {
		collegeStore.addModel(wizard); // 5
		const id = collegeStore.addModel(slogger); // 7
		collegeStore.removeModel(id);
		expect(collegeStore.totalCost).toBe(5);
	});
});

// --- eruditeCharges (derived) ---

describe('eruditeCharges', () => {
	it('accounts for unspent shillings when limit is 50 and nothing is spent', () => {
		// floor(0/10) + floor(50/2) = 0 + 25 = 25
		expect(collegeStore.eruditeCharges).toBe(25);
	});

	it('decreases as shillings are spent', () => {
		collegeStore.addModel(wizard); // 5 spent
		// floor(5/10) + floor(45/2) = 0 + 22 = 22
		expect(collegeStore.eruditeCharges).toBe(22);
	});

	it('is derived only from spending when points limit is null', () => {
		collegeStore.addModel(wizard); // 5 spent
		collegeStore.setPointsLimit(null);
		// floor(5/10) = 0
		expect(collegeStore.eruditeCharges).toBe(0);
	});

	it('updates when the points limit changes', () => {
		// floor(0/10) + floor(100/2) = 0 + 50 = 50
		collegeStore.setPointsLimit(100);
		expect(collegeStore.eruditeCharges).toBe(50);
	});
});

// --- validationErrors (derived) ---

describe('validationErrors', () => {
	it('reports a missing wizard when no models are added', () => {
		expect(collegeStore.validationErrors.some((e) => e.includes('exactly one Wizard'))).toBe(true);
	});

	it('has no wizard error after adding one wizard', () => {
		collegeStore.addModel(wizard);
		expect(collegeStore.validationErrors.some((e) => e.includes('exactly one Wizard'))).toBe(false);
	});

	it('reports an over-limit error when total cost exceeds the points limit', () => {
		collegeStore.setPointsLimit(1);
		collegeStore.addModel(wizard); // costs 5, over the limit of 1
		expect(collegeStore.validationErrors.some((e) => e.includes('exceeding'))).toBe(true);
	});

	it('clears the over-limit error when limit is removed', () => {
		collegeStore.setPointsLimit(1);
		collegeStore.addModel(wizard);
		collegeStore.setPointsLimit(null);
		expect(collegeStore.validationErrors.some((e) => e.includes('exceeding'))).toBe(false);
	});

	it('returns no errors for a valid college within the limit', () => {
		collegeStore.addModel(wizard); // 5 shillings, limit 50
		const errors = collegeStore.validationErrors.filter(
			(e) => e.includes('Wizard') || e.includes('exceeding')
		);
		expect(errors).toHaveLength(0);
	});
});

// --- reset ---

describe('reset', () => {
	it('clears all models', () => {
		collegeStore.addModel(wizard);
		collegeStore.reset();
		expect(collegeStore.models).toHaveLength(0);
	});

	it('resets name to an empty string', () => {
		collegeStore.setName('Iron Guard');
		collegeStore.reset();
		expect(collegeStore.name).toBe('');
	});

	it('resets faction to abjurers', () => {
		collegeStore.setFaction('druids');
		collegeStore.reset();
		expect(collegeStore.factionId).toBe('abjurers');
	});

	it('resets game config to default values', () => {
		collegeStore.setGameConfig({ pointsLimit: 75, isCampaign: true });
		collegeStore.reset();
		expect(collegeStore.gameConfig).toEqual({ pointsLimit: 50, isCampaign: false });
	});

	it('resets totalCost to 0', () => {
		collegeStore.addModel(wizard);
		collegeStore.reset();
		expect(collegeStore.totalCost).toBe(0);
	});
});

// --- loadFromSaved ---

describe('loadFromSaved', () => {
	const makeSaved = (overrides: Partial<SavedCollege> = {}): SavedCollege => ({
		id: 'saved-id',
		name: 'Restored College',
		factionId: 'paladins',
		models: [],
		totalCost: 0,
		eruditeCharges: 0,
		gameConfig: { pointsLimit: 75, isCampaign: true },
		savedAt: '2026-01-01T00:00:00.000Z',
		...overrides
	});

	it('restores name, faction, and game config', () => {
		collegeStore.loadFromSaved(makeSaved());
		expect(collegeStore.name).toBe('Restored College');
		expect(collegeStore.factionId).toBe('paladins');
		expect(collegeStore.gameConfig).toEqual({ pointsLimit: 75, isCampaign: true });
	});

	it('restores models from the saved college', () => {
		// Use a plain CollegeModel object — the store's live models are reactive proxies
		// that structuredClone (called inside loadFromSaved) cannot serialise.
		const plainModel = {
			id: 'wizard-1',
			template: wizard,
			name: 'Wizard',
			equippedUpgrades: [],
			merchantItem: undefined,
			totalCost: wizard.baseCost
		};
		collegeStore.loadFromSaved(makeSaved({ models: [plainModel] }));
		expect(collegeStore.models).toHaveLength(1);
		expect(collegeStore.models[0].template.id).toBe('wizard');
	});

	it('overwrites any current state', () => {
		collegeStore.setName('Old Name');
		collegeStore.addModel(scrapper);
		collegeStore.loadFromSaved(makeSaved({ name: 'New Name' }));
		expect(collegeStore.name).toBe('New Name');
		expect(collegeStore.models).toHaveLength(0);
	});
});

// --- save ---

describe('save', () => {
	it('adds the current college to savedCollegesStore', () => {
		collegeStore.setName('Iron Guard');
		collegeStore.setFaction('paladins');
		collegeStore.save();
		expect(savedCollegesStore.colleges).toHaveLength(1);
		expect(savedCollegesStore.colleges[0].name).toBe('Iron Guard');
		expect(savedCollegesStore.colleges[0].factionId).toBe('paladins');
	});

	it('updates the existing saved entry when saved again with the same college id', () => {
		collegeStore.setName('Iron Guard');
		collegeStore.save();
		collegeStore.setName('Steel Guard');
		collegeStore.save();
		expect(savedCollegesStore.colleges).toHaveLength(1);
		expect(savedCollegesStore.colleges[0].name).toBe('Steel Guard');
	});

	it('includes the current totalCost and eruditeCharges in the snapshot', () => {
		collegeStore.addModel(wizard); // 5 shillings spent
		collegeStore.save();
		const saved = savedCollegesStore.colleges[0];
		expect(saved.totalCost).toBe(5);
		expect(saved.eruditeCharges).toBe(22); // floor(5/10) + floor(45/2)
	});
});
