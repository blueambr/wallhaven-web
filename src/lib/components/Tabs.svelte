<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import { Funnel, House, Menu } from "@lucide/svelte";
  import { onMount } from "svelte";

  const deadzoneThreshold = 200;
  let tabs = $state<HTMLElement | null>(null);
  let lastScrollY = 0;
  let scrollDownStartY = 0;
  let scrollUpStartY = 0;

  const hide = () => {
    if (tabs) {
      tabs.style.opacity = "0";
      tabs.style.transform = `translateY(${tabs.offsetHeight + 20}px)`;
    }
  };

  const show = () => {
    if (tabs) {
      tabs.style.opacity = "1";
      tabs.style.transform = "translateY(0px)";
    }
  };

  onMount(() => {
    scrollDownStartY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 100) {
        lastScrollY = currentScrollY;
        show();

        return;
      }

      if (currentScrollY - lastScrollY > 0) {
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

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<header class="tabs" data-tabs bind:this={tabs}>
  <nav class="grid w-full grid-cols-3 items-center gap-2">
    <Button variant="ghost" icon={Menu} type="button" title="Menu" data-toggle-menu onclick={hide}></Button>
    <Button variant="ghost" href="/" icon={House} title="Home"></Button>
    <Button variant="ghost" icon={Funnel} type="button" title="Filters" data-toggle-filters onclick={hide}></Button>
  </nav>
</header>
