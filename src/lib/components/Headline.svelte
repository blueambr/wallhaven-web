<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Search from "$lib/components/Search.svelte";
  import { ChevronLeft, MoveUp } from "@lucide/svelte";
  import { cx } from "class-variance-authority";
  import { onMount, type Snippet } from "svelte";

  interface Props {
    backButton?: boolean;
    narrowContainer?: boolean;
    children: Snippet;
  }

  const { backButton = true, narrowContainer, children }: Props = $props();

  const showBackButton = $derived(backButton && page.url.pathname !== "/");

  const deadzoneThreshold = 200;
  let headline: HTMLElement;
  let headlineSticky: HTMLElement;
  let lastScrollY = 0;
  let scrollDownStartY = 0;
  let scrollUpStartY = 0;

  const hide = () => {
    headlineSticky.style.opacity = "0";
    headlineSticky.style.transform = `translateY(-${headlineSticky.offsetHeight + 20}px)`;
  };

  const show = () => {
    headlineSticky.style.opacity = "1";
    headlineSticky.style.transform = "translateY(0px)";
  };

  onMount(() => {
    scrollDownStartY = window.scrollY;
    hide();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > headline.offsetHeight) {
        if (currentScrollY > lastScrollY) {
          if (currentScrollY - scrollDownStartY > deadzoneThreshold) {
            scrollUpStartY = currentScrollY;
            hide();
          }
        } else {
          if (scrollUpStartY - currentScrollY > deadzoneThreshold) {
            scrollDownStartY = currentScrollY;
            show();
          }
        }
      } else {
        hide();
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  const back = () => {
    const segments = page.url.pathname.split("/").filter(Boolean);

    if (segments.length > 0) {
      const parentPath = segments.length === 1 ? "/" : "/" + segments.slice(0, -1).join("/");

      goto(parentPath);
    }
  };
</script>

<section bind:this={headline}>
  <div class={cx("container", narrowContainer && "max-w-3xl")}>
    {#if showBackButton}
      <Button variant="ghost" class="mb-1 p-1!" icon={ChevronLeft} type="button" title="Go Back" onclick={back}
      ></Button>
    {/if}
    <div class={cx("grid gap-6 md:gap-8", !narrowContainer && "md:grid-cols-2 lg:grid-cols-3")}>
      <h1 class="text-[42px] font-semibold lg:col-span-2">
        {@render children()}
      </h1>
      {#if !narrowContainer}
        <Search class="md:mt-1.5" />
      {/if}
    </div>
    {#if !narrowContainer}
      <a class="group mt-4 block" href="/wallhaven">
        <span class="hover-line">Wallhaven can't process your request?</span>
      </a>
    {/if}
  </div>
</section>

<section
  class={cx(
    "fixed top-2.5 left-12 z-10 flex w-[calc(100%-6rem)] items-center gap-2 rounded-full bg-secondary-dark/50 px-4 py-2 opacity-0 shadow-lg  backdrop-blur-md backdrop-saturate-150 transition max-md:duration-500 sm:left-1/2 sm:w-full sm:max-w-fit sm:min-w-60 sm:-translate-x-1/2",
    narrowContainer ? "left-6" : "left-12",
  )}
  bind:this={headlineSticky}
>
  {#if showBackButton}
    <Button variant="ghost" class="p-1!" icon={ChevronLeft} type="button" title="Go Back" onclick={back}></Button>
  {/if}
  <button
    class={cx("group flex grow cursor-pointer justify-center gap-2 py-3.5 select-none", !showBackButton && "pl-12")}
    type="button"
    title="Scroll to the Top"
    onclick={() =>
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })}
  >
    <h1 class="text-xl font-semibold">
      {@render children()}
    </h1>
    <div class="flex w-10 items-center">
      <Icon
        class="translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100"
        i={MoveUp}
        size={18}
      />
    </div>
  </button>
</section>
