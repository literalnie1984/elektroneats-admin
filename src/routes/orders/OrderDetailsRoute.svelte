<script lang="ts">
  import { getContext } from "svelte";
  import type { FetchedExtra, FetchedMeal } from "@/utils/menu";
  import type { OrderDetails } from "@/utils/orders";
  import { navigate, useLocation } from "svelte-navigator";
  import RouteWrapper from "../RouteWrapper.svelte";
  import type ToastContext from "@/components/toast/ToastContext.svelte";
  import { ToastType } from "@/components/toast/ToastContext.svelte";
  import * as jwtUtils from "@/utils/jwt";
  import * as API from "@/utils/api";
    import { EMPTY, catchError, of, switchMap } from "rxjs";
  
  const toastContext = getContext<ToastContext>("toastContext");
  const location = useLocation();
  
  let dinners: FetchedMeal[] = $location.state.dinners; 
  let extras: FetchedExtra[] = $location.state.extras;
  let userId: number = $location.state.userId;
  let username: string = $location.state.username;
  let details: OrderDetails = $location.state.details;

  let newStatus: "Paid" | "Prepared" | "Collected" | "Ready" = "Paid";
  
  function getSumCost() {
    let cost = 0;

    details.dinners.forEach(v => {
      cost += parseFloat(dinners.filter(vv => vv.id === v.dinnerId)[0].price);

      v.extrasIds.forEach(vv => {
        cost += parseFloat(extras.filter(vvv => vvv.id === vv)[0].price);
      });
    });

    return cost;
  }

  function changeStatus() {
    toastContext.addToast({
      message: "Trwa zmienianie statusu zamówienia...",
      type: ToastType.Info
    });

    jwtUtils.retrieveJwtToken()
            .asObservable()
            .pipe(
              catchError((err: Error, c) => {
                console.log(err.message);
                if(err.message.startsWith("SyntaxError")) {
                  return of(c);
                } else {
                  throw err;
                }
              }),
              switchMap(v => {
                if(v !== null) {
                  return API.changeOrderStatus(v, details.orderId, newStatus);
                } else {
                  throw new Error("Empty JWT");
                }
              })
            )
            .subscribe({
              next: v => {
                toastContext.addToast({
                  message: "Pomyślnie zmieniono status zamówienia!",
                  type: ToastType.Success
                });
                navigate(-1);
              },
              error: err => {
                console.log(err);
                toastContext.addToast({
                  message: "Nie udało się zmienić statusu zamówienia. Spróbuj ponownie później!",
                  type: ToastType.Error
                });
                navigate(-1);
              }
            });
  }
</script>

<RouteWrapper>
  <section class="order-details-route w-full h-full flex flex-col items-center">
    <header class="w-full flex flex-col flex-nowrap items-center justify-center p-4 pb-8 bg-saffron">
      <h1
        class="text-4xl text-center w-full font-bold"
      >{ details.orderId }</h1>
      <h2
        class="text-2xl text-center w-full"
      >Zamówione przez: {username} (ID: {userId})</h2>
      <h2
        class="text-2xl text-center w-full"
      >Data odebrania zamówienia: {new Date(details.collectionDate * 1000).toLocaleString()}</h2>
    </header>
    <span
      class="bg-saffron-dark w-full p-4 text-4xl font-bold flex flex-row text-center justify-center"
    >
      Zamówione posiłki
    </span>
    <ul
      class="bg-saffron-dark grow w-full text-center"
    >
      {#each details.dinners as dinner}
        <li
          class="text-xl"
        >
          <div class="w-full flex flex-row items-center justify-evenly my-2">
            <span>{dinners.filter(v => v.id === dinner.dinnerId)[0].name}</span>
            <span>{dinners.filter(v => v.id === dinner.dinnerId)[0].price}</span>
          </div>
          <span
            class="w-full my-4 text-2xl font-bold text-center flex flex-row justify-center items-center"
          >
            Dodatki:
          </span>
          <ul>
            {#each dinner.extrasIds as extra}
              <li>
                <div class="w-full flex flex-row items-center justify-evenly my-2">
                  <span>{ extras.filter(v => v.id === extra)[0].name }</span>
                  <span>{ extras.filter(v => v.id === extra)[0].price }</span>
                </div>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
    <span
      class="w-full p-4 bg-saffron-dark2 flex flex-row justify-center items-center"
    >
      Całkowity koszt zamówienia: { getSumCost() }zł
    </span>
    <section
      class="order-details__change-status w-full p-8 bg-coral flex flex-col items-center"
    >
      <h2
        class="w-full text-2xl text-center font-bold"
      >
        Zmień status zamówienia
      </h2>
      <select
        bind:value={newStatus}
        class="w-[90%] text-xl bg-coral-light p-2 mt-2 text-center rounded-lg"
      >
        <option value="Paid" selected>Opłacone</option>
        <option value="Prepared">Przygotowane</option>
        <option value="Ready" selected>Gotowe</option>
        <option value="Collected" selected>Odebrane</option>
      </select>
      <button
        class="w-[90%] bg-coral-light p-2 text-center text-xl mt-4 rounded-lg transition-[background-color] hover:bg-coral-light2"
        on:click={() => changeStatus()}
      >
        Zmień status
      </button>
    </section>
  </section>
</RouteWrapper>
