import { Observable } from "rxjs";
import type { Writable, Readable } from "svelte/store";

function storeToObservable$<T>(store: Writable<T> | Readable<T>): Observable<T> {
  return new Observable(obs => {
    return store.subscribe((v: T) => obs.next(v));
  });
}

export {
  storeToObservable$
};
