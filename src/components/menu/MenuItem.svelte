<script lang="ts">
  import type { DinnerItem } from "@/utils/menu";
  import { useNavigate } from "svelte-navigator";

  const navigate = useNavigate();

  function gotoMenuItem() {
    navigate("/menu/item", {
      state: {
        item
      }
    });
  }
  
  export let item: DinnerItem;
</script>

<button
  class="menu-item flex flex-row justify-center items-center hover:bg-coral-light bg-coral w-full p-2 my-2 transition-[background-color] hover:cursor-pointer"
  on:click={() => gotoMenuItem()}
>
  <span class="menu-item__title text-2xl text-center flex justify-center items-center w-full h-full text-ellipsis">{ item.name }</span>
</button>
