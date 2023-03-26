<script lang="ts">
	import type { RemoteData } from '$lib/stores';

	type E = $$Generic;
	type A = $$Generic;
	export let data: RemoteData<E, A>;
</script>

{#if data.type === 'loading'}
	<slot name="loading" />
{:else if data.type === 'loaded'}
	<slot name="loaded" />
{:else if data.type === 'error'}
	<slot name="error" />
{/if}
