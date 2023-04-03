<script lang="ts">
  import { useLocation, useNavigate } from "svelte-navigator";
  import { getContext, onMount, onDestroy } from "svelte";
  import type { DinnerItem } from "@/utils/menu";

  import RouteWrapper from "../RouteWrapper.svelte";
  
  const location = useLocation();
  const navigate = useNavigate();

  const menuItem = $location.state["item"] as DinnerItem;
  
  onMount(() => {
    if($location.state["item"] === undefined) {
      navigate(-1);
    }
  });
  onDestroy(() => {
    
  });
</script>

<RouteWrapper>
  <section class="menu-item-route w-full h-full flex flex-col flex-nowrap items-center relative">
    <img
      class="menu-item__header__bg absolute z-[2] top-0 left-0 w-full h-full blur"
      src={`${import.meta.env.VITE_API_URL}/image/${menuItem.uri}`}
      alt={menuItem.name}
    />
    <section
      class="menu-item-route__content absolute z-[3] top-0 left-0 w-full h-full flex flex-col flex-nowrap items-center"
    >
      <h1
        class="bg-gunmetal text-white p-8 w-[90%] text-center flex flex-row justify-center items-center text-8xl my-4"
      >
        { menuItem.name }
      </h1>
      <section
        class="menu-item-route__properties w-[90%] flex flex-col flex-nowrap items-center"
      >
        <article
          class="menu-item-route__property bg-gunmetal w-full flex flex-row flex-nowrap items-center justify-evenly text-3xl text-white my-2 p-4"
        >
          <span>ID</span>
          <span>{ menuItem.id }</span>
        </article>
        <article
          class="menu-item-route__property bg-gunmetal w-full flex flex-row flex-nowrap items-center justify-evenly text-3xl text-white my-2 p-4"
        >
          <span>Cena</span>
          <span>{ menuItem.price }zł</span>
        </article>
      </section>
    </section>
  </section>
</RouteWrapper>
