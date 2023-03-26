<script lang="ts">
	import { onMount } from 'svelte';
	import type { TelegramWebApps } from '../tg';
	import * as E from '@effect/data/Either';
	import { entries, type Endpoint } from '$lib/endpoint';
	import * as Effect from '@effect/io/Effect';
	import * as S from '@effect/schema/Schema';
	import { pipe } from '@effect/data/Function';

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

	const fetchEndpoint =
		<I1, O1, I2, O2>(path: string, endpoint: Endpoint<I1, O1, I2, O2>) =>
		(input: I2): Effect.Effect<never, string, E.Either<string, O2>> => {
			return pipe(
				Effect.attemptCatchPromise(
					() => fetchPromise(path, endpoint)(input),
					(reason) => `Failed to fetch ${path}`
				)
			);
		};

	const fetcher = fetchPromise('/api/entries', entries);

	type AsyncData<E, A> =
		| {
				type: 'idle';
		  }
		| {
				type: 'loading';
		  }
		| {
				type: 'loaded';
				data: A;
		  }
		| {
				type: 'error';
				data: E;
		  };

	const start = Date.now();

	let app: TelegramWebApps.WebApp | null = null;

	let a: E.Either<string, readonly any[]> = E.right([]);

	let diff = 0;
	onMount(async () => {
		app = Telegram.WebApp;

		diff = Date.now() - start;
		Telegram.WebApp.ready();

		const initData = app.initData;

		const data = await fetcher({ initData });

		a = data;
	});

	$: r = pipe(
		a,
		E.match(
			(err) => `Error: ${err}`,
			(d) => d.map((a) => a.text).join('\n')
		)
	);
</script>

<h1>Welcome</h1>
<!-- <pre>{JSON.stringify(a, null, 2)}</pre> -->
<pre>{r}</pre>
<!-- <pre>{entries.type === 'loaded' ? entries.data.map((a) => a.text).join('\n') : 'Loading'}</pre> -->
