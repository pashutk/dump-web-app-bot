<script lang="ts">
	import { onMount } from 'svelte';
	import type { TelegramWebApps } from '../tg';
	import * as E from '@effect/data/Either';

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

	let entries: AsyncData<string, { text: string }[]> = { type: 'idle' };

	let diff = 0;
	onMount(async () => {
		app = Telegram.WebApp;

		diff = Date.now() - start;
		Telegram.WebApp.ready();

		const initData = app.initData;

		const result = await fetch('/api/entries', {
			method: 'POST',
			body: JSON.stringify({ initData }),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		}).then((a) => a.json());

		entries = E.match(
			(e: string) => ({ type: 'error', data: e } as const),
			(data: { text: string }[]) => ({ type: 'loaded', data } as const)
		)(result);
	});
</script>

<h1>Welcome</h1>
<pre>{entries.type === 'loaded' ? entries.data.map((a) => a.text).join('\n') : 'Loading'}</pre>
