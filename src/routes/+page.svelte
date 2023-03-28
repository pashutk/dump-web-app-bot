<script lang="ts">
	import { onMount } from 'svelte';
	import { entries } from '$lib/endpoint';
	import * as Effect from '@effect/io/Effect';
	import { pipe } from '@effect/data/Function';
	import { fetchEndpoint, lazyMount, toPromise } from '$lib/stores';
	import Loader from '$lib/components/loader.svelte';
	import EntriesList from '$lib/components/entriesList.svelte';

	const entriesList = lazyMount(
		pipe(
			Effect.sync(() => Telegram.WebApp.initData),
			Effect.map((initData) => ({ initData })),
			Effect.flatMap(fetchEndpoint('/api/entries', entries))
		)
	);

	$: entriesListPromise = toPromise($entriesList);

	onMount(() => {
		Telegram.WebApp.ready();
	});
</script>

{#await entriesListPromise}
	<Loader />
{:then data}
	<EntriesList {data} />
{:catch err}
	Error: {err.toString()}
{/await}
