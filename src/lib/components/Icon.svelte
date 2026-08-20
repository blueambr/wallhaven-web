<script lang="ts">
  import type { Icon as IconType } from "@lucide/svelte";
  import type { Component } from "svelte";
  import type { SVGAttributes } from "svelte/elements";

  type Props = {
    class?: string;
    size?: number;
  } & ({ i: typeof IconType; svg?: never } | { i?: never; svg: Component<SVGAttributes<SVGSVGElement>> });

  const { class: className, i: Icon, svg: Svg, size = 28 }: Props = $props();
</script>

{#if Icon}
  <Icon class={className} {size} strokeWidth={1.5} />
{:else if Svg}
  <Svg class={className} width={size} height={size} />
{/if}
