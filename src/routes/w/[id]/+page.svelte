<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Head from "$lib/components/Head.svelte";
  import Image from "$lib/components/Image.svelte";
  import Spinner from "$lib/components/Spinner.svelte";
  import { apiWallpaperUrl, site } from "$lib/config";
  import { apiKey } from "$lib/stores/apiKey.svelte";
  import { Download, House, SquareArrowOutUpRight } from "@lucide/svelte";
  import { Effect, pipe } from "effect";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const { id, wallpaper: ssrWallpaper } = data;

  let wallpaper = $state<App.Wallpaper | null>(ssrWallpaper || null);
  let loading = $derived(false);
  let menu = $state<HTMLElement | null>(null);
  let menuVisible = $state(true);
  let menuTimeout: number;

  const fetchWallpaper = () =>
    Effect.tryPromise({
      try: () => fetch(`${apiWallpaperUrl}/${id}?apikey=${apiKey.state}`).then((res) => res.json()),
      catch: (error) => new Error(`‼️ fetchWallpaper: ${error}`),
    });

  const fetchImageBlob = (url: string) =>
    Effect.tryPromise({
      try: () => fetch(`/api/wallhaven/proxy?url=${encodeURIComponent(url)}`).then((res) => res.blob()),
      catch: (error) => new Error(`‼️ fetchImageBlob: ${error}`),
    });

  const shareFile = (blob: Blob, filename: string) =>
    Effect.tryPromise({
      try: async () => {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file] });
            return true;
          }
        }
        return false;
      },
      catch: () => new Error("‼️ shareFile failed"),
    });

  const downloadFile = (blob: Blob, filename: string) =>
    Effect.sync(() => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    });

  const loadWallpaper = () => {
    if (loading) return;

    loading = true;

    Effect.runPromise(
      pipe(
        fetchWallpaper(),
        Effect.tap(({ data: wallpaperData }) => {
          wallpaper = wallpaperData;
        }),
        Effect.catchAll(() => Effect.void),
      ),
    ).finally(() => {
      loading = false;
    });
  };

  const handleDownload = (e: Event) => {
    e.stopPropagation();

    if (!wallpaper) return;

    const filename = `${wallpaper.tags
      .slice(0, 4)
      .map(({ name }) => name)
      .join("-")}-${wallpaper.resolution}.jpg`;

    Effect.runPromise(
      pipe(
        fetchImageBlob(wallpaper.path),
        Effect.flatMap((blob) =>
          pipe(
            shareFile(blob, filename),
            Effect.flatMap((shared) => (shared ? Effect.void : downloadFile(blob, filename))),
          ),
        ),
        Effect.catchAll(() => Effect.void),
      ),
    );
  };

  const autoHideMenu = () => {
    clearTimeout(menuTimeout);
    menuTimeout = setTimeout(() => {
      if (menu) {
        menu.style.opacity = "0";
        menu.style.transform = `translateY(${menu.offsetHeight + 16}px)`;
        menuVisible = false;
      }
    }, 5000);
  };

  const toggleMenu = () => {
    if (!menu) return;

    if (menuVisible) {
      menu.style.opacity = "0";
      menu.style.transform = `translateY(${menu.offsetHeight + 20}px)`;
      menuVisible = false;
    } else {
      menu.style.opacity = "1";
      menu.style.transform = "translateY(0)";
      menuVisible = true;
    }

    autoHideMenu();
  };

  onMount(() => {
    loadWallpaper();
    autoHideMenu();
    return () => clearTimeout(menuTimeout);
  });

  const getTags = (source: App.Wallpaper | null) =>
    source ? source.tags.map(({ name }) => `${name.charAt(0).toUpperCase()}${name.slice(1)}`).join(", ") : "";

  const getTitle = (source: App.Wallpaper | null) =>
    source
      ? `${getTags(source).split(", ").slice(0, 4).join(", ")} ${source.resolution} Wallpaper`
      : `Wallpaper ${id} ${site.title_postfix}`;

  const tags = $derived(getTags(wallpaper));
  const ssrTags = getTags(ssrWallpaper);

  const title = $derived(getTitle(wallpaper));
  const ssrTitle = getTitle(ssrWallpaper);

  const schema = ssrWallpaper
    ? {
        "@type": "ImageObject",
        name: ssrTitle,
        description: site.description,
        contentUrl: ssrWallpaper.path,
        thumbnailUrl: ssrWallpaper.thumbs.large,
        width: ssrWallpaper.dimension_x,
        height: ssrWallpaper.dimension_y,
        encodingFormat: "image/jpeg",
        keywords: ssrTags,
        dateCreated: ssrWallpaper.created_at,
        author: {
          "@type": "Person",
          name: ssrWallpaper.uploader?.username || "Anonymous",
        },
        isPartOf: {
          "@type": "WebPage",
          name: site.name,
          url: site.url,
        },
      }
    : undefined;
</script>

<svelte:head>
  {#if wallpaper}
    <meta property="og:image:width" content={wallpaper.dimension_x.toString()} />
    <meta property="og:image:height" content={wallpaper.dimension_y.toString()} />
  {/if}
</svelte:head>

<Head
  meta={{
    title,
    image: wallpaper?.path,
    keywords: wallpaper ? `wallpaper, ${tags}, ${wallpaper.resolution}, background, mobile, desktop` : undefined,
    type: "article",
    schema,
  }}
/>

<section class="flex min-h-dvh flex-col justify-center" role="presentation" onclick={toggleMenu}>
  {#if wallpaper}
    <Image src={`/api/wallhaven/proxy?url=${encodeURIComponent(wallpaper.path)}`} loading="eager" />
    <div class="tabs" bind:this={menu}>
      <div class="grid w-full grid-cols-3 items-center gap-2">
        <Button variant="ghost" href="/" icon={House} title="Home"></Button>
        <Button variant="ghost" icon={Download} type="button" title="Save" onclick={handleDownload}></Button>
        <Button
          variant="ghost"
          href={wallpaper.short_url}
          icon={SquareArrowOutUpRight}
          title="Source"
          target="_blank"
          rel="noopener noreferrer"
          onclick={(e: Event) => e.stopPropagation()}
        ></Button>
      </div>
    </div>
  {:else if loading}
    <Spinner />
  {/if}
</section>
