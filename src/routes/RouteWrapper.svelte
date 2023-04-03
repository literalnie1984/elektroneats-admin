<script lang="ts">
  import { scale } from "svelte/transition";
</script>

<div
  transition:scale="{{ duration: 200, start: 0.9 }}"
  class="route"
>
  <slot></slot>
</div>

<style lang="scss">
 :global(.route) {
   width: 100%;
   height: 100%;
   position: absolute;
   top: 0;
   left: 0;
 }
</style>
