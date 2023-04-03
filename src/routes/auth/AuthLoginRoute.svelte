<script lang="ts">
  import { onMount, onDestroy, getContext } from "svelte";
  import { useNavigate, useLocation } from "svelte-navigator";
  import type { JWT } from "@/utils/jwt";
  import type { UserData } from "@/utils/user";
  import * as userUtils from "@/utils/user";
  import * as jwtUtils from "@/utils/jwt";
  import { storeToObservable$ } from "@/utils";
  import { take, type Subscription, BehaviorSubject, Subject, catchError, tap, switchMap, map, iif, EMPTY, of, mergeMap } from "rxjs";
  import type ToastContext from "@/components/toast/ToastContext.svelte";
  import { ToastType } from "@/components/toast/ToastContext.svelte";
  import { faKey } from "@fortawesome/free-solid-svg-icons";
  import { EMAIL_REGEX } from "@/utils";
  import * as API from "@/utils/api";

  import RouteWrapper from "../RouteWrapper.svelte";

  const navigate = useNavigate();
  const location = useLocation();
  const toastContext = getContext<ToastContext>("toastContext");

  let sub$: Subscription;
  const jwt = new BehaviorSubject<JWT | null>(null);
  const userData = new BehaviorSubject<UserData | null>(null);

  let firstInput = false;
  let isEmailNotEmpty = false;
  let isEmailValid = false;
  let isPasswordNotEmpty = false;
  let isValidated = false;
  
  const email = new Subject<string>();
  const password = new Subject<string>();

  let emailValue: string = "";
  let passwordValue: string = "";
  
  function getRedirectToPath(): string | null {
    return $location.state["redirect"] ?? null;
  }

  function checkValidation() {
    if(isEmailValid && isEmailNotEmpty && isPasswordNotEmpty)
      isValidated = true;
    else
      isValidated = false;
  }
  
  function submitForm(e: Event) {
    e.preventDefault();

    toastContext.addToast({
      message: "Logowanie...",
      type: ToastType.Info
    });
    API.login(emailValue, passwordValue)
       .pipe(
         tap(null, err => {
           console.error(`Login error! ${err}`);
           toastContext.addToast({
             message: "Wystąpił błąd podczas logowania!",
             type: ToastType.Error
           });
         }),
         map(v => {
           const parsedToken = JSON.parse(v) as JWT;
           jwtUtils.storeJwtToken(parsedToken);
           return parsedToken;
         }),
         switchMap(v => {
           const decodedJwt = jwtUtils.decodeJwt(v);
           if(decodedJwt.is_admin === true) {
             return userUtils.updateUserDataFromApi$(v.accessToken);
           } else {
             throw new Error("Unauthorized");
           }
         })
       )
       .subscribe({
         next: v => {
           toastContext.addToast({
             message: "Pomyślnie zalogowano!",
             type: ToastType.Success
           });
           const redirectTo = getRedirectToPath() ?? "/";

           navigate(redirectTo);
         },
         error: (err: Error) => {
           if(err.message !== "Unauthorized") {
             toastContext.addToast({
               message: "Wystąpił błąd podczas logowania! Spróbuj ponownie później!",
               type: ToastType.Error
             });
           } else {
             toastContext.addToast({
               message: "Nie jesteś uprawniony do korzystania z panelu administratorskiego!",
               type: ToastType.Error
             });
           }
         }
       });
  }

  function cancelSubscriptions() {
    if(sub$ !== undefined)
      sub$.unsubscribe();

    email.complete();
    password.complete();
  }
  
  onMount(() => {
    console.log("Login - on mount.");
    sub$ = jwtUtils.retrieveJwtToken()
                   .pipe(
                     tap(v => {
                       console.log("Login - JWT subscription.");
                       jwt.next(v);
                     }),
                     switchMap(_jwt => {
                       console.log(`JWT - ${_jwt}`);
                       if(_jwt !== null) {
                         return userUtils.retrieveUserData()
                                         .pipe(
                                           tap(v => {
                                             userData.next(v);
                                           }),
                                           switchMap(_userData => {
                                             if(_userData === null) {
                                               console.log(`JWT inside of retrieveUserData: ${_jwt}`);
                                               console.log(typeof _jwt);
                                               return userUtils.updateUserDataFromApi$(_jwt.accessToken)
                                                               .pipe(
                                                                 tap(v => {
                                                                   userData.next(v);
                                                                 }),
                                                                 catchError(err => {
                                                                   console.error(`Could not update user data from API - ${err.toString()}`);
                                                                   throw err;
                                                                 }),
                                                                 mergeMap(v => of(EMPTY))
                                                               );
                                             } else {
                                               return of(EMPTY);
                                             }
                                           })
                                         );
                       } else {
                         return of(EMPTY);
                       }
                     }),
                   )
                   .subscribe(() => {
                     if(userData.getValue() !== null) {
                       console.log(`User data not null - redirecting to dashboard...`);
                       cancelSubscriptions();
                       navigate("/");
                     }
                   });

    if($location.state["showToast"] === true) {
      toastContext.addToast({
        message: "Musisz się zalogować, aby uzyskać dostęp do tej strony.",
        type: ToastType.Warning,
        icon: faKey
      });
    }

    email.subscribe(v => {
      emailValue = v;
      firstInput = true;
      isEmailNotEmpty = v.length > 0;
      isEmailValid = v.match(EMAIL_REGEX) !== null;
      checkValidation();
    });
    password.subscribe(v => {
      passwordValue = v;
      firstInput = true;
      isPasswordNotEmpty = v.length > 0;
      checkValidation();
    });
  });
  onDestroy(() => {
    console.log("Login - on destroy.");
    cancelSubscriptions();
  });
</script>

<RouteWrapper>
  <section class="auth-login-route w-full h-full flex flex-col items-center">
    <h1
      class="text-center text-6xl w-[90%] m-8 p-4 bg-saffron rounded-xl"
    >
      Logowanie
    </h1>
    <form
      class="login__form w-[90%] p-4 my-auto border-chestnut border-4 rounded-xl"
      on:submit={submitForm}
    >
      {#if isValidated === false && firstInput}
        <section
          class="login__form__validators w-full flex flex-col items-center"
        >
          {#if !isEmailNotEmpty}
            <article
              class="login__form__validator login__form__validator--email-empty"
            >
              Adres e-mail nie może być pusty!
            </article>
          {/if}
          {#if !isEmailValid}
            <article
              class="login__form__validator login__form__validator--email-invalid"
            >
              Adres e-mail jest niepoprawny!
            </article>
          {/if}
          {#if !isPasswordNotEmpty}
            <article
              class="login__form__validator login__form__validator--password-empty"
            >
              Hasło nie może być puste!
            </article>
          {/if}
        </section>
      {/if}
      <section
        class="login__form__group login__form__group--email"
      >
        <label for="login__form__email">Adres e-mail</label>
        <input
          type="email"
          id="login__form__email"
          on:input={e => { email.next(e.currentTarget.value) }}
        value={ emailValue }
        />
      </section>
      <section
        class="login__form__group login__form__group--password"
      >
        <label for="login__form__password">Hasło</label>
        <input
          type="password"
          id="login__form__password"
          on:input={e => { password.next(e.currentTarget.value) }}
        value={ passwordValue }
        />
      </section>
      <button
        type="submit"
        class="login__form__submit w-full mx-8 hover:bg-coral-light2 bg-coral text-2xl p-2 rounded-md mt-4 transition-[background-color] disabled:bg-chestnut disabled:text-white"
        disabled={!isValidated}
      >
        Zaloguj
      </button>
    </form>
  </section>
</RouteWrapper>

<style lang="scss">
  .login__form {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    
    &__validator {
      width: 100%;
      margin-top: 6px;
      margin-bottom: 6px;
      padding: 4px;
      text-align: center;
      background-color: #ff1f00;
      border-radius: 8px;
      color: white;
      @apply text-lg;
    }
    &__group {
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      justify-content: center;
      align-items: center;
      margin-top: 20px;
      margin-bottom: 20px;
      
      & > input {
        display: block;
        width: 100%;
        margin-right: 20px;
        outline: none;
        text-align: center;
        padding: 2px;
        @apply border-chestnut border-b-2 text-xl;
      }
      & > label {
        @apply text-2xl text-center;
        min-width: 180px;
      }
    }
  }
</style>
