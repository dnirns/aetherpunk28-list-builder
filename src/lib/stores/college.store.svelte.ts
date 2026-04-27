import type {
	College,
	CollegeModel,
	EquippedUpgrade,
	FactionId,
	GameConfig,
	MerchantItem,
	ModelTemplate,
	Upgrade
} from '$lib/types/game.types';
import {
	calculateCollegeCost,
	calculateEruditeCharges,
	calculateModelCost,
	validateCollege
} from '$lib/utils/college-calculations';

const generateId = (): string => crypto.randomUUID();

const createCollegeStore = () => {
	let name = $state('New College');
	let factionId = $state<FactionId>('abjurers');
	let models = $state<CollegeModel[]>([]);
	let gameConfig = $state<GameConfig>({ pointsLimit: 50, isCampaign: false });

	const totalCost = $derived(calculateCollegeCost(models));
	const eruditeCharges = $derived(calculateEruditeCharges(totalCost, gameConfig.pointsLimit));

	const college = $derived<College>({
		id: 'active-college',
		name,
		factionId,
		models,
		totalCost,
		eruditeCharges
	});

	const validationErrors = $derived(validateCollege(college, gameConfig));

	const setFaction = (id: FactionId) => {
		factionId = id;
	};

	const setName = (newName: string) => {
		name = newName;
	};

	const setGameConfig = (config: GameConfig) => {
		gameConfig = config;
	};

	const addModel = (template: ModelTemplate, customName?: string) => {
		const model: CollegeModel = {
			id: generateId(),
			template,
			name: customName ?? template.name,
			equippedUpgrades: [],
			merchantItem: undefined,
			totalCost: template.baseCost
		};
		models.push(model);
		return model.id;
	};

	const removeModel = (modelId: string) => {
		models = models.filter((m) => m.id !== modelId);
	};

	const equipUpgrade = (modelId: string, upgrade: Upgrade) => {
		const model = models.find((m) => m.id === modelId);
		if (!model) return;

		// Prevent equipping the same upgrade twice
		if (model.equippedUpgrades.some((eu) => eu.upgrade.name === upgrade.name)) return;

		// If this upgrade replaces equipment, swap out any existing upgrade for the same slot
		if (upgrade.replaces) {
			model.equippedUpgrades = model.equippedUpgrades.filter(
				(eu) => eu.replacedEquipment !== upgrade.replaces
			);
		}

		const equipped: EquippedUpgrade = {
			upgrade,
			replacedEquipment: upgrade.replaces
		};
		model.equippedUpgrades.push(equipped);
		model.totalCost = calculateModelCost(model);
	};

	const removeUpgrade = (modelId: string, upgradeName: string) => {
		const model = models.find((m) => m.id === modelId);
		if (!model) return;

		model.equippedUpgrades = model.equippedUpgrades.filter((eu) => eu.upgrade.name !== upgradeName);
		model.totalCost = calculateModelCost(model);
	};

	const equipMerchantItem = (modelId: string, item: MerchantItem) => {
		const model = models.find((m) => m.id === modelId);
		if (!model) return;

		model.merchantItem = item;
		model.totalCost = calculateModelCost(model);
	};

	const removeMerchantItem = (modelId: string) => {
		const model = models.find((m) => m.id === modelId);
		if (!model) return;

		model.merchantItem = undefined;
		model.totalCost = calculateModelCost(model);
	};

	const renameModel = (modelId: string, newName: string) => {
		const model = models.find((m) => m.id === modelId);
		if (!model) return;

		model.name = newName;
	};

	const reset = () => {
		name = 'New College';
		factionId = 'abjurers';
		models = [];
	};

	return {
		get name() {
			return name;
		},
		get factionId() {
			return factionId;
		},
		get models() {
			return models;
		},
		get gameConfig() {
			return gameConfig;
		},
		get totalCost() {
			return totalCost;
		},
		get eruditeCharges() {
			return eruditeCharges;
		},
		get college() {
			return college;
		},
		get validationErrors() {
			return validationErrors;
		},
		setFaction,
		setName,
		setGameConfig,
		addModel,
		removeModel,
		equipUpgrade,
		removeUpgrade,
		equipMerchantItem,
		removeMerchantItem,
		renameModel,
		reset
	};
};

export const collegeStore = createCollegeStore();
