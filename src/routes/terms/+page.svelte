<script lang="ts">
  import Head from "$lib/components/Head.svelte";
  import Headline from "$lib/components/Headline.svelte";
  import RichText from "$lib/components/RichText.svelte";
  import { site } from "$lib/config";
  import content from "./index.html?raw";
</script>

<Head meta={{ title: `Terms and Policies ${site.title_postfix}` }} />

<Headline narrowContainer>Terms and Policies</Headline>
<RichText {content} />
