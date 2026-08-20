<script lang="ts">
  import { page } from "$app/state";
  import Filters from "$lib/components/Filters.svelte";
  import Menu from "$lib/components/Menu.svelte";
  import Tabs from "$lib/components/Tabs.svelte";
  import "@/app.css";
  import { cx } from "class-variance-authority";

  const wallpaperPage = $derived(page.url.pathname.startsWith("/w/"));
  const termsPage = $derived(page.url.pathname.startsWith("/terms"));
  const { children } = $props();
</script>

<div
  class="fixed top-0 -z-2 h-screen w-screen bg-secondary-dark bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(42,90,70,1),rgba(255,255,255,0))]"
></div>
<main class={cx(!wallpaperPage && "grid gap-8 py-8")}>
  {@render children()}
</main>
{#if !wallpaperPage && !termsPage}
  <Tabs />
  <Menu />
  <Filters />
{/if}
