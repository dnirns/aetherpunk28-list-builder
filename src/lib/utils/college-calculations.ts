import type { College, CollegeModel, GameConfig } from '$lib/types/game.types';

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
export const calculateEruditeCharges = (totalSpent: number, gameSize: number): number => {
	const fromSpending = Math.floor(totalSpent / 10);
	const unspent = gameSize - totalSpent;
	const fromUnspent = Math.floor(Math.max(0, unspent) / 2);
	return fromSpending + fromUnspent;
};

/** Validate that a college meets list-building constraints. */
export const validateCollege = (college: College, config: GameConfig): string[] => {
	const errors: string[] = [];

	const wizards = college.models.filter((m) => m.template.id === 'wizard');
	if (wizards.length !== 1) {
		errors.push(`A College must contain exactly one Wizard (found ${wizards.length}).`);
	}

	if (college.totalCost > config.pointsLimit) {
		errors.push(
			`College costs ${college.totalCost} Shillings, exceeding the ${config.pointsLimit} limit.`
		);
	}

	const modelsWithMultipleItems = college.models.filter(
		(m) => m.merchantItem && m.equippedUpgrades.some((eu) => eu.upgrade.name === m.merchantItem?.name)
	);
	if (modelsWithMultipleItems.length > 0) {
		errors.push('Each model may carry a maximum of one Merchant item.');
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
