<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Image from "$lib/components/Image.svelte";
  import Spinner from "$lib/components/Spinner.svelte";
  import { filters } from "$lib/stores/filters.svelte";
  import { createColumns } from "$lib/utilities";
  import { BrushCleaning, ChevronLeft, SearchX, TriangleAlert } from "@lucide/svelte";
  import { onMount, untrack } from "svelte";

  interface Props {
    wallpapers: App.WallpaperSearch[];
    addNextPage: () => void;
    loading: boolean;
    rateLimited: boolean;
  }

  const { wallpapers = [], addNextPage, loading, rateLimited }: Props = $props();

  const mobileColumns = $derived(createColumns(wallpapers, 1));
  const tabletColumns = $derived(createColumns(wallpapers, 2));
  const desktopColumns = $derived(createColumns(wallpapers, 3));

  let mobileColumnsRef = $state() as HTMLUListElement;
  let tabletColumnsRef: HTMLLIElement[] = [];
  let desktopColumnsRef: HTMLLIElement[] = [];

  const MAX_EMPTY_PAGES = 3;
  const MIN_WALLPAPERS_TARGET = 6;

  let initialLoading = $state(true);
  let lastWallpaperCount = 0;
  let consecutiveEmptyPages = 0;

  const tabletColumnAction = (node: HTMLLIElement, index: number) => {
    tabletColumnsRef[index] = node;
    return {
      destroy() {
        delete tabletColumnsRef[index];
      },
    };
  };

  const desktopColumnAction = (node: HTMLLIElement, index: number) => {
    desktopColumnsRef[index] = node;
    return {
      destroy() {
        delete desktopColumnsRef[index];
      },
    };
  };

  const handleEmptyPages = () => {
    const currentCount = wallpapers.length;
    const newWallpapersAdded = currentCount - lastWallpaperCount;

    if (newWallpapersAdded === 0 && lastWallpaperCount > 0) {
      consecutiveEmptyPages++;
    } else {
      consecutiveEmptyPages = 0;
    }

    lastWallpaperCount = currentCount;

    if (wallpapers.length < MIN_WALLPAPERS_TARGET && consecutiveEmptyPages < MAX_EMPTY_PAGES) {
      addNextPage();
    }
  };

  const handleScroll = () => {
    const { scrollY, innerHeight, innerWidth } = window;
    const scrollBottom = scrollY + innerHeight;

    let currentColumns: HTMLUListElement[] | HTMLLIElement[];

    if (innerWidth >= 1024) {
      currentColumns = desktopColumnsRef;
    } else if (innerWidth >= 640) {
      currentColumns = tabletColumnsRef;
    } else {
      currentColumns = mobileColumnsRef ? [mobileColumnsRef] : [];
    }

    if (currentColumns.length === 0) return;

    const shortestScrollBottom = Math.min(
      ...currentColumns.map((col) => {
        if (!col) return 0;
        const { bottom } = col.getBoundingClientRect();
        return bottom + scrollY;
      }),
    );

    if (scrollBottom + 400 >= shortestScrollBottom) {
      addNextPage();
    }
  };

  $effect(() => {
    void loading;

    untrack(() => {
      if (initialLoading) initialLoading = false;
    });
  });

  $effect(() => {
    void wallpapers.length;

    untrack(() => setTimeout(handleEmptyPages, 100));
  });

  onMount(() => {
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

<section>
  <div class="container">
    {#if wallpapers.length}
      <ul class="flex flex-col gap-6 sm:hidden" bind:this={mobileColumnsRef}>
        {#each mobileColumns[0] as { id, thumbs } (id)}
          <li>
            <a class="group block overflow-hidden rounded-xl" href="/w/{id}" target="_blank" rel="noopener noreferrer">
              <Image class="w-full object-cover transition duration-2000 group-hover:scale-110" src={thumbs.original} />
            </a>
          </li>
        {/each}
      </ul>
      <ul class="hidden grid-cols-2 gap-4 sm:grid lg:hidden">
        {#each tabletColumns as column, i (i)}
          <li class="flex h-fit flex-col gap-6" use:tabletColumnAction={i}>
            {#each column as { id, thumbs } (id)}
              <a
                class="group block overflow-hidden rounded-xl"
                href="/w/{id}"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  class="w-full object-cover transition duration-2000 group-hover:scale-110"
                  src={thumbs.original}
                />
              </a>
            {/each}
          </li>
        {/each}
      </ul>
      <ul class="hidden grid-cols-3 gap-4 lg:grid">
        {#each desktopColumns as column, i (i)}
          <li class="flex h-fit flex-col gap-6" use:desktopColumnAction={i}>
            {#each column as { id, thumbs } (id)}
              <a
                class="group block overflow-hidden rounded-xl"
                href="/w/{id}"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  class="w-full object-cover transition duration-2000 group-hover:scale-110"
                  src={thumbs.original}
                />
              </a>
            {/each}
          </li>
        {/each}
      </ul>
    {:else if rateLimited}
      <div class="flex flex-col items-center gap-16 text-center">
        <div class="flex flex-col items-center gap-3 text-center">
          <Icon i={TriangleAlert} size={48} />
          <h2 class="text-2xl font-semibold">Wallhaven can't process your request</h2>
          <p>Wait a minute and try again, please.</p>
        </div>
        <Button label="Go Back" icon={ChevronLeft} iconSize={24} type="button" onclick={back}></Button>
      </div>
    {:else if !loading && !initialLoading}
      <div class="flex flex-col items-center gap-16 text-center">
        <div class="flex flex-col items-center gap-3">
          <Icon i={SearchX} size={48} />
          <h2 class="text-2xl font-semibold">No wallpapers found</h2>
          <p>Try adjusting your search query or filters to get results.</p>
        </div>
        <Button label="Clear Filters" icon={BrushCleaning} iconSize={24} type="button" onclick={() => filters.reset()}
        ></Button>
      </div>
    {:else}
      <Spinner />
    {/if}
  </div>
</section>
