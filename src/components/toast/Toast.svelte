<script lang="ts">
  import { ToastType } from "./ToastContext.svelte";
  import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import { fade } from "svelte/transition";

  export let message: string;
  export let type: ToastType;
  export let icon: IconDefinition | undefined;
</script>

<div
  class="toast w-[80%] h-[40px] flex flex-row justify-center items-center text-center rounded-md mt-2 mb-2"
  class:toast--info={ type === ToastType.Info }
  class:toast--success={ type === ToastType.Success }
  class:toast--warning={ type === ToastType.Warning }
  class:toast--error={ type === ToastType.Error }
  transition:fade={{ duration: 200 }}
>
  {#if icon !== undefined}
  <Fa icon={icon} />
  {/if}
  <span class="toast__message h-[100%] text-center flex justify-center items-center text-lg ml-4">
    { message }
  </span>
</div>

<style lang="scss">
  .toast {
    &--info {
      background-color: #00aaff;
    }
    &--success {
      background-color: #00aa00;
    }
    &--warning {
      background-color: #ffaa00;
    }
    &--error {
      background-color: #ff1f00;
      color: white;
    }
  }
</style>
