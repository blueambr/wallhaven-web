<script lang="ts">
  interface Props {
    content: string;
  }

  const { content }: Props = $props();
</script>

<section>
  <div class="container max-w-3xl">
    <article class="prose prose-lg max-w-none prose-invert prose-blockquote:not-italic">
      {@html content}
    </article>
  </div>
</section>
