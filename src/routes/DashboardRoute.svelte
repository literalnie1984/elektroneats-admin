<script lang="ts">
  import type { UserData } from "../utils/user";
  import type { JWT } from "../utils/jwt";
  import { retrieveUserData } from "../utils/user";
  import { retrieveJwtToken } from "../utils/jwt";
  import type { Subscription } from "rxjs";
  import { onMount, onDestroy } from "svelte";

  let jwt: JWT | null;
  let userData: UserData | null;
  let jwt$: Subscription;
  let userData$: Subscription;

  onMount(() => {
    jwt$ = retrieveJwtToken()
      .subscribe(v => { jwt = v; });
    userData$ = retrieveUserData()
      .subscribe(v => { userData = v; });
  });
  onDestroy(() => {
    jwt$.unsubscribe();
    userData$.unsubscribe();
  })
</script>

<section class="dashboard-route">
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
