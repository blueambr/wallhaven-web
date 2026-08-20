<script lang="ts">
  import { page } from "$app/state";
  import { externalApiWebsite, site } from "$lib/config";

  interface Props {
    meta?: {
      title?: string;
      description?: string;
      image?: string;
      keywords?: string;
      type?: string;
      schema?: object;
    };
  }

  const { meta }: Props = $props();
  const title = $derived(meta?.title || site.name);
  const description = $derived(meta?.description || site.description);
  const image = $derived(meta?.image || `${site.url}${site.og_image}`);
  const keywords = $derived(meta?.keywords || site.keywords);
  const type = $derived(meta?.type || "website");

  const generalSchema = {
    "@type": "WebSite",
    name: site.name,
    description: site.description,
    url: site.url,
    author: {
      "@type": "Person",
      name: site.author.name,
      email: site.author.email,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/search?q={q}`,
      "query-input": "required minlength=3 name=q",
    },
  };

  const schema = $derived({
    "@context": "https://schema.org",
    "@graph": meta?.schema ? [generalSchema, meta.schema] : [generalSchema],
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <meta name="author" content={site.author.name} />
  <meta name="application-name" content={site.name} />
  <meta name="apple-mobile-web-app-title" content={site.short_name} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={site.name} />
  <meta property="og:url" content={page.url.href} />
  <meta property="og:locale" content={site.locale} />
  <link rel="canonical" href={page.url.href} />
  <link rel="dns-prefetch" href={externalApiWebsite} />
  <link rel="preconnect" href={externalApiWebsite} />
  <svelte:element this={"script"} type="application/ld+json">
    {JSON.stringify(schema)}
  </svelte:element>
</svelte:head>
