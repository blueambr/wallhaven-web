<script lang="ts">
  import { page } from "$app/state";
  import Head from "$lib/components/Head.svelte";
  import Headline from "$lib/components/Headline.svelte";

  const { status } = page;
</script>

<Head meta={{ title: `Wrong Way: ${status}` }} />

<Headline>Wrong Way</Headline>
<span class="fixed top-1/2 left-1/2 -z-1 -translate-1/2 text-9xl font-semibold text-secondary-mid select-none">
  {status}
</span>
