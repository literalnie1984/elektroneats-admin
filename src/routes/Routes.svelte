<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Route, useLocation } from "svelte-navigator";
  import { storeToObservable$ } from "../utils";
  import type { Subscription } from "rxjs";
  import { scale } from "svelte/transition";

  //#region Routes
  import DashboardRoute from "./DashboardRoute.svelte";

  import AuthLoginRoute from "./auth/AuthLoginRoute.svelte";
  //#endregion
  
  const location = useLocation();
  let locationKey: string;
  let location$: Subscription;
  
  onMount(() => {
    location$ = storeToObservable$(location)
      .subscribe(loc => {
        locationKey = `${loc.pathname}${loc.hash}${loc.search}`;
      });
  });
  onDestroy(() => {
    location$.unsubscribe();
  });
</script>

{#key locationKey}
<div class="routes-wrapper">
  <div
    transition:scale="{{ duration: 300, start: 50 }}"
    class="route"
  >
    <Route path="/auth/login">
      <AuthLoginRoute />
    </Route>
    <Route path="/menu">
      <h1>Menu index route</h1>
    </Route>
    <Route path="/dinners">
      <h1>Dinners index route</h1>
    </Route>
    <Route path="/">
      <DashboardRoute />
    </Route>
    <Route>
      <h1>No match route</h1>
    </Route>
  </div>
</div>
{/key}

<style lang="scss">
 .routes-wrapper {
   width: 100%;
   height: 100%;
   position: relative;
 }
 .route {
   width: 100%;
   height: 100%;
   position: absolute;
   top: 0;
   left: 0;
 }
</style>
