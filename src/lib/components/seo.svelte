<script lang="ts">
	import {
		absoluteUrl,
		OG_IMAGE,
		OG_IMAGE_ALT,
		SITE_DESCRIPTION,
		SITE_NAME,
		SITE_URL
	} from '$lib/config/site';

	type Props = {
		/** Full <title> text, already including the site suffix. */
		title: string;
		description?: string;
		/** Route path used for the canonical URL, e.g. '/builder'. */
		path: string;
		/** Set for pages that hold user-specific state and should stay out of the index. */
		noindex?: boolean;
	};

	let { title, description = SITE_DESCRIPTION, path, noindex = false }: Props = $props();

	const canonical = $derived(absoluteUrl(path));
	const image = $derived(`${SITE_URL}${OG_IMAGE}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{:else}
		<meta name="robots" content="index, follow, max-image-preview:large" />
	{/if}

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={OG_IMAGE_ALT} />
	<meta property="og:locale" content="en_GB" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={OG_IMAGE_ALT} />
</svelte:head>
