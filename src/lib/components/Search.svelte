<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import FormInput from "$lib/components/FormInput.svelte";
  import { Search } from "@lucide/svelte";
  import { Effect } from "effect";

  interface Props {
    class?: string;
  }

  const { class: cls }: Props = $props();

  let value = $derived(page.url.searchParams.get("q") || "");
  let error = $state(false);

  const runSearch = async (e: Event) => {
    e.preventDefault();

    const performSearch = Effect.gen(function* () {
      const trimmedValue = value.trim();

      if (trimmedValue.length < 3) {
        return yield* Effect.fail("Minimum 3 characters required");
      }

      yield* Effect.tryPromise({
        try: () => goto(`/search?q=${encodeURIComponent(trimmedValue)}`),
        catch: (error) => new Error(`‼️ runSearch navigation failed: ${error}`),
      });

      return trimmedValue;
    });

    await Effect.runPromise(
      performSearch.pipe(
        Effect.tap(() =>
          Effect.sync(() => {
            error = false;
          }),
        ),
        Effect.catchAll((searchError) =>
          Effect.sync(() => {
            console.error("‼️ runSearch:", searchError);
            error = true;
          }),
        ),
      ),
    );
  };
</script>

<div class={cls}>
  <FormInput
    type="search"
    placeholder="Harbour"
    bind:value
    bind:error
    errorMessage="Minimum 3 characters"
    submitLabel="Run Search"
    submitIcon={Search}
    onsubmit={runSearch}
    minlength="3"
  />
</div>
