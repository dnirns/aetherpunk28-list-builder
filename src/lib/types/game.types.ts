// Core game data types for Aetherpunk 28

// --- Dice & Stats ---

export type DieStep = 0 | 'D4' | 'D6' | 'D8' | 'D10' | 'D12' | 'D12+1';

export type DicePool = {
	count: number;
	die: DieStep;
};

export type StatBlock = {
	mv: string; // e.g. "6\"" — stored as display string
	ra: DicePool;
	me: DicePool;
	df: DieStep;
	wp: DieStep;
	range: string; // e.g. "24\""
	passiveSurge: PassiveSurge;
};

export type PassiveSurge = 'Hunker Down' | 'Fight' | 'Unbind' | 'Charge' | 'Fire' | 'Move';

// --- Factions ---

export type FactionId =
	| 'abjurers'
	| 'diviners'
	| 'druids'
	| 'evokers'
	| 'geomancers'
	| 'golem-corps'
	| 'mechanists'
	| 'necromancers'
	| 'paladins'
	| 'stormcallers'
	| 'hedge-wizards';

export type FactionSymbol =
	| 'Tortoise'
	| 'Butterfly'
	| 'Owl'
	| 'Rabbit'
	| 'Snail'
	| 'Crab'
	| 'Toad'
	| 'Spider'
	| 'Frog'
	| 'Raven'
	| 'Hedgehog';

export type EmpoweredBonus = {
	stat: keyof StatBlock | 'lightCover';
	value: string; // e.g. "+1", "+2\""
};

export type FactionSpell = {
	name: string;
	cost: number; // erudite charge cost
	description: string;
};

export type Faction = {
	id: FactionId;
	name: string;
	symbol: FactionSymbol;
	empowered: EmpoweredBonus[];
	factionSpell: FactionSpell;
	uniqueModel: ModelTemplate;
};

// --- Models ---

export type BaseSize =
	| '25mm'
	| '32-40mm'
	| '40-50mm'
	| '50-60mm'
	| '60-80mm'
	| '80-100mm'
	| '120-150mm';

export type SpecialRule = {
	name: string;
	description?: string;
	params?: Record<string, string | number>;
};

export type WeaponProfile = {
	name: string;
	type: 'ranged' | 'melee';
	dice?: DicePool;
	range?: string;
	specialRules?: string[];
};

export type Upgrade = {
	name: string;
	cost: number; // shillings
	replaces?: string; // name of equipment it replaces
	weapon?: WeaponProfile;
	statModifier?: Partial<StatBlock>;
	specialRules?: string[];
	description?: string;
};

export type ModelTemplate = {
	id: string;
	name: string;
	baseCost: number; // shillings
	baseSize: BaseSize;
	stats: StatBlock;
	baseEquipment: WeaponProfile[];
	specialRules: SpecialRule[];
	upgrades: Upgrade[];
	isSummonable?: boolean;
	isUnique?: boolean; // faction-specific unique model
};

// --- College (Army List) ---

export type EquippedUpgrade = {
	upgrade: Upgrade;
	replacedEquipment?: string;
};

export type MerchantItem = {
	name: string;
	cost: number;
	restriction?: string; // e.g. "Wizard only", "Dragoon/Familiar only"
	description: string;
};

export type CollegeModel = {
	id: string; // unique instance id
	template: ModelTemplate;
	name: string; // custom name for this instance
	equippedUpgrades: EquippedUpgrade[];
	merchantItem?: MerchantItem;
	totalCost: number; // derived: baseCost + upgrades + item
};

export type College = {
	id: string;
	name: string;
	factionId: FactionId;
	models: CollegeModel[];
	totalCost: number; // derived: sum of all model costs
	eruditeCharges: number; // derived from game size and spending
};

// --- Campaign ---

export type InjuryDie = 'D10' | 'D8' | 'D6' | 'D4';

export type CampaignModel = CollegeModel & {
	xp: number;
	injuries: number;
	injuryDie: InjuryDie;
	improvements: string[];
	shillingReduction: number; // derived from injuries
};

export type CampaignCollege = Omit<College, 'models'> & {
	models: CampaignModel[];
	coffers: MerchantItem[]; // up to 10 stored items
	eruditeReserve: number;
};

// --- Spells ---

export type CoreSpell = {
	name: string;
	cost: number;
	description: string;
};

// --- Saved Colleges ---

export type SavedCollege = {
	id: string;
	name: string;
	factionId: FactionId;
	models: CollegeModel[];
	totalCost: number;
	eruditeCharges: number;
	gameConfig: GameConfig;
	savedAt: string; // ISO timestamp
};

// --- Game Setup ---

export type GameConfig = {
	pointsLimit: number | null; // default 50 shillings; null = no limit
	isCampaign: boolean;
};
