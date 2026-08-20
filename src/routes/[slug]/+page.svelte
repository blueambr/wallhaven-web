<script lang="ts">
  import { page } from "$app/state";
  import Grid from "$lib/components/Grid.svelte";
  import Head from "$lib/components/Head.svelte";
  import Headline from "$lib/components/Headline.svelte";
  import { apiSearchUrl, site } from "$lib/config";
  import { apiKey } from "$lib/stores/apiKey.svelte";
  import { filters } from "$lib/stores/filters.svelte";
  import { Effect, pipe } from "effect";
  import { untrack } from "svelte";
  import { SvelteURLSearchParams } from "svelte/reactivity";
  import type { PageProps } from "./$types";

  let wallpapers = $state<App.WallpaperSearch[]>([]);
  let currentPage = $state(1);
  let lastPage = $state(false);
  let loading = $state(false);

  const { data }: PageProps = $props();
  const { name, description, cover, queryParams } = data;

  const query = (pageNum: number) => {
    const params = new SvelteURLSearchParams({
      apikey: apiKey.state,
      ...queryParams,
      ...filters.queryParams,
      page: pageNum.toString(),
    });

    return `${apiSearchUrl}?${params.toString()}`;
  };

  const getWallpapers = (pageNum: number) =>
    Effect.tryPromise({
      try: () => fetch(query(pageNum)).then((res) => res.json()),
      catch: (error) => new Error(`‼️ getWallpapers: ${error}`),
    });

  const addWallpapers = (pageNum: number, reset = false) => {
    if (loading) return;

    loading = true;

    if (reset) {
      wallpapers = [];
      currentPage = 1;
      lastPage = false;
    }

    Effect.runPromise(
      pipe(
        getWallpapers(pageNum),
        Effect.tap(({ data, meta }) => {
          const { current_page, last_page } = meta;

          wallpapers = [...wallpapers, ...data];
          currentPage = current_page;
          lastPage = currentPage === last_page;
        }),
        Effect.catchAll((error) =>
          Effect.sync(() => {
            console.error(error);
          }),
        ),
        Effect.ensuring(
          Effect.sync(() => {
            loading = false;
          }),
        ),
      ),
    );
  };

  const addNextPage = () => {
    if (!loading && !lastPage) addWallpapers(currentPage + 1, false);
  };

  $effect(() => {
    void page.params.slug;
    void filters.queryParams;

    untrack(() => {
      addWallpapers(1, true);
    });
  });

  const title = `${name} ${site.title_postfix}`;
  const schema = {
    "@type": "CollectionPage",
    name: title,
    description,
    image: `${site.url}${cover}`,
    mainEntity: {
      "@type": "ItemList",
      name: title,
      description,
    },
  };
</script>

<Head
  meta={{
    title,
    description,
    image: `${site.url}${cover}`,
    keywords: `${name.toLowerCase()}, ${site.keywords}`,
    schema,
  }}
/>

<Headline>{name}</Headline>
<Grid {wallpapers} {addNextPage} {loading} />
