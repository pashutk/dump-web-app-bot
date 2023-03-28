<script lang="ts">
	import type { Entry } from '$lib/model';
	import EntryItemTgLink from './entryItemTgLink.svelte';

	export let data: Entry;
</script>

{#if data.text.startsWith('https://t.me/')}
	<EntryItemTgLink {data} />
{:else}
	<div class="gap-4 bg-tg-bg p-4 rounded-md">{data.text}</div>
{/if}
