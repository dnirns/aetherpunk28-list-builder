import type { DicePool, DieStep, EmpoweredBonus, SpecialRule } from '$lib/types/game.types';

/** Format a dice pool for display, e.g. "2D6". A die of 0 means the model has no such attack. */
export const formatDice = (pool: DicePool): string => {
	if (pool.die === 0) return '-';
	return pool.count > 1 ? `${pool.count}${pool.die}` : `${pool.die}`;
};

/** Format a single die step for display. */
export const formatDie = (die: DieStep): string => (die === 0 ? '-' : `${die}`);

/** Format a faction's empowered bonuses as a single comma-separated line. */
export const formatEmpowered = (empowered: EmpoweredBonus[]): string =>
	empowered
		.map((e) =>
			e.stat === 'lightCover' ? 'Permanent Light Cover' : `${e.stat.toUpperCase()} ${e.value}`
		)
		.join(', ');

/** Format a special rule name with its parameters, e.g. "Armour (1)". */
export const formatSpecialRule = (rule: SpecialRule): string =>
	rule.params ? `${rule.name} (${Object.values(rule.params).join(', ')})` : rule.name;
