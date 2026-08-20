<script lang="ts">
  import type { EnhancedImgAttributes } from "@sveltejs/enhanced-img";

  type Props = Omit<EnhancedImgAttributes, "src"> & {
    src: string | EnhancedImgAttributes["src"];
  };

  const { class: className, src, alt = "", loading = "lazy", fetchpriority = "auto" }: Props = $props();
</script>

{#if typeof src === "string"}
  <img class={className} {src} {alt} sizes="min(1280px, 100vw)" {loading} {fetchpriority} />
{:else}
  <enhanced:img class={className} {src} {alt} sizes="min(1280px, 100vw)" {loading} {fetchpriority} />
{/if}
