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
	calculateCollegeCost,
	calculateEruditeCharges,
	calculateModelCost,
	calculateUnderdogBonus,
	checkMerchantItemRestriction,
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
	totalCost: 5,
	...overrides
});

const makeWizardModel = (overrides: Partial<CollegeModel> = {}): CollegeModel =>
	makeModel({
		id: 'wizard-1',
		template: makeTemplate({ id: 'wizard', name: 'Wizard', baseCost: 5 }),
		name: 'Wizard',
		totalCost: 5,
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
		const item = makeMerchantItem({ restriction: 'Dragoon/Familiar only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('allows dragoon/familiar items on a feral-familiar model', () => {
		const model = makeModel({ template: makeTemplate({ id: 'feral-familiar' }) });
		const item = makeMerchantItem({ restriction: 'Dragoon/Familiar only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('allows dragoon/familiar items on a model with a Familiar upgrade', () => {
		const model = makeModel({
			template: makeTemplate({ id: 'scrapper' }),
			equippedUpgrades: [{ upgrade: { name: 'Familiar', cost: 1 } }]
		});
		const item = makeMerchantItem({ restriction: 'Dragoon/Familiar only' });
		expect(checkMerchantItemRestriction(model, item)).toBe(true);
	});

	it('rejects dragoon/familiar items on an ineligible model', () => {
		const model = makeModel({ template: makeTemplate({ id: 'slogger' }) });
		const item = makeMerchantItem({ restriction: 'Dragoon/Familiar only' });
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

	it('returns true for an unrecognised restriction (default case)', () => {
		const model = makeModel();
		const item = makeMerchantItem({ restriction: 'Unknown restriction' });
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
