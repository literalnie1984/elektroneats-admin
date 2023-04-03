<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte";
  import type { SidebarContext } from "./SidebarContext.svelte";
  import { BehaviorSubject, type Subscription } from "rxjs";
  import { storeToObservable$ } from "../utils";
  import Fa from "svelte-fa";
  import type { SidebarItem as ISidebarItem } from "./SidebarItem.svelte";
  import SidebarItem from "./SidebarItem.svelte";
  import { useNavigate, useLocation } from "svelte-navigator";
  import type { UserData } from "@/utils/user";
  import { retrieveUserData } from "@/utils/user";
  import type ToastContext from "./toast/ToastContext.svelte";
  import { faBars, faHome, faUtensils, faBowlFood, faKey, faUser } from "@fortawesome/free-solid-svg-icons";
  import { ToastType } from "./toast/ToastContext.svelte";
  
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarContext: SidebarContext = getContext("sidebarContext");
  const toastContext: ToastContext = getContext("toastContext");
  let sidebarExpanded$: Subscription;
  let expanded: boolean;
  let userDataSub$: Subscription;
  let userData$ = new BehaviorSubject<UserData | null>(null);

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
      onClick: () => navigate("/menu/"),
      path: "^/menu"
    },
    {
      label: "Posiłki",
      icon: faBowlFood,
      onClick: () => navigate("/dinners/"),
      path: "^/dinners"
    }
  ];

  function accountOnClick() {
    if(userData$.getValue() === null) {
      navigate("/auth/login", {
        state: {
          redirect: $location.pathname,
          showToast: false
        }
      });
    } else {
      toastContext.addToast({
        message: "Funkcja niezaimplementowana.",
        type: ToastType.Info
      });
    }
  }
  
  onMount(() => {
    sidebarExpanded$ = storeToObservable$(sidebarContext.sidebarExpanded)
      .subscribe(v => { expanded = v; });

    userDataSub$ = retrieveUserData()
      .subscribe(v => {
        userData$.next(v);
        userData$ = userData$;
        console.log(`User data: ${userData$.getValue()}`);
      });
  });
  onDestroy(() => {
    if(sidebarExpanded$ !== undefined)
      sidebarExpanded$.unsubscribe();

    if(userDataSub$ !== undefined)
      userDataSub$.unsubscribe();
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
  <section
    class="sidebar__account"
    class:sidebar__account--logged-in={ userData$.getValue() !== null }
    class:sidebar__account--logged-out={ userData$.getValue() === null }
    on:click={() => accountOnClick()}
  >
    <Fa
      icon={ userData$.getValue() === null ? faKey : faUser }
    />
    {#if expanded}
    <span class="sidebar__account__caption">
      {
      userData$.getValue() === null
      ? "Zaloguj"
      : userData$.getValue()?.username
      }
    </span>
    {/if}
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
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999;

    &.expanded {
      width: 250px;
    }

    &__items {
      @apply h-full w-full flex flex-col flex-nowrap justify-center items-center;
    }

    &__account {
      height: 50px;
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
      justify-content: center;
      align-items: center;
      @apply text-xl;

      &__caption {
        margin-left: 10px;
      }

      &--logged-in {
        background-color: theme('colors.coral.DEFAULT');
        color: black;
        transition: background-color .2s;

        &:hover {
          background-color: theme('colors.coral.light');
          cursor: pointer;
        }
      }
      &--logged-out {
        transition: background-color .2s, color .2s;
        color: white;

        &:hover {
          background-color: theme('colors.coral.light');
          color: black;
          cursor: pointer;
        }
      }
    }
  }
</style>
