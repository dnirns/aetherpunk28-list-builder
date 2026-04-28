import type { SavedCollege } from '$lib/types/game.types';
import { storage } from '$lib/utils/storage';

const createSavedCollegesStore = () => {
	let colleges = $state<SavedCollege[]>([]);

	const refresh = () => {
		colleges = storage.load();
	};

	const save = (college: SavedCollege) => {
		storage.addCollege(college);
		refresh();
	};

	const remove = (id: string) => {
		storage.removeCollege(id);
		refresh();
	};

	return {
		get colleges() {
			return colleges;
		},
		refresh,
		save,
		remove
	};
};

export const savedCollegesStore = createSavedCollegesStore();
