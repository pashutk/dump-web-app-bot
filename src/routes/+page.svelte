<script lang="ts">
	import { onMount } from 'svelte';
	import type { TelegramWebApps } from '../tg';
	const start = Date.now();

	let app: TelegramWebApps.WebApp | null = null;

	let diff = 0;
	onMount(() => {
		app = Telegram.WebApp;

		diff = Date.now() - start;
		Telegram.WebApp.ready();
	});
</script>

<h1>Welcome to SvelteKit</h1>
<pre>{JSON.stringify(app?.initDataUnsafe, null, 2)}</pre>
<pre>start: {start}, diff: {diff}</pre>
