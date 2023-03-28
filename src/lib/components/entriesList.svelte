<script lang="ts">
	import type { Entry } from '$lib/model';

	export let data: readonly Entry[];
</script>

<div class="flex flex-col gap-2 m-4">
	{#each data as entry}
		<div
			on:click={() => {
				if (entry.text.startsWith('https://t.me/')) {
					Telegram.WebApp.openTelegramLink(entry.text);
				}
			}}
			class="gap-4 bg-tg-bg p-4 rounded-md"
		>
			{entry.text}
		</div>
	{/each}
</div>
