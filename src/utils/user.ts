import type { ParsedJWT } from "./jwt";
import { BehaviorSubject } from "rxjs";

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

export type {
  UserData
};
export {
  retrieveUserData,
  updateUserData,
  loadUserData
};
