<script lang="ts">
  import Categories from "$lib/components/Categories.svelte";
  import Head from "$lib/components/Head.svelte";
  import Headline from "$lib/components/Headline.svelte";
  import { site } from "$lib/config";
  import { categories } from "$lib/data";

  const schema = {
    "@type": "CollectionPage",
    name: site.name,
    description: site.description,
    url: site.url,
    image: `${site.url}${site.og_image}`,
    mainEntity: {
      "@type": "ItemList",
      name: "Categories",
      itemListElement: categories.map(({ name, slug }, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name,
          url: `${site.url}/${slug}`,
        },
      })),
    },
  };
</script>

<Head meta={{ schema }} />

<Headline>
  <img class="w-full max-w-80 min-w-48" src="/logo.svg" alt="Wallpapers lite" />
  <div class="sr-only">Wallpapers lite</div>
</Headline>
<Categories />
