<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte";
  import type { SidebarContext } from "./SidebarContext.svelte";
  import type { Subscription } from "rxjs";
  import { storeToObservable$ } from "../utils";
  import Fa from "svelte-fa";
  import type { SidebarItem as ISidebarItem } from "./SidebarItem.svelte";
  import SidebarItem from "./SidebarItem.svelte";
  import { useNavigate } from "svelte-navigator";

  import { faBars, faHome, faUtensils, faBowlFood } from "@fortawesome/free-solid-svg-icons";
  
  const navigate = useNavigate();
  const sidebarContext: SidebarContext = getContext("sidebarContext");
  let sidebarExpanded$: Subscription;
  let expanded: boolean;

  const sidebarItems: ISidebarItem[] = [
    {
      label: "Menu główne",
      icon: faHome,
      onClick: () => navigate("/"),
      path: "^/$"
    },
    {
      label: "Jadłospis",
      icon: faUtensils,
      onClick: () => navigate("/menu"),
      path: "^/menu"
    },
    {
      label: "Posiłki",
      icon: faBowlFood,
      onClick: () => navigate("/dinners"),
      path: "^/dinners"
    }
  ];

  onMount(() => {
    sidebarExpanded$ = storeToObservable$(sidebarContext.sidebarExpanded)
      .subscribe(v => { expanded = v; });
  });
  onDestroy(() => {
    sidebarExpanded$.unsubscribe();
  });
</script>

<nav
  class="sidebar bg-gunmetal"
  class:expanded="{expanded === true}"
>
  <SidebarItem
    className="sidebar__item--toggler"
    item={{
           label: "Zwiń menu",
           icon: faBars,
           onClick: () => sidebarContext.toggleSidebar()
         }}
  />
  <section class="sidebar__items">
    {#each sidebarItems as item}
    <SidebarItem
      item={item}
    />
    {/each}
  </section>
</nav>

<style lang="scss">
  .sidebar {
    width: 50px;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    transition: width .2s;

    &.expanded {
      position: absolute;
      top: 0;
      left: 0;
      width: 250px;
      z-index: 999;
    }

    &__items {
      @apply h-[100%] w-[100%] flex flex-col flex-nowrap justify-center items-center;
    }
  }
</style>
