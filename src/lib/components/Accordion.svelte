<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { ChevronDown, type Icon as IconType } from "@lucide/svelte";
  import { cx } from "class-variance-authority";
  import { type Snippet } from "svelte";
  import { slide } from "svelte/transition";

  interface Props {
    open: boolean;
    label: string;
    icon: typeof IconType;
    ontoggle: () => void;
    children: Snippet;
  }

  let { icon, label, open, ontoggle, children }: Props = $props();
</script>

<li>
  <button
    class="group flex w-full cursor-pointer items-center justify-between gap-4 py-4"
    type="button"
    onclick={ontoggle}
  >
    <div class="flex items-center gap-4 transition group-hover:translate-x-2">
      <Icon class="shrink-0" i={icon} size={24} />
      <span>{label}</span>
    </div>
    <Icon class={cx("transition group-hover:-translate-x-2", open && "rotate-180")} i={ChevronDown} size={24} />
  </button>

  {#if open}
    <div transition:slide>
      {@render children()}
    </div>
  {/if}
</li>
