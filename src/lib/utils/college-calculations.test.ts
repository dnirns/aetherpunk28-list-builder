import { describe, expect, it } from 'vitest';
import { FACTIONS } from '../data/factions';
import { UNIVERSAL_MODELS } from '../data/universal-models';
import type {
	CampaignCollege,
	CampaignModel,
	College,
	CollegeModel,
	GameConfig,
	MerchantItem,
	ModelTemplate
} from '../types/game.types';
import {
	abilityUpgrades,
	calculateCollegeCost,
	calculateEruditeCharges,
	calculateModelCost,
	calculateUnderdogBonus,
	checkMerchantItemRestriction,
	effectiveEquipment,
	effectiveSpecialRules,
	effectiveStats,
	validateCampaignCollege,
	validateCollege
} from './college-calculations';

// --- Fixtures ---

const baseStats: ModelTemplate['stats'] = {
	mv: '6"',
	ra: { count: 1, die: 'D6' },
	me: { count: 1, die: 'D6' },
	df: 'D6',
	wp: 'D6',
	range: '12"',
	passiveSurge: 'Fight'
};

const makeTemplate = (overrides: Partial<ModelTemplate> = {}): ModelTemplate => ({
	id: 'test-model',
	name: 'Test Model',
	baseCost: 5,
	baseSize: '25mm',
	stats: baseStats,
	baseEquipment: [],
	specialRules: [],
	upgrades: [],
	...overrides
});

const makeModel = (overrides: Partial<CollegeModel> = {}): CollegeModel => ({
	id: 'model-1',
	template: makeTemplate(),
	name: 'Test Model',
	equippedUpgrades: [],
	...overrides
});

const makeWizardModel = (overrides: Partial<CollegeModel> = {}): CollegeModel =>
	makeModel({
		id: 'wizard-1',
		template: makeTemplate({ id: 'wizard', name: 'Wizard', baseCost: 5 }),
		name: 'Wizard',
		...overrides
	});

const defaultConfig: GameConfig = { pointsLimit: 50, isCampaign: false };
const noLimitConfig: GameConfig = { pointsLimit: null, isCampaign: false };

const makeCollege = (overrides: Partial<College> = {}): College => ({
	id: 'college-1',
	name: 'Test College',
	factionId: 'abjurers',
	models: [makeWizardModel()],
	totalCost: 5,
	eruditeCharges: 0,
	...overrides
});

const makeMerchantItem = (overrides: Partial<MerchantItem> = {}): MerchantItem => ({
	name: 'Magic Item',
	cost: 3,
	description: 'A test item.',
	...overrides
});

// --- calculateModelCost ---

describe('calculateModelCost', () => {
	it('returns the base cost when no upgrades or merchant item', () => {
		const model = makeModel({ template: makeTemplate({ baseCost: 7 }) });
		expect(calculateModelCost(model)).toBe(7);
	});

	it('adds equipped upgrade costs to base cost', () => {
		const model = makeModel({
			template: makeTemplate({ baseCost: 5 }),
			equippedUpgrades: [
				{ upgrade: { name: 'Sword', cost: 2 } },
				{ upgrade: { name: 'Shield', cost: 1 } }
			]
		});
		expect(calculateModelCost(model)).toBe(8);
	});

	it('adds merchant item cost to base cost', () => {
		const model = makeModel({
			template: makeTemplate({ baseCost: 5 }),
			merchantItem: makeMerchantItem({ cost: 3 })
		});
		expect(calculateModelCost(model)).toBe(8);
	});

	it('sums base cost, upgrades, and merchant item', () => {
		const model = makeModel({
			template: makeTemplate({ baseCost: 5 }),
			equippedUpgrades: [{ upgrade: { name: 'Rifle', cost: 2 } }],
			merchantItem: makeMerchantItem({ cost: 4 })
		});
		expect(calculateModelCost(model)).toBe(11);
	});

	it('returns base cost of zero when baseCost is 0', () => {
		const model = makeModel({ template: makeTemplate({ baseCost: 0 }) });
		expect(calculateModelCost(model)).toBe(0);
	});
});

// --- calculateCollegeCost ---

describe('calculateCollegeCost', () => {
	it('returns 0 for an empty college', () => {
		expect(calculateCollegeCost([])).toBe(0);
	});

	it('returns cost of a single model', () => {
		const model = makeModel({ template: makeTemplate({ baseCost: 7 }) });
		expect(calculateCollegeCost([model])).toBe(7);
	});

	it('sums costs of multiple models including their upgrades', () => {
		const modelA = makeModel({
			template: makeTemplate({ baseCost: 5 }),
			equippedUpgrades: [{ upgrade: { name: 'Sword', cost: 2 } }]
		});
		const modelB = makeModel({ template: makeTemplate({ baseCost: 7 }) });
		const modelC = makeModel({
			template: makeTemplate({ baseCost: 3 }),
			merchantItem: makeMerchantItem({ cost: 1 })
		});
		expect(calculateCollegeCost([modelA, modelB, modelC])).toBe(18);
	});
});

// --- calculateEruditeCharges ---

describe('calculateEruditeCharges', () => {
	it('returns floor(spent / 10) when gameSize is null', () => {
		expect(calculateEruditeCharges(25, null)).toBe(2);
	});

	it('returns 0 when nothing is spent and no game size', () => {
		expect(calculateEruditeCharges(0, null)).toBe(0);
	});

	it('adds bonus charges from unspent shillings', () => {
		// floor(40/10) + floor(10/2) = 4 + 5 = 9
		expect(calculateEruditeCharges(40, 50)).toBe(9);
	});

	it('returns no unspent bonus when fully spent', () => {
		// floor(50/10) + floor(0/2) = 5 + 0 = 5
		expect(calculateEruditeCharges(50, 50)).toBe(5);
	});

	it('clamps unspent to 0 when overspent', () => {
		// floor(60/10) + floor(max(0,-10)/2) = 6 + 0 = 6
		expect(calculateEruditeCharges(60, 50)).toBe(6);
	});

	it('handles zero spending with a game size', () => {
		// floor(0/10) + floor(50/2) = 0 + 25 = 25
		expect(calculateEruditeCharges(0, 50)).toBe(25);
	});
});

// --- checkMerchantItemRestriction ---

describe('checkMerchantItemRestriction', () => {
	it('returns true when there is no restriction', () => {
		const model = makeModel();
		const item = makeMerchantItem({ restriction: undefined });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('allows wizard-only items on a wizard model', () => {
		const model = makeModel({ template: makeTemplate({ id: 'wizard' }) });
		const item = makeMerchantItem({ restriction: 'Wizard only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('rejects wizard-only items on a non-wizard model', () => {
		const model = makeModel({ template: makeTemplate({ id: 'slogger' }) });
		const item = makeMerchantItem({ restriction: 'Wizard only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(false);
	});

	it('allows dragoon/familiar items on a dragoon model', () => {
		const model = makeModel({ template: makeTemplate({ id: 'dragoon' }) });
		const item = makeMerchantItem({ restriction: 'Dragoon/Familiar/Mount only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('allows dragoon/familiar items on a feral-familiar model', () => {
		const model = makeModel({ template: makeTemplate({ id: 'feral-familiar' }) });
		const item = makeMerchantItem({ restriction: 'Dragoon/Familiar/Mount only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('allows dragoon/familiar items on a model with a Familiar upgrade', () => {
		const model = makeModel({
			template: makeTemplate({ id: 'scrapper' }),
			equippedUpgrades: [{ upgrade: { name: 'Familiar', cost: 1 } }]
		});
		const item = makeMerchantItem({ restriction: 'Dragoon/Familiar/Mount only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('allows dragoon/familiar items on a model with a Mount upgrade', () => {
		const model = makeModel({
			template: makeTemplate({ id: 'scrapper' }),
			equippedUpgrades: [{ upgrade: { name: 'Mount', cost: 1 } }]
		});
		const item = makeMerchantItem({ restriction: 'Dragoon/Familiar/Mount only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('rejects dragoon/familiar items on an ineligible model', () => {
		const model = makeModel({ template: makeTemplate({ id: 'slogger' }) });
		const item = makeMerchantItem({ restriction: 'Dragoon/Familiar/Mount only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(false);
	});

	it('allows cargo hold items on a model with the Cargo Hold special rule', () => {
		const model = makeModel({
			template: makeTemplate({ specialRules: [{ name: 'Cargo Hold' }] })
		});
		const item = makeMerchantItem({ restriction: 'Cargo Hold models only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('rejects cargo hold items on a model without the Cargo Hold special rule', () => {
		const model = makeModel({ template: makeTemplate({ specialRules: [] }) });
		const item = makeMerchantItem({ restriction: 'Cargo Hold models only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(false);
	});

	it('allows wizard-or-veteran items on a wizard model', () => {
		const model = makeModel({ template: makeTemplate({ id: 'wizard' }) });
		const item = makeMerchantItem({ restriction: 'Wizard or Veteran only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('rejects wizard-or-veteran items on a non-wizard model', () => {
		const model = makeModel({ template: makeTemplate({ id: 'slogger' }) });
		const item = makeMerchantItem({ restriction: 'Wizard or Veteran only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(false);
	});

	it('allows small-base items on a 32-40mm model', () => {
		const model = makeModel({ template: makeTemplate({ baseSize: '32-40mm' }) });
		const item = makeMerchantItem({ restriction: '50mm base or smaller' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('rejects small-base items on an 80-100mm model', () => {
		const model = makeModel({ template: makeTemplate({ baseSize: '80-100mm' }) });
		const item = makeMerchantItem({ restriction: '50mm base or smaller' });
		expect(checkMerchantItemRestriction(model, item)).toBe(false);
	});

	it('rejects small-base items on a 50-60mm model', () => {
		const model = makeModel({ template: makeTemplate({ baseSize: '50-60mm' }) });
		const item = makeMerchantItem({ restriction: '50mm base or smaller' });
		expect(checkMerchantItemRestriction(model, item)).toBe(false);
	});

	it('stays permissive for an unrecognised restriction', () => {
		// ItemRestriction rules this out at compile time, but saved colleges are
		// read back from localStorage unvalidated, so an older app version could
		// still supply one. Such an item must not invalidate an existing list.
		const model = makeModel();
		const item = makeMerchantItem({
			restriction: 'Unknown restriction' as MerchantItem['restriction']
		});
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('allows Cargo Hold items on a model granted the rule by an upgrade', () => {
		const model = makeModel({
			equippedUpgrades: [
				{ upgrade: { name: 'Hold Extension', cost: 2, specialRules: ['Cargo Hold'] } }
			]
		});
		const item = makeMerchantItem({ restriction: 'Cargo Hold models only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});
});

// --- validateCollege ---

describe('validateCollege', () => {
	it('returns no errors for a valid college', () => {
		const college = makeCollege({ totalCost: 5 });
		expect(validateCollege(college, defaultConfig)).toEqual([]);
	});

	it('reports an error when there is no wizard', () => {
		const college = makeCollege({
			models: [makeModel({ template: makeTemplate({ id: 'slogger' }) })]
		});
		const errors = validateCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('exactly one Wizard'))).toBe(true);
	});

	it('reports an error when there are two wizards', () => {
		const college = makeCollege({
			models: [makeWizardModel({ id: 'w1' }), makeWizardModel({ id: 'w2' })]
		});
		const errors = validateCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('exactly one Wizard'))).toBe(true);
	});

	it('reports an error when college cost exceeds the points limit', () => {
		const college = makeCollege({ totalCost: 60 });
		const errors = validateCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('exceeding the'))).toBe(true);
	});

	it('does not report a cost error when there is no points limit', () => {
		const college = makeCollege({ totalCost: 999 });
		const errors = validateCollege(college, noLimitConfig);
		expect(errors.some((e) => e.includes('exceeding'))).toBe(false);
	});

	it('reports an error for a model not in the faction or universal pool', () => {
		const college = makeCollege({
			models: [
				makeWizardModel(),
				makeModel({ template: makeTemplate({ id: '__invalid_faction_model__' }) })
			]
		});
		const errors = validateCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('not available to this faction'))).toBe(true);
	});

	it('allows the faction unique model', () => {
		const abjurers = FACTIONS.find((f) => f.id === 'abjurers')!;
		const uniqueModel = makeModel({ template: abjurers.uniqueModel });
		const college = makeCollege({
			factionId: 'abjurers',
			models: [makeWizardModel(), uniqueModel]
		});
		const errors = validateCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('not available to this faction'))).toBe(false);
	});

	it('allows all universal models', () => {
		const slogger = UNIVERSAL_MODELS.find((m) => m.id === 'slogger')!;
		const college = makeCollege({
			models: [makeWizardModel(), makeModel({ template: slogger })]
		});
		const errors = validateCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('not available to this faction'))).toBe(false);
	});

	it('reports an error when a summonable model has a merchant item', () => {
		const summoned = makeModel({
			template: makeTemplate({ id: 'summoned', isSummonable: true }),
			merchantItem: makeMerchantItem()
		});
		const college = makeCollege({ models: [makeWizardModel(), summoned] });
		const errors = validateCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('summonable model'))).toBe(true);
	});

	it('reports an error when a model carries a restricted merchant item it cannot use', () => {
		const slogger = makeModel({
			template: makeTemplate({ id: 'slogger' }),
			merchantItem: makeMerchantItem({ restriction: 'Wizard only' })
		});
		const college = makeCollege({ models: [makeWizardModel(), slogger] });
		const errors = validateCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('cannot carry'))).toBe(true);
	});

	it('accumulates multiple independent errors', () => {
		const college = makeCollege({
			models: [],
			totalCost: 999
		});
		const errors = validateCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('exactly one Wizard'))).toBe(true);
		expect(errors.some((e) => e.includes('exceeding the'))).toBe(true);
		expect(errors.length).toBeGreaterThanOrEqual(2);
	});
});

// --- validateCampaignCollege ---

describe('validateCampaignCollege', () => {
	const makeCampaignModel = (overrides: Partial<CampaignModel> = {}): CampaignModel => ({
		...makeWizardModel(),
		xp: 0,
		injuries: 0,
		injuryDie: 'D10',
		improvements: [],
		shillingReduction: 0,
		...overrides
	});

	const makeCampaignCollege = (overrides: Partial<CampaignCollege> = {}): CampaignCollege => ({
		id: 'cc-1',
		name: 'Campaign College',
		factionId: 'abjurers',
		models: [makeCampaignModel()],
		totalCost: 5,
		eruditeCharges: 0,
		coffers: [],
		eruditeReserve: 0,
		...overrides
	});

	it('returns no errors for a valid campaign college', () => {
		const college = makeCampaignCollege({ coffers: new Array(10).fill(makeMerchantItem()) });
		expect(validateCampaignCollege(college, defaultConfig)).toEqual([]);
	});

	it('reports an error when coffers exceed 10 items', () => {
		const college = makeCampaignCollege({ coffers: new Array(11).fill(makeMerchantItem()) });
		const errors = validateCampaignCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('Coffers'))).toBe(true);
	});

	it('includes standard college validation errors alongside campaign errors', () => {
		const college = makeCampaignCollege({
			models: [],
			coffers: new Array(11).fill(makeMerchantItem())
		});
		const errors = validateCampaignCollege(college, defaultConfig);
		expect(errors.some((e) => e.includes('exactly one Wizard'))).toBe(true);
		expect(errors.some((e) => e.includes('Coffers'))).toBe(true);
	});
});

// --- calculateUnderdogBonus ---

describe('calculateUnderdogBonus', () => {
	it('returns no bonus when costs are equal', () => {
		expect(calculateUnderdogBonus(30, 30)).toEqual({ charges: 0, bonusXp: false });
	});

	it('returns no bonus when you are more expensive', () => {
		expect(calculateUnderdogBonus(40, 30)).toEqual({ charges: 0, bonusXp: false });
	});

	it('awards charges proportional to the difference', () => {
		// diff 15 → floor(15/5) = 3 charges, bonusXp true (≥10)
		expect(calculateUnderdogBonus(25, 40)).toEqual({ charges: 3, bonusXp: true });
	});

	it('awards charges but no bonus XP for a difference below 10', () => {
		// diff 9 → floor(9/5) = 1 charge, bonusXp false
		expect(calculateUnderdogBonus(30, 39)).toEqual({ charges: 1, bonusXp: false });
	});

	it('triggers bonus XP at exactly a 10-shilling difference', () => {
		// diff 10 → floor(10/5) = 2 charges, bonusXp true
		expect(calculateUnderdogBonus(30, 40)).toEqual({ charges: 2, bonusXp: true });
	});

	it('returns zero charges for a difference smaller than 5', () => {
		// diff 4 → floor(4/5) = 0 charges
		expect(calculateUnderdogBonus(30, 34)).toEqual({ charges: 0, bonusXp: false });
	});
});

// --- effectiveStats ---

describe('effectiveStats', () => {
	it('returns the template statline when nothing is equipped', () => {
		expect(effectiveStats(makeModel())).toEqual(baseStats);
	});

	it('applies a single upgrade modifier', () => {
		const model = makeModel({
			equippedUpgrades: [{ upgrade: { name: 'Mount', cost: 2, statModifier: { mv: '10"' } } }]
		});
		expect(effectiveStats(model).mv).toBe('10"');
	});

	it('leaves stats the modifier does not mention untouched', () => {
		const model = makeModel({
			equippedUpgrades: [{ upgrade: { name: 'Mount', cost: 2, statModifier: { mv: '10"' } } }]
		});
		const stats = effectiveStats(model);
		expect(stats.df).toBe(baseStats.df);
		expect(stats.passiveSurge).toBe(baseStats.passiveSurge);
	});

	it('stacks modifiers across several upgrades', () => {
		const model = makeModel({
			equippedUpgrades: [
				{ upgrade: { name: 'Mount', cost: 2, statModifier: { mv: '10"' } } },
				{
					upgrade: {
						name: 'Marksmanship',
						cost: 1,
						statModifier: { ra: { count: 1, die: 'D8' } }
					}
				}
			]
		});
		const stats = effectiveStats(model);
		expect(stats.mv).toBe('10"');
		expect(stats.ra).toEqual({ count: 1, die: 'D8' });
	});

	it('lets a later upgrade win when two modify the same stat', () => {
		const model = makeModel({
			equippedUpgrades: [
				{ upgrade: { name: 'Mount', cost: 2, statModifier: { mv: '10"' } } },
				{ upgrade: { name: 'Blinding Speed', cost: 3, statModifier: { mv: '18"' } } }
			]
		});
		expect(effectiveStats(model).mv).toBe('18"');
	});

	it('ignores upgrades that carry no stat modifier', () => {
		const model = makeModel({
			equippedUpgrades: [{ upgrade: { name: 'Grenade', cost: 1 } }]
		});
		expect(effectiveStats(model)).toEqual(baseStats);
	});

	it('does not mutate the shared template statline', () => {
		const template = makeTemplate();
		const model = makeModel({
			template,
			equippedUpgrades: [{ upgrade: { name: 'Mount', cost: 2, statModifier: { mv: '10"' } } }]
		});
		effectiveStats(model);
		expect(template.stats.mv).toBe('6"');
	});
});

// --- effectiveSpecialRules ---

describe('effectiveSpecialRules', () => {
	it('returns the template rules when nothing is equipped', () => {
		const model = makeModel({ template: makeTemplate({ specialRules: [{ name: 'Fly' }] }) });
		expect(effectiveSpecialRules(model)).toEqual([{ name: 'Fly' }]);
	});

	it('adds rules granted by an upgrade', () => {
		const model = makeModel({
			equippedUpgrades: [
				{ upgrade: { name: 'Senior Officer', cost: 3, specialRules: ['Commander'] } }
			]
		});
		expect(effectiveSpecialRules(model)).toEqual([{ name: 'Commander' }]);
	});

	it('parses a parameterised rule granted by an upgrade', () => {
		const model = makeModel({
			equippedUpgrades: [
				{ upgrade: { name: 'Bladed Plough', cost: 3, specialRules: ['Impact 2'] } }
			]
		});
		expect(effectiveSpecialRules(model)).toEqual([{ name: 'Impact', params: { value: 2 } }]);
	});

	it('does not duplicate a rule the template already has', () => {
		const model = makeModel({
			template: makeTemplate({ specialRules: [{ name: 'Fly' }] }),
			equippedUpgrades: [{ upgrade: { name: 'Wings', cost: 2, specialRules: ['Fly'] } }]
		});
		expect(effectiveSpecialRules(model)).toHaveLength(1);
	});

	it('does not mutate the template rules array', () => {
		const template = makeTemplate({ specialRules: [{ name: 'Fly' }] });
		const model = makeModel({
			template,
			equippedUpgrades: [
				{ upgrade: { name: 'Senior Officer', cost: 3, specialRules: ['Commander'] } }
			]
		});
		effectiveSpecialRules(model);
		expect(template.specialRules).toHaveLength(1);
	});
});

// --- effectiveEquipment ---

describe('effectiveEquipment', () => {
	const rifle = { name: 'Rifle', type: 'ranged' as const, range: '24"' };
	const knife = { name: 'Combat Knife', type: 'melee' as const };
	const claymore = { name: 'Claymore', type: 'melee' as const };

	it('returns base equipment when nothing is equipped', () => {
		const model = makeModel({ template: makeTemplate({ baseEquipment: [rifle, knife] }) });
		expect(effectiveEquipment(model)).toEqual([rifle, knife]);
	});

	it('swaps out equipment an upgrade replaces', () => {
		const model = makeModel({
			template: makeTemplate({ baseEquipment: [rifle, knife] }),
			equippedUpgrades: [
				{
					upgrade: { name: 'Claymore', cost: 2, replaces: 'Combat Knife', weapon: claymore },
					replacedEquipment: 'Combat Knife'
				}
			]
		});
		expect(effectiveEquipment(model)).toEqual([rifle, claymore]);
	});

	it('adds a weapon from an upgrade that replaces nothing', () => {
		const grenade = { name: 'Grenade', type: 'ranged' as const, range: '6"' };
		const model = makeModel({
			template: makeTemplate({ baseEquipment: [rifle] }),
			equippedUpgrades: [{ upgrade: { name: 'Grenade', cost: 1, weapon: grenade } }]
		});
		expect(effectiveEquipment(model)).toEqual([rifle, grenade]);
	});

	it('ignores upgrades that carry no weapon', () => {
		const model = makeModel({
			template: makeTemplate({ baseEquipment: [rifle] }),
			equippedUpgrades: [{ upgrade: { name: 'Familiar', cost: 1 } }]
		});
		expect(effectiveEquipment(model)).toEqual([rifle]);
	});
});

// --- abilityUpgrades ---

describe('abilityUpgrades', () => {
	it('keeps only upgrades that do not carry a weapon', () => {
		const model = makeModel({
			equippedUpgrades: [
				{ upgrade: { name: 'Familiar', cost: 1 } },
				{
					upgrade: {
						name: 'Claymore',
						cost: 2,
						weapon: { name: 'Claymore', type: 'melee' }
					}
				}
			]
		});
		expect(abilityUpgrades(model).map((eu) => eu.upgrade.name)).toEqual(['Familiar']);
	});

	it('returns an empty list when every upgrade is a weapon', () => {
		const model = makeModel({
			equippedUpgrades: [
				{ upgrade: { name: 'Rifle', cost: 2, weapon: { name: 'Rifle', type: 'ranged' } } }
			]
		});
		expect(abilityUpgrades(model)).toEqual([]);
	});
});
