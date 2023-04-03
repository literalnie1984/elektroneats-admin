// TODO: Implement api handling
import { catchError, defer, forkJoin, from, map, mergeMap, Observable, of, switchMap, tap, throwError } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { promiseToObservable$ } from ".";
import { clearJwtToken, type JWT } from "./jwt";
import { parseFetchedWeeklyMenu, type FetchedLastUpdate, type FetchedWeeklyMenu, type WeeklyMenu } from "./menu";
import type { UserData } from "./user";

/** Login (create JWT for) user with provided credentials.
 *
 * @param email E-mail address bound to account.
 * @param password Password bound to account.
 *
 * @returns An observable with value of JWT on success.
 */
const login = (email: string, password: string) => fromFetch(`${import.meta.env.VITE_API_URL}/user/login`, {
  method: "POST",
  credentials: "include",
  body: JSON.stringify({
    email,
    password
  }),
  headers: {
    "Content-Type": "application/json"
  }
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
const register = (email: string, password: string, username: string) => fromFetch(`${import.meta.env.VITE_API_URL}/user/register`, {
  method: "POST",
  credentials: "include",
  body: JSON.stringify({
    email,
    password,
    username
  }),
  headers: {
    "Content-Type": "application/json"
  }
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
const changePassword = (token: string, newPassword: string, oldPassword: string) => fromFetch(`${import.meta.env.VITE_API_URL}/user/change-password`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
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

/** Get data of logged in user.
 *
 * @param token JWT
 *
 * @returns An Observable with value of UserData
 */
const getUserData = (token: string) => fromFetch(`${import.meta.env.VITE_API_URL}/user/data`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  credentials: "include"
})
      .pipe(
        catchError((err) => {
          console.error(`API/GetUserData: Error! ${err}`);
          throw new Error(err);
        }),
        mergeMap(res => {
          if(res.status === 200) {
            return promiseToObservable$(res.json());
          } else {
            console.error(`API/ChangePassword: Negative response! ${res.status}`);
            throw new Error(res.status.toString());
          }
        }),
        catchError((err) => {
          console.error(`API/GetUserData: Error! ${err}`);
          throw new Error(err);
        }),
        map(v => {
          return v as UserData;
        })
      );

/** Deletes JWT from local storage, basically resulting in deauthentication.
 */
const logout = () => clearJwtToken();

/** Fetches weekly menu from API
 *
 * @param token JWT used for authentication
 *
 * @returns Observable with value of WeeklyMenu (or null if absent).
 */
const getWeeklyMenu = (token: JWT): Observable<WeeklyMenu | null> => fromFetch(
  `${import.meta.env.VITE_API_URL}/menu/`,
  {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token.accessToken}`,
      "Accept": "application/json"
    },
    credentials: "include"
  }
)
      .pipe(
        switchMap(v => promiseToObservable$(v.json())),
        tap({
          next: (v: any) => {
            if(import.meta.env.DEV)
              console.log(`API/GetWeeklyMenu: Response - ${JSON.stringify(v)}`);
          },
          error: (err: unknown) => {
            console.error(`API/GetWeeklyMenu: Error! ${err}`);
          }
        }),
        map((v: FetchedWeeklyMenu) => parseFetchedWeeklyMenu(v)),
        tap({
          next: (v: WeeklyMenu | null) => {
            console.log(`API/GetWeeklyMenu: Parsed weekly menu - ${JSON.stringify(v)}`);
          }
        })
      );

/** Fetch latest menu update
 * @param token JWT used for user authentication.
 * @returns Observable with value of FetchedLastUpdate (or null if absent).
 */
const getLastMenuUpdate = (token: JWT): Observable<FetchedLastUpdate | null> => fromFetch(
  `${import.meta.env.VITE_API_URL}/menu/last-update/`,
  {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token.accessToken}`,
      "Accept": "application/json"
    },
    credentials: "include"
  }
)
      .pipe(
        tap({
          next: (v: any) => {
            if(import.meta.env.DEV)
              console.log(`API/GetLastMenuUpdate: Response - ${v}`);
          },
          error: (err: unknown) => {
            console.error(`API/GetLastMenuUpdate: Error! ${err}`);
          }
        })
      );

export {
  login,
  register,
  changePassword,
  getUserData,
  logout,
  getWeeklyMenu,
  getLastMenuUpdate
};
