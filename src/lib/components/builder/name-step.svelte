<script lang="ts">
	type Props = {
		name: string;
		onnamechange: (name: string) => void;
		onnext: () => void;
	};

	const { name, onnamechange, onnext }: Props = $props();

	const isValid = $derived(name.trim().length > 0);

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && isValid) onnext();
	};
</script>

<div class="mx-auto max-w-md pt-16 text-center">
	<h2 class="mb-2 text-3xl font-bold">Name your College</h2>
	<p class="mb-8 text-slate-400">Every great warband needs a name.</p>

	<input
		type="text"
		value={name}
		oninput={(e) => onnamechange(e.currentTarget.value)}
		onkeydown={handleKeydown}
		placeholder="e.g. The Iron Scholars"
		class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-center text-lg text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
	/>

	<button
		onclick={onnext}
		disabled={!isValid}
		class="mt-6 rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
	>
		Next
	</button>
</div>
