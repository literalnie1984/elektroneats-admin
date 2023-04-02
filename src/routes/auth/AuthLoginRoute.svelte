<script lang="ts">
  import { onMount, onDestroy, getContext } from "svelte";
  import { useNavigate, useLocation } from "svelte-navigator";
  import type { JWT } from "@/utils/jwt";
  import type { UserData } from "@/utils/user";
  import * as userUtils from "@/utils/user";
  import * as jwtUtils from "@/utils/jwt";
  import { storeToObservable$ } from "@/utils";
  import { take, type Subscription, BehaviorSubject } from "rxjs";
  import type ToastContext from "@/components/toast/ToastContext.svelte";
    import { ToastType } from "@/components/toast/ToastContext.svelte";
    import { faKey } from "@fortawesome/free-solid-svg-icons";

  const navigate = useNavigate();
  const location = useLocation();
  const toastContext = getContext<ToastContext>("toastContext");

  let jwt$: Subscription;
  const jwt = new BehaviorSubject<string | null>(null);
  let userData$: Subscription;
  const userData = new BehaviorSubject<UserData | null>(null);

  function getRedirectToPath(): string | null {
    return $location.state["redirect"] ?? null;
  }

  onMount(() => {
    jwt$ = jwtUtils.retrieveJwtToken()
                   .subscribe(v => {
                     jwt.next(v);

                     if(jwt.getValue() !== null) {
                       navigate("/");
                     }
                   });

    userData$ = userUtils.retrieveUserData()
                         .subscribe(v => {
                           userData.next(v);

                           if(userData.getValue() === null && jwt.getValue() !== null) {
                             userUtils.updateUserDataFromApi$(jwt)
                                      .pipe(
                                        take(1)
                                      )
                                      .subscribe(v => {
                                        userData.next(v);

                                        if(userData.getValue() !== null)
                                          navigate("/");
                                      });
                           }
                         });

    if(getRedirectToPath() !== null) {
      toastContext.addToast({
        message: "Musisz się zalogować, aby uzyskać dostęp do tej strony.",
        type: ToastType.Warning,
        icon: faKey
      });
    }
  });
  onDestroy(() => {
    jwt$.unsubscribe();
    userData$.unsubscribe();
  });
</script>

<section class="auth-login-route">

</section>
