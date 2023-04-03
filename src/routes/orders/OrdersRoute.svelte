<script lang="ts">
  import * as API from "@/utils/api";
  import * as jwtUtils from "@/utils/jwt";
  import * as userUtils from "@/utils/user";
  import { tap, type Subscription, switchMap } from "rxjs";
  import { onMount, onDestroy } from "svelte";
  import { useNavigate, useLocation } from "svelte-navigator";
  import { OrderStatus, type OrderResponse, type OrderDetails, type OrderInfo } from "@/utils/orders";
  import RouteWrapper from "../RouteWrapper.svelte";
  import OrderItem from "@/components/orders/OrderItem.svelte";

  const navigate = useNavigate();
  const location = useLocation();
  
  let ordersType: OrderStatus = OrderStatus.Paid;
  let ordersData: OrderResponse;
  
  let sub$: Subscription;
  let userData: userUtils.UserData;

  let fetchStatus: "pending" | "success" | "error" = "pending";

  function getOrdersByStatus(status: OrderStatus): OrderInfo[] {
    return ordersData.response.map(v => {
      const user_id = v.user_id;
      const username = v.username;
      const orders = v.orders.filter(vv => vv.status === status);

      return {
        user_id,
        username,
        orders
      };
    });
  }
  
  function switchType(type: OrderStatus) {
    ordersType = type;
  }
  
  onMount(() => {
    sub$ = userUtils.retrieveUserData()
                    .asObservable()
                    .pipe(
                      tap({
                        next: v => {
                          if(v === null) {
                            navigate("/auth/login", {
                              state: {
                                redirect: $location.pathname,
                                showToast: true
                              }
                            });
                          } else {
                            userData = v;
                          }
                        }
                      }),
                      switchMap(v => jwtUtils.retrieveJwtToken()
                                             .asObservable()
                                             .pipe(
                                               switchMap(v => {
                                                 if(v !== null) {
                                                   return API.getOrders(v);
                                                 } else {
                                                   throw new Error("Empty JWT");
                                                 }
                                               })
                                             )
                      )
                    )
                    .subscribe({
                      next: v => {
                        ordersData = v;
                        fetchStatus = "success";
                      },
                      error: err => {
                        fetchStatus = "error";
                      }
                    });
  });
  onDestroy(() => {
    if(sub$ !== undefined)
      sub$.unsubscribe();
  });
</script>

<RouteWrapper>
  <section class="orders-route h-full w-full overflow-y-auto">
    <div class="orders-route__content h-full w-full flex flex-col flex-nowrap items-center">
      <h1
        class="text-6xl text-center w-full mb-4"
      >
        Zamówienia
      </h1>
      <div class="orders-route__switchers flex flex-row w-full flex-nowrap items-center">
        <button
          class="orders-route__switcher orders-route__switcher--paid"
          class:active={ordersType === OrderStatus.Paid}
          on:click={() => switchType(OrderStatus.Paid)}
        >
          Opłacone
        </button>
        <button
          class="orders-route__switcher orders-route__switcher--prepared"
          class:active={ordersType === OrderStatus.Prepared}
          on:click={() => switchType(OrderStatus.Prepared)}
        >
          Przygotowane
        </button>
        <button
          class="orders-route__switcher orders-route__switcher--ready"
          class:active={ordersType === OrderStatus.Ready}
          on:click={() => switchType(OrderStatus.Ready)}
        >
          Gotowe
        </button>
        <button
          class="orders-route__switcher orders-route__switcher--collected"
          class:active={ordersType === OrderStatus.Collected}
          on:click={() => switchType(OrderStatus.Collected)}
        >
          Odebrane
        </button>
      </div>
      {#if fetchStatus === "success"}
      <section class="orders__list h-full w-full flex flex-col flex-nowrap items-center">
        {#each getOrdersByStatus(ordersType) as order}
          {#if order.orders.length > 0}
            {#each order.orders as details}
              <OrderItem
                dinners={ordersData.dinners}
                extras={ordersData.extras}
                details={details}
                userId={order.user_id}
                username={order.username}
              />
            {/each}
        {:else}
            <h1 class="text-4xl text-center w-full h-full flex flex-col items-center justify-center flex-nowrap">Brak zamówień.</h1>
          {/if}
        {/each}
      </section>
      {:else if fetchStatus === "error"}
      <section class="orders__error w-full h-full flex flex-col flex-nowrap justify-center items-center">
        <h2 class="text-3xl text-center w-full">Nie udało się wczytać zamówień. Spróbuj ponownie później.</h2>
      </section>
      {:else}
      <section class="orders__pending w-full h-full flex flex-col flex-nowrap justify-center items-center">
        <h2 class="text-3xl text-center w-full">Wczytywanie zamówień...</h2>
      </section>
      {/if}
    </div>
  </section>
</RouteWrapper>

<style lang="scss">
  .orders-route__switcher {
    text-align: center;
    width: 100%;
    padding: 4px;
    background-color: theme('colors.coral.DEFAULT');
    transition: background-color .2s;
    @apply text-xl;

    &.active {
      background-color: theme('colors.coral.light');
    }
  }
</style>
