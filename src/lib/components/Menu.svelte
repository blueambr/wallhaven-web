<script lang="ts">
  import GitHub from "$lib/assets/GitHub.svelte";
  import Accordion from "$lib/components/Accordion.svelte";
  import Button from "$lib/components/Button.svelte";
  import FormInput from "$lib/components/FormInput.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { apiSearchUrl } from "$lib/config";
  import { apiKey } from "$lib/stores/apiKey.svelte";
  import { KeyRound, Save, X } from "@lucide/svelte";
  import { cx } from "class-variance-authority";
  import { Effect } from "effect";
  import { onMount } from "svelte";
  import { SvelteSet } from "svelte/reactivity";

  let asideElement: HTMLElement;
  let visible = $state(false);
  let openSections: Set<string | number> = $state(new Set());
  let apiKeyValue = $state("");
  let apiKeyError = $state(false);

  const toggleSection = (section: string | number) => {
    if (openSections.has(section)) {
      openSections.delete(section);
    } else {
      openSections.add(section);
    }

    openSections = new SvelteSet(openSections);
  };

  const saveApiKey = async (e: Event) => {
    e.preventDefault();

    const validateApiKey = Effect.gen(function* () {
      const response = yield* Effect.tryPromise({
        try: () => fetch(`${apiSearchUrl}?apikey=${apiKeyValue}`),
        catch: (error) => new Error(`‼️ saveApiKey fetch failed: ${error}`),
      });

      if (!response.ok) {
        return yield* Effect.fail("Invalid API key");
      }

      return response;
    });

    await Effect.runPromise(
      validateApiKey.pipe(
        Effect.tap(() =>
          Effect.sync(() => {
            apiKey.setApiKey(apiKeyValue);
            apiKeyError = false;
            apiKeyValue = "";
          }),
        ),
        Effect.catchAll((error) =>
          Effect.sync(() => {
            console.error("‼️ saveApiKey:", error);
            apiKeyError = true;
          }),
        ),
      ),
    );
  };

  const handleVisibility = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.closest("[data-toggle-menu]")) {
      if (visible === true) {
        hide();
      } else {
        show();
      }
    } else if (visible && asideElement && !asideElement.contains(target)) {
      hide();
    }
  };

  const hideOnEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && visible) {
      hide();
    }
  };

  const hide = () => {
    const tabs = document.querySelector("[data-tabs]") as HTMLElement;

    if (tabs) {
      tabs.style.opacity = "1";
      tabs.style.transform = "translateY(0px)";
    }

    visible = false;
    document.body.style.overflow = "";
  };

  const show = () => {
    visible = true;
    document.body.style.overflow = "hidden";
  };

  onMount(() => {
    document.addEventListener("click", handleVisibility);
    document.addEventListener("keydown", hideOnEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("click", handleVisibility);
      document.removeEventListener("keydown", hideOnEscape);
    };
  });
</script>

<aside
  class={cx(
    "fixed top-0 left-0 z-10 size-full bg-secondary-dark/50 shadow-lg backdrop-blur-md backdrop-saturate-150 transition md:max-w-108",
    !visible && "-translate-x-full opacity-0",
  )}
  bind:this={asideElement}
>
  <div class="flex h-full flex-col gap-6 py-6">
    <ul class="grow overflow-x-hidden overflow-y-auto px-6">
      <Accordion
        open={openSections.has("apiKey")}
        label="Wallhaven API Key"
        icon={KeyRound}
        ontoggle={() => toggleSection("apiKey")}
      >
        <div class="px-4 pb-6">
          <FormInput
            placeholder="F4kCI79RYFjJGQjL64iHMHzTMavK2X2I"
            bind:value={apiKeyValue}
            bind:error={apiKeyError}
            errorMessage="Invalid API key"
            successMessage="Saved!"
            submitLabel="Save API Key"
            submitIcon={Save}
            onsubmit={saveApiKey}
          />
        </div>
      </Accordion>
    </ul>
    <div class="flex items-center justify-center gap-4 px-6">
      <a class="group" href="/terms"><span class="hover-line">Terms and Policies</span></a>
      <Button href="https://github.com/sorhavn/wallpaperslite" title="GitHub" target="_blank">
        <Icon svg={GitHub} />
      </Button>
      <Button href="https://ko-fi.com/sorhavn" title="Support on Ko-fi" target="_blank">
        <img class="size-7 object-contain" src="/ko-fi.svg" alt="Support on Ko-fi" />
      </Button>
    </div>
    <div class="flex justify-center px-6">
      <Button variant="ghost" icon={X} type="button" title="Close Menu" onclick={hide}></Button>
    </div>
  </div>
</aside>
