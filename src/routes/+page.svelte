<script lang="ts">
	import { onMount } from 'svelte';
	import type { TelegramWebApps } from '../tg';
	import * as E from '@effect/data/Either';
	import { entries, type Endpoint } from '$lib/endpoint';
	import * as Effect from '@effect/io/Effect';
	import * as S from '@effect/schema/Schema';
	import { pipe } from '@effect/data/Function';
	import { autoFetchable, remoteData } from '$lib/stores';
	import Rd from './rd.svelte';

	const fetchPromise =
		<I1, O1, I2, O2>(path: string, endpoint: Endpoint<I1, O1, I2, O2>) =>
		(input: I2): Promise<E.Either<string, O2>> =>
			fetch(path, {
				method: 'POST',
				body: JSON.stringify(pipe(input, S.encode(endpoint.input))),
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				}
			}).then((a) => a.json());

	const start = Date.now();

	let app: TelegramWebApps.WebApp | null = null;

	let rd = remoteData();

	onMount(() => {
		app = Telegram.WebApp;

		Telegram.WebApp.ready();

		const initData = app.initData;

		fetchPromise(
			'/api/entries',
			entries
		)({ initData }).then(
			E.match(
				(error) => rd.set({ type: 'error', error }),
				(data) => rd.set({ type: 'loaded', data })
			)
		);
	});

	$: g =
		$rd.type === 'loading'
			? new Promise(() => {})
			: $rd.type === 'error'
			? Promise.reject($rd.error)
			: Promise.resolve($rd.data);
</script>

<h1>Welcome</h1>
<pre>{$rd.type}</pre>
{#await g}
	Loading
{:then data}
	{JSON.stringify(data)}
{:catch err}
	Error: {err.toString()}
{/await}
