import type { SavedCollege } from '$lib/types/game.types';

const STORAGE_KEY = 'a28-saved-colleges';

export const storage = {
	load: (): SavedCollege[] => {
		if (typeof window === 'undefined') return [];

		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];

		try {
			return JSON.parse(raw) as SavedCollege[];
		} catch {
			return [];
		}
	},

	save: (colleges: SavedCollege[]) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(colleges));
	},

	addCollege: (college: SavedCollege) => {
		const colleges = storage.load();
		const existing = colleges.findIndex((c) => c.id === college.id);

		if (existing >= 0) {
			colleges[existing] = college;
		} else {
			colleges.push(college);
		}

		storage.save(colleges);
	},

	removeCollege: (id: string) => {
		const colleges = storage.load().filter((c) => c.id !== id);
		storage.save(colleges);
	},

	findById: (id: string): SavedCollege | undefined => {
		return storage.load().find((c) => c.id === id);
	}
};
