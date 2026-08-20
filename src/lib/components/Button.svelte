<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import type { Icon as IconType } from "@lucide/svelte";
  import { cva, type VariantProps } from "class-variance-authority";
  import type { Snippet } from "svelte";

  interface Props extends VariantProps<typeof va> {
    class?: string;
    href?: string;
    label?: string;
    icon?: typeof IconType;
    iconSize?: number;
    children?: Snippet;
    [key: string]: unknown;
  }

  const { variant, option, enabled, class: cls, href, label, icon, iconSize, children, ...rest }: Props = $props();

  const tag = $derived(href ? "a" : "button");

  const compoundBgLabel: string = $derived(label ? "px-5 py-2.5" : "p-2.5");
  const va = $derived(
    cva("flex cursor-pointer items-center gap-2 rounded-full border-2 transition select-none", {
      variants: {
        variant: {
          absolute: "absolute top-1/2 right-1 -translate-y-1/2 p-2 hover:bg-secondary-light",
          bg: "bg-secondary-light/50 shadow-lg hover:bg-secondary-dark",
          ghost: "justify-center p-3 hover:bg-secondary-dark",
        },
        option: {
          full: "w-full",
        },
        enabled: {
          false: "border-transparent",
          true: "border-primary",
        },
      },
      compoundVariants: [{ variant: "bg", class: compoundBgLabel }],
      defaultVariants: {
        variant: "bg",
        enabled: false,
      },
    }),
  );
</script>

<svelte:element this={tag} class={va({ variant, option, enabled, class: cls })} {href} title={label} {...rest}>
  {#if icon}
    <Icon class="shrink-0" i={icon} size={iconSize} />
  {/if}
  {#if label}
    <span class="truncate">
      {label}
    </span>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</svelte:element>
