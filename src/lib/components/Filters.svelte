<script lang="ts">
  import Accordion from "$lib/components/Accordion.svelte";
  import Button from "$lib/components/Button.svelte";
  import { filters as filtersData } from "$lib/data";
  import { apiKey } from "$lib/stores/apiKey.svelte";
  import { filters } from "$lib/stores/filters.svelte";
  import { BrushCleaning, Check, X } from "@lucide/svelte";
  import { cx } from "class-variance-authority";
  import { onMount, untrack } from "svelte";
  import { SvelteSet } from "svelte/reactivity";

  let asideElement: HTMLElement;
  let visible = $state(false);
  let openSections: Set<string | number> = $state(new Set());
  let currentFilters: App.Filters["filters"] = $state(filters.state);

  const enabled = (value: App.Filters["filters"][number]) =>
    currentFilters.some((filter) =>
      Object.entries(value).every(([key, val]) => {
        if (Array.isArray(val)) {
          const filterString = filter[key] as string;
          const filterIndex = val.findIndex((flag) => flag === "1");
          const splitFilterString = filterString?.split("");

          return splitFilterString?.[filterIndex] === "1";
        }

        return filter[key] === val;
      }),
    );

  const filter = (value: App.Filters["filters"][number], singleton = false) => {
    const array = Object.values(value).some((val) => Array.isArray(val));

    if (array) {
      const newValue = { ...value };
      const arrayKey = Object.keys(newValue)[0];
      const arrayValue = newValue[arrayKey] as string[];
      const existingFilterIndex = currentFilters.findIndex((filter) => arrayKey in filter);

      if (existingFilterIndex !== -1) {
        const existingValue = currentFilters[existingFilterIndex][arrayKey] as string;
        let newArray: string[];

        newArray = existingValue.split("");

        const mergedArray = arrayValue.map((flag, index) => {
          if (flag === "1") {
            if (newArray[index] === "1") {
              return "0";
            }

            return "1";
          } else {
            if (newArray[index] === "0") {
              return "0";
            }
          }

          return "1";
        });

        newValue[arrayKey] = mergedArray.join("");

        currentFilters = currentFilters.filter((_, index) => index !== existingFilterIndex);
      } else {
        newValue[arrayKey] = arrayValue.join("");
      }

      const existingKeyValuePairIndex = currentFilters.findIndex((filter) =>
        Object.entries(newValue).every(([key, val]) => filter[key] === val),
      );

      if (existingKeyValuePairIndex !== -1) {
        currentFilters = currentFilters.filter((_, index) => index !== existingKeyValuePairIndex);
      } else {
        currentFilters = [...currentFilters, newValue];
      }
    } else {
      const existingFilterIndex = currentFilters.findIndex((filter) =>
        Object.entries(value).every(([key, val]) => filter[key] === val),
      );

      if (existingFilterIndex !== -1) {
        currentFilters = currentFilters.filter((_, index) => index !== existingFilterIndex);
      } else {
        if (singleton) {
          currentFilters = currentFilters.filter((filter) => !Object.keys(value).some((key) => key in filter));
        }

        currentFilters = [...currentFilters, value];
      }
    }
  };

  const toggleSection = (section: string | number) => {
    if (openSections.has(section)) {
      openSections.delete(section);
    } else {
      openSections.add(section);
    }

    openSections = new SvelteSet(openSections);
  };

  const handleVisibility = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.closest("[data-toggle-filters]")) {
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

  $effect(() => {
    void filters.state;

    untrack(() => (currentFilters = filters.state));
  });

  $effect(() => {
    if (!visible) untrack(() => (currentFilters = filters.state));
  });

  onMount(() => {
    filtersData.forEach((filter) => filter.open && openSections.add(filter.id));
    openSections = new SvelteSet(openSections);

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
    "fixed top-0 right-0 z-10 size-full bg-secondary-dark/50 shadow-lg backdrop-blur-md backdrop-saturate-150 transition md:max-w-[432px]",
    !visible && "translate-x-full opacity-0",
  )}
  bind:this={asideElement}
>
  <div class="flex h-full flex-col gap-6 py-6">
    <ul class="grow overflow-x-hidden overflow-y-auto px-6">
      {#each filtersData as { id, icon, name, singleton, options } (id)}
        <Accordion open={openSections.has(id)} label={name} {icon} ontoggle={() => toggleSection(id)}>
          <ul class="grid grid-cols-2 items-center gap-2 px-4 pt-2 pb-6">
            {#each options as { id, icon, name, value } (id)}
              <li class={cx(id === "filterPurityNSFW" && !apiKey.state && "hidden")}>
                <Button
                  option="full"
                  enabled={enabled(value)}
                  label={name}
                  {icon}
                  iconSize={18}
                  type="button"
                  onclick={() => filter(value, singleton)}
                ></Button>
              </li>
            {/each}
          </ul>
        </Accordion>
      {/each}
    </ul>
    <ul class="grid grid-cols-2 items-center gap-2 px-10">
      <li class="w-full">
        <Button
          class="hover:bg-success/50!"
          option="full"
          label="Apply"
          icon={Check}
          iconSize={24}
          type="button"
          onclick={() => {
            filters.setFilters(currentFilters);
            hide();
          }}
        ></Button>
      </li>
      <li class="flex justify-center">
        <Button
          class="hover:bg-error/50!"
          option="full"
          label="Clear"
          icon={BrushCleaning}
          iconSize={24}
          type="button"
          onclick={() => {
            filters.reset();
            hide();
          }}
        ></Button>
      </li>
    </ul>
    <div class="flex justify-center px-6">
      <Button variant="ghost" icon={X} type="button" title="Close Menu" onclick={hide}></Button>
    </div>
  </div>
</aside>
