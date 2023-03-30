<script lang="ts">
	import type { Entry } from '$lib/model';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let data: Entry;

	let id = data.text.slice('https://t.me/'.length);

	let x = writable<any>(null);
	onMount(async () => {
		const result = await fetch('/api/preview?id=' + id).then((a) => a.json());
		x.set(result);
	});

	$: title = $x
		? new DOMParser().parseFromString($x.title, 'text/html').documentElement.textContent
		: null;
</script>

<button
	on:click={() => {
		Telegram.WebApp.openTelegramLink(data.text);
	}}
	class="gap-4 bg-tg-bg p-4 rounded-md flex flex-row items-center"
>
	{#if $x}
		<div class="h-10 w-10">
			<img src={$x?.image} alt="Chat pic" class="rounded-full object-contain" />
		</div>
	{/if}
	<div class="text-left">{title ?? data.text.slice('https://t.me/'.length)}</div>
</button>
