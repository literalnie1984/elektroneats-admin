<script lang="ts">
  import { useLocation, useNavigate } from "svelte-navigator";
  import { getContext, onMount, onDestroy } from "svelte";
  import type { DinnerItem } from "@/utils/menu";
  import * as API from "@/utils/api";
  import * as jwtUtils from "@/utils/jwt";

  import RouteWrapper from "../RouteWrapper.svelte";
    import { switchMap, take } from "rxjs";
  
  const location = useLocation();
  const navigate = useNavigate();

  let updateStatus: "pending" | "error" | "success" | "idle" = "idle";
  let newPrice: number;
  let newName: string;
  let newMaxSupply: number;
  let newWeekDay: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | null;

  const menuItem = $location.state["item"] as DinnerItem;   
  function submitForm(e: Event) {
    e.preventDefault();

    console.log(newPrice);
    console.log(newName);
    console.log(newMaxSupply);
    console.log(newWeekDay);

    updateStatus = "pending";

    jwtUtils.retrieveJwtToken()
            .asObservable()
            .pipe(
              switchMap(v => {
                if(v !== null) {
                  return API.updateDish(
                    v,
                    menuItem.id,
                    (newName.length > 0 && newName !== undefined) ? newName : menuItem.name,
                    (newPrice !== undefined && newPrice !== null) ? newPrice : parseInt(menuItem.price),
                    menuItem.uri,
                    newMaxSupply ?? null,
                    newWeekDay
                  );
                } else {
                  throw new Error("Empty JWT");
                }
              }),
              take(1)
            )
            .subscribe({
              next: () => {
                updateStatus = "success";
              },
              error: () => {
                updateStatus = "error";
              }
            });
  }
  
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
      class="menu-item__header__bg absolute z-[2] top-0 left-0 w-full h-full blur-sm"
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
      <section
        class="menu-item-route__settings w-[90%] bg-gunmetal flex flex-col flex-nowrap items-center p-4"
      >
        {#if updateStatus === "idle"}
          <h3
            class="text-2xl text-white text-center w-full"
          >
            Zmień właściwości dania
          </h3>
          <form
            class="menu-item-route__settings__form"
            on:submit={submitForm}
          >
            <div class="menu-item-route__settings__form__group">
              <label for="menu-item-route__name">Nazwa</label>
              <input
                id="menu-item-route__name"
                type="text"
                maxlength="255"
                bind:value={newName}
              />
            </div>
            <div class="menu-item-route__settings__form__group">
              <label for="menu-item-route__price">Cena</label>
              <input
                id="menu-item-route__price"
                type="number"
                min="0.00"
                bind:value={newPrice}
              />
            </div>
            <div class="menu-item-route__settings__form__group">
              <label for="menu-item-route__max-supply">Maksymalna podaż</label>
              <input
                id="menu-item-route__max-supply"
                type="number"
                min="1"
                bind:value={newMaxSupply}
              />
            </div>
            <div class="menu-item-route__settings__form__group">
              <label for="menu-item-route__week-day">Dzień tygodnia</label>
              <select
                id="menu-item-route__week-day"
                bind:value={newWeekDay}
              >
                {#each [["Monday", "Poniedziałek"],
                  ["Tuesday", "Wtorek"],
                  ["Wednesday", "Środa"],
                  ["Thursday", "Czwartek"],
                  ["Friday", "Piątek"]] as weekday}
                  <option
                    value={weekday[0]}
                  >{ weekday[1] }</option>
                {/each}
                <option selected value={null}>Bez zmian</option>
              </select>
            </div>
            <button
              type="submit"
              class="menu-item-route__settings__form__submit"
            >
              Wprowadź zmiany
            </button>
          </form>
          {:else if updateStatus === "pending"}
          <h3
            class="text-center w-full text-white text-3xl"
          >
            Wprowadzanie zmian...
          </h3>
          {:else if updateStatus === "success"}
          <h3
            class="text-center w-full text-white text-3xl"
          >
            Pomyślnie wprowadzono zmiany!
          </h3>
          {:else}
          <h3
            class="text-center w-full text-white text-3xl"
          >
            Nie udało się wprowadzić zmian. Spróbuj ponownie później.
          </h3>
        {/if}
      </section>
    </section>
  </section>
</RouteWrapper>

<style lang="scss">
  .menu-item-route__settings__form {
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    margin-top: 10px;
    
    &__group {
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
      justify-content: center;
      align-items: center;
      color: white;
      @apply text-xl;
      margin-top: 10px;
      margin-bottom: 10px;
      
      & > label {
        margin-right: 20px;
      }
      & > input, & > select {
        width: 75%;
        background-color: transparent;
        border-bottom: 1px solid theme('colors.coral.DEFAULT');
        color: theme('colors.coral.DEFAULT');
        outline: none;
        text-align: center;
        padding: 4px;
      }
    }

    &__submit {
      margin-top: 20px;
      width: 80%;
      background-color: theme('colors.coral.DEFAULT');
      @apply text-xl;
      padding: 8px;
      transition: background-color .2s;

      &:hover {
        background-color: theme('colors.coral.light');
        cursor: pointer;
      }
    }
  }
</style>
