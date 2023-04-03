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
        } else {
          navigate("/orders");
        }
      });
  });
  onDestroy(() => {
    console.log("Dashboard onDestroy");
    cancelSubscriptions();
  });
</script>

<div></div>
