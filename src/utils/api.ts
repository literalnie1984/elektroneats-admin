// TODO: Implement api handling
import { catchError, defer, forkJoin, from, map, mergeMap, of, throwError } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { promiseToObservable$ } from ".";

/** Login (create JWT for) user with provided credentials.
 *
 * @param email E-mail address bound to account.
 * @param password Password bound to account.
 *
 * @returns An observable with value of JWT on success.
 */
const login$ = (email: string, password: string) => fromFetch(`${import.meta.env.VITE_API_URL}/user/login/`, {
  method: "POST",
  credentials: "include",
  body: JSON.stringify({
    email,
    password
  })
})
      .pipe(
        catchError((err) => {
          console.error(`API/Login: Error! ${err}`);
          throw new Error(err);
        }),
        mergeMap(v => {
          if(v.status === 200) {
            return promiseToObservable$(v.text())
              .pipe(
                catchError((err) => {
                  console.error(`API/Login: Error! ${err}`);
                  throw new Error(err);
                })
              );
          } else {
            console.error(`API/Login: Negative response! ${v.status}`);
            throw new Error(v.status.toString());
          }
        })
      );

/** Registers new account with provided data.
 *
 * @param email E-mail address to be bound to new account.
 * @param password Password used to authenticate new account.
 * @param username Username to be bound to new account.
 * @returns An Observable with value of null on success.
 */
const register$ = (email: string, password: string, username: string) => fromFetch(`${import.meta.env.VITE_API_URL}/user/register/`, {
  method: "POST",
  credentials: "include",
  body: JSON.stringify({
    email,
    password,
    username
  })
})
      .pipe(
        catchError((err) => {
          console.error(`API/Register: Error! ${err}`);
          throw new Error(err);
        }),
        map(res => {
          if(res.status !== 200) {
            console.error(`API/Register: Negative response: ${res.status}`);
            throw new Error(res.status.toString());
          } else {
            return null;
          }
        })
      );

/** Request a password change for the user
 *
 * @param token JWT representing user
 * @param newPassword New password
 * @param oldPassword Old password
 *
 * @returns An Observable with value of null on success.
 */
const changePassword$ = (token: string, newPassword: string, oldPassword: string) => fromFetch(`${import.meta.env.VITE_API_URL}/user/change-password/`, {
  headers: {
    Authorization: `Bearer ${token}`
  },
  method: "POST",
  credentials: "include",
  body: JSON.stringify({
    oldPassword,
    newPassword
  })
})
      .pipe(
        catchError((err) => {
          console.error(`API/Register: Error! ${err}`);
          throw new Error(err);
        }),
        map(res => {
          if(res.status === 200) {
            return null;
          } else {
            console.error(`API/ChangePassword: Negative response! ${res.status}`);
            throw new Error(res.status.toString());
          }
        })
      );

export {
  login$,
  register$,
  changePassword$
};
