<script lang="ts">
  import { onMount, onDestroy, getContext } from "svelte";
  import { useNavigate, useLocation } from "svelte-navigator";
  import type { JWT } from "@/utils/jwt";
  import type { UserData } from "@/utils/user";
  import * as userUtils from "@/utils/user";
  import * as jwtUtils from "@/utils/jwt";
  import { storeToObservable$ } from "@/utils";
  import { take, type Subscription, BehaviorSubject, Subject, catchError, tap, switchMap } from "rxjs";
  import type ToastContext from "@/components/toast/ToastContext.svelte";
  import { ToastType } from "@/components/toast/ToastContext.svelte";
  import { faKey } from "@fortawesome/free-solid-svg-icons";
  import { EMAIL_REGEX } from "@/utils";
  import * as API from "@/utils/api";

  const navigate = useNavigate();
  const location = useLocation();
  const toastContext = getContext<ToastContext>("toastContext");

  let jwt$: Subscription;
  const jwt = new BehaviorSubject<string | null>(null);
  let userData$: Subscription;
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
         switchMap(v => userUtils.updateUserDataFromApi$(v))
       )
       .subscribe(v => {
         toastContext.addToast({
           message: "Pomyślnie zalogowano!",
           type: ToastType.Success
         });
         const redirectTo = getRedirectToPath() ?? "/";

         navigate(redirectTo);
       });
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
                             userUtils.updateUserDataFromApi$(jwt.getValue() as string)
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
    jwt$.unsubscribe();
    userData$.unsubscribe();

    email.complete();
    password.complete();
  });
</script>

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
