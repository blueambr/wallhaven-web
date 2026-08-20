<script lang="ts">
  import { page as pageState } from "$app/state";
  import Grid from "$lib/components/Grid.svelte";
  import Head from "$lib/components/Head.svelte";
  import Headline from "$lib/components/Headline.svelte";
  import { apiSearchUrl, site } from "$lib/config";
  import { apiKey } from "$lib/stores/apiKey.svelte";
  import { filters } from "$lib/stores/filters.svelte";
  import { Effect, pipe } from "effect";
  import { untrack } from "svelte";
  import { SvelteURLSearchParams } from "svelte/reactivity";

  const searchParams = $derived(Object.fromEntries(pageState.url.searchParams));
  let wallpapers = $state<App.WallpaperSearch[]>([]);
  let currentPage = $state(1);
  let lastPage = $state(false);
  let loading = $state(false);

  const query = (page: number) => {
    const params = new SvelteURLSearchParams({
      apikey: apiKey.state,
      ...searchParams,
      ...filters.queryParams,
      page: page.toString(),
    });

    return `${apiSearchUrl}?${params.toString()}`;
  };

  const getWallpapers = (page: number) =>
    Effect.tryPromise({
      try: () => fetch(query(page)).then((res) => res.json()),
      catch: (error) => new Error(`‼️ getWallpapers: ${error}`),
    });

  const addWallpapers = (page: number, reset = false) => {
    if (loading) return;

    loading = true;

    if (reset) {
      wallpapers = [];
      currentPage = 1;
      lastPage = false;
    }

    Effect.runPromise(
      pipe(
        getWallpapers(page),
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
    void searchParams;
    void filters.queryParams;

    untrack(() => {
      addWallpapers(1, true);
    });
  });

  const searchTerm = $derived(searchParams.q || "Search");
  const title = $derived(`${searchTerm} ${site.title_postfix}`);
  const schema = {
    "@type": "SearchResultsPage",
    name: `Search ${site.title_postfix}`,
    description: site.description,
    image: `${site.url}${site.og_image}`,
    mainEntity: {
      "@type": "ItemList",
      name: `Search`,
      description: site.description,
    },
  };
</script>

<Head meta={{ title, schema }} />

<Headline>Search</Headline>
<Grid {wallpapers} {addNextPage} {loading} />
