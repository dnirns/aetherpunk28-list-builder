import { beforeEach, describe, expect, it } from 'vitest';
import type { SavedCollege } from '../types/game.types';
import { savedCollegesStore } from './saved-colleges.store.svelte';

const makeSavedCollege = (overrides: Partial<SavedCollege> = {}): SavedCollege => ({
	id: 'college-1',
	name: 'Test College',
	factionId: 'abjurers',
	models: [],
	totalCost: 5,
	eruditeCharges: 2,
	gameConfig: { pointsLimit: 50, isCampaign: false },
	savedAt: '2026-01-01T00:00:00.000Z',
	...overrides
});

beforeEach(() => {
	localStorage.clear();
	savedCollegesStore.refresh();
});

// --- initial state ---

describe('initial state', () => {
	it('starts with an empty colleges list after storage is cleared', () => {
		expect(savedCollegesStore.colleges).toEqual([]);
	});
});

// --- save ---

describe('save', () => {
	it('adds a college to the list', () => {
		savedCollegesStore.save(makeSavedCollege());
		expect(savedCollegesStore.colleges).toHaveLength(1);
	});

	it('stores the college data correctly', () => {
		const college = makeSavedCollege({ id: 'abc', name: 'Iron Guard', factionId: 'paladins' });
		savedCollegesStore.save(college);
		expect(savedCollegesStore.colleges[0].id).toBe('abc');
		expect(savedCollegesStore.colleges[0].name).toBe('Iron Guard');
		expect(savedCollegesStore.colleges[0].factionId).toBe('paladins');
	});

	it('updates an existing entry when saved with the same id', () => {
		savedCollegesStore.save(makeSavedCollege({ id: 'x', name: 'Original' }));
		savedCollegesStore.save(makeSavedCollege({ id: 'x', name: 'Updated' }));
		expect(savedCollegesStore.colleges).toHaveLength(1);
		expect(savedCollegesStore.colleges[0].name).toBe('Updated');
	});

	it('appends colleges with different ids', () => {
		savedCollegesStore.save(makeSavedCollege({ id: 'a' }));
		savedCollegesStore.save(makeSavedCollege({ id: 'b' }));
		expect(savedCollegesStore.colleges).toHaveLength(2);
	});

	it('persists the college so a subsequent refresh still returns it', () => {
		savedCollegesStore.save(makeSavedCollege({ id: 'persist' }));
		savedCollegesStore.refresh();
		expect(savedCollegesStore.colleges.some((c) => c.id === 'persist')).toBe(true);
	});
});

// --- remove ---

describe('remove', () => {
	it('removes the college with the given id', () => {
		savedCollegesStore.save(makeSavedCollege({ id: 'a' }));
		savedCollegesStore.save(makeSavedCollege({ id: 'b' }));
		savedCollegesStore.remove('a');
		expect(savedCollegesStore.colleges).toHaveLength(1);
		expect(savedCollegesStore.colleges[0].id).toBe('b');
	});

	it('results in an empty list when the only college is removed', () => {
		savedCollegesStore.save(makeSavedCollege({ id: 'only' }));
		savedCollegesStore.remove('only');
		expect(savedCollegesStore.colleges).toEqual([]);
	});

	it('does nothing when the id does not exist', () => {
		savedCollegesStore.save(makeSavedCollege({ id: 'a' }));
		savedCollegesStore.remove('nonexistent');
		expect(savedCollegesStore.colleges).toHaveLength(1);
	});

	it('persists the removal so a subsequent refresh does not restore it', () => {
		savedCollegesStore.save(makeSavedCollege({ id: 'gone' }));
		savedCollegesStore.remove('gone');
		savedCollegesStore.refresh();
		expect(savedCollegesStore.colleges.some((c) => c.id === 'gone')).toBe(false);
	});
});

// --- refresh ---

describe('refresh', () => {
	it('reloads colleges from storage', () => {
		savedCollegesStore.save(makeSavedCollege({ id: 'r1' }));
		savedCollegesStore.save(makeSavedCollege({ id: 'r2' }));
		savedCollegesStore.refresh();
		expect(savedCollegesStore.colleges).toHaveLength(2);
	});

	it('reflects an empty store after storage is cleared', () => {
		savedCollegesStore.save(makeSavedCollege());
		localStorage.clear();
		savedCollegesStore.refresh();
		expect(savedCollegesStore.colleges).toEqual([]);
	});
});
