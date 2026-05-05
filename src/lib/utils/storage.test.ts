import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SavedCollege } from '../types/game.types';
import { storage } from './storage';

// --- localStorage mock ---

const createLocalStorageMock = () => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
};

let localStorageMock = createLocalStorageMock();

const STORAGE_KEY = 'a28-saved-colleges';

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
	localStorageMock = createLocalStorageMock();
	vi.stubGlobal('window', {});
	vi.stubGlobal('localStorage', localStorageMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

// --- storage.load ---

describe('storage.load', () => {
	it('returns an empty array when localStorage has no data', () => {
		expect(storage.load()).toEqual([]);
	});

	it('returns parsed colleges from localStorage', () => {
		const colleges = [makeSavedCollege()];
		localStorageMock.setItem(STORAGE_KEY, JSON.stringify(colleges));
		expect(storage.load()).toEqual(colleges);
	});

	it('returns an empty array when localStorage contains invalid JSON', () => {
		localStorageMock.setItem(STORAGE_KEY, 'not-valid-json{');
		expect(storage.load()).toEqual([]);
	});

	it('returns an empty array in a non-browser environment', () => {
		vi.unstubAllGlobals();
		expect(storage.load()).toEqual([]);
	});
});

// --- storage.save ---

describe('storage.save', () => {
	it('serialises and writes colleges to localStorage', () => {
		const colleges = [makeSavedCollege()];
		storage.save(colleges);
		expect(JSON.parse(localStorageMock.getItem(STORAGE_KEY)!)).toEqual(colleges);
	});

	it('overwrites any existing data', () => {
		const initial = [makeSavedCollege({ id: 'a' })];
		storage.save(initial);

		const updated = [makeSavedCollege({ id: 'b' })];
		storage.save(updated);

		expect(JSON.parse(localStorageMock.getItem(STORAGE_KEY)!)).toEqual(updated);
	});

	it('writes an empty array when given an empty list', () => {
		storage.save([]);
		expect(JSON.parse(localStorageMock.getItem(STORAGE_KEY)!)).toEqual([]);
	});
});

// --- storage.addCollege ---

describe('storage.addCollege', () => {
	it('adds a new college when none exist', () => {
		const college = makeSavedCollege();
		storage.addCollege(college);
		expect(storage.load()).toEqual([college]);
	});

	it('appends a college with a new id to the existing list', () => {
		const first = makeSavedCollege({ id: 'a' });
		const second = makeSavedCollege({ id: 'b' });
		storage.addCollege(first);
		storage.addCollege(second);
		expect(storage.load()).toHaveLength(2);
	});

	it('updates an existing college with the same id', () => {
		const original = makeSavedCollege({ id: 'x', name: 'Original' });
		storage.addCollege(original);

		const updated = makeSavedCollege({ id: 'x', name: 'Updated' });
		storage.addCollege(updated);

		const all = storage.load();
		expect(all).toHaveLength(1);
		expect(all[0].name).toBe('Updated');
	});
});

// --- storage.removeCollege ---

describe('storage.removeCollege', () => {
	it('removes the college with the given id', () => {
		storage.addCollege(makeSavedCollege({ id: 'a' }));
		storage.addCollege(makeSavedCollege({ id: 'b' }));

		storage.removeCollege('a');

		const all = storage.load();
		expect(all).toHaveLength(1);
		expect(all[0].id).toBe('b');
	});

	it('does nothing when the id does not exist', () => {
		storage.addCollege(makeSavedCollege({ id: 'a' }));
		storage.removeCollege('nonexistent');
		expect(storage.load()).toHaveLength(1);
	});

	it('results in an empty list when the only college is removed', () => {
		storage.addCollege(makeSavedCollege({ id: 'only' }));
		storage.removeCollege('only');
		expect(storage.load()).toEqual([]);
	});
});

// --- storage.findById ---

describe('storage.findById', () => {
	it('returns the college matching the given id', () => {
		const college = makeSavedCollege({ id: 'target' });
		storage.addCollege(college);
		expect(storage.findById('target')).toEqual(college);
	});

	it('returns undefined when the id does not exist', () => {
		storage.addCollege(makeSavedCollege({ id: 'other' }));
		expect(storage.findById('missing')).toBeUndefined();
	});

	it('returns undefined when storage is empty', () => {
		expect(storage.findById('anything')).toBeUndefined();
	});
});
