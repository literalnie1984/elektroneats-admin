<script lang="ts" context="module">
  enum ToastType {
    Info,
    Error,
    Warning,
    Success
  }

  interface AddToast {
    message: string;
    icon?: IconDefinition;
    type: ToastType;
  }
  interface Toast extends AddToast {
    id: string;
  }

  interface ToastContext {
    addToast: (data: AddToast) => void;
  }

  export type {
    Toast,
    AddToast,
    ToastContext
  }
  export {
    ToastType
  }
</script>
<script lang="ts">
  import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
  import { setContext, onMount, onDestroy } from "svelte";
  import { BehaviorSubject, Subscription, timer } from "rxjs";
  import { nanoid } from "nanoid";
    import Toast from "./Toast.svelte";

  const toasts$ = new BehaviorSubject<Toast[]>([]);
  let toastsToDisplay$: Subscription;
  let toastsToDisplay: Toast[] = [];

  function addToast(data: AddToast) {
    const toastId = nanoid(5);

    toasts$.next([
      ...toasts$.getValue(),
      {
        id: toastId,
        message: data.message,
        icon: data.icon,
        type: data.type
      }
    ]);

    timer(3000)
      .subscribe(() => {
        toasts$.next(
          toasts$.getValue().filter(v => v.id !== toastId)
        );
      });
  }

  onMount(() => {
    toastsToDisplay$ = toasts$.subscribe(v => {
      toastsToDisplay = v;
    });
  });
  onDestroy(() => {
    toastsToDisplay$.unsubscribe();
  });

  const toastContext = setContext<ToastContext>("toastContext", {
    addToast
  });
</script>

<div class="toast-wrapper">
  {#each toastsToDisplay as t}
  <Toast
    message={t.message}
    icon={t.icon}
    type={t.type}
  />
  {/each}
</div>
<slot></slot>

<style lang="scss">
  .toast-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    pointer-events: none;
  }
</style>
