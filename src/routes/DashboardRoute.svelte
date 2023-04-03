<script lang="ts">
  import type { UserData } from "../utils/user";
  import { retrieveUserData } from "../utils/user";
  import type { Subscription } from "rxjs";
  import { onMount, onDestroy } from "svelte";
  import { useNavigate } from "svelte-navigator";

  import RouteWrapper from "./RouteWrapper.svelte";

  const navigate = useNavigate();
  let userData: UserData | null;
  let userData$: Subscription;

  function cancelSubscriptions() {
    if(userData$ !== undefined)
      userData$.unsubscribe();
  }
  
  onMount(() => {
    console.log("Dashboard onMount");
    userData$ = retrieveUserData()
      .subscribe(v => {
        console.log("Dashboard - user data subscription");
        userData = v;

        if(v === null) {
          console.log("Dashboard - redirecting to login page...");
          cancelSubscriptions();
          navigate("/auth/login", {
            state: {
              redirect: "/",
              showToast: true
            }
          });
        }
      });
  });
  onDestroy(() => {
    console.log("Dashboard onDestroy");
    cancelSubscriptions();
  });
</script>

<RouteWrapper>
  <section class="dashboard-route w-full h-full">
    <header class="dashboard-route__header">
      <h1 class="w-[80%] text-5xl text-center m-2 mx-auto bg-saffron rounded-md p-4">
        {#if userData}
          Witaj, {userData.username}!
        {:else}
          Witaj!
        {/if}
      </h1>
    </header>
  </section>
</RouteWrapper>
