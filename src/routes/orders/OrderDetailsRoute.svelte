<script lang="ts">
  import type { FetchedExtra, FetchedMeal } from "@/utils/menu";
  import type { OrderDetails } from "@/utils/orders";
  import { useLocation } from "svelte-navigator";
  import RouteWrapper from "../RouteWrapper.svelte";
  
  const location = useLocation();
  
  let dinners: FetchedMeal[] = $location.state.dinners; 
  let extras: FetchedExtra[] = $location.state.extras;
  let userId: number = $location.state.userId;
  let username: string = $location.state.username;
  let details: OrderDetails = $location.state.details;

  function getSumCost() {
    let cost = 0;

    details.dinners.forEach(v => {
      cost += parseFloat(dinners.filter(vv => vv.id === v.dinnerId)[0].price);

      v.extrasIds.forEach(vv => {
        cost += parseFloat(extras.filter(vvv => vvv.id === vv)[0].price);
      });
    });
  }
</script>

<RouteWrapper>
  <section class="order-details-route">
    <header>
      <h1>{ details.orderId }</h1>
      <h2>Zamówione przez: {username} (ID: {userId})</h2>
      <h2>Data odebrania zamówienia: {new Date(details.collectionDate)}</h2>
    </header>
    <span>Zamówione posiłki</span>
    <ul>
      {#each details.dinners as dinner}
        <li>
          <span>{dinners.filter(v => v.id === dinner.dinnerId)[0].name}</span>
          <span>{dinners.filter(v => v.id === dinner.dinnerId)[0].price}</span>
          <span>Dodatki:</span>
          <ul>
            {#each dinner.extrasIds as extra}
              <li>
                <span>{ extras.filter(v => v.id === extra)[0].name }</span>
                <span>{ extras.filter(v => v.id === extra)[0].price }</span>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
    <span>Całkowity koszt zamówienia: { getSumCost() }</span>
  </section>
</RouteWrapper>
