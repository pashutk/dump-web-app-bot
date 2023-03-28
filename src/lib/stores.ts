import { pipe } from '@effect/data/Function';
import * as S from '@effect/schema/Schema';
import { onMount } from 'svelte';
import { writable, type Readable, type Subscriber, type Writable } from 'svelte/store';
import type { Endpoint } from '$lib/endpoint';
import * as Effect from '@effect/io/Effect';
import * as E from '@effect/data/Either';

export type RemoteData<E, A> =
	| {
			type: 'loading';
	  }
	| {
			type: 'loaded';
			data: A;
	  }
	| {
			type: 'error';
			error: E;
	  };

const loading = <E, A>(): RemoteData<E, A> => ({
	type: 'loading'
});

export const remoteData = <E, A>() => writable(loading<E, A>());

export const fetchPromise =
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

export const fetchEndpoint =
	<I1, O1, I2, O2>(path: string, endpoint: Endpoint<I1, O1, I2, O2>) =>
	(input: I2): Effect.Effect<never, string, O2> => {
		return pipe(
			Effect.attemptCatchPromise(
				() => fetchPromise(path, endpoint)(input),
				(reason) => `Failed to fetch ${path}`
			),
			Effect.flatMap(Effect.fromEither)
		);
	};

export const autoFetchable =
	<I1, O1, I2, O2>(path: string, endpoint: Endpoint<I1, O1, I2, O2>) =>
	(input: I2): Readable<RemoteData<string, O2>> => {
		let state: RemoteData<string, O2> = {
			type: 'loading'
		};

		const fetcher = fetchPromise(path, endpoint);

		return {
			subscribe: (run, invalidate) => {
				run(state);

				onMount(() => {
					fetcher(input).then((data) => {
						run(
							pipe(
								data,
								E.match(
									(error) => ({ type: 'error', error }),
									(data) => ({ type: 'loaded', data })
								)
							)
						);
					});
				});

				return () => {
					console.log('destroy');
				};
			}
		};
	};

export const lazyMount = <E, A>(
	mountEff: Effect.Effect<never, E, A>
): Writable<RemoteData<E, A>> => {
	const store = remoteData<E, A>();
	onMount(() => {
		Effect.runPromiseEither(mountEff).then(
			E.match(
				(error) => store.set({ type: 'error', error }),
				(data) => store.set({ type: 'loaded', data })
			)
		);
	});
	return store;
};

export const toPromise = <E, A>(remoteData: RemoteData<E, A>): Promise<A> => {
	return remoteData.type === 'loading'
		? new Promise(() => {})
		: remoteData.type === 'error'
		? Promise.reject(remoteData.error)
		: Promise.resolve(remoteData.data);
};
