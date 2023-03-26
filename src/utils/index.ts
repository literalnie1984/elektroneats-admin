import { Observable, defer, from } from "rxjs";
import type { Writable, Readable } from "svelte/store";

function promiseToObservable$<T>(promise: Promise<T>): Observable<T> {
  return defer(() => from(promise));
}

function storeToObservable$<T>(store: Writable<T> | Readable<T>): Observable<T> {
  return new Observable(obs => {
    return store.subscribe((v: T) => obs.next(v));
  });
}

export {
  storeToObservable$,
  promiseToObservable$
};
