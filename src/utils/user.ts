import type { ParsedJWT } from "./jwt";
import { BehaviorSubject, tap } from "rxjs";
import * as API from "@/utils/api";

type UserData = {
  username: string;
  admin: boolean;
};

const userData$ = new BehaviorSubject<UserData | null>(null);

/** Retrieve behavior subject with user data
 *
 * @returns BehaviorSubject with user data of User type.
 */
const retrieveUserData = () => userData$;

/** Update user data stored in subject
 *
 * @param userData User data to store
 */
const updateUserData = (userData: UserData | null) => {
  userData$.next(userData);
  localStorage.setItem("userData", JSON.stringify(userData));
}

/** Load user data from local storage
 */
const loadUserData = () => {
  const data: UserData | null = JSON.parse(localStorage.getItem("userData") ?? "null");
  userData$.next(data);
}

/** Updates UserData object based on API response
 *
 * @param token JWT used to authenticate user
 *
 * @returns Observable with value of UserData
 */
const updateUserDataFromApi$ = (token: string) => {
  return API.getUserData(token)
    .pipe(
      tap(v => {
        updateUserData(v);
      })
    );
}

export type {
  UserData
};
export {
  retrieveUserData,
  updateUserData,
  loadUserData,
  updateUserDataFromApi$
};
