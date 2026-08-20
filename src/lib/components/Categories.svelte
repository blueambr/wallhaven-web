<script lang="ts">
  import Image from "$lib/components/Image.svelte";
  import { categories } from "$lib/data";
</script>

<section>
  <div class="container">
    <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {#each categories as { id, name, slug, cover } (id)}
        <li>
          <a href="/{slug}" class="group relative block aspect-square overflow-hidden rounded-xl">
            <Image
              class="size-full object-cover transition duration-2000 group-hover:scale-110"
              src={cover}
              alt={name}
            />
            <div
              class="absolute bottom-0 left-0 flex h-1/2 w-full flex-col justify-end bg-linear-to-t from-secondary/70 to-transparent"
            >
              <h2 class="px-4 py-3 text-xl font-semibold">
                {name}
              </h2>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</section>
