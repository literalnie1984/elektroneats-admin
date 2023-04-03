<script lang="ts">
  import { useNavigate } from "svelte-navigator";
  import type { FetchedMeal, FetchedExtra } from "@/utils/menu";
  import type { OrderDetails } from "@/utils/orders";
  import { orderStatusToString } from "@/utils/orders";

  const navigate = useNavigate();

  function gotoOrderDetails() {
    navigate("/orders/details", {
      state: {
        dinners,
        extras,
        userId,
        username,
        details
      }
    });
  }
  
  export let dinners: FetchedMeal[];
  export let extras: FetchedExtra[];
  export let userId: number;
  export let username: string;
  export let details: OrderDetails;
</script>

<button
  class="order-item bg-saffron w-full p-4 my-2"
  on:click={() => gotoOrderDetails()}
>
  <h1 class="text-2xl text-center w-full">{ details.orderId }</h1>
  <h2 class="text-xl text-center w-full">{ username }</h2>
  <h2 class="text-xl bg-saffron-dark2 p-2 mt-4 text-center">{ orderStatusToString(details.status) }</h2>
</button>
