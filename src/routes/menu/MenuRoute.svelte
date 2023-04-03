<script lang="ts">
  import { getContext, onMount, onDestroy } from "svelte";
  import { useNavigate, useLocation } from "svelte-navigator";
  import * as jwtUtils from "@/utils/jwt";
  import * as userUtils from "@/utils/user";
  import * as API from "@/utils/api";
  import type { WeeklyMenu } from "@/utils/menu";
  import { mapWeekDayNumberToName } from "@/utils/menu";
  import { tap, type Subscription, switchMap, of, EMPTY, defer, mergeMap, catchError } from "rxjs";
  import { BehaviorSubject } from "rxjs";
  import type { JWT } from "@/utils/jwt";

  import RouteWrapper from "../RouteWrapper.svelte";

  import MenuItem from "@/components/menu/MenuItem.svelte";
    import Fa from "svelte-fa";
    import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

  let fetchStatus: "pending" | "success" | "error" = "pending";
  
  let sub$: Subscription;
  let jwtSub$: Subscription;
  let userDataSub$: Subscription;
  let weeklyMenuSub$: Subscription;

  let jwt$ = new BehaviorSubject<JWT | null>(null);
  let weeklyMenu$ = new BehaviorSubject<WeeklyMenu>([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  onMount(() => {
    sub$ = jwtUtils.retrieveJwtToken()
                   .asObservable()
                   .pipe(
                     tap({
                       next: (v: JWT | null) => {
                         jwt$.next(v);
                       }
                     }),
                     mergeMap(v => {
                       return userUtils.retrieveUserData().asObservable();
                     }),
                     mergeMap(v => {
                       if(v !== null) {
                         return API.getWeeklyMenu(jwt$.getValue() as JWT)
                                   .pipe(
                                     tap({
                                       next: (v) => {
                                         weeklyMenu$.next(v !== null ? v : []);
                                         weeklyMenu$ = weeklyMenu$;
                                         fetchStatus = "success";
                                       }
                                     }),
                                     catchError(err => {
                                       fetchStatus = "error";
                                     })
                                   );
                       } else {
                         return defer(() => {
                           navigate("/auth/login", {
                             state: {
                               redirect: $location.pathname,
                               showToast: true
                             }
                           });
                           return of(EMPTY);
                         });
                       }
                     })
                   )
                   .subscribe((v: any) => {
                     console.log(`Menu subscription - ${JSON.stringify(v)}`);
                   });
  });
  onDestroy(() => {
    if(sub$ !== undefined)
      sub$.unsubscribe();
  });
</script>

<RouteWrapper>
  <section class="menu-route w-full h-full flex flex-col items-center">
    <h1
      class="w-full text-center p-4 text-6xl mb-4"
    >
      Jadłospis
    </h1>
    {#if fetchStatus === "success"}
      <section class="menu__success w-full h-full overflow-y-auto">
        <section
          class="menu__week-days w-full min-h-full grid grid-cols-1 grid-rows-5 gap-8 py-4 place-items-center"
        >
          {#each weeklyMenu$.getValue() as menuItem}
            <section class="menu__week-day w-[90%] flex flex-col flex-nowrap items-center bg-saffron rounded-md">
              <h2
                class="w-full pt-4 pb-2 font-bold text-3xl text-center"
              >
                { mapWeekDayNumberToName(menuItem.weekDay) }
              </h2>
              <section class="menu__week-day__meals h-full w-full flex flex-col flex-nowrap items-center justify-evenly pt-2 pb-4 px-8">
                {#each [ menuItem.soup, ...menuItem.main ] as m}
                  <MenuItem
                    item={m}
                  />
                {/each}
              </section>
            </section>
          {/each}
        </section>
      </section>
    {:else if fetchStatus === "pending"}
      <section class="menu__pending">
        <h2>Wczytywanie danych...</h2>
      </section>
    {:else}
      <section class="menu__error w-full h-full flex flex-col justify-center items-center">
        <article class="menu__error__box w-[75%] h-[75%] bg-coral flex flex-col justify-center items-center rounded-xl text-6xl text-center">
          <Fa icon={faExclamationTriangle} />
          <h2
            class="text-3xl text-center mt-4"
          >
            Nie udało się wczytać jadłospisu. Spróbuj ponownie później.
          </h2>
        </article>
      </section>
    {/if}
  </section>
</RouteWrapper>
