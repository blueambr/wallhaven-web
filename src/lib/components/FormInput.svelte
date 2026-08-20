<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import { type Icon as IconType } from "@lucide/svelte";
  import { cx } from "class-variance-authority";
  import type { HTMLInputTypeAttribute } from "svelte/elements";
  import { slide } from "svelte/transition";

  interface Props {
    type?: HTMLInputTypeAttribute;
    placeholder: string;
    value: string;
    error: boolean;
    errorMessage: string;
    successMessage?: string;
    submitLabel: string;
    submitIcon: typeof IconType;
    onsubmit: (event: Event) => Promise<void>;
    [key: string]: unknown;
  }

  let {
    type = "text",
    placeholder,
    value = $bindable(),
    error = $bindable(),
    errorMessage,
    successMessage = "",
    submitLabel,
    submitIcon,
    onsubmit: handleSubmit,
    ...rest
  }: Props = $props();

  let showStatusMessage = $state(false);

  const onsubmit = (e: Event) =>
    handleSubmit(e).then(() => {
      if (successMessage || error) {
        showStatusMessage = true;

        setTimeout(() => {
          showStatusMessage = false;
        }, 3000);
      }
    });
</script>

<form class="relative" autocomplete="off" {onsubmit}>
  <div class="relative">
    <input
      class="w-full grow rounded-full bg-secondary-dark/50 py-3 pr-15 pl-4 text-primary transition placeholder:text-primary/50 placeholder:opacity-100 placeholder-shown:text-ellipsis hover:bg-secondary-dark focus:ring-0!"
      {type}
      {placeholder}
      size={1}
      {...rest}
      bind:value
    />
    <Button variant="absolute" icon={submitIcon} iconSize={24} type="submit" title={submitLabel}></Button>
  </div>
  {#if showStatusMessage}
    <div class={cx("pt-2 pl-4", error ? "text-error" : "text-success")} transition:slide>
      {error ? errorMessage : successMessage}
    </div>
  {/if}
</form>
