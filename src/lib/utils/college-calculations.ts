import type {
	BaseSize,
	CampaignCollege,
	College,
	CollegeModel,
	GameConfig,
	MerchantItem
} from '$lib/types/game.types';
import { FACTIONS } from '$lib/data/factions';
import { UNIVERSAL_MODELS } from '$lib/data/universal-models';

/** Base sizes treated as "50mm or smaller" for merchant item restrictions. */
const SMALL_BASE_SIZES = new Set<BaseSize>(['25mm', '32-40mm', '40-50mm']);

/** Calculate total shilling cost of a single model including upgrades and merchant item. */
export const calculateModelCost = (model: CollegeModel): number => {
	const upgradeCost = model.equippedUpgrades.reduce((sum, eu) => sum + eu.upgrade.cost, 0);
	const itemCost = model.merchantItem?.cost ?? 0;
	return model.template.baseCost + upgradeCost + itemCost;
};

/** Calculate total shilling cost of all models in a college. */
export const calculateCollegeCost = (models: CollegeModel[]): number =>
	models.reduce((sum, m) => sum + calculateModelCost(m), 0);

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
	if (!item.restriction) return true;

	switch (item.restriction) {
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
			return model.template.specialRules.some((r) => r.name === 'Cargo Hold');
		case '50mm base or smaller':
			// TODO: see open question 1. The 50-60mm band is treated as too large for now.
			return SMALL_BASE_SIZES.has(model.template.baseSize);
		default:
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
