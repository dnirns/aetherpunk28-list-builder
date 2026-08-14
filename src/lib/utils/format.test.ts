import { describe, it, expect } from 'vitest';
import { formatDice, formatDie, formatEmpowered, formatSpecialRule } from './format';

describe('formatDice', () => {
	it('renders a dash when the model has no such attack', () => {
		expect(formatDice({ count: 1, die: 0 })).toBe('-');
	});

	it('omits the count when it is 1', () => {
		expect(formatDice({ count: 1, die: 'D6' })).toBe('D6');
	});

	it('prefixes the count when it is greater than 1', () => {
		expect(formatDice({ count: 2, die: 'D6' })).toBe('2D6');
		expect(formatDice({ count: 5, die: 'D8' })).toBe('5D8');
	});

	it('handles the D12+1 step', () => {
		expect(formatDice({ count: 3, die: 'D12+1' })).toBe('3D12+1');
	});
});

describe('formatDie', () => {
	it('renders a dash for 0', () => {
		expect(formatDie(0)).toBe('-');
	});

	it('renders the die step as written', () => {
		expect(formatDie('D10')).toBe('D10');
		expect(formatDie('D12+1')).toBe('D12+1');
	});
});

describe('formatEmpowered', () => {
	it('upper-cases the stat and keeps the value', () => {
		expect(formatEmpowered([{ stat: 'me', value: '+1' }])).toBe('ME +1');
	});

	it('joins multiple bonuses with commas', () => {
		expect(
			formatEmpowered([
				{ stat: 'me', value: '+1' },
				{ stat: 'wp', value: '+1' }
			])
		).toBe('ME +1, WP +1');
	});

	it('renders lightCover as prose rather than a stat bonus', () => {
		expect(formatEmpowered([{ stat: 'lightCover', value: '' }])).toBe('Permanent Light Cover');
	});

	it('mixes lightCover with ordinary stat bonuses', () => {
		expect(
			formatEmpowered([
				{ stat: 'mv', value: '+2"' },
				{ stat: 'lightCover', value: '' }
			])
		).toBe('MV +2", Permanent Light Cover');
	});

	it('returns an empty string when there are no bonuses', () => {
		expect(formatEmpowered([])).toBe('');
	});
});

describe('formatSpecialRule', () => {
	it('returns the bare name when the rule has no params', () => {
		expect(formatSpecialRule({ name: 'Fly' })).toBe('Fly');
	});

	it('appends a single param in brackets', () => {
		expect(formatSpecialRule({ name: 'Armour', params: { value: 1 } })).toBe('Armour (1)');
	});

	it('joins multiple params with commas', () => {
		expect(formatSpecialRule({ name: 'Blast', params: { size: '3"', range: '12"' } })).toBe(
			'Blast (3", 12")'
		);
	});
});
