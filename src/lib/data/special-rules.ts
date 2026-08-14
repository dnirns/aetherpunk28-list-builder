import type { SpecialRule } from '$lib/types/game.types';

/**
 * Universal special rule descriptions, transcribed from
 * docs/A28_Universal_Special_Rules.md. Keyed by the bare rule name, so
 * parameterised rules such as Armour (1) and Blast (3") share one entry.
 */
export const SPECIAL_RULES: Record<string, string> = {
	Armour: 'Automatically pass X defence/willpower checks from Fire or Cast.',
	Artillery:
		'Can target enemies not visible if another friendly model can see them (Ra -1, no cover benefits).',
	'Artillery Barrage': 'Place marker, scatter D8". Attack hits models around landed marker.',
	Blast: 'Divide dice equally among all models within X" of target.',
	Commander: 'As an order, select friendly model within 6" to immediately execute an order.',
	'Critical Hits': "Max roll reduces target's Df by 1 for the round (roll of 12 reduces by 2).",
	'Dug-In': 'Counts as in light cover until moves.',
	Flaming:
		'Successful checks apply flame counters. Must take treacherous terrain check per counter if not removed.',
	Fly: 'Ignores terrain and models when moving. No fall damage.',
	'Hulking Behemoth': 'Cannot Hunker Down or claim light cover.',
	Impact: 'Charge order deals X automatic hits on contact.',
	'One-Use': 'Can only be used once per game per purchase.',
	'Troop Transport': 'Can carry models with total Shilling cost up to X.',
	Unstable:
		'Highest roll generates extra dice equal to half the result. Rolling a 1 decreases willpower, generates an extra die.'
};

/**
 * Rules the source documents name on a model profile but never define. Listed
 * here so the gap is recorded rather than silently missing, and so the data
 * integrity test can tell a known gap apart from a typo. Descriptions should be
 * added only once they appear in docs/, never invented.
 */
export const UNDOCUMENTED_SPECIAL_RULES: readonly string[] = [
	'Boiler Explosion',
	'Cargo Hold',
	'Defensive Protocols',
	'Have at Thee!',
	'Interlocking Aegis',
	'Kinetic Transference',
	'Mindless Hoard',
	'Moving Wall',
	'Unstoppable',
	'Volatile Locomotion'
];

/** Rule names sorted longest first, so "Troop Transport" wins over any shorter prefix. */
const KNOWN_NAMES = Object.keys(SPECIAL_RULES).sort((a, b) => b.length - a.length);

/**
 * Parse a rule reference written as a single string, as used by
 * `Upgrade.specialRules`, into the structured form used by model profiles.
 * "Impact 2" becomes `{ name: 'Impact', params: { value: 2 } }`.
 */
export const parseSpecialRule = (raw: string): SpecialRule => {
	const match = KNOWN_NAMES.find((name) => raw === name || raw.startsWith(`${name} `));
	if (!match) return { name: raw };

	const param = raw.slice(match.length).trim();
	if (!param) return { name: match };

	const numeric = Number(param);
	return {
		name: match,
		params: { value: Number.isNaN(numeric) ? param : numeric }
	};
};

/** Resolve a rule's description, preferring text already inlined on the rule itself. */
export const describeSpecialRule = (rule: SpecialRule): string | undefined =>
	rule.description ?? SPECIAL_RULES[rule.name];
