// TODO: Implement api handling
import { catchError, defer, forkJoin, from, map, mergeMap, Observable, of, switchMap, tap, throwError } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { promiseToObservable$ } from ".";
import { clearJwtToken, storeJwtToken, type JWT } from "./jwt";
import { parseFetchedWeeklyMenu, type FetchedLastUpdate, type FetchedWeeklyMenu, type WeeklyMenu } from "./menu";
import type { OrderResponse } from "./orders";
import type { UserData } from "./user";

const refreshToken = (token: JWT) => fromFetch(
  `${import.meta.env.VITE_API_URL}/user/refresh-token`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      refreshToken: token.refreshToken
    })
  }
)
      .pipe(
        mergeMap(v => {
          if(v.status < 400) {
            return promiseToObservable$(v.json())
          } else {
            throw new Error("API error");
          }
        }),
        tap({
          next: (v: JWT) => {
            storeJwtToken(v);
          }
        })
      )

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
const changePassword = (token: JWT, newPassword: string, oldPassword: string): Observable<null> => fromFetch(`${import.meta.env.VITE_API_URL}/user/password`, {
  headers: {
    Authorization: `Bearer ${token.accessToken}`,
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
        mergeMap(res => {
          if(res.status === 200) {
            return of(null);
          } else {
            if(res.status === 401) {
              return refreshToken(token)
                .pipe(
                  switchMap(v => {
                    return changePassword(v, oldPassword, newPassword);
                  })
                );
            } else {
              console.error(`API/ChangePassword: Negative response! ${res.status}`);
              throw new Error(res.status.toString());
            }
          }
        })
      );

/** Get data of logged in user.
 *
 * @param token JWT
 *
 * @returns An Observable with value of UserData
 */
const getUserData = (token: JWT): Observable<UserData | null> => fromFetch(`${import.meta.env.VITE_API_URL}/user/data`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token.accessToken}`,
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
            if(res.status === 401) {
              return refreshToken(token)
                .pipe(
                  switchMap(v => getUserData(v))
                );
            } else {
              console.error(`API/ChangePassword: Negative response! ${res.status}`);
              throw new Error(res.status.toString());
            }
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

const getWeeklyMenuRaw = (token: JWT): Observable<FetchedWeeklyMenu | null> => fromFetch(
  `${import.meta.env.VITE_API_URL}/menu/`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      Accept: "application/json"
    },
    credentials: "include"
  }
)
      .pipe(
        switchMap(v => {
          if(v.status < 400) {
            return promiseToObservable$(v.json())
          } else {
            if(v.status === 401) {
              return refreshToken(token)
                .pipe(
                  switchMap(v => getWeeklyMenuRaw(v))
                );
            } else {
              throw new Error("API error");
            }
          }
        }),
        tap({
          next: (v: any) => {
            if(import.meta.env.DEV)
              console.log(`API/GetWeeklyMenu: Response - ${JSON.stringify(v)}`);
          },
          error: (err: unknown) => {
            console.error(`API/GetWeeklyMenu: Error! ${err}`);
          }
        }),
      );


/** Fetches weekly menu from API
 *
 * @param token JWT used for authentication
 *
 * @returns Observable with value of WeeklyMenu (or null if absent).
 */
const getWeeklyMenu = (token: JWT): Observable<WeeklyMenu | null> => getWeeklyMenuRaw(token)
      .pipe(
        map((v: FetchedWeeklyMenu | null) => {
          if(v !== null) {
            return parseFetchedWeeklyMenu(v);
          }
          else {
            return null;
          }
        }),
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
        switchMap(v => {
          if(v.status < 400) {
            return promiseToObservable$(v.json());
          } else {
            if(v.status === 401) {
              return refreshToken(token)
                .pipe(
                  switchMap(v => getLastMenuUpdate(v))
                );
            } else {
              throw new Error("API error");
            }
          }
        }),
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

const updateDish = (token: JWT, id: number, name: string | null, price: number | null, image: string | null, maxSupply: number | null, weekDay: string | null): Observable<null> => fromFetch(
  `${import.meta.env.VITE_API_URL}/admin/dish`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      id,
      name,
      price,
      image,
      maxSupply,
      weekDay
    })
  }
)
      .pipe(
        tap({
          error: err => {
            console.error(`API/UpdateDish: Error! ${err}`);
          }
        }),
        switchMap(v => {
          if(v.status < 400) {
            return promiseToObservable$(v.text())
              .pipe(
                switchMap(v => of(null))
              );
          } else {
            if(v.status === 401) {
              return refreshToken(token)
                .pipe(
                  switchMap(v => updateDish(v, id, name, price, image, maxSupply, weekDay))
                );
            } else {
              throw new Error("API error");
            }
          }
        })
      );

const getOrders = (token: JWT): Observable<OrderResponse> => fromFetch(
  `${import.meta.env.VITE_API_URL}/admin/orders`,
  {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      Accept: "application/json"
    },
    method: "GET",
    credentials: "include"
  }
)
      .pipe(
        switchMap(res => {
          if(res.status < 400) {
            return promiseToObservable$(res.json());
          } else {
            if(res.status === 401) {
              return refreshToken(token)
                .pipe(
                  switchMap(v => getOrders(v))
                );
            } else {
              throw new Error("API error");
            }
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
  getWeeklyMenuRaw,
  getLastMenuUpdate,
  updateDish,
  getOrders
};
