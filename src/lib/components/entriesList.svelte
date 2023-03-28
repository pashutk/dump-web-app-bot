<script lang="ts">
	import type { Entry } from '$lib/model';
	import EntryItem from './entryItem.svelte';

	export let data: readonly Entry[];
</script>

<div class="flex flex-col gap-2 m-4">
	{#each data as entry}
		<EntryItem data={entry} />
	{/each}
</div>
