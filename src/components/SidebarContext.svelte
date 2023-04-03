<script lang="ts" context="module">
  interface SidebarContext {
    toggleSidebar: (state?: boolean) => void;
    sidebarExpanded: Writable<boolean>;
  }

  export type {
    SidebarContext
  };
</script>
<script lang="ts">
  import { setContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";

  const sidebarExpanded = writable(false);
  
  const sidebarContext: SidebarContext = setContext<SidebarContext>("sidebarContext", {
    sidebarExpanded,
    toggleSidebar: (state?: boolean) => {
      if(state !== undefined)
        sidebarExpanded.update(v => state);
      else
        sidebarExpanded.update(v => !v);
    }
  });
</script>

<slot></slot>
