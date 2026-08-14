import type {
	BaseSize,
	CampaignCollege,
	College,
	CollegeModel,
	EquippedUpgrade,
	GameConfig,
	MerchantItem,
	SpecialRule,
	StatBlock,
	WeaponProfile
} from '$lib/types/game.types';
import { FACTIONS } from '$lib/data/factions';
import { UNIVERSAL_MODELS } from '$lib/data/universal-models';
import { parseSpecialRule } from '$lib/data/special-rules';

/** Base sizes treated as "50mm or smaller" for merchant item restrictions. */
const SMALL_BASE_SIZES = new Set<BaseSize>(['25mm', '32-40mm', '40-50mm']);

/**
 * Compile-time exhaustiveness guard. Passing a value here fails to typecheck
 * unless every case of its union has already been handled.
 */
const assertNever = (value: never): void => void value;

/** Calculate total shilling cost of a single model including upgrades and merchant item. */
export const calculateModelCost = (model: CollegeModel): number => {
	const upgradeCost = model.equippedUpgrades.reduce((sum, eu) => sum + eu.upgrade.cost, 0);
	const itemCost = model.merchantItem?.cost ?? 0;
	return model.template.baseCost + upgradeCost + itemCost;
};

/** Calculate total shilling cost of all models in a college. */
export const calculateCollegeCost = (models: CollegeModel[]): number =>
	models.reduce((sum, m) => sum + calculateModelCost(m), 0);

/**
 * A model's statline with every equipped upgrade's modifiers applied. Later
 * upgrades win, so an upgrade that raises a stat overrides an earlier one.
 */
export const effectiveStats = (model: CollegeModel): StatBlock =>
	model.equippedUpgrades.reduce<StatBlock>(
		(stats, eu) => (eu.upgrade.statModifier ? { ...stats, ...eu.upgrade.statModifier } : stats),
		model.template.stats
	);

/**
 * A model's special rules, combining its template's rules with any granted by
 * equipped upgrades. Rules granted more than once appear only once.
 */
export const effectiveSpecialRules = (model: CollegeModel): SpecialRule[] => {
	const rules = [...model.template.specialRules];
	const seen = new Set(rules.map((r) => r.name));

	for (const eu of model.equippedUpgrades) {
		for (const raw of eu.upgrade.specialRules ?? []) {
			const rule = parseSpecialRule(raw);
			if (seen.has(rule.name)) continue;
			seen.add(rule.name);
			rules.push(rule);
		}
	}

	return rules;
};

/**
 * The weapons a model actually carries: base equipment minus anything an
 * upgrade replaced, plus the weapons those upgrades bring.
 */
export const effectiveEquipment = (model: CollegeModel): WeaponProfile[] => {
	const replaced = new Set(
		model.equippedUpgrades.map((eu) => eu.replacedEquipment).filter(Boolean)
	);
	const base = model.template.baseEquipment.filter((w) => !replaced.has(w.name));
	const upgradeWeapons = model.equippedUpgrades
		.filter((eu) => eu.upgrade.weapon)
		.map((eu) => eu.upgrade.weapon!);
	return [...base, ...upgradeWeapons];
};

/** Equipped upgrades that grant an ability rather than a weapon. */
export const abilityUpgrades = (model: CollegeModel): EquippedUpgrade[] =>
	model.equippedUpgrades.filter((eu) => !eu.upgrade.weapon);

/** Calculate starting erudite charges for a standalone game. */
export const calculateEruditeCharges = (totalSpent: number, gameSize: number | null): number => {
	const fromSpending = Math.floor(totalSpent / 10);
	if (gameSize === null) return fromSpending;
	const unspent = gameSize - totalSpent;
	const fromUnspent = Math.floor(Math.max(0, unspent) / 2);
	return fromSpending + fromUnspent;
};

/** Check whether a model satisfies a merchant item's restriction. */
export const checkMerchantItemRestriction = (model: CollegeModel, item: MerchantItem): boolean => {
	const { restriction } = item;
	if (!restriction) return true;

	switch (restriction) {
		case 'Wizard only':
			return model.template.id === 'wizard';
		case 'Wizard or Veteran only':
			// TODO: see open question 2. Veteran access is campaign-only state that is not
			// yet tracked on CollegeModel, so this currently permits Wizards only.
			return model.template.id === 'wizard';
		case 'Dragoon/Familiar/Mount only':
			return (
				model.template.id === 'dragoon' ||
				model.template.id === 'feral-familiar' ||
				model.equippedUpgrades.some(
					(eu) => eu.upgrade.name === 'Familiar' || eu.upgrade.name === 'Mount'
				)
			);
		case 'Cargo Hold models only':
			return effectiveSpecialRules(model).some((r) => r.name === 'Cargo Hold');
		case '50mm base or smaller':
			// TODO: see open question 1. The 50-60mm band is treated as too large for now.
			return SMALL_BASE_SIZES.has(model.template.baseSize);
		default:
			// Unreachable for well-typed data: the assignment fails to compile if a
			// new restriction is added without a case here. Saved colleges are read
			// back from localStorage unvalidated though, so an unrecognised
			// restriction written by an older version stays permissive rather than
			// invalidating a list the player already built.
			assertNever(restriction);
			return true;
	}
};

/** Validate that a college meets list-building constraints. */
export const validateCollege = (college: College, config: GameConfig): string[] => {
	const errors: string[] = [];

	// Exactly one Wizard
	const wizards = college.models.filter((m) => m.template.id === 'wizard');
	if (wizards.length !== 1) {
		errors.push(`A College must contain exactly one Wizard (found ${wizards.length}).`);
	}

	// Cost within points limit
	if (config.pointsLimit !== null && college.totalCost > config.pointsLimit) {
		errors.push(
			`College costs ${college.totalCost} Shillings, exceeding the ${config.pointsLimit} limit.`
		);
	}

	// Faction restriction: only universal models and the faction's unique model
	const faction = FACTIONS.find((f) => f.id === college.factionId);
	const universalIds = new Set(UNIVERSAL_MODELS.map((m) => m.id));
	const allowedIds = new Set([...universalIds, ...(faction ? [faction.uniqueModel.id] : [])]);

	for (const model of college.models) {
		if (!allowedIds.has(model.template.id)) {
			errors.push(
				`${model.template.name} is not available to this faction. A College may only include Universal Models and its faction's unique model.`
			);
		}
	}

	// Summonable models cannot carry merchant items
	for (const model of college.models) {
		if (model.template.isSummonable && model.merchantItem) {
			errors.push(`${model.name} is a summonable model and cannot be given merchant items.`);
		}
	}

	// Merchant item restrictions
	for (const model of college.models) {
		if (model.merchantItem && !checkMerchantItemRestriction(model, model.merchantItem)) {
			errors.push(
				`${model.name} cannot carry ${model.merchantItem.name} (restricted to ${model.merchantItem.restriction}).`
			);
		}
	}

	return errors;
};

/** Validate campaign-specific college constraints. */
export const validateCampaignCollege = (college: CampaignCollege, config: GameConfig): string[] => {
	const errors = validateCollege(college, config);

	if (college.coffers.length > 10) {
		errors.push(
			`College Coffers contain ${college.coffers.length} items, exceeding the maximum of 10.`
		);
	}

	return errors;
};

/** Calculate underdog bonus erudite charges. */
export const calculateUnderdogBonus = (
	yourCost: number,
	opponentCost: number
): { charges: number; bonusXp: boolean } => {
	const diff = Math.max(0, opponentCost - yourCost);
	return {
		charges: Math.floor(diff / 5),
		bonusXp: diff >= 10
	};
};
