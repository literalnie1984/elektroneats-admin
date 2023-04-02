<script lang="ts">
  import type { UserData } from "../utils/user";
  import { retrieveUserData } from "../utils/user";
  import type { Subscription } from "rxjs";
  import { onMount, onDestroy } from "svelte";
  import { useNavigate } from "svelte-navigator";

  const navigate = useNavigate();
  let userData: UserData | null;
  let userData$: Subscription;

  onMount(() => {
    userData$ = retrieveUserData()
      .subscribe(v => {
        userData = v;

        if(userData === null) {
          navigate("/auth/login", {
            state: {
              redirect: "/"
            }
          });
        }
      });
  });
  onDestroy(() => {
    if(userData$ !== undefined)
      userData$.unsubscribe();
  });
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
