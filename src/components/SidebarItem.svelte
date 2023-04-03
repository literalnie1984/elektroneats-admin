<script lang="ts" context="module">
  import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

  interface SidebarItem {
    label: string;
    icon: IconDefinition;
    onClick: () => void;
    path?: string;
    forceShow?: boolean;
  }

  export type {
    SidebarItem
  };
</script>
<script lang="ts">
 import Fa from "svelte-fa"; 
  import { onMount, onDestroy, getContext } from "svelte";
  import { storeToObservable$ } from "../utils";
  import type { Subscription } from "rxjs";
  import type { SidebarContext } from "./SidebarContext.svelte";
  import { useLocation } from "svelte-navigator";

  let sidebarExpanded$: Subscription;
  let expanded: boolean = false;
  const sidebarContext: SidebarContext = getContext("sidebarContext");
  const location = useLocation();

  onMount(() => {
    sidebarExpanded$ = storeToObservable$(sidebarContext.sidebarExpanded)
    .subscribe(v => { expanded = v; });
  });
  onDestroy(() => {
    sidebarExpanded$.unsubscribe();
  })

  function onClick() {
    if(item.forceShow !== true)
      sidebarContext.toggleSidebar(false);
    item.onClick();
  }
  
  export let item: SidebarItem;
  export let className: string = "";
</script>

<button
  class={`sidebar__item ${className}`}
  class:sidebar__item--active={item.path !== undefined && $location.pathname.match(item.path)}
  on:click={() => onClick()}
>
  <Fa icon={ item.icon } />
  {#if expanded}
  <span class="sidebar__item__label">{ item.label }</span>
  {/if}
</button>

<style lang="scss">
  .sidebar__item {
    @apply w-[100%] flex flex-row flex-nowrap items-center justify-evenly text-magnolia;
    height: 50px;
    text-align: center;
    font-size: 1.2rem;

    &--active {
      @apply bg-saffron text-gunmetal;
    }

    &--toggler {
      margin-top: 10px;
    }
  }
</style>
