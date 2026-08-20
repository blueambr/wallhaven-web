<script lang="ts">
  import Head from "$lib/components/Head.svelte";
  import Headline from "$lib/components/Headline.svelte";
  import RichText from "$lib/components/RichText.svelte";
  import { site } from "$lib/config";
  import content from "./index.html?raw";
</script>

<Head meta={{ title: `Wallhaven can't process your request? ${site.title_postfix}` }} />

<Headline narrowContainer>Wallhaven can't process your request?</Headline>
<RichText {content} />
