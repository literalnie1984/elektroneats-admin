<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte";
  import type { SidebarContext } from "./SidebarContext.svelte";
  import type { Subscription } from "rxjs";
  import { storeToObservable$ } from "../utils";
  import Fa from "svelte-fa";

  import { faBars } from "@fortawesome/free-solid-svg-icons";
  
  const sidebarContext: SidebarContext = getContext("sidebarContext");
  let sidebarExpanded$: Subscription;
  let expanded: boolean;

  onMount(() => {
    sidebarExpanded$ = storeToObservable$(sidebarContext.sidebarExpanded)
      .subscribe(v => { expanded = v; });
  });
  onDestroy(() => {
    sidebarExpanded$.unsubscribe();
  });
</script>

<nav
  class="sidebar"
  class:expanded="{expanded === true}"
>
  <button
    on:click={() => sidebarContext.toggleSidebar()}
    class="sidebar__item sidebar__expand-btn"
  >
    <Fa icon={faBars} />
  </button>
</nav>

<style lang="scss">
  .sidebar {
    width: 50px;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    transition: width .2s;

    &.expanded {
      position: absolute;
      top: 0;
      left: 0;
      width: 250px;
      z-index: 999;
    }

    &__item {
      width: 100%;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 1.2rem;
    }
  }
</style>
