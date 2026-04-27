<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Aetherpunk 28 &mdash; College Builder</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center px-4">
	<h1 class="mb-2 text-5xl font-bold tracking-tight text-amber-400">Aetherpunk 28</h1>
	<p class="mb-12 text-lg text-slate-400">College Builder</p>

	<a
		href={resolve('/builder')}
		class="rounded-lg bg-amber-500 px-8 py-4 text-lg font-semibold text-slate-950 transition hover:bg-amber-400"
	>
		Create a College
	</a>
</div>
